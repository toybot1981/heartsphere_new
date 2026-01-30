/**
 * 数据转换工具
 * 用于将后端数据格式转换为前端需要的格式
 */

import { Character, WorldScene, CustomScenario } from '../types';
import { UserCharacter } from '../services/api/character/types';
import { UserMainStory } from '../services/api/mainStory/types';
import { UserScript } from '../services/api/script/types';

/**
 * 标准化 tags 字段（字符串或数组转换为数组）
 */
function normalizeTags(tags: string | string[] | null | undefined): string[] {
  if (!tags) return [];
  if (typeof tags === 'string') {
    return tags.split(',').filter(tag => tag.trim());
  }
  if (Array.isArray(tags)) {
    return tags.filter(tag => tag && tag.trim());
  }
  return [];
}

/**
 * 标准化 catchphrases 字段（字符串或数组转换为数组）
 */
function normalizeCatchphrases(catchphrases: string | string[] | null | undefined): string[] {
  if (!catchphrases) return [];
  if (typeof catchphrases === 'string') {
    return catchphrases.split(',').filter(phrase => phrase.trim());
  }
  if (Array.isArray(catchphrases)) {
    return catchphrases.filter(phrase => phrase && phrase.trim());
  }
  return [];
}

/**
 * 将后端角色数据转换为前端 Character 格式
 */
export function convertBackendCharacterToFrontend(
  char: UserCharacter | { id: number; name: string; age?: number | null; role?: string | null; bio?: string | null; avatarUrl?: string | null; backgroundUrl?: string | null; themeColor?: string | null; colorAccent?: string | null; firstMessage?: string | null; systemInstruction?: string | null; voiceName?: string | null; mbti?: string | null; tags?: string | string[] | null; speechStyle?: string | null; catchphrases?: string | string[] | null; secrets?: string | null; motivations?: string | null; relationships?: string | null }
): Character {
  return {
    id: char.id.toString(),
    name: char.name,
    age: char.age ?? 0,
    role: char.role || '',
    bio: char.bio || '',
    avatarUrl: char.avatarUrl || '',
    backgroundUrl: char.backgroundUrl || '',
    themeColor: char.themeColor || 'blue-500',
    colorAccent: char.colorAccent || '#3b82f6',
    firstMessage: char.firstMessage || '',
    systemInstruction: char.systemInstruction || '',
    voiceName: char.voiceName || 'Aoede',
    mbti: char.mbti || 'INFJ',
    tags: normalizeTags(char.tags),
    speechStyle: char.speechStyle || '',
    catchphrases: normalizeCatchphrases(char.catchphrases),
    secrets: char.secrets || '',
    motivations: char.motivations || '',
    relationships: char.relationships || ''
  };
}

/**
 * 将后端主线剧情数据转换为前端 Character 格式
 */
export function convertBackendMainStoryToCharacter(
  mainStory: UserMainStory | (UserMainStory & { mbti?: string | null; relationships?: string | null })
): Character {
  return {
    id: mainStory.id.toString(),
    name: mainStory.name,
    age: mainStory.age !== null && mainStory.age !== undefined ? mainStory.age : 0,
    role: mainStory.role || '叙事者',
    bio: mainStory.bio || '',
    avatarUrl: mainStory.avatarUrl || '',
    backgroundUrl: mainStory.backgroundUrl || '',
    themeColor: mainStory.themeColor || 'blue-500',
    colorAccent: mainStory.colorAccent || '#3b82f6',
    firstMessage: mainStory.firstMessage || '',
    systemInstruction: mainStory.systemInstruction || '',
    voiceName: mainStory.voiceName || 'Aoede',
    mbti: (mainStory as any).mbti || 'INFJ',
    tags: normalizeTags(mainStory.tags),
    speechStyle: mainStory.speechStyle || '',
    catchphrases: normalizeCatchphrases(mainStory.catchphrases),
    secrets: mainStory.secrets || '',
    motivations: mainStory.motivations || '',
    relationships: (mainStory as any).relationships || ''
  };
}

/**
 * 将后端剧本数据转换为前端格式
 */
export function convertBackendScriptToFrontend(script: UserScript) {
  return {
    id: script.id.toString(),
    title: script.title,
    description: script.description || null,
    content: script.content,
    sceneCount: script.sceneCount || 0,
    eraId: script.eraId || null,
    worldId: script.worldId || null,
    characterIds: script.characterIds || null,
    tags: script.tags || null,
  };
}

/**
 * 将后端剧本数据转换为 CustomScenario 格式
 */
