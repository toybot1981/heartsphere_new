
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { WORLD_SCENES, APP_TITLE } from './constants';
import { ChatWindow } from './components/ChatWindow';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { ErrorBoundary } from './components/ErrorBoundary';
import { UserScriptEditor } from './components/UserScriptEditor';
import { SettingsModal } from './components/SettingsModal';
import { CharacterCard } from './components/CharacterCard';
import { SceneCard } from './components/SceneCard';
import { Character, GameState, Message, CustomScenario, AppSettings, WorldScene, JournalEntry, JournalEcho, Mail, EraMemory, DebugLog } from './types';
import { aiService } from './services/ai/AIService';
import { storageService } from './services/storage';
import { authApi, journalApi, characterApi, scriptApi, worldApi, eraApi, membershipApi, userMainStoryApi } from './services/api';
import { syncService } from './services/sync/SyncService';
import { initSyncConfigs } from './services/sync/syncConfig';
import { EraConstructorModal } from './components/EraConstructorModal';
import { CharacterConstructorModal } from './components/CharacterConstructorModal';
import { MainStoryEditor } from './components/MainStoryEditor';
import { EntryPoint } from './components/EntryPoint';
import { RealWorldScreen } from './components/RealWorldScreen';
import { MailboxModal } from './components/MailboxModal';
import { UnifiedMailboxModal } from './components/mailbox/UnifiedMailboxModal';
import { EraMemoryModal } from './components/EraMemoryModal';
import { Button } from './components/Button';
import { DebugConsole } from './components/DebugConsole';
import { ConnectionSpace } from './components/ConnectionSpace';
import { LoginModal } from './components/LoginModal';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { RecycleBinModal } from './components/RecycleBinModal';
import { MembershipModal } from './components/MembershipModal';
import { GlobalDialogs, showAlert, showConfirm } from './utils/dialog';
import { InitializationWizard } from './components/InitializationWizard';
import { SceneCreationWizard } from './components/SceneCreationWizard';
import { StateManagementTest } from './components/StateManagementTest';
import { GameStateProvider, useGameState } from './contexts/GameStateContext';
import { DEFAULT_GAME_STATE } from './contexts/constants/defaultState';
import { convertErasToWorldScenes, convertBackendMainStoryToCharacter, convertBackendCharacterToFrontend } from './utils/dataTransformers';
import { showSyncErrorToast } from './utils/toast';
import { useEraHandlers } from './hooks/useEraHandlers';
import { useNavigationHandlers } from './hooks/useNavigationHandlers';
import { useMainStoryHandlers } from './hooks/useMainStoryHandlers';
import { useCharacterHandlers } from './hooks/useCharacterHandlers';
import { useDataLoader } from './hooks/useDataLoader';
import { useScriptHandlers } from './hooks/useScriptHandlers';
import { useMemoryHandlers } from './hooks/useMemoryHandlers';
import { useMailHandlers } from './hooks/useMailHandlers';
import { useMirrorHandlers } from './hooks/useMirrorHandlers';
import { checkIsMobile } from './utils/deviceDetection';
import { useModalState } from './hooks/useModalState';
import { useInitializationWizard } from './hooks/useInitializationWizard';
import { useAuthHandlers } from './hooks/useAuthHandlers';
import { useDeviceMode } from './hooks/useDeviceMode';
import { useCharacterSelectionScroll } from './hooks/useCharacterSelectionScroll';
import { useMailCheck } from './hooks/useMailCheck';
import { SceneSelectionScreen } from './components/screens/SceneSelectionScreen';
import { CharacterSelectionScreen } from './components/screens/CharacterSelectionScreen';
import { SharedHeartSphereScreen } from './components/screens/SharedHeartSphereScreen';
import { SharedCharacterSelectionScreen } from './components/screens/SharedCharacterSelectionScreen';
import { SharedChatWindow } from './components/screens/SharedChatWindow';
import { ProfileSetupScreen } from './components/screens/ProfileSetupScreen';
import { UserProfile } from './components/UserProfile';
import { SharedModeBanner } from './components/heartconnect/SharedModeBanner';
import { WarmMessageModal } from './components/heartconnect/WarmMessageModal';
import { useSharedMode } from './hooks/useSharedMode';
import { heartConnectApi } from './services/api/heartconnect';
import { ConnectionRequestModal } from './components/heartconnect/ConnectionRequestModal';
import { getToken } from './services/api/base/tokenStorage';
import type { ShareConfig } from './services/api/heartconnect/types';

// 代码分割：使用动态导入优化大组件
const MobileApp = lazy(() => import('./mobile/MobileApp').then(module => ({ default: module.MobileApp })));

// 加载中组件
const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg">加载中...</p>
    </div>
  </div>
);

