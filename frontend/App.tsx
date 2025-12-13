
import React, { useState, useEffect, useRef } from 'react';
import { WORLD_SCENES, APP_TITLE } from './constants';
import { ChatWindow } from './components/ChatWindow';
import { ScenarioBuilder } from './components/ScenarioBuilder';
import { SettingsModal } from './components/SettingsModal';
import { CharacterCard } from './components/CharacterCard';
import { SceneCard } from './components/SceneCard';
import { Character, GameState, Message, CustomScenario, AppSettings, WorldScene, JournalEntry, JournalEcho, Mail, EraMemory, DebugLog } from './types';
import { geminiService } from './services/gemini';
import { storageService } from './services/storage';
import { authApi, journalApi, characterApi, scriptApi, worldApi, eraApi } from './services/api';
import { syncService } from './services/syncService';
import { EraConstructorModal } from './components/EraConstructorModal';
import { CharacterConstructorModal } from './components/CharacterConstructorModal';
import { EntryPoint } from './components/EntryPoint';
import { RealWorldScreen } from './components/RealWorldScreen';
import { MailboxModal } from './components/MailboxModal';
import { EraMemoryModal } from './components/EraMemoryModal';
import { Button } from './components/Button';
import { DebugConsole } from './components/DebugConsole';
import { ConnectionSpace } from './components/ConnectionSpace';
import { AdminScreen } from './admin/AdminScreen';
import { LoginModal } from './components/LoginModal';
import { MobileApp } from './mobile/MobileApp';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { RecycleBinModal } from './components/RecycleBinModal';

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
  };

  const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false); 
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEraCreator, setShowEraCreator] = useState(false);
  const [editingScene, setEditingScene] = useState<WorldScene | null>(null); 
  
  const [showCharacterCreator, setShowCharacterCreator] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingCharacterSceneId, setEditingCharacterSceneId] = useState<string | null>(null);

  const [showMailbox, setShowMailbox] = useState(false);
  
  const [showEraMemory, setShowEraMemory] = useState(false);
  const [memoryScene, setMemoryScene] = useState<WorldScene | null>(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);

  const [profileNickname, setProfileNickname] = useState('');

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
            userWorldScenes: loadedState.userWorldScenes || [],
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
      geminiService.setLogCallback((log: DebugLog) => {
          setGameState((prevGameState: GameState) => ({
              ...prevGameState,
              debugLogs: [...prevGameState.debugLogs, log]
          }));
      });
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
                 const allScenes = [...getCurrentScenes(), ...gameState.customScenes];
                 for (const scene of allScenes) {
                     const sceneChars = [...scene.characters, ...(gameState.customCharacters[scene.id] || [])];
                     const found = sceneChars.find(c => c.id === chattedCharIds[0]);
                     if (found) { candidate = found; break; }
                 }
            }
            if (!candidate) candidate = getCurrentScenes()[0].characters[0]; 

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

  // 当进入entryPoint（我的心域）或sceneSelection（场景选择）时，如果是登录用户，加载并同步时代数据
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
      // 防止重复加载：只有在已有数据且标志为true时才跳过
      // 如果标志为true但没有数据，说明上次加载失败，需要重新加载
      if (hasLoadedEntryPointData.current && gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
        console.log('[DataLoader] 已经加载过数据且数据存在，跳过。数据数量:', gameState.userWorldScenes.length);
        return;
      }
      
      // 如果标志为true但没有数据，重置标志并继续加载
      if (hasLoadedEntryPointData.current && (!gameState.userWorldScenes || gameState.userWorldScenes.length === 0)) {
        console.log('[DataLoader] 标志为true但数据为空，重置标志并重新加载');
        hasLoadedEntryPointData.current = false;
      }
      const token = localStorage.getItem('auth_token');
      console.log(`[DataLoader ${gameState.currentScreen}] 条件检查通过，token存在:`, !!token);
      
      if (token) {
        console.log(`[DataLoader ${gameState.currentScreen}] ========== 开始加载时代数据 ==========`);
        console.log(`[DataLoader ${gameState.currentScreen}] 当前本地数据:`, {
          userWorldScenesCount: gameState.userWorldScenes?.length || 0,
          userWorldScenes: gameState.userWorldScenes
        });
        
        // 异步加载远程数据并同步
        const screenName = gameState.currentScreen; // 捕获当前屏幕名称
        const loadAndSyncWorldData = async (): Promise<void> => {
          try {
            console.log(`[DataLoader ${screenName}] 步骤1: 开始获取世界列表...`);
            const worlds = await worldApi.getAllWorlds(token);
            console.log(`[DataLoader ${screenName}] 步骤1完成: 获取世界列表成功，数量:`, worlds.length);
            console.log(`[DataLoader ${screenName}] 世界列表详情:`, JSON.stringify(worlds, null, 2));
            
            console.log(`[DataLoader ${screenName}] 步骤2: 开始获取时代列表...`);
            const eras = await eraApi.getAllEras(token);
            console.log(`[DataLoader ${screenName}] 步骤2完成: 获取时代列表成功，数量:`, eras.length);
            console.log(`[DataLoader ${screenName}] 时代列表详情（原始）:`, JSON.stringify(eras, null, 2));
            if (eras.length > 0) {
              console.log(`[DataLoader ${screenName}] 第一个时代的结构分析:`, {
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
            
            // 将后端数据转换为前端需要的WorldScene格式
            const userWorldScenes: WorldScene[] = [];
            
            console.log(`[DataLoader ${screenName}] 步骤4: 开始按世界分组时代...`);
            // 按世界分组时代
            const erasByWorldId = new Map<number, typeof eras[0][]>();
            eras.forEach(era => {
              // 尝试多种方式获取worldId
              const worldId = era.worldId || (era as any).world?.id || (era as any).worldId;
              console.log(`[DataLoader ${screenName}] 处理时代:`, { 
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
                console.warn(`[DataLoader ${screenName}] 时代缺少worldId，完整对象:`, JSON.stringify(era, null, 2));
                console.warn(`[DataLoader ${screenName}] 尝试从world对象获取:`, (era as any).world);
              }
            });
            console.log(`[DataLoader ${screenName}] 步骤4完成: 时代分组结果:`, Array.from(erasByWorldId.entries()).map(([k, v]) => ({ worldId: k, erasCount: v.length })));
            
            console.log(`[DataLoader ${screenName}] 步骤5: 开始按时代分组角色...`);
            // 按时代分组角色
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
            
            console.log(`[DataLoader ${screenName}] 步骤6: 开始创建WorldScene对象...`);
            // 创建WorldScene对象
            worlds.forEach(world => {
              console.log(`[DataLoader ${screenName}] 处理世界:`, { worldId: world.id, worldName: world.name });
              const worldEras = erasByWorldId.get(world.id) || [];
              console.log(`[DataLoader ${screenName}] 该世界包含`, worldEras.length, '个时代');
              
              worldEras.forEach(era => {
                const eraCharacters = charactersByEraId.get(era.id) || [];
                console.log(`[DataLoader ${screenName}] 创建场景:`, { 
                  eraId: era.id, 
                  eraName: era.name, 
                  charactersCount: eraCharacters.length 
                });
                
                const scene: WorldScene = {
                  id: era.id.toString(),
                  name: era.name,
                  description: era.description,
                  imageUrl: era.imageUrl || '',
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
            
            console.log(`[DataLoader ${screenName}] ========== 时代数据加载并同步完成 ==========`);
            console.log(`[DataLoader ${screenName}] 最终结果: 共`, userWorldScenes.length, '个场景');
            
            // 只有在成功加载数据后才设置标志
            if (userWorldScenes.length > 0) {
              hasLoadedEntryPointData.current = true;
              console.log(`[DataLoader ${screenName}] 数据加载成功，设置标志为true`);
            } else {
              console.warn(`[DataLoader ${screenName}] 数据加载完成但场景数量为0，不设置标志`);
            }
          } catch (error) {
            console.error(`[DataLoader ${screenName}] ========== 加载时代数据失败 ==========`);
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
    // 从localStorage获取token
    const token = localStorage.getItem('auth_token');
    console.log('登录成功:', method, identifier, '首次登录:', isFirstLogin);
    
    if (token) {
      try {
        // 使用token获取完整用户信息
        const userInfo = await authApi.getCurrentUser(token);
        
        // 获取日记列表
        console.log('尝试获取日记列表...');
        const journalEntries = await journalApi.getAllJournalEntries(token);
        console.log('获取日记列表成功:', journalEntries);
        
        // 获取世界列表 (如果登录响应中没有，则单独获取)
        const remoteWorlds = worlds || await worldApi.getAllWorlds(token);
        console.log('获取世界列表成功:', remoteWorlds);
        
        // 获取时代列表
        const eras = await eraApi.getAllEras(token);
        console.log('获取时代列表成功:', eras);
        
        // 获取角色列表
        const characters = await characterApi.getAllCharacters(token);
        console.log('获取角色列表成功:', characters);
        
        // 将后端数据转换为前端需要的WorldScene格式
        const userWorldScenes: WorldScene[] = [];
        
        // 按世界分组时代
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
            console.warn('时代数据缺少worldId:', era);
          }
        });
        
        // 按时代分组角色
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
              id: era.id.toString(), // 使用后端返回的时代ID
              name: era.name,
              description: era.description,
              imageUrl: era.imageUrl || '',
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
              scenes: [], // 时代实体没有scenes字段，使用空数组
              worldId: world.id
            };
            
            userWorldScenes.push(scene);
          });
        });
        
        // 更新用户信息和日记列表，使用远程加载的世界数据
        setGameState(prev => ({
          ...prev,
          userProfile: {
            id: userInfo.id.toString(),
            nickname: userInfo.nickname || userInfo.username,
            avatarUrl: userInfo.avatar || '',
            email: userInfo.email,
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
          showWelcomeOverlay: !!isFirstLogin,
          lastLoginTime: Date.now()
        }));
        
        // 后台异步加载远程世界数据，实现本地优先加载
        const loadRemoteWorldData = async (): Promise<void> => {
          try {
            console.log('后台加载远程世界数据...');
            
            // 获取世界列表
            const updatedWorlds = await worldApi.getAllWorlds(token);
            
            // 获取时代列表
            const updatedEras = await eraApi.getAllEras(token);
            
            // 获取角色列表
            const updatedCharacters = await characterApi.getAllCharacters(token);
            
            // 将后端数据转换为前端需要的WorldScene格式
            const userWorldScenes: WorldScene[] = [];
            
            // 按世界分组时代
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
                console.warn('时代数据缺少worldId:', era);
              }
            });
            
            // 按时代分组角色
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
            
            // 按世界分组时代
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
            
            // 按时代分组角色
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
          showWelcomeOverlay: !!isFirstLogin
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
        showWelcomeOverlay: !!isFirstLogin
      }));
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
          
          // 获取时代列表
          console.log('尝试获取时代列表...');
          const eras = await eraApi.getAllEras(token);
          console.log('获取时代列表成功:', eras);
          
          // 获取角色列表
          console.log('尝试获取角色列表...');
          const characters = await characterApi.getAllCharacters(token);
          console.log('获取角色列表成功:', characters);
          
          // 将后端数据转换为前端需要的WorldScene格式
          const userWorldScenes: WorldScene[] = [];
          
          // 按世界分组时代
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
              console.warn('时代数据缺少worldId:', era);
            }
          });
          
          // 按时代分组角色
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
              
              const scene: WorldScene = {
                id: era.id.toString(), // 使用后端返回的时代ID
                name: era.name,
                description: era.description,
                imageUrl: era.imageUrl || '',
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
                mainStory: eraCharacters.length > 0 ? {
                  id: eraCharacters[0].id.toString(),
                  name: eraCharacters[0].name,
                  age: eraCharacters[0].age,
                  role: eraCharacters[0].role || '主角',
                  bio: eraCharacters[0].bio || '',
                  avatarUrl: eraCharacters[0].avatarUrl || '',
                  backgroundUrl: eraCharacters[0].backgroundUrl || '',
                  themeColor: eraCharacters[0].themeColor || 'blue-500',
                  colorAccent: eraCharacters[0].colorAccent || '#3b82f6',
                  firstMessage: eraCharacters[0].firstMessage || '',
                  systemInstruction: eraCharacters[0].systemInstruction || '',
                  voiceName: eraCharacters[0].voiceName || 'Aoede',
                  mbti: eraCharacters[0].mbti || 'INFJ',
                  tags: eraCharacters[0].tags ? (typeof eraCharacters[0].tags === 'string' ? eraCharacters[0].tags.split(',').filter(tag => tag.trim()) : eraCharacters[0].tags) : [], // Ensure string[]
                  speechStyle: eraCharacters[0].speechStyle || '',
                  catchphrases: eraCharacters[0].catchphrases ? (typeof eraCharacters[0].catchphrases === 'string' ? eraCharacters[0].catchphrases.split(',').filter(phrase => phrase.trim()) : eraCharacters[0].catchphrases) : [], // Ensure string[]
                  secrets: eraCharacters[0].secrets || '',
                  motivations: eraCharacters[0].motivations || '',
                  relationships: eraCharacters[0].relationships || ''
                } : undefined // 如果没有角色，则设置为undefined
              };
              
              userWorldScenes.push(scene);
            });
          });
          
          console.log('转换后的用户世界场景:', userWorldScenes);
          
          setGameState(prev => ({
            ...prev,
            userProfile: {
              id: userInfo.id.toString(),
              nickname: userInfo.nickname || userInfo.username,
              avatarUrl: userInfo.avatar || '',
              email: userInfo.email,
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
        }
      } else {
        console.log('本地存储中没有找到token，用户未登录');
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

  const handleSceneSelect = (sceneId: string): void => {
    // 先更新UI状态
    setGameState(prev => ({ 
        ...prev, 
        selectedSceneId: sceneId, 
        selectedCharacterId: null,
        tempStoryCharacter: null,
        selectedScenarioId: null,
        currentScreen: 'characterSelection' 
    }));
    
    // 如果是登录用户，异步加载该世界的时代数据
    const token = localStorage.getItem('auth_token');
    if (token) {
      // 使用setTimeout确保在状态更新后执行
      setTimeout(async () => {
        try {
          setGameState(prev => {
            const userProfile = prev.userProfile;
            if (!userProfile || userProfile.isGuest) return prev;
            
            // 找到当前场景对应的世界ID
            const currentScenes = prev.userWorldScenes && prev.userWorldScenes.length > 0
              ? [...prev.userWorldScenes, ...prev.customScenes]
              : [...WORLD_SCENES, ...prev.customScenes];
            const selectedScene = currentScenes.find(s => s.id === sceneId);
            const worldId = (selectedScene as any)?.worldId;
            
            if (worldId) {
              console.log(`[handleSceneSelect] 按世界ID加载时代数据: worldId=${worldId}, sceneId=${sceneId}`);
              
              // 异步加载数据
              (async () => {
                try {
                  // 按世界ID获取时代列表
                  const eras = await eraApi.getErasByWorldId(worldId, token);
                  console.log(`[handleSceneSelect] 获取到时代数据:`, eras);
                  
                  // 按世界ID获取角色列表
                  const characters = await characterApi.getCharactersByWorldId(worldId, token);
                  console.log(`[handleSceneSelect] 获取到角色数据:`, characters);
                  
                  // 按时代分组角色
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
                  
                  // 更新该世界的时代和角色数据
                  setGameState(prevState => {
                    const updatedScenes = (prevState.userWorldScenes || []).map(scene => {
                      // 找到属于当前世界的场景（时代）
                      const era = eras.find(e => e.id.toString() === scene.id);
                      if (era) {
                        const eraCharacters = charactersByEraId.get(era.id) || [];
                        return {
                          ...scene,
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
                          mainStory: eraCharacters.length > 0 ? {
                            id: eraCharacters[0].id.toString(),
                            name: eraCharacters[0].name,
                            age: eraCharacters[0].age,
                            role: eraCharacters[0].role || '主角',
                            bio: eraCharacters[0].bio || '',
                            avatarUrl: eraCharacters[0].avatarUrl || '',
                            backgroundUrl: eraCharacters[0].backgroundUrl || '',
                            themeColor: eraCharacters[0].themeColor || 'blue-500',
                            colorAccent: eraCharacters[0].colorAccent || '#3b82f6',
                            firstMessage: eraCharacters[0].firstMessage || '',
                            systemInstruction: eraCharacters[0].systemInstruction || '',
                            voiceName: eraCharacters[0].voiceName || 'Aoede',
                            mbti: eraCharacters[0].mbti || 'INFJ',
                            tags: eraCharacters[0].tags ? (typeof eraCharacters[0].tags === 'string' ? eraCharacters[0].tags.split(',').filter(tag => tag.trim()) : eraCharacters[0].tags) : [],
                            speechStyle: eraCharacters[0].speechStyle || '',
                            catchphrases: eraCharacters[0].catchphrases ? (typeof eraCharacters[0].catchphrases === 'string' ? eraCharacters[0].catchphrases.split(',').filter(phrase => phrase.trim()) : eraCharacters[0].catchphrases) : [],
                            secrets: eraCharacters[0].secrets || '',
                            motivations: eraCharacters[0].motivations || '',
                            relationships: eraCharacters[0].relationships || ''
                          } : undefined
                        };
                      }
                      return scene;
                    });
                    
                    console.log(`[handleSceneSelect] 时代数据更新完成，更新了 ${updatedScenes.length} 个场景`);
                    
                    return {
                      ...prevState,
                      userWorldScenes: updatedScenes
                    };
                  });
                } catch (error) {
                  console.error(`[handleSceneSelect] 加载时代数据失败:`, error);
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

  const handleCharacterSelect = (character: Character): void => {
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
  };

  const handleChatWithCharacterByName = (characterName: string): void => {
    const allScenes = [...WORLD_SCENES, ...gameState.customScenes];
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
        alert(`无法找到名为 "${characterName}" 的角色。可能该角色所在的时代已被删除。`);
    }
  };

  const handleChatBack = (echo?: JournalEcho) => {
    if (echo && gameState.activeJournalEntryId) {
        setGameState(prev => ({
            ...prev,
            journalEntries: prev.journalEntries.map(entry => 
                entry.id === prev.activeJournalEntryId 
                ? { ...entry, echo: echo } 
                : entry
            ),
            activeJournalEntryId: null 
        }));
        setGameState(prev => ({ ...prev, selectedCharacterId: null, tempStoryCharacter: null, selectedScenarioId: null, currentScreen: 'realWorld' }));
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
  };

  const handleUpdateHistory = (msgs: Message[]) => {
    if (!gameState.selectedCharacterId) return;
    setGameState(prev => ({
      ...prev,
      history: { ...prev.history, [prev.selectedCharacterId!]: msgs }
    }));
  };

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
            console.error('用户没有世界，无法同步时代');
            showSyncErrorToast('时代');
            return;
          }
        }

        // 判断是创建还是更新
        const eraId = isNumericId ? parseInt(newScene.id, 10) : null;

        let savedEra: any;
        if (eraId && isEditing) {
          // 更新现有时代
          console.log(`[handleSaveEra] 同步更新时代: eraId=${eraId}, worldId=${worldId}`);
          savedEra = await eraApi.updateEra(eraId, {
            name: newScene.name,
            description: newScene.description,
            startYear: undefined,
            endYear: undefined,
            worldId: worldId,
            imageUrl: newScene.imageUrl || undefined,
          }, token);
        } else {
          // 创建新时代
          console.log(`[handleSaveEra] 同步创建时代: worldId=${worldId}`);
          savedEra = await eraApi.createEra({
            name: newScene.name,
            description: newScene.description,
            startYear: undefined,
            endYear: undefined,
            worldId: worldId,
            imageUrl: newScene.imageUrl || undefined,
          }, token);
        }

        console.log(`[handleSaveEra] 后端同步成功:`, savedEra);

        // 将后端返回的时代转换为WorldScene格式并更新本地状态
        const updatedScene: WorldScene = {
          id: savedEra.id.toString(),
          name: savedEra.name,
          description: savedEra.description,
          imageUrl: savedEra.imageUrl || newScene.imageUrl || '',
          characters: newScene.characters || [],
          worldId: savedEra.worldId,
          mainStory: newScene.mainStory
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
        console.error('[handleSaveEra] 同步时代失败:', error);
        showSyncErrorToast('时代');
      }
    })();
  };

  const handleDeleteEra = (sceneId: string, e?: React.MouseEvent) => {
      if (e) {
          e.stopPropagation();
          e.preventDefault();
      }
      if(window.confirm("确定要删除这个时代吗？删除后将移至回收站，可以随时恢复。")) {
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
                      showSyncErrorToast('时代删除');
                  }
              })();
          }
      }
  };

  const handleSaveCharacter = async (newCharacter: Character) => {
    console.log("========== [App] 保存角色 ==========");
    console.log("[App] 角色信息:", {
      id: newCharacter.id,
      name: newCharacter.name,
      role: newCharacter.role,
      bio: newCharacter.bio ? `长度${newCharacter.bio.length}` : "无",
      avatarUrl: newCharacter.avatarUrl ? "存在" : "无",
      backgroundUrl: newCharacter.backgroundUrl ? "存在" : "无"
    });
    
    const sceneId = gameState.selectedSceneId || editingCharacterSceneId;
    console.log(`[App] 场景ID: ${sceneId}`);
    
    if (!sceneId) {
        console.error("[App] 保存角色失败: 没有场景上下文");
        return;
    }
    
    // 1. 先保存到本地（立即更新UI）
    console.log("[App] 步骤1: 保存到本地状态");
    setGameState(prev => {
        const existingCustomChars = prev.customCharacters[sceneId] || [];
        const isEditing = existingCustomChars.some(c => c.id === newCharacter.id);
        console.log(`[App] 场景 ${sceneId} 已有 ${existingCustomChars.length} 个角色，是否编辑: ${isEditing}`);
        
        let newChars: Character[] = [];
        if (isEditing) {
            newChars = existingCustomChars.map(c => c.id === newCharacter.id ? newCharacter : c);
            console.log(`[App] 更新角色: ${newCharacter.id}`);
        } else {
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
    
    setShowCharacterCreator(false);
    setEditingCharacter(null);
    setEditingCharacterSceneId(null);
    console.log("[App] 步骤1完成: 本地状态已更新");

    // 2. 异步同步到服务器（如果已登录）
    const token = localStorage.getItem('auth_token');
    const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
    console.log(`[App] 步骤2: 同步到服务器, token存在=${!!token}, isGuest=${isGuest}`);
    
    if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
        (async () => {
            try {
                console.log("[App] 开始同步角色到服务器");
                await syncService.handleLocalDataChange('character', {
                    ...newCharacter,
                    description: newCharacter.bio,
                    age: newCharacter.age,
                    gender: newCharacter.role
                });
                console.log(`[App] 角色同步成功: ID=${newCharacter.id}, name=${newCharacter.name}`);
            } catch (error) {
                console.error(`[App] 角色同步失败: ID=${newCharacter.id}`, error);
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
          alert('请先登录才能删除角色');
          return;
      }
      
      if (window.confirm("确定要删除这个角色吗？删除后将移至回收站，可以随时恢复。")) {
          const sceneId = gameState.selectedSceneId || editingCharacterSceneId;
          if (!sceneId) {
              console.error('删除角色失败: 没有场景上下文');
              return;
          }

          // 1. 先删除本地（立即更新UI）
          setGameState(prev => {
              const customChars = prev.customCharacters[sceneId] || [];
              return {
                  ...prev,
                  customCharacters: {
                      ...prev.customCharacters,
                      [sceneId]: customChars.filter(c => c.id !== character.id)
                  }
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
      if (window.confirm("确定要删除这个剧本吗？删除后将移至回收站，可以随时恢复。")) {
          // Update local state immediately for UI responsiveness
          setGameState(prev => ({
              ...prev,
              customScenarios: prev.customScenarios.filter(s => s.id !== scenarioId),
              editingScenarioId: prev.editingScenarioId === scenarioId ? null : prev.editingScenarioId,
              selectedScenarioId: prev.selectedScenarioId === scenarioId ? null : prev.selectedScenarioId
          }));

          // Sync with server
          try {
            await scriptApi.deleteScript(parseInt(scenarioId), localStorage.getItem('auth_token') || '');
            console.log('Scenario deleted from server:', scenarioId);
          } catch (error) {
            console.error('Error deleting scenario from server:', error);
            // Show error message to user
            alert('剧本删除同步失败，请检查网络连接或稍后重试。');
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

  const handlePlayScenario = (scenario: CustomScenario) => {
      let startNode = scenario.nodes[scenario.startNodeId];
      
      // Fallback if startNodeId is invalid
      if (!startNode) {
          const firstKey = Object.keys(scenario.nodes)[0];
          if (firstKey) {
              startNode = scenario.nodes[firstKey];
          } else {
              alert("错误：该剧本没有有效节点。");
              return;
          }
      }
      
      const allScenes = [...WORLD_SCENES, ...gameState.customScenes];
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

      setGameState(prev => ({
          ...prev,
          selectedCharacterId: narrator.id,
          tempStoryCharacter: narrator, 
          selectedScenarioId: scenario.id,
          currentScenarioState: { scenarioId: scenario.id, currentNodeId: startNode.id },
          history: { ...prev.history, [narrator.id]: [] }, 
          currentScreen: 'chat'
      }));
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
              alert("登录成功！请再次点击“本我镜像”以开始分析。");
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
      const currentScenes = getCurrentScenes();
      if (gameState.selectedSceneId) {
          return currentScenes.find(s => s.id === gameState.selectedSceneId) || currentScenes[0];
      }
      if (editingCharacterSceneId) {
          return currentScenes.find(s => s.id === editingCharacterSceneId) || currentScenes[0];
      }
      return currentScenes[0];
  };

  // --- RENDER BLOCK (Must be last) ---  
  
  // 根据用户是否登录，决定使用后端数据还是本地预置数据
  const getCurrentScenes = () => {
    if (gameState.userProfile && !gameState.userProfile.isGuest && gameState.userWorldScenes) {
      // 登录用户：使用从后端获取的用户专属场景 + 自定义场景（排除已在userWorldScenes中的）
      const userWorldSceneIds = new Set(gameState.userWorldScenes.map(s => s.id));
      const customScenesOnly = gameState.customScenes.filter(s => !userWorldSceneIds.has(s.id));
      return [...gameState.userWorldScenes, ...customScenesOnly];
    } else {
      // 游客：使用本地预置场景 + 自定义场景
      return [...WORLD_SCENES, ...gameState.customScenes];
    }
  };
  
  if (isMobileMode) {
      return <MobileApp onSwitchToPC={handleSwitchToPC} />;
  }

  if (!isLoaded) return <div className="h-screen w-screen bg-black flex items-center justify-center text-white">Loading HeartSphere Core...</div>;
  
  const currentSceneLocal = getCurrentScenes().find(s => s.id === gameState.selectedSceneId);
  
  let sceneCharacters: Character[] = [];
  if (currentSceneLocal) {
      const customCharsForScene = gameState.customCharacters[currentSceneLocal.id] || [];
      sceneCharacters = [...currentSceneLocal.characters, ...customCharsForScene];
  }

  const allCharacters = getCurrentScenes().reduce((acc, scene) => {
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
  const currentScenarioLocal = gameState.selectedScenarioId
    ? gameState.customScenarios.find(s => s.id === gameState.selectedScenarioId)
    : null;

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden font-sans text-white">
      
      {showLoginModal && (
            <LoginModal
              onLoginSuccess={handleLoginSuccess}
              onCancel={() => { setShowLoginModal(false); pendingActionRef.current = () => {}; }}
              initialNickname={gameState.userProfile?.isGuest ? gameState.userProfile.nickname : undefined}
            />
          )}

          {/* 欢迎蒙层 */}
          {gameState.showWelcomeOverlay && (
            <WelcomeOverlay onClose={handleCloseWelcomeOverlay} />
          )}

      {gameState.currentScreen === 'profileSetup' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 p-6">
           <div className="max-w-md w-full text-center space-y-8">
               <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Welcome to {APP_TITLE}</h1>
               <p className="text-gray-400">首先，请告诉我们该如何称呼你。</p>
               <input 
                 type="text" 
                 value={profileNickname} 
                 onChange={(e) => setProfileNickname(e.target.value)} 
                 placeholder="输入你的昵称"
                 className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-center text-lg focus:border-pink-500 outline-none"
               />
               <Button fullWidth onClick={handleProfileSubmit} disabled={!profileNickname.trim()}>以访客身份进入</Button>
               <p className="text-xs text-gray-600 mt-4">你可以在之后绑定手机或微信以保存数据。</p>
           </div>
        </div>
      )}

      {gameState.currentScreen === 'entryPoint' && gameState.userProfile && (
          <EntryPoint 
            onNavigate={(screen) => setGameState(prev => ({ ...prev, currentScreen: screen }))} 
            nickname={gameState.userProfile.nickname} 
            onOpenSettings={() => setShowSettingsModal(true)}
            onSwitchToMobile={handleSwitchToMobile}
            currentStyle={gameState.worldStyle}
            onStyleChange={(style) => {
              setGameState(prev => ({ ...prev, worldStyle: style }));
              storageService.saveState({ ...gameState, worldStyle: style });
            }}
          />
      )}

      {gameState.currentScreen === 'realWorld' && (
          <RealWorldScreen 
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
          />
      )}

      {gameState.currentScreen === 'connectionSpace' && gameState.userProfile && (
          <ConnectionSpace 
             characters={allCharacters}
             userProfile={gameState.userProfile}
             onBack={() => setGameState(prev => ({ ...prev, currentScreen: 'sceneSelection' }))}
             onConnect={(character) => {
                 requireAuth(() => {
                     const allScenes = [...WORLD_SCENES, ...gameState.customScenes];
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
          <AdminScreen 
             gameState={gameState}
             onUpdateGameState={(newState) => setGameState(newState)}
             onResetWorld={() => storageService.clearMemory()}
             onBack={handleEnterNexus}
          />
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
                        选择一个时代切片进行连接
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
                     + 创造新时代
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
              {getCurrentScenes().map(scene => {
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
             
             <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                {currentSceneLocal.mainStory && (
                    <div className="mb-10 p-1 rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                        <div className="bg-gray-900 rounded-[22px] overflow-hidden relative group">
                             <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-transform duration-1000 group-hover:scale-105" style={{backgroundImage: `url(${currentSceneLocal.mainStory.backgroundUrl})`}} />
                             <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
                                 <div className="flex-1 space-y-4">
                                     <div className="inline-block px-3 py-1 bg-pink-500 text-white text-xs font-bold rounded-full">主线剧情</div>
                                     <h3 className="text-3xl font-bold text-white">{currentSceneLocal.mainStory.name}</h3>
                                     <p className="text-gray-300 leading-relaxed">{currentSceneLocal.mainStory.bio}</p>
                                     <Button 
                                       onClick={() => handleCharacterSelect(currentSceneLocal.mainStory!)}
                                       className="bg-white text-black hover:bg-gray-200 mt-4 px-8"
                                     >
                                         开始故事
                                     </Button>
                                 </div>
                                 <div className="w-48 h-64 shrink-0 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-3 transition-transform group-hover:rotate-0">
                                     <img src={currentSceneLocal.mainStory.avatarUrl} className="w-full h-full object-cover" alt="Story Cover" />
                                 </div>
                             </div>
                        </div>
                    </div>
                )}
                
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
                        
                        return (
                            <CharacterCard 
                              key={char.id} 
                              character={char} 
                              customAvatarUrl={gameState.customAvatars[char.id]}
                              isGenerating={gameState.generatingAvatarId === char.id}
                              onSelect={handleCharacterSelect}
                              onGenerate={(c) => requireAuth(() => handleGenerateAvatar(c))}
                              onEdit={isUserOwned ? (c) => requireAuth(() => {
                                  setEditingCharacter(c);
                                  setEditingCharacterSceneId(currentSceneLocal.id);
                                  setShowCharacterCreator(true);
                              }) : undefined}
                              onDelete={isUserOwned ? (c) => requireAuth(() => handleDeleteCharacter(c)) : undefined}
                              isUserCreated={isUserOwned}
                            />
                        );
                    })}
                </div>

                 <div className="mt-12 mb-20">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-400">剧本分支</h3>
                        <Button onClick={() => { 
                             requireAuth(() => {
                                setEditingScene(null); 
                                setGameState(prev => ({...prev, currentScreen: 'builder'})); 
                             });
                        }} variant="secondary" className="text-xs">
                            + 创建剧本
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {gameState.customScenarios.filter(s => s.sceneId === currentSceneLocal.id).map(scenario => (
                            <div key={scenario.id} className="group relative bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-indigo-500 transition-all cursor-pointer hover:-translate-y-1" onClick={() => handlePlayScenario(scenario)}>
                                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400">{scenario.title}</h4>
                                <p className="text-sm text-gray-400 line-clamp-3 mb-4">{scenario.description}</p>
                                <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-700 pt-3">
                                    <span>By {scenario.author}</span>
                                    <span>{Object.keys(scenario.nodes).length} 个节点</span>
                                </div>
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                     <button onClick={(e) => { requireAuth(() => handleEditScenario(scenario, e)) }} className="p-1.5 hover:bg-white/10 rounded text-gray-300 pointer-events-auto" title="编辑">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" /></svg>
                                     </button>
                                     <button onClick={(e) => handleDeleteScenario(scenario.id, e)} className="p-1.5 hover:bg-red-900/50 rounded text-gray-300 hover:text-red-400 pointer-events-auto" title="删除">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
             </div>
         </div>
      )}

      {gameState.currentScreen === 'chat' && currentCharacterLocal && (
        <ChatWindow 
          character={currentCharacterLocal} 
          customScenario={currentScenarioLocal || undefined}
          history={gameState.history[currentCharacterLocal.id] || []}
          scenarioState={gameState.currentScenarioState}
          settings={gameState.settings}
          userProfile={gameState.userProfile!}
          activeJournalEntryId={gameState.activeJournalEntryId}
          onUpdateHistory={handleUpdateHistory}
          onUpdateScenarioState={(nodeId) => setGameState(prev => ({ ...prev, currentScenarioState: { ...prev.currentScenarioState!, currentNodeId: nodeId } }))}
          onBack={handleChatBack}
        />
      )}

      {gameState.currentScreen === 'builder' && (
          <ScenarioBuilder 
            initialScenario={editingScenarioLocal}
            onSave={handleSaveScenario}
            onCancel={() => setGameState(prev => ({...prev, currentScreen: 'characterSelection', editingScenarioId: null}))}
          />
      )}

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

    </div>
  );
};

export default App;