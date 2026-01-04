/**
 * Mobile版本共享角色选择页面组件
 * 参照PC版本的SharedCharacterSelectionScreen，但保持Mobile UI独立
 */

import React, { useState, useEffect, memo } from 'react';
import { WorldScene, Character } from '../../types';
import { useSharedMode } from '../../hooks/useSharedMode';
import { sharedApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { MobileSharedModeBanner } from '../components/modals';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileLazyImage } from '../components/MobileLazyImage';

interface MobileSharedCharacterSelectionScreenProps {
  currentScene: WorldScene;
  onBack: () => void;
  onCharacterSelect: (character: Character) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Mobile版本共享角色选择页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileSharedCharacterSelectionScreen: React.FC<MobileSharedCharacterSelectionScreenProps> = memo(({
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

        console.log('[MobileSharedCharacterSelectionScreen] 加载共享场景角色，eraId:', eraId);
        
        // 使用共享模式API加载角色
        const characterDTOs = await sharedApi.getSharedCharactersByEraId(eraId, token);
        
        console.log('[MobileSharedCharacterSelectionScreen] 加载成功，角色数量:', characterDTOs.length);
        
        // 转换为前端 Character 格式
        const convertedCharacters: Character[] = characterDTOs.map((dto: any) => ({
          id: `character_${dto.id}`,
          name: dto.name || '未命名角色',
          description: dto.description || '',
          avatarUrl: dto.avatarUrl || '',
          personality: dto.personality || '',
          background: dto.background || '',
          eraId: eraId.toString(),
          worldId: currentScene.worldId || '',
        }));
        
        setCharacters(convertedCharacters);
      } catch (err: any) {
        console.error('[MobileSharedCharacterSelectionScreen] 加载失败:', err);
        setError(err.message || '加载角色列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    loadSharedCharacters();
  }, [isActive, shareConfig, eraId, currentScene.worldId]);

  if (loading) {
    return (
      <div className="h-full bg-black flex items-center justify-center">
        <MobileLoadingSpinner size="lg" text="加载角色列表中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-black flex flex-col items-center justify-center p-6">
        <div className="text-red-400 mb-4">{error}</div>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl active:scale-95 transition-transform touch-manipulation min-h-[44px]"
        >
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="h-full bg-black flex flex-col overflow-hidden">
      {/* 共享模式标识栏 */}
      {shareConfig && (
        <MobileSharedModeBanner
          heartSphereName={shareConfig.heartSphereName || '共享心域'}
          onLeave={onBack}
        />
      )}

      {/* 场景头部 */}
      <div className="relative h-64 shrink-0 pt-20">
        <MobileLazyImage src={currentScene.imageUrl} alt="Scene Cover" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
        
        <button 
          onClick={onBack}
          className="absolute top-24 left-4 min-w-[44px] min-h-[44px] p-2 bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 z-20 active:scale-90 transition-transform touch-manipulation flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="absolute bottom-0 left-0 w-full p-6">
          <h1 className="text-3xl font-bold text-white mb-2 shadow-black drop-shadow-md">{currentScene.name}</h1>
          <p className="text-sm text-gray-300 line-clamp-2">{currentScene.description}</p>
        </div>
      </div>

      {/* 角色列表 */}
      <div 
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-y-auto pb-24 p-4 overscroll-behavior-contain" 
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {characters.length === 0 ? (
          <MobileEmptyState
            icon="👥"
            title="暂无角色"
            description="这个场景还没有共享的角色"
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {characters.map(char => (
              <div
                key={char.id}
                onClick={() => onCharacterSelect(char)}
                className="relative rounded-xl overflow-hidden aspect-[3/4] border border-white/10 shadow-lg active:scale-[0.95] transition-transform touch-manipulation cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onCharacterSelect(char);
                  }
                }}
              >
                <MobileLazyImage src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className="text-white font-bold text-sm">{char.name}</p>
                  {char.role && (
                    <p className="text-[10px] text-gray-400">{char.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

MobileSharedCharacterSelectionScreen.displayName = 'MobileSharedCharacterSelectionScreen';
