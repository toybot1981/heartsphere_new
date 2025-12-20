/**
 * 场景（Era）相关操作 Hook
 * 封装场景的保存、删除等业务逻辑
 */

import { useCallback } from 'react';
import { WorldScene } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { eraApi, worldApi } from '../services/api';
import { showSyncErrorToast } from '../utils/toast';

/**
 * 场景操作 Hook
 */
export const useEraHandlers = (
  editingScene: WorldScene | null,
  onClose?: () => void
) => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 保存场景
   */
  const handleSaveEra = useCallback(async (newScene: WorldScene) => {
    // 1. 先保存到本地（立即更新UI）
    const isNumericId = /^\d+$/.test(newScene.id);
    const isEditing = isNumericId && editingScene;
    
    // 如果是编辑现有场景，直接更新；如果是新建，只添加到customScenes（临时）
    if (isEditing) {
      // 编辑模式：更新两个列表
      const updatedCustomScenes = gameState.customScenes.map(s => s.id === newScene.id ? newScene : s);
      const updatedUserWorldScenes = (gameState.userWorldScenes || []).map(s => s.id === newScene.id ? newScene : s);
      dispatch({ type: 'SET_CUSTOM_SCENES', payload: updatedCustomScenes });
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
    } else {
      // 新建模式：只添加到customScenes（临时ID），同步成功后会移到userWorldScenes
      const existsInCustomScenes = gameState.customScenes.some(s => s.id === newScene.id);
      if (existsInCustomScenes) {
        const updatedCustomScenes = gameState.customScenes.map(s => s.id === newScene.id ? newScene : s);
        dispatch({ type: 'SET_CUSTOM_SCENES', payload: updatedCustomScenes });
      } else {
        dispatch({ type: 'SET_CUSTOM_SCENES', payload: [...gameState.customScenes, newScene] });
      }
    }

    if (onClose) {
      onClose();
    }

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    if (!token || !gameState.userProfile || gameState.userProfile.isGuest) {
      return; // 游客模式，只保存到本地
    }

    // 异步同步，不阻塞UI
    (async () => {
      try {
        // 获取用户的默认世界ID（通常是"心域"世界）
        let worldId: number | null = null;
        
        // 如果场景有worldId，使用它
        if (newScene.worldId) {
          worldId = newScene.worldId;
        } else {
          // 否则，获取用户的第一个世界（通常是"心域"）
          const worlds = await worldApi.getAllWorlds(token);
          if (worlds.length > 0) {
            worldId = worlds[0].id; // 使用第一个世界（通常是默认的"心域"）
          } else {
            console.error('用户没有世界，无法同步场景');
            showSyncErrorToast('场景');
            return;
          }
        }

        // 判断是创建还是更新
        const eraId = isNumericId ? parseInt(newScene.id, 10) : null;

        let savedEra: any;
        if (eraId && isEditing) {
          // 更新现有场景
          console.log(`[useEraHandlers] 同步更新场景: eraId=${eraId}, worldId=${worldId}`);
          savedEra = await eraApi.updateEra(eraId, {
            name: newScene.name,
            description: newScene.description,
            startYear: undefined,
            endYear: undefined,
            worldId: worldId,
            imageUrl: newScene.imageUrl || undefined,
            systemEraId: newScene.systemEraId || null,
          }, token);
        } else {
          // 创建新场景
          console.log(`[useEraHandlers] 同步创建场景: worldId=${worldId}`);
          savedEra = await eraApi.createEra({
            name: newScene.name,
            description: newScene.description,
            startYear: undefined,
            endYear: undefined,
            worldId: worldId,
            imageUrl: newScene.imageUrl || undefined,
            systemEraId: newScene.systemEraId || null,
          }, token);
        }

        console.log(`[useEraHandlers] 后端同步成功:`, savedEra);

        // 将后端返回的场景转换为WorldScene格式并更新本地状态
        const updatedScene: WorldScene = {
          id: savedEra.id.toString(),
          name: savedEra.name,
          description: savedEra.description,
          imageUrl: savedEra.imageUrl || newScene.imageUrl || '',
          characters: newScene.characters || [],
          worldId: savedEra.worldId,
          mainStory: newScene.mainStory,
          systemEraId: savedEra.systemEraId || newScene.systemEraId || undefined // 优先使用后端返回的 systemEraId
        };

        // 更新本地状态（使用服务器返回的ID）
        // 移除临时ID的场景（从customScenes和userWorldScenes中）
        const updatedUserWorldScenes = (gameState.userWorldScenes || [])
            .filter(s => s.id !== newScene.id) // 移除临时ID
            .filter(s => s.id !== updatedScene.id.toString()) // 避免重复
            .concat([updatedScene]); // 添加服务器返回的场景

        const updatedCustomScenes = gameState.customScenes
            .filter(s => s.id !== newScene.id) // 移除临时ID
            .filter(s => s.id !== updatedScene.id.toString()); // 避免重复，服务器场景不应该在customScenes中

        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
        dispatch({ type: 'SET_CUSTOM_SCENES', payload: updatedCustomScenes });
      } catch (error) {
        console.error('[useEraHandlers] 同步场景失败:', error);
        showSyncErrorToast('场景');
      }
    })();
  }, [gameState, dispatch, editingScene, onClose]);

  /**
   * 删除场景
   */
  const handleDeleteEra = useCallback(async (
    sceneId: string,
    e?: React.MouseEvent
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    // 1. 先删除本地（立即更新UI）
    const updatedCustomScenes = gameState.customScenes.filter(s => s.id !== sceneId);
    const updatedUserWorldScenes = (gameState.userWorldScenes || []).filter(s => s.id !== sceneId);
    const updatedCustomCharacters = Object.fromEntries(
      Object.entries(gameState.customCharacters).filter(([id]) => id !== sceneId)
    );
    dispatch({ type: 'SET_CUSTOM_SCENES', payload: updatedCustomScenes });
    dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
    dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: updatedCustomCharacters });
    
    if (onClose) {
      onClose();
    }

    // 2. 异步同步到服务器（如果已登录且ID是数字）
    const token = localStorage.getItem('auth_token');
    const isNumericId = /^\d+$/.test(sceneId);
    if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
      (async () => {
        try {
          const eraId = parseInt(sceneId, 10);
          await eraApi.deleteEra(eraId, token);
          console.log('Era deleted from server:', eraId);
        } catch (error) {
          console.error('Failed to delete era from server:', error);
          showSyncErrorToast('场景删除');
        }
      })();
    }
  }, [gameState, dispatch, onClose]);

  return {
    handleSaveEra,
    handleDeleteEra,
  };
};

