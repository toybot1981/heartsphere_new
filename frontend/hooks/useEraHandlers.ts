/**
 * 场景（Era）相关操作 Hook
 * 封装场景的保存、删除等业务逻辑
 */

import { useCallback } from 'react';
import { WorldScene } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { eraApi, worldApi } from '../services/api';
import { showAlert } from '../utils/dialog';

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
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    
    if (!token || isGuest) {
      if (onClose) {
        onClose();
      }
      console.log("[useEraHandlers] 跳过服务器提交: 未登录或游客模式");
      return;
    }

    try {
      console.log("[useEraHandlers] 开始提交场景到服务器");
      
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
          throw new Error('用户没有世界，无法创建场景');
        }
      }

      // 判断是创建还是更新
      // 提取场景ID中的数字部分（支持 era_193、193 等格式）
      const numericMatch = newScene.id.match(/\d+$/);
      const eraId = numericMatch ? parseInt(numericMatch[0], 10) : null;
      const isEditing = eraId !== null && editingScene;

      let savedEra: any;
      if (eraId && isEditing) {
        // 更新现有场景
        console.log(`[useEraHandlers] 更新场景: eraId=${eraId}, worldId=${worldId}`);
        savedEra = await eraApi.updateEra(eraId, {
          name: newScene.name,
          description: newScene.description,
          startYear: undefined,
          endYear: undefined,
          worldId: worldId,
          imageUrl: newScene.imageUrl || undefined,
          systemEraId: newScene.systemEraId || null,
        }, token);
        console.log(`[useEraHandlers] 场景更新成功: ID=${eraId}`);
      } else {
        // 创建新场景
        console.log(`[useEraHandlers] 创建场景: worldId=${worldId}`);
        savedEra = await eraApi.createEra({
          name: newScene.name,
          description: newScene.description,
          startYear: undefined,
          endYear: undefined,
          worldId: worldId,
          imageUrl: newScene.imageUrl || undefined,
          systemEraId: newScene.systemEraId || null,
        }, token);
        console.log(`[useEraHandlers] 场景创建成功: ID=${savedEra.id}`);
      }

      // 刷新场景列表，更新显示
      console.log("[useEraHandlers] 刷新场景列表");
      const updatedEras = await eraApi.getAllEras(token);
      console.log(`[useEraHandlers] 获取到 ${updatedEras.length} 个场景`);
      
      // 重新构建 userWorldScenes
      const worlds = await worldApi.getAllWorlds(token);
      const updatedUserWorldScenes = updatedEras.map(era => ({
        id: `era_${era.id}`, // 使用 era_ 前缀，与 convertErasToWorldScenes 保持一致
        name: era.name,
        description: era.description,
        imageUrl: era.imageUrl || '',
        characters: [], // 角色数据需要单独加载
        worldId: era.worldId,
        systemEraId: era.systemEraId || undefined,
      }));

      // 保留原有的 memories 和 characters
      const scenesWithMemories = updatedUserWorldScenes.map(scene => {
        const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
        return {
          ...scene,
          characters: existingScene?.characters || [],
          mainStory: existingScene?.mainStory,
          memories: existingScene?.memories,
        };
      });

      // 清空 customScenes（不再保存手动添加的内容到本地）
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
      dispatch({ type: 'SET_CUSTOM_SCENES', payload: [] });
      
      console.log(`[useEraHandlers] 场景列表已刷新，共 ${scenesWithMemories.length} 个场景`);
      
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error(`[useEraHandlers] 场景提交失败: ID=${newScene.id}`, error);
      const errorMessage = error.message || '未知错误';
      showAlert(`场景提交失败: ${errorMessage}`, '提交失败', 'error');
      throw error; // 重新抛出错误，让调用方知道失败
    }
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
    
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    
    // 提取场景ID中的数字部分（支持 era_193、193 等格式）
    const numericMatch = sceneId.match(/\d+$/);
    const eraId = numericMatch ? parseInt(numericMatch[0], 10) : null;
    const isNumericId = eraId !== null && !isNaN(eraId);
    
    console.log(`[useEraHandlers] 删除场景检查: sceneId=${sceneId}, 提取的eraId=${eraId}, token存在=${!!token}, isGuest=${isGuest}, isNumericId=${isNumericId}`);
    
    if (!token || isGuest || !isNumericId) {
      const reasons = [];
      if (!token) reasons.push('未登录');
      if (isGuest) reasons.push('游客模式');
      if (!isNumericId) reasons.push(`无效ID (sceneId=${sceneId}, 无法提取数字)`);
      
      console.warn(`[useEraHandlers] 跳过服务器删除: ${reasons.join('、')}`);
      
      if (onClose) {
        onClose();
      }
      return;
    }

    try {
      console.log(`[useEraHandlers] 删除场景: sceneId=${sceneId}, eraId=${eraId}`);
      await eraApi.deleteEra(eraId, token);
      console.log(`[useEraHandlers] 场景删除成功: ID=${eraId}`);
      
      // 刷新场景列表，更新显示
      console.log("[useEraHandlers] 刷新场景列表");
      const updatedEras = await eraApi.getAllEras(token);
      console.log(`[useEraHandlers] 获取到 ${updatedEras.length} 个场景`);
      
      // 重新构建 userWorldScenes
      const worlds = await worldApi.getAllWorlds(token);
      const updatedUserWorldScenes = updatedEras.map(era => ({
        id: `era_${era.id}`, // 使用 era_ 前缀，与 convertErasToWorldScenes 保持一致
        name: era.name,
        description: era.description,
        imageUrl: era.imageUrl || '',
        characters: [], // 角色数据需要单独加载
        worldId: era.worldId,
        systemEraId: era.systemEraId || undefined,
      }));

      // 保留原有的 memories 和 characters
      const scenesWithMemories = updatedUserWorldScenes.map(scene => {
        const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
        return {
          ...scene,
          characters: existingScene?.characters || [],
          mainStory: existingScene?.mainStory,
          memories: existingScene?.memories,
        };
      });

      // 清空 customScenes（不再保存手动添加的内容到本地）
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
      dispatch({ type: 'SET_CUSTOM_SCENES', payload: [] });
      
      // 清空该场景的 customCharacters
      const updatedCustomCharacters = Object.fromEntries(
        Object.entries(gameState.customCharacters).filter(([id]) => id !== sceneId)
      );
      dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: updatedCustomCharacters });
      
      console.log(`[useEraHandlers] 场景列表已刷新，共 ${scenesWithMemories.length} 个场景`);
      
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error(`[useEraHandlers] 场景删除失败: ID=${sceneId}`, error);
      const errorMessage = error.message || '未知错误';
      showAlert(`场景删除失败: ${errorMessage}`, '删除失败', 'error');
      throw error; // 重新抛出错误，让调用方知道失败
    }
  }, [gameState, dispatch, onClose]);

  return {
    handleSaveEra,
    handleDeleteEra,
  };
};

