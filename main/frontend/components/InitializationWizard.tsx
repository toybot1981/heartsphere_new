
import React, { useState, useEffect } from 'react';
import { eraApi, characterApi, scriptApi, worldApi, presetScriptApi, presetMainStoryApi, userMainStoryApi } from '../services/api';
import { aiService } from '../services/ai';
import { Button } from './Button';
import { showAlert } from '../utils/dialog';
import { LazyImage } from './LazyImage';
import { generateVariantUrl, type ImageVariants } from '../utils/imageResolution';
import { CharacterAvatarImage } from './scene-wizard/CharacterAvatarImage';

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

interface PresetMainStory {
  id: number;
  name: string;
  description?: string; // 保留以兼容旧数据
  bio: string | null; // 从后端返回的 bio 字段
  age: number | null;
  role: string | null;
  systemEraId: number;
  eraName: string | null;
  characterId: number | null;
  characterName: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  voiceName: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
}

interface PresetScript {
  id: number;
  title: string;
  description: string | null; // 剧本介绍
  content: string;
  sceneCount: number | null; // 场景数量
  systemEraId: number | null;
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
  
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  
  // 步骤1：场景选择（支持多选）
  const [presetEras, setPresetEras] = useState<PresetEra[]>([]);
  const [selectedEras, setSelectedEras] = useState<Map<number, SelectedItem>>(new Map());
  
  // 步骤2：角色选择（按场景分组）
  const [presetCharacters, setPresetCharacters] = useState<Map<number, PresetCharacter[]>>(new Map()); // key: eraId
  const [selectedCharacters, setSelectedCharacters] = useState<Map<number, SelectedItem>>(new Map()); // key: characterId
  
  // 步骤3：主线剧情选择（按场景分组）
  const [presetMainStories, setPresetMainStories] = useState<Map<number, PresetMainStory>>(new Map()); // key: eraId
  const [selectedMainStories, setSelectedMainStories] = useState<Map<number, SelectedItem>>(new Map()); // key: mainStoryId (实际是 eraId)
  
  // 步骤4：剧本选择（按场景分组）
  const [presetScripts, setPresetScripts] = useState<Map<number, PresetScript[]>>(new Map()); // key: eraId
  const [selectedScripts, setSelectedScripts] = useState<Map<number, SelectedItem>>(new Map());

