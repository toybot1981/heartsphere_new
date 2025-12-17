
import React, { useState, useEffect } from 'react';
import { eraApi, characterApi, scriptApi, worldApi, systemScriptApi } from '../services/api';
import { geminiService } from '../services/gemini';
import { Button } from './Button';
import { showAlert } from '../utils/dialog';

interface PresetEra {
  id: number;
  name: string;
  description: string;
  imageUrl: string | null;
}

interface PresetCharacter {
  id: number;
  name: string;
  description: string | null;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  age: number | null;
  gender: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  voiceName: string | null;
  mbti: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  relationships: string | null;
  systemEraId: number | null;
}

interface PresetScript {
  id: number;
  title: string;
  content: string;
  eraId: number;
}

interface SelectedItem {
  id: number;
  originalName: string;
  customName: string;
  data: any;
}

interface InitializationWizardProps {
  token: string;
  userId: number;
  worldId: number;
  onComplete: () => void;
  onCancel?: () => void;
}

export const InitializationWizard: React.FC<InitializationWizardProps> = ({
  token,
  userId,
  worldId,
  onComplete,
  onCancel
}) => {
  console.log('[InitializationWizard] 组件初始化', { token: !!token, userId, worldId });
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  
  // 步骤1：场景选择（支持多选）
  const [presetEras, setPresetEras] = useState<PresetEra[]>([]);
  const [selectedEras, setSelectedEras] = useState<Map<number, SelectedItem>>(new Map());
  
  // 步骤2：角色选择（按场景分组）
  const [presetCharacters, setPresetCharacters] = useState<Map<number, PresetCharacter[]>>(new Map()); // key: eraId
  const [selectedCharacters, setSelectedCharacters] = useState<Map<number, SelectedItem>>(new Map()); // key: characterId
  
  // 步骤3：剧本选择
  const [presetScripts, setPresetScripts] = useState<PresetScript[]>([]);
  const [selectedScripts, setSelectedScripts] = useState<Map<number, SelectedItem>>(new Map());

  // 加载预置场景（只加载系统预置，不包含游客预置）
  useEffect(() => {
    const loadPresetEras = async () => {
      console.log('[InitializationWizard] 开始加载预置场景');
      try {
        setLoading(true);
        const eras = await eraApi.getSystemEras();
        console.log('[InitializationWizard] 加载预置场景成功，数量:', eras.length);
        console.log('[InitializationWizard] 预置场景列表:', eras.map(e => ({ id: e.id, name: e.name })));
        // 确保只显示系统预置场景，不包含游客预置场景
        setPresetEras(eras);
      } catch (error) {
        console.error('[InitializationWizard] 加载预置场景失败:', error);
        showAlert('加载预置场景失败，请刷新重试');
      } finally {
        setLoading(false);
      }
    };
    loadPresetEras();
  }, []);

  // 当选择场景后，加载所有选中场景的角色
  useEffect(() => {
    if (selectedEras.size > 0) {
      const loadCharacters = async () => {
        try {
          setLoading(true);
          const charactersMap = new Map<number, PresetCharacter[]>();
          
          // 为每个选中的场景加载角色
          for (const [eraId, eraItem] of selectedEras) {
            try {
              const characters = await characterApi.getSystemCharacters(eraId);
              charactersMap.set(eraId, characters);
            } catch (error) {
              console.error(`加载场景 ${eraId} 的角色失败:`, error);
            }
          }
          
          setPresetCharacters(charactersMap);
          // 重置角色选择（只保留仍然有效的角色）
          const newSelected = new Map<number, SelectedItem>();
          for (const [charId, charItem] of selectedCharacters) {
            // 检查角色是否仍然在某个选中的场景中
            let found = false;
            for (const [eraId, chars] of charactersMap) {
              if (chars.some(c => c.id === charId)) {
                found = true;
                break;
              }
            }
            if (found) {
              newSelected.set(charId, charItem);
            }
          }
          setSelectedCharacters(newSelected);
        } catch (error) {
          console.error('加载预置角色失败:', error);
          showAlert('加载预置角色失败');
        } finally {
          setLoading(false);
        }
      };
      loadCharacters();
    } else {
      setPresetCharacters(new Map());
      setSelectedCharacters(new Map());
    }
  }, [selectedEras]);


  // AI生成名字
  const generateName = async (type: 'character' | 'script', originalName: string, context?: string): Promise<string> => {
    try {
      setLoading(true);
      const prompt = type === 'character'
        ? `请为这个角色生成一个符合其特点的中文名字。角色信息：${context || originalName}。只返回名字，不要其他内容。`
        : `请为这个剧本生成一个更有吸引力的中文标题。原标题：${originalName}。只返回标题，不要其他内容。`;
      
      const name = await geminiService.generateText(prompt, '你是一个专业的命名助手，擅长为角色和故事起名。', false);
      return name.trim().replace(/["'"]/g, '');
    } catch (error) {
      console.error('AI生成名字失败:', error);
      showAlert('AI生成名字失败，请手动输入');
      return '';
    } finally {
      setLoading(false);
    }
  };

  // 处理场景选择/取消（支持多选）
  const handleEraToggle = (era: PresetEra) => {
    const newSelected = new Map(selectedEras);
    if (newSelected.has(era.id)) {
      newSelected.delete(era.id);
    } else {
      newSelected.set(era.id, {
        id: era.id,
        originalName: era.name,
        customName: era.name,
        data: era
      });
    }
    setSelectedEras(newSelected);
  };

  // 处理场景重命名
  const handleEraRename = async (eraId: number, type: 'manual' | 'ai') => {
    const eraItem = selectedEras.get(eraId);
    if (!eraItem) return;

    if (type === 'ai') {
      const era = eraItem.data as PresetEra;
      const aiName = await generateName('script', era.name, era.description);
      if (aiName) {
        const newSelected = new Map(selectedEras);
        newSelected.set(eraId, { ...eraItem, customName: aiName });
        setSelectedEras(newSelected);
      }
    }
    // 手动输入已在UI中处理
  };

  // 处理角色选择/取消
  const handleCharacterToggle = (character: PresetCharacter) => {
    const newSelected = new Map(selectedCharacters);
    if (newSelected.has(character.id)) {
      newSelected.delete(character.id);
    } else {
      newSelected.set(character.id, {
        id: character.id,
        originalName: character.name,
        customName: character.name,
        data: character
      });
    }
    setSelectedCharacters(newSelected);
  };

  // 处理角色重命名
  const handleCharacterRename = async (characterId: number, type: 'manual' | 'ai') => {
    const character = presetCharacters.find(c => c.id === characterId);
    if (!character) return;

    if (type === 'ai') {
      const context = `${character.role || ''}，${character.bio || ''}`;
      const aiName = await generateName('character', character.name, context);
      if (aiName) {
        const newSelected = new Map(selectedCharacters);
        const item = newSelected.get(characterId);
        if (item) {
          newSelected.set(characterId, { ...item, customName: aiName });
          setSelectedCharacters(newSelected);
        }
      }
    } else {
      // 手动输入已在UI中处理
    }
  };

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
    setSelectedScripts(newSelected);
  };

  // 处理剧本重命名
  const handleScriptRename = async (scriptId: number, type: 'manual' | 'ai') => {
    const script = presetScripts.find(s => s.id === scriptId);
    if (!script) return;

    if (type === 'ai') {
      const aiName = await generateName('script', script.title);
      if (aiName) {
        const newSelected = new Map(selectedScripts);
        const item = newSelected.get(scriptId);
        if (item) {
          newSelected.set(scriptId, { ...item, customName: aiName });
          setSelectedScripts(newSelected);
        }
      }
    }
  };

  // 完成初始化
  const handleComplete = async () => {
    if (selectedEras.size === 0) {
      showAlert('请至少选择一个场景');
      return;
    }

    try {
      setLoading(true);

      // 1. 创建所有选中的场景
      const createdEraIds = new Map<number, number>(); // 原eraId -> 新创建的eraId
      
      for (const [eraId, eraItem] of selectedEras) {
        const era = eraItem.data as PresetEra;
        const eraResponse = await eraApi.createEra({
          name: eraItem.customName || era.name,
          description: era.description,
          imageUrl: era.imageUrl || null,
          worldId: worldId,
          systemEraId: era.id
        }, token);
        
        createdEraIds.set(eraId, eraResponse.id);
      }

      // 2. 创建选中的角色（需要映射到新创建的场景ID）
      for (const [characterId, item] of selectedCharacters) {
        const char = item.data as PresetCharacter;
        // 找到角色所属的场景ID
        let targetEraId: number | null = null;
        for (const [eraId, chars] of presetCharacters) {
          if (chars.some(c => c.id === characterId)) {
            targetEraId = createdEraIds.get(eraId) || null;
            break;
          }
        }
        
        if (targetEraId) {
          // 处理 tags 和 catchphrases：后端期望字符串（逗号分隔），不是数组
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
          
          await characterApi.createCharacter({
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
          }, token);
        }
      }

      // 3. 创建选中的剧本（如果有）
      for (const [scriptId, item] of selectedScripts) {
        const script = item.data as PresetScript;
        const targetEraId = createdEraIds.get(script.eraId);
        if (targetEraId) {
          await scriptApi.createScript({
            title: item.customName || script.title,
            content: script.content,
            worldId: worldId,
            eraId: targetEraId,
            sceneCount: 0
          }, token);
        }
      }

      // 直接调用 onComplete，不显示 alert（因为会刷新页面）
      onComplete();
    } catch (error: any) {
      console.error('初始化失败:', error);
      showAlert(`初始化失败：${error.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  console.log('[InitializationWizard] ========== 渲染组件 ==========');
  console.log('[InitializationWizard] step:', step);
  console.log('[InitializationWizard] loading:', loading);
  console.log('[InitializationWizard] selectedErasCount:', selectedEras.size);
  console.log('[InitializationWizard] presetErasCount:', presetEras.length);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-2">
            欢迎来到心域 🌟
          </h2>
          <p className="text-gray-400 text-sm">
            让我们为你设置第一个场景、角色和剧本，开始你的心域之旅
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-pink-500' : 'bg-gray-700'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-pink-500' : 'bg-gray-700'}`} />
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-pink-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
              3
            </div>
          </div>
        </div>

        {/* 步骤1：场景选择（支持多选） */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">选择场景（可多选）</h3>
            <p className="text-sm text-gray-400">你可以选择多个场景，并为它们自定义名称</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {presetEras.map(era => {
                const isSelected = selectedEras.has(era.id);
                const selectedItem = selectedEras.get(era.id);
                
                return (
                  <div
                    key={era.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleEraToggle(era)}
                        className="w-5 h-5 mt-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        {era.imageUrl && (
                          <img src={era.imageUrl} alt={era.name} className="w-full h-32 object-cover rounded mb-2" />
                        )}
                        <h4 className="font-bold text-white mb-1">{era.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2">{era.description}</p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        <label className="block text-xs text-gray-400 mb-1">自定义名称</label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={selectedItem?.customName || era.name}
                            onChange={(e) => {
                              const newSelected = new Map(selectedEras);
                              const item = newSelected.get(era.id);
                              if (item) {
                                newSelected.set(era.id, { ...item, customName: e.target.value });
                                setSelectedEras(newSelected);
                              }
                            }}
                            placeholder={era.name}
                            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-pink-500 outline-none"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEraRename(era.id, 'ai');
                            }}
                            className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs hover:bg-pink-500/30"
                            title="AI生成名字"
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

            <div className="flex justify-end gap-3 mt-6">
              {onCancel && (
                <Button variant="secondary" onClick={onCancel}>
                  稍后设置
                </Button>
              )}
              <Button
                onClick={() => setStep(2)}
                disabled={selectedEras.size === 0 || loading}
              >
                下一步 ({selectedEras.size} 个场景)
              </Button>
            </div>
          </div>
        )}

        {/* 步骤2：角色选择（按场景分组显示） */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">选择角色</h3>
            <p className="text-sm text-gray-400">你可以选择多个角色，并为它们自定义名称</p>
            
            {/* 按场景分组显示角色 */}
            {Array.from(presetCharacters.entries()).map(([eraId, characters]) => {
              const eraItem = selectedEras.get(eraId);
              if (!eraItem || characters.length === 0) return null;
              
              return (
                <div key={eraId} className="space-y-3">
                  <h4 className="text-lg font-semibold text-pink-400 border-b border-gray-700 pb-2">
                    {eraItem.customName || eraItem.originalName}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {characters.map(character => {
                      const isSelected = selectedCharacters.has(character.id);
                      const selectedItem = selectedCharacters.get(character.id);
                      
                      return (
                        <div
                          key={character.id}
                          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-pink-500 bg-pink-500/10'
                              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {character.avatarUrl && (
                              <img src={character.avatarUrl} alt={character.name} className="w-12 h-12 rounded-full object-cover" />
                            )}
                            <div className="flex-1">
                              <h4 className="font-bold text-white">{character.name}</h4>
                              {character.role && (
                                <p className="text-xs text-gray-400">{character.role}</p>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCharacterToggle(character)}
                              className="w-5 h-5"
                            />
                          </div>
                          
                          {character.bio && (
                            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{character.bio}</p>
                          )}

                          {isSelected && (
                            <div className="mt-2 pt-2 border-t border-gray-700">
                              <label className="block text-xs text-gray-400 mb-1">自定义名称</label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={selectedItem?.customName || character.name}
                                  onChange={(e) => {
                                    const newSelected = new Map(selectedCharacters);
                                    const item = newSelected.get(character.id);
                                    if (item) {
                                      newSelected.set(character.id, { ...item, customName: e.target.value });
                                      setSelectedCharacters(newSelected);
                                    }
                                  }}
                                  placeholder={character.name}
                                  className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-pink-500 outline-none"
                                />
                                <button
                                  onClick={() => handleCharacterRename(character.id, 'ai')}
                                  className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs hover:bg-pink-500/30"
                                  title="AI生成名字"
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

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(1)}>
                上一步
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={selectedCharacters.size === 0 || loading}
              >
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* 步骤3：剧本选择 */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white">选择剧本（可选）</h3>
            <p className="text-sm text-gray-400">你可以选择多个剧本，并为它们自定义标题</p>
            
            {presetScripts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>该场景暂无预置剧本</p>
                <p className="text-xs mt-2">你可以稍后在场景中创建剧本</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presetScripts.map(script => {
                  const isSelected = selectedScripts.has(script.id);
                  const selectedItem = selectedScripts.get(script.id);
                  
                  return (
                    <div
                      key={script.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-pink-500 bg-pink-500/10'
                          : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-white">{script.title}</h4>
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleScriptToggle(script)}
                          className="w-5 h-5"
                        />
                      </div>

                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <label className="block text-xs text-gray-400 mb-1">自定义标题</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={selectedItem?.customName || script.title}
                              onChange={(e) => {
                                const newSelected = new Map(selectedScripts);
                                const item = newSelected.get(script.id);
                                if (item) {
                                  newSelected.set(script.id, { ...item, customName: e.target.value });
                                  setSelectedScripts(newSelected);
                                }
                              }}
                              placeholder={script.title}
                              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-pink-500 outline-none"
                            />
                            <button
                              onClick={() => handleScriptRename(script.id, 'ai')}
                              className="px-2 py-1 bg-pink-500/20 text-pink-400 rounded text-xs hover:bg-pink-500/30"
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
            )}

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(2)}>
                上一步
              </Button>
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="bg-gradient-to-r from-pink-600 to-purple-600"
              >
                {loading ? '初始化中...' : '完成设置'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
