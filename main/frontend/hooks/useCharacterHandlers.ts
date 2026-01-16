/**
 * 角色（Character）相关操作 Hook
 * 封装角色的保存、删除等业务逻辑
 */

import { useCallback } from 'react';
import { Character, WorldScene } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { characterApi, worldApi, eraApi, userMainStoryApi, imageApi, scriptApi } from '../services/api';
import { getWorldIdForSceneId } from '../utils/sceneMapping';
import { convertBackendCharacterToFrontend, convertBackendMainStoryToCharacter, convertErasToWorldScenes } from '../utils/dataTransformers';
import { showAlert, showConfirm } from '../utils/dialog';
import { WORLD_SCENES } from '../constants';
import { aiService } from '../services/ai';

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
    const sceneId = gameState.selectedSceneId || editingCharacterSceneId;
    
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
    
    // 直接调用API提交到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
      try {
        
        // 处理头像URL：如果是blob URL或data URL，尝试上传到服务器
        let finalAvatarUrl = newCharacter.avatarUrl;
        if (finalAvatarUrl && (finalAvatarUrl.startsWith('blob:') || finalAvatarUrl.startsWith('data:'))) {
          try {
            // 将blob URL或data URL转换为Blob
            const response = await fetch(finalAvatarUrl);
            const blob = await response.blob();
            const file = new File([blob], `character-${newCharacter.id}-avatar-${Date.now()}.png`, { type: blob.type || 'image/png' });
            
            // 上传到服务器
            const result = await imageApi.uploadImage(file, 'character', token);
            if (result.success && result.url) {
              finalAvatarUrl = result.url;
            } else {
              throw new Error(result.error || '上传头像失败');
            }
          } catch (uploadError) {
            console.warn("[useCharacterHandlers] 上传头像失败:", uploadError);
            throw new Error('上传头像失败，请重试');
          }
        }
        
        // 获取当前场景对应的 worldId 和 eraId
        const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
          ? [...gameState.userWorldScenes, ...gameState.customScenes]
          : [...WORLD_SCENES, ...gameState.customScenes];
        const currentScene = allScenes.find(s => s.id === sceneId);
        const worldId = currentScene?.worldId || getWorldIdForSceneId(sceneId);
        
        // 计算eraId：优先从场景数据中获取有效的eraId
        let eraId: number | null = null;
        
        
        // 提取sceneId中的数字部分（支持 era_193、193 等格式）
        const sceneIdNumericMatch = sceneId ? sceneId.match(/\d+$/) : null;
        const sceneIdNum = sceneIdNumericMatch ? parseInt(sceneIdNumericMatch[0], 10) : null;
        
        if (sceneIdNum !== null) {
          
          // 检查这个ID是否在userWorldScenes中存在（支持 era_193 格式）
          const isValidInUserScenes = gameState.userWorldScenes?.some(s => {
            const sNumericMatch = s.id.match(/\d+$/);
            const sIdNum = sNumericMatch ? parseInt(sNumericMatch[0], 10) : null;
            const matches = sIdNum !== null && sIdNum === sceneIdNum;
            if (matches) {
            }
            return matches;
          });
          
          // 也检查customScenes（支持 era_193 格式）
          const isValidInCustomScenes = gameState.customScenes?.some(s => {
            const sNumericMatch = s.id.match(/\d+$/);
            const sIdNum = sNumericMatch ? parseInt(sNumericMatch[0], 10) : null;
            return sIdNum !== null && sIdNum === sceneIdNum;
          });
          
          if (isValidInUserScenes || isValidInCustomScenes) {
            eraId = sceneIdNum;
          } else {
            // 即使不在列表中，如果sceneId是数字，也使用它（可能是新创建的场景，还没有刷新到列表中）
            eraId = sceneIdNum;
          }
        } else if (currentScene) {
          // 如果场景有systemEraId，尝试找到对应的用户场景ID（支持 era_193 格式）
          if (currentScene.systemEraId) {
            const userEra = gameState.userWorldScenes?.find(s => s.systemEraId === currentScene.systemEraId);
            if (userEra && userEra.id) {
              const sNumericMatch = userEra.id.match(/\d+$/);
              const sIdNum = sNumericMatch ? parseInt(sNumericMatch[0], 10) : null;
              if (sIdNum !== null && !isNaN(sIdNum)) {
                eraId = sIdNum;
              }
            }
          }
          
          // 如果场景ID是数字，使用它（支持 era_193 格式）
          if (!eraId && currentScene.id) {
            const sNumericMatch = currentScene.id.match(/\d+$/);
            const sIdNum = sNumericMatch ? parseInt(sNumericMatch[0], 10) : null;
            if (sIdNum !== null && !isNaN(sIdNum)) {
              eraId = sIdNum;
            }
          }
        }
        
        // 如果仍然没有有效的eraId，尝试从worldId对应的场景中获取第一个有效的eraId（支持 era_193 格式）
        if (!eraId && worldId) {
          const worldScenes = gameState.userWorldScenes?.filter(s => {
            const sWorldId = (s as any).worldId;
            if (!s.id) return false;
            const sNumericMatch = s.id.match(/\d+$/);
            const sIdNum = sNumericMatch ? parseInt(sNumericMatch[0], 10) : null;
            return sWorldId === worldId && sIdNum !== null && !isNaN(sIdNum);
          });
          if (worldScenes && worldScenes.length > 0) {
            const sNumericMatch = worldScenes[0].id.match(/\d+$/);
            const firstValidEraId = sNumericMatch ? parseInt(sNumericMatch[0], 10) : null;
            if (firstValidEraId !== null && !isNaN(firstValidEraId)) {
              eraId = firstValidEraId;
            }
          }
        }
        
        // 如果仍然没有有效的eraId，使用null（让后端处理）
        if (!eraId) {
          console.warn(`[useCharacterHandlers] 无法确定有效的eraId，将使用null。sceneId=${sceneId}, worldId=${worldId}, currentScene存在=${!!currentScene}`);
        }
        
        
        if (isEditingMainStory) {
          // 处理主线故事
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
          }
        } else {
          // 处理角色：直接调用API
          const isNumericId = /^\d+$/.test(newCharacter.id);
          
          if (isNumericId) {
            // 更新现有角色
            const characterId = parseInt(newCharacter.id, 10);
            await characterApi.updateCharacter(characterId, {
              name: newCharacter.name,
              description: newCharacter.bio || newCharacter.description || '',
              age: newCharacter.age,
              gender: newCharacter.role || newCharacter.gender || '',
              worldId: worldId,
              eraId: eraId || null,
              role: newCharacter.role,
              bio: newCharacter.bio,
              avatarUrl: finalAvatarUrl,
              backgroundUrl: newCharacter.backgroundUrl,
              themeColor: newCharacter.themeColor,
              colorAccent: newCharacter.colorAccent,
              firstMessage: newCharacter.firstMessage,
              systemInstruction: newCharacter.systemInstruction,
              voiceName: newCharacter.voiceName,
              mbti: newCharacter.mbti,
              tags: Array.isArray(newCharacter.tags) ? newCharacter.tags.join(',') : newCharacter.tags,
              speechStyle: newCharacter.speechStyle,
              catchphrases: Array.isArray(newCharacter.catchphrases) ? newCharacter.catchphrases.join(',') : newCharacter.catchphrases,
              secrets: newCharacter.secrets,
              motivations: newCharacter.motivations,
              relationships: newCharacter.relationships,
            }, token);
          } else {
            // 创建新角色
            const createdCharacter = await characterApi.createCharacter({
              name: newCharacter.name,
              description: newCharacter.bio || newCharacter.description || '',
              age: newCharacter.age,
              gender: newCharacter.role || newCharacter.gender || '',
              worldId: worldId,
              eraId: eraId || null,
              role: newCharacter.role,
              bio: newCharacter.bio,
              avatarUrl: finalAvatarUrl,
              backgroundUrl: newCharacter.backgroundUrl,
              themeColor: newCharacter.themeColor,
              colorAccent: newCharacter.colorAccent,
              firstMessage: newCharacter.firstMessage,
              systemInstruction: newCharacter.systemInstruction,
              voiceName: newCharacter.voiceName,
              mbti: newCharacter.mbti,
              tags: Array.isArray(newCharacter.tags) ? newCharacter.tags.join(',') : newCharacter.tags,
              speechStyle: newCharacter.speechStyle,
              catchphrases: Array.isArray(newCharacter.catchphrases) ? newCharacter.catchphrases.join(',') : newCharacter.catchphrases,
              secrets: newCharacter.secrets,
              motivations: newCharacter.motivations,
              relationships: newCharacter.relationships,
            }, token);
          }
        }
        
        // 刷新角色列表，更新显示
        const updatedCharacters = await characterApi.getAllCharacters(token);
        
        // 打印新创建/更新的角色信息，用于调试
        if (updatedCharacters.length > 0) {
          updatedCharacters.forEach((char, index) => {
          });
        }
        
        // 重新构建 userWorldScenes，更新角色数据
        const worlds = await worldApi.getAllWorlds(token);
        const eras = await eraApi.getAllEras(token);
        
        // 加载剧本数据，确保剧本内容能正常显示
        const scripts = await scriptApi.getAllScripts(token);
        
        // 使用数据转换工具
        const userMainStories = await userMainStoryApi.getAll(token);
        const updatedUserWorldScenes = convertErasToWorldScenes(
          worlds,
          eras,
          updatedCharacters,
          scripts,
          userMainStories
        );
        
        // 打印转换后的场景信息，用于调试
        updatedUserWorldScenes.forEach((scene, index) => {
          if (scene.characters.length > 0) {
            scene.characters.forEach((char, charIndex) => {
            });
          }
        });
        
        // 保留原有的 memories
        const scenesWithMemories = updatedUserWorldScenes.map(scene => {
          const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
          return {
            ...scene,
            memories: existingScene?.memories
          };
        });
        
        // 清空 customCharacters（不再保存手动添加的内容到本地）
        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
        dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {} });
        
        
        if (onClose) {
          onClose();
        }
      } catch (error: any) {
        console.error(`[useCharacterHandlers] 角色提交失败: ID=${newCharacter.id}`, error);
        const errorMessage = error.message || '未知错误';
        showAlert(`角色提交失败: ${errorMessage}`, '提交失败', 'error');
        throw error; // 重新抛出错误，让调用方知道失败
      }
    } else {
      // 游客模式或未登录，直接关闭
      if (onClose) {
        onClose();
      }
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
        // 更新本地显示（立即反馈）
        dispatch({ type: 'SET_AVATAR', payload: { characterId: character.id, avatarUrl: newAvatarUrl } });
        
        // 上传到服务器（使用character/user分类）
        try {
          let blob: Blob;
          
          if (newAvatarUrl.startsWith('data:')) {
            // Base64 URL
            const response = await fetch(newAvatarUrl);
            blob = await response.blob();
          } else {
            // 通过后端代理下载，然后上传到服务器
            const { imageApi } = await import('../services/api');
            const proxyResult = await imageApi.proxyDownload(newAvatarUrl);
            
            if (proxyResult.success && proxyResult.dataUrl) {
              // 将 data URL 转换为 blob
              const response = await fetch(proxyResult.dataUrl);
              blob = await response.blob();
            } else {
              throw new Error(proxyResult.error || '后端代理下载失败');
            }
          }
          
          const file = new File([blob], `character-${character.id}-avatar-${Date.now()}.png`, { type: blob.type || 'image/png' });
          
          const token = localStorage.getItem('auth_token');
          const result = await imageApi.uploadImage(file, 'character/user', token || undefined);
          
          if (result.success && result.url) {
            // 使用服务器URL，更新角色的头像URL（保存角色）
            const updatedCharacter = { ...character, avatarUrl: result.url };
            await handleSaveCharacter(updatedCharacter);
          } else {
            // 上传失败，使用原始URL，更新角色的头像URL（保存角色）
            const updatedCharacter = { ...character, avatarUrl: newAvatarUrl };
            await handleSaveCharacter(updatedCharacter);
          }
        } catch (uploadError) {
          console.error('上传生成的头像失败:', uploadError);
          // 上传失败，使用原始URL，更新角色的头像URL（保存角色）
          const updatedCharacter = { ...character, avatarUrl: newAvatarUrl };
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

