/**
 * 主线剧情选择步骤组件
 */

import React, { useEffect } from 'react';
import { presetMainStoryApi } from '../../services/api';
import { Button } from '../Button';
import { CharacterAvatarImage } from './CharacterAvatarImage';
import { useAINameGeneration } from './hooks/useAINameGeneration';
import type { PresetMainStory, SelectedItem } from './types';

interface MainStorySelectionStepProps {
  selectedEras: Map<number, SelectedItem>;
  presetMainStories: Map<number, PresetMainStory>;
  selectedMainStories: Map<number, SelectedItem>;
  onMainStoriesChange: (mainStories: Map<number, PresetMainStory>) => void;
  onSelectedMainStoriesChange: (mainStories: Map<number, SelectedItem>) => void;
  onBack: () => void;
  onNext: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const MainStorySelectionStep: React.FC<MainStorySelectionStepProps> = ({
  selectedEras,
  presetMainStories,
  selectedMainStories,
  onMainStoriesChange,
  onSelectedMainStoriesChange,
  onBack,
  onNext,
  loading,
  setLoading,
}) => {
  const { generateName, generating } = useAINameGeneration();

  // 当选择场景后，加载所有选中场景的主线剧情
  useEffect(() => {
    if (selectedEras.size > 0) {
      const loadMainStories = async () => {
        try {
          setLoading(true);
          const mainStoriesMap = new Map<number, PresetMainStory>();
          
          for (const [eraId] of selectedEras) {
            try {
              const mainStory = await presetMainStoryApi.getByEraId(eraId);
              if (mainStory && mainStory.id) {
                if (mainStory.systemEraId === eraId) {
                  mainStoriesMap.set(eraId, mainStory);
                }
              }
            } catch (error: any) {
              // 某些场景可能没有主线剧情，静默失败
              const status = error?.response?.status || error?.status;
              const message = error?.message || '';
              if (status !== 404 && !message.includes('404') && !message.includes('not found') && !message.includes('Not Found')) {
                console.error(`加载场景 ${eraId} 的主线剧情失败:`, error);
              }
            }
          }
          
          onMainStoriesChange(mainStoriesMap);
        } catch (error) {
          console.error('加载预置主线剧情失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadMainStories();
    } else {
      onMainStoriesChange(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEras]);

  // 处理主线剧情选择/取消
  const handleMainStoryToggle = (eraId: number, mainStory: PresetMainStory) => {
    const newSelected = new Map(selectedMainStories);
    if (newSelected.has(eraId)) {
      newSelected.delete(eraId);
    } else {
      newSelected.set(eraId, {
        id: mainStory.id,
        originalName: mainStory.name,
        customName: mainStory.name,
        data: mainStory
      });
    }
    onSelectedMainStoriesChange(newSelected);
  };

  // 处理主线剧情重命名
  const handleMainStoryRename = async (eraId: number, type: 'manual' | 'ai') => {
    const mainStoryItem = selectedMainStories.get(eraId);
    if (!mainStoryItem) return;

    if (type === 'ai') {
      const mainStory = mainStoryItem.data as PresetMainStory;
      const aiName = await generateName('mainStory', mainStory.name, mainStory.description || mainStory.bio);
      if (aiName) {
        const newSelected = new Map(selectedMainStories);
        const item = newSelected.get(eraId);
        if (item) {
          newSelected.set(eraId, { ...item, customName: aiName });
          onSelectedMainStoriesChange(newSelected);
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <h3 
        className="text-xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        选择主线剧情（可选）
      </h3>
      <p 
        className="text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        每个场景可以选择一个主线剧情，并为它自定义名称
      </p>
      
      {/* 按场景分组显示主线剧情 */}
      {Array.from(presetMainStories.entries()).map(([eraId, mainStory]) => {
        const eraItem = selectedEras.get(eraId);
        if (!eraItem) return null;
        
        const isSelected = selectedMainStories.has(eraId);
        const selectedItem = selectedMainStories.get(eraId);
        
        return (
          <div key={eraId} className="space-y-3">
            <h4 
              className="text-lg font-semibold border-b pb-2"
              style={{
                color: 'var(--color-primary, #f472b6)',
                borderColor: 'var(--bg-overlay, #374151)',
              }}
            >
              {eraItem.customName || eraItem.originalName}
            </h4>
            <div
              className="p-4 rounded-lg border-2 cursor-pointer transition-all"
              style={{
                borderColor: isSelected
                  ? 'var(--color-primary, #ec4899)'
                  : 'var(--bg-overlay, #374151)',
                backgroundColor: isSelected
                  ? 'var(--color-primary, rgba(236, 72, 153, 0.1))'
                  : 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--bg-hover, #4b5563)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                }
              }}
              onClick={() => handleMainStoryToggle(eraId, mainStory)}
            >
              <div className="flex items-start gap-3 mb-2">
                {mainStory.avatarUrl && (
                  <CharacterAvatarImage
                    src={mainStory.avatarUrl}
                    alt={mainStory.name}
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h4 
                    className="font-bold"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {mainStory.name}
                  </h4>
                  {mainStory.description && (
                    <p 
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {mainStory.description}
                    </p>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleMainStoryToggle(eraId, mainStory)}
                  className="w-5 h-5"
                  style={{
                    accentColor: 'var(--color-primary, #ec4899)',
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {isSelected && (
                <div 
                  className="mt-2 pt-2 border-t"
                  style={{ borderColor: 'var(--bg-overlay, #374151)' }}
                >
                  <label 
                    className="block text-xs mb-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    自定义名称
                  </label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={selectedItem?.customName ?? mainStory.name}
                      onChange={(e) => {
                        const newSelected = new Map(selectedMainStories);
                        const item = newSelected.get(eraId);
                        if (item) {
                          newSelected.set(eraId, { ...item, customName: e.target.value });
                          onSelectedMainStoriesChange(newSelected);
                        }
                      }}
                      placeholder={mainStory.name}
                      className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                      style={{
                        backgroundColor: 'var(--bg-secondary, #1f2937)',
                        borderColor: 'var(--bg-overlay, #374151)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainStoryRename(eraId, 'ai');
                      }}
                      disabled={generating}
                      className="px-2 py-1 rounded text-xs transition-colors disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
                        color: 'var(--color-primary, #f472b6)',
                      }}
                      onMouseEnter={(e) => {
                        if (!generating) {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.3))';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!generating) {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.2))';
                        }
                      }}
                      title="AI生成名字"
                    >
                      ✨
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {presetMainStories.size === 0 && (
        <div 
          className="text-center py-12"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <p>选中的场景暂无预置主线剧情</p>
          <p 
            className="text-xs mt-2"
            style={{ color: 'var(--text-disabled)' }}
          >
            你可以稍后在场景中创建主线剧情
          </p>
        </div>
      )}

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>
          上一步
        </Button>
        <Button
          onClick={onNext}
          disabled={loading}
        >
          下一步
        </Button>
      </div>
    </div>
  );
};
