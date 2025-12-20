
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

const App: React.FC = () => {
  
  // --- 友好的错误提示函数 ---
  const showSyncErrorToast = (operation: string): void => {
    // 创建一个友好的错误提示
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 z-50 bg-red-600/90 text-white px-6 py-4 rounded-lg shadow-2xl border border-red-400/50 max-w-md animate-fade-in';
    toast.innerHTML = `
      <div class="flex items-start gap-3">
        <div class="text-2xl">⚠️</div>
        <div class="flex-1">
          <div class="font-bold text-lg mb-1">远程同步失败</div>
          <div class="text-sm text-red-100">${operation}已保存到本地，但未能同步到服务器。请检查网络连接后重试。</div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white text-xl leading-none">×</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    // 5秒后自动消失
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  };
  
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

  // Initial default state
  const DEFAULT_STATE: GameState = {
    currentScreen: 'profileSetup',
    userProfile: null,
    selectedSceneId: null,
    selectedCharacterId: null,
    selectedScenarioId: null,
    tempStoryCharacter: null,
    editingScenarioId: null,
    editingScript: null,
    history: {},
    customAvatars: {},
    generatingAvatarId: null,
    customCharacters: {},
    customScenarios: [EXAMPLE_SCENARIO],
    customScenes: [],
    userWorldScenes: [],
    journalEntries: [],
    activeJournalEntryId: null,
    settings: { 
      autoGenerateAvatars: false, 
      autoGenerateStoryScenes: false,
      autoGenerateJournalImages: false,
      debugMode: false,
      showNoteSync: false, // 默认不显示笔记同步按钮
      dialogueStyle: 'mobile-chat', // 默认使用即时网聊风格
      textProvider: 'gemini',
      imageProvider: 'gemini',
      videoProvider: 'gemini',
      audioProvider: 'gemini',
      enableFallback: true,
      geminiConfig: { apiKey: '', modelName: 'gemini-2.5-flash', imageModel: 'gemini-2.5-flash-image', videoModel: 'veo-3.1-fast-generate-preview' },
      openaiConfig: { apiKey: '', baseUrl: 'https://api.openai.com/v1', modelName: 'gpt-4o', imageModel: 'dall-e-3' },
      qwenConfig: { apiKey: 'sk-a486b81e29484fcea112b2c010b7bd95', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', modelName: 'qwen-max', imageModel: 'qwen-image-plus', videoModel: 'wanx-video' },
      doubaoConfig: { apiKey: '', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', modelName: 'ep-...', imageModel: 'doubao-image-v1', videoModel: 'doubao-video-v1' }
    },
    mailbox: [],
    lastLoginTime: Date.now(),
    sceneMemories: {}, 
    debugLogs: [],
    showWelcomeOverlay: false,
    worldStyle: 'anime', // 默认风格为二次元
    pageScrollPositions: {}, // 保存每个页面的滚动位置
  };

  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false); 
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEraCreator, setShowEraCreator] = useState(false);
  const [editingScene, setEditingScene] = useState<WorldScene | null>(null);
  
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [showMainStoryEditor, setShowMainStoryEditor] = useState(false);
  const [editingMainStory, setEditingMainStory] = useState<Character | null>(null);
  const [editingMainStorySceneId, setEditingMainStorySceneId] = useState<string | null>(null);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingCharacterSceneId, setEditingCharacterSceneId] = useState<string | null>(null);

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
  
  const loadGameData = async (): Promise<void> => {
      setIsLoaded(false);
      const loadedState = await storageService.loadState();
      if (loadedState) {
          const savedSettings = (loadedState.settings || {}) as Partial<AppSettings>;
          
          const mergedSettings: AppSettings = {
              ...DEFAULT_STATE.settings,
              ...savedSettings,
              geminiConfig: { ...DEFAULT_STATE.settings.geminiConfig, ...(savedSettings.geminiConfig || {}) },
              openaiConfig: { ...DEFAULT_STATE.settings.openaiConfig, ...(savedSettings.openaiConfig || {}) },
              qwenConfig: { ...DEFAULT_STATE.settings.qwenConfig, ...(savedSettings.qwenConfig || {}) },
              doubaoConfig: { ...DEFAULT_STATE.settings.doubaoConfig, ...(savedSettings.doubaoConfig || {}) },
              autoGenerateAvatars: savedSettings.autoGenerateAvatars ?? DEFAULT_STATE.settings.autoGenerateAvatars,
              autoGenerateStoryScenes: savedSettings.autoGenerateStoryScenes ?? DEFAULT_STATE.settings.autoGenerateStoryScenes,
              autoGenerateJournalImages: savedSettings.autoGenerateJournalImages ?? DEFAULT_STATE.settings.autoGenerateJournalImages,
              showNoteSync: savedSettings.showNoteSync ?? DEFAULT_STATE.settings.showNoteSync,
              dialogueStyle: savedSettings.dialogueStyle || DEFAULT_STATE.settings.dialogueStyle,
              textProvider: savedSettings.textProvider || DEFAULT_STATE.settings.textProvider,
              imageProvider: savedSettings.imageProvider || DEFAULT_STATE.settings.imageProvider,
              videoProvider: savedSettings.videoProvider || DEFAULT_STATE.settings.videoProvider,
              audioProvider: savedSettings.audioProvider || DEFAULT_STATE.settings.audioProvider,
              enableFallback: savedSettings.enableFallback ?? DEFAULT_STATE.settings.enableFallback,
          };

          setGameState(prev => ({
            ...prev,
            ...loadedState,
            currentScreen: loadedState.userProfile ? 'entryPoint' : 'profileSetup',
            generatingAvatarId: null,
            activeJournalEntryId: null,
            editingScenarioId: null,
            tempStoryCharacter: null, 
            mailbox: loadedState.mailbox || [],
            lastLoginTime: loadedState.lastLoginTime || Date.now(),
            sceneMemories: loadedState.sceneMemories || {},
            customCharacters: loadedState.customCharacters || {},
            // 注释掉：不再从本地缓存加载场景数据，每次都从数据库获取
            // userWorldScenes: loadedState.userWorldScenes || [],
            userWorldScenes: [], // 强制从数据库获取，不使用缓存
            debugLogs: [], 
            settings: mergedSettings,
            worldStyle: loadedState.worldStyle || 'anime'
          }));
          
          geminiService.updateConfig(mergedSettings);
      } else {
          geminiService.updateConfig(DEFAULT_STATE.settings);
      }
      setIsLoaded(true);
  };

  useEffect(() => {
    loadGameData();
    syncService.init(); // 初始化同步服务
  }, []);

  useEffect(() => {
    if (!isLoaded) return; 

    geminiService.updateConfig(gameState.settings);

    const timer = setTimeout(() => {
      const stateToSave = { ...gameState, lastLoginTime: Date.now() };
      storageService.saveState(stateToSave);
    }, 1000);

    return () => clearTimeout(timer);
  }, [gameState, isLoaded]);

  // Logging hook
  useEffect(() => {
      const logCallback = (log: DebugLog) => {
          setGameState((prevGameState: GameState) => ({
              ...prevGameState,
              debugLogs: [...prevGameState.debugLogs, log]
          }));
      };
      
      geminiService.setLogCallback(logCallback);
      
      // 清理函数：移除回调，防止内存泄漏
      return () => {
          geminiService.setLogCallback(() => {}); // 使用空函数代替null
      };
  }, []);

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
            setTimeout(() => loadGameData(), 200); 
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
                     setGameState(prev => ({ ...prev, mailbox: [newMail, ...prev.mailbox] }));
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
            setGameState(prev => ({ ...prev, lastLoginTime: Date.now() }));
          } else {
            console.error(`[DataLoader ${gameState.currentScreen}] 重试后token仍不存在，无法加载数据`);
            console.error(`[DataLoader ${gameState.currentScreen}] 检测到用户已登录但token丢失，清除用户信息并提示重新登录`);
            // 如果用户已登录但token丢失，清除用户信息并提示重新登录
            if (gameState.userProfile && !gameState.userProfile.isGuest) {
              console.warn(`[DataLoader ${gameState.currentScreen}] 清除无效的用户信息`);
              setGameState(prev => ({
                ...prev,
                userProfile: null,
                currentScreen: 'profileSetup',
                userWorldScenes: [],
                journalEntries: [],
                selectedSceneId: null,
                selectedCharacterId: null
              }));
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
        
        // 异步加载远程数据并同步（每次都从数据库获取，不使用缓存）
        const screenName = gameState.currentScreen; // 捕获当前屏幕名称
        const loadAndSyncWorldData = async (): Promise<void> => {
          try {
            console.log(`[DataLoader ${screenName}] 步骤1: 开始获取世界列表...`);
            const worlds = await worldApi.getAllWorlds(token);
            console.log(`[DataLoader ${screenName}] 步骤1完成: 获取世界列表成功，数量:`, worlds.length);
            console.log(`[DataLoader ${screenName}] 世界列表详情:`, JSON.stringify(worlds, null, 2));
            
            console.log(`[DataLoader ${screenName}] 步骤2: 开始获取场景列表...`);
            const eras = await eraApi.getAllEras(token);
            console.log(`[DataLoader ${screenName}] 步骤2完成: 获取场景列表成功，数量:`, eras.length);
            
            // 同时加载预置场景列表，用于匹配systemEraId
            // 不再需要加载预置场景列表，systemEraId直接从后端获取
            console.log(`[DataLoader ${screenName}] 场景列表详情（原始）:`, JSON.stringify(eras, null, 2));
            if (eras.length > 0) {
              console.log(`[DataLoader ${screenName}] 第一个场景的结构分析:`, {
                keys: Object.keys(eras[0]),
                hasWorldId: 'worldId' in eras[0],
                hasWorld: 'world' in eras[0],
                worldIdValue: (eras[0] as any).worldId,
                worldValue: (eras[0] as any).world,
                fullObject: eras[0]
              });
            }
            
            console.log(`[DataLoader ${screenName}] 步骤3: 开始获取角色列表...`);
            const characters = await characterApi.getAllCharacters(token);
            console.log(`[DataLoader ${screenName}] 步骤3完成: 获取角色列表成功，数量:`, characters.length);
            console.log(`[DataLoader ${screenName}] 角色列表详情:`, JSON.stringify(characters, null, 2));
            
            console.log(`[DataLoader ${screenName}] 步骤3.5: 开始获取剧本列表...`);
            const scripts = await scriptApi.getAllScripts(token);
            console.log(`[DataLoader ${screenName}] 步骤3.5完成: 获取剧本列表成功，数量:`, scripts.length);
            
            console.log(`[DataLoader ${screenName}] 步骤3.6: 开始获取用户主线剧情列表...`);
            const userMainStories = await userMainStoryApi.getAll(token);
            console.log(`[DataLoader ${screenName}] 步骤3.6完成: 获取用户主线剧情列表成功，数量:`, userMainStories.length);
            
            // 将后端数据转换为前端需要的WorldScene格式
            const userWorldScenes: WorldScene[] = [];
            
            console.log(`[DataLoader ${screenName}] 步骤4: 开始按世界分组场景...`);
            // 按世界分组场景
            const erasByWorldId = new Map<number, typeof eras[0][]>();
            eras.forEach(era => {
              // 尝试多种方式获取worldId
              const worldId = era.worldId || (era as any).world?.id || (era as any).worldId;
              console.log(`[DataLoader ${screenName}] 处理场景:`, { 
                eraId: era.id, 
                eraName: era.name, 
                worldId,
                eraKeys: Object.keys(era),
                eraFull: JSON.stringify(era, null, 2)
              });
              if (worldId) {
                if (!erasByWorldId.has(worldId)) {
                  erasByWorldId.set(worldId, []);
                }
                erasByWorldId.get(worldId)?.push(era);
              } else {
                console.warn(`[DataLoader ${screenName}] 场景缺少worldId，完整对象:`, JSON.stringify(era, null, 2));
                console.warn(`[DataLoader ${screenName}] 尝试从world对象获取:`, (era as any).world);
              }
            });
            console.log(`[DataLoader ${screenName}] 步骤4完成: 场景分组结果:`, Array.from(erasByWorldId.entries()).map(([k, v]) => ({ worldId: k, erasCount: v.length })));
            
            console.log(`[DataLoader ${screenName}] 步骤5: 开始按场景分组角色...`);
            // 按场景分组角色
            const charactersByEraId = new Map<number, typeof characters[0][]>();
            characters.forEach(char => {
              const eraId = char.eraId;
              console.log(`[DataLoader ${screenName}] 处理角色:`, { charId: char.id, charName: char.name, eraId });
              if (eraId) {
                if (!charactersByEraId.has(eraId)) {
                  charactersByEraId.set(eraId, []);
                }
                charactersByEraId.get(eraId)?.push(char);
              } else {
                console.warn(`[DataLoader ${screenName}] 角色缺少eraId:`, char);
              }
            });
            console.log(`[DataLoader ${screenName}] 步骤5完成: 角色分组结果:`, Array.from(charactersByEraId.entries()).map(([k, v]) => ({ eraId: k, charsCount: v.length })));
            
            console.log(`[DataLoader ${screenName}] 步骤5.5: 开始按场景分组剧本...`);
            // 按场景分组剧本
            const scriptsByEraId = new Map<number, typeof scripts[0][]>();
            scripts.forEach(script => {
              const eraId = script.eraId;
              if (eraId) {
                if (!scriptsByEraId.has(eraId)) {
                  scriptsByEraId.set(eraId, []);
                }
                scriptsByEraId.get(eraId)?.push(script);
              } else {
                console.warn(`[DataLoader ${screenName}] 剧本数据缺少eraId:`, script);
              }
            });
            console.log(`[DataLoader ${screenName}] 步骤5.5完成: 剧本分组结果:`, Array.from(scriptsByEraId.entries()).map(([k, v]) => ({ eraId: k, scriptsCount: v.length })));
            
            console.log(`[DataLoader ${screenName}] 步骤5.6: 开始按场景分组用户主线剧情...`);
            // 按场景分组用户主线剧情
            const mainStoriesByEraId = new Map<number, typeof userMainStories[0]>();
            userMainStories.forEach(mainStory => {
              const eraId = mainStory.eraId;
              if (eraId) {
                mainStoriesByEraId.set(eraId, mainStory);
              } else {
                console.warn(`[DataLoader ${screenName}] 用户主线剧情数据缺少eraId:`, mainStory);
              }
            });
            console.log(`[DataLoader ${screenName}] 步骤5.6完成: 用户主线剧情分组结果:`, Array.from(mainStoriesByEraId.entries()).map(([k, v]) => ({ eraId: k, mainStoryName: v.name })));
            
            console.log(`[DataLoader ${screenName}] 步骤6: 开始创建WorldScene对象...`);
            // 创建WorldScene对象
            worlds.forEach(world => {
              console.log(`[DataLoader ${screenName}] 处理世界:`, { worldId: world.id, worldName: world.name });
              const worldEras = erasByWorldId.get(world.id) || [];
              console.log(`[DataLoader ${screenName}] 该世界包含`, worldEras.length, '个场景');
              
              worldEras.forEach(era => {
                const eraCharacters = charactersByEraId.get(era.id) || [];
                const eraScripts = scriptsByEraId.get(era.id) || [];
                const eraMainStory = mainStoriesByEraId.get(era.id);
                // systemEraId直接从后端获取，不需要名称匹配
                console.log(`[DataLoader ${screenName}] 创建场景:`, { 
                  eraId: era.id, 
                  eraName: era.name, 
                  charactersCount: eraCharacters.length,
                  scriptsCount: eraScripts.length,
                  hasMainStory: !!eraMainStory,
                  systemEraId: era.systemEraId
                });
                
                const scene: WorldScene = {
                  id: era.id.toString(),
                  name: era.name,
                  description: era.description,
                  imageUrl: era.imageUrl || '',
                  systemEraId: era.systemEraId || undefined, // 直接从后端获取
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
                  // 从用户主线剧情表获取主线故事
                  mainStory: eraMainStory ? {
                    id: eraMainStory.id.toString(),
                    name: eraMainStory.name,
                    age: eraMainStory.age || 0,
                    role: eraMainStory.role || '叙事者',
                    bio: eraMainStory.bio || '',
                    avatarUrl: eraMainStory.avatarUrl || '',
                    backgroundUrl: eraMainStory.backgroundUrl || '',
                    themeColor: eraMainStory.themeColor || 'blue-500',
                    colorAccent: eraMainStory.colorAccent || '#3b82f6',
                    firstMessage: eraMainStory.firstMessage || '',
                    systemInstruction: eraMainStory.systemInstruction || '',
                    voiceName: eraMainStory.voiceName || 'Aoede',
                    mbti: eraMainStory.mbti || 'INFJ',
                    tags: eraMainStory.tags ? (typeof eraMainStory.tags === 'string' ? eraMainStory.tags.split(',').filter(tag => tag.trim()) : (Array.isArray(eraMainStory.tags) ? eraMainStory.tags : [])) : [],
                    speechStyle: eraMainStory.speechStyle || '',
                    catchphrases: eraMainStory.catchphrases ? (typeof eraMainStory.catchphrases === 'string' ? eraMainStory.catchphrases.split(',').filter(phrase => phrase.trim()) : (Array.isArray(eraMainStory.catchphrases) ? eraMainStory.catchphrases : [])) : [],
                    secrets: eraMainStory.secrets || '',
                    motivations: eraMainStory.motivations || '',
                    relationships: eraMainStory.relationships || ''
                  } : undefined,
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
                  scenes: [],
                  worldId: world.id
                };
                
                userWorldScenes.push(scene);
              });
            });
            
            console.log(`[DataLoader ${screenName}] 步骤6完成: 共创建`, userWorldScenes.length, '个场景');
            console.log(`[DataLoader ${screenName}] 场景详情:`, JSON.stringify(userWorldScenes.map(s => ({ id: s.id, name: s.name, worldId: s.worldId, charsCount: s.characters.length })), null, 2));
            
            console.log(`[DataLoader ${screenName}] 步骤7: 开始更新游戏状态...`);
            // 更新游戏状态，同步远程数据
            setGameState(prev => {
              console.log(`[DataLoader ${screenName}] 状态更新前:`, {
                prevUserWorldScenesCount: prev.userWorldScenes?.length || 0,
                newUserWorldScenesCount: userWorldScenes.length
              });
              return {
                ...prev,
                userWorldScenes: userWorldScenes,
                lastLoginTime: Date.now()
              };
            });
            
            console.log(`[DataLoader ${screenName}] ========== 场景数据加载并同步完成 ==========`);
            console.log(`[DataLoader ${screenName}] 最终结果: 共`, userWorldScenes.length, '个场景');
            
            // 只有在成功加载数据后才设置标志
            if (userWorldScenes.length > 0) {
              hasLoadedEntryPointData.current = true;
              console.log(`[DataLoader ${screenName}] 数据加载成功，设置标志为true`);
            } else {
              console.warn(`[DataLoader ${screenName}] 数据加载完成但场景数量为0，不设置标志`);
            }
          } catch (error) {
            console.error(`[DataLoader ${screenName}] ========== 加载场景数据失败 ==========`);
            console.error(`[DataLoader ${screenName}] 错误详情:`, error);
            if (error instanceof Error) {
              console.error(`[DataLoader ${screenName}] 错误消息:`, error.message);
              console.error(`[DataLoader ${screenName}] 错误堆栈:`, error.stack);
            }
            // 加载失败时重置标志，允许重试
            hasLoadedEntryPointData.current = false;
            console.log(`[DataLoader ${screenName}] 加载失败，重置标志为false，允许重试`);
          }
        };
        
        // 如果本地已有数据，先显示本地数据，然后后台同步
        if (gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
          console.log(`[DataLoader ${screenName}] 检测到本地已有数据，数量:`, gameState.userWorldScenes.length);
          console.log(`[DataLoader ${screenName}] 使用本地数据，后台同步远程数据`);
          loadAndSyncWorldData(); // 后台同步
        } else {
          console.log(`[DataLoader ${screenName}] 检测到本地无数据`);
          console.log(`[DataLoader ${screenName}] 本地无数据，立即加载远程数据`);
          loadAndSyncWorldData(); // 立即加载
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
        
        // 创建WorldScene对象
        remoteWorlds.forEach(world => {
          const worldEras = erasByWorldId.get(world.id) || [];
          
          worldEras.forEach(era => {
            const eraCharacters = charactersByEraId.get(era.id) || [];
            
            const scene: WorldScene = {
              id: era.id.toString(), // 使用后端返回的场景ID
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
                tags: char.tags ? (typeof char.tags === 'string' ? char.tags.split(',').filter(tag => tag.trim()) : char.tags) : [], // Ensure string[]
                speechStyle: char.speechStyle || '',
                catchphrases: char.catchphrases ? (typeof char.catchphrases === 'string' ? char.catchphrases.split(',').filter(phrase => phrase.trim()) : char.catchphrases) : [], // Ensure string[]
                secrets: char.secrets || '',
                motivations: char.motivations || '',
                relationships: char.relationships || ''
              })),
              scenes: [], // 场景实体没有scenes字段，使用空数组
              worldId: world.id
            };
            
            userWorldScenes.push(scene);
          });
        });
        
        // 安全检查：确保 userInfo 和 userInfo.id 存在
        if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
          console.error('用户信息无效或缺少ID:', userInfo);
          throw new Error('无法获取有效的用户信息');
        }
        
        // 更新用户信息和日记列表，使用远程加载的世界数据
        setGameState(prev => ({
          ...prev,
          userProfile: {
            id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
            nickname: userInfo.nickname || userInfo.username || '用户',
            avatarUrl: userInfo.avatar || '',
            email: userInfo.email || '',
            isGuest: false,
            phoneNumber: method === 'password' ? identifier : undefined,
          },
          journalEntries: journalEntries.map(entry => ({
            id: entry.id, // 直接使用后端返回的字符串id
            title: entry.title,
            content: entry.content,
            timestamp: new Date(entry.entryDate).getTime(),
            imageUrl: '',
            insight: undefined
          })),
          userWorldScenes: userWorldScenes,
          selectedSceneId: userWorldScenes.length > 0 
            ? (prev.selectedSceneId && userWorldScenes.some(scene => scene.id === prev.selectedSceneId) 
              ? prev.selectedSceneId 
              : userWorldScenes[0].id)
            : prev.selectedSceneId,
          showWelcomeOverlay: false, // 不再显示欢迎界面，改为显示初始化向导
          lastLoginTime: Date.now(),
          // 如果是首次登录，确保跳转到 entryPoint 以显示初始化向导
          // 否则，如果当前在 profileSetup 页面，登录成功后也跳转到 entryPoint
          currentScreen: (isFirstLogin || prev.currentScreen === 'profileSetup') ? 'entryPoint' : prev.currentScreen
        }));
        
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
            setGameState(prev => ({
              ...prev,
              currentScreen: 'entryPoint'
            }));
            
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
            setGameState(prev => ({
              ...prev,
              userWorldScenes: updatedUserWorldScenes,
              lastLoginTime: Date.now()
            }));
            
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
        setGameState(prev => ({
          ...prev,
          userProfile: {
            id: identifier,
            nickname: identifier,
            avatarUrl: '',
            isGuest: false,
            phoneNumber: method === 'password' ? identifier : undefined,
          },
          journalEntries: [],
          showWelcomeOverlay: !!isFirstLogin,
          // 如果当前在 profileSetup 页面，登录成功后跳转到 entryPoint
          currentScreen: prev.currentScreen === 'profileSetup' ? 'entryPoint' : prev.currentScreen
        }));
      }
    } else {
      // 没有token的情况
      setGameState(prev => ({
        ...prev,
        userProfile: {
          id: identifier,
          nickname: identifier,
          avatarUrl: '',
          isGuest: false,
          phoneNumber: method === 'password' ? identifier : undefined,
        },
        showWelcomeOverlay: false, // 不再显示欢迎界面，改为显示初始化向导
        // 如果当前在 profileSetup 页面，登录成功后跳转到 entryPoint
        currentScreen: prev.currentScreen === 'profileSetup' ? 'entryPoint' : prev.currentScreen
      }));
      
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
    setGameState(prev => ({
      ...prev,
      showWelcomeOverlay: false
    }));
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
          
          // 将后端数据转换为前端需要的WorldScene格式
          const userWorldScenes: WorldScene[] = [];
          
          // 按世界分组场景
          const erasByWorldId = new Map<number, any[]>();
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
          const charactersByEraId = new Map<number, any[]>();
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
          
          // 创建WorldScene对象
          worlds.forEach(world => {
            const worldEras = erasByWorldId.get(world.id) || [];
            
            worldEras.forEach(era => {
              const eraCharacters = charactersByEraId.get(era.id) || [];
              const eraMainStory = mainStoriesByEraId.get(era.id);
              
              const scene: WorldScene = {
                id: era.id.toString(), // 使用后端返回的场景ID
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
                  tags: char.tags ? (typeof char.tags === 'string' ? char.tags.split(',').filter(tag => tag.trim()) : char.tags) : [], // Ensure string[]
                  speechStyle: char.speechStyle || '',
                  catchphrases: char.catchphrases ? (typeof char.catchphrases === 'string' ? char.catchphrases.split(',').filter(phrase => phrase.trim()) : char.catchphrases) : [], // Ensure string[]
                  secrets: char.secrets || '',
                  motivations: char.motivations || '',
                  relationships: char.relationships || ''
                })),
                // 从用户主线剧情表获取主线故事，不使用第一个角色
                mainStory: eraMainStory ? {
                  id: eraMainStory.id.toString(),
                  name: eraMainStory.name,
                  age: eraMainStory.age !== null && eraMainStory.age !== undefined ? eraMainStory.age : 0,
                  role: eraMainStory.role || '叙事者',
                  bio: eraMainStory.bio || '',
                  avatarUrl: eraMainStory.avatarUrl || '',
                  backgroundUrl: eraMainStory.backgroundUrl || '',
                  themeColor: eraMainStory.themeColor || 'blue-500',
                  colorAccent: eraMainStory.colorAccent || '#3b82f6',
                  firstMessage: eraMainStory.firstMessage || '',
                  systemInstruction: eraMainStory.systemInstruction || '',
                  voiceName: eraMainStory.voiceName || 'Aoede',
                  mbti: eraMainStory.mbti || 'INFJ',
                  tags: eraMainStory.tags ? (typeof eraMainStory.tags === 'string' ? eraMainStory.tags.split(',').filter(tag => tag.trim()) : eraMainStory.tags) : [],
                  speechStyle: eraMainStory.speechStyle || '',
                  catchphrases: eraMainStory.catchphrases ? (typeof eraMainStory.catchphrases === 'string' ? eraMainStory.catchphrases.split(',').filter(phrase => phrase.trim()) : eraMainStory.catchphrases) : [],
                  secrets: eraMainStory.secrets || '',
                  motivations: eraMainStory.motivations || '',
                  relationships: eraMainStory.relationships || ''
                } : undefined
              };
              
              userWorldScenes.push(scene);
            });
          });
          
          console.log('转换后的用户世界场景:', userWorldScenes);
          
          // 安全检查：确保 userInfo 和 userInfo.id 存在
          if (!userInfo || userInfo.id === undefined || userInfo.id === null) {
            console.error('用户信息无效或缺少ID:', userInfo);
            throw new Error('无法获取有效的用户信息');
          }
          
          setGameState(prev => ({
            ...prev,
            userProfile: {
              id: String(userInfo.id), // 使用 String() 而不是 toString()，更安全
              nickname: userInfo.nickname || userInfo.username || '用户',
              avatarUrl: userInfo.avatar || '',
              email: userInfo.email || '',
              isGuest: false,
            },
            journalEntries: journalEntries.map(entry => ({
              id: entry.id, // 直接使用后端返回的字符串id
              title: entry.title,
              content: entry.content,
              timestamp: new Date(entry.entryDate).getTime(),
              imageUrl: '',
              insight: undefined
            })),
            // 使用从后端获取的世界场景，而不是本地预置数据
            userWorldScenes: userWorldScenes,
            // 如果有选中的场景ID，确保它存在于后端数据中，否则选择第一个场景
            selectedSceneId: userWorldScenes.length > 0 
              ? (prev.selectedSceneId && userWorldScenes.some(scene => scene.id === prev.selectedSceneId) 
                ? prev.selectedSceneId 
                : userWorldScenes[0].id)
              : prev.selectedSceneId
          }));
        } catch (err: any) {
          console.error('自动登录或获取日记失败:', err.message || err);
          // token无效，清除
          localStorage.removeItem('auth_token');
          // 如果之前有用户信息（可能是从localStorage恢复的），也清除
          setGameState(prev => {
            if (prev.userProfile && !prev.userProfile.isGuest) {
              console.warn('[checkAuth] token无效，清除用户信息');
              return {
                ...prev,
                userProfile: null,
                currentScreen: 'profileSetup',
                userWorldScenes: [],
                journalEntries: [],
                selectedSceneId: null,
                selectedCharacterId: null
              };
            }
            return prev;
          });
        }
      } else {
        console.log('本地存储中没有找到token，用户未登录');
        // 如果之前有用户信息（可能是从localStorage恢复的），但token不存在，清除用户信息
        setGameState(prev => {
          if (prev.userProfile && !prev.userProfile.isGuest) {
            console.warn('[checkAuth] token不存在但检测到用户信息，清除用户信息');
            return {
              ...prev,
              userProfile: null,
              currentScreen: 'profileSetup',
              userWorldScenes: [],
              journalEntries: [],
              selectedSceneId: null,
              selectedCharacterId: null
            };
          }
          return prev;
        });
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
    setGameState(nextState);
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
    // Reload data to pick up changes from mobile
    loadGameData();
  };

  const handleProfileSubmit = (): void => {
    if(!profileNickname.trim()) return;
    const profile = { 
        nickname: profileNickname, 
        avatarUrl: '',
        isGuest: true, 
        id: `guest_${Date.now()}`
    }; 
    setGameState(prev => ({
        ...prev,
        userProfile: profile,
        currentScreen: 'entryPoint'
    }));
  };

  const handleEnterNexus = (): void => {
     setGameState(prev => ({ ...prev, currentScreen: 'entryPoint' }));
  };

  const handleEnterRealWorld = (): void => {
    setGameState(prev => ({ ...prev, currentScreen: 'realWorld' }));
  };

  const handleSceneSelect = useCallback((sceneId: string): void => {
    console.log('[handleSceneSelect] 选择场景:', sceneId, '当前选中:', gameState.selectedSceneId);
    performSceneSwitch(sceneId);
  }, [gameState.selectedSceneId]);

  const performSceneSwitch = (sceneId: string): void => {
    // 更新UI状态
    setGameState(prev => ({ 
        ...prev, 
        selectedSceneId: sceneId, 
        selectedCharacterId: null,
        tempStoryCharacter: null,
        selectedScenarioId: null,
        currentScreen: 'characterSelection' 
    }));
    
    // 如果是登录用户，异步加载该世界的场景数据
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 使用setTimeout确保在状态更新后执行
      setTimeout(async () => {
        try {
          setGameState(prev => {
            const userProfile = prev.userProfile;
            if (!userProfile || userProfile.isGuest) return prev;
            
            // 找到当前场景对应的世界ID
            // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
            const currentScenes = prev.userWorldScenes && prev.userWorldScenes.length > 0
              ? [...prev.userWorldScenes, ...prev.customScenes]
              : (prev.userProfile && !prev.userProfile.isGuest)
                ? [...prev.customScenes] // 登录用户但没有场景时，只使用自定义场景
                : [...WORLD_SCENES, ...prev.customScenes]; // 游客使用体验场景
            const selectedScene = currentScenes.find(s => s.id === sceneId);
            const worldId = (selectedScene as any)?.worldId;
            
            if (worldId) {
              console.log(`[handleSceneSelect] 按世界ID加载场景数据: worldId=${worldId}, sceneId=${sceneId}`);
              
              // 异步加载数据
              (async () => {
                try {
                  // 按世界ID获取场景列表
                  const eras = await eraApi.getErasByWorldId(worldId, token);
                  console.log(`[handleSceneSelect] 获取到场景数据:`, eras);
                  
                  // 按世界ID获取角色列表
                  const characters = await characterApi.getCharactersByWorldId(worldId, token);
                  console.log(`[handleSceneSelect] 获取到角色数据:`, characters);
                  
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
                  const charactersByEraId = new Map<number, any[]>();
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
                  
                  // 更新该世界的场景和角色数据
                  setGameState(prevState => {
                    const updatedScenes = (prevState.userWorldScenes || []).map(scene => {
                      // 找到属于当前世界的场景
                      const era = eras.find(e => e.id.toString() === scene.id);
                      if (era) {
                        const eraCharacters = charactersByEraId.get(era.id) || [];
                        const eraMainStory = mainStoriesByEraId.get(era.id);
                        return {
                          ...scene,
                          systemEraId: era.systemEraId || scene.systemEraId || undefined, // 从后端获取 systemEraId，如果后端没有则保留原有值
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
                          // 从用户主线剧情表获取主线故事，保留原有的 mainStory 作为后备
                          mainStory: eraMainStory ? {
                            id: eraMainStory.id.toString(),
                            name: eraMainStory.name,
                            age: eraMainStory.age || 0,
                            role: eraMainStory.role || '叙事者',
                            bio: eraMainStory.bio || '',
                            avatarUrl: eraMainStory.avatarUrl || '',
                            backgroundUrl: eraMainStory.backgroundUrl || '',
                            themeColor: eraMainStory.themeColor || 'blue-500',
                            colorAccent: eraMainStory.colorAccent || '#3b82f6',
                            firstMessage: eraMainStory.firstMessage || '',
                            systemInstruction: eraMainStory.systemInstruction || '',
                            voiceName: eraMainStory.voiceName || 'Aoede',
                            mbti: eraMainStory.mbti || 'INFJ',
                            tags: eraMainStory.tags ? (typeof eraMainStory.tags === 'string' ? eraMainStory.tags.split(',').filter(tag => tag.trim()) : eraMainStory.tags) : [],
                            speechStyle: eraMainStory.speechStyle || '',
                            catchphrases: eraMainStory.catchphrases ? (typeof eraMainStory.catchphrases === 'string' ? eraMainStory.catchphrases.split(',').filter(phrase => phrase.trim()) : eraMainStory.catchphrases) : [],
                            secrets: eraMainStory.secrets || '',
                            motivations: eraMainStory.motivations || '',
                            relationships: eraMainStory.relationships || ''
                          } : scene.mainStory // 如果没有从后端加载到，保留原有的 mainStory
                        };
                      }
                      return scene;
                    });
                    
                    console.log(`[handleSceneSelect] 场景数据更新完成，更新了 ${updatedScenes.length} 个场景`);
                    
                    return {
                      ...prevState,
                      userWorldScenes: updatedScenes
                    };
                  });
                } catch (error) {
                  console.error(`[handleSceneSelect] 加载场景数据失败:`, error);
                }
              })();
            }
            
            return prev;
          });
        } catch (error) {
          console.error(`[handleSceneSelect] 处理失败:`, error);
        }
      }, 0);
    }
  };


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
             setGameState(prev => ({
                ...prev,
                history: {
                    ...prev.history,
                    [character.id]: [contextMsg]
                },
                selectedCharacterId: character.id,
                tempStoryCharacter: null,
                selectedScenarioId: null, 
                currentScreen: 'chat'
             }));
             return;
        }
    }

    setGameState(prev => ({ 
        ...prev, 
        selectedCharacterId: character.id, 
        tempStoryCharacter: null, 
        selectedScenarioId: null, 
        currentScenarioState: undefined,
        currentScreen: 'chat' 
    }));
  }, [gameState.activeJournalEntryId, gameState.journalEntries]);

  const handleChatWithCharacterByName = async (characterName: string): Promise<void> => {
    // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
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
        setGameState(prev => ({
            ...prev,
            selectedSceneId: foundSceneId,
            selectedCharacterId: foundChar!.id,
            tempStoryCharacter: null,
            selectedScenarioId: null,
            currentScreen: 'chat'
        }));
    } else {
        showAlert(`无法找到名为 "${characterName}" 的角色。可能该角色所在的场景已被删除。`, '角色未找到', 'warning');
    }
  };

  const handleChatBack = useCallback((echo?: JournalEcho) => {
    if (echo && gameState.activeJournalEntryId) {
        setGameState(prev => ({
            ...prev,
            journalEntries: prev.journalEntries.map(entry => 
                entry.id === prev.activeJournalEntryId 
                ? { ...entry, echo: echo } 
                : entry
            ),
            activeJournalEntryId: null,
            selectedCharacterId: null, 
            tempStoryCharacter: null, 
            selectedScenarioId: null, 
            currentScreen: 'realWorld'
        }));
    } else {
        setGameState(prev => ({ 
            ...prev, 
            selectedCharacterId: null, 
            tempStoryCharacter: null, 
            selectedScenarioId: null, 
            currentScenarioState: undefined,
            currentScreen: 'characterSelection' 
        }));
    }
  }, [gameState.activeJournalEntryId]);

  const handleUpdateHistory = useCallback((msgs: Message[]) => {
    if (!gameState.selectedCharacterId) return;
    setGameState(prev => ({
      ...prev,
      history: { ...prev.history, [prev.selectedCharacterId!]: msgs }
    }));
  }, [gameState.selectedCharacterId]);

  // 处理滚动位置更新
  const handleScrollPositionChange = useCallback((pageKey: string, position: number) => {
    setGameState(prev => ({
      ...prev,
      pageScrollPositions: {
        ...prev.pageScrollPositions,
        [pageKey]: position
      }
    }));
  }, []);

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

  const handleGenerateAvatar = async (character: Character) => {
    if (gameState.generatingAvatarId) return;
    setGameState(prev => ({ ...prev, generatingAvatarId: character.id }));
    try {
      const newAvatarUrl = await geminiService.generateCharacterImage(character);
      if (newAvatarUrl) {
        setGameState(prev => ({
          ...prev,
          customAvatars: { ...prev.customAvatars, [character.id]: newAvatarUrl }
        }));
      }
    } catch (e) {
      console.error("Avatar gen failed", e);
    } finally {
      setGameState(prev => ({ ...prev, generatingAvatarId: null }));
    }
  };

  const handleSaveEra = async (newScene: WorldScene) => {
    // 1. 先保存到本地（立即更新UI）
    const isNumericId = /^\d+$/.test(newScene.id);
    const isEditing = isNumericId && editingScene;
    
    // 如果是编辑现有场景，直接更新；如果是新建，只添加到customScenes（临时）
    setGameState(prev => {
      if (isEditing) {
        // 编辑模式：更新两个列表
        return {
          ...prev,
          customScenes: prev.customScenes.map(s => s.id === newScene.id ? newScene : s),
          userWorldScenes: (prev.userWorldScenes || []).map(s => s.id === newScene.id ? newScene : s)
        };
      } else {
        // 新建模式：只添加到customScenes（临时ID），同步成功后会移到userWorldScenes
        const existsInCustomScenes = prev.customScenes.some(s => s.id === newScene.id);
        if (existsInCustomScenes) {
          return {
            ...prev,
            customScenes: prev.customScenes.map(s => s.id === newScene.id ? newScene : s)
          };
        } else {
          return {
            ...prev,
            customScenes: [...prev.customScenes, newScene]
          };
        }
      }
    });

    setShowEraCreator(false);
    setEditingScene(null);

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    if (!token || !gameState.userProfile || gameState.userProfile.isGuest) {
      return; // 游客模式，只保存到本地
    }

    // 异步同步，不阻塞UI
    (async () => {
      try {
        // 获取用户的默认世界ID（通常是"心域"世界）
        let worldId: number | null = null;
        
        // 如果场景有worldId，使用它
        if (newScene.worldId) {
          worldId = newScene.worldId;
        } else {
          // 否则，获取用户的第一个世界（通常是"心域"）
          const worlds = await worldApi.getAllWorlds(token);
          if (worlds.length > 0) {
            worldId = worlds[0].id; // 使用第一个世界（通常是默认的"心域"）
          } else {
            console.error('用户没有世界，无法同步场景');
            showSyncErrorToast('场景');
            return;
          }
        }

        // 判断是创建还是更新
        const eraId = isNumericId ? parseInt(newScene.id, 10) : null;

        let savedEra: any;
        if (eraId && isEditing) {
          // 更新现有场景
          console.log(`[handleSaveEra] 同步更新场景: eraId=${eraId}, worldId=${worldId}`);
          savedEra = await eraApi.updateEra(eraId, {
            name: newScene.name,
            description: newScene.description,
            startYear: undefined,
            endYear: undefined,
            worldId: worldId,
            imageUrl: newScene.imageUrl || undefined,
            systemEraId: newScene.systemEraId || null,
          }, token);
        } else {
          // 创建新场景
          console.log(`[handleSaveEra] 同步创建场景: worldId=${worldId}`);
          savedEra = await eraApi.createEra({
            name: newScene.name,
            description: newScene.description,
            startYear: undefined,
            endYear: undefined,
            worldId: worldId,
            imageUrl: newScene.imageUrl || undefined,
            systemEraId: newScene.systemEraId || null,
          }, token);
        }

        console.log(`[handleSaveEra] 后端同步成功:`, savedEra);

        // 将后端返回的场景转换为WorldScene格式并更新本地状态
        const updatedScene: WorldScene = {
          id: savedEra.id.toString(),
          name: savedEra.name,
          description: savedEra.description,
          imageUrl: savedEra.imageUrl || newScene.imageUrl || '',
          characters: newScene.characters || [],
          worldId: savedEra.worldId,
          mainStory: newScene.mainStory,
          systemEraId: savedEra.systemEraId || newScene.systemEraId || undefined // 优先使用后端返回的 systemEraId
        };

        // 更新本地状态（使用服务器返回的ID）
        setGameState(prev => {
          // 移除临时ID的场景（从customScenes和userWorldScenes中）
          const updatedUserWorldScenes = (prev.userWorldScenes || [])
            .filter(s => s.id !== newScene.id) // 移除临时ID
            .filter(s => s.id !== updatedScene.id.toString()) // 避免重复
            .concat([updatedScene]); // 添加服务器返回的场景

          const updatedCustomScenes = prev.customScenes
            .filter(s => s.id !== newScene.id) // 移除临时ID
            .filter(s => s.id !== updatedScene.id.toString()); // 避免重复，服务器场景不应该在customScenes中

          return {
            ...prev,
            userWorldScenes: updatedUserWorldScenes,
            customScenes: updatedCustomScenes
          };
        });
      } catch (error) {
        console.error('[handleSaveEra] 同步场景失败:', error);
        showSyncErrorToast('场景');
      }
    })();
  };

  const handleDeleteEra = async (sceneId: string, e?: React.MouseEvent) => {
      if (e) {
          e.stopPropagation();
          e.preventDefault();
      }
      // 注意：确认对话框已在调用方（SceneCard 或 EraConstructorModal）中处理，这里不再重复显示
          // 1. 先删除本地（立即更新UI）
          setGameState(prev => ({
              ...prev,
              customScenes: prev.customScenes.filter(s => s.id !== sceneId),
              userWorldScenes: (prev.userWorldScenes || []).filter(s => s.id !== sceneId),
              customCharacters: Object.fromEntries(
                 Object.entries(prev.customCharacters).filter(([id]) => id !== sceneId)
              )
          }));
          setShowEraCreator(false);
          setEditingScene(null);

          // 2. 异步同步到服务器（如果已登录且ID是数字）
          const token = localStorage.getItem('auth_token');
          const isNumericId = /^\d+$/.test(sceneId);
          if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
              (async () => {
                  try {
                      const eraId = parseInt(sceneId, 10);
                      await eraApi.deleteEra(eraId, token);
                      console.log('Era deleted from server:', eraId);
                  } catch (error) {
                      console.error('Failed to delete era from server:', error);
                      showSyncErrorToast('场景删除');
                  }
              })();
      }
  };

  const handleSaveCharacter = async (newCharacter: Character) => {
    console.log("========== [App] 保存角色 ==========");
    
    const sceneId = gameState.selectedSceneId || editingCharacterSceneId;
    console.log("[App] 角色信息:", {
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
        console.error("[App] 保存角色失败: 没有场景上下文");
        return;
    }
    
    // 检查是否是编辑主线故事
    const isEditingMainStory = editingMainStory !== null;
    
    // 检查角色ID的来源
    // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
    const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
      ? [...gameState.userWorldScenes, ...gameState.customScenes]
      : [...WORLD_SCENES, ...gameState.customScenes];
    const currentScene = allScenes.find(s => s.id === sceneId);
    const existingCharInScene = currentScene?.characters.find(c => c.id === newCharacter.id);
    const existingCharInCustom = (gameState.customCharacters[sceneId] || []).find(c => c.id === newCharacter.id);
    const existingMainStory = currentScene?.mainStory;
    const isEditing = !!(existingCharInScene || existingCharInCustom) || isEditingMainStory;
    
    console.log("[App] 角色来源检查:", {
      sceneId: sceneId,
      existingCharInScene: existingCharInScene ? { id: existingCharInScene.id, idType: typeof existingCharInScene.id, name: existingCharInScene.name } : null,
      existingCharInCustom: existingCharInCustom ? { id: existingCharInCustom.id, idType: typeof existingCharInCustom.id, name: existingCharInCustom.name } : null,
      newCharacterId: newCharacter.id,
      newCharacterIdType: typeof newCharacter.id,
      isEditing: isEditing
    });
    
    // 1. 先保存到本地（立即更新UI）
    console.log("[App] 步骤1: 保存到本地状态");
    
    if (isEditingMainStory) {
        // 更新主线故事
        setGameState(prev => {
            const updatedUserWorldScenes = prev.userWorldScenes.map(scene => {
                if (scene.id === sceneId) {
                    return {
                        ...scene,
                        mainStory: newCharacter
                    };
                }
                return scene;
            });
            
            return {
                ...prev,
                userWorldScenes: updatedUserWorldScenes
            };
        });
    } else {
        // 更新角色
        setGameState(prev => {
            const existingCustomChars = prev.customCharacters[sceneId] || [];
            
            let newChars: Character[] = [];
            if (isEditing) {
                // 更新现有角色
                // 如果角色在 userWorldScenes 中，不需要更新 customCharacters（因为会从后端重新加载）
                // 只需要更新 customCharacters 中的角色
                newChars = existingCustomChars.map(c => c.id === newCharacter.id ? newCharacter : c);
                console.log(`[App] 更新角色: ${newCharacter.id}`);
            } else {
                // 添加新角色
                newChars = [...existingCustomChars, newCharacter];
                console.log(`[App] 添加新角色: ${newCharacter.id}`);
            }

            console.log(`[App] 场景 ${sceneId} 现在有 ${newChars.length} 个角色`);
            return {
                ...prev,
                customCharacters: {
                    ...prev.customCharacters,
                    [sceneId]: newChars
                }
            };
        });
    }
    
    setShowCharacterCreator(false);
    setEditingCharacter(null);
    setEditingCharacterSceneId(null);
    setEditingMainStory(null);
    setEditingMainStorySceneId(null);
    console.log("[App] 步骤1完成: 本地状态已更新");

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    console.log(`[App] 步骤2: 同步到服务器, token存在=${!!token}, isGuest=${isGuest}`);
    
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
        (async () => {
            try {
                console.log("[App] 开始同步角色到服务器");
                
                // 获取当前场景对应的 worldId 和 eraId
                // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
      const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
        ? [...gameState.userWorldScenes, ...gameState.customScenes]
        : [...WORLD_SCENES, ...gameState.customScenes];
                const currentScene = allScenes.find(s => s.id === sceneId);
                const worldId = currentScene?.worldId || syncService.getWorldIdForSceneId(sceneId);
                const eraId = sceneId ? (isNaN(parseInt(sceneId)) ? null : parseInt(sceneId)) : null;
                
                console.log(`[App] 同步参数: sceneId=${sceneId}, worldId=${worldId}, eraId=${eraId}`);
                
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
                            avatarUrl: newCharacter.avatarUrl,
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
                        console.log(`[App] 主线故事更新成功: ID=${mainStoryId}`);
                    } else {
                        // 创建新主线故事
                        const createdMainStory = await userMainStoryApi.create({
                            name: newCharacter.name,
                            age: newCharacter.age,
                            role: newCharacter.role,
                            bio: newCharacter.bio,
                            avatarUrl: newCharacter.avatarUrl,
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
                            eraId: eraId || 0,
                        }, token);
                        console.log(`[App] 主线故事创建成功: ID=${createdMainStory.id}`);
                        
                        // 更新本地状态中的主线故事ID
                        setGameState(prev => {
                            const updatedUserWorldScenes = prev.userWorldScenes.map(scene => {
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
                            
                            return {
                                ...prev,
                                userWorldScenes: updatedUserWorldScenes
                            };
                        });
                    }
                } else {
                    // 同步角色
                    const syncResult = await syncService.handleLocalDataChange('character', {
                        ...newCharacter,
                        description: newCharacter.bio,
                        age: newCharacter.age,
                        gender: newCharacter.role,
                        worldId: worldId,
                        eraId: eraId
                    });
                
                    // 如果创建了新角色，更新本地状态中的角色ID为服务器返回的数字ID
                    if (syncResult && syncResult.id && !isEditing) {
                        console.log(`[App] 新角色已创建，更新本地ID: ${newCharacter.id} -> ${syncResult.id}`);
                        setGameState(prev => {
                            const existingCustomChars = prev.customCharacters[sceneId] || [];
                            const updatedChars = existingCustomChars.map(c => 
                                c.id === newCharacter.id 
                                    ? { ...c, id: syncResult.id.toString() }
                                    : c
                            );
                            return {
                                ...prev,
                                customCharacters: {
                                    ...prev.customCharacters,
                                    [sceneId]: updatedChars
                                }
                            };
                        });
                    }
                    
                    console.log(`[App] 角色同步成功: ID=${newCharacter.id}, name=${newCharacter.name}`);
                }
                
                // 3. 刷新角色列表，更新显示
                console.log("[App] 步骤3: 刷新角色列表");
                try {
                    const updatedCharacters = await characterApi.getAllCharacters(token);
                    console.log(`[App] 获取到 ${updatedCharacters.length} 个角色`);
                    
                    // 重新构建 userWorldScenes，更新角色数据
                    const worlds = await worldApi.getAllWorlds(token);
                    const eras = await eraApi.getAllEras(token);
                    
                    // 按世界分组场景
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
                    
                    // 按场景分组角色
                    const charactersByEraId = new Map<number, typeof updatedCharacters[0][]>();
                    updatedCharacters.forEach(char => {
                        const eraId = char.eraId;
                        if (eraId) {
                            if (!charactersByEraId.has(eraId)) {
                                charactersByEraId.set(eraId, []);
                            }
                            charactersByEraId.get(eraId)?.push(char);
                        }
                    });
                    
                    // 加载预置场景列表，用于匹配systemEraId
                    let systemEras: Array<{ id: number; name: string }> = [];
                    try {
                      systemEras = await eraApi.getSystemEras();
                    } catch (err) {
                      console.warn('[App] 获取预置场景列表失败:', err);
                    }
                    const eraNameToSystemId = new Map<string, number>();
                    systemEras.forEach(sysEra => {
                      eraNameToSystemId.set(sysEra.name, sysEra.id);
                      // 支持模糊匹配：去除"我的"前缀进行匹配
                      const nameWithoutPrefix = sysEra.name.replace(/^我的/, '').trim();
                      if (nameWithoutPrefix && nameWithoutPrefix !== sysEra.name) {
                        eraNameToSystemId.set(nameWithoutPrefix, sysEra.id);
                      }
                      // 支持"XX场景"格式匹配（如"大学场景"匹配"我的大学"）
                      if (nameWithoutPrefix && !nameWithoutPrefix.endsWith('场景')) {
                        eraNameToSystemId.set(nameWithoutPrefix + '场景', sysEra.id);
                      }
                    });
                    
                    // 加载用户主线故事
                    const userMainStories = await userMainStoryApi.getAll(token);
                    const mainStoriesByEraId = new Map<number, typeof userMainStories[0]>();
                    userMainStories.forEach(mainStory => {
                        const eraId = mainStory.eraId;
                        if (eraId) {
                            mainStoriesByEraId.set(eraId, mainStory);
                        }
                    });
                    
                    // 创建新的 userWorldScenes，保留原有的 mainStory 和 memories
                    const updatedUserWorldScenes: WorldScene[] = [];
                    worlds.forEach(world => {
                        const worldEras = erasByWorldId.get(world.id) || [];
                        worldEras.forEach(era => {
                            const eraCharacters = charactersByEraId.get(era.id) || [];
                            const eraMainStory = mainStoriesByEraId.get(era.id);
                            
                            // 查找原有的场景，保留 mainStory 和 memories
                            const existingScene = gameState.userWorldScenes.find(s => s.id === era.id.toString());
                            
                            // systemEraId直接从后端获取，优先使用原有值
                            const systemEraId = existingScene?.systemEraId || era.systemEraId || undefined;
                            console.log(`[App] 刷新角色列表 - 场景:`, {
                              eraId: era.id,
                              eraName: era.name,
                              existingSystemEraId: existingScene?.systemEraId,
                              backendSystemEraId: era.systemEraId,
                              finalSystemEraId: systemEraId,
                              hasMainStory: !!eraMainStory,
                              mainStoryId: eraMainStory?.id
                            });
                            
                            const mappedCharacters = eraCharacters.map(char => ({
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
                            }));
                            
                            // 优先使用从后端加载的 mainStory，如果没有则保留原有的，最后才使用第一个角色
                            let finalMainStory: Character | undefined = undefined;
                            if (eraMainStory) {
                                // 从后端加载的 mainStory
                                finalMainStory = {
                                    id: eraMainStory.id.toString(),
                                    name: eraMainStory.name,
                                    age: eraMainStory.age || 0,
                                    role: eraMainStory.role || '叙事者',
                                    bio: eraMainStory.bio || '',
                                    avatarUrl: eraMainStory.avatarUrl || '',
                                    backgroundUrl: eraMainStory.backgroundUrl || '',
                                    themeColor: eraMainStory.themeColor || 'blue-500',
                                    colorAccent: eraMainStory.colorAccent || '#3b82f6',
                                    firstMessage: eraMainStory.firstMessage || '',
                                    systemInstruction: eraMainStory.systemInstruction || '',
                                    voiceName: eraMainStory.voiceName || 'Aoede',
                                    mbti: eraMainStory.mbti || 'INFJ',
                                    tags: eraMainStory.tags ? (typeof eraMainStory.tags === 'string' ? eraMainStory.tags.split(',').filter(tag => tag.trim()) : eraMainStory.tags) : [],
                                    speechStyle: eraMainStory.speechStyle || '',
                                    catchphrases: eraMainStory.catchphrases ? (typeof eraMainStory.catchphrases === 'string' ? eraMainStory.catchphrases.split(',').filter(phrase => phrase.trim()) : eraMainStory.catchphrases) : [],
                                    secrets: eraMainStory.secrets || '',
                                    motivations: eraMainStory.motivations || '',
                                    relationships: eraMainStory.relationships || ''
                                };
                            } else if (existingScene?.mainStory) {
                                // 保留原有的 mainStory
                                finalMainStory = existingScene.mainStory;
                            }
                            // 不再使用第一个角色作为 mainStory，避免重复显示
                            
                            const scene: WorldScene = {
                                id: era.id.toString(),
                                name: era.name,
                                description: era.description,
                                imageUrl: era.imageUrl || '',
                                systemEraId: systemEraId, // 直接从后端获取
                                characters: mappedCharacters,
                                mainStory: finalMainStory,
                                // 保留原有的 memories
                                memories: existingScene?.memories,
                                scenes: [],
                                worldId: world.id
                            };
                            updatedUserWorldScenes.push(scene);
                        });
                    });
                    
                    // 更新游戏状态，同时保留 sceneMemories，并清除已同步到后端的角色（避免重复显示）
                    setGameState(prev => {
                        // 收集所有已同步到后端的角色信息（用于去重）
                        const syncedCharacterIds = new Set<string>();
                        const syncedCharacterKeys = new Set<string>(); // 使用 name+avatarUrl 作为唯一标识
                        
                        updatedUserWorldScenes.forEach(scene => {
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
                        Object.keys(prev.customCharacters).forEach(sceneId => {
                            const sceneChars = prev.customCharacters[sceneId] || [];
                            // 移除已同步的角色：ID是数字且在已同步列表中，或者名称+头像匹配已同步角色
                            cleanedCustomCharacters[sceneId] = sceneChars.filter(char => {
                                const isSyncedById = /^\d+$/.test(char.id) && syncedCharacterIds.has(char.id);
                                const charKey = `${char.name}|${char.avatarUrl || ''}`;
                                const isSyncedByKey = syncedCharacterKeys.has(charKey);
                                
                                if (isSyncedById || isSyncedByKey) {
                                    console.log(`[App] 从customCharacters中移除已同步的角色: ${char.id} (${char.name})`);
                                    return false;
                                }
                                return true;
                            });
                        });
                        
                        return {
                            ...prev,
                            userWorldScenes: updatedUserWorldScenes,
                            customCharacters: cleanedCustomCharacters
                        };
                    });
                    
                    console.log(`[App] 角色列表已刷新，共 ${updatedUserWorldScenes.length} 个场景`);
                } catch (refreshError) {
                    console.error("[App] 刷新角色列表失败:", refreshError);
                    // 刷新失败不影响主流程，只记录错误
                }
            } catch (error: any) {
                console.error(`[App] 角色同步失败: ID=${newCharacter.id}`, error);
                // 显示详细的错误信息
                const errorMessage = error.message || '未知错误';
                showAlert(`角色同步失败: ${errorMessage}`, '同步失败', 'error');
                showSyncErrorToast('角色');
            }
        })();
    } else {
        console.log("[App] 跳过服务器同步: 未登录或游客模式");
    }
  };

  const handleSaveScenario = async (scenario: CustomScenario) => {
    if (!gameState.selectedSceneId && !gameState.editingScenarioId) return;
    
    const sceneId = gameState.selectedSceneId || gameState.customScenarios.find(s => s.id === scenario.id)?.sceneId;
    if (!sceneId) return;

    const completeScenario = { ...scenario, sceneId };
    
    // Update local state immediately for UI responsiveness
    setGameState(prev => {
        const exists = prev.customScenarios.some(s => s.id === scenario.id);
        let newScenarios = [...prev.customScenarios];
        if (exists) {
            newScenarios = newScenarios.map(s => s.id === scenario.id ? completeScenario : s);
        } else {
            newScenarios.push(completeScenario);
        }
        return {
            ...prev,
            customScenarios: newScenarios,
            currentScreen: prev.currentScreen === 'builder' ? 'characterSelection' : prev.currentScreen, 
            editingScenarioId: null
        };
    });

    // 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
      (async () => {
        try {
          await syncService.handleLocalDataChange('scenario', completeScenario);
          console.log('Scenario synced with server:', completeScenario.id);
        } catch (error) {
          console.error('Error syncing scenario:', error);
          showSyncErrorToast('剧本');
        }
      })();
    }
  };

  const handleDeleteCharacter = async (character: Character) => {
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
          setGameState(prev => {
              const customChars = prev.customCharacters[sceneId] || [];
              // 同时更新 userWorldScenes 中的角色列表
              const updatedUserWorldScenes = prev.userWorldScenes.map(scene => {
                  if (scene.id === sceneId) {
                      return {
                          ...scene,
                          characters: scene.characters.filter(c => c.id !== character.id)
                      };
                  }
                  return scene;
              });
              
              return {
                  ...prev,
                  customCharacters: {
                      ...prev.customCharacters,
                      [sceneId]: customChars.filter(c => c.id !== character.id)
                  },
                  userWorldScenes: updatedUserWorldScenes
              };
          });

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
  };

  const handleDeleteScenario = async (scenarioId: string, e: React.MouseEvent) => {
      e.stopPropagation(); 
      e.preventDefault();
      const confirmed = await showConfirm("确定要删除这个剧本吗？删除后将移至回收站，可以随时恢复。", '删除剧本', 'warning');
      if (confirmed) {
          // Update local state immediately for UI responsiveness
          setGameState(prev => {
              // 使用字符串比较确保ID类型一致，删除所有匹配的scenario（防止有重复的相同ID）
              const scenarioIdStr = String(scenarioId);
              const remainingScenarios = prev.customScenarios.filter(s => String(s.id) !== scenarioIdStr);
              
              console.log('[App] handleDeleteScenario - 删除scenario:', {
                  scenarioId,
                  scenarioIdStr,
                  beforeCount: prev.customScenarios.length,
                  afterCount: remainingScenarios.length,
                  deletedCount: prev.customScenarios.length - remainingScenarios.length
              });
              
              return {
              ...prev,
                  customScenarios: remainingScenarios,
                  editingScenarioId: String(prev.editingScenarioId) === scenarioIdStr ? null : prev.editingScenarioId,
                  selectedScenarioId: String(prev.selectedScenarioId) === scenarioIdStr ? null : prev.selectedScenarioId
              };
          });

          // Sync with server
          try {
            await scriptApi.deleteScript(parseInt(scenarioId), localStorage.getItem('auth_token') || '');
            console.log('Scenario deleted from server:', scenarioId);
          } catch (error) {
            console.error('Error deleting scenario from server:', error);
            // Show error message to user
            showAlert('剧本删除同步失败，请检查网络连接或稍后重试。', '同步失败', 'error');
          }
      }
  };

  const handleEditScenario = (scenario: CustomScenario, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setGameState(prev => ({
          ...prev,
          editingScenarioId: scenario.id,
          currentScreen: 'builder'
      }));
  };

  // 处理主线故事编辑
  const handleEditMainStory = async (mainStory: Character, sceneId: string) => {
      console.log('========== [场景详情] 编辑主线故事 ==========');
      console.log('[场景详情] handleEditMainStory 调用:', {
          mainStoryId: mainStory.id,
          mainStoryName: mainStory.name,
          sceneId: sceneId,
          userProfile: gameState.userProfile ? {
              id: gameState.userProfile.id,
              nickname: gameState.userProfile.nickname,
              isGuest: gameState.userProfile.isGuest
          } : null,
          timestamp: new Date().toISOString()
      });
      
      if (!gameState.userProfile || gameState.userProfile.isGuest) {
          console.warn('[场景详情] 编辑主线故事失败: 用户未登录或为游客');
          showAlert('请先登录才能编辑主线故事', '需要登录', 'warning');
          return;
      }
      
      try {
          console.log('[场景详情] 设置编辑状态:', {
              editingMainStory: mainStory,
              editingMainStorySceneId: sceneId
          });
          
          setEditingMainStory(mainStory);
          setEditingMainStorySceneId(sceneId);
          setShowMainStoryEditor(true);
          
          console.log('[场景详情] 状态已设置，MainStoryEditor 应该显示');
          console.log('========== [场景详情] 编辑主线故事完成 ==========');
      } catch (error) {
          console.error('[场景详情] 编辑主线故事出错:', {
              error: error,
              errorMessage: error instanceof Error ? error.message : String(error),
              errorStack: error instanceof Error ? error.stack : undefined,
              mainStory: mainStory,
              sceneId: sceneId,
              timestamp: new Date().toISOString()
          });
          showAlert('打开编辑器失败，请稍后重试', '错误', 'error');
      }
  };

  // 处理主线故事删除
  const handleDeleteMainStory = async (mainStory: Character, sceneId: string) => {
      if (!gameState.userProfile || gameState.userProfile.isGuest) {
          showAlert('请先登录才能删除主线故事', '需要登录', 'warning');
          return;
      }
      
      const confirmed = await showConfirm("确定要删除这个主线故事吗？删除后将移至回收站，可以随时恢复。", '删除主线故事', 'warning');
      if (confirmed) {
          // 1. 先删除本地（立即更新UI）
          setGameState(prev => {
              const updatedUserWorldScenes = prev.userWorldScenes.map(scene => {
                  if (scene.id === sceneId) {
                      return {
                          ...scene,
                          mainStory: undefined
                      };
                  }
                  return scene;
              });
              
              return {
                  ...prev,
                  userWorldScenes: updatedUserWorldScenes
              };
          });

          // 2. 异步同步到服务器（如果已登录且ID是数字）
          const token = localStorage.getItem('auth_token');
          const isNumericId = /^\d+$/.test(mainStory.id);
          if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
              (async () => {
                  try {
                      const mainStoryId = parseInt(mainStory.id, 10);
                      await userMainStoryApi.delete(mainStoryId, token);
                      console.log('Main story deleted from server:', mainStoryId);
                      showAlert('主线故事已删除', '删除成功', 'success');
                  } catch (error) {
                      console.error('Failed to delete main story from server:', error);
                      showAlert('主线故事删除同步失败，请检查网络连接或稍后重试。', '同步失败', 'error');
                  }
              })();
          }
      }
  };

  // 处理从后端加载的剧本编辑
  const handleEditScript = async (script: any, e: React.MouseEvent) => {
      console.log('========== [场景详情] 编辑后端剧本 ==========');
      console.log('[场景详情] handleEditScript 调用:', {
          script: script,
          scriptId: script?.id,
          scriptTitle: script?.title,
          sceneId: gameState.selectedSceneId,
          userProfile: gameState.userProfile ? {
              id: gameState.userProfile.id,
              nickname: gameState.userProfile.nickname,
              isGuest: gameState.userProfile.isGuest
          } : null,
          timestamp: new Date().toISOString()
      });
      
      e.stopPropagation();
      e.preventDefault();
      
      if (!gameState.userProfile || gameState.userProfile.isGuest) {
          console.warn('[场景详情] 编辑剧本失败: 用户未登录或为游客');
          showAlert('请先登录才能编辑剧本', '需要登录', 'warning');
          return;
      }
      
      // 检查 script 对象是否有效
      if (!script || script.id === undefined || script.id === null) {
          console.error('[场景详情] 无效的剧本对象:', {
              script: script,
              scriptType: typeof script,
              scriptKeys: script ? Object.keys(script) : [],
              timestamp: new Date().toISOString()
          });
          showAlert('剧本数据无效，无法编辑', '错误', 'error');
          return;
      }
      
      // 直接设置 editingScript，使用 UserScriptEditor 组件
      console.log('[场景详情] 准备打开 UserScriptEditor 编辑剧本:', {
              scriptId: script.id,
              scriptTitle: script.title,
          eraId: script.eraId,
          worldId: script.worldId
          });
          
          setGameState(prev => ({
              ...prev,
          editingScript: script
          }));
          
      console.log('[场景详情] 已打开 UserScriptEditor 编辑页面');
          console.log('========== [场景详情] 编辑后端剧本完成 ==========');
  };

  // 处理从后端加载的剧本删除
  const handleDeleteScript = async (script: any, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      
      if (!gameState.userProfile || gameState.userProfile.isGuest) {
          showAlert('请先登录才能删除剧本', '需要登录', 'warning');
          return;
      }
      
      // 检查 script 对象是否有效
      if (!script || script.id === undefined || script.id === null) {
          console.error('无效的剧本对象:', script);
          showAlert('剧本数据无效，无法删除', '错误', 'error');
          return;
      }
      
      const confirmed = await showConfirm("确定要删除这个剧本吗？删除后将移至回收站，可以随时恢复。", '删除剧本', 'warning');
      if (confirmed) {
          // 1. 先删除本地（立即更新UI）
          const currentSceneId = gameState.selectedSceneId || '';
          setGameState(prev => {
              const updatedUserWorldScenes = prev.userWorldScenes.map(scene => {
                  if (scene.id === currentSceneId) {
                      return {
                          ...scene,
                          scripts: (scene.scripts || []).filter(s => String(s.id) !== String(script.id))
                      };
                  }
                  return scene;
              });
              
              return {
                  ...prev,
                  userWorldScenes: updatedUserWorldScenes
              };
          });

          // 2. 异步同步到服务器
          const token = localStorage.getItem('auth_token');
          if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
              try {
                  // 确保 script.id 是数字
                  const scriptId = typeof script.id === 'string' ? parseInt(script.id, 10) : script.id;
                  if (isNaN(scriptId)) {
                      throw new Error('无效的剧本ID');
                  }
                  await scriptApi.deleteScript(scriptId, token);
                  console.log('Script deleted from server:', scriptId);
                  showAlert('剧本已删除', '删除成功', 'success');
              } catch (error) {
                  console.error('Error deleting script from server:', error);
                  showAlert('剧本删除同步失败，请检查网络连接或稍后重试。', '同步失败', 'error');
              }
          }
      }
  };

  const handlePlayScenario = (scenario: CustomScenario) => {
      let startNode = scenario.nodes[scenario.startNodeId];
      
      // Fallback if startNodeId is invalid
      if (!startNode) {
          const firstKey = Object.keys(scenario.nodes)[0];
          if (firstKey) {
              startNode = scenario.nodes[firstKey];
          } else {
              showAlert("错误：该剧本没有有效节点。", '错误', 'error');
              return;
          }
      }
      
      // 登录用户只使用 userWorldScenes，不包含 WORLD_SCENES（体验场景）
      const allScenes = gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes && gameState.userWorldScenes.length > 0
        ? [...gameState.userWorldScenes, ...gameState.customScenes]
        : [...WORLD_SCENES, ...gameState.customScenes];
      const scene = allScenes.find(s => s.id === gameState.selectedSceneId);
      const sceneImage = scene?.imageUrl || 'https://picsum.photos/seed/default_bg/1080/1920';

      const narrator: Character = {
          id: `narrator_${scenario.id}`,
          name: '旁白',
          age: 0,
          role: 'Narrator',
          bio: 'AI Narrator',
          avatarUrl: sceneImage, 
          backgroundUrl: sceneImage, 
          systemInstruction: 'You are the narrator.',
          themeColor: 'gray-500',
          colorAccent: '#6b7280',
          firstMessage: startNode.prompt || '...', 
          voiceName: 'Kore'
      };

      geminiService.resetSession(narrator.id);

      // 判断scenario是否是从后端script转换来的（ID是纯数字字符串）
      // 从后端script转换的scenario不应该被添加到customScenarios中，避免创建新剧本
      const isFromBackendScript = /^\d+$/.test(scenario.id);
      
      setGameState(prev => {
          // 优先使用customScenarios中已存在的scenario对象（确保使用最新版本）
          const existingScenario = prev.customScenarios.find(s => {
              // 使用字符串比较确保类型一致
              return String(s.id) === String(scenario.id);
          });
          
          // 详细调试日志
          console.log('[App] handlePlayScenario - 查找 existingScenario:', {
              scenarioId: scenario.id,
              scenarioIdType: typeof scenario.id,
              customScenariosCount: prev.customScenarios.length,
              customScenariosIds: prev.customScenarios.map(s => ({ id: s.id, idType: typeof s.id, title: s.title })),
              foundExistingScenario: !!existingScenario,
              existingScenarioId: existingScenario?.id,
              existingScenarioNodesCount: existingScenario ? Object.keys(existingScenario.nodes || {}).length : 0
          });
          
          // 使用已存在的scenario（如果存在），否则使用传入的scenario
          const scenarioToUse = existingScenario || scenario;
          
          // 使用scenarioToUse来获取startNode，确保节点数据是最新的
          const actualStartNode = scenarioToUse.nodes[scenarioToUse.startNodeId];
          const actualStartNodeId = actualStartNode ? scenarioToUse.startNodeId : (Object.keys(scenarioToUse.nodes)[0] || '');
          
          // 检查是否已有历史记录（保留上次退出时的内容）
          const existingHistory = prev.history[narrator.id] || [];
          const hasExistingHistory = existingHistory.length > 0;
          
          // 如果是从后端script转换来的，需要临时添加到customScenarios中（但标记为临时，不会被持久化）
          // 对于手动创建的剧本，如果已存在则不做任何修改（避免复制）
          let updatedCustomScenarios = prev.customScenarios;
          if (isFromBackendScript) {
              // 后端script转换的scenario：临时添加到customScenarios中以便ChatWindow访问
              // 如果已经存在（可能是之前添加的），则更新它；否则添加
              const existingIndex = updatedCustomScenarios.findIndex(s => String(s.id) === String(scenarioToUse.id));
              if (existingIndex >= 0) {
                  // 更新已存在的临时scenario
                  updatedCustomScenarios = updatedCustomScenarios.map((s, idx) => 
                      idx === existingIndex ? scenarioToUse : s
                  );
              } else {
                  // 添加新的临时scenario
                  updatedCustomScenarios = [...updatedCustomScenarios, scenarioToUse];
              }
          }
          // 对于手动创建的剧本：
          // - 如果 existingScenario 存在，说明已经在 customScenarios 中，不做任何修改（避免复制）
          // - 如果 existingScenario 不存在，也不应该在 handlePlayScenario 中添加（应该在 handleSaveScenario 中保存）
          // 所以这里不添加手动创建的剧本，避免复制
          
          // 重要：确保 customScenarios 中没有重复的相同ID的scenario（防止意外复制）
          // 对所有类型的scenario都进行去重检查
          const duplicateCount = updatedCustomScenarios.filter(s => String(s.id) === String(scenarioToUse.id)).length;
          if (duplicateCount > 1) {
              console.warn('[App] ⚠️ 警告：发现重复的scenario ID，正在去重:', {
                  scenarioId: scenarioToUse.id,
                  scenarioTitle: scenarioToUse.title,
                  duplicateCount,
                  isFromBackendScript,
                  willDeduplicate: true
              });
              // 去重：只保留第一个出现的scenario（保留原有的）
              const seenIds = new Set<string>();
              updatedCustomScenarios = updatedCustomScenarios.filter(s => {
                  const id = String(s.id);
                  if (seenIds.has(id)) {
                      console.log('[App] 移除重复的scenario:', { id, title: s.title });
                      return false; // 重复的，移除
                  }
                  seenIds.add(id);
                  return true;
              });
          }
          
          // 对于手动创建的剧本，额外确保：如果 existingScenario 存在，updatedCustomScenarios 必须保持不变
          if (!isFromBackendScript && existingScenario) {
              // 手动创建的剧本已存在，强制使用原有的列表，不进行任何添加或修改
              // 这确保即使有bug也不会复制
              const finalCount = updatedCustomScenarios.filter(s => String(s.id) === String(scenarioToUse.id)).length;
              if (finalCount !== 1) {
                  console.error('[App] ❌ 错误：手动创建的剧本去重后数量异常:', {
                      scenarioId: scenarioToUse.id,
                      finalCount,
                      willReset: true
                  });
                  // 如果去重后仍然异常，强制使用原始列表（但去重）
                  const seenIds2 = new Set<string>();
                  updatedCustomScenarios = prev.customScenarios.filter(s => {
                      const id = String(s.id);
                      if (seenIds2.has(id)) return false;
                      seenIds2.add(id);
                      return true;
                  });
              }
          }
          
          // 确定起始节点：如果有历史记录，尝试从currentScenarioState恢复；否则使用startNode
          let currentNodeId = actualStartNodeId || startNode.id;
          if (hasExistingHistory && prev.currentScenarioState?.scenarioId === String(scenarioToUse.id)) {
              // 如果有历史记录且是同一个scenario，尝试恢复节点
              const savedNodeId = prev.currentScenarioState.currentNodeId;
              if (scenarioToUse.nodes[savedNodeId]) {
                  currentNodeId = savedNodeId;
              }
          }
          
          console.log('[App] handlePlayScenario - scenario处理:', {
              scenarioId: scenarioToUse.id,
              scenarioTitle: scenarioToUse.title,
              isFromBackendScript,
              existsInCustomScenarios: !!existingScenario,
              usingExistingScenario: !!existingScenario,
              willUpdateCustomScenarios: isFromBackendScript || (!existingScenario && !isFromBackendScript),
              customScenariosCount: prev.customScenarios.length,
              updatedCustomScenariosCount: updatedCustomScenarios.length,
              hasExistingHistory,
              historyLength: existingHistory.length,
              currentNodeId,
              restoredFromHistory: hasExistingHistory && currentNodeId !== actualStartNodeId,
              nodesCount: Object.keys(scenarioToUse.nodes || {}).length
          });
          
          return {
          ...prev,
              customScenarios: updatedCustomScenarios,
          selectedCharacterId: narrator.id,
          tempStoryCharacter: narrator, 
              selectedScenarioId: String(scenarioToUse.id),  // 确保ID是字符串类型
              currentScenarioState: { scenarioId: String(scenarioToUse.id), currentNodeId },
              // 保留历史记录：如果有就保留，没有才重置为空数组
              history: { 
                  ...prev.history, 
                  [narrator.id]: hasExistingHistory ? existingHistory : []
              }, 
          currentScreen: 'chat'
          };
      });
  };

  const handleAddJournalEntry = async (title: string, content: string, imageUrl?: string, insight?: string, tags?: string) => {
      // 1. 先保存到本地（立即更新UI）
      const newEntry: JournalEntry = {
          id: `entry_${Date.now()}`,
          title,
          content,
          timestamp: Date.now(),
          imageUrl,
          insight,
          tags
      };
      
      setGameState(prev => ({
          ...prev,
          journalEntries: [...prev.journalEntries, newEntry]
      }));

      // 2. 异步同步到服务器（如果已登录）
      const token = localStorage.getItem('auth_token');
      if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
          (async () => {
              try {
                  const apiRequestData: any = {
                      title,
                      content,
                      entryDate: new Date().toISOString()
                  };
                  if (tags) {
                      apiRequestData.tags = tags;
                  }
                  
                  const savedEntry = await journalApi.createJournalEntry(apiRequestData, token);
                  
                  // 更新本地状态（使用服务器返回的ID）
                  setGameState(prev => ({
                      ...prev,
                      journalEntries: prev.journalEntries.map(e => 
                          e.id === newEntry.id 
                              ? { ...e, id: savedEntry.id.toString() }
                              : e
                      )
                  }));
                  
                  console.log('Journal entry synced with server:', savedEntry.id);
              } catch (error) {
                  console.error('Failed to sync journal entry with server:', error);
                  showSyncErrorToast('日志');
              }
          })();
      }
  };

  const handleUpdateJournalEntry = async (updatedEntry: JournalEntry) => {
      // 1. 先保存到本地（立即更新UI）
      setGameState(prev => ({
          ...prev,
          journalEntries: prev.journalEntries.map(e => e.id === updatedEntry.id ? updatedEntry : e)
      }));

      // 2. 异步同步到服务器（如果已登录且ID是数字）
      const token = localStorage.getItem('auth_token');
      const isNumericId = /^\d+$/.test(updatedEntry.id);
      if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
          (async () => {
              try {
                  const apiRequestData: any = {
                      title: updatedEntry.title,
                      content: updatedEntry.content,
                      entryDate: new Date(updatedEntry.timestamp).toISOString()
                  };
                  if (updatedEntry.tags) {
                      apiRequestData.tags = updatedEntry.tags;
                  }
                  
                  await journalApi.updateJournalEntry(updatedEntry.id, apiRequestData, token);
                  console.log('Journal entry synced with server:', updatedEntry.id);
              } catch (error) {
                  console.error('Failed to sync journal entry with server:', error);
                  showSyncErrorToast('日志');
              }
          })();
      }
  };

  const handleDeleteJournalEntry = async (id: string) => {
      // 1. 先删除本地（立即更新UI）
      setGameState(prev => ({
          ...prev,
          journalEntries: prev.journalEntries.filter(e => e.id !== id)
      }));

      // 2. 异步同步到服务器（如果已登录且ID是数字）
      const token = localStorage.getItem('auth_token');
      const isNumericId = /^\d+$/.test(id);
      if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
          (async () => {
              try {
                  await journalApi.deleteJournalEntry(id, token);
                  console.log('Journal entry deleted from server:', id);
              } catch (error) {
                  console.error('Failed to delete journal entry from server:', error);
                  showSyncErrorToast('日志删除');
              }
          })();
      }
  };

  const handleExploreWithEntry = (entry: JournalEntry): void => {
      setGameState(prev => ({
          ...prev,
          activeJournalEntryId: entry.id,
          currentScreen: 'sceneSelection'
      }));
  };

  const handleConsultMirror = async (content: string, recentContext: string[]): Promise<string | null> => {
      if (gameState.userProfile?.isGuest) {
          requireAuth(() => {
                showAlert("登录成功！请再次点击「本我镜像」以开始分析。", '登录成功', 'success');
          });
          return null;
      }
      
      return geminiService.generateMirrorInsight(content, recentContext);
  };

  const handleMarkMailRead = (mailId: string): void => {
      setGameState((prev: GameState) => ({
          ...prev,
          mailbox: prev.mailbox.map(m => m.id === mailId ? { ...m, isRead: true } : m)
      }));
  };

  const handleAddMemory = (content: string, imageUrl?: string): void => {
    if (!memoryScene) return;
    const newMemory: EraMemory = {
        id: `mem_${Date.now()}`,
        content,
        imageUrl,
        timestamp: Date.now()
    };
    
    setGameState(prev => {
        const existingMemories = prev.sceneMemories[memoryScene.id] || [];
        return {
            ...prev,
            sceneMemories: {
                ...prev.sceneMemories,
                [memoryScene.id]: [...existingMemories, newMemory]
            }
        };
    });
  };

  const handleDeleteMemory = (memoryId: string): void => {
     if (!memoryScene) return;
     setGameState(prev => {
         const existingMemories = prev.sceneMemories[memoryScene.id] || [];
         return {
             ...prev,
             sceneMemories: {
                 ...prev.sceneMemories,
                 [memoryScene.id]: existingMemories.filter(m => m.id !== memoryId)
             }
         };
     });
  };

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
                        setGameState(prev => {
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
                                mainStory: eraMainStory ? {
                                  id: eraMainStory.id.toString(),
                                  name: eraMainStory.name,
                                  age: eraMainStory.age || 0,
                                  role: eraMainStory.role || '叙事者',
                                  bio: eraMainStory.bio || '',
                                  avatarUrl: eraMainStory.avatarUrl || '',
                                  backgroundUrl: eraMainStory.backgroundUrl || '',
                                  themeColor: eraMainStory.themeColor || 'blue-500',
                                  colorAccent: eraMainStory.colorAccent || '#3b82f6',
                                  firstMessage: eraMainStory.firstMessage || '',
                                  systemInstruction: eraMainStory.systemInstruction || '',
                                  voiceName: eraMainStory.voiceName || 'Aoede',
                                  mbti: eraMainStory.mbti || 'INFJ',
                                  tags: eraMainStory.tags ? (typeof eraMainStory.tags === 'string' ? eraMainStory.tags.split(',').filter(tag => tag.trim()) : (Array.isArray(eraMainStory.tags) ? eraMainStory.tags : [])) : [],
                                  speechStyle: eraMainStory.speechStyle || '',
                                  catchphrases: eraMainStory.catchphrases ? (typeof eraMainStory.catchphrases === 'string' ? eraMainStory.catchphrases.split(',').filter(phrase => phrase.trim()) : (Array.isArray(eraMainStory.catchphrases) ? eraMainStory.catchphrases : [])) : [],
                                  secrets: eraMainStory.secrets || '',
                                  motivations: eraMainStory.motivations || '',
                                  relationships: eraMainStory.relationships || ''
                                } : undefined,
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
                          
                          return {
                            ...prev,
                            userWorldScenes,
                            lastLoginTime: Date.now(),
                          };
                        });
                        
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
              setGameState(prev => ({ ...prev, currentScreen: screen }));
            }} 
            nickname={gameState.userProfile?.nickname || ''} 
            onOpenSettings={() => setShowSettingsModal(true)}
            onSwitchToMobile={handleSwitchToMobile}
            currentStyle={gameState.worldStyle}
            onStyleChange={(style) => {
              setGameState(prev => ({ ...prev, worldStyle: style }));
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
              setGameState(prev => ({
                ...prev,
                userProfile: profile,
                currentScreen: 'entryPoint'
              }));
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
             onExplore={handleExploreWithEntry}
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
             onBack={() => setGameState(prev => ({ ...prev, currentScreen: 'sceneSelection' }))}
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
                         setGameState(prev => ({
                             ...prev,
                             selectedSceneId: sceneId,
                             selectedCharacterId: character.id,
                             currentScreen: 'chat'
                         }));
                     }
                 });
             }}
          />
      )}

      {gameState.currentScreen === 'admin' && (
          <Suspense fallback={<LoadingScreen />}>
          <AdminScreen 
             gameState={gameState}
             onUpdateGameState={(newState) => setGameState(newState)}
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
                    onClick={() => setGameState(prev => ({ ...prev, currentScreen: 'connectionSpace' }))}
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
                   <button onClick={() => setGameState(prev => ({...prev, activeJournalEntryId: null}))} className="text-xs text-indigo-300 hover:text-white underline">
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
                     <Button variant="ghost" onClick={() => setGameState(prev => ({...prev, currentScreen: 'sceneSelection'}))} className="!p-2">
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
                                setGameState(prev => ({
                                    ...prev,
                                    editingScript: newScript
                                })); 
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
            setGameState(prev => {
              const newScenarioState = prev.currentScenarioState 
                ? { ...prev.currentScenarioState, currentNodeId: nodeId }
                : { scenarioId: prev.selectedScenarioId || '', currentNodeId: nodeId };
              console.log('[App] 更新 scenarioState:', newScenarioState);
              return { ...prev, currentScenarioState: newScenarioState };
            });
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
            onCancel={() => setGameState(prev => ({...prev, currentScreen: 'characterSelection', editingScenarioId: null}))}
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
                          setGameState(prev => {
                              const updatedScenes = prev.userWorldScenes.map(scene => {
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
                              return {
                                  ...prev,
                                  userWorldScenes: updatedScenes,
                                  editingScript: null
                              };
                          });
                      } catch (error) {
                          console.error('刷新剧本数据失败:', error);
                      }
                      setGameState(prev => ({ ...prev, editingScript: null }));
                  }}
                  onCancel={() => {
                      setGameState(prev => ({ ...prev, editingScript: null }));
                  }}
              />
          );
      })()}

      {showSettingsModal && (
        <SettingsModal 
          settings={gameState.settings} 
          gameState={gameState}
          onSettingsChange={(newSettings) => setGameState(prev => ({ ...prev, settings: newSettings }))}
          onUpdateProfile={(profile) => setGameState(prev => ({ ...prev, userProfile: profile }))}
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
                  setGameState(prev => ({
                    ...prev,
                    userWorldScenes: worlds.map(w => ({
                      id: `era_${w.id}`,
                      name: w.name,
                      description: w.description || '',
                      imageUrl: '',
                      characters: []
                    })),
                    customScenes: eras.map(e => ({
                      id: `era_${e.id}`,
                      name: e.name,
                      description: e.description || '',
                      imageUrl: e.imageUrl || '',
                      characters: []
                    })),
                    customCharacters: {} // 需要重新组织角色数据
                  }));
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
             onClear={() => setGameState(prev => ({...prev, debugLogs: []}))}
             onClose={() => setGameState(prev => ({...prev, settings: {...prev.settings, debugMode: false}}))}
          />
      )}
      
      {/* 全局对话框 */}
      <GlobalDialogs />
      
    </div>
  );
};

export default App;