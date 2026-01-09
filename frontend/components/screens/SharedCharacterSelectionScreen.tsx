/**
 * 共享心域角色选择页面组件
 * 显示共享场景的角色列表
 * 只能访问共享的角色，不能编辑或删除
 */

import React, { useState, useEffect, useRef } from 'react';
import { WorldScene, Character } from '../../types';
import { Button } from '../Button';
import { CharacterCard } from '../CharacterCard';
import { useSharedMode } from '../../hooks/useSharedMode';
import { sharedApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { convertBackendCharacterToFrontend } from '../../utils/dataTransformers';

interface SharedCharacterSelectionScreenProps {
  currentScene: WorldScene;
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const SharedCharacterSelectionScreen: React.FC<SharedCharacterSelectionScreenProps> = ({
  currentScene,
  onBack,
  onCharacterSelect,
  scrollRef,
}) => {
  const { shareConfig, isActive } = useSharedMode();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从场景ID中提取eraId（格式：era_数字）
  const eraId = currentScene.id.startsWith('era_') 
    ? parseInt(currentScene.id.replace('era_', ''))
    : null;

  // 加载共享场景的角色列表
  useEffect(() => {
    if (!isActive || !shareConfig || !eraId) {
      setError('无法加载角色列表');
      setLoading(false);
      return;
    }

    const loadSharedCharacters = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getToken();
        if (!token) {
          setError('请先登录');
          setLoading(false);
          return;
        }

        console.log('[SharedCharacterSelectionScreen] 加载共享场景角色，eraId:', eraId);
        
        // 使用共享模式API加载角色
        const characterDTOs = await sharedApi.getSharedCharactersByEraId(eraId, token);
        
        console.log('[SharedCharacterSelectionScreen] 加载成功，角色数量:', characterDTOs.length);
        
        // 转换为前端 Character 格式（使用完整的角色数据转换函数，确保包含systemInstruction等所有字段）
        const convertedCharacters: Character[] = characterDTOs.map((dto: any) => {
          // 使用标准转换函数，确保包含所有字段（特别是systemInstruction）
          const character = convertBackendCharacterToFrontend(dto);
          // 确保eraId和worldId正确设置
          character.eraId = eraId.toString();
          character.worldId = currentScene.worldId || '';
          return character;
        });
        
        setCharacters(convertedCharacters);
      } catch (err: any) {
        console.error('[SharedCharacterSelectionScreen] 加载失败:', err);
        setError(err.message || '加载角色列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadSharedCharacters();
  }, [isActive, shareConfig, eraId, currentScene.worldId]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">加载角色列表中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={onBack}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 bg-gray-900">
      {/* 头部 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="!p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-white">{currentScene.name}</h2>
            <p className="text-gray-400 text-sm">共享场景 · {characters.length} 个角色</p>
          </div>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="mb-6 p-4 bg-blue-900/40 border border-blue-500/50 rounded-xl">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div className="flex-1">
            <p className="text-blue-200 font-bold text-sm mb-1">共享模式</p>
            <p className="text-blue-300 text-xs">
              你正在查看共享场景的角色。只能与角色对话，不能编辑或删除。
            </p>
          </div>
        </div>
      </div>

      {/* 角色列表 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pr-4 custom-scrollbar"
        style={{ scrollBehavior: 'auto', willChange: 'scroll-position' }}
      >
        {characters.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">👤</div>
              <p className="text-gray-400 text-lg mb-2">暂无共享的角色</p>
              <p className="text-gray-500 text-sm">这个场景中还没有共享的角色</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {characters.map(character => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={() => onCharacterSelect(character)}
                isUserOwned={false} // 共享模式下，角色不属于访问者
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

