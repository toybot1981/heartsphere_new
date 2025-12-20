/**
 * 主线剧情（MainStory）相关操作 Hook
 * 封装主线剧情的保存、删除等业务逻辑
 */

import { useCallback } from 'react';
import { Character } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { userMainStoryApi } from '../services/api';
import { showAlert, showConfirm } from '../utils/dialog';

/**
 * 主线剧情操作 Hook
 */
export const useMainStoryHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 保存主线故事
   * 注意：主线故事的保存逻辑与角色保存逻辑混合在一起
   * 这个函数主要用于从 MainStoryEditor 保存主线故事
   */
  const handleSaveMainStory = useCallback(async (
    mainStory: Character,
    sceneId: string,
    eraId?: number
  ) => {
    if (!gameState.userProfile || gameState.userProfile.isGuest) {
      showAlert('请先登录才能保存主线故事', '需要登录', 'warning');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      showAlert('请先登录才能保存主线故事', '需要登录', 'warning');
      return;
    }

    try {
      // 检查是否已存在主线故事
      const scene = gameState.userWorldScenes.find(s => s.id === sceneId);
      const existingMainStory = scene?.mainStory;
      const isNumericId = /^\d+$/.test(mainStory.id);
      const isEditing = isNumericId && existingMainStory;

      if (isEditing && existingMainStory) {
        // 更新现有主线故事
        const mainStoryId = parseInt(mainStory.id, 10);
        await userMainStoryApi.update(mainStoryId, {
          name: mainStory.name,
          role: mainStory.role,
          bio: mainStory.bio,
          avatarUrl: mainStory.avatarUrl,
          backgroundUrl: mainStory.backgroundUrl,
          themeColor: mainStory.themeColor,
          colorAccent: mainStory.colorAccent,
          firstMessage: mainStory.firstMessage,
          systemInstruction: mainStory.systemInstruction,
          voiceName: mainStory.voiceName,
          tags: Array.isArray(mainStory.tags) ? mainStory.tags.join(',') : mainStory.tags,
          speechStyle: mainStory.speechStyle,
          catchphrases: Array.isArray(mainStory.catchphrases) ? mainStory.catchphrases.join(',') : mainStory.catchphrases,
          secrets: mainStory.secrets,
          motivations: mainStory.motivations,
        }, token);
        console.log(`[useMainStoryHandlers] 主线故事更新成功: ID=${mainStoryId}`);
      } else {
        // 创建新主线故事
        // 注意：CreateUserMainStoryDTO 只支持 systemMainStoryId, eraId, name
        // 其他字段需要通过 update 接口更新
        const createdMainStory = await userMainStoryApi.create({
          name: mainStory.name,
          eraId: eraId || 0,
        }, token);
        
        // 创建后立即更新其他字段
        if (createdMainStory.id) {
          await userMainStoryApi.update(createdMainStory.id, {
            role: mainStory.role,
            bio: mainStory.bio,
            avatarUrl: mainStory.avatarUrl,
            backgroundUrl: mainStory.backgroundUrl,
            themeColor: mainStory.themeColor,
            colorAccent: mainStory.colorAccent,
            firstMessage: mainStory.firstMessage,
            systemInstruction: mainStory.systemInstruction,
            voiceName: mainStory.voiceName,
            tags: Array.isArray(mainStory.tags) ? mainStory.tags.join(',') : mainStory.tags,
            speechStyle: mainStory.speechStyle,
            catchphrases: Array.isArray(mainStory.catchphrases) ? mainStory.catchphrases.join(',') : mainStory.catchphrases,
            secrets: mainStory.secrets,
            motivations: mainStory.motivations,
          }, token);
        }
        console.log(`[useMainStoryHandlers] 主线故事创建成功: ID=${createdMainStory.id}`);
        
        // 更新本地状态中的主线故事ID
        const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
          if (scene.id === sceneId) {
            return {
              ...scene,
              mainStory: {
                ...mainStory,
                id: createdMainStory.id.toString()
              }
            };
          }
          return scene;
        });
        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
      }

      // 更新本地状态
      const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            mainStory: mainStory
          };
        }
        return scene;
      });
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
    } catch (error) {
      console.error('[useMainStoryHandlers] 保存主线故事失败:', error);
      showAlert('保存主线故事失败，请稍后重试', '保存失败', 'error');
    }
  }, [gameState, dispatch]);

  /**
   * 删除主线故事
   */
  const handleDeleteMainStory = useCallback(async (mainStory: Character, sceneId: string) => {
    if (!gameState.userProfile || gameState.userProfile.isGuest) {
      showAlert('请先登录才能删除主线故事', '需要登录', 'warning');
      return;
    }
    
    const confirmed = await showConfirm("确定要删除这个主线故事吗？删除后将移至回收站，可以随时恢复。", '删除主线故事', 'warning');
    if (confirmed) {
      // 1. 先删除本地（立即更新UI）
      const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            mainStory: undefined
          };
        }
        return scene;
      });
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });

      // 2. 异步同步到服务器（如果已登录且ID是数字）
      const token = localStorage.getItem('auth_token');
      const isNumericId = /^\d+$/.test(mainStory.id);
      if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
        (async () => {
          try {
            const mainStoryId = parseInt(mainStory.id, 10);
            await userMainStoryApi.delete(mainStoryId, token);
            console.log('Main story deleted from server:', mainStoryId);
            showAlert('主线故事已删除', '删除成功', 'success');
          } catch (error) {
            console.error('Failed to delete main story from server:', error);
            showAlert('主线故事删除同步失败，请检查网络连接或稍后重试。', '同步失败', 'error');
          }
        })();
      }
    }
  }, [gameState, dispatch]);

  /**
   * 编辑主线故事
   */
  const handleEditMainStory = useCallback(async (mainStory: Character, sceneId: string) => {
    console.log('========== [useMainStoryHandlers] 编辑主线故事 ==========');
    console.log('[useMainStoryHandlers] handleEditMainStory 调用:', {
      mainStoryId: mainStory.id,
      mainStoryName: mainStory.name,
      sceneId: sceneId,
      userProfile: gameState.userProfile ? {
        id: gameState.userProfile.id,
        nickname: gameState.userProfile.nickname,
        isGuest: gameState.userProfile.isGuest
      } : null,
      timestamp: new Date().toISOString()
    });
    
    if (!gameState.userProfile || gameState.userProfile.isGuest) {
      console.warn('[useMainStoryHandlers] 编辑主线故事失败: 用户未登录或为游客');
      showAlert('请先登录才能编辑主线故事', '需要登录', 'warning');
      return null;
    }
    
    // 返回编辑信息，由调用方设置状态
    return {
      mainStory,
      sceneId
    };
  }, [gameState]);

  return {
    handleSaveMainStory,
    handleDeleteMainStory,
    handleEditMainStory,
  };
};

