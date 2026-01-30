/**
 * 剧本选择步骤组件（包含批量创建逻辑）
 */

import React, { useEffect } from 'react';
import { presetScriptApi, eraApi, characterApi, scriptApi, userMainStoryApi } from '../../services/api';
import { Button } from '../Button';
import { showAlert } from '../../utils/dialog';
import { useAINameGeneration } from './hooks/useAINameGeneration';
import { SceneCreationSummary } from './SceneCreationSummary';
import type { PresetScript, PresetCharacter, SelectedItem } from './types';

interface ScriptSelectionStepProps {
  selectedEras: Map<number, SelectedItem>;
  presetScripts: Map<number, PresetScript[]>;
  selectedScripts: Map<number, SelectedItem>;
  onScriptsChange: (scripts: Map<number, PresetScript[]>) => void;
  onSelectedScriptsChange: (scripts: Map<number, SelectedItem>) => void;
  onBack: () => void;
  onComplete: () => void;
  token: string;
  worldId: number;
  presetCharacters: Map<number, PresetCharacter[]>;
  selectedCharacters: Map<number, SelectedItem>;
  selectedMainStories: Map<number, SelectedItem>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const ScriptSelectionStep: React.FC<ScriptSelectionStepProps> = ({
  selectedEras,
  presetScripts,
  selectedScripts,
  onScriptsChange,
  onSelectedScriptsChange,
  onBack,
  onComplete,
  token,
  worldId,
  presetCharacters,
  selectedCharacters,
  selectedMainStories,
  loading,
  setLoading,
}) => {
  const { generateName, generating } = useAINameGeneration();

  // 当选择场景后，加载所有选中场景的剧本
  useEffect(() => {
    if (selectedEras.size > 0) {
      const loadScripts = async () => {
        try {
          setLoading(true);
          const scriptsMap = new Map<number, PresetScript[]>();
          
          for (const [eraId] of selectedEras) {
            try {
              const scripts = await presetScriptApi.getByEraId(eraId);
              if (scripts && scripts.length > 0) {
                const matchingScripts = scripts.filter(script => script.systemEraId === eraId);
                if (matchingScripts.length > 0) {
                  scriptsMap.set(eraId, matchingScripts);
                } else {
                  scriptsMap.set(eraId, []);
                }
              } else {
                scriptsMap.set(eraId, []);
              }
            } catch (error) {
              console.error(`加载场景 ${eraId} 的剧本失败:`, error);
              scriptsMap.set(eraId, []);
            }
          }
          
          onScriptsChange(scriptsMap);
        } catch (error) {
          console.error('加载预置剧本失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadScripts();
    } else {
      onScriptsChange(new Map());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEras]);

  // 处理剧本选择/取消
  const handleScriptToggle = (script: PresetScript) => {
    const newSelected = new Map(selectedScripts);
    if (newSelected.has(script.id)) {
      newSelected.delete(script.id);
    } else {
      newSelected.set(script.id, {
        id: script.id,
        originalName: script.title,
        customName: script.title,
        data: script
      });
    }
    onSelectedScriptsChange(newSelected);
  };

  // 处理剧本重命名
  const handleScriptRename = async (scriptId: number, type: 'manual' | 'ai') => {
    let script: PresetScript | null = null;
    for (const scripts of presetScripts.values()) {
      const found = scripts.find(s => s.id === scriptId);
      if (found) {
        script = found;
        break;
      }
    }
    if (!script) return;

    if (type === 'ai') {
      const aiName = await generateName('script', script.title, script.description || '');
      if (aiName) {
        const newSelected = new Map(selectedScripts);
        const item = newSelected.get(scriptId);
        if (item) {
          newSelected.set(scriptId, { ...item, customName: aiName });
          onSelectedScriptsChange(newSelected);
        }
      }
    }
  };

  // 完成创建
  const handleComplete = async () => {
    if (selectedEras.size === 0) {
      showAlert('请至少选择一个场景');
      return;
    }

    try {
      setLoading(true);

      // 1. 创建所有选中的场景
      const createdEraIds = new Map<number, number>(); // 原eraId -> 新创建的eraId
      const skippedEras: string[] = []; // 跳过的场景名称
      
      // 先获取已有的场景，检查是否重复
      const existingEras = await eraApi.getErasByWorldId(worldId, token);
      const existingSystemEraIds = new Set<number>();
      existingEras.forEach(era => {
        if (era.systemEraId != null) {
          existingSystemEraIds.add(era.systemEraId);
        }
      });
      
      for (const [eraId, eraItem] of selectedEras) {
        const era = eraItem.data as any;
        
        // 检查是否已经存在相同的 systemEraId
        if (existingSystemEraIds.has(era.id)) {
          skippedEras.push(eraItem.customName || era.name);
          console.warn(`[ScriptSelectionStep] 场景已存在，跳过: ${era.name} (systemEraId: ${era.id})`);
          continue;
        }
        
        try {
          const eraResponse = await eraApi.createEra({
            name: eraItem.customName || era.name,
            description: era.description,
            imageUrl: era.imageUrl || null,
            worldId: worldId,
            systemEraId: era.id
          }, token);
          
          createdEraIds.set(eraId, eraResponse.id);
          // 添加到已存在集合，避免后续重复创建
          existingSystemEraIds.add(era.id);
        } catch (error: any) {
          // 如果后端返回重复错误，跳过该场景
          if (error.message && (error.message.includes('已存在') || error.message.includes('重复'))) {
            skippedEras.push(eraItem.customName || era.name);
            console.warn(`[ScriptSelectionStep] 场景创建失败（可能已存在）: ${era.name}`, error);
            continue;
          }
          // 其他错误继续抛出
          throw error;
        }
      }
      
      // 如果有跳过的场景，显示提示
      if (skippedEras.length > 0) {
        showAlert(`以下场景已存在，已跳过：${skippedEras.join('、')}`, '提示', 'info');
      }

      // 2. 创建选中的角色
      for (const [characterId, item] of selectedCharacters) {
        const char = item.data as PresetCharacter;
        let targetEraId: number | null = null;
        for (const [eraId, chars] of presetCharacters) {
          if (chars.some(c => c.id === characterId)) {
            targetEraId = createdEraIds.get(eraId) || null;
            break;
          }
        }
        
        if (targetEraId) {
          let tagsString: string | undefined = undefined;
          if (char.tags) {
            if (typeof char.tags === 'string') {
              tagsString = char.tags;
            } else if (Array.isArray(char.tags)) {
              tagsString = char.tags.join(', ');
            }
          }
          
          let catchphrasesString: string | undefined = undefined;
          if (char.catchphrases) {
            if (typeof char.catchphrases === 'string') {
              catchphrasesString = char.catchphrases;
            } else if (Array.isArray(char.catchphrases)) {
              catchphrasesString = char.catchphrases.join(', ');
            }
          }
          
          const characterData = {
            name: item.customName || char.name,
            description: char.bio || char.description || '',
            age: char.age || undefined,
            gender: char.gender || undefined,
            role: char.role || undefined,
            bio: char.bio || char.description || undefined,
            avatarUrl: char.avatarUrl || undefined,
            backgroundUrl: char.backgroundUrl || undefined,
            themeColor: char.themeColor || undefined,
            colorAccent: char.colorAccent || undefined,
            firstMessage: char.firstMessage || undefined,
            systemInstruction: char.systemInstruction || '',
            voiceName: char.voiceName || undefined,
            mbti: char.mbti || undefined,
            tags: tagsString,
            speechStyle: char.speechStyle || undefined,
            catchphrases: catchphrasesString,
            secrets: char.secrets || undefined,
            motivations: char.motivations || undefined,
            relationships: char.relationships || undefined,
            worldId: worldId,
            eraId: targetEraId,
          };
          
          await characterApi.createCharacter(characterData, token);
        }
      }

      // 3. 创建选中的主线剧情
      for (const [eraId, mainStoryItem] of selectedMainStories) {
        const mainStory = mainStoryItem.data as any;
        const targetEraId = createdEraIds.get(eraId);
        if (targetEraId) {
          const mainStoryData: {
            systemMainStoryId: number;
            eraId: number;
            name?: string;
          } = {
            systemMainStoryId: mainStory.id,
            eraId: targetEraId,
          };
          
          if (mainStoryItem.customName) {
            mainStoryData.name = mainStoryItem.customName;
          }
          
          await userMainStoryApi.create(mainStoryData, token);
        }
      }

      // 4. 创建选中的剧本
      for (const [scriptId, item] of selectedScripts) {
        const script = item.data as PresetScript;
        let targetEraId: number | null = null;
        for (const [eraId, scripts] of presetScripts) {
          if (scripts.some(s => s.id === scriptId)) {
            targetEraId = createdEraIds.get(eraId) || null;
            break;
          }
        }
        if (targetEraId) {
          const scriptData: {
            systemScriptId: number;
            eraId: number;
            worldId: number;
            title?: string;
          } = {
            systemScriptId: script.id,
            eraId: targetEraId,
            worldId: worldId,
          };
          
          if (item.customName) {
            scriptData.title = item.customName;
          }
          
          await scriptApi.createScript(scriptData, token);
        }
      }

      // 等待一小段时间，确保数据已保存
      await new Promise(resolve => setTimeout(resolve, 500));

      showAlert(`成功创建 ${selectedEras.size} 个场景！`, '成功', 'success');
      onComplete();
    } catch (error: any) {
      console.error('创建场景失败:', error);
      showAlert(`创建场景失败：${error.message || '未知错误'}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 
        className="text-xl font-bold"
        style={{ color: 'var(--text-primary)' }}
      >
        选择剧本（可选）
      </h3>
      <p 
        className="text-sm"
        style={{ color: 'var(--text-tertiary)' }}
      >
        你可以选择多个剧本，并为它们自定义标题
      </p>
      
      {/* 创建摘要预览 */}
      <SceneCreationSummary
        selectedEras={selectedEras}
        selectedCharacters={selectedCharacters}
        selectedMainStories={selectedMainStories}
        selectedScripts={selectedScripts}
      />
      
      {/* 按场景分组显示剧本 */}
      {Array.from(presetScripts.entries()).map(([eraId, scripts]) => {
        const eraItem = selectedEras.get(eraId);
        if (!eraItem) return null;
        
        if (!scripts || scripts.length === 0) {
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
                className="text-center py-6 text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <p>该场景暂无预置剧本</p>
              </div>
            </div>
          );
        }
        
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {scripts.map(script => {
                const isSelected = selectedScripts.has(script.id);
                const selectedItem = selectedScripts.get(script.id);
                
                return (
                  <div
                    key={script.id}
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
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div className="flex-1">
                        <h4 
                          className="font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {script.title}
                        </h4>
                        {script.description && (
                          <p 
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {script.description}
                          </p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleScriptToggle(script)}
                        className="w-5 h-5"
                        style={{
                          accentColor: 'var(--color-primary, #ec4899)',
                        }}
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
                          自定义标题
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={selectedItem?.customName ?? script.title}
                            onChange={(e) => {
                              const newSelected = new Map(selectedScripts);
                              const item = newSelected.get(script.id);
                              if (item) {
                                newSelected.set(script.id, { ...item, customName: e.target.value });
                                onSelectedScriptsChange(newSelected);
                              }
                            }}
                            placeholder={script.title}
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
                          />
                          <button
                            onClick={() => handleScriptRename(script.id, 'ai')}
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
                            title="AI生成标题"
                          >
                            ✨
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {Array.from(presetScripts.entries()).every(([_, scripts]) => !scripts || scripts.length === 0) && (
        <div 
          className="text-center py-12"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <p>选中的场景暂无预置剧本</p>
          <p 
            className="text-xs mt-2"
            style={{ color: 'var(--text-disabled)' }}
          >
            你可以稍后在场景中创建剧本
          </p>
        </div>
      )}

      <div className="flex justify-between gap-3 mt-6">
        <Button variant="secondary" onClick={onBack}>
          上一步
        </Button>
        <Button
          onClick={handleComplete}
          disabled={loading}
          style={{
            background: 'var(--gradient-button)',
            color: 'var(--text-primary)',
          }}
        >
          {loading ? '创建中...' : '完成创建'}
        </Button>
      </div>
    </div>
  );
};
