/**
 * 数据加载 Hook
 * 封装从后端加载世界、场景、角色、剧本、主线剧情等数据的逻辑
 */

import { useCallback, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { worldApi, eraApi, characterApi, scriptApi, userMainStoryApi, journalApi, authApi, chronosLetterApi } from '../services/api';
import { convertErasToWorldScenes } from '../utils/dataTransformers';
import { showAlert } from '../utils/dialog';
import { syncService } from '../services/sync/SyncService';
import { logger } from '../utils/logger';

/**
 * 数据加载 Hook
 */
export const useDataLoader = () => {
  const { state: gameState, dispatch } = useGameState();
  const hasLoadedEntryPointData = useRef(false);

  /**
   * 加载并同步世界数据（包括世界、场景、角色、剧本、主线剧情）
   */
  const loadAndSyncWorldData = useCallback(async (token: string, screenName?: string): Promise<void> => {
    const screen = screenName || gameState.currentScreen || 'unknown';
    
    try {
      const worlds = await worldApi.getAllWorlds(token);
      const eras = await eraApi.getAllEras(token);
      const characters = await characterApi.getAllCharacters(token);
      const scripts = await scriptApi.getAllScripts(token);
      const userMainStories = await userMainStoryApi.getAll(token);
      
      // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
      const userWorldScenes = convertErasToWorldScenes(
        worlds,
        eras,
        characters,
        scripts,
        userMainStories
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
  }, [gameState, dispatch]);

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
      
      // 获取日记列表（使用同步服务：先展示本地缓存，后台查询并更新）
      const tokenForSync = token; // 保存token用于后台查询
      const localJournalEntries = await syncService.queryEntities('journal', token);
      logger.debug(`[useDataLoader] 从本地缓存加载日记，数量: ${localJournalEntries.length}`);
      
      // 获取信件列表（只获取用户反馈和管理员回复，不包含AI生成的信件）
      let letters: any[] = [];
      try {
        letters = await chronosLetterApi.getAllLetters(token);
        logger.debug(`[useDataLoader] 加载信件成功，数量: ${letters.length}`);
      } catch (error) {
        logger.error('[useDataLoader] 加载信件失败', error);
        // 信件加载失败不影响登录流程
      }
      
      // 获取世界列表 (如果登录响应中没有，则单独获取)
      const remoteWorlds = worlds || await worldApi.getAllWorlds(token);
      
      // 获取场景列表
      const eras = await eraApi.getAllEras(token);
      
      // 获取角色列表
      const characters = await characterApi.getAllCharacters(token);
      
      // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
      const userWorldScenes = convertErasToWorldScenes(
        remoteWorlds,
        eras,
        characters,
        undefined, // scripts 在 handleLoginSuccess 中未加载
        undefined  // mainStories 在 handleLoginSuccess 中未加载
      );
      
      // 更新用户信息和日记列表，使用远程加载的世界数据
      dispatch({ type: 'SET_USER_PROFILE', payload: {
        id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
        nickname: userInfo.nickname || userInfo.username || '用户',
        avatarUrl: userInfo.avatar || '',
        isGuest: false,
        phoneNumber: method === 'password' ? identifier : undefined,
      }});
      
      // 更新日记列表（使用本地缓存数据，后台查询会自动更新）
      const mappedEntries = localJournalEntries.map(entry => {
        // 直接使用 entry 的所有字段，不进行选择性映射
        // 这样可以确保所有字段（包括 insight, tags, syncStatus 等）都被保留
        const mapped: JournalEntry = {
          ...entry, // 先展开所有字段
          // 确保必要字段存在
          id: entry.id,
          title: entry.title || '',
          content: entry.content || '',
          timestamp: entry.timestamp || Date.now(),
          imageUrl: entry.imageUrl || '',
          // 保留可选字段（即使为 undefined 也要保留）
          insight: entry.insight !== undefined ? entry.insight : undefined,
          tags: entry.tags !== undefined ? entry.tags : undefined,
          syncStatus: entry.syncStatus !== undefined ? entry.syncStatus : undefined,
          lastSyncTime: entry.lastSyncTime !== undefined ? entry.lastSyncTime : undefined,
          syncError: entry.syncError !== undefined ? entry.syncError : undefined,
        };
        return mapped;
      });
      
      logger.debug(`[useDataLoader] 准备dispatch SET_JOURNAL_ENTRIES，数量: ${mappedEntries.length}`);
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntries });
      
      // 注册查询回调，当后台查询完成时更新状态
      const config = (syncService as any).syncConfigs.get('journal');
      if (config) {
        const originalCallback = config.onEntitiesQueried;
        config.onEntitiesQueried = (entities: any[]) => {
          logger.debug(`[useDataLoader] 后台查询完成，更新日记列表，数量: ${entities.length}`);
          
          const mappedEntities = entities.map(entry => {
            return {
              id: entry.id,
              title: entry.title,
              content: entry.content,
              timestamp: entry.timestamp,
              imageUrl: entry.imageUrl || '',
              insight: entry.insight, // 直接传递，不转换
              tags: entry.tags,
              syncStatus: entry.syncStatus,
              lastSyncTime: entry.lastSyncTime,
              syncError: entry.syncError,
            };
          });
          
          logger.debug(`[useDataLoader] 准备dispatch SET_JOURNAL_ENTRIES (后台查询完成)，数量: ${mappedEntities.length}`);
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntities });
          if (originalCallback) {
            originalCallback(entities);
          }
        };
      }
      
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
        journalEntries,
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

