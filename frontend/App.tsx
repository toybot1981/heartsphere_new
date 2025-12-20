
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
  
  const checkIsMobile = (): boolean => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || '';
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth < 768;
    return isMobileDevice || isSmallScreen;
  };

  const [isMobileMode, setIsMobileMode] = useState(checkIsMobile());

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
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEraCreator, setShowEraCreator] = useState(false);
  const [editingScene, setEditingScene] = useState<WorldScene | null>(null);
  
  // 使用 Handler Hooks
  const { handleSaveEra: handleSaveEraHook, handleDeleteEra: handleDeleteEraHook } = useEraHandlers(
    editingScene,
    () => {
      setShowEraCreator(false);
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
  
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showMainStoryEditor, setShowMainStoryEditor] = useState(false);
  const [editingMainStory, setEditingMainStory] = useState<Character | null>(null);
  const [editingMainStorySceneId, setEditingMainStorySceneId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingCharacterSceneId, setEditingCharacterSceneId] = useState<string | null>(null);
  
  // 使用 Character Handlers Hook（需要在 editingCharacterSceneId 和 editingMainStory 声明之后）
  const { handleSaveCharacter: handleSaveCharacterHook, handleDeleteCharacter: handleDeleteCharacterHook, handleGenerateAvatar: handleGenerateAvatarHook } = useCharacterHandlers(
    editingCharacterSceneId,
    editingMainStory,
    () => {
      setShowCharacterCreator(false);
      setEditingCharacter(null);
      setEditingCharacterSceneId(null);
      setEditingMainStory(null);
      setEditingMainStorySceneId(null);
    }
  );

  const [showMailbox, setShowMailbox] = useState(false);
  
  const [showEraMemory, setShowEraMemory] = useState(false);
  const [memoryScene, setMemoryScene] = useState<WorldScene | null>(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [currentMembership, setCurrentMembership] = useState<any>(null);
  const [showInitializationWizard, setShowInitializationWizard] = useState(false);
  const [initializationData, setInitializationData] = useState<{ token: string; userId: number; worldId: number } | null>(null);
  // 标记是否已经处理过初始化向导，防止在 entryPoint 渲染后被错误触发
  const initializationWizardProcessedRef = useRef(false);
  
  // 监听初始化向导状态变化，用于调试
  useEffect(() => {
    console.log('[App] 初始化向导状态变化:', {
      showInitializationWizard,
      hasInitializationData: !!initializationData,
      currentScreen: gameState.currentScreen,
      initializationData: initializationData ? {
        userId: initializationData.userId,
        worldId: initializationData.worldId,
        tokenExists: !!initializationData.token
      } : null
    });
    
    // 如果初始化向导状态为 true，但没有数据，或者不在正确的页面，自动清理
    if (showInitializationWizard && (!initializationData || (gameState.currentScreen !== 'entryPoint' && gameState.currentScreen !== 'profileSetup'))) {
      console.warn('[App] 检测到初始化向导状态不一致，自动清理:', {
        showInitializationWizard,
        hasInitializationData: !!initializationData,
        currentScreen: gameState.currentScreen
      });
      setShowInitializationWizard(false);
      setInitializationData(null);
      initializationWizardProcessedRef.current = false; // 重置标记
    }
    
    // 如果已经处理过初始化向导，但状态仍然为 true，且不在正确的页面，强制清理
    if (initializationWizardProcessedRef.current && showInitializationWizard && gameState.currentScreen !== 'entryPoint' && gameState.currentScreen !== 'profileSetup') {
      console.warn('[App] 检测到初始化向导已处理但仍在显示，强制清理');
      setShowInitializationWizard(false);
      setInitializationData(null);
      initializationWizardProcessedRef.current = false;
    }
  }, [showInitializationWizard, initializationData, gameState.currentScreen]);

  const [profileNickname, setProfileNickname] = useState('');
  const [showGuestNicknameModal, setShowGuestNicknameModal] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const pendingActionRef = useRef<() => void>(() => {});

  const hasCheckedMail = useRef(false);
  const hasLoadedEntryPointData = useRef(false);
  
  // Use ref to access current gameState in event listeners without stale closures
  const gameStateRef = useRef(gameState);
  useEffect(() => { gameStateRef.current = gameState; }, [gameState]);

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

  // Responsive adaptation listener
  useEffect(() => {
    const handleResize = () => {
      const shouldBeMobile = checkIsMobile();
      if (shouldBeMobile !== isMobileMode) {
        // If switching FROM PC to Mobile, save PC state first
        if (!isMobileMode) {
            storageService.saveState({ ...gameStateRef.current, lastLoginTime: Date.now() });
        }
        setIsMobileMode(shouldBeMobile);
        
        // If switching FROM Mobile to PC, we need to reload data because MobileApp maintained its own state
        if (!shouldBeMobile) {
            // Delay slightly to ensure DB write finishes if MobileApp was unmounting
            // Note: GameStateProvider already handles loading, no need to reload here
            // setTimeout(() => loadGameData(), 200); 
        }
      }
    };

    // Debounce resize
    let timeoutId: any;
    const debouncedResize = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleResize, 300);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
        window.removeEventListener('resize', debouncedResize);
        clearTimeout(timeoutId);
    };
  }, [isMobileMode]); 

  // Mail check
  useEffect(() => {
    if (!isLoaded || !gameState.userProfile || hasCheckedMail.current) return;
    const checkMail = async () => {
        hasCheckedMail.current = true;
        const now = Date.now();
        const offlineDuration = now - gameState.lastLoginTime;
        const THRESHOLD = 60 * 1000; 

        if (offlineDuration > THRESHOLD) {
            const chattedCharIds = Object.keys(gameState.history);
            let candidate: Character | null = null;
            if (chattedCharIds.length > 0) {
                 const allScenes = [...currentScenes, ...gameState.customScenes];
                 for (const scene of allScenes) {
                     const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
                     const found = sceneChars.find(c => c.id === chattedCharIds[0]);
                     if (found) { candidate = found; break; }
                 }
            }
            if (!candidate && currentScenes.length > 0) candidate = currentScenes[0].characters[0]; 

            if (candidate) {
                 const letter = await geminiService.generateChronosLetter(candidate, gameState.userProfile!, gameState.journalEntries);
                 if (letter) {
                     const newMail: Mail = {
                         id: `mail_${Date.now()}`,
                         senderId: candidate.id,
                         senderName: candidate.name,
                         senderAvatarUrl: candidate.avatarUrl,
                         subject: letter.subject,
                         content: letter.content,
                         timestamp: Date.now(),
                         isRead: false,
                         themeColor: candidate.themeColor
                     };
                     dispatch({ type: 'ADD_MAIL', payload: newMail });
                 }
            }
        }
    };
    checkMail();
  }, [isLoaded, gameState.userProfile]);

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
  
  const requireAuth = (action: () => void) => {
    if (gameState.userProfile?.isGuest) {
      pendingActionRef.current = action;
      setShowLoginModal(true);
    } else {
      action();
    }
  };

  // 处理登录成功
  const handleLoginSuccess = async (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]): Promise<void> => {
    // 从localStorage获取token（确保token已经保存）
    let token = localStorage.getItem('auth_token');
    console.log('[handleLoginSuccess] ========== 开始处理登录成功 ==========');
    console.log('[handleLoginSuccess] 方法:', method, '标识:', identifier, '首次登录:', isFirstLogin);
    console.log('[handleLoginSuccess] token存在:', !!token);
    if (token) {
      console.log('[handleLoginSuccess] token长度:', token.length, 'token前10个字符:', token.substring(0, 10));
    }
    
    // 如果token不存在，等待一小段时间后重试（可能是异步保存导致的延迟）
    if (!token) {
      console.warn('[handleLoginSuccess] token不存在，等待100ms后重试...');
      await new Promise(resolve => setTimeout(resolve, 100));
      token = localStorage.getItem('auth_token');
      console.log('[handleLoginSuccess] 重试后token存在:', !!token);
      if (token) {
        console.log('[handleLoginSuccess] 重试后token长度:', token.length, 'token前10个字符:', token.substring(0, 10));
      }
    }
    
    if (token) {
      try {
        console.log('[handleLoginSuccess] 准备调用 getCurrentUser，token:', token.substring(0, 20) + '...');
        // 使用token获取完整用户信息
        const userInfo = await authApi.getCurrentUser(token);
        console.log('[handleLoginSuccess] getCurrentUser 成功，用户信息:', userInfo);
        
        // 安全检查：确保 userInfo 和 userInfo.id 存在
        if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
          console.error('用户信息无效或缺少ID:', userInfo);
          throw new Error('无法获取有效的用户信息');
        }
        
        // 获取日记列表
        console.log('尝试获取日记列表...');
        const journalEntries = await journalApi.getAllJournalEntries(token);
        console.log('获取日记列表成功:', journalEntries);
        
        // 获取世界列表 (如果登录响应中没有，则单独获取)
        const remoteWorlds = worlds || await worldApi.getAllWorlds(token);
        console.log('获取世界列表成功:', remoteWorlds);
        
        // 获取场景列表
        const eras = await eraApi.getAllEras(token);
        console.log('获取场景列表成功:', eras);
        
        // 获取角色列表
        const characters = await characterApi.getAllCharacters(token);
        console.log('获取角色列表成功:', characters);
        
        // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
        const userWorldScenes = convertErasToWorldScenes(
          remoteWorlds,
          eras,
          characters,
          undefined, // scripts 在 handleLoginSuccess 中未加载
          undefined  // mainStories 在 handleLoginSuccess 中未加载
        );
        
        // 安全检查：确保 userInfo 和 userInfo.id 存在
        if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
          console.error('用户信息无效或缺少ID:', userInfo);
          throw new Error('无法获取有效的用户信息');
        }
        
        // 更新用户信息和日记列表，使用远程加载的世界数据
        // 更新用户信息
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
        dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
        
          // 如果是首次登录，确保跳转到 entryPoint 以显示初始化向导
          // 否则，如果当前在 profileSetup 页面，登录成功后也跳转到 entryPoint
        const newScreen = (isFirstLogin || gameState.currentScreen === 'profileSetup') ? 'entryPoint' : gameState.currentScreen;
        if (newScreen !== gameState.currentScreen) {
          dispatch({ type: 'SET_CURRENT_SCREEN', payload: newScreen });
        }
        
        // 如果是首次登录，显示初始化向导
        if (isFirstLogin && !initializationWizardProcessedRef.current) {
          console.log('[初始化向导] ========== 开始初始化向导流程 ==========');
          console.log('[初始化向导] isFirstLogin:', isFirstLogin);
          console.log('[初始化向导] remoteWorlds:', remoteWorlds);
          console.log('[初始化向导] userInfo:', userInfo);
          
          // 标记已处理，防止重复触发
          initializationWizardProcessedRef.current = true;
          
          // 获取用户的世界ID（从远程世界列表中获取第一个，或者创建一个新的）
          let userWorldId: number | null = null;
          if (remoteWorlds && remoteWorlds.length > 0) {
            userWorldId = remoteWorlds[0].id;
            console.log('[初始化向导] 从远程世界列表获取 worldId:', userWorldId);
          } else {
            console.log('[初始化向导] 远程世界列表为空，尝试创建新世界');
            // 如果没有世界，需要先创建一个（这应该由后端自动创建，但以防万一）
            try {
              const worldName = `${userInfo.nickname || userInfo.username}的世界`;
              console.log('[初始化向导] 创建世界，名称:', worldName);
              const newWorld = await worldApi.createWorld(worldName, '', token);
              userWorldId = newWorld.id;
              console.log('[初始化向导] 创建世界成功，worldId:', userWorldId);
            } catch (error) {
              console.error('[初始化向导] 创建世界失败:', error);
              showAlert('无法创建世界，请刷新重试');
              initializationWizardProcessedRef.current = false; // 重置标记
              return;
            }
          }
          
          if (userWorldId) {
            console.log('[初始化向导] 准备设置初始化数据');
            console.log('[初始化向导] token存在:', !!token);
            console.log('[初始化向导] userId:', userInfo.id);
            console.log('[初始化向导] worldId:', userWorldId);
            
            const initData = {
              token: token,
              userId: userInfo.id,
              worldId: userWorldId
            };
            
            console.log('[初始化向导] 设置 initializationData:', initData);
            setInitializationData(initData);
            
            // 确保 currentScreen 设置为 'entryPoint'，以便初始化向导能够显示
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
            
            console.log('[初始化向导] 设置 showInitializationWizard = true');
            setShowInitializationWizard(true);
            
            console.log('[初始化向导] ========== 初始化向导流程完成 ==========');
          } else {
            console.error('[初始化向导] worldId 为空，无法显示初始化向导');
            initializationWizardProcessedRef.current = false; // 重置标记
          }
        } else {
          if (initializationWizardProcessedRef.current) {
            console.log('[初始化向导] 已经处理过初始化向导，跳过');
          } else {
            console.log('[初始化向导] 非首次登录，跳过初始化向导');
          }
        }
        
        // 标记数据已加载，防止 useEffect 重复加载
        hasLoadedEntryPointData.current = true;
        
        // 后台异步加载远程世界数据，实现本地优先加载
        const loadRemoteWorldData = async (): Promise<void> => {
          try {
            console.log('后台加载远程世界数据...');
            
            // 获取世界列表
            const updatedWorlds = await worldApi.getAllWorlds(token);
            
            // 获取场景列表
            const updatedEras = await eraApi.getAllEras(token);
            
            // 获取角色列表
            const updatedCharacters = await characterApi.getAllCharacters(token);
            
            // 将后端数据转换为前端需要的WorldScene格式
            const userWorldScenes: WorldScene[] = [];
            
            // 按世界分组场景
            const erasByWorldId = new Map<number, typeof eras[0][]>();
            eras.forEach(era => {
              // 后端现在直接返回worldId
              const worldId = era.worldId;
              if (worldId) {
                if (!erasByWorldId.has(worldId)) {
                  erasByWorldId.set(worldId, []);
                }
                erasByWorldId.get(worldId)?.push(era);
              } else {
                console.warn('场景数据缺少worldId:', era);
              }
            });
            
            // 按场景分组角色
            const charactersByEraId = new Map<number, typeof characters[0][]>();
            characters.forEach(char => {
              // 后端现在直接返回eraId
              const eraId = char.eraId;
              if (eraId) {
                if (!charactersByEraId.has(eraId)) {
                  charactersByEraId.set(eraId, []);
                }
                charactersByEraId.get(eraId)?.push(char);
              } else {
                console.warn('角色数据缺少eraId:', char);
              }
            });
            
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
            const updatedUserWorldScenes: WorldScene[] = [];
            updatedWorlds.forEach(world => {
              const worldEras = updatedErasByWorldId.get(world.id) || [];
              
              worldEras.forEach(era => {
                const eraCharacters = updatedCharactersByEraId.get(era.id) || [];
                
                const scene: WorldScene = {
                  id: era.id.toString(),
                  name: era.name,
                  description: era.description,
                  imageUrl: era.imageUrl || '',
                  systemEraId: era.systemEraId || undefined, // 从后端获取 systemEraId
                  characters: eraCharacters.map(char => ({
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
                    tags: char.tags ? (typeof char.tags === 'string' ? char.tags.split(',').filter(tag => tag.trim()) : char.tags) : [],
                    speechStyle: char.speechStyle || '',
                    catchphrases: char.catchphrases ? (typeof char.catchphrases === 'string' ? char.catchphrases.split(',').filter(phrase => phrase.trim()) : char.catchphrases) : [],
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
            
            console.log('远程世界数据加载完成并更新到本地');
          } catch (error) {
            console.error('加载远程世界数据失败:', error);
          }
        };
        
        // 在后台定期更新远程数据
        loadRemoteWorldData();
        
        // 首次登录欢迎界面已在上面设置
      } catch (err) {
        console.error('获取用户信息或日记列表失败:', err);
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
        console.log('[初始化向导] 在else分支中检测到首次登录');
        try {
          // 先获取用户信息
          const userInfo = await authApi.getCurrentUser(token);
          console.log('[初始化向导] 获取用户信息成功:', userInfo);
        const remoteWorlds = await worldApi.getAllWorlds(token);
          console.log('[初始化向导] 获取世界列表成功:', remoteWorlds);
        let userWorldId: number | null = null;
        if (remoteWorlds && remoteWorlds.length > 0) {
          userWorldId = remoteWorlds[0].id;
            console.log('[初始化向导] 从远程世界列表获取 worldId:', userWorldId);
        } else {
            console.log('[初始化向导] 远程世界列表为空，尝试创建新世界');
          try {
              const worldName = `${userInfo.nickname || userInfo.username}的世界`;
              const newWorld = await worldApi.createWorld(worldName, '', token);
            userWorldId = newWorld.id;
              console.log('[初始化向导] 创建世界成功，worldId:', userWorldId);
          } catch (error) {
              console.error('[初始化向导] 创建世界失败:', error);
            showAlert('无法创建世界，请刷新重试');
            return;
          }
        }
        
        if (userWorldId) {
            console.log('[初始化向导] 设置初始化数据');
          setInitializationData({
            token: token,
            userId: userInfo.id,
            worldId: userWorldId
          });
          setShowInitializationWizard(true);
            console.log('[初始化向导] 已设置 showInitializationWizard = true');
          } else {
            console.error('[初始化向导] worldId 为空，无法显示初始化向导');
          }
        } catch (error) {
          console.error('[初始化向导] 初始化向导失败:', error);
        }
      }
    }
    
    setShowLoginModal(false);
    
    if (pendingActionRef.current) {
      pendingActionRef.current();
      pendingActionRef.current = () => {};
    }
  };

  // 关闭欢迎蒙层
  const handleCloseWelcomeOverlay = () => {
    dispatch({ type: 'SET_SHOW_WELCOME_OVERLAY', payload: false });
  };

  // 检查本地存储中的token，自动登录并获取日记列表
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token');
      console.log('检查本地存储中的token:', token);
      if (token) {
        try {
          console.log('尝试自动登录...');
          const userInfo = await authApi.getCurrentUser(token);
          console.log('自动登录成功:', userInfo);
          
          // 获取日记列表
          console.log('尝试获取日记列表...');
          const journalEntries = await journalApi.getAllJournalEntries(token);
          console.log('获取日记列表成功:', journalEntries);
          
          // 获取世界列表
          console.log('尝试获取世界列表...');
          const worlds = await worldApi.getAllWorlds(token);
          console.log('获取世界列表成功:', worlds);
          
          // 获取场景列表
          console.log('尝试获取场景列表...');
          const eras = await eraApi.getAllEras(token);
          console.log('获取场景列表成功:', eras);
          
          // 获取角色列表
          console.log('尝试获取角色列表...');
          const characters = await characterApi.getAllCharacters(token);
          console.log('获取角色列表成功:', characters);
          
          // 加载用户主线故事
          const userMainStories = await userMainStoryApi.getAll(token);
          
          // 使用数据转换工具将后端数据转换为前端需要的WorldScene格式
          const userWorldScenes = convertErasToWorldScenes(
            worlds,
            eras,
            characters,
            undefined, // scripts 在 checkAuth 中未加载
            userMainStories
          );
          
          console.log('转换后的用户世界场景:', userWorldScenes);
          
          // 安全检查：确保 userInfo 和 userInfo.id 存在
          if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
            console.error('用户信息无效或缺少ID:', userInfo);
            throw new Error('无法获取有效的用户信息');
          }
          
          dispatch({ type: 'SET_USER_PROFILE', payload: {
              id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
              nickname: userInfo.nickname || userInfo.username || '用户',
              avatarUrl: userInfo.avatar || '',
              isGuest: false,
          }});
          dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: journalEntries.map(entry => ({
              id: entry.id, // 直接使用后端返回的字符串id
              title: entry.title,
              content: entry.content,
              timestamp: new Date(entry.entryDate).getTime(),
              imageUrl: '',
              insight: undefined
          }))});
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
        } catch (err: any) {
          console.error('自动登录或获取日记失败:', err.message || err);
          // token无效，清除
          localStorage.removeItem('auth_token');
          // 如果之前有用户信息（可能是从localStorage恢复的），也清除
          if (gameState.userProfile && !gameState.userProfile.isGuest) {
              console.warn('[checkAuth] token无效，清除用户信息');
            dispatch({ type: 'SET_USER_PROFILE', payload: null });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
            dispatch({ type: 'SET_USER_WORLD_SCENES', payload: [] });
            dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: [] });
            dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: null });
            dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
          }
        }
      } else {
        console.log('本地存储中没有找到token，用户未登录');
        // 如果之前有用户信息（可能是从localStorage恢复的），但token不存在，清除用户信息
        if (gameState.userProfile && !gameState.userProfile.isGuest) {
            console.warn('[checkAuth] token不存在但检测到用户信息，清除用户信息');
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
  }, []);

  const handleLogout = (): void => {
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
    
    // Force immediate save to override any debounced saves
    storageService.saveState(nextState).catch(console.error);
  };


  // --- HANDLERS ---

  const handleSwitchToMobile = async (): Promise<void> => {
    // Save PC state before switching
    await storageService.saveState({ ...gameState, lastLoginTime: Date.now() });
    setIsMobileMode(true);
  };

  const handleSwitchToPC = (): void => {
    setIsMobileMode(false);
    // Note: GameStateProvider already handles loading, no need to reload here
    // loadGameData();
  };

  const handleProfileSubmit = (): void => {
    if(!profileNickname.trim()) return;
    const profile = { 
        nickname: profileNickname, 
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

  // 场景详情页面滚动容器ref
  const characterSelectionScrollRef = useRef<HTMLDivElement>(null);
  const isRestoringScrollRef = useRef(false);
  
  // 处理场景详情页面滚动位置恢复
  useEffect(() => {
    if (gameState.currentScreen === 'characterSelection' && gameState.selectedSceneId) {
      const scrollPageKey = `characterSelection:${gameState.selectedSceneId}`;
      const savedScrollPosition = gameState.pageScrollPositions[scrollPageKey] || 0;
      const container = characterSelectionScrollRef.current;
      
      // 恢复滚动位置 - 使用双重requestAnimationFrame确保在浏览器完成布局后执行
      if (container && savedScrollPosition > 0) {
        isRestoringScrollRef.current = true;
        
        // 立即设置滚动位置，避免先显示顶部
        container.scrollTop = savedScrollPosition;
        
        // 使用双重requestAnimationFrame确保在浏览器完成布局和绘制后再次确认
        const rafId1 = requestAnimationFrame(() => {
          const rafId2 = requestAnimationFrame(() => {
            if (container) {
              // 再次确认滚动位置，确保准确性
              container.scrollTop = savedScrollPosition;
            }
            // 稍长延迟后允许滚动事件触发保存，确保滚动完成
            setTimeout(() => {
              isRestoringScrollRef.current = false;
            }, 200);
          });
          return () => cancelAnimationFrame(rafId2);
        });
        
        return () => {
          cancelAnimationFrame(rafId1);
          isRestoringScrollRef.current = false;
        };
        } else {
        isRestoringScrollRef.current = false;
      }
    }
  }, [gameState.currentScreen, gameState.selectedSceneId]); // 只在页面切换时恢复
  
  // 保存场景详情页面滚动位置
  useEffect(() => {
    if (gameState.currentScreen === 'characterSelection' && gameState.selectedSceneId) {
      const scrollPageKey = `characterSelection:${gameState.selectedSceneId}`;
      const container = characterSelectionScrollRef.current;
      if (!container) return;
      
      const handleScroll = () => {
        // 如果正在恢复滚动位置，不保存
        if (isRestoringScrollRef.current) {
             return;
        }
        handleScrollPositionChange(scrollPageKey, container.scrollTop);
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [gameState.currentScreen, gameState.selectedSceneId, handleScrollPositionChange]);

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
                gameState.currentScreen === 'profileSetup' && profileNickname.trim()
                  ? profileNickname.trim()
                  : gameState.userProfile?.isGuest 
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
          {(() => {
            const shouldShowWizard = showInitializationWizard && 
                                     initializationData && 
                                     (gameState.currentScreen === 'entryPoint' || gameState.currentScreen === 'profileSetup');
            
            if (shouldShowWizard) {
              console.log('[初始化向导] ========== 渲染初始化向导组件 ==========');
              console.log('[初始化向导] showInitializationWizard:', showInitializationWizard);
              console.log('[初始化向导] currentScreen:', gameState.currentScreen);
              console.log('[初始化向导] initializationData:', initializationData);
              console.log('[初始化向导] userId:', initializationData.userId);
              console.log('[初始化向导] worldId:', initializationData.worldId);
              console.log('[初始化向导] token存在:', !!initializationData.token);
              return (
            <InitializationWizard
              token={initializationData.token}
              userId={initializationData.userId}
              worldId={initializationData.worldId}
              onComplete={async () => {
                    console.log('[初始化向导] 完成初始化，开始同步数据');
                setShowInitializationWizard(false);
                setInitializationData(null);
                    initializationWizardProcessedRef.current = false; // 重置标记
                    
                    // 显示友好的过渡效果
                    const token = localStorage.getItem('auth_token');
                    if (token) {
                      try {
                        // 重新加载数据，确保新创建的场景、角色和剧本都能显示
                        console.log('[初始化向导] 开始重新加载数据...');
                        const worlds = await worldApi.getAllWorlds(token);
                        const eras = await eraApi.getAllEras(token);
                        const characters = await characterApi.getAllCharacters(token);
                        const scripts = await scriptApi.getAllScripts(token);
                        const userMainStories = await userMainStoryApi.getAll(token);
                        
                        console.log('[初始化向导] 数据加载完成:', {
                          worlds: worlds.length,
                          eras: eras.length,
                          characters: characters.length,
                          scripts: scripts.length,
                          userMainStories: userMainStories.length
                        });
                        
                        // 更新游戏状态
                          // 重新构建 userWorldScenes
                          const erasByWorldId = new Map<number, typeof eras[0][]>();
                          eras.forEach(era => {
                            const worldId = era.worldId;
                            if (worldId) {
                              if (!erasByWorldId.has(worldId)) {
                                erasByWorldId.set(worldId, []);
                              }
                              erasByWorldId.get(worldId)?.push(era);
                            }
                          });
                          
                          const charactersByEraId = new Map<number, typeof characters[0][]>();
                          characters.forEach(char => {
                            const eraId = char.eraId;
                            if (eraId) {
                              if (!charactersByEraId.has(eraId)) {
                                charactersByEraId.set(eraId, []);
                              }
                              charactersByEraId.get(eraId)?.push(char);
                            }
                          });
                          
                          // 按场景分组剧本
                          const scriptsByEraId = new Map<number, typeof scripts[0][]>();
                          scripts.forEach(script => {
                            const eraId = script.eraId;
                            if (eraId) {
                              if (!scriptsByEraId.has(eraId)) {
                                scriptsByEraId.set(eraId, []);
                              }
                              scriptsByEraId.get(eraId)?.push(script);
                            }
                          });
                          
                          // 按场景分组用户主线剧情
                          const mainStoriesByEraId = new Map<number, typeof userMainStories[0]>();
                          userMainStories.forEach(mainStory => {
                            const eraId = mainStory.eraId;
                            if (eraId) {
                              mainStoriesByEraId.set(eraId, mainStory);
                            }
                          });
                          
                          const userWorldScenes: WorldScene[] = [];
                          worlds.forEach(world => {
                            const worldEras = erasByWorldId.get(world.id) || [];
                            worldEras.forEach(era => {
                              const eraCharacters = charactersByEraId.get(era.id) || [];
                              const eraScripts = scriptsByEraId.get(era.id) || [];
                              const eraMainStory = mainStoriesByEraId.get(era.id);
                              
                              userWorldScenes.push({
                                id: era.id.toString(),
                                name: era.name,
                                description: era.description,
                                imageUrl: era.imageUrl || '',
                                systemEraId: era.systemEraId || undefined,
                                characters: eraCharacters.map(char => ({
                                  id: char.id.toString(),
                                  name: char.name,
                                  age: char.age || 0,
                                  role: char.role || '',
                                  bio: char.bio || '',
                                  avatarUrl: char.avatarUrl || '',
                                  backgroundUrl: char.backgroundUrl || '',
                                  themeColor: char.themeColor || 'blue-500',
                                  colorAccent: char.colorAccent || '#3b82f6',
                                  firstMessage: char.firstMessage || '',
                                  systemInstruction: char.systemInstruction || '',
                                  voiceName: char.voiceName || 'Aoede',
                                  mbti: char.mbti || 'INFJ',
                                  tags: char.tags ? (typeof char.tags === 'string' ? char.tags.split(',').filter(tag => tag.trim()) : (Array.isArray(char.tags) ? char.tags : [])) : [],
                                  speechStyle: char.speechStyle || '',
                                  catchphrases: char.catchphrases ? (typeof char.catchphrases === 'string' ? char.catchphrases.split(',').filter(phrase => phrase.trim()) : (Array.isArray(char.catchphrases) ? char.catchphrases : [])) : [],
                                  secrets: char.secrets || '',
                                  motivations: char.motivations || '',
                                  relationships: char.relationships || ''
                                })),
                                mainStory: eraMainStory ? convertBackendMainStoryToCharacter(eraMainStory) : undefined,
                                scripts: eraScripts.map(script => ({
                                  id: script.id.toString(),
                                  title: script.title,
                                description: script.description || null,
                                  content: script.content,
                                  sceneCount: script.sceneCount || 0,
                                eraId: script.eraId || null,
                                worldId: script.worldId || null,
                                characterIds: script.characterIds || null,
                                tags: script.tags || null,
                                })),
                              });
                            });
                          });
                          
                        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
                        dispatch({ type: 'SET_LAST_LOGIN_TIME', payload: Date.now() });
                        
                        console.log('[初始化向导] 数据同步完成，页面已更新');
                      } catch (error) {
                        console.error('[初始化向导] 数据同步失败，使用页面刷新:', error);
                        // 如果数据同步失败，使用页面刷新作为后备方案
                window.location.reload();
                      }
                    } else {
                      // 如果没有 token，直接刷新页面
                      window.location.reload();
                    }
              }}
              onCancel={() => {
                    console.log('[初始化向导] 取消初始化');
                setShowInitializationWizard(false);
                setInitializationData(null);
                    initializationWizardProcessedRef.current = false; // 重置标记
                showAlert('你可以稍后在设置中完成初始化');
              }}
            />
              );
            }
            return null;
          })()}


      {gameState.currentScreen === 'profileSetup' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6">
           <div className="max-w-md w-full text-center space-y-8">
               <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Welcome to {APP_TITLE}</h1>
               <p className="text-gray-400">选择你的进入方式</p>
               <div className="space-y-3">
                 <Button 
                   fullWidth 
                   onClick={() => setShowGuestNicknameModal(true)}
                   className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                 >
                   以访客身份进入
                 </Button>
                 <Button 
                   fullWidth 
                   variant="secondary" 
                   onClick={() => setShowLoginModal(true)}
                   className="bg-indigo-600 hover:bg-indigo-500 text-white"
                 >
                   登录账户
                 </Button>
               </div>
               <p className="text-xs text-gray-600 mt-4">访客模式可快速体验，登录账户可同步数据。</p>
           </div>
        </div>
      )}

      {/* 访客昵称输入对话框 */}
      {showGuestNicknameModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700 p-8 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">访客体验</h3>
            <p className="text-sm text-slate-400 mb-6">输入你的昵称，以访客身份进入体验</p>
            <input
              type="text"
              value={profileNickname}
              onChange={(e) => setProfileNickname(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && profileNickname.trim()) {
                  handleProfileSubmit();
                  setShowGuestNicknameModal(false);
                }
              }}
              placeholder="请输入昵称"
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  if (profileNickname.trim()) {
                    handleProfileSubmit();
                    setShowGuestNicknameModal(false);
                  }
                }}
                disabled={!profileNickname.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
              >
                进入
              </Button>
              <Button
                onClick={() => {
                  setShowGuestNicknameModal(false);
                  setProfileNickname('');
                }}
                variant="ghost"
                className="flex-1"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
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
        <div className="h-full flex flex-col p-8 bg-gradient-to-br from-gray-900 to-black">
           <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                  <Button variant="ghost" onClick={handleEnterNexus} className="!p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </Button>
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{APP_TITLE}</h2>
                    <p className="text-gray-400 text-sm flex items-center gap-2">
                        选择一个场景切片进行连接
                        {gameState.userProfile?.isGuest && <span className="text-[10px] bg-gray-700 px-1 rounded text-gray-300">GUEST MODE</span>}
                    </p>
                  </div>
              </div>
              
              <div className="flex items-center gap-3">
                  <button
                    onClick={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'connectionSpace' })}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-900 to-indigo-900 border border-blue-500/30 text-blue-200 hover:text-white hover:border-blue-400 transition-all shadow-lg hover:shadow-blue-500/20"
                  >
                      <span className="animate-pulse">✨</span> 心域连接
                  </button>

                  <button 
                    onClick={() => setShowMailbox(true)}
                    className="relative p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"
                  >
                      <span className="text-xl">📬</span>
                      {gameState.mailbox.some(m => !m.isRead) && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-bounce" />
                      )}
                  </button>
                  <Button onClick={() => { 
                      requireAuth(() => {
                        setEditingScene(null); 
                        setShowEraCreator(true); 
                      });
                  }} className="text-sm bg-pink-600 hover:bg-pink-500">
                     + 创造新场景
                  </Button>
              </div>
           </div>

           {gameState.activeJournalEntryId && (
               <div className="mb-6 p-4 bg-indigo-900/40 border border-indigo-500/50 rounded-xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <span className="text-2xl">🎒</span>
                       <div>
                           <p className="text-indigo-200 font-bold text-sm">你正在带着问题旅行</p>
                           <p className="text-white text-xs opacity-80 truncate max-w-md">
                               {gameState.journalEntries.find(e => e.id === gameState.activeJournalEntryId)?.title}
                           </p>
                       </div>
                   </div>
                   <button onClick={() => dispatch({ type: 'SET_ACTIVE_JOURNAL_ENTRY_ID', payload: null })} className="text-xs text-indigo-300 hover:text-white underline">
                       放下问题
                   </button>
               </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-10 scrollbar-hide">
              {currentScenes.map(scene => {
                 // 判断是否是用户拥有的场景
                 // 1. 如果ID是 era_数字 格式，说明是从后端获取的用户数据
                 // 2. 如果在 customScenes 或 userWorldScenes 中，说明是用户的数据
                 const isEraId = /^era_\d+$/.test(scene.id);
                 const isCustom = gameState.customScenes.some(s => s.id === scene.id);
                 const isUserWorld = gameState.userWorldScenes.some(s => s.id === scene.id);
                 const isUserOwned = isEraId || isCustom || isUserWorld;
                 
                 return (
                    <div key={scene.id} className="relative group">
                        <SceneCard 
                            scene={scene} 
                            onSelect={() => handleSceneSelect(scene.id)}
                            onEdit={isUserOwned ? (s) => requireAuth(() => {
                                setEditingScene(s);
                                setShowEraCreator(true);
                            }) : undefined}
                            onDelete={isUserOwned ? (s) => requireAuth(() => handleDeleteEra(s.id)) : undefined}
                            isUserOwned={isUserOwned}
                        />
                        
                        
                        <button
                            onClick={(e) => openMemoryModal(e, scene)}
                            className="absolute bottom-4 right-4 z-20 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white hover:bg-pink-600 hover:border-pink-400 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-1"
                        >
                            <span>📷</span> 我的回忆
                        </button>
                    </div>
                 );
              })}
           </div>
        </div>
      )}

      {gameState.currentScreen === 'characterSelection' && currentSceneLocal && (
         <div className="h-full flex flex-col p-8 bg-gray-900">
             <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-4">
                     <Button variant="ghost" onClick={() => dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' })} className="!p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                     </Button>
                     <h2 className="text-3xl font-bold text-white">{currentSceneLocal.name}</h2>
                 </div>
                 <div className="flex gap-2">
                     <Button onClick={() => { 
                         requireAuth(() => {
                            setEditingCharacter(null); 
                            setEditingCharacterSceneId(currentSceneLocal.id); 
                            setShowCharacterCreator(true);
                         });
                     }} className="text-sm">
                        + 新增角色
                     </Button>
                 </div>
             </div>
             
             <div 
                 ref={characterSelectionScrollRef} 
                 className="flex-1 overflow-y-auto pr-4 custom-scrollbar"
                 style={{ scrollBehavior: 'auto', willChange: 'scroll-position' }}
             >
                {currentSceneLocal.mainStory && (() => {
                    // 判断主线故事是否是用户自有的
                    const isNumericId = /^\d+$/.test(currentSceneLocal.mainStory.id);
                    const isUserOwned = isNumericId; // 如果是数字ID，说明是从后端获取的用户数据
                    
                    console.log('[场景详情] 渲染主线故事卡片:', {
                        mainStoryId: currentSceneLocal.mainStory.id,
                        mainStoryName: currentSceneLocal.mainStory.name,
                        isNumericId,
                        isUserOwned,
                        hasEditButton: isUserOwned,
                        hasDeleteButton: isUserOwned,
                        sceneId: currentSceneLocal.id,
                        mainStoryObject: currentSceneLocal.mainStory
                    });
                    
                    // 确保只渲染一次，使用 key 防止重复渲染
                    return (
                        <div key={`main-story-${currentSceneLocal.mainStory.id}-${currentSceneLocal.id}`} className="mb-10 p-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                            <div className="bg-gray-900 rounded-[22px] overflow-hidden relative group">
                                 <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105" style={{backgroundImage: `url(${currentSceneLocal.mainStory.backgroundUrl})`}} />
                                 <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                                     <div className="flex-1 space-y-4">
                                         <div className="flex items-center gap-2">
                                             <div className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">主线剧情</div>
                                             {isUserOwned && (
                                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button 
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             console.log('[场景详情] 点击主线故事编辑按钮:', {
                                                                 mainStory: currentSceneLocal.mainStory,
                                                                 sceneId: currentSceneLocal.id,
                                                                 timestamp: new Date().toISOString()
                                                             });
                                                             requireAuth(() => handleEditMainStory(currentSceneLocal.mainStory!, currentSceneLocal.id));
                                                         }} 
                                                         className="p-1.5 hover:bg-white/10 rounded text-white" 
                                                         title="编辑"
                                                     >
                                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                                     </button>
                                                     <button 
                                                         onClick={(e) => {
                                                             e.stopPropagation();
                                                             console.log('[场景详情] 点击主线故事删除按钮:', {
                                                                 mainStory: currentSceneLocal.mainStory,
                                                                 sceneId: currentSceneLocal.id,
                                                                 timestamp: new Date().toISOString()
                                                             });
                                                             requireAuth(() => handleDeleteMainStory(currentSceneLocal.mainStory!, currentSceneLocal.id));
                                                         }} 
                                                         className="p-1.5 hover:bg-red-900/50 rounded text-white hover:text-red-400" 
                                                         title="删除"
                                                     >
                                                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                     </button>
                                                 </div>
                                             )}
                                         </div>
                                         <h3 className="text-3xl font-bold text-white">{currentSceneLocal.mainStory.name}</h3>
                                         <p className="text-gray-300 leading-relaxed">{currentSceneLocal.mainStory.bio}</p>
                                         <Button 
                                           onClick={() => {
                                               console.log('[场景详情] 点击"开始故事"按钮:', {
                                                   mainStory: currentSceneLocal.mainStory,
                                                   sceneId: currentSceneLocal.id,
                                                   timestamp: new Date().toISOString()
                                               });
                                               handleCharacterSelect(currentSceneLocal.mainStory!);
                                           }}
                                           className="bg-white text-black hover:bg-gray-200 mt-4 px-8"
                                         >
                                             开始故事
                                         </Button>
                                     </div>
                                     <div className="w-48 h-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-3 transition-transform group-hover:rotate-0">
                                         {currentSceneLocal.mainStory.avatarUrl && currentSceneLocal.mainStory.avatarUrl.trim() ? (
                                           <img src={currentSceneLocal.mainStory.avatarUrl} className="w-full h-full object-cover" alt="Story Cover" />
                                         ) : (
                                           <div className="w-full h-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                                             <div className="text-4xl opacity-50">📖</div>
                                           </div>
                                         )}
                                     </div>
                                 </div>
                            </div>
                        </div>
                    );
                })()}
                
                <h3 className="text-xl font-bold text-gray-400 mb-4">登场人物</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {sceneCharacters.map(char => {
                        // 判断是否是用户拥有的角色
                        // 1. 如果是数字ID，说明是从后端获取的用户数据
                        // 2. 如果在customCharacters中，说明是用户创建的数据
                        const customCharsForScene = gameState.customCharacters[currentSceneLocal.id] || [];
                        const isNumericId = /^\d+$/.test(char.id);
                        const isInCustomChars = customCharsForScene.some(c => c.id === char.id);
                        const isUserOwned = isNumericId || isInCustomChars;
                        
                        console.log('[场景详情] 渲染角色卡片:', {
                            characterId: char.id,
                            characterName: char.name,
                            isNumericId,
                            isInCustomChars,
                            isUserOwned,
                            hasEditButton: isUserOwned,
                            hasDeleteButton: isUserOwned
                        });
                        
                        return (
                            <CharacterCard 
                              key={char.id} 
                              character={char} 
                              customAvatarUrl={gameState.customAvatars[char.id]}
                              isGenerating={gameState.generatingAvatarId === char.id}
                              onSelect={(c) => {
                                  console.log('[场景详情] 点击角色卡片选择:', {
                                      characterId: c.id,
                                      characterName: c.name,
                                      sceneId: currentSceneLocal.id,
                                      timestamp: new Date().toISOString()
                                  });
                                  handleCharacterSelect(c);
                              }}
                              onGenerate={(c) => {
                                  console.log('[场景详情] 点击生成角色头像:', {
                                      characterId: c.id,
                                      characterName: c.name,
                                      timestamp: new Date().toISOString()
                                  });
                                  requireAuth(() => handleGenerateAvatar(c));
                              }}
                              onEdit={isUserOwned ? (c) => {
                                  console.log('[场景详情] 点击角色编辑按钮:', {
                                      characterId: c.id,
                                      characterName: c.name,
                                      sceneId: currentSceneLocal.id,
                                      timestamp: new Date().toISOString()
                                  });
                                  requireAuth(() => {
                                      setEditingCharacter(c);
                                      setEditingCharacterSceneId(currentSceneLocal.id);
                                      setShowCharacterCreator(true);
                                  });
                              } : undefined}
                              onDelete={isUserOwned ? (c) => {
                                  console.log('[场景详情] 点击角色删除按钮:', {
                                      characterId: c.id,
                                      characterName: c.name,
                                      sceneId: currentSceneLocal.id,
                                      timestamp: new Date().toISOString()
                                  });
                                  requireAuth(() => handleDeleteCharacter(c));
                              } : undefined}
                              isUserCreated={isUserOwned}
                            />
                        );
                    })}
                </div>

                 <div className="mt-12 mb-20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-400">剧本分支</h3>
                        <Button onClick={() => {
                            console.log('[场景详情] 点击"创建剧本"按钮:', {
                                sceneId: currentSceneLocal.id,
                                sceneName: currentSceneLocal.name,
                                timestamp: new Date().toISOString()
                            });
                            requireAuth(() => {
                                // 创建一个空的 script 对象用于新建剧本
                                // 从当前场景获取 worldId（如果场景有 worldId 字段）
                                const worldId = currentSceneLocal.worldId || null;
                                // 处理 eraId：如果是 "era_123" 格式，提取数字部分
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
                                    id: null, // 新建剧本没有 ID
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
                                
                                console.log('[场景详情] 创建新剧本，初始数据:', {
                                    eraId: eraId,
                                    worldId: worldId,
                                    sceneId: currentSceneLocal.id
                                });
                                
                                setEditingScene(null); 
                                dispatch({ type: 'SET_EDITING_SCRIPT', payload: newScript }); 
                                console.log('[场景详情] 已打开 UserScriptEditor 创建页面');
                            });
                        }} variant="secondary" className="text-xs">
                            + 创建剧本
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 合并显示剧本：优先显示本地缓存的，然后显示服务器端的（排除已在本地缓存中的） */}
                        {(() => {
                            // 获取本地缓存的剧本（该场景的）
                            const localScenarios = gameState.customScenarios.filter(s => s.sceneId === currentSceneLocal.id);
                            // 创建本地剧本ID集合（用于去重）- 使用字符串ID进行比较
                            const localScenarioIds = new Set(localScenarios.map(s => String(s.id)));
                            
                            // 获取服务器端的剧本（排除已在本地缓存中的）
                            const serverScripts = (currentSceneLocal.scripts || []).filter(script => {
                                const scriptId = String(script.id);
                                // 如果本地缓存中有相同ID的剧本，跳过服务器端的（优先使用本地缓存）
                                return !localScenarioIds.has(scriptId);
                            });
                            
                            console.log('[场景详情] 剧本合并显示:', {
                                sceneId: currentSceneLocal.id,
                                localScenariosCount: localScenarios.length,
                                localScenarioIds: Array.from(localScenarioIds),
                                serverScriptsCount: (currentSceneLocal.scripts || []).length,
                                serverScriptsAfterFilterCount: serverScripts.length,
                                willShowTotal: localScenarios.length + serverScripts.length
                            });
                            
                            // 先显示本地缓存的剧本（优先显示），然后显示服务器端的
                            const allItems: Array<{ type: 'local' | 'server', data: any }> = [
                                ...localScenarios.map(scenario => ({ type: 'local' as const, data: scenario })),
                                ...serverScripts.map(script => ({ type: 'server' as const, data: script }))
                            ];
                            
                            const mappedItems = allItems.map((item, index): React.ReactNode => {
                                // 对于本地缓存的剧本，需要转换为与服务器格式一致的结构
                                if (item.type === 'local') {
                                    const scenario = item.data;
                                    // 检查 script 对象是否有效
                                    if (!scenario || scenario.id === undefined || scenario.id === null) {
                                        console.error('[场景详情] 无效的本地剧本对象:', {
                                            scenario,
                                            sceneId: currentSceneLocal.id,
                                            timestamp: new Date().toISOString()
                                        });
                                        return null;
                                    }
                                    
                                    console.log('[场景详情] 渲染本地缓存剧本卡片:', {
                                        scenarioId: scenario.id,
                                        scenarioTitle: scenario.title,
                                        sceneId: currentSceneLocal.id,
                                        nodesCount: Object.keys(scenario.nodes || {}).length
                                    });
                                    
                                    return (
                                        <div key={`local-${scenario.id}-${index}`} className="group relative bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer hover:-translate-y-1" onClick={() => {
                                            console.log('[场景详情] 点击本地缓存剧本卡片播放:', {
                                                scenarioId: scenario.id,
                                                scenarioTitle: scenario.title,
                                                sceneId: currentSceneLocal.id,
                                                timestamp: new Date().toISOString()
                                            });
                                            handlePlayScenario(scenario);
                                        }}>
                                            <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400">{scenario.title}</h4>
                                            <p className="text-sm text-gray-400 line-clamp-3 mb-4">{scenario.description}</p>
                                            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700 pt-3">
                                                <span>By {scenario.author}</span>
                                                <span>{Object.keys(scenario.nodes || {}).length} 个节点</span>
                                            </div>
                                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                                <button onClick={(e) => {
                                                    console.log('[场景详情] 点击本地缓存剧本编辑按钮:', {
                                                        scenarioId: scenario.id,
                                                        scenarioTitle: scenario.title,
                                                        sceneId: currentSceneLocal.id,
                                                        timestamp: new Date().toISOString()
                                                    });
                                                    requireAuth(() => handleEditScenario(scenario, e));
                                                }} className="p-1.5 hover:bg-white/10 rounded text-gray-300 pointer-events-auto" title="编辑">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                                </button>
                                                <button onClick={(e) => {
                                                    console.log('[场景详情] 点击本地缓存剧本删除按钮:', {
                                                        scenarioId: scenario.id,
                                                        scenarioTitle: scenario.title,
                                                        sceneId: currentSceneLocal.id,
                                                        timestamp: new Date().toISOString()
                                                    });
                                                    handleDeleteScenario(scenario.id, e);
                                                }} className="p-1.5 hover:bg-red-900/50 rounded text-gray-300 hover:text-red-400 pointer-events-auto" title="删除">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                // 对于服务器端的剧本，使用原有逻辑
                                const script = item.data;
                            // 检查 script 对象是否有效
                            if (!script || script.id === undefined || script.id === null) {
                                    console.error('[场景详情] 无效的服务器剧本对象:', {
                                    script,
                                    sceneId: currentSceneLocal.id,
                                    timestamp: new Date().toISOString()
                                });
                                return null;
                            }
                            
                                console.log('[场景详情] 渲染服务器剧本卡片:', {
                                scriptId: script.id,
                                scriptTitle: script.title,
                                sceneId: currentSceneLocal.id,
                                hasContent: !!script.content,
                                contentLength: script.content?.length || 0
                            });
                            
                            return (
                                    <div key={`server-${script.id}-${index}`} className="group relative bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-400 transition-all cursor-pointer hover:-translate-y-1" onClick={() => {
                                console.log('[场景详情] 点击后端剧本卡片播放:', {
                                    scriptId: script.id,
                                    scriptTitle: script.title,
                                    sceneId: currentSceneLocal.id,
                                    timestamp: new Date().toISOString()
                                });
                                
                                // 将 script 转换为 CustomScenario 格式并播放
                                try {
                                    if (!script.content) {
                                        console.error('[场景详情] 剧本内容为空:', {
                                            scriptId: script.id,
                                            scriptTitle: script.title
                                        });
                                        showAlert('剧本内容为空，无法播放', '错误', 'error');
                                        return;
                                    }
                                    
                                    console.log('[场景详情] 开始解析剧本内容:', {
                                        scriptId: script.id,
                                        contentLength: script.content.length,
                                        contentPreview: script.content.substring(0, 100) + '...'
                                    });
                                    
                                    const scenarioContent = JSON.parse(script.content);
                                    console.log('[场景详情] 剧本内容解析成功:', {
                                        scriptId: script.id,
                                        nodesCount: Object.keys(scenarioContent.nodes || {}).length,
                                        startNodeId: scenarioContent.startNodeId,
                                        hasNodes: !!scenarioContent.nodes
                                    });
                                    
                                    const customScenario: CustomScenario = {
                                        id: String(script.id), // 安全转换
                                        sceneId: currentSceneLocal.id,
                                        title: script.title || '未命名剧本',
                                        description: script.title || '未命名剧本', // 使用标题作为描述
                                        nodes: scenarioContent.nodes || {},
                                        startNodeId: scenarioContent.startNodeId || Object.keys(scenarioContent.nodes || {})[0] || '',
                                        author: '用户'
                                    };
                                    
                                    console.log('[场景详情] 准备播放剧本:', {
                                        scenarioId: customScenario.id,
                                        scenarioTitle: customScenario.title,
                                        nodesCount: Object.keys(customScenario.nodes).length,
                                        startNodeId: customScenario.startNodeId
                                    });
                                    
                                    handlePlayScenario(customScenario);
                                } catch (error) {
                                    console.error('[场景详情] 解析剧本内容失败:', {
                                        scriptId: script.id,
                                        scriptTitle: script.title,
                                        error: error,
                                        errorMessage: error instanceof Error ? error.message : String(error),
                                        errorStack: error instanceof Error ? error.stack : undefined,
                                        contentPreview: script.content?.substring(0, 200),
                                        timestamp: new Date().toISOString()
                                    });
                                    showAlert('剧本格式错误，无法播放', '错误', 'error');
                                }
                            }}>
                                <div className="flex items-start justify-between mb-1">
                                    <h4 className="text-indigo-200 font-bold flex-1">{script.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                                            用户
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => {
                                                    console.log('[场景详情] 点击后端剧本编辑按钮:', {
                                                        scriptId: script.id,
                                                        scriptTitle: script.title,
                                                        sceneId: currentSceneLocal.id,
                                                        timestamp: new Date().toISOString()
                                                    });
                                                    handleEditScript(script, e);
                                                }}
                                                className="p-1.5 hover:bg-white/10 rounded text-indigo-300 pointer-events-auto" 
                                                title="编辑"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    console.log('[场景详情] 点击后端剧本删除按钮:', {
                                                        scriptId: script.id,
                                                        scriptTitle: script.title,
                                                        sceneId: currentSceneLocal.id,
                                                        timestamp: new Date().toISOString()
                                                    });
                                                    handleDeleteScript(script, e);
                                                }}
                                                className="p-1.5 hover:bg-red-900/50 rounded text-indigo-300 hover:text-red-400 pointer-events-auto" 
                                                title="删除"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-3 mb-4 mt-2">{script.title}</p>
                                <div className="flex justify-between items-center text-xs text-indigo-400/60 border-t border-indigo-500/20 pt-3">
                                    <span>用户创建</span>
                                    <span>{script.sceneCount || 0} 个场景</span>
                                </div>
                            </div>
                            );
                            });
                            
                            return mappedItems.filter((item): item is React.ReactElement => item !== null);
                        })()}
                        {/* 如果没有剧本，显示提示 */}
                        {(!currentSceneLocal.scripts || currentSceneLocal.scripts.length === 0) && 
                         gameState.customScenarios.filter(s => s.sceneId === currentSceneLocal.id).length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-500">
                                <p className="text-sm">暂无剧本，点击上方按钮创建第一个剧本</p>
                            </div>
                        )}
                    </div>
                 </div>
             </div>
         </div>
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