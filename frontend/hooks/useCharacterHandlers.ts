/**
 * 角色（Character）相关操作 Hook
 * 封装角色的保存、删除等业务逻辑
 */

import { useCallback } from 'react';
import { Character, WorldScene } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { characterApi, worldApi, eraApi, userMainStoryApi, imageApi } from '../services/api';
import { syncService } from '../services/syncService';
import { convertBackendCharacterToFrontend, convertBackendMainStoryToCharacter, convertErasToWorldScenes } from '../utils/dataTransformers';
import { showAlert, showConfirm } from '../utils/dialog';
import { showSyncErrorToast } from '../utils/toast';
import { WORLD_SCENES } from '../constants';
import { aiService } from '../services/ai';
import { imageCacheService } from '../utils/imageCache';

/**
 * 角色操作 Hook
 */
export const useCharacterHandlers = (
  editingCharacterSceneId: string | null,
  editingMainStory: Character | null,
  onClose?: () => void
) => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 保存角色（包括主线故事）
   */
  const handleSaveCharacter = useCallback(async (newCharacter: Character) => {
    console.log("========== [useCharacterHandlers] 保存角色 ==========");
    
    const sceneId = gameState.selectedSceneId || editingCharacterSceneId;
    console.log("[useCharacterHandlers] 角色信息:", {
      id: newCharacter.id,
      idType: typeof newCharacter.id,
      name: newCharacter.name,
      role: newCharacter.role,
      bio: newCharacter.bio ? `长度${newCharacter.bio.length}` : "无",
      avatarUrl: newCharacter.avatarUrl ? "存在" : "无",
      backgroundUrl: newCharacter.backgroundUrl ? "存在" : "无",
      sceneId: sceneId
    });
    
    if (!sceneId) {
      console.error("[useCharacterHandlers] 保存角色失败: 没有场景上下文");
      return;
    }
    
    // 检查是否是编辑主线故事
    const isEditingMainStory = editingMainStory !== null;
    
    // 检查角色ID的来源
    const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
      ? [...gameState.userWorldScenes, ...gameState.customScenes]
      : [...WORLD_SCENES, ...gameState.customScenes];
    const currentScene = allScenes.find(s => s.id === sceneId);
    const existingCharInScene = currentScene?.characters.find(c => c.id === newCharacter.id);
    const existingCharInCustom = (gameState.customCharacters[sceneId] || []).find(c => c.id === newCharacter.id);
    const existingMainStory = currentScene?.mainStory;
    const isEditing = !!(existingCharInScene || existingCharInCustom) || isEditingMainStory;
    
    console.log("[useCharacterHandlers] 角色来源检查:", {
      sceneId: sceneId,
      existingCharInScene: existingCharInScene ? { id: existingCharInScene.id, idType: typeof existingCharInScene.id, name: existingCharInScene.name } : null,
      existingCharInCustom: existingCharInCustom ? { id: existingCharInCustom.id, idType: typeof existingCharInCustom.id, name: existingCharInCustom.name } : null,
      newCharacterId: newCharacter.id,
      newCharacterIdType: typeof newCharacter.id,
      isEditing: isEditing
    });
    
    // 1. 先保存到本地（立即更新UI）
    console.log("[useCharacterHandlers] 步骤1: 保存到本地状态");
    
    if (isEditingMainStory) {
      // 更新主线故事
      const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            mainStory: newCharacter
          };
        }
        return scene;
      });
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
    } else {
      // 更新角色
      const existingCustomChars = gameState.customCharacters[sceneId] || [];
      
      let newChars: Character[] = [];
      if (isEditing) {
        // 更新现有角色
        newChars = existingCustomChars.map(c => c.id === newCharacter.id ? newCharacter : c);
        console.log(`[useCharacterHandlers] 更新角色: ${newCharacter.id}`);
      } else {
        // 添加新角色
        newChars = [...existingCustomChars, newCharacter];
        console.log(`[useCharacterHandlers] 添加新角色: ${newCharacter.id}`);
      }

      console.log(`[useCharacterHandlers] 场景 ${sceneId} 现在有 ${newChars.length} 个角色`);
      dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {
        ...gameState.customCharacters,
        [sceneId]: newChars
      }});
    }
    
    if (onClose) {
      onClose();
    }
    console.log("[useCharacterHandlers] 步骤1完成: 本地状态已更新");

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    console.log(`[useCharacterHandlers] 步骤2: 同步到服务器, token存在=${!!token}, isGuest=${isGuest}`);
    
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
      (async () => {
        try {
          console.log("[useCharacterHandlers] 开始同步角色到服务器");
          
          // 处理头像URL：如果是从本地缓存（blob URL），尝试上传到服务器
          let finalAvatarUrl = newCharacter.avatarUrl;
          if (finalAvatarUrl && finalAvatarUrl.startsWith('blob:')) {
            try {
              console.log("[useCharacterHandlers] 检测到本地缓存头像，尝试上传到服务器");
              finalAvatarUrl = await imageCacheService.uploadAndCache(
                finalAvatarUrl,
                newCharacter.id,
                async (file) => {
                  const result = await imageApi.uploadImage(file, 'character', token);
                  return {
                    success: result.success,
                    url: result.url,
                    error: result.error
                  };
                }
              );
              console.log("[useCharacterHandlers] 头像处理完成，最终URL:", finalAvatarUrl);
            } catch (uploadError) {
              console.warn("[useCharacterHandlers] 上传头像失败，使用本地缓存:", uploadError);
              // 上传失败时保持使用本地缓存URL
            }
          }
          
          // 获取当前场景对应的 worldId 和 eraId
          const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
            ? [...gameState.userWorldScenes, ...gameState.customScenes]
            : [...WORLD_SCENES, ...gameState.customScenes];
          const currentScene = allScenes.find(s => s.id === sceneId);
          const worldId = currentScene?.worldId || syncService.getWorldIdForSceneId(sceneId);
          const eraId = sceneId ? (isNaN(parseInt(sceneId)) ? null : parseInt(sceneId)) : null;
          
          console.log(`[useCharacterHandlers] 同步参数: sceneId=${sceneId}, worldId=${worldId}, eraId=${eraId}`);
          
          if (isEditingMainStory) {
            // 同步主线故事
            const isNumericId = /^\d+$/.test(newCharacter.id);
            if (isNumericId) {
              // 更新现有主线故事
              const mainStoryId = parseInt(newCharacter.id, 10);
              await userMainStoryApi.update(mainStoryId, {
                name: newCharacter.name,
                age: newCharacter.age,
                role: newCharacter.role,
                bio: newCharacter.bio,
                avatarUrl: finalAvatarUrl,
                backgroundUrl: newCharacter.backgroundUrl,
                themeColor: newCharacter.themeColor,
                colorAccent: newCharacter.colorAccent,
                firstMessage: newCharacter.firstMessage,
                systemInstruction: newCharacter.systemInstruction,
                voiceName: newCharacter.voiceName,
                tags: Array.isArray(newCharacter.tags) ? newCharacter.tags.join(',') : newCharacter.tags,
                speechStyle: newCharacter.speechStyle,
                catchphrases: Array.isArray(newCharacter.catchphrases) ? newCharacter.catchphrases.join(',') : newCharacter.catchphrases,
                secrets: newCharacter.secrets,
                motivations: newCharacter.motivations,
              }, token);
              console.log(`[useCharacterHandlers] 主线故事更新成功: ID=${mainStoryId}`);
            } else {
              // 创建新主线故事
              const createdMainStory = await userMainStoryApi.create({
                name: newCharacter.name,
                eraId: eraId || 0,
              }, token);
              
              // 创建后立即更新其他字段
              if (createdMainStory.id) {
                await userMainStoryApi.update(createdMainStory.id, {
                  role: newCharacter.role,
                  bio: newCharacter.bio,
                  avatarUrl: finalAvatarUrl,
                  backgroundUrl: newCharacter.backgroundUrl,
                  themeColor: newCharacter.themeColor,
                  colorAccent: newCharacter.colorAccent,
                  firstMessage: newCharacter.firstMessage,
                  systemInstruction: newCharacter.systemInstruction,
                  voiceName: newCharacter.voiceName,
                  tags: Array.isArray(newCharacter.tags) ? newCharacter.tags.join(',') : newCharacter.tags,
                  speechStyle: newCharacter.speechStyle,
                  catchphrases: Array.isArray(newCharacter.catchphrases) ? newCharacter.catchphrases.join(',') : newCharacter.catchphrases,
                  secrets: newCharacter.secrets,
                  motivations: newCharacter.motivations,
                }, token);
              }
              console.log(`[useCharacterHandlers] 主线故事创建成功: ID=${createdMainStory.id}`);
              
              // 更新本地状态中的主线故事ID
              const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
                if (scene.id === sceneId && scene.mainStory?.id === newCharacter.id) {
                  return {
                    ...scene,
                    mainStory: {
                      ...scene.mainStory,
                      id: createdMainStory.id.toString()
                    }
                  };
                }
                return scene;
              });
              dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
            }
          } else {
            // 同步角色
            const syncResult = await syncService.handleLocalDataChange('character', {
              ...newCharacter,
              avatarUrl: finalAvatarUrl,
              description: newCharacter.bio,
              age: newCharacter.age,
              gender: newCharacter.role,
              worldId: worldId,
              eraId: eraId
            });
          
            // 如果创建了新角色，更新本地状态中的角色ID为服务器返回的数字ID
            if (syncResult && syncResult.id && !isEditing) {
              console.log(`[useCharacterHandlers] 新角色已创建，更新本地ID: ${newCharacter.id} -> ${syncResult.id}`);
              const existingCustomChars = gameState.customCharacters[sceneId] || [];
              const updatedChars = existingCustomChars.map(c => 
                c.id === newCharacter.id 
                  ? { ...c, id: syncResult.id.toString() }
                  : c
              );
              dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {
                ...gameState.customCharacters,
                [sceneId]: updatedChars
              }});
            }
            
            console.log(`[useCharacterHandlers] 角色同步成功: ID=${newCharacter.id}, name=${newCharacter.name}`);
          }
          
          // 3. 刷新角色列表，更新显示
          console.log("[useCharacterHandlers] 步骤3: 刷新角色列表");
          try {
            const updatedCharacters = await characterApi.getAllCharacters(token);
            console.log(`[useCharacterHandlers] 获取到 ${updatedCharacters.length} 个角色`);
            
            // 重新构建 userWorldScenes，更新角色数据
            const worlds = await worldApi.getAllWorlds(token);
            const eras = await eraApi.getAllEras(token);
            
            // 使用数据转换工具
            const userMainStories = await userMainStoryApi.getAll(token);
            const updatedUserWorldScenes = convertErasToWorldScenes(
              worlds,
              eras,
              updatedCharacters,
              undefined, // scripts
              userMainStories
            );
            
            // 保留原有的 memories
            const scenesWithMemories = updatedUserWorldScenes.map(scene => {
              const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
              return {
                ...scene,
                memories: existingScene?.memories
              };
            });
            
            // 更新游戏状态，同时保留 sceneMemories，并清除已同步到后端的角色（避免重复显示）
            // 收集所有已同步到后端的角色信息（用于去重）
            const syncedCharacterIds = new Set<string>();
            const syncedCharacterKeys = new Set<string>(); // 使用 name+avatarUrl 作为唯一标识
            
            scenesWithMemories.forEach(scene => {
              scene.characters.forEach(char => {
                // 如果角色ID是数字字符串，说明已同步到后端
                if (/^\d+$/.test(char.id)) {
                  syncedCharacterIds.add(char.id);
                }
                // 同时记录角色的唯一标识（名称+头像），用于匹配预置角色
                const charKey = `${char.name}|${char.avatarUrl || ''}`;
                syncedCharacterKeys.add(charKey);
              });
            });
            
            // 从 customCharacters 中移除已同步的角色
            const cleanedCustomCharacters: Record<string, Character[]> = {};
            Object.keys(gameState.customCharacters).forEach(sceneId => {
              const sceneChars = gameState.customCharacters[sceneId] || [];
              // 移除已同步的角色：ID是数字且在已同步列表中，或者名称+头像匹配已同步角色
              cleanedCustomCharacters[sceneId] = sceneChars.filter(char => {
                const isSyncedById = /^\d+$/.test(char.id) && syncedCharacterIds.has(char.id);
                const charKey = `${char.name}|${char.avatarUrl || ''}`;
                const isSyncedByKey = syncedCharacterKeys.has(charKey);
                
                if (isSyncedById || isSyncedByKey) {
                  console.log(`[useCharacterHandlers] 从customCharacters中移除已同步的角色: ${char.id} (${char.name})`);
                  return false;
                }
                return true;
              });
            });
            
            dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
            dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: cleanedCustomCharacters });
            
            console.log(`[useCharacterHandlers] 角色列表已刷新，共 ${scenesWithMemories.length} 个场景`);
          } catch (refreshError) {
            console.error("[useCharacterHandlers] 刷新角色列表失败:", refreshError);
            // 刷新失败不影响主流程，只记录错误
          }
        } catch (error: any) {
          console.error(`[useCharacterHandlers] 角色同步失败: ID=${newCharacter.id}`, error);
          // 显示详细的错误信息
          const errorMessage = error.message || '未知错误';
          showAlert(`角色同步失败: ${errorMessage}`, '同步失败', 'error');
          showSyncErrorToast('角色');
        }
      })();
    } else {
      console.log("[useCharacterHandlers] 跳过服务器同步: 未登录或游客模式");
    }
  }, [gameState, dispatch, editingCharacterSceneId, editingMainStory, onClose]);

  /**
   * 删除角色
   */
  const handleDeleteCharacter = useCallback(async (character: Character) => {
    if (!gameState.userProfile || gameState.userProfile.isGuest) {
      showAlert('请先登录才能删除角色', '需要登录', 'warning');
      return;
    }
    
    const confirmed = await showConfirm("确定要删除这个角色吗？删除后将移至回收站，可以随时恢复。", '删除角色', 'warning');
    if (confirmed) {
      const sceneId = gameState.selectedSceneId || editingCharacterSceneId;
      if (!sceneId) {
        console.error('删除角色失败: 没有场景上下文');
        return;
      }

      // 1. 先删除本地（立即更新UI）
      const customChars = gameState.customCharacters[sceneId] || [];
      // 同时更新 userWorldScenes 中的角色列表
      const updatedUserWorldScenes = gameState.userWorldScenes.map(scene => {
        if (scene.id === sceneId) {
          return {
            ...scene,
            characters: scene.characters.filter(c => c.id !== character.id)
          };
        }
        return scene;
      });
      
      dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {
        ...gameState.customCharacters,
        [sceneId]: customChars.filter(c => c.id !== character.id)
      }});
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });

      // 2. 异步同步到服务器（如果已登录且ID是数字）
      const token = localStorage.getItem('auth_token');
      const isNumericId = /^\d+$/.test(character.id);
      if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
        (async () => {
          try {
            const charId = parseInt(character.id, 10);
            await characterApi.deleteCharacter(charId, token);
            console.log('Character deleted from server:', charId);
          } catch (error) {
            console.error('Failed to delete character from server:', error);
            showSyncErrorToast('角色删除');
          }
        })();
      }
    }
  }, [gameState, dispatch, editingCharacterSceneId]);

  /**
   * 生成角色头像
   * 生成后自动下载、上传并更新角色的头像URL
   */
  const handleGenerateAvatar = useCallback(async (character: Character) => {
    if (gameState.generatingAvatarId) return;
    dispatch({ type: 'SET_GENERATING_AVATAR_ID', payload: character.id });
    try {
      // 获取当前场景的世界风格
      const worldStyle = gameState.worldStyle || 'anime';
      
      // 生成头像
      const newAvatarUrl = await aiService.generateCharacterImage(character, worldStyle);
      if (newAvatarUrl) {
        // 缓存生成的头像到本地
        const { imageCacheService } = await import('../utils/imageCache');
        const cachedUrl = await imageCacheService.cacheImage(newAvatarUrl, character.id);
        
        // 更新本地显示（立即反馈）
        dispatch({ type: 'SET_AVATAR', payload: { characterId: character.id, avatarUrl: cachedUrl } });
        
        // 如果返回的是原始URL（非blob URL），说明无法缓存（通常是CORS限制）
        // 直接使用原始URL，不尝试上传
        if (!cachedUrl.startsWith('blob:') && !cachedUrl.startsWith('data:')) {
          // 更新角色的头像URL（保存角色）
          const updatedCharacter = { ...character, avatarUrl: cachedUrl };
          await handleSaveCharacter(updatedCharacter);
          return;
        }
        
        // 上传到服务器（使用character/user分类）
        try {
          let blob: Blob;
          
          // 如果缓存URL是blob URL，直接使用
          if (cachedUrl.startsWith('blob:')) {
            const response = await fetch(cachedUrl);
            blob = await response.blob();
          } else if (cachedUrl.startsWith('data:')) {
            // Base64 URL
            const response = await fetch(cachedUrl);
            blob = await response.blob();
          } else {
            // 这不应该发生，但为了安全起见
            throw new Error('无法获取图片数据');
          }
          
          const file = new File([blob], `character-${character.id}-avatar-${Date.now()}.png`, { type: blob.type || 'image/png' });
          
          const token = localStorage.getItem('auth_token');
          const result = await imageApi.uploadImage(file, 'character/user', token || undefined);
          
          if (result.success && result.url) {
            // 使用服务器URL，更新角色的头像URL（保存角色）
            const updatedCharacter = { ...character, avatarUrl: result.url };
            await handleSaveCharacter(updatedCharacter);
          } else {
            // 上传失败，使用本地缓存，更新角色的头像URL（保存角色）
            const updatedCharacter = { ...character, avatarUrl: cachedUrl };
            await handleSaveCharacter(updatedCharacter);
          }
        } catch (uploadError) {
          console.error('上传生成的头像失败:', uploadError);
          // 上传失败，使用本地缓存，更新角色的头像URL（保存角色）
          const updatedCharacter = { ...character, avatarUrl: cachedUrl };
          await handleSaveCharacter(updatedCharacter);
        }
      }
    } catch (e) {
      console.error("Avatar gen failed", e);
    } finally {
      dispatch({ type: 'SET_GENERATING_AVATAR_ID', payload: null });
    }
  }, [gameState.generatingAvatarId, gameState.worldStyle, dispatch, handleSaveCharacter]);

  return {
    handleSaveCharacter,
    handleDeleteCharacter,
    handleGenerateAvatar,
  };
};