export function convertBackendScriptToScenario(
  script: UserScript,
  sceneId: string
): CustomScenario {
  try {
    const scenarioContent = JSON.parse(script.content);
    
    // 确保 nodes 是一个有效的对象
    const nodes = scenarioContent.nodes || {};
    if (typeof nodes !== 'object' || Array.isArray(nodes)) {
      console.warn('[convertBackendScriptToScenario] nodes 格式无效，使用空对象:', {
        nodesType: typeof nodes,
        isArray: Array.isArray(nodes),
        scenarioContent,
      });
      return {
        id: String(script.id),
        sceneId: sceneId,
        title: script.title || '未命名剧本',
        description: script.title || '未命名剧本',
        nodes: {},
        startNodeId: '',
        author: '用户'
      };
    }
    
    // 确保 startNodeId 有效
    const availableNodeIds = Object.keys(nodes);
    let startNodeId = scenarioContent.startNodeId || availableNodeIds[0] || '';
    
    // 如果指定的 startNodeId 无效，尝试使用第一个可用节点
    if (startNodeId && !nodes[startNodeId]) {
      console.warn('[convertBackendScriptToScenario] startNodeId 无效，使用第一个节点:', {
        startNodeId: scenarioContent.startNodeId,
        availableNodes: availableNodeIds,
      });
      startNodeId = availableNodeIds[0] || '';
    }
    
    // 如果 nodes 为空，记录警告
    if (availableNodeIds.length === 0) {
      console.warn('[convertBackendScriptToScenario] nodes 为空，无法设置有效的 startNodeId:', {
        scriptId: script.id,
        scriptTitle: script.title,
        scenarioContent: scenarioContent,
      });
    }
    
    return {
      id: String(script.id),
      sceneId: sceneId,
      title: script.title || '未命名剧本',
      description: script.title || '未命名剧本',
      nodes: nodes,
      startNodeId: startNodeId,
      author: '用户'
    };
  } catch (error) {
    console.error('[convertBackendScriptToScenario] 解析剧本内容失败:', error);
    // 返回一个默认的 scenario（确保 nodes 是空对象而不是 undefined）
    return {
      id: String(script.id),
      sceneId: sceneId,
      title: script.title || '未命名剧本',
      description: '剧本格式错误',
      nodes: {}, // 确保是空对象而不是 undefined
      startNodeId: '',
      author: '用户'
    };
  }
}

/**
 * 按 worldId 分组场景数据
 */
export function groupErasByWorldId<T extends { worldId?: number; id: number }>(
  eras: T[]
): Map<number, T[]> {
  const erasByWorldId = new Map<number, T[]>();
  // 添加空值检查，防止传入undefined或null
  if (!eras || !Array.isArray(eras)) {
    console.warn('[groupErasByWorldId] eras参数无效:', eras);
    return erasByWorldId;
  }
  eras.forEach(era => {
    const worldId = era.worldId || (era as any).world?.id || (era as any).worldId;
    if (worldId) {
      if (!erasByWorldId.has(worldId)) {
        erasByWorldId.set(worldId, []);
      }
      erasByWorldId.get(worldId)?.push(era);
    }
  });
  return erasByWorldId;
}

/**
 * 按 eraId 分组角色数据
 */
export function groupCharactersByEraId<T extends { eraId?: number }>(
  characters: T[]
): Map<number, T[]> {
  const charactersByEraId = new Map<number, T[]>();
  characters.forEach(char => {
    const eraId = char.eraId;
    if (eraId) {
      if (!charactersByEraId.has(eraId)) {
        charactersByEraId.set(eraId, []);
      }
      charactersByEraId.get(eraId)?.push(char);
    }
  });
  return charactersByEraId;
}

/**
 * 按 eraId 分组剧本数据
 */
export function groupScriptsByEraId<T extends { eraId?: number }>(
  scripts: T[]
): Map<number, T[]> {
  const scriptsByEraId = new Map<number, T[]>();
  scripts.forEach(script => {
    const eraId = script.eraId;
    if (eraId) {
      if (!scriptsByEraId.has(eraId)) {
        scriptsByEraId.set(eraId, []);
      }
      scriptsByEraId.get(eraId)?.push(script);
    }
  });
  return scriptsByEraId;
}

/**
 * 按 eraId 分组主线剧情数据（每个场景只有一个主线剧情）
 */
export function groupMainStoriesByEraId<T extends { eraId?: number }>(
  mainStories: T[]
): Map<number, T> {
  const mainStoriesByEraId = new Map<number, T>();
  mainStories.forEach(mainStory => {
    const eraId = mainStory.eraId;
    if (eraId) {
      mainStoriesByEraId.set(eraId, mainStory);
    }
  });
  return mainStoriesByEraId;
}

