/**
 * 场景相关业务Hook
 * 封装场景相关的状态操作和业务逻辑
 */

import { useCallback, useMemo } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { WorldScene } from '../types';
import { eraApi } from '../services/api';
import { getToken } from '../services/api/base/tokenStorage';

export const useScenes = () => {
  const { state, dispatch } = useGameState();

  // 获取所有用户场景
  const userWorldScenes = useMemo(() => state.userWorldScenes, [state.userWorldScenes]);

  // 根据ID获取场景
  const getSceneById = useCallback((sceneId: string): WorldScene | undefined => {
    return userWorldScenes.find(scene => scene.id === sceneId);
  }, [userWorldScenes]);

  // 获取当前选中的场景
  const currentScene = useMemo(() => {
    if (!state.selectedSceneId) return null;
    return getSceneById(state.selectedSceneId);
  }, [state.selectedSceneId, getSceneById]);

  // 添加场景
  const addScene = useCallback((scene: WorldScene) => {
    dispatch({ type: 'ADD_USER_WORLD_SCENE', payload: scene });
  }, [dispatch]);

  // 更新场景
  const updateScene = useCallback((sceneId: string, updates: Partial<WorldScene>) => {
    dispatch({ type: 'UPDATE_USER_WORLD_SCENE', payload: { sceneId, updates } });
  }, [dispatch]);

  // 删除场景
  const removeScene = useCallback((sceneId: string) => {
    dispatch({ type: 'REMOVE_USER_WORLD_SCENE', payload: sceneId });
  }, [dispatch]);

  // 设置选中的场景
  const setSelectedScene = useCallback((sceneId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
  }, [dispatch]);

  // 从后端加载场景
  const loadScenesFromBackend = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        console.warn('[useScenes] 未找到token，无法加载场景');
        return;
      }

      const scenes = await eraApi.getAllEras(token);
      // 将后端数据转换为WorldScene格式
      const worldScenes: WorldScene[] = scenes.map(era => ({
        id: era.id.toString(),
        name: era.name,
        description: era.description || '',
        imageUrl: era.imageUrl || '',
        characters: [],
        scripts: [],
        memories: [],
        worldId: era.worldId,
        systemEraId: era.systemEraId || undefined
      }));

      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: worldScenes });
      return worldScenes;
    } catch (error) {
      console.error('[useScenes] 加载场景失败:', error);
      throw error;
    }
  }, [dispatch]);

  return {
    // 数据
    userWorldScenes,
    currentScene,
    
    // 方法
    getSceneById,
    addScene,
    updateScene,
    removeScene,
    setSelectedScene,
    loadScenesFromBackend
  };
};

