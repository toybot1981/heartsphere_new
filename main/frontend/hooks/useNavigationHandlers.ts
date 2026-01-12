/**
 * 导航相关操作 Hook
 * 封装场景选择、角色选择、聊天返回等导航逻辑
 */

import { useCallback } from 'react';
import { Character, Message, JournalEntry, JournalEcho } from '../types';
import { useGameState } from '../contexts/GameStateContext';
import { eraApi, characterApi, userMainStoryApi } from '../services/api';
import { sharedApi } from '../services/api/heartconnect';
import { convertBackendCharacterToFrontend, convertBackendMainStoryToCharacter } from '../utils/dataTransformers';
import { showAlert } from '../utils/dialog';
import { WORLD_SCENES } from '../constants';
import { logger } from '../utils/logger';

/**
 * 导航操作 Hook
 */
export const useNavigationHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 执行场景切换
   */
  const performSceneSwitch = useCallback((sceneId: string): void => {
    // 更新UI状态
    dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
    dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
    dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
    dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'characterSelection' });
    
    // 如果是登录用户，异步加载该世界的场景数据
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 使用setTimeout确保在状态更新后执行
      setTimeout(async () => {
        try {
          const userProfile = gameState.userProfile;
          if (userProfile && !userProfile.isGuest) {
            // 找到当前场景对应的世界ID
            const currentScenes = gameState.userWorldScenes && gameState.userWorldScenes.length > 0
              ? [...gameState.userWorldScenes, ...gameState.customScenes]
              : [...gameState.customScenes];
            const selectedScene = currentScenes.find(s => s.id === sceneId);
            const worldId = (selectedScene as { worldId?: number })?.worldId;
            
            if (worldId) {
              logger.debug(`[useNavigationHandlers] 按世界ID加载场景数据: worldId=${worldId}, sceneId=${sceneId}`);
              
              // 异步加载数据
              (async () => {
                try {
                  // 检查是否处于共享模式（通过全局状态）
                  const { getSharedModeState } = await import('../services/api/base/sharedModeState');
                  const sharedModeState = getSharedModeState();
                  // 注意：如果是从用户自己的场景进入（selectedScene存在），说明是自己的世界，应该使用普通API
                  const isSharedMode = sharedModeState.shareConfigId !== null && !selectedScene;
                  
                  // 按世界ID获取场景列表
                  // 优先使用普通API（用户自己的世界），只有在明确的共享模式下才使用共享API
                  const eras = isSharedMode
                    ? await sharedApi.getSharedErasByWorldId(worldId, token)
                    : await eraApi.getErasByWorldId(worldId, token);
                  logger.debug(`[useNavigationHandlers] 获取到场景数据:`, eras);
                  
                  // 按世界ID获取角色列表
                  const characters = await characterApi.getCharactersByWorldId(worldId, token);
                  logger.debug(`[useNavigationHandlers] 获取到角色数据:`, characters);
                  
                  // 加载用户主线故事
                  const userMainStories = await userMainStoryApi.getAll(token);
                  const mainStoriesByEraId = new Map<number, typeof userMainStories[0]>();
                  userMainStories.forEach(mainStory => {
                    const eraId = mainStory.eraId;
                    if (eraId) {
                      mainStoriesByEraId.set(eraId, mainStory);
                    }
                  });
                  
                  // 按场景分组角色
                  const charactersByEraId = new Map<number, typeof characters>();
                  characters.forEach(char => {
                    let eraId = char.eraId;
                    
                    // 如果角色缺少eraId，尝试从场景数据中推断
                    if (!eraId) {
                      // 尝试从场景列表中找到匹配的场景
                      const matchingEra = eras.find(e => {
                        // 如果角色有worldId，匹配worldId和场景
                        return char.worldId && e.worldId === char.worldId;
                      });
                      if (matchingEra) {
                        eraId = matchingEra.id;
                        logger.debug(`[useNavigationHandlers] 为角色 ${char.id} 推断eraId: ${eraId}`);
                      } else {
                        // 如果无法推断，使用当前选中的场景ID（如果它是数字）
                        const sceneIdNum = sceneId ? (isNaN(parseInt(sceneId)) ? null : parseInt(sceneId)) : null;
                        if (sceneIdNum) {
                          eraId = sceneIdNum;
                          logger.debug(`[useNavigationHandlers] 为角色 ${char.id} 使用当前场景ID作为eraId: ${eraId}`);
                        }
                      }
                    }
                    
                    if (eraId) {
                      if (!charactersByEraId.has(eraId)) {
                        charactersByEraId.set(eraId, []);
                      }
                      charactersByEraId.get(eraId)?.push(char);
                    } else {
                      logger.warn('角色数据缺少eraId且无法推断:', char);
                    }
                  });
                  
                  // 更新该世界的场景和角色数据
                  const updatedScenes = (gameState.userWorldScenes || []).map(scene => {
                    // 找到属于当前世界的场景
                    const era = eras.find(e => e.id.toString() === scene.id);
                    if (era) {
                      const eraCharacters = charactersByEraId.get(era.id) || [];
                      const eraMainStory = mainStoriesByEraId.get(era.id);
                      return {
                        ...scene,
                        systemEraId: era.systemEraId || scene.systemEraId || undefined,
                        characters: eraCharacters.map(char => convertBackendCharacterToFrontend(char)),
                        mainStory: eraMainStory ? convertBackendMainStoryToCharacter(eraMainStory) : scene.mainStory
                      };
                    }
                    return scene;
                  });
                  
                  logger.debug(`[useNavigationHandlers] 场景数据更新完成，更新了 ${updatedScenes.length} 个场景`);
                  
                  dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedScenes });
                } catch (error) {
                  logger.error(`[useNavigationHandlers] 加载场景数据失败:`, error);
                }
              })();
            }
          }
        } catch (error) {
          logger.error(`[useNavigationHandlers] 处理失败:`, error);
        }
      }, 0);
    }
  }, [gameState, dispatch]);

  /**
   * 选择场景
   */
  const handleSceneSelect = useCallback((sceneId: string): void => {
    logger.debug('[useNavigationHandlers] 选择场景:', sceneId, '当前选中:', gameState.selectedSceneId);
    performSceneSwitch(sceneId);
  }, [gameState.selectedSceneId, performSceneSwitch]);

  /**
   * 选择角色
   */
  const handleCharacterSelect = useCallback((character: Character): void => {
    if (gameState.activeJournalEntryId) {
      const entry = gameState.journalEntries.find(e => e.id === gameState.activeJournalEntryId);
      if (entry) {
        const contextMsg: Message = {
          id: `ctx_${Date.now()}`,
          role: 'user',
          text: `【系统提示：用户带着一个日记中的问题进入了心域】\n日记标题：${entry.title}\n日记内容：${entry.content}\n\n我的问题是：${entry.content} (请结合你的角色身份给我一些建议或安慰)`,
          timestamp: Date.now()
        };
        dispatch({ type: 'ADD_MESSAGE', payload: { sceneId: character.id, message: contextMsg } });
        dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: character.id });
        dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
        dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
        return;
      }
    }

    dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: character.id });
    dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
    dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
    dispatch({ type: 'SET_CURRENT_SCENARIO_STATE', payload: undefined });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
  }, [gameState.activeJournalEntryId, gameState.journalEntries, dispatch]);

  /**
   * 通过角色名称聊天
   */
  const handleChatWithCharacterByName = useCallback(async (characterName: string): Promise<void> => {
    const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
      ? [...gameState.userWorldScenes, ...gameState.customScenes]
      : [...WORLD_SCENES, ...gameState.customScenes];
    let foundChar: Character | null = null;
    let foundSceneId: string | null = null;

    for (const scene of allScenes) {
      const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
      const char = sceneChars.find(c => c.name === characterName);
      if (char) {
        foundChar = char;
        foundSceneId = scene.id;
        break;
      }
    }

    if (foundChar && foundSceneId) {
      dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: foundSceneId });
      dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: foundChar!.id });
      dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
      dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
    } else {
      showAlert(`无法找到名为 "${characterName}" 的角色。可能该角色所在的场景已被删除。`, '角色未找到', 'warning');
    }
  }, [gameState, dispatch]);

  /**
   * 聊天返回
   */
  const handleChatBack = useCallback((echo?: JournalEcho) => {
    if (echo && gameState.activeJournalEntryId) {
      // 更新日记条目
      const updatedEntries = gameState.journalEntries.map(entry => 
        entry.id === gameState.activeJournalEntryId 
          ? { ...entry, echo: echo } 
          : entry
      );
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: updatedEntries });
      dispatch({ type: 'SET_ACTIVE_JOURNAL_ENTRY_ID', payload: null });
      dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
      dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
      dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'realWorld' });
    } else {
      dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
      dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
      dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
      dispatch({ type: 'SET_CURRENT_SCENARIO_STATE', payload: undefined });
      dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'characterSelection' });
    }
  }, [gameState.activeJournalEntryId, gameState.journalEntries, dispatch]);

  /**
   * 更新对话历史
   */
  const handleUpdateHistory = useCallback((msgs: Message[] | ((prev: Message[]) => Message[])) => {
    if (!gameState.selectedCharacterId) {
      logger.warn('[handleUpdateHistory] selectedCharacterId为空，无法更新history');
      return;
    }
    
    const characterId = gameState.selectedCharacterId;
    
    // 如果msgs是函数，需要先调用它获取实际的数组
    let messagesToSave: Message[];
    if (typeof msgs === 'function') {
      // 获取当前的历史记录（使用最新的state，避免闭包问题）
      const currentHistory = gameState.history[characterId] || [];
      logger.debug('[handleUpdateHistory] 函数式更新 - 当前history:', {
        characterId,
        currentHistoryLength: currentHistory.length,
        currentHistory: currentHistory.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
      });
      
      messagesToSave = msgs(currentHistory);
      
      // 再次检查，确保结果是数组且不包含函数
      if (typeof messagesToSave === 'function' || !Array.isArray(messagesToSave)) {
        logger.error('[handleUpdateHistory] 函数式更新返回了无效值:', messagesToSave);
        messagesToSave = [];
      }
      
      logger.debug('[handleUpdateHistory] 函数式更新 - 新history:', {
        characterId,
        newHistoryLength: messagesToSave.length,
        newHistory: messagesToSave.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
      });
    } else {
      messagesToSave = msgs;
      
      // 验证数组，确保不包含函数
      if (!Array.isArray(messagesToSave)) {
        logger.error('[handleUpdateHistory] msgs不是数组:', messagesToSave);
        messagesToSave = [];
      }
      
      logger.debug('[handleUpdateHistory] 直接更新 - 新history:', {
        characterId,
        newHistoryLength: messagesToSave.length,
        newHistory: messagesToSave.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
      });
    }
    
    // 清理消息数组，移除任何函数或无效项
    const cleanedMessages = messagesToSave.filter(msg => {
      if (typeof msg === 'function') {
        logger.warn('[handleUpdateHistory] 消息数组中包含函数，已移除');
        return false;
      }
      if (!msg || typeof msg !== 'object' || !msg.id || !msg.role || !msg.text) {
        logger.warn('[handleUpdateHistory] 无效的消息，已移除:', msg);
        return false;
      }
      return true;
    }) as Message[];
    
    logger.debug('[handleUpdateHistory] 清理后的消息:', {
      characterId,
      cleanedLength: cleanedMessages.length,
      cleanedMessages: cleanedMessages.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) }))
    });
    
    // 更新对话历史
    const newHistory = { ...gameState.history, [characterId]: cleanedMessages };
    logger.debug('[handleUpdateHistory] 最终保存的history:', {
      characterId,
      allCharacterIds: Object.keys(newHistory),
      messagesForCharacter: newHistory[characterId]?.length || 0,
      allMessages: newHistory[characterId]?.map(m => ({ id: m.id, role: m.role, textPreview: m.text?.substring(0, 30) })) || []
    });
    
    dispatch({ type: 'SET_HISTORY', payload: newHistory });
  }, [gameState.selectedCharacterId, gameState.history, dispatch]);

  /**
   * 处理滚动位置更新
   */
  const handleScrollPositionChange = useCallback((pageKey: string, position: number) => {
    dispatch({ type: 'SET_PAGE_SCROLL_POSITION', payload: { pageId: pageKey, position } });
  }, [dispatch]);

  /**
   * 进入心域
   */
  const handleEnterNexus = useCallback((): void => {
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
  }, [dispatch]);

  /**
   * 进入现实世界
   */
  const handleEnterRealWorld = useCallback((): void => {
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'realWorld' });
  }, [dispatch]);

  /**
   * 使用日记条目探索
   */
  const handleExploreWithEntry = useCallback((entry: JournalEntry): void => {
    dispatch({ type: 'SET_ACTIVE_JOURNAL_ENTRY_ID', payload: entry.id });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' });
  }, [dispatch]);

  return {
    handleSceneSelect,
    performSceneSwitch,
    handleCharacterSelect,
    handleChatWithCharacterByName,
    handleChatBack,
    handleUpdateHistory,
    handleScrollPositionChange,
    handleEnterNexus,
    handleEnterRealWorld,
    handleExploreWithEntry,
  };
};