// 内部App组件，使用新的状态管理系统
// 注意：此组件必须在 GameStateProvider 内部使用
const AppContent: React.FC = () => {
  
  // --- Device Adaptation & Mode Switching ---
  // checkIsMobile 已移至 utils/deviceDetection.ts
  // 设备模式管理已移至 useDeviceMode Hook

  const EXAMPLE_SCENARIO: CustomScenario = {
      id: 'example_scenario_01',
      sceneId: 'university_era',
      title: '示例剧本：深夜网咖的邂逅',
      description: '在这座城市的霓虹灯下，你走进了一家名为"Binary Beans"的网咖...',
      author: 'System', startNodeId: 'start',
      nodes: {
          'start': { id: 'start', title: '初入网咖', prompt: 'User enters a cyberpunk internet cafe at rainy night. Introduce a mysterious hacker girl (Yuki style) sitting in the corner, looking nervous. The barista asks for the user\'s order.', options: [ { id: 'opt_1', text: '走向那个黑客少女', nextNodeId: 'node_hacker' }, { id: 'opt_2', text: '点一杯咖啡，坐在吧台', nextNodeId: 'node_coffee' } ] },
          'node_hacker': { id: 'node_hacker', title: '黑客的求助', prompt: 'The girl hands over a data chip. "They are watching," she whispers. Suddenly, the cafe lights turn red. Action scene begins.', options: [ { id: 'opt_help', text: '答应帮助她', nextNodeId: 'node_mission_start' }, { id: 'opt_leave', text: '表示对此不感兴趣，离开', nextNodeId: 'start' } ] },
          'node_coffee': { id: 'node_coffee', title: '平静的夜晚', prompt: 'The user sits at the bar. The barista serves a glowing neon coffee. The atmosphere is chill and lo-fi. Nothing dangerous happens, just a conversation.', options: [ { id: 'opt_chat', text: '和咖啡师聊天', nextNodeId: 'node_coffee' }, { id: 'opt_look_around', text: '观察四周', nextNodeId: 'start' } ] },
          'node_mission_start': { id: 'node_mission_start', title: '任务开始', prompt: 'The girl hands over a data chip. "They are watching," she whispers. Suddenly, the cafe lights turn red. Action scene begins.', options: [] }
      }
  };

  // 使用新的状态管理系统
  // 注意：此组件必须在 GameStateProvider 内部使用，否则会抛出错误
  const { state: gameState, dispatch } = useGameState();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 共享模式状态管理
  const { isActive: isSharedModeActive, shareConfig, leaveSharedMode, enterSharedMode } = useSharedMode();
  const [showWarmMessageModal, setShowWarmMessageModal] = useState(false);
  const [selectedSharedScene, setSelectedSharedScene] = useState<WorldScene | null>(null); // 选中的共享场景 
  
  // 初始化加载状态（GameStateProvider会自动加载，这里只是标记本地加载完成）
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // 不再保留示例剧本到本地缓存，所有剧本都从服务器获取
  
  // 兼容层：将旧的setGameState调用转换为dispatch
  // TODO: 逐步替换所有setGameState调用为具体的dispatch action
  const setGameState = useCallback((updater: GameState | ((prev: GameState) => GameState)) => {
    if (typeof updater === 'function') {
      const newState = updater(gameState);
      dispatch({ type: 'BATCH_UPDATE', payload: newState });
    } else {
      dispatch({ type: 'BATCH_UPDATE', payload: updater });
    }
  }, [gameState, dispatch]); 
  
  // 使用 Modal 状态管理 Hook
  const {
    showSettingsModal,
    showEraCreator,
    showCharacterCreator,
    showMainStoryEditor,
    showMailbox,
    showEraMemory,
    showRecycleBin,
    showMembershipModal,
    showLoginModal,
    showSceneCreationWizard,
    setShowSettingsModal,
    setShowEraCreator,
    setShowCharacterCreator,
    setShowMainStoryEditor,
    setShowMailbox,
    setShowEraMemory,
    setShowRecycleBin,
    setShowMembershipModal,
    setShowLoginModal,
    setShowSceneCreationWizard,
    openSettingsModal,
    closeSettingsModal,
    openEraCreator,
    closeEraCreator,
    openCharacterCreator,
    closeCharacterCreator,
    openMainStoryEditor,
    closeMainStoryEditor,
    openMailbox,
    closeMailbox,
    openEraMemory,
    closeEraMemory,
    openRecycleBin,
    closeRecycleBin,
    openMembershipModal,
    closeMembershipModal,
    openLoginModal,
    closeLoginModal,
    openInitializationWizard,
    closeInitializationWizard,
    openSceneCreationWizard,
    closeSceneCreationWizard,
  } = useModalState();
  
  const [editingScene, setEditingScene] = useState<WorldScene | null>(null);
  
  // 使用 Handler Hooks
  const { handleSaveEra: handleSaveEraHook, handleDeleteEra: handleDeleteEraHook } = useEraHandlers(
    editingScene,
    () => {
      closeEraCreator();
      setEditingScene(null);
    }
  );
  const { handleSaveMainStory, handleDeleteMainStory: handleDeleteMainStoryHook, handleEditMainStory: handleEditMainStoryHook } = useMainStoryHandlers();
  const { loadAndSyncWorldData: loadAndSyncWorldDataHook } = useDataLoader();
  const { 
    handleSaveScenario: handleSaveScenarioHook, 
    handleDeleteScenario: handleDeleteScenarioHook, 
    handleEditScenario: handleEditScenarioHook, 
    handlePlayScenario: handlePlayScenarioHook,
    handleEditScript: handleEditScriptHook,
    handleDeleteScript: handleDeleteScriptHook
  } = useScriptHandlers();
  const {
    handleSceneSelect: handleSceneSelectHook,
    handleCharacterSelect: handleCharacterSelectHook,
    handleChatBack: handleChatBackHook,
    handleChatWithCharacterByName: handleChatWithCharacterByNameHook,
    handleUpdateHistory: handleUpdateHistoryHook,
    handleScrollPositionChange: handleScrollPositionChangeHook,
    handleEnterNexus: handleEnterNexusHook,
    handleEnterRealWorld: handleEnterRealWorldHook,
    handleExploreWithEntry: handleExploreWithEntryHook,
  } = useNavigationHandlers();
  
  const [editingMainStory, setEditingMainStory] = useState<Character | null>(null);
  const [editingMainStorySceneId, setEditingMainStorySceneId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingCharacterSceneId, setEditingCharacterSceneId] = useState<string | null>(null);
  const [currentWorldId, setCurrentWorldId] = useState<number | null>(null);

  // 使用 Character Handlers Hook（需要在 editingCharacterSceneId 和 editingMainStory 声明之后）
  const { handleSaveCharacter: handleSaveCharacterHook, handleDeleteCharacter: handleDeleteCharacterHook, handleGenerateAvatar: handleGenerateAvatarHook } = useCharacterHandlers(
    editingCharacterSceneId,
    editingMainStory,
    () => {
      closeCharacterCreator();
      setEditingCharacter(null);
      setEditingCharacterSceneId(null);
      setEditingMainStory(null);
      setEditingMainStorySceneId(null);
    }
  );

  const [memoryScene, setMemoryScene] = useState<WorldScene | null>(null);
  const [currentMembership, setCurrentMembership] = useState<any>(null);
  
  // 使用初始化向导 Hook
  const {
      showInitializationWizard,
    setShowInitializationWizard,
    initializationData,
    setInitializationData,
    initializationWizardProcessedRef,
    shouldShowWizard,
    handleWizardComplete,
    handleWizardCancel,
  } = useInitializationWizard();

  const pendingActionRef = useRef<() => void>(() => {});

  const hasLoadedEntryPointData = useRef(false);

  // 使用认证处理 Hook
  const { requireAuth, handleLoginSuccess, handleLogout } = useAuthHandlers({
    setShowLoginModal,
    setShowSettingsModal,
    pendingActionRef,
    initializationWizardProcessedRef,
    setInitializationData,
    setShowInitializationWizard,
    hasLoadedEntryPointData,
  });
  
  // Use ref to access current gameState in event listeners without stale closures
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

  // 使用设备模式管理 Hook
  const { isMobileMode, handleSwitchToMobile, handleSwitchToPC } = useDeviceMode({
    gameState,
    gameStateRef,
  });

  // 使用滚动位置管理 Hook
  const { scrollRef: characterSelectionScrollRef } = useCharacterSelectionScroll({
    gameState,
    handleScrollPositionChange: handleScrollPositionChangeHook,
  });

  // --- PERSISTENCE LOGIC ---
  // 注意：状态加载和保存已由GameStateProvider处理，这里只需要初始化同步服务

  // 初始化同步配置和自动同步
  useEffect(() => {
    // 初始化同步配置
    initSyncConfigs();
    
    // 初始化场景映射
    (async () => {
      const { initCustomSceneMappings } = await import('./utils/sceneMapping');
      await initCustomSceneMappings();
    })();
    
    // 注意：日志已移除本地缓存同步机制，全部从后台获取
    // 不再启动自动同步，日志保存后直接存储到服务器
  }, []);

  // 检查是否需要导航到共享心域页面
  // 监听导航到共享心域的事件
  const navigateToSharedProcessedRef = useRef<Set<number>>(new Set()); // 用于防止重复处理
  const dispatchRef = useRef(dispatch);
  const enterSharedModeRef = useRef(enterSharedMode);
  
  // 更新 ref，避免闭包问题
  useEffect(() => {
    dispatchRef.current = dispatch;
    enterSharedModeRef.current = enterSharedMode;
  }, [dispatch, enterSharedMode]);
  
  useEffect(() => {
    const handleNavigateToShared = async (event: Event) => {
      const customEvent = event as CustomEvent<{ shareConfigId: number; visitorId: number; shareConfig?: ShareConfig }>;
      if (customEvent.detail) {
        const { shareConfigId, visitorId, shareConfig: providedShareConfig } = customEvent.detail;
        
        // 确保 shareConfigId 存在
        if (!shareConfigId) {
          console.error('[App] handleNavigateToShared: shareConfigId 为空', customEvent.detail);
          return;
        }
        
        // 防止重复处理同一个 shareConfigId
        if (navigateToSharedProcessedRef.current.has(shareConfigId)) {
          return;
        }
        navigateToSharedProcessedRef.current.add(shareConfigId);
        
        // 5秒后清除标记，允许重新处理（防止永久阻塞）
        setTimeout(() => {
          navigateToSharedProcessedRef.current.delete(shareConfigId);
        }, 5000);
        
        try {
          // 如果事件中已经提供了 shareConfig，直接使用；否则通过 shareConfigId 获取
          let shareConfig: ShareConfig;
          if (providedShareConfig) {
            // 确保 shareConfig.id 存在，如果不存在则使用 shareConfigId
            if (!providedShareConfig.id && shareConfigId) {
              shareConfig = { ...providedShareConfig, id: shareConfigId };
              console.warn('[App] handleNavigateToShared: shareConfig.id 为空，使用 shareConfigId:', shareConfigId);
            } else {
              shareConfig = providedShareConfig;
            }
          } else {
            // 如果没有提供 shareConfig，说明已经在 SharedHeartSphereCard 中调用了 enterSharedMode
            // 这里只需要设置屏幕即可
            dispatchRef.current({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
            return;
          }
          
          // 验证 shareConfig.id 是否存在
          if (!shareConfig.id) {
            console.error('[App] handleNavigateToShared: shareConfig.id 仍然为空', shareConfig);
            navigateToSharedProcessedRef.current.delete(shareConfigId);
            return;
          }
          
          
          // 进入共享模式
          enterSharedModeRef.current(shareConfig, visitorId);
          
          
          // 设置屏幕为共享心域页面（移除动画效果，让传送门动画更突出）
          dispatchRef.current({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
          
        } catch (err) {
          console.error('[App] handleNavigateToShared 失败:', err);
          // 处理失败时清除标记，允许重试
          navigateToSharedProcessedRef.current.delete(shareConfigId);
        }
      }
    };

    window.addEventListener('navigateToShared', handleNavigateToShared);
    return () => {
      window.removeEventListener('navigateToShared', handleNavigateToShared);
    };
  }, []); // 空依赖数组，使用 ref 访问最新的函数

  // 更新AI配置（当settings变化时）
  useEffect(() => {
    if (isLoaded) {
      // 更新配置
      aiService.updateConfigFromAppSettings(gameState.settings);
    }
  }, [gameState.settings, isLoaded]);

  // Logging hook
  useEffect(() => {
      const logCallback = (log: DebugLog) => {
          dispatch({ type: 'ADD_DEBUG_LOG', payload: log });
      };
      
      // 设置日志回调
      aiService.setLogCallback(logCallback);
      
      // 清理函数：移除回调，防止内存泄漏
      return () => {
          aiService.setLogCallback(null);
      };
  }, [dispatch]);

  // Responsive adaptation listener 已移至 useDeviceMode Hook 

  // Mail check 已移至 useMailCheck Hook
  useMailCheck({
    isLoaded,
    showInitializationWizard,
  });

  // 当进入entryPoint（我的心域）或sceneSelection（场景选择）时，如果是登录用户，加载并同步场景数据
  useEffect(() => {
    const shouldLoadData = gameState.currentScreen === 'entryPoint' || gameState.currentScreen === 'sceneSelection';
    
    // 重置标志，当离开需要加载数据的页面时
    if (!shouldLoadData) {
      hasLoadedEntryPointData.current = false;
      return;
    }
    
    if (shouldLoadData && gameState.userProfile && !gameState.userProfile.isGuest) {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        // 等待一小段时间，可能是登录流程还未完成
        setTimeout(() => {
          const retryToken = localStorage.getItem('auth_token');
          if (retryToken) {
            // 通过更新 gameState 来重新触发 useEffect
            dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
          } else {
            console.error(`[DataLoader ${gameState.currentScreen}] 重试后token仍不存在，无法加载数据`);
            console.error(`[DataLoader ${gameState.currentScreen}] 检测到用户已登录但token丢失，清除用户信息并提示重新登录`);
            // 如果用户已登录但token丢失，清除用户信息并提示重新登录
            if (gameState.userProfile && !gameState.userProfile.isGuest) {
              dispatch({ type: 'SET_USER_PROFILE', payload: null });
              dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
              dispatch({ type: 'SET_USER_WORLD_SCENES', payload: [] });
              dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: [] });
              dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: null });
              dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
              // 显示提示（使用 showAlert 而不是 alert）
              setTimeout(() => {
                showAlert('登录状态已过期，请重新登录', '登录过期', 'warning');
              }, 100);
            }
          }
        }, 200);
        return;
      }
      
      if (token) {
        // 使用 useDataLoader Hook 加载数据
        const screenName = gameState.currentScreen;
        
        // 如果本地已有数据，先显示本地数据，然后后台同步
        if (gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
          loadAndSyncWorldDataHook(token, screenName).catch(error => {
            console.error(`[DataLoader ${screenName}] 后台同步失败:`, error);
          });
              } else {
          loadAndSyncWorldDataHook(token, screenName).catch(error => {
            console.error(`[DataLoader ${screenName}] 加载失败:`, error);
          });
        }
      }
    }
  }, [gameState.currentScreen, gameState.userProfile]);


  // --- AUTH HELPER ---
  // 认证相关逻辑已移至 useAuthHandlers Hook

  // 关闭欢迎蒙层
  const handleCloseWelcomeOverlay = () => {
    dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
  };

  // 检查本地存储中的token，自动登录并获取日记列表（已移至 useAuthHandlers Hook）
  // checkAuth useEffect 已移至 useAuthHandlers Hook
  // 处理登出（已移至 useAuthHandlers Hook）
  // handleLogout 已移至 useAuthHandlers Hook
  // --- HANDLERS ---
  // handleSwitchToMobile 和 handleSwitchToPC 已移至 useDeviceMode Hook

  const handleGuestEnter = async (nickname: string): Promise<void> => {
    console.log('[App] handleGuestEnter 被调用');
    console.log('[App] 昵称:', nickname);
    console.log('[App] ========== 开始游客登录流程 ==========');
    
    try {
      console.log('[App] 步骤1: 调用游客登录API...');
      // 调用游客登录API（request.ts会自动提取ApiResponse的data部分）
      const responseData = await authApi.guestLogin(nickname);
      console.log('[App] 步骤1完成: 收到登录响应', responseData);
      
      if (!responseData || !responseData.token) {
        console.error('[App] 错误: 未获取到token', responseData);
        return;
      }
      
      console.log('[App] 步骤2: 保存token到localStorage...');
      // 保存token
      localStorage.setItem('auth_token', responseData.token);
      console.log('[App] 步骤2完成: token已保存', responseData.token.substring(0, 20) + '...');
      
      console.log('[App] 步骤3: 获取用户信息...');
      // 获取用户信息
      const userInfo = await authApi.getCurrentUser(responseData.token);
      console.log('[App] 步骤3完成: 用户信息', userInfo);
      
      console.log('[App] 步骤4: 更新用户信息到state...');
      // 更新用户信息
      dispatch({ type: 'SET_USER_PROFILE', payload: {
        id: String(userInfo.id),
        nickname: userInfo.nickname || nickname || '游客',
        avatarUrl: userInfo.avatar || '',
        isGuest: true,
      }});
      console.log('[App] 步骤4完成: 用户信息已更新到state');
      
      // 游客登录后，调用标准API获取场景和角色
      // 后端会根据游客身份自动返回预置场景（ID: 50）和角色（ID: 315-320）
      try {
        const token = responseData.token;
        
        console.log('[App] 步骤5: 调用场景API获取预置场景...');
        // 调用标准API，后端会自动返回游客预置内容
        const eras = await eraApi.getAllEras(token);
        console.log('[App] 步骤5完成: 获取到场景', eras?.length || 0, '个', eras);
        
        console.log('[App] 步骤6: 调用角色API获取预置角色...');
        const characters = await characterApi.getAllCharacters(token);
        console.log('[App] 步骤6完成: 获取到角色', characters?.length || 0, '个', characters);
        
        console.log('[App] 步骤7: 转换场景和角色数据...');
        // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
        const { convertErasToWorldScenes } = await import('./utils/dataTransformers');
        const guestWorldScenes = convertErasToWorldScenes(
          [], // 游客没有worlds
          eras,
          characters,
          undefined, // scripts
          undefined, // mainStories
          false // isSharedMode
        );
        console.log('[App] 步骤7完成: 转换后的场景数据', guestWorldScenes?.length || 0, '个', guestWorldScenes);
        
        console.log('[App] 步骤8: 更新场景列表到state...');
        // 更新场景列表（只包含预置场景）
        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: guestWorldScenes });
        
        // 设置选中的场景（如果有场景，选择第一个）
        if (guestWorldScenes.length > 0) {
          console.log('[App] 步骤9: 设置选中场景', guestWorldScenes[0].id);
          dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: guestWorldScenes[0].id });
        }
        
        console.log('[App] 步骤10: 跳转到entryPoint页面...');
        // 跳转到 entryPoint
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
        dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
        console.log('[App] ========== 游客登录流程完成 ==========');
      } catch (error) {
        console.error('[App] 错误: 加载场景和角色失败', error);
        // 即使加载失败，也要跳转到 entryPoint
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
        dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
      }
    } catch (err: any) {
      console.error('[App] ========== 游客登录流程失败 ==========');
      console.error('[App] 错误详情:', err);
      console.error('[App] 错误堆栈:', err?.stack);
      // 显示错误提示
      alert(err.message || '游客登录失败，请稍后重试');
    }
  };

  // 导航 Handlers 已移至 useNavigationHandlers Hook
  const handleEnterNexus = handleEnterNexusHook;
  const handleEnterRealWorld = handleEnterRealWorldHook;
  const handleSceneSelect = handleSceneSelectHook;
  const handleCharacterSelect = handleCharacterSelectHook;
  const handleChatWithCharacterByName = handleChatWithCharacterByNameHook;
  const handleChatBack = handleChatBackHook;
  const handleUpdateHistory = handleUpdateHistoryHook;
  const handleScrollPositionChange = handleScrollPositionChangeHook;

  // 场景详情页面滚动容器ref 已移至 useCharacterSelectionScroll Hook

  // handleGenerateAvatar 已移至 useCharacterHandlers Hook
  const handleGenerateAvatar = handleGenerateAvatarHook;

  // 使用 Hook 提供的 handlers（保持向后兼容的函数名）
  const handleSaveEra = handleSaveEraHook;
  const handleDeleteEra = handleDeleteEraHook;
  const handleSaveCharacter = handleSaveCharacterHook;
  const handleDeleteCharacter = handleDeleteCharacterHook;

  // 角色 Handlers 已移至 useCharacterHandlers Hook

  // 剧本 Handlers 已移至 useScriptHandlers Hook
  const handleSaveScenario = handleSaveScenarioHook;
  const handleDeleteScenario = handleDeleteScenarioHook;
  const handleEditScenario = handleEditScenarioHook;

  // handleEditMainStory 已移至 useMainStoryHandlers Hook
  const handleEditMainStory = async (mainStory: Character, sceneId: string) => {
    const result = await handleEditMainStoryHook(mainStory, sceneId);
    if (result) {
      try {
        setEditingMainStory(result.mainStory);
        setEditingMainStorySceneId(result.sceneId);
          setShowMainStoryEditor(true);
      } catch (error) {
        console.error('[App] 编辑主线故事出错:', error);
          showAlert('打开编辑器失败，请稍后重试', '错误', 'error');
      }
    }
  };

  // 主线故事 Handlers 已移至 useMainStoryHandlers Hook
  const handleDeleteMainStory = handleDeleteMainStoryHook;

  // handleEditScript 和 handleDeleteScript 已移至 useScriptHandlers Hook
  const handleEditScript = handleEditScriptHook;
  const handleDeleteScript = handleDeleteScriptHook;

  // handlePlayScenario 已移至 useScriptHandlers Hook
  const handlePlayScenario = handlePlayScenarioHook;

  // handleExploreWithEntry 已移至 useNavigationHandlers Hook

  // handleConsultMirror 已移至 useMirrorHandlers Hook
  const { handleConsultMirror: handleConsultMirrorHook } = useMirrorHandlers(requireAuth);
  const handleConsultMirror = handleConsultMirrorHook;

  // handleMarkMailRead 已移至 useMailHandlers Hook
  const { handleMarkMailRead: handleMarkMailReadHook } = useMailHandlers();
  const handleMarkMailRead = handleMarkMailReadHook;

  // handleAddMemory 和 handleDeleteMemory 已移至 useMemoryHandlers Hook
  const { handleAddMemory: handleAddMemoryHook, handleDeleteMemory: handleDeleteMemoryHook } = useMemoryHandlers(memoryScene);
  const handleAddMemory = handleAddMemoryHook;
  const handleDeleteMemory = handleDeleteMemoryHook;

  const openMemoryModal = (e: React.MouseEvent<HTMLButtonElement>, scene: WorldScene): void => {
      e.stopPropagation();
      setMemoryScene(scene);
      setShowEraMemory(true);
  };
  
  const launchEditCharacter = (char: Character, sceneId: string): void => {
      setEditingCharacter(char);
      setEditingCharacterSceneId(sceneId);
      setShowCharacterCreator(true);
  };

  const getEditingCharacterScene = (): WorldScene => {
      if (gameState.selectedSceneId) {
          return currentScenes.find(s => s.id === gameState.selectedSceneId) || currentScenes[0];
      }
      if (editingCharacterSceneId) {
          return currentScenes.find(s => s.id === editingCharacterSceneId) || currentScenes[0];
      }
      if (editingMainStorySceneId) {
          return currentScenes.find(s => s.id === editingMainStorySceneId) || currentScenes[0];
      }
      return currentScenes[0];
  };

  // --- RENDER BLOCK (Must be last) ---  
  
  // 根据用户是否登录，决定使用后端数据还是本地预置数据
  // 使用useMemo优化，避免重复计算
  const currentScenes = useMemo(() => {
    // 如果正在显示初始化向导，返回空数组，避免显示游客预置场景
    if (showInitializationWizard) {
      return [];
    }
    
    // 注释掉：不再使用缓存的 userWorldScenes，强制从数据库获取
    // if (gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes) {
    //   // 登录用户：使用从后端获取的用户专属场景 + 自定义场景（排除已在userWorldScenes中的）
    //   const userWorldSceneIds = new Set(gameState.userWorldScenes.map(s => s.id));
    //   const customScenesOnly = gameState.customScenes.filter(s => !userWorldSceneIds.has(s.id));
    //   return [...gameState.userWorldScenes, ...customScenesOnly];
    // } else {
    //   // 游客：使用本地预置场景 + 自定义场景
    //   return [...WORLD_SCENES, ...gameState.customScenes];
    // }
    
    // 强制从数据库获取：登录用户使用 userWorldScenes（从数据库加载），游客使用预置场景
    if (gameState.userProfile && !gameState.userProfile.isGuest) {
      // 登录用户：只使用从数据库获取的用户专属场景（不再使用本地缓存）
      return gameState.userWorldScenes || []; // 如果为空，说明还在加载中
    } else {
      // 游客：使用本地预置场景（不再使用自定义场景）
      return WORLD_SCENES;
    }
  }, [gameState.userProfile, gameState.userWorldScenes, showInitializationWizard]);
  
  // 为了保持向后兼容，创建一个函数
  const getCurrentScenes = useCallback(() => currentScenes, [currentScenes]);
  
  
  // 注意：移动端现在使用独立的 /mobile.html 页面
  // 这里不再自动切换到移动端，只有用户手动点击按钮才会跳转到 /mobile.html
  // 如果当前路径是 /mobile.html，应该不会加载这个 App.tsx（因为 mobile.html 使用独立的入口）
  // 但为了兼容性，如果检测到是移动设备且当前在根路径，可以提示用户切换到移动版
  // 不过根据需求，PC版本应该始终显示PC界面，所以这里注释掉自动切换逻辑
  // if (isMobileMode) {
  //     return (
  //       <Suspense fallback={<LoadingScreen />}>
  //         <MobileApp onSwitchToPC={handleSwitchToPC} />
  //       </Suspense>
  //     );
  // }

  if (!isLoaded) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading HeartSphere Core...</div>;
  
  // 测试模式：在URL中添加 ?test=state 可以访问状态管理测试页面
  if (typeof window !== 'undefined' && window.location.search.includes('test=state')) {
    return <StateManagementTest />;
  }
  
  const currentSceneLocal = currentScenes.find(s => s.id === gameState.selectedSceneId);
  
  let sceneCharacters: Character[] = [];
  if (currentSceneLocal) {
      // 过滤掉主线故事，避免在角色列表中重复显示
      const mainStoryId = currentSceneLocal.mainStory?.id;
      const filteredCharacters = currentSceneLocal.characters.filter(char => {
          // 如果角色ID与主线故事ID相同，则过滤掉
          if (mainStoryId && char.id === mainStoryId) {
              return false;
          }
          return true;
      });
      sceneCharacters = filteredCharacters; // 不再使用本地缓存的角色
  }

  const allCharacters = currentScenes.reduce((acc, scene) => {
      return [...acc, ...scene.characters]; // 不再使用本地缓存的角色
  }, [] as Character[]);

  let currentCharacterLocal = gameState.tempStoryCharacter || sceneCharacters.find(c => c.id === gameState.selectedCharacterId);
  if (!currentCharacterLocal && currentSceneLocal?.mainStory?.id === gameState.selectedCharacterId) {
      currentCharacterLocal = currentSceneLocal.mainStory;
  }
  
  // 在共享模式下，如果找不到角色，尝试从共享场景的角色中查找
  // 注意：共享场景的角色是通过 API 动态加载的，不在 sceneCharacters 中
  // 这里我们会在 SharedCharacterSelectionScreen 中处理角色选择

  // 从当前场景的 scripts 中查找剧本（不再使用本地缓存的 customScenarios）
  const editingScenarioLocal = gameState.editingScenarioId && currentSceneLocal
    ? currentSceneLocal.scripts?.find(s => String(s.id) === String(gameState.editingScenarioId))
    : null;
  
  const currentScenarioLocal = gameState.selectedScenarioId && currentSceneLocal
    ? currentSceneLocal.scripts?.find(s => {
        const scenarioId = String(s.id);
        const selectedId = String(gameState.selectedScenarioId);
        return scenarioId === selectedId;
      })
    : null;

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-sans text-white">
      
      {showLoginModal && (
            <LoginModal
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => { setShowLoginModal(false); pendingActionRef.current = () => {}; }}
              initialNickname={
                gameState.userProfile?.isGuest 
                    ? gameState.userProfile.nickname 
                    : undefined
              }
            />
          )}

          {/* 欢迎蒙层 */}
          {gameState.showWelcomeOverlay && (
            <WelcomeOverlay onClose={handleCloseWelcomeOverlay} />
          )}

          {/* 初始化向导 - 只在真正需要时显示，且确保不会覆盖正常页面 */}
      {shouldShowWizard && initializationData && (
            <InitializationWizard
              token={initializationData.token}
              userId={initializationData.userId}
              worldId={initializationData.worldId}
            onComplete={handleWizardComplete}
              onCancel={() => {
              handleWizardCancel();
                showAlert('你可以稍后在设置中完成初始化');
              }}
            />
      )}


      {gameState.currentScreen === 'profileSetup' && (
        <ProfileSetupScreen
          onGuestEnter={handleGuestEnter}
          onLogin={() => setShowLoginModal(true)}
        />
      )}

      {gameState.currentScreen === 'entryPoint' && !gameState.showWelcomeOverlay && (() => {
        // 在 entryPoint 渲染时，如果初始化向导不应该显示，立即清理
        if (showInitializationWizard && (!initializationData || !initializationWizardProcessedRef.current)) {
          setShowInitializationWizard(false);
          setInitializationData(null);
          initializationWizardProcessedRef.current = false;
        }
        
        return (
          <EntryPoint 
            onNavigate={(screen) => {
              // 从正常入口进入时，清除共享模式状态（确保查看的是自己的心域）
              if (screen === 'realWorld' || screen === 'sceneSelection') {
                leaveSharedMode();
              }
              dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
            }} 
            nickname={gameState.userProfile?.nickname || ''} 
            avatarUrl={gameState.userProfile?.avatarUrl}
            onOpenSettings={() => setShowSettingsModal(true)}
            onSwitchToMobile={handleSwitchToMobile}
            onLoginSuccess={handleLoginSuccess}
            isGuest={gameState.userProfile?.isGuest || !gameState.userProfile}
            onGuestEnter={async (nickname) => {
              console.log('[游客登录] ========== 开始游客登录流程 ==========');
              console.log('[游客登录] 昵称:', nickname);
              
              try {
                console.log('[游客登录] 步骤1: 调用游客登录API...');
                // 调用游客登录API（request.ts会自动提取ApiResponse的data部分）
                const responseData = await authApi.guestLogin(nickname);
                console.log('[游客登录] 步骤1完成: 收到登录响应', responseData);
                
                if (!responseData || !responseData.token) {
                  console.error('[游客登录] 错误: 未获取到token', responseData);
                  return;
                }
                
                console.log('[游客登录] 步骤2: 保存token到localStorage...');
                // 保存token
                localStorage.setItem('auth_token', responseData.token);
                console.log('[游客登录] 步骤2完成: token已保存', responseData.token.substring(0, 20) + '...');
                
                console.log('[游客登录] 步骤3: 获取用户信息...');
                // 获取用户信息
                const userInfo = await authApi.getCurrentUser(responseData.token);
                console.log('[游客登录] 步骤3完成: 用户信息', userInfo);
                
                console.log('[游客登录] 步骤4: 更新用户信息到state...');
                // 更新用户信息
                dispatch({ type: 'SET_USER_PROFILE', payload: {
                  id: String(userInfo.id),
                  nickname: userInfo.nickname || nickname || '游客',
                  avatarUrl: userInfo.avatar || '',
                  isGuest: true,
                }});
                console.log('[游客登录] 步骤4完成: 用户信息已更新到state');
                
                // 游客登录后，调用标准API获取场景和角色
                // 后端会根据游客身份自动返回预置场景（ID: 50）和角色（ID: 315-320）
                try {
                  const token = responseData.token;
                  
                  console.log('[游客登录] 步骤5: 调用场景API获取预置场景...');
                  // 调用标准API，后端会自动返回游客预置内容
                  const eras = await eraApi.getAllEras(token);
                  console.log('[游客登录] 步骤5完成: 获取到场景', eras?.length || 0, '个', eras);
                  
                  console.log('[游客登录] 步骤6: 调用角色API获取预置角色...');
                  const characters = await characterApi.getAllCharacters(token);
                  console.log('[游客登录] 步骤6完成: 获取到角色', characters?.length || 0, '个', characters);
                  
                  console.log('[游客登录] 步骤7: 转换场景和角色数据...');
                  // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
                  const { convertErasToWorldScenes } = await import('./utils/dataTransformers');
                  const guestWorldScenes = convertErasToWorldScenes(
                    [], // 游客没有worlds
                    eras,
                    characters,
                    undefined, // scripts
                    undefined, // mainStories
                    false // isSharedMode
                  );
                  console.log('[游客登录] 步骤7完成: 转换后的场景数据', guestWorldScenes?.length || 0, '个', guestWorldScenes);
                  
                  console.log('[游客登录] 步骤8: 更新场景列表到state...');
                  // 更新场景列表（只包含预置场景）
                  dispatch({ type: 'SET_USER_WORLD_SCENES', payload: guestWorldScenes });
                  
                  // 设置选中的场景（如果有场景，选择第一个）
                  if (guestWorldScenes.length > 0) {
                    console.log('[游客登录] 步骤9: 设置选中场景', guestWorldScenes[0].id);
                    dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: guestWorldScenes[0].id });
                  }
                  
                  console.log('[游客登录] 步骤10: 跳转到entryPoint页面...');
                  // 跳转到 entryPoint
                  dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
                  dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
                  console.log('[游客登录] ========== 游客登录流程完成 ==========');
                } catch (error) {
                  console.error('[游客登录] 错误: 加载场景和角色失败', error);
                  // 即使加载失败，也要跳转到 entryPoint
                  dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
                  dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
                }
              } catch (err: any) {
                console.error('[游客登录] ========== 游客登录流程失败 ==========');
                console.error('[游客登录] 错误详情:', err);
                console.error('[游客登录] 错误堆栈:', err?.stack);
                // 显示错误提示
                alert(err.message || '游客登录失败，请稍后重试');
              }
            }}
          />
        );
      })()}

      {gameState.currentScreen === 'realWorld' && (
          <RealWorldScreen
            showNoteSync={gameState.settings?.showNoteSync ?? false} 
             entries={gameState.journalEntries}
             onExplore={handleExploreWithEntryHook}
             worldStyle={gameState.worldStyle}
             onChatWithCharacter={handleChatWithCharacterByName}
             onBack={handleEnterNexus}
             onConsultMirror={handleConsultMirror} 
             autoGenerateImage={gameState.settings.autoGenerateJournalImages}
             userName={gameState.userProfile?.nickname}
             isGuest={gameState.userProfile?.isGuest || !gameState.userProfile}
          />
      )}

      {gameState.currentScreen === 'profile' && gameState.userProfile && (
        <UserProfile
          userProfile={gameState.userProfile}
          journalEntries={gameState.journalEntries}
          mailbox={gameState.mailbox}
          history={gameState.history}
          gameState={gameState}
          onOpenSettings={() => setShowSettingsModal(true)}
          onLogout={handleLogout}
          onUpdateProfile={(profile) => {
            dispatch({ type: 'SET_USER_PROFILE', payload: profile });
          }}
          onNavigateToScene={(sceneId) => {
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' });
          }}
          onNavigateToCharacter={(characterId, sceneId) => {
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
            dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: characterId });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
          }}
          onNavigateToJournal={() => {
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'realWorld' });
          }}
          onBack={() => {
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
          }}
          />
      )}

      {gameState.currentScreen === 'connectionSpace' && gameState.userProfile && (
          <ConnectionSpace 
             characters={allCharacters}
             userProfile={gameState.userProfile}
             onBack={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
             onConnect={(character) => {
                 requireAuth(() => {
                    // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
                    const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
                      ? gameState.userWorldScenes
                      : WORLD_SCENES;
                    let sceneId: string | null = null;
                    for (const s of allScenes) {
                        if (s.characters.find(c => c.id === character.id)) {
                            sceneId = s.id;
                            break;
                        }
                    }
                     if (sceneId) {
                         dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
                         dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: character.id });
                         dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'chat' });
                     }
                 });
             }}
          />
      )}


      {gameState.currentScreen === 'sceneSelection' && (
        <SceneSelectionScreen
          gameState={gameState}
          currentScenes={currentScenes}
          onEnterNexus={handleEnterNexus}
          onSceneSelect={handleSceneSelect}
          onEditScene={(scene) => {
            setEditingScene(scene);
            setShowEraCreator(true);
          }}
          onDeleteScene={handleDeleteEra}
          onOpenMemoryModal={openMemoryModal}
          onOpenMailbox={() => setShowMailbox(true)}
          onOpenEraCreator={() => {
                        setEditingScene(null); 
                        setShowEraCreator(true); 
          }}
          onOpenSceneCreationWizard={async () => {
            const token = getToken();
            if (!token || !gameState.userProfile || gameState.userProfile.isGuest) {
              return;
            }
            try {
              const worlds = await worldApi.getAllWorlds(token);
              if (worlds && worlds.length > 0) {
                setCurrentWorldId(worlds[0].id);
                openSceneCreationWizard();
              } else {
                showAlert('请先创建一个世界');
              }
            } catch (error) {
              console.error('获取世界ID失败:', error);
              showAlert('获取世界信息失败，请重试');
            }
          }}
          requireAuth={requireAuth}
          dispatch={dispatch}
        />
      )}

      {/* 共享心域页面 */}
      {gameState.currentScreen === 'sharedHeartSphere' && (
        <SharedHeartSphereScreen
          onSceneSelect={(sceneId) => {
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedCharacterSelection' });
          }}
          onBack={() => {
            // 离开共享模式，统一返回到心域连接页面
            setSelectedSharedScene(null); // 清除选中的共享场景
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
            // 延迟离开共享模式，确保导航先完成
            setTimeout(() => {
              leaveSharedMode();
            }, 100);
          }}
          dispatch={dispatch}
          onSceneObjectSelect={(scene) => {
            // 当选择场景时，保存场景对象
            setSelectedSharedScene(scene);
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: scene.id });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedCharacterSelection' });
          }}
        />
      )}

      {gameState.currentScreen === 'sharedCharacterSelection' && (selectedSharedScene || currentSceneLocal) && (
        <SharedCharacterSelectionScreen
          currentScene={selectedSharedScene || currentSceneLocal!}
          onBack={() => {
            setSelectedSharedScene(null); // 清除选中的共享场景
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
          }}
          onCharacterSelect={(character) => {
            // 在共享模式下，保存选中的角色到 tempStoryCharacter，然后导航到共享聊天页面
            dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: character });
            dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: character.id });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedChat' });
          }}
          scrollRef={characterSelectionScrollRef}
        />
      )}

      {/* 共享模式聊天页面 */}
      {gameState.currentScreen === 'sharedChat' && (currentCharacterLocal || gameState.tempStoryCharacter) && (
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('[App] SharedChatWindow错误:', error, errorInfo);
          }}
        >
          <SharedChatWindow
            character={gameState.tempStoryCharacter || currentCharacterLocal!}
            history={gameState.history[(gameState.tempStoryCharacter || currentCharacterLocal)!.id] || []}
            settings={gameState.settings}
            userProfile={gameState.userProfile!}
            onUpdateHistory={handleUpdateHistory}
            onBack={() => {
              // 返回到角色选择页面，清除临时角色
              dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: null });
              dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedCharacterSelection' });
            }}
          />
        </ErrorBoundary>
      )}

      {gameState.currentScreen === 'characterSelection' && currentSceneLocal && (
        <CharacterSelectionScreen
          gameState={gameState}
          currentScene={currentSceneLocal}
          sceneCharacters={sceneCharacters}
          scrollRef={characterSelectionScrollRef}
          onBack={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
          onCharacterSelect={handleCharacterSelect}
          onEditMainStory={handleEditMainStory}
          onDeleteMainStory={handleDeleteMainStory}
          onAddCharacter={() => {
                            setEditingCharacter(null); 
                            setEditingCharacterSceneId(currentSceneLocal.id); 
                            setShowCharacterCreator(true);
          }}
          onEditCharacter={(c) => {
                                      setEditingCharacter(c);
                                      setEditingCharacterSceneId(currentSceneLocal.id);
                                      setShowCharacterCreator(true);
          }}
          onDeleteCharacter={handleDeleteCharacter}
          onGenerateAvatar={handleGenerateAvatar}
          onPlayScenario={handlePlayScenario}
          onEditScenario={handleEditScenario}
          onDeleteScenario={handleDeleteScenario}
          onEditScript={handleEditScript}
          onDeleteScript={handleDeleteScript}
          onCreateScript={() => {
            const worldId = currentSceneLocal.worldId || null;
            let eraId: number | null = null;
            if (currentSceneLocal.id) {
              const eraIdMatch = currentSceneLocal.id.match(/era_(\d+)/);
              if (eraIdMatch) {
                eraId = parseInt(eraIdMatch[1]);
              } else if (!isNaN(parseInt(currentSceneLocal.id))) {
                eraId = parseInt(currentSceneLocal.id);
              }
            }
            const newScript = {
              id: null,
              title: '',
              description: '',
              content: JSON.stringify({
                startNodeId: 'start',
                nodes: {
                  start: {
                    id: 'start',
                    title: '开始',
                    prompt: '这是故事的开始...',
                    options: []
                  }
                }
              }),
              eraId: eraId,
              worldId: worldId,
              characterIds: null,
              tags: null
            };
            setEditingScene(null);
            dispatch({ type: 'SET_EDITING_SCRIPT', payload: newScript });
          }}
          requireAuth={requireAuth}
          dispatch={dispatch}
        />
      )}

      {gameState.currentScreen === 'chat' && currentCharacterLocal && (
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error('[App] ChatWindow错误:', error, errorInfo);
          }}
        >
          <ChatWindow 
            character={currentCharacterLocal} 
            customScenario={currentScenarioLocal || undefined}
            history={gameState.history[currentCharacterLocal.id] || []}
            scenarioState={gameState.currentScenarioState}
            settings={gameState.settings}
            userProfile={gameState.userProfile!}
            activeJournalEntryId={gameState.activeJournalEntryId}
            onUpdateHistory={handleUpdateHistory}
            onUpdateScenarioState={(nodeId) => {
              const newScenarioState = gameState.currentScenarioState 
                ? { 
                    ...gameState.currentScenarioState, 
                    currentNodeId: nodeId,
                    // 如果没有startTime，设置它
                    startTime: gameState.currentScenarioState.startTime || Date.now(),
                  }
                : { 
                    scenarioId: gameState.selectedScenarioId || '', 
                    currentNodeId: nodeId,
                    startTime: Date.now(),
                  };
              dispatch({ type: 'SET_CURRENT_SCENARIO_STATE', payload: newScenarioState });
            }}
            onUpdateScenarioStateData={(updates) => {
              dispatch({ type: 'UPDATE_SCENARIO_STATE', payload: updates });
            }}
            onBack={handleChatBack}
            participatingCharacters={(() => {
              // 获取参与剧本的角色列表
              if (currentScenarioLocal && currentScenarioLocal.participatingCharacters) {
                // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
      const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
        ? gameState.userWorldScenes
        : WORLD_SCENES;
              const scene = allScenes.find(s => s.id === currentScenarioLocal.sceneId);
              if (scene) {
                const allChars = scene.characters;
                return currentScenarioLocal.participatingCharacters
                  .map(charId => allChars.find(c => c.id === charId))
                  .filter((char): char is Character => char !== undefined);
              }
            }
            return undefined;
          })()}
        />
        </ErrorBoundary>
      )}

      {gameState.currentScreen === 'builder' && (() => {
          // 获取参与剧本的角色列表
          let participatingChars: Character[] = [];
          if (editingScenarioLocal) {
            const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
              ? gameState.userWorldScenes
              : WORLD_SCENES;
            const scene = allScenes.find(s => s.id === editingScenarioLocal.sceneId);
            if (scene) {
              const allChars = scene.characters;
              if (editingScenarioLocal.participatingCharacters) {
                participatingChars = editingScenarioLocal.participatingCharacters
                  .map(charId => allChars.find(c => c.id === charId))
                  .filter((char): char is Character => char !== undefined);
              } else {
                // 如果没有指定参与角色，使用场景中的所有角色
                participatingChars = allChars;
              }
            }
          }
          
          return (
            <ScenarioBuilder 
              initialScenario={editingScenarioLocal}
              onSave={handleSaveScenario}
              onCancel={() => {
                dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'characterSelection' });
                dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: null });
              }}
              sceneId={editingScenarioLocal?.sceneId}
              participatingCharacters={editingScenarioLocal?.participatingCharacters}
              allCharacters={participatingChars}
            />
          );
        })()}

      {/* 用户剧本编辑页面 */}
      {gameState.editingScript && (() => {
          const token = localStorage.getItem('auth_token');
          if (!token) return null;
          
          // 获取所有用户场景（不再使用本地缓存的 customScenes）
          const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
              ? gameState.userWorldScenes
              : WORLD_SCENES;
          
          return (
              <UserScriptEditor
                  script={gameState.editingScript}
                  scenes={allScenes}
                  token={token}
                  onSave={async () => {
                      // 刷新剧本数据
                      try {
                          const scripts = await scriptApi.getAllScripts(token);
                          // 更新场景中的剧本列表
                          const updatedScenes = gameState.userWorldScenes.map(scene => {
                            const sceneScripts = scripts.filter(s => s.eraId?.toString() === scene.id).map(script => ({
                              id: script.id.toString(),
                              title: script.title,
                              description: script.description || null,
                              content: script.content,
                              sceneCount: script.sceneCount || 0,
                              eraId: script.eraId || null,
                              worldId: script.worldId || null,
                              characterIds: script.characterIds || null,
                              tags: script.tags || null
                            }));
                            return {
                              ...scene,
                              scripts: sceneScripts
                            };
                          });
                          dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedScenes });
                          dispatch({ type: 'SET_EDITING_SCRIPT', payload: null });
                      } catch (error) {
                          console.error('刷新剧本数据失败:', error);
                      }
                      dispatch({ type: 'SET_EDITING_SCRIPT', payload: null });
                  }}
                  onCancel={() => {
                      dispatch({ type: 'SET_EDITING_SCRIPT', payload: null });
                  }}
              />
          );
      })()}

      {showSettingsModal && (
        <SettingsModal 
          settings={gameState.settings} 
          gameState={gameState}
          onSettingsChange={(newSettings) => dispatch({ type: 'SET_SETTINGS', payload: newSettings })}
          onUpdateProfile={(profile) => dispatch({ type: 'SET_USER_PROFILE', payload: profile })}
          onClose={() => setShowSettingsModal(false)} 
          onLogout={handleLogout}
          onBindAccount={() => { setShowSettingsModal(false); setShowLoginModal(true); }}
          onOpenRecycleBin={() => setShowRecycleBin(true)}
          onOpenMembership={async () => {
            setShowSettingsModal(false);
            // 加载当前会员信息
            try {
              const token = localStorage.getItem('auth_token');
              if (token) {
                const membership = await membershipApi.getCurrent(token);
                setCurrentMembership(membership);
              }
            } catch (error) {
              console.error('加载会员信息失败:', error);
            }
            setShowMembershipModal(true);
          }}
        />
      )}

      {showMembershipModal && gameState.userProfile && !gameState.userProfile.isGuest && (
        <MembershipModal
          isOpen={showMembershipModal}
          onClose={() => setShowMembershipModal(false)}
          token={localStorage.getItem('auth_token') || ''}
          currentMembership={currentMembership}
        />
      )}


      {showRecycleBin && gameState.userProfile && !gameState.userProfile.isGuest && (
        <RecycleBinModal
          token={localStorage.getItem('auth_token') || ''}
          onClose={() => setShowRecycleBin(false)}
          onRestore={async () => {
            // 恢复后刷新数据
            if (gameState.userProfile && !gameState.userProfile.isGuest) {
              const token = localStorage.getItem('auth_token');
              if (token) {
                try {
                  // 重新加载用户数据
                  const [worlds, eras, characters] = await Promise.all([
                    worldApi.getAllWorlds(token),
                    eraApi.getAllEras(token),
                    characterApi.getAllCharacters(token)
                  ]);
                  
                  // 更新游戏状态
                  const updatedUserWorldScenes = worlds.map(w => ({
                      id: `era_${w.id}`,
                      name: w.name,
                      description: w.description || '',
                      imageUrl: '',
                      characters: []
                  }));
                  const updatedCustomScenes = eras.map(e => ({
                      id: `era_${e.id}`,
                      name: e.name,
                      description: e.description || '',
                      imageUrl: e.imageUrl || '',
                      characters: []
                  }));
                  dispatch({ type: 'SET_USER_WORLD_SCENES', payload: updatedUserWorldScenes });
                  dispatch({ type: 'SET_CUSTOM_SCENES', payload: updatedCustomScenes });
                  dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {} });
                } catch (error) {
                  console.error('刷新数据失败:', error);
                }
              }
            }
          }}
        />
      )}

      {showSceneCreationWizard && currentWorldId && (
        <SceneCreationWizard
          token={getToken() || ''}
          worldId={currentWorldId}
          onComplete={async () => {
            closeSceneCreationWizard();
            setCurrentWorldId(null);
            // 完整刷新所有数据（包括场景、角色、剧本等）
            const token = getToken();
            if (token && gameState.userProfile && !gameState.userProfile.isGuest) {                                                                             
              try {
                // 使用 loadAndSyncWorldData 完整刷新数据，确保角色等关联数据也被加载
                await loadAndSyncWorldDataHook(token, 'sceneCreationWizard');
              } catch (error) {
                console.error('刷新数据失败:', error);
                showAlert('场景创建成功，但刷新数据失败，请刷新页面查看', '提示', 'warning');
              }
            }
          }}
          onCancel={() => {
            closeSceneCreationWizard();
            setCurrentWorldId(null);
          }}
          onOpenEraCreator={() => {
            // 关闭向导，打开创建新场景的模态框
            closeSceneCreationWizard();
            setCurrentWorldId(null);
            setEditingScene(null);
            setShowEraCreator(true);
          }}
        />
      )}

      {showEraCreator && (
          <EraConstructorModal 
             initialScene={editingScene}
             onSave={handleSaveEra}
             onDelete={editingScene ? () => handleDeleteEra(editingScene.id) : undefined}
             onClose={() => { setShowEraCreator(false); setEditingScene(null); }}
             worldStyle={gameState.worldStyle}
             onOpenSceneCreationWizard={async () => {
               const token = getToken();
               if (!token || !gameState.userProfile || gameState.userProfile.isGuest) {
                 return;
               }
               try {
                 const worlds = await worldApi.getAllWorlds(token);
                 if (worlds && worlds.length > 0) {
                   setCurrentWorldId(worlds[0].id);
                   setShowEraCreator(false);
                   setEditingScene(null);
                   openSceneCreationWizard();
                 } else {
                   showAlert('请先创建一个世界');
                 }
               } catch (error) {
                 console.error('获取世界ID失败:', error);
                 showAlert('获取世界信息失败，请重试');
               }
             }}
          />
      )}

      {showCharacterCreator && (
          <CharacterConstructorModal 
             scene={getEditingCharacterScene()}
             initialCharacter={editingCharacter}
             onSave={handleSaveCharacter}
             onClose={() => {
                 setShowCharacterCreator(false);
                 setEditingCharacter(null);
                 setEditingCharacterSceneId(null);
             }}
             worldStyle={gameState.worldStyle}
          />
      )}

      {showMainStoryEditor && editingMainStory && editingMainStorySceneId && (() => {
          const editorScene = currentScenes.find(s => s.id === editingMainStorySceneId) || currentScenes[0];
          if (!editorScene) {
              console.error('[MainStoryEditor] 无法找到场景:', editingMainStorySceneId);
              return null;
          }
          return (
              <MainStoryEditor
                 scene={editorScene}
                 initialMainStory={editingMainStory}
                 onSave={handleSaveCharacter}
                 onClose={() => {
                     setShowMainStoryEditor(false);
                     setEditingMainStory(null);
                     setEditingMainStorySceneId(null);
                 }}
                 worldStyle={gameState.worldStyle}
              />
          );
      })()}

      {showMailbox && (() => {
        const token = localStorage.getItem('auth_token');
        const userId = gameState.userProfile?.id;
        
        // 统一使用新的统一收件箱
        // 如果已登录，传递userId和token；否则传递null，由UnifiedMailboxModal处理
        if (token && userId) {
          return (
            <UnifiedMailboxModal
              token={token}
              currentUserId={userId}
              onClose={() => setShowMailbox(false)}
            />
          );
        }
        
        // 未登录情况：如果使用新的统一信箱，需要登录；否则降级到旧系统
        // 为了更好的体验，提示用户登录
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full text-center">
              <h3 className="text-xl font-bold text-white mb-4">需要登录</h3>
              <p className="text-slate-400 mb-6">
                统一信箱功能需要登录后使用。请先登录账号。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowMailbox(false)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setShowMailbox(false);
                    // 可以触发登录模态框
                    // setShowLoginModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors"
                >
                  去登录
                </button>
              </div>
            </div>
          </div>
        );
      })()}
      
      {showEraMemory && memoryScene && (
          <EraMemoryModal
              scene={memoryScene}
              memories={gameState.sceneMemories[memoryScene.id] || []}
              onAddMemory={handleAddMemory}
              onDeleteMemory={handleDeleteMemory}
              onClose={() => setShowEraMemory(false)}
          />
      )}
      
      {gameState.settings.debugMode && (
          <DebugConsole 
             logs={gameState.debugLogs} 
             onClear={() => dispatch({ type: 'SET_DEBUG_LOGS', payload: [] })}
             onClose={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { debugMode: false } })}
          />
      )}
      
      {/* 全局对话框 */}
      <GlobalDialogs />
      
      {/* 共享模式标识栏 */}
      {isSharedModeActive && shareConfig && (
        <SharedModeBanner
          heartSphereName={shareConfig.shareCode}
          onLeave={() => setShowWarmMessageModal(true)}
        />
      )}
      
      {/* 暖心留言模态框 */}
      <WarmMessageModal
        isOpen={showWarmMessageModal}
        onClose={() => {
          // 先导航到目标页面，再离开共享模式，避免停留在提示页面
          setShowWarmMessageModal(false);
          // 从共享相关页面离开，统一返回到心域连接页面
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
          // 延迟离开共享模式，确保导航先完成
          setTimeout(() => {
            leaveSharedMode();
          }, 100);
        }}
        onSubmit={async (message: string) => {
          if (shareConfig) {
            try {
              await heartConnectApi.createWarmMessage(shareConfig.id, message);
            } catch (err) {
              console.error('发送暖心留言失败:', err);
            }
          }
          // 先导航到目标页面，再离开共享模式，避免停留在提示页面
          setShowWarmMessageModal(false);
          // 从共享相关页面离开，统一返回到心域连接页面
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' });
          // 延迟离开共享模式，确保导航先完成
          setTimeout(() => {
            leaveSharedMode();
          }, 100);
        }}
      />
      
    </div>
  );
};

