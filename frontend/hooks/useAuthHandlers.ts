/**
 * 认证相关处理函数 Hook
 * 封装登录、登出、自动登录检查等逻辑
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { authApi, journalApi, characterApi, worldApi, eraApi, userMainStoryApi } from '../services/api';
import { convertErasToWorldScenes } from '../utils/dataTransformers';
import { showAlert } from '../utils/dialog';
import { GameState } from '../types';
import { useSharedMode } from './useSharedMode';
import { logger } from '../utils/logger';

interface UseAuthHandlersProps {
  setShowLoginModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  pendingActionRef: React.MutableRefObject<() => void>;
  initializationWizardProcessedRef: React.MutableRefObject<boolean>;
  setInitializationData: (data: { token: string; userId: number; worldId: number } | null) => void;
  setShowInitializationWizard: (show: boolean) => void;
  hasLoadedEntryPointData: React.MutableRefObject<boolean>;
}

export const useAuthHandlers = ({
  setShowLoginModal,
  setShowSettingsModal,
  pendingActionRef,
  initializationWizardProcessedRef,
  setInitializationData,
  setShowInitializationWizard,
  hasLoadedEntryPointData,
}: UseAuthHandlersProps) => {
  const { state: gameState, dispatch } = useGameState();
  const sharedMode = useSharedMode();

  // 认证要求检查
  const requireAuth = useCallback((action: () => void) => {
    if (gameState.userProfile?.isGuest) {
      pendingActionRef.current = action;
      setShowLoginModal(true);
    } else {
      action();
    }
  }, [gameState.userProfile?.isGuest, pendingActionRef, setShowLoginModal]);

  // 处理登录成功
  const handleLoginSuccess = useCallback(async (
    method: 'password' | 'wechat',
    identifier: string,
    isFirstLogin?: boolean,
    worlds?: unknown[]
  ): Promise<void> => {
    // 从localStorage获取token（确保token已经保存）
    let token = localStorage.getItem('auth_token');
    logger.debug('[handleLoginSuccess] ========== 开始处理登录成功 ==========');
    logger.debug('[handleLoginSuccess] 方法:', method, '标识:', identifier, '首次登录:', isFirstLogin);
    logger.debug('[handleLoginSuccess] token存在:', !!token);
    if (token) {
      logger.debug('[handleLoginSuccess] token长度:', token.length, 'token前10个字符:', token.substring(0, 10));
    }
    
    // 如果token不存在，等待一小段时间后重试（可能是异步保存导致的延迟）
    if (!token) {
      logger.warn('[handleLoginSuccess] token不存在，等待100ms后重试...');
      await new Promise(resolve => setTimeout(resolve, 100));
      token = localStorage.getItem('auth_token');
      logger.debug('[handleLoginSuccess] 重试后token存在:', !!token);
      if (token) {
        logger.debug('[handleLoginSuccess] 重试后token长度:', token.length, 'token前10个字符:', token.substring(0, 10));
      }
    }
    
    if (token) {
      try {
        logger.debug('[handleLoginSuccess] 准备调用 getCurrentUser，token:', token.substring(0, 20) + '...');
        // 使用token获取完整用户信息
        const userInfo = await authApi.getCurrentUser(token);
        logger.debug('[handleLoginSuccess] getCurrentUser 成功，用户信息:', userInfo);
        
        // 安全检查：确保 userInfo 和 userInfo.id 存在
        if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
          logger.error('用户信息无效或缺少ID:', userInfo);
          throw new Error('无法获取有效的用户信息');
        }
        
        // 获取日记列表
        logger.debug('尝试获取日记列表...');
        const journalEntries = await journalApi.getAllJournalEntries(token);
        logger.debug('获取日记列表成功:', journalEntries);
        
        // 检查是否处于共享模式（通过 hook 状态）
        const isSharedMode = sharedMode.isActive && sharedMode.shareConfig !== null;
        logger.debug(`[handleLoginSuccess] 共享模式状态: isActive=${sharedMode.isActive}, shareConfigId=${sharedMode.shareConfig?.id || null}`);
        
        let remoteWorlds, eras;
        if (isSharedMode) {
          // 共享模式：调用共享模式专用接口
          logger.debug(`[handleLoginSuccess] 使用共享模式接口加载数据: shareConfigId=${shareConfigId}`);
          const { sharedApi } = await import('../services/api/heartconnect');
          remoteWorlds = await sharedApi.getSharedWorlds(token);
          eras = await sharedApi.getSharedEras(token);
          logger.debug(`[handleLoginSuccess] 共享模式数据加载成功: worlds=${remoteWorlds?.length || 0}, eras=${eras?.length || 0}`);
        } else {
          // 正常模式：调用原有接口
          logger.debug('[handleLoginSuccess] 使用正常模式接口加载数据');
          remoteWorlds = worlds || await worldApi.getAllWorlds(token);
          eras = await eraApi.getAllEras(token);
        }
        
        logger.debug('获取世界列表成功:', remoteWorlds);
        logger.debug('获取场景列表成功:', eras);
        
        // 获取角色列表
        const characters = await characterApi.getAllCharacters(token);
        logger.debug('获取角色列表成功:', characters);
        
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
        // 更新用户信息
        dispatch({ type: 'SET_USER_PROFILE', payload: {
            id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
            nickname: userInfo.nickname || userInfo.username || '用户',
            avatarUrl: userInfo.avatar || '',
            isGuest: false,
            phoneNumber: method === 'password' ? identifier : undefined,
        }});
        
        // 更新日记列表（保留所有字段，包括 insight、tags、syncStatus 等）
        dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: journalEntries.map(entry => ({
            id: entry.id, // 直接使用后端返回的字符串id
            title: entry.title,
            content: entry.content,
            timestamp: new Date(entry.entryDate).getTime(),
            imageUrl: entry.imageUrl || '',
            insight: entry.insight || undefined, // 保留 insight 字段
            tags: entry.tags || undefined, // 保留 tags 字段
            syncStatus: 1 as any, // 从服务器加载的数据默认为已同步
            lastSyncTime: Date.now(),
            syncError: undefined,
        }))});
        
        logger.debug('========== [useAuthHandlers] 准备dispatch SET_JOURNAL_ENTRIES (登录成功) ==========');
        logger.debug('[useAuthHandlers] 映射后的条目数量:', journalEntries.length);
        journalEntries.forEach((entry, index) => {
          logger.debug(`[useAuthHandlers] dispatch前的条目 ${index + 1}:`, {
            id: entry.id,
            title: entry.title,
            hasInsight: entry.insight !== undefined && entry.insight !== null,
            insightValue: entry.insight,
            insightLength: entry.insight ? entry.insight.length : 0,
            tags: entry.tags,
            syncStatus: 1,
          });
        });
        logger.debug('========================================================');
        
        // 更新场景列表
        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
        
        // 更新选中的场景ID
        const newSelectedSceneId = userWorldScenes.length > 0 
          ? (gameState.selectedSceneId && userWorldScenes.some(scene => scene.id === gameState.selectedSceneId) 
            ? gameState.selectedSceneId 
              : userWorldScenes[0].id)
          : gameState.selectedSceneId;
        if (newSelectedSceneId !== gameState.selectedSceneId) {
          dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: newSelectedSceneId });
        }
        
        // 更新其他状态
        dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
        const loginTime = Date.now();
        dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: loginTime });
        // 保存到localStorage，避免被状态保存覆盖
        localStorage.setItem('lastLoginTime', loginTime.toString());
        
        // 如果是首次登录，确保跳转到 entryPoint 以显示初始化向导
        // 否则，如果当前在 profileSetup 页面，登录成功后也跳转到 entryPoint
        const newScreen = (isFirstLogin || gameState.currentScreen === 'profileSetup') ? 'entryPoint' : gameState.currentScreen;
        if (newScreen !== gameState.currentScreen) {
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: newScreen });
        }
        
        // 如果是首次登录，显示初始化向导
        if (isFirstLogin && !initializationWizardProcessedRef.current) {
          logger.debug('[初始化向导] ========== 开始初始化向导流程 ==========');
          logger.debug('[初始化向导] isFirstLogin:', isFirstLogin);
          logger.debug('[初始化向导] remoteWorlds:', remoteWorlds);
          logger.debug('[初始化向导] userInfo:', userInfo);
          
          // 标记已处理，防止重复触发
          initializationWizardProcessedRef.current = true;
          
          // 获取用户的世界ID（从远程世界列表中获取第一个，或者创建一个新的）
          let userWorldId: number | null = null;
          if (remoteWorlds && remoteWorlds.length > 0) {
            userWorldId = remoteWorlds[0].id;
            logger.debug('[初始化向导] 从远程世界列表获取 worldId:', userWorldId);
          } else {
            logger.debug('[初始化向导] 远程世界列表为空，尝试创建新世界');
            // 如果没有世界，需要先创建一个（这应该由后端自动创建，但以防万一）
            try {
              const worldName = `${userInfo.nickname || userInfo.username}的世界`;
              logger.debug('[初始化向导] 创建世界，名称:', worldName);
              const newWorld = await worldApi.createWorld(worldName, '', token);
              userWorldId = newWorld.id;
              logger.debug('[初始化向导] 创建世界成功，worldId:', userWorldId);
            } catch (error) {
              logger.error('[初始化向导] 创建世界失败:', error);
              showAlert('无法创建世界，请刷新重试');
              initializationWizardProcessedRef.current = false; // 重置标记
              return;
            }
          }
          
          if (userWorldId) {
            logger.debug('[初始化向导] 准备设置初始化数据');
            logger.debug('[初始化向导] token存在:', !!token);
            logger.debug('[初始化向导] userId:', userInfo.id);
            logger.debug('[初始化向导] worldId:', userWorldId);
            
            const initData = {
              token: token,
              userId: userInfo.id,
              worldId: userWorldId
            };
            
            logger.debug('[初始化向导] 设置 initializationData:', initData);
            setInitializationData(initData);
            
            // 确保 currentScreen 设置为 'entryPoint'，以便初始化向导能够显示
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
            
            logger.debug('[初始化向导] 设置 showInitializationWizard = true');
            setShowInitializationWizard(true);
            
            logger.debug('[初始化向导] ========== 初始化向导流程完成 ==========');
          } else {
            logger.error('[初始化向导] worldId 为空，无法显示初始化向导');
            initializationWizardProcessedRef.current = false; // 重置标记
          }
        } else {
          if (initializationWizardProcessedRef.current) {
            logger.debug('[初始化向导] 已经处理过初始化向导，跳过');
          } else {
            logger.debug('[初始化向导] 非首次登录，跳过初始化向导');
          }
        }
        
        // 标记数据已加载，防止 useEffect 重复加载
        hasLoadedEntryPointData.current = true;
        
        // 后台异步加载远程世界数据，实现本地优先加载
        const loadRemoteWorldData = async (): Promise<void> => {
          try {
            logger.debug('后台加载远程世界数据...');
            
            // 获取世界列表
            const updatedWorlds = await worldApi.getAllWorlds(token);
            
            // 获取场景列表
            const updatedEras = await eraApi.getAllEras(token);
            
            // 获取角色列表
            const updatedCharacters = await characterApi.getAllCharacters(token);
            
            // 将后端数据转换为前端需要的WorldScene格式
            const userWorldScenes: Array<{
              id: string;
              name: string;
              description: string;
              imageUrl: string;
              systemEraId?: number;
              characters: Array<{
                id: string;
                name: string;
                age?: number;
                role?: string;
                bio?: string;
                avatarUrl: string;
                backgroundUrl?: string;
                themeColor: string;
                colorAccent: string;
                firstMessage?: string;
                systemInstruction?: string;
                voiceName: string;
                mbti: string;
                tags: string[];
                speechStyle?: string;
                catchphrases: string[];
                secrets?: string;
                motivations?: string;
                relationships?: string;
              }>;
              scenes: unknown[];
              worldId: number;
            }> = [];
            
            // 按世界分组场景
            const updatedErasByWorldId = new Map<number, typeof updatedEras[0][]>();
            updatedEras.forEach(era => {
              const worldId = era.worldId;
              if (worldId) {
                if (!updatedErasByWorldId.has(worldId)) {
                  updatedErasByWorldId.set(worldId, []);
                }
                updatedErasByWorldId.get(worldId)?.push(era);
              }
            });
            
            // 按场景分组角色
            const updatedCharactersByEraId = new Map<number, typeof updatedCharacters[0][]>();
            updatedCharacters.forEach(char => {
              const eraId = char.eraId;
              if (eraId) {
                if (!updatedCharactersByEraId.has(eraId)) {
                  updatedCharactersByEraId.set(eraId, []);
                }
                updatedCharactersByEraId.get(eraId)?.push(char);
              }
            });
            
            // 创建WorldScene对象
            const updatedUserWorldScenes: typeof userWorldScenes = [];
            updatedWorlds.forEach(world => {
              const worldEras = updatedErasByWorldId.get(world.id) || [];
              
              worldEras.forEach(era => {
                const eraCharacters = updatedCharactersByEraId.get(era.id) || [];
                
                const scene = {
                  id: era.id.toString(),
                  name: era.name,
                  description: era.description,
                  imageUrl: era.imageUrl || '',
                  systemEraId: era.systemEraId || undefined,
                  characters: eraCharacters.map((char) => ({
                    id: char.id.toString(),
                    name: char.name,
                    age: char.age,
                    role: char.role,
                    bio: char.bio,
                    avatarUrl: char.avatarUrl || '',
                    backgroundUrl: char.backgroundUrl || '',
                    themeColor: char.themeColor || 'blue-500',
                    colorAccent: char.colorAccent || '#3b82f6',
                    firstMessage: char.firstMessage || '',
                    systemInstruction: char.systemInstruction || '',
                    voiceName: char.voiceName || 'Aoede',
                    mbti: char.mbti || 'INFJ',
                    tags: char.tags ? (typeof char.tags === 'string' ? char.tags.split(',').filter((tag: string) => tag.trim()) : char.tags) : [],
                    speechStyle: char.speechStyle || '',
                    catchphrases: char.catchphrases ? (typeof char.catchphrases === 'string' ? char.catchphrases.split(',').filter((phrase: string) => phrase.trim()) : char.catchphrases) : [],
                    secrets: char.secrets || '',
                    motivations: char.motivations || '',
                    relationships: char.relationships || ''
                  })),
                  scenes: [],
                  worldId: world.id
                };
                
                updatedUserWorldScenes.push(scene);
              });
            });
            
            // 更新游戏状态，将远程加载的世界数据存储在userWorldScenes中
            dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
            dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
            
            logger.debug('远程世界数据加载完成并更新到本地');
          } catch (error) {
            logger.error('加载远程世界数据失败:', error);
          }
        };
        
        // 在后台定期更新远程数据
        loadRemoteWorldData();
        
        // 首次登录欢迎界面已在上面设置
      } catch (err) {
        logger.error('获取用户信息或日记列表失败:', err);
        // 如果获取失败，使用基本信息
        dispatch({ type: 'SET_USER_PROFILE', payload: {
            id: identifier,
            nickname: identifier,
            avatarUrl: '',
            isGuest: false,
            phoneNumber: method === 'password' ? identifier : undefined,
        }});
        dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: [] });
        dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: !!isFirstLogin });
        const newScreen = gameState.currentScreen === 'profileSetup' ? 'entryPoint' : gameState.currentScreen;
        if (newScreen !== gameState.currentScreen) {
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: newScreen });
        }
      }
    } else {
      // 没有token的情况
      dispatch({ type: 'SET_USER_PROFILE', payload: {
          id: identifier,
          nickname: identifier,
          avatarUrl: '',
          isGuest: false,
          phoneNumber: method === 'password' ? identifier : undefined,
      }});
      dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
      const newScreen = gameState.currentScreen === 'profileSetup' ? 'entryPoint' : gameState.currentScreen;
      if (newScreen !== gameState.currentScreen) {
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: newScreen });
      }
      
      // 如果是首次登录，显示初始化向导（这个分支是token存在但其他数据加载失败的情况）
      if (isFirstLogin && token) {
        logger.debug('[初始化向导] 在else分支中检测到首次登录');
        try {
          // 先获取用户信息
          const userInfo = await authApi.getCurrentUser(token);
          logger.debug('[初始化向导] 获取用户信息成功:', userInfo);
          const remoteWorlds = await worldApi.getAllWorlds(token);
          logger.debug('[初始化向导] 获取世界列表成功:', remoteWorlds);
          let userWorldId: number | null = null;
          if (remoteWorlds && remoteWorlds.length > 0) {
            userWorldId = remoteWorlds[0].id;
            logger.debug('[初始化向导] 从远程世界列表获取 worldId:', userWorldId);
          } else {
            logger.debug('[初始化向导] 远程世界列表为空，尝试创建新世界');
            try {
              const worldName = `${userInfo.nickname || userInfo.username}的世界`;
              const newWorld = await worldApi.createWorld(worldName, '', token);
              userWorldId = newWorld.id;
              logger.debug('[初始化向导] 创建世界成功，worldId:', userWorldId);
            } catch (error) {
              logger.error('[初始化向导] 创建世界失败:', error);
              showAlert('无法创建世界，请刷新重试');
              return;
            }
          }
          
          if (userWorldId) {
            logger.debug('[初始化向导] 设置初始化数据');
            setInitializationData({
              token: token,
              userId: userInfo.id,
              worldId: userWorldId
            });
            setShowInitializationWizard(true);
            logger.debug('[初始化向导] 已设置 showInitializationWizard = true');
          } else {
            logger.error('[初始化向导] worldId 为空，无法显示初始化向导');
          }
        } catch (error) {
          logger.error('[初始化向导] 初始化向导失败:', error);
        }
      }
    }
    
    setShowLoginModal(false);
    
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = () => {};
    }
  }, [
    gameState.selectedSceneId,
    gameState.currentScreen,
    dispatch,
    initializationWizardProcessedRef,
    setInitializationData,
    setShowInitializationWizard,
    hasLoadedEntryPointData,
    setShowLoginModal,
    pendingActionRef,
  ]);

  // 处理登出
  const handleLogout = useCallback((): void => {
    // 清除localStorage中的token
    localStorage.removeItem('auth_token');
    
    // 创建一个干净的状态，只保留设置和全局数据，清除所有用户相关信息
    const nextState: GameState = {
        ...gameState,
        userProfile: null,
        currentScreen: 'profileSetup',
        journalEntries: [],
        selectedSceneId: null,
        selectedCharacterId: null,
        selectedScenarioId: null,
        tempStoryCharacter: null,
        editingScenarioId: null,
        editingScript: null,
        history: {},
        customAvatars: {},
        generatingAvatarId: null,
        activeJournalEntryId: null,
        customCharacters: {},
        customScenarios: [],
        currentScenarioState: undefined,
        mailbox: [],
        sceneMemories: {},
        debugLogs: []
    };
    
    // Update UI immediately
    dispatch({ type: 'BATCH_UPDATE', payload: nextState });
    setShowSettingsModal(false);
  }, [gameState, dispatch, setShowSettingsModal]);

  // 检查本地存储中的token，自动登录并获取日记列表
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      logger.debug('检查本地存储中的token:', token);
      if (token) {
        try {
          logger.debug('尝试自动登录...');
          const userInfo = await authApi.getCurrentUser(token);
          logger.debug('自动登录成功:', userInfo);
          
          // 获取日记列表
          logger.debug('尝试获取日记列表...');
          const journalEntries = await journalApi.getAllJournalEntries(token);
          logger.debug('获取日记列表成功:', journalEntries);
          
          // 检查是否处于共享模式（通过 hook 状态）
          const isSharedMode = sharedMode.isActive && sharedMode.shareConfig !== null;
          logger.debug(`[checkAuth] 共享模式状态: isActive=${sharedMode.isActive}, shareConfigId=${sharedMode.shareConfig?.id || null}`);
          
          let worlds, eras;
          if (isSharedMode) {
            // 共享模式：调用共享模式专用接口
            logger.debug('[checkAuth] 共享模式：使用共享模式接口加载数据');
            const { sharedApi } = await import('../services/api/heartconnect');
            worlds = await sharedApi.getSharedWorlds(token);
            eras = await sharedApi.getSharedEras(token);
            logger.debug(`[checkAuth] 共享模式数据加载成功: worlds=${worlds?.length || 0}, eras=${eras?.length || 0}`);
          } else {
            // 正常模式：调用原有接口
            logger.debug('[checkAuth] 正常模式：使用正常模式接口加载数据');
            worlds = await worldApi.getAllWorlds(token);
            logger.debug('获取世界列表成功:', worlds);
            
            eras = await eraApi.getAllEras(token);
            logger.debug('获取场景列表成功:', eras);
          }
          
          // 获取角色列表
          logger.debug('尝试获取角色列表...');
          const characters = await characterApi.getAllCharacters(token);
          logger.debug('获取角色列表成功:', characters);
          
          // 加载用户主线故事
          const userMainStories = await userMainStoryApi.getAll(token);
          
          // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
          const userWorldScenes = convertErasToWorldScenes(
            worlds,
            eras,
            characters,
            undefined, // scripts 在 checkAuth 中未加载
            userMainStories,
            isSharedMode // 传递共享模式标志
          );
          
          logger.debug('转换后的用户世界场景:', userWorldScenes);
          
          // 安全检查：确保 userInfo 和 userInfo.id 存在
          if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
            logger.error('用户信息无效或缺少ID:', userInfo);
            throw new Error('无法获取有效的用户信息');
          }
          
          dispatch({ type: 'SET_USER_PROFILE', payload: {
              id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
              nickname: userInfo.nickname || userInfo.username || '用户',
              avatarUrl: userInfo.avatar || '',
              isGuest: false,
          }});
          // 更新日记列表（保留所有字段，包括 insight、tags、syncStatus 等）
          const mappedEntries = journalEntries.map(entry => ({
              id: entry.id, // 直接使用后端返回的字符串id
              title: entry.title,
              content: entry.content,
              timestamp: new Date(entry.entryDate).getTime(),
              imageUrl: entry.imageUrl || '',
              insight: entry.insight || undefined, // 保留 insight 字段
              tags: entry.tags || undefined, // 保留 tags 字段
              syncStatus: 1 as 1, // 从服务器加载的数据默认为已同步
              lastSyncTime: Date.now(),
              syncError: undefined,
          }));
          
          logger.debug('========== [useAuthHandlers] 准备dispatch SET_JOURNAL_ENTRIES (微信登录成功) ==========');
          logger.debug('[useAuthHandlers] 映射后的条目数量:', mappedEntries.length);
          mappedEntries.forEach((entry, index) => {
            logger.debug(`[useAuthHandlers] dispatch前的条目 ${index + 1}:`, {
              id: entry.id,
              title: entry.title,
              hasInsight: entry.insight !== undefined && entry.insight !== null,
              insightValue: entry.insight,
              insightLength: entry.insight ? entry.insight.length : 0,
              tags: entry.tags,
              syncStatus: 1,
            });
          });
          logger.debug('========================================================');
          
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: mappedEntries });
          dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
          // 如果有选中的场景ID，确保它存在于后端数据中，否则选择第一个场景
          const newSelectedSceneId = userWorldScenes.length > 0 
            ? (gameState.selectedSceneId && userWorldScenes.some(scene => scene.id === gameState.selectedSceneId) 
              ? gameState.selectedSceneId 
                : userWorldScenes[0].id)
            : gameState.selectedSceneId;
          if (newSelectedSceneId !== gameState.selectedSceneId) {
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: newSelectedSceneId });
          }
          
          // 登录成功后，确保停留在 entryPoint 页面（而不是回到欢迎页面或其他页面）
          // 如果当前在 profileSetup 或没有设置页面，则跳转到 entryPoint
          if (gameState.currentScreen === 'profileSetup' || !gameState.currentScreen) {
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
          }
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          logger.error('自动登录或获取日记失败:', errorMessage);
          // token无效，清除
          localStorage.removeItem('auth_token');
          // 如果之前有用户信息（可能是从localStorage恢复的），也清除
          if (gameState.userProfile && !gameState.userProfile.isGuest) {
              logger.warn('[checkAuth] token无效，清除用户信息');
            dispatch({ type: 'SET_USER_PROFILE', payload: null });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
            dispatch({ type: 'SET_USER_WORLD_SCENES', payload: [] });
            dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: [] });
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: null });
            dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
          }
        }
      } else {
        logger.debug('本地存储中没有找到token，用户未登录');
        // 如果之前有用户信息（可能是从localStorage恢复的），但token不存在，清除用户信息
        if (gameState.userProfile && !gameState.userProfile.isGuest) {
            logger.warn('[checkAuth] token不存在但检测到用户信息，清除用户信息');
          dispatch({ type: 'SET_USER_PROFILE', payload: null });
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
          dispatch({ type: 'SET_USER_WORLD_SCENES', payload: [] });
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: [] });
          dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: null });
          dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
        }
      }
    };
    
    checkAuth();
  }, []); // 只在组件挂载时执行一次

  return {
    requireAuth,
    handleLoginSuccess,
    handleLogout,
  };
};

