/**
 * 场景映射工具
 * 用于管理场景ID到世界ID的映射关系
 */

import { storageService } from '../services/storage';

// 内置场景到世界ID的映射
export const SCENE_WORLD_MAPPING: { [sceneId: string]: number } = {
  'university_era': 1,  // 大学场景
  'cyberpunk_city': 2,  // 赛博都市
  'clinic': 3           // 心域诊所
};

// 自定义场景映射（从存储中加载）
let customSceneMappings: { [sceneId: string]: number } = {};

/**
 * 初始化自定义场景映射（从存储中加载）
 */
export const initCustomSceneMappings = async (): Promise<void> => {
  try {
    const storedMappings = await storageService.getCustomSceneMappings();
    customSceneMappings = storedMappings || {};
    console.log('[sceneMapping] 加载自定义场景映射:', customSceneMappings);
  } catch (error) {
    console.error('[sceneMapping] 加载自定义场景映射失败:', error);
    customSceneMappings = {};
  }
};

/**
 * 获取场景对应的世界ID
 * @param sceneId - 场景ID
 * @returns 世界ID
 */
export const getWorldIdForSceneId = (sceneId: string): number => {
  // 先检查内置场景映射
  if (SCENE_WORLD_MAPPING[sceneId]) {
    return SCENE_WORLD_MAPPING[sceneId];
  }
  
  // 然后检查自定义场景映射
  if (customSceneMappings[sceneId]) {
    return customSceneMappings[sceneId];
  }
  
  // 默认返回世界ID 1
  return 1;
};

/**
 * 保存自定义场景映射
 * @param sceneId - 场景ID
 * @param worldId - 世界ID
 */
export const saveCustomSceneMapping = async (sceneId: string, worldId: number): Promise<void> => {
  customSceneMappings[sceneId] = worldId;
  await storageService.saveCustomSceneMappings(customSceneMappings);
  console.log('[sceneMapping] 保存自定义场景映射:', { sceneId, worldId });
};