// 主App组件，提供状态管理Context
const App: React.FC = () => {
  // 检查是否是手机版路径 /mobile 或 mobile.html
  const pathname = window.location.pathname;
  const isMobilePath = pathname.includes('/mobile') || pathname.includes('mobile.html');
  if (isMobilePath) {
    // 手机版有独立的入口文件 mobile.html，这里不应该被访问到
    // 但如果通过其他方式访问，重定向到 mobile.html
    if (!pathname.includes('mobile.html')) {
      window.location.href = '/mobile.html';
      return null;
    }
  }


  // 检查是否是分享页面路径 /share/:shareCode
  const shareMatch = pathname.match(/^\/share\/(.+)$/);
  if (shareMatch) {
    const shareCode = shareMatch[1];
    // 使用简化的SharePage（不依赖React Router）
    return <SharePageSimple shareCode={shareCode} />;
  }
  
  // 测试路由：用于测试状态管理系统
  // StateManagementTest 内部已经有自己的 GameStateProvider，不需要重复包裹
  if (new URLSearchParams(window.location.search).get('test') === 'state') {
    return <StateManagementTest />;
  }

  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
};

// 简化版分享页面（不依赖React Router）
const SharePageSimple: React.FC<{ shareCode: string }> = ({ shareCode }) => {
  return <SharePageContentSimple shareCode={shareCode} />;
};

