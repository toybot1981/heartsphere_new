/**
 * 数据加载 Hook
 * 封装从后端加载世界、场景、角色、剧本、主线剧情等数据的逻辑
 */

import { useCallback, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { worldApi, eraApi, characterApi, scriptApi, userMainStoryApi, journalApi, authApi } from '../services/api';
import { convertErasToWorldScenes } from '../utils/dataTransformers';
import { showAlert } from '../utils/dialog';

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
      dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
      
      // 只有在成功加载数据后才设置标志
      if (userWorldScenes.length > 0) {
        hasLoadedEntryPointData.current = true;
      }
    } catch (error) {
      console.error(`[useDataLoader ${screen}] 加载场景数据失败:`, error);
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
        console.error('[useDataLoader] 用户信息无效或缺少ID:', userInfo);
        throw new Error('无法获取有效的用户信息');
      }
      
      // 获取日记列表
      const journalEntries = await journalApi.getAllJournalEntries(token);
      
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
      
      // 更新日记列表
      dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: journalEntries.map(entry => ({
        id: entry.id, // 直接使用后端返回的字符串id
        title: entry.title,
        content: entry.content,
        timestamp: new Date(entry.entryDate).getTime(),
        imageUrl: '',
        insight: undefined
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
      console.error('[useDataLoader] 登录成功处理失败:', error);
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
      console.error('[useDataLoader checkAuth] 认证检查失败:', error);
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