  // 加载预置场景（只加载系统预置，不包含游客预置）
  useEffect(() => {
    const loadPresetEras = async () => {
      try {
        setLoading(true);
        const eras = await eraApi.getSystemEras();
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

  // 当选择场景后，加载所有选中场景的主线剧情
  useEffect(() => {
    if (selectedEras.size > 0) {
      const loadMainStories = async () => {
        try {
          setLoading(true);
          const mainStoriesMap = new Map<number, PresetMainStory>();
          
          // 为每个选中的场景加载主线剧情
          // eraId 是系统预置场景的ID，直接作为 systemEraId 使用
          for (const [eraId, eraItem] of selectedEras) {
            try {
              const mainStory = await presetMainStoryApi.getByEraId(eraId);
              
              // 检查响应是否为 null 或 undefined
              if (mainStory && mainStory.id) {
                // 验证 systemEraId 是否匹配
                if (mainStory.systemEraId === eraId) {
                  // 记录预设主线剧情数据
                  mainStoriesMap.set(eraId, mainStory);
                } else {
                  console.warn(`[InitializationWizard] 主线剧情的 systemEraId (${mainStory.systemEraId}) 与场景ID (${eraId}) 不匹配`);
                }
              } else {
                if (mainStory) {
                }
              }
            } catch (error: any) {
              // 如果是 404，说明该场景没有主线剧情，这是正常的
              const status = error?.response?.status || error?.status;
              const message = error?.message || '';
              if (status === 404 || message.includes('404') || message.includes('not found')) {
              } else {
                console.error(`[InitializationWizard] ✗ 加载场景 ${eraId} 的主线剧情失败:`, error);
                console.error(`[InitializationWizard] 错误详情:`, {
                  status,
                  message,
                  response: error?.response,
                  stack: error?.stack
                });
              }
            }
          }
          
          setPresetMainStories(mainStoriesMap);
        } catch (error) {
          console.error('[InitializationWizard] 加载预置主线剧情失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadMainStories();
    } else {
      setPresetMainStories(new Map());
      setSelectedMainStories(new Map());
    }
  }, [selectedEras]);

  // 当选择场景后，加载所有选中场景的剧本
  useEffect(() => {
    if (selectedEras.size > 0) {
      const loadScripts = async () => {
        try {
          setLoading(true);
          const scriptsMap = new Map<number, PresetScript[]>();
          
          // 为每个选中的场景加载剧本
          // eraId 是系统预置场景的ID，直接作为 systemEraId 使用
          for (const [eraId, eraItem] of selectedEras) {
            try {
              const scripts = await presetScriptApi.getByEraId(eraId);
              
              if (scripts && Array.isArray(scripts) && scripts.length > 0) {
                // 过滤出匹配当前场景的剧本（通过 systemEraId）
                const matchingScripts = scripts.filter(script => script.systemEraId === eraId);
                if (matchingScripts.length > 0) {
                  scriptsMap.set(eraId, matchingScripts);
                  matchingScripts.forEach(script => {
                  });
                } else {
                  scriptsMap.set(eraId, []); // 设置为空数组，避免后续检查出错
                }
              } else {
                scriptsMap.set(eraId, []); // 设置为空数组，避免后续检查出错
              }
            } catch (error: any) {
              console.error(`[InitializationWizard] ✗ 加载场景 ${eraId} 的剧本失败:`, error);
              console.error(`[InitializationWizard] 错误详情:`, {
                status: error?.response?.status || error?.status,
                message: error?.message,
                response: error?.response
              });
              scriptsMap.set(eraId, []); // 设置为空数组，避免后续检查出错
            }
          }
          
          setPresetScripts(scriptsMap);
        } catch (error) {
          console.error('加载预置剧本失败:', error);
        } finally {
          setLoading(false);
        }
      };
      loadScripts();
    } else {
      setPresetScripts(new Map());
      setSelectedScripts(new Map());
    }
  }, [selectedEras]);

  // AI生成名字
  const generateName = async (type: 'character' | 'script', originalName: string, context?: string): Promise<string> => {
    try {
      setLoading(true);
      const prompt = type === 'character'
        ? `请为这个角色生成一个符合其特点的中文名字。角色信息：${context || originalName}。只返回名字，不要其他内容。`
        : `请为这个剧本生成一个更有吸引力的中文标题。原标题：${originalName}。只返回标题，不要其他内容。`;
      
      const response = await aiService.generateTextString(prompt, '你是一个专业的命名助手，擅长为角色和故事起名。');
      const name = response.trim();
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
    // 从 Map 中查找角色
    let character: PresetCharacter | null = null;
    for (const characters of presetCharacters.values()) {
      const found = characters.find(c => c.id === characterId);
      if (found) {
        character = found;
        break;
      }
    }
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

  // 处理主线剧情选择/取消（按场景，每个场景只能选择一个主线剧情）
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
    setSelectedMainStories(newSelected);
  };

  // 处理主线剧情重命名
  const handleMainStoryRename = async (eraId: number, type: 'manual' | 'ai') => {
    const mainStoryItem = selectedMainStories.get(eraId);
    if (!mainStoryItem) return;

    if (type === 'ai') {
      const mainStory = mainStoryItem.data as PresetMainStory;
      const aiName = await generateName('script', mainStory.name, mainStory.description);
      if (aiName) {
        const newSelected = new Map(selectedMainStories);
        const item = newSelected.get(eraId);
        if (item) {
          newSelected.set(eraId, { ...item, customName: aiName });
          setSelectedMainStories(newSelected);
        }
      }
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
    // 从 Map 中查找剧本
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

      // 显示初始化进度提示
      const progressSteps = [
        '正在创建场景...',
        '正在创建角色...',
        '正在创建主线剧情...',
        '正在创建剧本...',
        '正在同步数据...'
      ];
      let currentStep = 0;

      const updateProgress = (step: number) => {
        currentStep = step;
      };

      // ========== 初始化开始 ==========

      // 1. 创建所有选中的场景
      updateProgress(0);
      const createdEraIds = new Map<number, number>(); // 原eraId -> 新创建的eraId
      
      for (const [eraId, eraItem] of selectedEras) {
        const era = eraItem.data as PresetEra;
        const eraResponse = await eraApi.createEra({
          name: eraItem.customName || era.name,
          description: era.description,
          imageUrl: era.imageUrl || undefined,
          worldId: worldId,
          systemEraId: era.id
        }, token);
        
        createdEraIds.set(eraId, eraResponse.id);
      }

      // 2. 创建选中的角色（需要映射到新创建的场景ID）
      updateProgress(1);
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
              tagsString = (char.tags as string[]).join(', ');
            }
          }
          
          let catchphrasesString: string | undefined = undefined;
          if (char.catchphrases) {
            if (typeof char.catchphrases === 'string') {
              catchphrasesString = char.catchphrases;
            } else if (Array.isArray(char.catchphrases)) {
              catchphrasesString = (char.catchphrases as string[]).join(', ');
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

      // 3. 创建选中的主线剧情（使用专门的用户主线剧情表）
      updateProgress(2);
      for (const [eraId, mainStoryItem] of selectedMainStories) {
        const mainStory = mainStoryItem.data as PresetMainStory;
        const targetEraId = createdEraIds.get(eraId);
        if (targetEraId) {
          // 创建用户主线剧情
          // 只传递系统预置主线剧情ID和用户场景ID，后端会从预置数据库查询完整数据
          const mainStoryData: {
            systemMainStoryId: number;
            eraId: number;
            name?: string; // 可选：自定义名称
          } = {
            systemMainStoryId: mainStory.id, // 系统预置主线剧情ID
            eraId: targetEraId, // 用户场景ID
          };
          
          // 如果用户自定义了名称，添加到请求中
          if (mainStoryItem.customName) {
            mainStoryData.name = mainStoryItem.customName;
          }
          
          
          await userMainStoryApi.create(mainStoryData, token);
        }
      }

      // 4. 创建选中的剧本（如果有）
      updateProgress(3);
      for (const [scriptId, item] of selectedScripts) {
        const script = item.data as PresetScript;
        // 找到剧本所属的场景ID
        let targetEraId: number | null = null;
        for (const [eraId, scripts] of presetScripts) {
          if (scripts.some(s => s.id === scriptId)) {
            targetEraId = createdEraIds.get(eraId) || null;
            break;
          }
        }
        if (targetEraId) {
          // 创建用户剧本
          // 只传递系统预置剧本ID和用户场景ID，后端会从预置数据库查询完整数据
          const scriptData: {
            systemScriptId: number;
            eraId: number;
            worldId: number;
            title?: string; // 可选：自定义标题
          } = {
            systemScriptId: script.id, // 系统预置剧本ID
            eraId: targetEraId, // 用户场景ID
            worldId: worldId,
          };
          
          // 如果用户自定义了标题，添加到请求中
          if (item.customName) {
            scriptData.title = item.customName;
          }
          
          
          await scriptApi.createScript(scriptData, token);
        }
      }

      // 5. 等待一小段时间，确保数据已保存
      updateProgress(4);
      await new Promise(resolve => setTimeout(resolve, 500));

      // ========== 初始化完成 ==========
      
      // 调用 onComplete，让父组件处理数据同步和页面刷新
      onComplete();
    } catch (error: any) {
      console.error('初始化失败:', error);
      showAlert(`初始化失败：${error.message || '未知错误'}`);
      setLoading(false);
    }
  };

  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.9))' }}
    >
      <div 
        className="rounded-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card, #1e293b)',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
      >
        <div className="mb-6">
          <h2 
            className="text-2xl font-bold text-transparent bg-clip-text mb-2"
            style={{ backgroundImage: 'var(--gradient-text)' }}
          >
            欢迎来到心域 🌟
          </h2>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            让我们为你设置第一个场景、角色和剧本，开始你的心域之旅
          </p>
        </div>

        {/* 进度指示器 */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-2">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: step >= 1 ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: step >= 1 ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              1
            </div>
            <div 
              className="w-16 h-1"
              style={{
                backgroundColor: step >= 2 ? 'var(--color-primary)' : 'var(--bg-secondary)',
              }}
            />
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: step >= 2 ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: step >= 2 ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              2
            </div>
            <div 
              className="w-16 h-1"
              style={{
                backgroundColor: step >= 3 ? 'var(--color-primary)' : 'var(--bg-secondary)',
              }}
            />
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: step >= 3 ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: step >= 3 ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              3
            </div>
            <div 
              className="w-16 h-1"
              style={{
                backgroundColor: step >= 4 ? 'var(--color-primary)' : 'var(--bg-secondary)',
              }}
            />
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
              style={{
                backgroundColor: step >= 4 ? 'var(--color-primary)' : 'var(--bg-secondary)',
                color: step >= 4 ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              4
            </div>
          </div>
        </div>

        {/* 步骤1：场景选择（支持多选） */}
        {step === 1 && (
          <div className="space-y-6">
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              选择场景（可多选）
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              你可以选择多个场景，并为它们自定义名称
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {presetEras.map(era => {
                const isSelected = selectedEras.has(era.id);
                const selectedItem = selectedEras.get(era.id);
                
                return (
                  <div
                    key={era.id}
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                      backgroundColor: isSelected ? 'var(--bg-secondary-alpha)' : 'var(--bg-overlay-alpha)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                      }
                    }}
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
                          <div className="w-full h-32 rounded mb-2 overflow-hidden">
                            {(() => {
                              const variants: ImageVariants = {
                                thumbnail: generateVariantUrl(era.imageUrl, 200, 200),                                                                              
                                medium: generateVariantUrl(era.imageUrl, 800, 600),
                                highQuality: generateVariantUrl(era.imageUrl, 1920, 1080),                                                                          
                              };
                              return (
                                <LazyImage
                                  src={era.imageUrl}
                                  alt={era.name}
                                  className="w-full h-full object-cover"
                                  variants={variants}
                                  purpose="thumbnail"
                                />
                              );
                            })()}
                          </div>
                        )}
                        <h4 
                          className="font-bold mb-1"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {era.name}
                        </h4>                                                                               
                        <p 
                          className="text-xs line-clamp-2 mb-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {era.description}
                        </p>                                                            
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div 
                        className="mt-2 pt-2 border-t"
                        style={{ borderColor: 'var(--border-color-overlay)' }}
                      >
                        <label 
                          className="block text-xs mb-1"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          自定义名称
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={selectedItem?.customName ?? era.name}
                            onChange={(e) => {
                              const newSelected = new Map(selectedEras);
                              const item = newSelected.get(era.id);
                              if (item) {
                                // 允许空字符串，使用 ?? 而不是 || 来避免空字符串被当作 falsy
                                newSelected.set(era.id, { ...item, customName: e.target.value });
                                setSelectedEras(newSelected);
                              }
                            }}
                            placeholder={era.name}
                            className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-color-overlay)',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEraRename(era.id, 'ai');
                            }}
                            className="px-2 py-1 rounded text-xs transition-colors"
                            style={{
                              backgroundColor: 'var(--bg-secondary-alpha)',
                              color: 'var(--color-primary)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
                            }}
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
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              选择角色
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              你可以选择多个角色，并为它们自定义名称
            </p>
            
            {/* 按场景分组显示角色 */}
            {Array.from(presetCharacters.entries()).map(([eraId, characters]) => {
              const eraItem = selectedEras.get(eraId);
              if (!eraItem || characters.length === 0) return null;
              
              return (
                <div key={eraId} className="space-y-3">
                  <h4 
                    className="text-lg font-semibold border-b pb-2"
                    style={{
                      color: 'var(--color-primary)',
                      borderColor: 'var(--border-color-overlay)',
                    }}
                  >
                    {eraItem.customName || eraItem.originalName}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {characters.map(character => {
                      const isSelected = selectedCharacters.has(character.id);
                      const selectedItem = selectedCharacters.get(character.id);
                      
                      return (
                        <div
                          key={character.id}
                          className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                          style={{
                            borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                            backgroundColor: isSelected ? 'var(--bg-secondary-alpha)' : 'var(--bg-overlay-alpha)',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) {
                              e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                            }
                          }}
                        >
                          <div className="flex items-start gap-3 mb-2">
                            {character.avatarUrl && (
                              <div className="w-12 h-12 flex-shrink-0">
                                <CharacterAvatarImage
                                  src={character.avatarUrl}
                                  alt={character.name}
                                  className="w-12 h-12 rounded-full"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 
                                className="font-bold"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {character.name}
                              </h4>
                              {character.role && (
                                <p 
                                  className="text-xs"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {character.role}
                                </p>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCharacterToggle(character)}
                              className="w-5 h-5 flex-shrink-0"
                              style={{ accentColor: 'var(--color-primary)' }}
                            />
                          </div>
                          
                          {character.bio && (
                            <p 
                              className="text-xs mb-2 line-clamp-2"
                              style={{ color: 'var(--text-secondary)' }}
                            >
                              {character.bio}
                            </p>
                          )}

                          {isSelected && (
                            <div 
                              className="mt-2 pt-2 border-t"
                              style={{ borderColor: 'var(--border-color-overlay)' }}
                            >
                              <label 
                                className="block text-xs mb-1"
                                style={{ color: 'var(--text-secondary)' }}
                              >
                                自定义名称
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="text"
                                  value={selectedItem?.customName ?? character.name}
                                  onChange={(e) => {
                                    const newSelected = new Map(selectedCharacters);
                                    const item = newSelected.get(character.id);
                                    if (item) {
                                      // 允许空字符串，使用 ?? 而不是 || 来避免空字符串被当作 falsy
                                      newSelected.set(character.id, { ...item, customName: e.target.value });
                                      setSelectedCharacters(newSelected);
                                    }
                                  }}
                                  placeholder={character.name}
                                  className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                                  style={{
                                    backgroundColor: 'var(--bg-card)',
                                    borderColor: 'var(--border-color-overlay)',
                                    color: 'var(--text-primary)',
                                  }}
                                  onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                  }}
                                  onBlur={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                                  }}
                                />
                                <button
                                  onClick={() => handleCharacterRename(character.id, 'ai')}
                                  className="px-2 py-1 rounded text-xs transition-colors"
                                  style={{
                                    backgroundColor: 'var(--bg-secondary-alpha)',
                                    color: 'var(--color-primary)',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
                                  }}
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

        {/* 步骤3：主线剧情选择（按场景分组显示） */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              选择主线剧情（可选）
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
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
                      color: 'var(--color-primary)',
                      borderColor: 'var(--border-color-overlay)',
                    }}
                  >
                    {eraItem.customName || eraItem.originalName}
                  </h4>
                  <div
                    className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                    style={{
                      borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                      backgroundColor: isSelected ? 'var(--bg-secondary-alpha)' : 'var(--bg-overlay-alpha)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                      }
                    }}
                    onClick={() => handleMainStoryToggle(eraId, mainStory)}
                  >
                    <div className="flex items-start gap-3 mb-2">
                      {mainStory.avatarUrl && (
                        <div className="w-16 h-16 flex-shrink-0">
                          {(() => {
                            const variants: ImageVariants = {
                              thumbnail: generateVariantUrl(mainStory.avatarUrl, 200, 200),
                              medium: generateVariantUrl(mainStory.avatarUrl, 800, 600),
                              highQuality: generateVariantUrl(mainStory.avatarUrl, 1920, 1080),
                            };
                            return (
                              <LazyImage
                                src={mainStory.avatarUrl}
                                alt={mainStory.name}
                                className="w-16 h-16 rounded-full"
                                variants={variants}
                                purpose="thumbnail"
                              />
                            );
                          })()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {mainStory.name}
                        </h4>
                        {mainStory.description && (
                          <p 
                            className="text-xs mt-1 line-clamp-2"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {mainStory.description}
                          </p>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMainStoryToggle(eraId, mainStory)}
                        className="w-5 h-5 flex-shrink-0"
                        style={{ accentColor: 'var(--color-primary)' }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>

                    {isSelected && (
                      <div 
                        className="mt-2 pt-2 border-t"
                        style={{ borderColor: 'var(--border-color-overlay)' }}
                      >
                        <label 
                          className="block text-xs mb-1"
                          style={{ color: 'var(--text-secondary)' }}
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
                                // 允许空字符串，使用 ?? 而不是 || 来避免空字符串被当作 falsy
                                newSelected.set(eraId, { ...item, customName: e.target.value });
                                setSelectedMainStories(newSelected);
                              }
                            }}
                            placeholder={mainStory.name}
                            className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                            style={{
                              backgroundColor: 'var(--bg-card)',
                              borderColor: 'var(--border-color-overlay)',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-primary)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMainStoryRename(eraId, 'ai');
                            }}
                            className="px-2 py-1 rounded text-xs transition-colors"
                            style={{
                              backgroundColor: 'var(--bg-secondary-alpha)',
                              color: 'var(--color-primary)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
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
                style={{ color: 'var(--text-secondary)' }}
              >
                <p>选中的场景暂无预置主线剧情</p>
                <p className="text-xs mt-2">你可以稍后在场景中创建主线剧情</p>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(2)}>
                上一步
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={loading}
              >
                下一步
              </Button>
            </div>
          </div>
        )}

        {/* 步骤4：剧本选择（按场景分组显示） */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              选择剧本（可选）
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              你可以选择多个剧本，并为它们自定义标题
            </p>
            
            {/* 按场景分组显示剧本 */}
            {Array.from(presetScripts.entries()).map(([eraId, scripts]) => {
              const eraItem = selectedEras.get(eraId);
              if (!eraItem) return null;
              
              // 如果该场景没有剧本，显示提示信息
              if (!scripts || scripts.length === 0) {
                return (
                  <div key={eraId} className="space-y-3">
                    <h4 
                      className="text-lg font-semibold border-b pb-2"
                      style={{
                        color: 'var(--color-primary)',
                        borderColor: 'var(--border-color-overlay)',
                      }}
                    >
                      {eraItem.customName || eraItem.originalName}
                    </h4>
                    <div 
                      className="text-center py-6 text-sm"
                      style={{ color: 'var(--text-secondary)' }}
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
                      color: 'var(--color-primary)',
                      borderColor: 'var(--border-color-overlay)',
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
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--border-color-overlay)',
                        backgroundColor: isSelected ? 'var(--bg-secondary-alpha)' : 'var(--bg-overlay-alpha)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-color-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
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
                        </div>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleScriptToggle(script)}
                          className="w-5 h-5"
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                      </div>

                      {isSelected && (
                        <div 
                          className="mt-2 pt-2 border-t"
                          style={{ borderColor: 'var(--border-color-overlay)' }}
                        >
                          <label 
                            className="block text-xs mb-1"
                            style={{ color: 'var(--text-secondary)' }}
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
                                      // 允许空字符串，使用 ?? 而不是 || 来避免空字符串被当作 falsy
                                  newSelected.set(script.id, { ...item, customName: e.target.value });
                                  setSelectedScripts(newSelected);
                                }
                              }}
                              placeholder={script.title}
                              className="flex-1 border rounded px-2 py-1 text-xs outline-none"
                              style={{
                                backgroundColor: 'var(--bg-card)',
                                borderColor: 'var(--border-color-overlay)',
                                color: 'var(--text-primary)',
                              }}
                              onFocus={(e) => {
                                e.currentTarget.style.borderColor = 'var(--color-primary)';
                              }}
                              onBlur={(e) => {
                                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                              }}
                            />
                            <button
                              onClick={() => handleScriptRename(script.id, 'ai')}
                              className="px-2 py-1 rounded text-xs transition-colors"
                              style={{
                                backgroundColor: 'var(--bg-secondary-alpha)',
                                color: 'var(--color-primary)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--bg-secondary-alpha)';
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

            {/* 检查是否所有场景都没有剧本 */}
            {Array.from(presetScripts.entries()).every(([_, scripts]) => !scripts || scripts.length === 0) && (
              <div 
                className="text-center py-12"
                style={{ color: 'var(--text-secondary)' }}
              >
                <p>选中的场景暂无预置剧本</p>
                <p 
                  className="text-xs mt-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  你可以稍后在场景中创建剧本
                </p>
              </div>
            )}

            <div className="flex justify-between gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(3)}>
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
                {loading ? '初始化中...' : '完成设置'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