// 分享页面内容（不依赖React Router）
const SharePageContentSimple: React.FC<{ shareCode: string }> = ({ shareCode }) => {
  const [shareConfig, setShareConfig] = useState<ShareConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const { enterSharedMode } = useSharedMode();
  
  useEffect(() => {
    loadShareConfig();
  }, [shareCode]);
  
  const loadShareConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await heartConnectApi.getShareConfigByCode(shareCode);
      setShareConfig(config);
      
      // 如果是自由连接，尝试自动进入共享模式
      if (config.accessPermission === 'free') {
        const token = getToken();
        if (token) {
          try {
            // 尝试从 API 获取用户信息
            const currentUser = await authApi.getCurrentUser(token);
            if (currentUser && currentUser.id) {
              enterSharedMode(config, currentUser.id);
              // 先触发导航事件，然后再跳转，确保事件监听器能接收到
              window.dispatchEvent(new CustomEvent('navigateToShared', { 
                detail: { shareConfigId: config.id, visitorId: currentUser.id, shareConfig: config } 
              }));
              // 延迟一小段时间，确保事件被处理
              setTimeout(() => {
                window.location.href = '/';
              }, 100);
              return;
            }
          } catch (err) {
            console.warn('获取用户信息失败，将显示手动进入按钮:', err);
            // 如果获取用户信息失败，继续显示页面，让用户手动点击进入
          }
        } else {
          setError('请先登录后再访问');
        }
      } else {
        // 需要审批，显示请求模态框
        setShowRequestModal(true);
      }
    } catch (err: any) {
      console.error('加载共享配置失败:', err);
      setError(err.response?.data?.message || '加载失败，请检查共享码是否正确');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEnterExperience = async () => {
    if (!shareConfig) return;
    
    const token = getToken();
    if (!token) {
      setError('请先登录后再访问');
      return;
    }
    
    try {
      const currentUser = await authApi.getCurrentUser(token);
      if (currentUser && currentUser.id) {
        enterSharedMode(shareConfig, currentUser.id);
        // 先触发导航事件，然后再跳转，确保事件监听器能接收到
        window.dispatchEvent(new CustomEvent('navigateToShared', { 
          detail: { shareConfigId: shareConfig.id, visitorId: currentUser.id, shareConfig: shareConfig } 
        }));
        // 延迟一小段时间，确保事件被处理
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        setError('无法获取用户信息，请重新登录');
      }
    } catch (err: any) {
      console.error('进入共享模式失败:', err);
      setError('进入共享模式失败，请稍后重试');
    }
  };
  
  const getCurrentUserId = (): number | null => {
    const token = getToken();
    if (!token) return null;
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.id || null;
      } catch {
        return null;
      }
    }
    return null;
  };
  
  const handleRequestSuccess = () => {
    if (shareConfig) {
      const userId = getCurrentUserId();
      if (userId) {
        enterSharedMode(shareConfig, userId);
        alert('连接请求已发送，等待主人审批后即可进入共享心域');
        window.dispatchEvent(new CustomEvent('navigateToShared', { 
          detail: { shareConfigId: shareConfig.id, visitorId: userId } 
        }));
        window.location.href = '/';
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">加载中...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
        <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <h2 className="text-white text-xl font-bold mb-2">访问失败</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!shareConfig) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 rounded-lg p-8 mb-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-4">
                {shareConfig.description || '心域分享'}
              </h1>
              <p className="text-gray-400 mb-6">
                共享码: <span className="font-mono text-blue-400">{shareConfig.shareCode}</span>
              </p>
              
              {shareConfig.coverImageUrl && (
                <img
                  src={shareConfig.coverImageUrl}
                  alt="心域封面"
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div>
                  <span className="text-white font-semibold">{shareConfig.viewCount || 0}</span> 次查看
                </div>
                <div>
                  <span className="text-white font-semibold">{shareConfig.requestCount || 0}</span> 次请求
                </div>
                <div>
                  <span className="text-white font-semibold">{shareConfig.approvedCount || 0}</span> 已批准
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-6 mb-6">
            <h3 className="text-white font-semibold mb-3">访问权限</h3>
            {shareConfig.accessPermission === 'free' ? (
              <p className="text-gray-400">自由连接 - 可以直接进入体验</p>
            ) : (
              <p className="text-gray-400">需要审批 - 主人同意后才能进入</p>
            )}
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回首页
            </button>
            {shareConfig.accessPermission === 'free' && (
              <button
                onClick={handleEnterExperience}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all font-semibold shadow-lg"
              >
                进入体验
              </button>
            )}
            {shareConfig.accessPermission === 'approval' && (
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                请求连接
              </button>
            )}
          </div>
        </div>
      </div>
      
      {shareConfig.accessPermission === 'approval' && (
        <ConnectionRequestModal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          shareCode={shareCode}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};

export default App;