/**
 * 将后端数据转换为 WorldScene 数组
 * 
 * @param worlds - 世界列表
 * @param eras - 场景列表
 * @param characters - 角色列表
 * @param scripts - 剧本列表（可选）
 * @param mainStories - 主线剧情列表（可选）
 * @param isSharedMode - 是否为共享模式（共享模式下直接展示所有场景，不按世界分组）
 * @returns WorldScene 数组
 */
export function convertErasToWorldScenes(
  worlds: Array<{ id: number; name: string }>,
  eras: Array<{ id: number; name: string; description?: string | null; imageUrl?: string | null; systemEraId?: number | null; worldId?: number }>,
  characters: UserCharacter[],
  scripts?: UserScript[],
  mainStories?: UserMainStory[],
  isSharedMode: boolean = false
): WorldScene[] {
  // 添加空值检查
  const safeWorlds = Array.isArray(worlds) ? worlds : [];
  const safeEras = Array.isArray(eras) ? eras : [];
  const safeCharacters = Array.isArray(characters) ? characters : [];
  
  // 分组数据
  const erasByWorldId = groupErasByWorldId(safeEras);
  const charactersByEraId = groupCharactersByEraId(safeCharacters);
  const scriptsByEraId = scripts ? groupScriptsByEraId(scripts) : new Map<number, UserScript[]>();
  const mainStoriesByEraId = mainStories ? groupMainStoriesByEraId(mainStories) : new Map<number, UserMainStory>();

  // 转换为 WorldScene 数组
  const userWorldScenes: WorldScene[] = [];

  if (isSharedMode) {
    // 共享模式：直接展示所有场景，不按世界分组
    safeEras.forEach(era => {
      const eraCharacters = charactersByEraId.get(era.id) || [];
      const eraScripts = scriptsByEraId.get(era.id) || [];
      const eraMainStory = mainStoriesByEraId.get(era.id);

      const scene: WorldScene = {
        id: `era_${era.id}`, // 使用 era_ 前缀标识
        name: era.name,
        description: era.description || '',
        imageUrl: era.imageUrl || '',
        systemEraId: era.systemEraId || undefined,
        characters: eraCharacters.map(char => convertBackendCharacterToFrontend(char)),
        mainStory: eraMainStory ? convertBackendMainStoryToCharacter(eraMainStory) : undefined,
        scripts: eraScripts.map(script => convertBackendScriptToFrontend(script)),
        scenes: [],
        worldId: era.worldId || undefined
      };

      userWorldScenes.push(scene);
    });
  } else {
    // 正常模式：按世界分组
    if (safeWorlds.length === 0) {
      // 如果没有世界（如游客模式），直接展示所有场景
      safeEras.forEach(era => {
        const eraCharacters = charactersByEraId.get(era.id) || [];
        const eraScripts = scriptsByEraId.get(era.id) || [];
        const eraMainStory = mainStoriesByEraId.get(era.id);

        const scene: WorldScene = {
          id: `era_${era.id}`, // 使用 era_ 前缀标识
          name: era.name,
          description: era.description || '',
          imageUrl: era.imageUrl || '',
          systemEraId: era.systemEraId || undefined,
          characters: eraCharacters.map(char => convertBackendCharacterToFrontend(char)),
          mainStory: eraMainStory ? convertBackendMainStoryToCharacter(eraMainStory) : undefined,
          scripts: eraScripts.map(script => convertBackendScriptToFrontend(script)),
          scenes: [],
          worldId: era.worldId || undefined
        };

        userWorldScenes.push(scene);
      });
    } else {
      // 有世界时，按世界分组
      safeWorlds.forEach(world => {
        const worldEras = erasByWorldId.get(world.id) || [];

        worldEras.forEach(era => {
          const eraCharacters = charactersByEraId.get(era.id) || [];
          const eraScripts = scriptsByEraId.get(era.id) || [];
          const eraMainStory = mainStoriesByEraId.get(era.id);

          const scene: WorldScene = {
            id: `era_${era.id}`, // 使用 era_ 前缀标识
            name: era.name,
            description: era.description || '',
            imageUrl: era.imageUrl || '',
            systemEraId: era.systemEraId || undefined,
            characters: eraCharacters.map(char => convertBackendCharacterToFrontend(char)),
            mainStory: eraMainStory ? convertBackendMainStoryToCharacter(eraMainStory) : undefined,
            scripts: eraScripts.map(script => convertBackendScriptToFrontend(script)),
            scenes: [],
            worldId: world.id
          };

          userWorldScenes.push(scene);
        });
      });
    }
  }

  return userWorldScenes;
}

