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
import { MobileBackButton } from '../components/MobileBackButton';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileColors, MobileCardStyles } from '../components/MobileStyleGuide';
import { convertBackendCharacterToFrontend } from '../../utils/dataTransformers';

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

        
        // 使用共享模式API加载角色
        const characterDTOs = await sharedApi.getSharedCharactersByEraId(eraId, token);
        
        
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
        <div className={`${MobileColors.semantic.error.text} mb-4`} role="alert" aria-live="assertive">{error}</div>
        <MobileTouchableButton
          onClick={onBack}
          variant="primary"
          size="md"
          aria-label="返回"
        >
          返回
        </MobileTouchableButton>
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
        
        <MobileBackButton
          onClick={onBack}
          className="absolute top-24 left-4 z-20"
          aria-label="返回场景选择"
        />

        <div className="absolute bottom-0 left-0 w-full p-6">
          <h1 className={`text-3xl font-bold ${MobileColors.text.primary} mb-2 shadow-black drop-shadow-md`}>{currentScene.name}</h1>
          <p className={`text-sm ${MobileColors.text.secondary} line-clamp-2`}>{currentScene.description}</p>
        </div>
      </div>

      {/* 角色列表 */}
      <div 
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))] p-4 overscroll-behavior-contain" 
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
                className={`relative rounded-xl overflow-hidden aspect-[3/4] ${MobileColors.border.default} ${MobileCardStyles.shadow} ${MobileCardStyles.interactive}`}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCharacterSelect(char);
                  }
                }}
                aria-label={`选择角色: ${char.name}`}
              >
                <MobileLazyImage src={char.avatarUrl} alt={char.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <p className={`${MobileColors.text.primary} font-bold text-sm`}>{char.name}</p>
                  {char.role && (
                    <p className={`text-[10px] ${MobileColors.text.muted}`}>{char.role}</p>
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
