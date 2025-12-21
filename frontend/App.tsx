
import React, { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { WORLD_SCENES, APP_TITLE } from './constants';
import { ChatWindow } from './components/ChatWindow';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { UserScriptEditor } from './components/UserScriptEditor';
import { SettingsModal } from './components/SettingsModal';
import { CharacterCard } from './components/CharacterCard';
import { SceneCard } from './components/SceneCard';
import { Character, GameState, Message, CustomScenario, AppSettings, WorldScene, JournalEntry, JournalEcho, Mail, EraMemory, DebugLog } from './types';
import { geminiService } from './services/gemini';
import { storageService } from './services/storage';
import { authApi, journalApi, characterApi, scriptApi, worldApi, eraApi, membershipApi, userMainStoryApi } from './services/api';
import { syncService } from './services/syncService';
import { EraConstructorModal } from './components/EraConstructorModal';
import { CharacterConstructorModal } from './components/CharacterConstructorModal';
import { MainStoryEditor } from './components/MainStoryEditor';
import { EntryPoint } from './components/EntryPoint';
import { RealWorldScreen } from './components/RealWorldScreen';
import { MailboxModal } from './components/MailboxModal';
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
import { useScrollPosition } from './hooks/useScrollPosition';
import { StateManagementTest } from './components/StateManagementTest';
import { GameStateProvider, useGameState } from './contexts/GameStateContext';
import { useScenes } from './hooks/useScenes';
import { useCharacters } from './hooks/useCharacters';
import { useScripts } from './hooks/useScripts';
import { useChat } from './hooks/useChat';
import { useSettings } from './hooks/useSettings';
import { DEFAULT_GAME_STATE } from './contexts/constants/defaultState';
import { convertErasToWorldScenes, convertBackendMainStoryToCharacter, convertBackendCharacterToFrontend } from './utils/dataTransformers';
import { showSyncErrorToast } from './utils/toast';
import { useEraHandlers } from './hooks/useEraHandlers';
import { useJournalHandlers } from './hooks/useJournalHandlers';
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
import { ProfileSetupScreen } from './components/screens/ProfileSetupScreen';

// 代码分割：使用动态导入优化大组件
const AdminScreen = lazy(() => import('./admin/AdminScreen').then(module => ({ default: module.AdminScreen })));
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
const AppContent: React.FC = () => {
  
  // --- Device Adaptation & Mode Switching ---
  // checkIsMobile 已移至 utils/deviceDetection.ts
  // 设备模式管理已移至 useDeviceMode Hook

  const EXAMPLE_SCENARIO: CustomScenario = {
      id: 'example_scenario_01',
      sceneId: 'university_era',
      title: '示例剧本：深夜网咖的邂逅',
      description: '在这座城市的霓虹灯下，你走进了一家名为“Binary Beans”的网咖...',
      author: 'System', startNodeId: 'start',
      nodes: {
          'start': { id: 'start', title: '初入网咖', prompt: 'User enters a cyberpunk internet cafe at rainy night. Introduce a mysterious hacker girl (Yuki style) sitting in the corner, looking nervous. The barista asks for the user\'s order.', options: [ { id: 'opt_1', text: '走向那个黑客少女', nextNodeId: 'node_hacker' }, { id: 'opt_2', text: '点一杯咖啡，坐在吧台', nextNodeId: 'node_coffee' } ] },
          'node_hacker': { id: 'node_hacker', title: '黑客的求助', prompt: 'The girl hands over a data chip. "They are watching," she whispers. Suddenly, the cafe lights turn red. Action scene begins.', options: [ { id: 'opt_help', text: '答应帮助她', nextNodeId: 'node_mission_start' }, { id: 'opt_leave', text: '表示对此不感兴趣，离开', nextNodeId: 'start' } ] },
          'node_coffee': { id: 'node_coffee', title: '平静的夜晚', prompt: 'The user sits at the bar. The barista serves a glowing neon coffee. The atmosphere is chill and lo-fi. Nothing dangerous happens, just a conversation.', options: [ { id: 'opt_chat', text: '和咖啡师聊天', nextNodeId: 'node_coffee' }, { id: 'opt_look_around', text: '观察四周', nextNodeId: 'start' } ] },
          'node_mission_start': { id: 'node_mission_start', title: '任务开始', prompt: 'The girl hands over a data chip. "They are watching," she whispers. Suddenly, the cafe lights turn red. Action scene begins.', options: [] }
      }
  };

  // 使用新的状态管理系统
  const { state: gameState, dispatch } = useGameState();
  const [isLoaded, setIsLoaded] = useState(false); 
  
  // 初始化加载状态（GameStateProvider会自动加载，这里只是标记本地加载完成）
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  
  // 保留示例剧本（如果还没有的话）
  useEffect(() => {
    if (gameState.customScenarios.length === 0) {
      dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: [EXAMPLE_SCENARIO] });
    }
  }, [gameState.customScenarios.length, dispatch]);
  
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
    setShowSettingsModal,
    setShowEraCreator,
    setShowCharacterCreator,
    setShowMainStoryEditor,
    setShowMailbox,
    setShowEraMemory,
    setShowRecycleBin,
    setShowMembershipModal,
    setShowLoginModal,
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
  const { handleAddJournalEntry, handleUpdateJournalEntry, handleDeleteJournalEntry } = useJournalHandlers();
  const { handleSaveMainStory, handleDeleteMainStory: handleDeleteMainStoryHook, handleEditMainStory: handleEditMainStoryHook } = useMainStoryHandlers();
  const { loadAndSyncWorldData: loadAndSyncWorldDataHook, handleLoginSuccess: handleLoginSuccessHook, checkAuth: checkAuthHook } = useDataLoader();
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

  useEffect(() => {
    syncService.init(); // 初始化同步服务
  }, []);

  // 更新gemini配置（当settings变化时）
  useEffect(() => {
    if (isLoaded) {
    geminiService.updateConfig(gameState.settings);
    }
  }, [gameState.settings, isLoaded]);

  // Logging hook
  useEffect(() => {
      const logCallback = (log: DebugLog) => {
          dispatch({ type: 'ADD_DEBUG_LOG', payload: log });
      };
      
      geminiService.setLogCallback(logCallback);
      
      // 清理函数：移除回调，防止内存泄漏
      return () => {
          geminiService.setLogCallback(() => {}); // 使用空函数代替null
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
    
    console.log('[DataLoader useEffect] 触发检查:', {
      currentScreen: gameState.currentScreen,
      shouldLoadData,
      hasUserProfile: !!gameState.userProfile,
      isGuest: gameState.userProfile?.isGuest,
      userWorldScenesCount: gameState.userWorldScenes?.length || 0,
      hasLoadedEntryPointData: hasLoadedEntryPointData.current
    });
    
    // 重置标志，当离开需要加载数据的页面时
    if (!shouldLoadData) {
      hasLoadedEntryPointData.current = false;
      return;
    }
    
    if (shouldLoadData && gameState.userProfile && !gameState.userProfile.isGuest) {
      // 注释掉：不再使用本地缓存，每次都从数据库获取最新数据
      // // 防止重复加载：只有在已有数据且标志为true时才跳过
      // // 如果标志为true但没有数据，说明上次加载失败，需要重新加载
      // if (hasLoadedEntryPointData.current && gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
      //   console.log('[DataLoader] 已经加载过数据且数据存在，跳过。数据数量:', gameState.userWorldScenes.length);
      //   return;
      // }
      
      // // 如果标志为true但没有数据，重置标志并继续加载
      // if (hasLoadedEntryPointData.current && (!gameState.userWorldScenes || gameState.userWorldScenes.length === 0)) {
      //   console.log('[DataLoader] 标志为true但数据为空，重置标志并重新加载');
      //   hasLoadedEntryPointData.current = false;
      // }
      
      // // 如果已经有 userWorldScenes 数据，说明 handleLoginSuccess 已经加载过了，跳过
      // if (gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
      //   console.log('[DataLoader] 检测到已有数据（可能来自 handleLoginSuccess），跳过加载。数据数量:', gameState.userWorldScenes.length);
      //   hasLoadedEntryPointData.current = true;
      //   return;
      // }
      
      console.log('[DataLoader] 强制从数据库获取数据，忽略本地缓存');
      
      const token = localStorage.getItem('auth_token');
      console.log(`[DataLoader ${gameState.currentScreen}] 条件检查通过，token存在:`, !!token);
      
      if (!token) {
        console.warn(`[DataLoader ${gameState.currentScreen}] token不存在，可能是登录流程还未完成`);
        console.warn(`[DataLoader ${gameState.currentScreen}] 等待200ms后重试...`);
        // 等待一小段时间，可能是登录流程还未完成
        setTimeout(() => {
          const retryToken = localStorage.getItem('auth_token');
          if (retryToken) {
            console.log(`[DataLoader ${gameState.currentScreen}] 重试后token存在，开始加载数据`);
            // 通过更新 gameState 来重新触发 useEffect
            dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
          } else {
            console.error(`[DataLoader ${gameState.currentScreen}] 重试后token仍不存在，无法加载数据`);
            console.error(`[DataLoader ${gameState.currentScreen}] 检测到用户已登录但token丢失，清除用户信息并提示重新登录`);
            // 如果用户已登录但token丢失，清除用户信息并提示重新登录
            if (gameState.userProfile && !gameState.userProfile.isGuest) {
              console.warn(`[DataLoader ${gameState.currentScreen}] 清除无效的用户信息`);
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
        console.log(`[DataLoader ${gameState.currentScreen}] ========== 开始从数据库加载场景数据 ==========`);
        console.log(`[DataLoader ${gameState.currentScreen}] 注意：已禁用本地缓存，强制从数据库获取最新数据`);
        // 注释掉：不再显示本地缓存数据
        // console.log(`[DataLoader ${gameState.currentScreen}] 当前本地数据:`, {
        //   userWorldScenesCount: gameState.userWorldScenes?.length || 0,
        //   userWorldScenes: gameState.userWorldScenes
        // });
        
        // 使用 useDataLoader Hook 加载数据
        const screenName = gameState.currentScreen;
        console.log(`[DataLoader ${screenName}] ========== 开始从数据库加载场景数据 ==========`);
        console.log(`[DataLoader ${screenName}] 注意：已禁用本地缓存，强制从数据库获取最新数据`);
        
        // 如果本地已有数据，先显示本地数据，然后后台同步
        if (gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
          console.log(`[DataLoader ${screenName}] 检测到本地已有数据，数量:`, gameState.userWorldScenes.length);
          console.log(`[DataLoader ${screenName}] 使用本地数据，后台同步远程数据`);
          loadAndSyncWorldDataHook(token, screenName).catch(error => {
            console.error(`[DataLoader ${screenName}] 后台同步失败:`, error);
          });
        } else {
          console.log(`[DataLoader ${screenName}] 检测到本地无数据`);
          console.log(`[DataLoader ${screenName}] 本地无数据，立即加载远程数据`);
          loadAndSyncWorldDataHook(token, screenName).catch(error => {
            console.error(`[DataLoader ${screenName}] 加载失败:`, error);
          });
        }
      } else {
        console.warn(`[DataLoader ${gameState.currentScreen}] token不存在，无法加载数据`);
      }
    } else {
      console.log(`[DataLoader] 条件检查未通过，不加载数据`);
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

  const handleGuestEnter = (nickname: string): void => {
    const profile = { 
        nickname: nickname, 
        avatarUrl: '',
        isGuest: true, 
        id: `guest_${Date.now()}`
    }; 
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
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
        console.log('[App] 设置编辑状态:', {
          editingMainStory: result.mainStory,
          editingMainStorySceneId: result.sceneId
        });
        
        setEditingMainStory(result.mainStory);
        setEditingMainStorySceneId(result.sceneId);
        setShowMainStoryEditor(true);
        
        console.log('[App] 状态已设置，MainStoryEditor 应该显示');
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

  // 日记 Handlers 已移至 useJournalHandlers Hook

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
      console.log('[currentScenes] 初始化向导显示中，返回空场景列表');
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
      // 登录用户：使用从数据库获取的用户专属场景（userWorldScenes 现在只从数据库获取）
      // + 自定义场景（排除已在userWorldScenes中的）
      const userWorldScenes = gameState.userWorldScenes || []; // 如果为空，说明还在加载中
      const userWorldSceneIds = new Set(userWorldScenes.map(s => s.id));
      const customScenesOnly = gameState.customScenes.filter(s => !userWorldSceneIds.has(s.id));
      return [...userWorldScenes, ...customScenesOnly];
    } else {
      // 游客：使用本地预置场景 + 自定义场景
      return [...WORLD_SCENES, ...gameState.customScenes];
    }
  }, [gameState.userProfile, gameState.userWorldScenes, gameState.customScenes, showInitializationWizard]);
  
  // 为了保持向后兼容，创建一个函数
  const getCurrentScenes = useCallback(() => currentScenes, [currentScenes]);
  
  // 场景详情页面日志 - 必须在早期返回之前，遵守 React Hooks 规则
  useEffect(() => {
    const currentSceneLocal = currentScenes.find(s => s.id === gameState.selectedSceneId);
    if (gameState.currentScreen === 'sceneSelection' && currentSceneLocal) {
      console.log('========== [场景详情] 数据加载 ==========');
      console.log('[场景详情] 当前场景ID:', gameState.selectedSceneId);
      console.log('[场景详情] 当前场景信息:', {
        id: currentSceneLocal.id,
        name: currentSceneLocal.name,
        description: currentSceneLocal.description,
        worldId: currentSceneLocal.worldId,
        systemEraId: currentSceneLocal.systemEraId
      });
      
      // 主线故事数据
      if (currentSceneLocal.mainStory) {
        console.log('[场景详情] 主线故事数据:', {
          id: currentSceneLocal.mainStory.id,
          name: currentSceneLocal.mainStory.name,
          role: currentSceneLocal.mainStory.role,
          bio: currentSceneLocal.mainStory.bio?.substring(0, 50) + '...',
          avatarUrl: currentSceneLocal.mainStory.avatarUrl ? '存在' : '不存在',
          backgroundUrl: currentSceneLocal.mainStory.backgroundUrl ? '存在' : '不存在',
          firstMessage: currentSceneLocal.mainStory.firstMessage?.substring(0, 50) + '...',
          isNumericId: /^\d+$/.test(currentSceneLocal.mainStory.id),
          isUserOwned: /^\d+$/.test(currentSceneLocal.mainStory.id)
        });
      } else {
        console.log('[场景详情] 主线故事: 无');
      }
      
      // 角色数据
      const customCharsForScene = gameState.customCharacters[currentSceneLocal.id] || [];
      const allChars = [...currentSceneLocal.characters, ...customCharsForScene];
      console.log('[场景详情] 角色数据:', {
        总数: allChars.length,
        后端角色数: currentSceneLocal.characters.length,
        自定义角色数: customCharsForScene.length,
        角色列表: allChars.map(char => ({
          id: char.id,
          name: char.name,
          role: char.role,
          isNumericId: /^\d+$/.test(char.id),
          isInCustomChars: customCharsForScene.some(c => c.id === char.id),
          isUserOwned: /^\d+$/.test(char.id) || customCharsForScene.some(c => c.id === char.id)
        }))
      });
      
      // 剧本数据
      const backendScripts = currentSceneLocal.scripts || [];
      const customScenarios = gameState.customScenarios.filter(s => s.sceneId === currentSceneLocal.id);
      console.log('[场景详情] 剧本数据:', {
        后端剧本数: backendScripts.length,
        自定义剧本数: customScenarios.length,
        后端剧本列表: backendScripts.map(script => ({
          id: script.id,
          title: script.title,
          sceneCount: script.sceneCount,
          contentLength: script.content?.length || 0,
          hasContent: !!script.content
        })),
        自定义剧本列表: customScenarios.map(scenario => ({
          id: scenario.id,
          title: scenario.title,
          nodesCount: Object.keys(scenario.nodes || {}).length,
          startNodeId: scenario.startNodeId
        }))
      });
      
      console.log('========== [场景详情] 数据加载完成 ==========');
    }
  }, [gameState.currentScreen, gameState.selectedSceneId, currentScenes, gameState.customCharacters, gameState.customScenarios]);
  
  if (isMobileMode) {
      return (
        <Suspense fallback={<LoadingScreen />}>
          <MobileApp onSwitchToPC={handleSwitchToPC} />
        </Suspense>
      );
  }

  if (!isLoaded) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading HeartSphere Core...</div>;
  
  // 测试模式：在URL中添加 ?test=state 可以访问状态管理测试页面
  if (typeof window !== 'undefined' && window.location.search.includes('test=state')) {
    return <StateManagementTest />;
  }
  
  const currentSceneLocal = currentScenes.find(s => s.id === gameState.selectedSceneId);
  
  let sceneCharacters: Character[] = [];
  if (currentSceneLocal) {
      const customCharsForScene = gameState.customCharacters[currentSceneLocal.id] || [];
      // 过滤掉主线故事，避免在角色列表中重复显示
      const mainStoryId = currentSceneLocal.mainStory?.id;
      const filteredCharacters = currentSceneLocal.characters.filter(char => {
          // 如果角色ID与主线故事ID相同，则过滤掉
          if (mainStoryId && char.id === mainStoryId) {
              console.log('[场景详情] 过滤掉角色列表中的主线故事:', {
                  characterId: char.id,
                  characterName: char.name,
                  mainStoryId: mainStoryId
              });
              return false;
          }
          return true;
      });
      sceneCharacters = [...filteredCharacters, ...customCharsForScene];
  }

  const allCharacters = currentScenes.reduce((acc, scene) => {
      const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
      return [...acc, ...sceneChars];
  }, [] as Character[]);

  let currentCharacterLocal = gameState.tempStoryCharacter || sceneCharacters.find(c => c.id === gameState.selectedCharacterId);
  if (!currentCharacterLocal && currentSceneLocal?.mainStory?.id === gameState.selectedCharacterId) {
      currentCharacterLocal = currentSceneLocal.mainStory;
  }

  const editingScenarioLocal = gameState.editingScenarioId 
    ? gameState.customScenarios.find(s => s.id === gameState.editingScenarioId) 
    : null;
  // 查找当前场景：优先从 customScenarios 中查找，确保使用最新的数据
  // 使用严格相等比较，同时检查字符串和数字类型的 ID
  const currentScenarioLocal = gameState.selectedScenarioId
    ? gameState.customScenarios.find(s => {
        // 同时检查字符串和数字类型的 ID 匹配
        const scenarioId = String(s.id);
        const selectedId = String(gameState.selectedScenarioId);
        return scenarioId === selectedId;
      })
    : null;
  
  // 详细调试日志：检查 currentScenarioLocal 的查找
  if (gameState.selectedScenarioId || gameState.currentScreen === 'chat') {
    console.log('[App] 🔍 currentScenarioLocal 查找:', {
      selectedScenarioId: gameState.selectedScenarioId,
      selectedScenarioIdType: typeof gameState.selectedScenarioId,
      customScenariosCount: gameState.customScenarios.length,
      customScenariosIds: gameState.customScenarios.map(s => ({ id: s.id, idType: typeof s.id, title: s.title })),
      found: !!currentScenarioLocal,
      currentScenarioLocalId: currentScenarioLocal?.id,
      currentScenarioLocalTitle: currentScenarioLocal?.title,
      currentScenarioLocalNodesCount: currentScenarioLocal ? Object.keys(currentScenarioLocal.nodes || {}).length : 0,
      currentScenarioLocalHasNodes: !!currentScenarioLocal?.nodes,
      currentScreen: gameState.currentScreen
    });
    
    if (!currentScenarioLocal && gameState.selectedScenarioId) {
      console.error('[App] ❌ 警告：找不到对应的 scenario！', {
        selectedScenarioId: gameState.selectedScenarioId,
        selectedScenarioIdType: typeof gameState.selectedScenarioId,
        selectedScenarioIdString: String(gameState.selectedScenarioId),
        availableIds: gameState.customScenarios.map(s => ({ id: s.id, idType: typeof s.id, idString: String(s.id) })),
        customScenarios: gameState.customScenarios.map(s => ({ id: s.id, title: s.title }))
      });
    }
  }

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
        <>
          {console.log('[初始化向导] ========== 渲染初始化向导组件 ==========')}
          {console.log('[初始化向导] showInitializationWizard:', showInitializationWizard)}
          {console.log('[初始化向导] currentScreen:', gameState.currentScreen)}
          {console.log('[初始化向导] initializationData:', initializationData)}
          {console.log('[初始化向导] userId:', initializationData.userId)}
          {console.log('[初始化向导] worldId:', initializationData.worldId)}
          {console.log('[初始化向导] token存在:', !!initializationData.token)}
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
        </>
      )}


      {gameState.currentScreen === 'profileSetup' && (
        <ProfileSetupScreen
          onGuestEnter={handleGuestEnter}
          onLogin={() => setShowLoginModal(true)}
        />
      )}

      {gameState.currentScreen === 'entryPoint' && (() => {
        // 在 entryPoint 渲染时，如果初始化向导不应该显示，立即清理
        if (showInitializationWizard && (!initializationData || !initializationWizardProcessedRef.current)) {
          console.warn('[EntryPoint] 检测到初始化向导状态异常，立即清理');
          setShowInitializationWizard(false);
          setInitializationData(null);
          initializationWizardProcessedRef.current = false;
        }
        
        return (
          <EntryPoint 
            onNavigate={(screen) => {
              if (screen === 'admin') {
                // admin 现在在新页面打开，不需要处理
                return;
              }
              dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
            }} 
            nickname={gameState.userProfile?.nickname || ''} 
            onOpenSettings={() => setShowSettingsModal(true)}
            onSwitchToMobile={handleSwitchToMobile}
            currentStyle={gameState.worldStyle}
            onStyleChange={(style) => {
              dispatch({ type: 'SET_WORLD_STYLE', payload: style });
              storageService.saveState({ ...gameState, worldStyle: style });
            }}
            onLoginSuccess={handleLoginSuccess}
            isGuest={gameState.userProfile?.isGuest || !gameState.userProfile}
            onGuestEnter={(nickname) => {
              const profile = { 
                nickname: nickname, 
                avatarUrl: '',
                isGuest: true, 
                id: `guest_${Date.now()}`
              }; 
              dispatch({ type: 'SET_USER_PROFILE', payload: profile });
              dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
            }}
          />
        );
      })()}

      {gameState.currentScreen === 'realWorld' && (
          <RealWorldScreen
            showNoteSync={gameState.settings?.showNoteSync ?? false} 
             entries={gameState.journalEntries}
             onAddEntry={handleAddJournalEntry}
             onUpdateEntry={handleUpdateJournalEntry}
             onDeleteEntry={handleDeleteJournalEntry}
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

      {gameState.currentScreen === 'connectionSpace' && gameState.userProfile && (
          <ConnectionSpace 
             characters={allCharacters}
             userProfile={gameState.userProfile}
             onBack={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })}
             onConnect={(character) => {
                 requireAuth(() => {
                     // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
                     const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
                       ? [...gameState.userWorldScenes, ...gameState.customScenes]
                       : [...WORLD_SCENES, ...gameState.customScenes];
                     let sceneId: string | null = null;
                     for (const s of allScenes) {
                         const chars = [...s.characters, ...(gameState.customCharacters[s.id] || [])];
                         if (chars.find(c => c.id === character.id)) {
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

      {gameState.currentScreen === 'admin' && (
          <Suspense fallback={<LoadingScreen />}>
          <AdminScreen 
             gameState={gameState}
             onUpdateGameState={(newState) => dispatch({ type: 'BATCH_UPDATE', payload: newState })}
             onResetWorld={() => storageService.clearMemory()}
             onBack={handleEnterNexus}
          />
          </Suspense>
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
          requireAuth={requireAuth}
          dispatch={dispatch}
        />
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

      {(() => {
        const shouldRenderChatWindow = gameState.currentScreen === 'chat' && currentCharacterLocal;
        console.log('[App] 🔍 ChatWindow 渲染条件检查:', {
          currentScreen: gameState.currentScreen,
          hasCurrentCharacterLocal: !!currentCharacterLocal,
          currentCharacterLocalId: currentCharacterLocal?.id,
          shouldRenderChatWindow,
          willRender: shouldRenderChatWindow
        });
        return null;
      })()}
      {gameState.currentScreen === 'chat' && currentCharacterLocal && (() => {
          console.log('[App] 🎬 准备渲染ChatWindow:', {
            currentScreen: gameState.currentScreen,
            hasCurrentCharacterLocal: !!currentCharacterLocal,
            currentCharacterLocalId: currentCharacterLocal?.id,
            selectedScenarioId: gameState.selectedScenarioId,
            hasCurrentScenarioLocal: !!currentScenarioLocal,
            currentScenarioLocalId: currentScenarioLocal?.id,
            currentScenarioLocalTitle: currentScenarioLocal?.title,
            customScenariosCount: gameState.customScenarios.length,
            customScenariosIds: gameState.customScenarios.map(s => s.id),
            currentScenarioState: gameState.currentScenarioState
          });
          
          return (
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
            console.log('[App] onUpdateScenarioState 被调用:', {
              nodeId,
              currentScenarioState: gameState.currentScenarioState,
              selectedScenarioId: gameState.selectedScenarioId
            });
            const newScenarioState = gameState.currentScenarioState 
              ? { ...gameState.currentScenarioState, currentNodeId: nodeId }
              : { scenarioId: gameState.selectedScenarioId || '', currentNodeId: nodeId };
              console.log('[App] 更新 scenarioState:', newScenarioState);
            dispatch({ type: 'SET_CURRENT_SCENARIO_STATE', payload: newScenarioState });
          }}
          onBack={handleChatBack}
          participatingCharacters={(() => {
            // 获取参与剧本的角色列表
            if (currentScenarioLocal && currentScenarioLocal.participatingCharacters) {
              // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
      const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
        ? [...gameState.userWorldScenes, ...gameState.customScenes]
        : [...WORLD_SCENES, ...gameState.customScenes];
              const scene = allScenes.find(s => s.id === currentScenarioLocal.sceneId);
              if (scene) {
                const allChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
                return currentScenarioLocal.participatingCharacters
                  .map(charId => allChars.find(c => c.id === charId))
                  .filter((char): char is Character => char !== undefined);
              }
            }
            return undefined;
          })()}
        />
          );
      })()}

      {gameState.currentScreen === 'builder' && (
          <ScenarioBuilder 
            initialScenario={editingScenarioLocal}
            onSave={handleSaveScenario}
            onCancel={() => {
              dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'characterSelection' });
              dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: null });
            }}
          />
      )}

      {/* 用户剧本编辑页面 */}
      {gameState.editingScript && (() => {
          const token = localStorage.getItem('auth_token');
          if (!token) return null;
          
          // 获取所有用户场景
          const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
              ? [...gameState.userWorldScenes, ...gameState.customScenes]
              : [...WORLD_SCENES, ...gameState.customScenes];
          
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

      {showEraCreator && (
          <EraConstructorModal 
             initialScene={editingScene}
             onSave={handleSaveEra}
             onDelete={editingScene ? () => handleDeleteEra(editingScene.id) : undefined}
             onClose={() => { setShowEraCreator(false); setEditingScene(null); }}
             worldStyle={gameState.worldStyle}
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
          console.log('[MainStoryEditor] 渲染编辑器:', { 
              showMainStoryEditor, 
              editingMainStory: !!editingMainStory, 
              editingMainStorySceneId,
              editorScene: editorScene?.name 
          });
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
                     console.log('[MainStoryEditor] 关闭编辑器');
                     setShowMainStoryEditor(false);
                     setEditingMainStory(null);
                     setEditingMainStorySceneId(null);
                 }}
                 worldStyle={gameState.worldStyle}
              />
          );
      })()}

      {showMailbox && (
          <MailboxModal 
             mails={gameState.mailbox}
             onClose={() => setShowMailbox(false)}
             onMarkAsRead={handleMarkMailRead}
          />
      )}
      
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
      
    </div>
  );
};

// 主App组件，提供状态管理Context
const App: React.FC = () => {
  // 测试路由：用于测试状态管理系统
  if (new URLSearchParams(window.location.search).get('test') === 'state') {
    return (
      <GameStateProvider>
        <StateManagementTest />
      </GameStateProvider>
    );
  }

  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
};

export default App;