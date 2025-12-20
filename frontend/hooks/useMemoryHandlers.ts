/**
 * 记忆（Memory）相关操作 Hook
 * 封装场景记忆的添加、删除等业务逻辑
 */

import { useCallback } from 'react';
import { EraMemory, WorldScene } from '../types';
import { useGameState } from '../contexts/GameStateContext';

/**
 * 记忆操作 Hook
 */
export const useMemoryHandlers = (memoryScene: WorldScene | null) => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 添加记忆
   */
  const handleAddMemory = useCallback((content: string, imageUrl?: string): void => {
    if (!memoryScene) return;
    const newMemory: EraMemory = {
      id: `mem_${Date.now()}`,
      content,
      imageUrl,
      timestamp: Date.now()
    };
    
    dispatch({ type: 'ADD_SCENE_MEMORY', payload: { sceneId: memoryScene.id, memory: newMemory } });
  }, [memoryScene, dispatch]);

  /**
   * 删除记忆
   */
  const handleDeleteMemory = useCallback((memoryId: string): void => {
    if (!memoryScene) return;
    dispatch({ type: 'REMOVE_SCENE_MEMORY', payload: { sceneId: memoryScene.id, memoryId } });
  }, [memoryScene, dispatch]);

  return {
    handleAddMemory,
    handleDeleteMemory,
  };
};

