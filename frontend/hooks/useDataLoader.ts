/**
 * 数据加载 Hook
 * 封装从后端加载世界、场景、角色、剧本、主线剧情等数据的逻辑
 */

import { useCallback, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { worldApi, eraApi, characterApi, scriptApi, userMainStoryApi, journalApi, authApi, chronosLetterApi } from '../services/api';
import { sharedApi } from '../services/api/heartconnect';
import { convertErasToWorldScenes } from '../utils/dataTransformers';
import { showAlert } from '../utils/dialog';
import { logger } from '../utils/logger';
import { JournalEntry } from '../types';
import { useSharedMode } from './useSharedMode';

/**
 * 数据加载 Hook
 */
export const useDataLoader = () => {
  const { state: gameState, dispatch } = useGameState();
  const hasLoadedEntryPointData = useRef(false);
  const sharedMode = useSharedMode(); // 使用共享模式 hook

  /**
   * 加载并同步世界数据（包括世界、场景、角色、剧本、主线剧情）
   */
  const loadAndSyncWorldData = useCallback(async (token: string, screenName?: string): Promise<void> => {
    const screen = screenName || gameState.currentScreen || 'unknown';
    
    try {
      // 检查是否处于共享模式（通过 hook 状态）
      const isSharedMode = sharedMode.isActive && sharedMode.shareConfig !== null;
      
      logger.info(`[useDataLoader ${screen}] 共享模式状态: isActive=${sharedMode.isActive}, shareConfig=${sharedMode.shareConfig ? '存在' : '不存在'}, shareConfigId=${sharedMode.shareConfig?.id || null}`);
      
      let worlds, eras;
      if (isSharedMode && sharedMode.shareConfig) {
        // 共享模式：调用共享模式专用接口
        logger.info(`[useDataLoader ${screen}] 使用共享模式接口加载数据: shareConfigId=${sharedMode.shareConfig.id}`);
        try {
          worlds = await sharedApi.getSharedWorlds(token);
          eras = await sharedApi.getSharedEras(token);
          logger.info(`[useDataLoader ${screen}] 共享模式数据加载成功: worlds=${worlds?.length || 0}, eras=${eras?.length || 0}`);
        } catch (error) {
          logger.error(`[useDataLoader ${screen}] 共享模式数据加载失败:`, error);
          throw error;
        }
      } else {
        // 正常模式：调用原有接口
        logger.info(`[useDataLoader ${screen}] 使用正常模式接口加载数据`);
        worlds = await worldApi.getAllWorlds(token);
        eras = await eraApi.getAllEras(token);
      }
      
      const characters = await characterApi.getAllCharacters(token);
      const scripts = await scriptApi.getAllScripts(token);
      const userMainStories = await userMainStoryApi.getAll(token);
      
      // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
      const userWorldScenes = convertErasToWorldScenes(
        worlds,
        eras,
        characters,
        scripts,
        userMainStories,
        isSharedMode // 传递共享模式标志
      );
      
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
      const loginTime = Date.now();
      dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: loginTime });
      // 保存到localStorage，避免被状态保存覆盖
      localStorage.setItem('lastLoginTime', loginTime.toString());
      
      // 只有在成功加载数据后才设置标志
      if (userWorldScenes.length > 0) {
        hasLoadedEntryPointData.current = true;
      }
    } catch (error) {
      logger.error(`[useDataLoader ${screen}] 加载场景数据失败`, error);
      // 加载失败时重置标志，允许重试
      hasLoadedEntryPointData.current = false;
      throw error;
    }
  }, [gameState, dispatch, sharedMode]);

  /**
   * 处理登录成功后的数据加载
   * @returns 返回加载的数据和状态信息，用于后续处理（如初始化向导）
   */
  const handleLoginSuccess = useCallback(async (
    method: 'password' | 'wechat',
    identifier: string,
    isFirstLogin?: boolean,
    worlds?: any[]
  ): Promise<{
    userInfo: any;
    journalEntries: any[];
    userWorldScenes: any[];
    newSelectedSceneId: string | null;
    shouldShowInitializationWizard: boolean;
  }> => {
    // 从localStorage获取token（确保token已经保存）
    let token = localStorage.getItem('auth_token');
    
    // 如果token不存在，等待一小段时间后重试（可能是异步保存导致的延迟）
    if (!token) {
      await new Promise(resolve => setTimeout(resolve, 100));
      token = localStorage.getItem('auth_token');
    }
    
    if (!token) {
      throw new Error('无法获取认证令牌');
    }
    
    try {
      // 使用token获取完整用户信息
      const userInfo = await authApi.getCurrentUser(token);
      
      // 安全检查：确保 userInfo 和 userInfo.id 存在
      if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
        logger.error('[useDataLoader] 用户信息无效或缺少ID', userInfo);
        throw new Error('无法获取有效的用户信息');
      }
      
      // 获取日记列表（直接从服务器获取，不使用本地缓存）
      const journalEntries = await journalApi.getAllJournalEntries(token);
      logger.debug(`[useDataLoader] 从服务器加载日志，数量: ${journalEntries.length}`);
      
      // 获取信件列表（只获取用户反馈和管理员回复，不包含AI生成的信件）
      let letters: any[] = [];
      try {
        letters = await chronosLetterApi.getAllLetters(token);
        logger.debug(`[useDataLoader] 加载信件成功，数量: ${letters.length}`);
      } catch (error) {
        logger.error('[useDataLoader] 加载信件失败', error);
        // 信件加载失败不影响登录流程
      }
      
      // 检查是否处于共享模式（通过 hook 状态）
      const isSharedMode = sharedMode.isActive && sharedMode.shareConfig !== null;
      
      logger.info(`[useDataLoader handleLoginSuccess] 共享模式状态: isActive=${sharedMode.isActive}, shareConfig=${sharedMode.shareConfig ? '存在' : '不存在'}, shareConfigId=${sharedMode.shareConfig?.id || null}`);
      
      let remoteWorlds, eras;
      if (isSharedMode && sharedMode.shareConfig) {
        // 共享模式：调用共享模式专用接口
        logger.info(`[useDataLoader handleLoginSuccess] 使用共享模式接口加载数据: shareConfigId=${sharedMode.shareConfig.id}`);
        try {
          remoteWorlds = await sharedApi.getSharedWorlds(token);
          eras = await sharedApi.getSharedEras(token);
          logger.info(`[useDataLoader handleLoginSuccess] 共享模式数据加载成功: worlds=${remoteWorlds?.length || 0}, eras=${eras?.length || 0}`);
        } catch (error) {
          logger.error(`[useDataLoader handleLoginSuccess] 共享模式数据加载失败:`, error);
          throw error;
        }
      } else {
        // 正常模式：调用原有接口
        logger.info(`[useDataLoader handleLoginSuccess] 使用正常模式接口加载数据`);
        remoteWorlds = worlds || await worldApi.getAllWorlds(token);
        eras = await eraApi.getAllEras(token);
      }
      
      // 获取角色列表
      const characters = await characterApi.getAllCharacters(token);
      
      // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
      const userWorldScenes = convertErasToWorldScenes(
        remoteWorlds,
        eras,
        characters,
        undefined, // scripts 在 handleLoginSuccess 中未加载
        undefined,  // mainStories 在 handleLoginSuccess 中未加载
        isSharedMode // 传递共享模式标志
      );
      
      // 更新用户信息和日记列表，使用远程加载的世界数据
      dispatch({ type: 'SET_USER_PROFILE', payload: {
        id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
        nickname: userInfo.nickname || userInfo.username || '用户',
        avatarUrl: userInfo.avatar || '',
        isGuest: false,
        phoneNumber: method === 'password' ? identifier : undefined,
      }});
      
      // 更新日记列表（直接从服务器数据映射，不使用本地缓存）
      const mappedEntries = journalEntries.map(entry => ({
        id: entry.id.toString(),
        title: entry.title,
        content: entry.content,
        timestamp: new Date(entry.entryDate).getTime(),
        imageUrl: entry.imageUrl || undefined,
        insight: entry.insight || undefined,
        tags: entry.tags || undefined,
      }));
      
      logger.debug(`[useDataLoader] 准备dispatch SET_JOURNAL_ENTRIES，数量: ${mappedEntries.length}`);
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntries });
      
      // 更新信件列表（只包含用户反馈和管理员回复）
      dispatch({ type: 'SET_MAILBOX', payload: letters.map(letter => ({
        id: letter.id,
        senderId: letter.senderId,
        senderName: letter.senderName,
        senderAvatarUrl: letter.senderAvatarUrl || '',
        subject: letter.subject,
        content: letter.content,
        timestamp: letter.timestamp,
        isRead: letter.isRead || false,
        themeColor: letter.themeColor || '#8b5cf6',
        type: letter.type || 'user_feedback',
        parentLetterId: letter.parentLetterId
      }))});
      
      // 更新场景列表
      dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
      
      // 更新选中的场景ID
      const currentSelectedSceneId = gameState.selectedSceneId;
      const newSelectedSceneId = userWorldScenes.length > 0 
        ? (currentSelectedSceneId && userWorldScenes.some(scene => scene.id === currentSelectedSceneId) 
          ? currentSelectedSceneId 
            : userWorldScenes[0].id)
        : currentSelectedSceneId;
      if (newSelectedSceneId !== currentSelectedSceneId) {
        dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: newSelectedSceneId });
      }
      
      // 更新其他状态
      dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
      dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
      
      return {
        userInfo,
        journalEntries: mappedEntries,
        userWorldScenes,
        newSelectedSceneId,
        shouldShowInitializationWizard: isFirstLogin || gameState.currentScreen === 'profileSetup'
      };
    } catch (error) {
      logger.error('[useDataLoader] 登录成功处理失败', error);
      throw error;
    }
  }, [dispatch]);

  /**
   * 检查认证状态并加载数据
   */
  const checkAuth = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return false;
    }
    
    try {
      const userInfo = await authApi.getCurrentUser(token);
      if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
        return false;
      }
      
      // 更新用户信息
      dispatch({ type: 'SET_USER_PROFILE', payload: {
        id: userInfo.id,
        username: userInfo.username || '',
        nickname: userInfo.nickname || '',
        email: userInfo.email || undefined,
        avatarUrl: userInfo.avatarUrl || undefined,
        isGuest: false,
        membershipLevel: userInfo.membershipLevel || 'free',
        membershipExpiresAt: userInfo.membershipExpiresAt || undefined,
      }});
      
      return true;
    } catch (error) {
      logger.error('[useDataLoader checkAuth] 认证检查失败', error);
      return false;
    }
  }, [dispatch]);

  /**
   * 重置加载标志
   */
  const resetLoadFlag = useCallback(() => {
    hasLoadedEntryPointData.current = false;
  }, []);

  /**
   * 获取加载标志状态
   */
  const getLoadFlag = useCallback(() => {
    return hasLoadedEntryPointData.current;
  }, []);

  return {
    loadAndSyncWorldData,
    handleLoginSuccess,
    checkAuth,
    resetLoadFlag,
    getLoadFlag,
  };
};

