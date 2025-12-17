
import React, { useState, useEffect, useRef } from 'react';
import { GameState, Character, Message, WorldScene, JournalEntry, AppSettings, CustomScenario } from '../types';
import { geminiService } from '../services/gemini';
import { storageService } from '../services/storage';
import { WORLD_SCENES } from '../constants';
import { authApi, journalApi, worldApi, eraApi, characterApi, systemScriptApi, scriptApi } from '../services/api';
import { syncService } from '../services/syncService';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileRealWorld } from './MobileRealWorld';
import { showAlert, showConfirm } from '../utils/dialog';
import { MobileSceneSelection } from './MobileSceneSelection';
import { MobileCharacterSelection } from './MobileCharacterSelection';
import { MobileProfile } from './MobileProfile';
import { MobileScenarioBuilder } from './MobileScenarioBuilder'; // Imported Mobile Builder
import { ChatWindow } from '../components/ChatWindow';
import { ConnectionSpace } from '../components/ConnectionSpace';
import { LoginModal } from '../components/LoginModal';
import { SettingsModal } from '../components/SettingsModal';
import { MailboxModal } from '../components/MailboxModal';

// Modals reuse
import { EraConstructorModal } from '../components/EraConstructorModal';
import { CharacterConstructorModal } from '../components/CharacterConstructorModal';

interface MobileAppProps {
    onSwitchToPC: () => void;
}

export const MobileApp: React.FC<MobileAppProps> = ({ onSwitchToPC }) => {
    
    // --- STATE ---
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
        customScenarios: [],
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
          qwenConfig: { apiKey: '', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', modelName: 'qwen-max', imageModel: 'qwen-image-plus', videoModel: 'wanx-video' },
          doubaoConfig: { apiKey: '', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3', modelName: 'ep-...', imageModel: 'doubao-image-v1', videoModel: 'doubao-video-v1' }
        },
        mailbox: [],
        lastLoginTime: Date.now(),
        sceneMemories: {},
        debugLogs: []
    };

    const [gameState, setGameState] = useState<GameState>(DEFAULT_STATE);
    const [isLoaded, setIsLoaded] = useState(false);
    const [profileNickname, setProfileNickname] = useState('');
    const [showGuestNicknameModal, setShowGuestNicknameModal] = useState(false);
    
    // UI States
    const [showSettings, setShowSettings] = useState(false);
    const [showMailbox, setShowMailbox] = useState(false);
    const [showEraCreator, setShowEraCreator] = useState(false);
    const [showCharacterCreator, setShowCharacterCreator] = useState(false);
    const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // --- INIT & STORAGE ---
    useEffect(() => {
        const init = async () => {
            const loaded = await storageService.loadState();
            if (loaded) {
                setGameState(prev => ({ ...prev, ...loaded, currentScreen: loaded.userProfile ? 'realWorld' : 'profileSetup', debugLogs: [] }));
                if (loaded.settings) geminiService.updateConfig(loaded.settings as AppSettings);
            }
            setIsLoaded(true);
            
            // 初始化同步服务（如果已登录）
            const token = localStorage.getItem('auth_token');
            if (token) {
                syncService.init();
            }
        };
        init();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        geminiService.updateConfig(gameState.settings);
        const t = setTimeout(() => storageService.saveState({ ...gameState, lastLoginTime: Date.now() }), 1000);
        return () => clearTimeout(t);
    }, [gameState, isLoaded]);

    // 数据刷新机制：当进入realWorld或sceneSelection时，如果是登录用户，刷新数据
    useEffect(() => {
        const shouldLoadData = (gameState.currentScreen === 'realWorld' || gameState.currentScreen === 'sceneSelection');
        if (!shouldLoadData || !gameState.userProfile || gameState.userProfile.isGuest) {
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            return;
        }

        // 如果已经有数据，不重复加载（避免频繁请求）
        if (gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
            console.log('[Mobile DataLoader] 已有数据，跳过加载');
            return;
        }

        console.log('[Mobile DataLoader] 开始加载场景数据...');
        const loadData = async () => {
            try {
                // 获取世界列表
                const worlds = await worldApi.getAllWorlds(token);
                
                // 获取场景列表
                const eras = await eraApi.getAllEras(token);
                
                // 获取角色列表
                const characters = await characterApi.getAllCharacters(token);
                
                // 将后端数据转换为前端需要的WorldScene格式
                const userWorldScenes: WorldScene[] = [];
                
                // 按世界分组场景
                const erasByWorldId = new Map<number, typeof eras[0][]>();
                eras.forEach(era => {
                    const worldId = era.worldId || (era as any).world?.id || (era as any).worldId;
                    if (worldId) {
                        if (!erasByWorldId.has(worldId)) {
                            erasByWorldId.set(worldId, []);
                        }
                        erasByWorldId.get(worldId)?.push(era);
                    }
                });
                
                // 按场景分组角色
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
                
                // 创建WorldScene对象
                worlds.forEach(world => {
                    const worldEras = erasByWorldId.get(world.id) || [];
                    worldEras.forEach(era => {
                        const eraCharacters = charactersByEraId.get(era.id) || [];
                        
                        // 查找对应的预置场景的mainStory（如果有systemEraId）
                        let mainStory: Character | undefined = undefined;
                        if (era.systemEraId) {
                            const presetScene = WORLD_SCENES.find(s => {
                                // 通过systemEraId匹配
                                return s.id === `preset_${era.systemEraId}` || 
                                       (s as any).systemEraId === era.systemEraId;
                            });
                            if (presetScene && presetScene.mainStory) {
                                mainStory = presetScene.mainStory;
                            }
                        }
                        
                        const scene: WorldScene = {
                            id: era.id.toString(),
                            name: era.name,
                            description: era.description,
                            imageUrl: era.imageUrl || '',
                            systemEraId: era.systemEraId || undefined,
                            mainStory: mainStory, // 添加mainStory支持
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
                
                // 更新游戏状态
                setGameState(prev => ({
                    ...prev,
                    userWorldScenes: userWorldScenes
                }));
                
                console.log('[Mobile DataLoader] 数据加载完成，共', userWorldScenes.length, '个场景');
            } catch (error) {
                console.error('[Mobile DataLoader] 数据加载失败:', error);
            }
        };
        
        loadData();
    }, [gameState.currentScreen, gameState.userProfile?.id]);

    // --- ACTIONS ---

    const handleSwitchToPCWrapper = async () => {
        await storageService.saveState({ ...gameState, lastLoginTime: Date.now() });
        onSwitchToPC();
    };

    const handleProfileSubmit = () => {
        if (!profileNickname.trim()) return;
        setGameState(prev => ({
            ...prev,
            userProfile: { nickname: profileNickname.trim(), avatarUrl: '', isGuest: true, id: `guest_${Date.now()}` },
            currentScreen: 'realWorld'
        }));
        setShowGuestNicknameModal(false);
        setProfileNickname('');
    };

    const handleLogout = () => {
        // Construct a clean state but preserve settings (API keys etc)
        const cleanState: GameState = {
            ...DEFAULT_STATE,
            settings: gameState.settings, 
            currentScreen: 'profileSetup',
            userProfile: null
        };

        // 1. Update React State immediately to show login screen
        setShowSettings(false);
        setGameState(cleanState);

        // 2. Persist the clean state asynchronously (Fire and forget)
        storageService.saveState(cleanState).then(() => {
            console.log("Logged out and state saved.");
        }).catch(err => {
            console.error("Logout save failed", err);
        });
    };

    const handleLoginSuccess = async (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => {
        // 从localStorage获取token
        const token = localStorage.getItem('auth_token');
        console.log('手机版登录成功:', method, identifier, '首次登录:', isFirstLogin);
        
        // 初始化同步服务
        if (token) {
            syncService.init();
        }
        
        if (token) {
            try {
                // 使用token获取完整用户信息
                const userInfo = await authApi.getCurrentUser(token);
                
                // 获取日记列表
                const journalEntries = await journalApi.getAllJournalEntries(token);
                
                // 获取世界列表
                const remoteWorlds = worlds || await worldApi.getAllWorlds(token);
                
                // 获取场景列表
                const eras = await eraApi.getAllEras(token);
                
                // 获取角色列表
                const characters = await characterApi.getAllCharacters(token);
                
                // 将后端数据转换为前端需要的WorldScene格式
                const userWorldScenes: WorldScene[] = [];
                
                // 按世界分组场景
                const erasByWorldId = new Map<number, typeof eras[0][]>();
                eras.forEach(era => {
                    // 尝试多种方式获取worldId（与PC版本保持一致）
                    const worldId = era.worldId || (era as any).world?.id || (era as any).worldId;
                    if (worldId) {
                        if (!erasByWorldId.has(worldId)) {
                            erasByWorldId.set(worldId, []);
                        }
                        erasByWorldId.get(worldId)?.push(era);
                    } else {
                        console.warn('[Mobile] 场景缺少worldId:', era);
                    }
                });
                
                // 按场景分组角色
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
                
                // 创建WorldScene对象
                remoteWorlds.forEach(world => {
                    const worldEras = erasByWorldId.get(world.id) || [];
                    
                    worldEras.forEach(era => {
                        const eraCharacters = charactersByEraId.get(era.id) || [];
                        
                        // 查找对应的预置场景的mainStory（如果有systemEraId）
                        // PC版本在刷新角色列表时会保留原有的mainStory，如果没有则使用第一个角色
                        let mainStory: Character | undefined = undefined;
                        if (era.systemEraId) {
                            // 尝试通过systemEraId匹配预置场景
                            // 需要先获取systemEra的名称，然后匹配WORLD_SCENES
                            // 由于WORLD_SCENES没有systemEraId字段，我们需要通过名称匹配
                            // 但这里暂时不实现，因为需要额外的API调用来获取systemEra名称
                            // 暂时留空，后续可以通过加载systemEras来匹配
                        }
                        // 如果没有找到mainStory，使用第一个角色（与PC版本在登录时的行为一致）
                        if (!mainStory && eraCharacters.length > 0) {
                            const firstChar = eraCharacters[0];
                            mainStory = {
                                id: firstChar.id.toString(),
                                name: firstChar.name,
                                age: firstChar.age,
                                role: firstChar.role || '主角',
                                bio: firstChar.bio || '',
                                avatarUrl: firstChar.avatarUrl || '',
                                backgroundUrl: firstChar.backgroundUrl || '',
                                themeColor: firstChar.themeColor || 'blue-500',
                                colorAccent: firstChar.colorAccent || '#3b82f6',
                                firstMessage: firstChar.firstMessage || '',
                                systemInstruction: firstChar.systemInstruction || '',
                                voiceName: firstChar.voiceName || 'Aoede',
                                mbti: firstChar.mbti || 'INFJ',
                                tags: firstChar.tags ? (typeof firstChar.tags === 'string' ? firstChar.tags.split(',').filter(tag => tag.trim()) : firstChar.tags) : [],
                                speechStyle: firstChar.speechStyle || '',
                                catchphrases: firstChar.catchphrases ? (typeof firstChar.catchphrases === 'string' ? firstChar.catchphrases.split(',').filter(phrase => phrase.trim()) : firstChar.catchphrases) : [],
                                secrets: firstChar.secrets || '',
                                motivations: firstChar.motivations || '',
                                relationships: firstChar.relationships || ''
                            };
                        }
                        
                        const scene: WorldScene = {
                            id: era.id.toString(),
                            name: era.name,
                            description: era.description,
                            imageUrl: era.imageUrl || '',
                            systemEraId: era.systemEraId || undefined, // 直接从后端获取（与PC版本保持一致）
                            mainStory: mainStory, // 添加mainStory支持
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
                
                // 更新用户信息和日记列表
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
                        id: entry.id,
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
                    // 登录成功后跳转到 realWorld（手机版没有 entryPoint）
                    currentScreen: prev.currentScreen === 'profileSetup' ? 'realWorld' : prev.currentScreen,
                    lastLoginTime: Date.now()
                }));
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
                    // 登录成功后跳转到 realWorld
                    currentScreen: prev.currentScreen === 'profileSetup' ? 'realWorld' : prev.currentScreen
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
                // 登录成功后跳转到 realWorld
                currentScreen: prev.currentScreen === 'profileSetup' ? 'realWorld' : prev.currentScreen
            }));
        }
        
        setShowLoginModal(false);
    };

    // --- SCENE & CHAR LOGIC ---

    // 与PC版本保持一致：登录用户使用userWorldScenes + customScenes（排除重复），游客使用WORLD_SCENES + customScenes
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

    const allScenes = getCurrentScenes();
    const currentScene = allScenes.find(s => s.id === gameState.selectedSceneId);
    
    // Get Characters for current scene
    const currentSceneChars = currentScene 
        ? [...currentScene.characters, ...(gameState.customCharacters[currentScene.id] || [])]
        : [];
        
    // Get Scenarios for current scene
    // 获取当前场景的剧本（包括用户自定义和系统预设）
    const [systemScripts, setSystemScripts] = React.useState<CustomScenario[]>([]);
    
    React.useEffect(() => {
        // 当场景变化时，加载系统预设剧本
        if (currentScene && currentScene.id) {
            const eraId = parseInt(currentScene.id);
            if (!isNaN(eraId)) {
                systemScriptApi.getByEraId(eraId)
                    .then(scripts => {
                        // 将系统预设剧本转换为 CustomScenario 格式
                        const convertedScripts: CustomScenario[] = scripts.map(script => {
                            try {
                                const content = JSON.parse(script.content || '{}');
                                return {
                                    id: `system_script_${script.id}`,
                                    sceneId: currentScene.id,
                                    title: script.title,
                                    description: script.description || '',
                                    author: '系统预设',
                                    startNodeId: content.startNodeId || 'start',
                                    nodes: content.nodes || {}
                                };
                            } catch (e) {
                                console.error('解析系统剧本内容失败:', e, script);
                                return null;
                            }
                        }).filter((s): s is CustomScenario => s !== null);
                        setSystemScripts(convertedScripts);
                    })
                    .catch(error => {
                        console.error('加载系统预设剧本失败:', error);
                        setSystemScripts([]);
                    });
            } else {
                setSystemScripts([]);
            }
        } else {
            setSystemScripts([]);
        }
    }, [currentScene?.id]);

    const currentSceneScenarios = currentScene
        ? [
            ...gameState.customScenarios.filter(s => s.sceneId === currentScene.id),
            ...systemScripts
          ]
        : [];

    let activeCharacter = null;
    if (currentScene && gameState.selectedCharacterId) {
        // Also check if it's the narrator for a scenario
        if (gameState.tempStoryCharacter && gameState.tempStoryCharacter.id === gameState.selectedCharacterId) {
             activeCharacter = gameState.tempStoryCharacter;
        } else {
             activeCharacter = currentSceneChars.find(c => c.id === gameState.selectedCharacterId);
             // Fallback to main story if id matches
             if (!activeCharacter && currentScene.mainStory?.id === gameState.selectedCharacterId) {
                 activeCharacter = currentScene.mainStory;
             }
        }
    }

    const handleSelectScene = (sceneId: string) => {
        setGameState(prev => ({
            ...prev,
            selectedSceneId: sceneId,
            selectedCharacterId: null,
            currentScreen: 'characterSelection' // Go to detail view
        }));
    };

    const handleSelectCharacter = (char: Character) => {
        setGameState(prev => ({
            ...prev,
            selectedCharacterId: char.id,
            tempStoryCharacter: null,
            selectedScenarioId: null,
            currentScenarioState: undefined,
            currentScreen: 'chat'
        }));
    };

    const handlePlayScenario = async (scenario: CustomScenario) => {
        // 让用户选择执行模式：确定=按流程，取消=自由
        const useFlow = window.confirm('按“流程配置”执行？\\n确定：按流程节点推进\\n取消：自由执行');

        let startNode = scenario.nodes[scenario.startNodeId];
        if (!startNode) {
            const firstKey = Object.keys(scenario.nodes)[0];
            if (firstKey) {
                startNode = scenario.nodes[firstKey];
            }
        }

        // 如果用户选择流程执行但没有有效节点，提示错误
        if (useFlow && !startNode) {
            showAlert("错误：该剧本缺少有效的流程节点。", '错误', 'error');
                return;
        }

        const scene = allScenes.find(s => s.id === gameState.selectedSceneId);
        const sceneImage = scene?.imageUrl || '';

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
            firstMessage: useFlow
                ? (startNode?.prompt || '...')
                : (scenario.description || startNode?.prompt || '...'),
            voiceName: 'Kore'
        };

        geminiService.resetSession(narrator.id);

        setGameState(prev => ({
            ...prev,
            selectedCharacterId: narrator.id,
            tempStoryCharacter: narrator, 
            selectedScenarioId: scenario.id,
            currentScenarioState: useFlow && startNode ? { scenarioId: scenario.id, currentNodeId: startNode.id } : undefined,
            history: { ...prev.history, [narrator.id]: [] }, 
            currentScreen: 'chat'
        }));
    };

    // --- CREATION HANDLERS ---

    const handleSaveEra = async (newScene: WorldScene) => {
        // 1. 先保存到本地（立即更新UI）
        const isNumericId = /^\d+$/.test(newScene.id);
        const isEditing = isNumericId && gameState.userWorldScenes.some(s => s.id === newScene.id);
        
        setGameState(prev => {
            if (isEditing && isNumericId) {
                // 更新现有场景
                return {
                    ...prev,
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
                        return;
                    }
                }

                // 判断是创建还是更新
                const eraId = isNumericId ? parseInt(newScene.id, 10) : null;

                let savedEra: any;
                if (eraId && isEditing) {
                    // 更新现有场景
                    console.log(`[Mobile] 同步更新场景: eraId=${eraId}, worldId=${worldId}`);
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
                    console.log(`[Mobile] 同步创建场景: worldId=${worldId}`);
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

                console.log(`[Mobile] 后端同步成功:`, savedEra);

                // 将后端返回的场景转换为WorldScene格式并更新本地状态
                const updatedScene: WorldScene = {
                    id: savedEra.id.toString(),
                    name: savedEra.name,
                    description: savedEra.description,
                    imageUrl: savedEra.imageUrl || newScene.imageUrl || '',
                    characters: newScene.characters || [],
                    worldId: savedEra.worldId,
                    mainStory: newScene.mainStory,
                    systemEraId: newScene.systemEraId // 保留系统场景ID映射
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
                console.error('[Mobile] 同步场景失败:', error);
            }
        })();
    };

    const handleSaveCharacter = async (newCharacter: Character) => {
        const sceneId = gameState.selectedSceneId;
        if (!sceneId) {
            console.error("[Mobile] 保存角色失败: 没有场景上下文");
            return;
        }
        
        // 检查角色ID的来源
        const allScenes = [...WORLD_SCENES, ...gameState.customScenes, ...(gameState.userWorldScenes || [])];
        const currentScene = allScenes.find(s => s.id === sceneId);
        const existingCharInScene = currentScene?.characters.find(c => c.id === newCharacter.id);
        const existingCharInCustom = (gameState.customCharacters[sceneId] || []).find(c => c.id === newCharacter.id);
        const isEditing = !!(existingCharInScene || existingCharInCustom);
        
        // 1. 先保存到本地（立即更新UI）
        setGameState(prev => {
            const existingCustomChars = prev.customCharacters[sceneId] || [];
            
            let newChars: Character[] = [];
            if (isEditing) {
                // 更新现有角色
                newChars = existingCustomChars.map(c => c.id === newCharacter.id ? newCharacter : c);
            } else {
                // 添加新角色
                newChars = [...existingCustomChars, newCharacter];
            }

            return {
            ...prev,
            customCharacters: {
                ...prev.customCharacters,
                    [sceneId]: newChars
            }
            };
        });
        
        setShowCharacterCreator(false);

        // 2. 异步同步到服务器（如果已登录）
        const token = localStorage.getItem('auth_token');
        if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
            (async () => {
                try {
                    // 获取场景的eraId和worldId
                    const eraId = currentScene ? (parseInt(currentScene.id) || null) : null;
                    const worldId = currentScene?.worldId || syncService.getWorldIdForSceneId(sceneId);
                    
                    // 准备角色数据
                    const characterData = {
                        ...newCharacter,
                        worldId: worldId,
                        eraId: eraId
                    };
                    
                    await syncService.handleLocalDataChange('character', characterData);
                    console.log('[Mobile] 角色同步成功:', newCharacter.id);
                } catch (error: any) {
                    console.error(`[Mobile] 角色同步失败: ID=${newCharacter.id}`, error);
                }
            })();
        }
    };

    const handleSaveScenario = async (scenario: CustomScenario) => {
        if (!gameState.selectedSceneId) return;
        const completeScenario = { ...scenario, sceneId: gameState.selectedSceneId };
        
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
                editingScenarioId: null
            };
        });

        setShowScenarioBuilder(false);

        // 异步同步到服务器（如果已登录）
        const token = localStorage.getItem('auth_token');
        if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
            (async () => {
                try {
                    await syncService.handleLocalDataChange('scenario', completeScenario);
                    console.log('[Mobile] 剧本同步成功:', completeScenario.id);
                } catch (error) {
                    console.error('[Mobile] 剧本同步失败:', error);
                }
            })();
        }
    };


    // --- RENDER ---
    
    if (!isLoaded) return <div className="h-screen bg-black flex items-center justify-center text-white">Loading Mobile Core...</div>;

    if (gameState.currentScreen === 'profileSetup') {
        return (
            <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-6 space-y-6">
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">HeartSphere Mobile</h1>
                <p className="text-gray-400 text-center">选择你的进入方式</p>
                <div className="w-full space-y-3">
                    <button 
                        onClick={() => setShowGuestNicknameModal(true)}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-xl font-bold transition-all"
                    >
                        以访客身份进入
                    </button>
                    <button 
                        onClick={() => setShowLoginModal(true)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition-all"
                    >
                        登录账户
                    </button>
                </div>
                <p className="text-xs text-gray-600 text-center mt-4">访客模式可快速体验，登录账户可同步数据。</p>
                
                {/* 访客昵称输入对话框 */}
                {showGuestNicknameModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-slate-900 rounded-2xl border border-slate-700 p-6 max-w-sm w-full shadow-2xl">
                            <h3 className="text-xl font-bold text-white mb-4">访客体验</h3>
                            <p className="text-sm text-slate-400 mb-6">输入你的昵称，以访客身份进入体验</p>
                <input 
                                type="text"
                    value={profileNickname}
                                onChange={(e) => setProfileNickname(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && profileNickname.trim()) {
                                        handleProfileSubmit();
                                    }
                                }}
                                placeholder="请输入昵称"
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none mb-4"
                                autoFocus
                />
                            <div className="flex gap-3">
                                <button
                                    onClick={handleProfileSubmit}
                                    disabled={!profileNickname.trim()}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-lg font-bold transition-all"
                                >
                                    进入
                                </button>
                                <button
                                    onClick={() => {
                                        setShowGuestNicknameModal(false);
                                        setProfileNickname('');
                                    }}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-bold transition-all"
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="h-screen w-full bg-black text-white relative overflow-hidden">
            
            {/* CONTENT AREA */}
            <div className="h-full w-full">
                {gameState.currentScreen === 'realWorld' && (
                    <MobileRealWorld 
                        entries={gameState.journalEntries}
                        onAddEntry={async (t, c, i, in_, tags) => {
                            const newEntry: JournalEntry = {
                                id: `e_${Date.now()}`,
                                title: t,
                                content: c,
                                timestamp: Date.now(),
                                imageUrl: i,
                                insight: in_,
                                tags: tags
                            };
                            
                            // 1. 先保存到本地（立即更新UI）
                            setGameState(prev => ({
                                ...prev,
                                journalEntries: [...prev.journalEntries, newEntry]
                            }));
                            
                            // 2. 异步同步到服务器（如果已登录）
                            const token = localStorage.getItem('auth_token');
                            if (token && gameState.userProfile && !gameState.userProfile.isGuest) {
                                (async () => {
                                    try {
                                        await syncService.handleLocalDataChange('journal', newEntry);
                                        console.log('[Mobile] 日记同步成功:', newEntry.id);
                                    } catch (error) {
                                        console.error('[Mobile] 日记同步失败:', error);
                                    }
                                })();
                            }
                        }}
                        onUpdateEntry={async (e) => {
                            // 1. 先保存到本地（立即更新UI）
                            setGameState(prev => ({
                                ...prev,
                                journalEntries: prev.journalEntries.map(x => x.id === e.id ? e : x)
                            }));
                            
                            // 2. 异步同步到服务器（如果已登录且ID是数字）
                            const token = localStorage.getItem('auth_token');
                            const isNumericId = /^\d+$/.test(e.id);
                            if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
                                (async () => {
                                    try {
                                        await syncService.handleLocalDataChange('journal', e);
                                        console.log('[Mobile] 日记更新同步成功:', e.id);
                                    } catch (error) {
                                        console.error('[Mobile] 日记更新同步失败:', error);
                                    }
                                })();
                            }
                        }}
                        onDeleteEntry={async (id) => {
                            // 1. 先删除本地（立即更新UI）
                            setGameState(prev => ({
                                ...prev,
                                journalEntries: prev.journalEntries.filter(x => x.id !== id)
                            }));
                            
                            // 2. 异步同步到服务器（如果已登录且ID是数字）
                            const token = localStorage.getItem('auth_token');
                            const isNumericId = /^\d+$/.test(id);
                            if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
                                (async () => {
                                    try {
                                        await journalApi.deleteJournalEntry(parseInt(id), token);
                                        console.log('[Mobile] 日记删除同步成功:', id);
                                    } catch (error) {
                                        console.error('[Mobile] 日记删除同步失败:', error);
                                    }
                                })();
                            }
                        }}
                        onExplore={(entry) => {
                            setGameState(prev => ({ ...prev, activeJournalEntryId: entry.id, currentScreen: 'sceneSelection' }));
                        }}
                        onConsultMirror={(c, r) => geminiService.generateMirrorInsight(c, r)}
                        autoGenerateImage={gameState.settings.autoGenerateJournalImages}
                        onSwitchToPC={handleSwitchToPCWrapper}
                        userName={gameState.userProfile?.nickname}
                    />
                )}

                {gameState.currentScreen === 'sceneSelection' && (
                    <MobileSceneSelection 
                        scenes={allScenes}
                        onSelectScene={handleSelectScene}
                        onCreateScene={() => setShowEraCreator(true)}
                    />
                )}

                {gameState.currentScreen === 'characterSelection' && currentScene && (
                    <MobileCharacterSelection 
                        scene={currentScene}
                        characters={currentSceneChars}
                        scenarios={currentSceneScenarios}
                        onBack={() => setGameState(prev => ({ ...prev, currentScreen: 'sceneSelection', selectedSceneId: null }))}
                        onSelectCharacter={handleSelectCharacter}
                        onPlayScenario={handlePlayScenario}
                        onAddCharacter={() => setShowCharacterCreator(true)}
                        onAddScenario={() => setShowScenarioBuilder(true)}
                    />
                )}

                {gameState.currentScreen === 'connectionSpace' && gameState.userProfile && (
                    <ConnectionSpace 
                        characters={allScenes.flatMap(s => [...s.characters, ...(gameState.customCharacters[s.id]||[])])}
                        userProfile={gameState.userProfile}
                        onConnect={(char) => {
                             // Find scene for char to set context
                             const s = allScenes.find(sc => [...sc.characters, ...(gameState.customCharacters[sc.id]||[])].some(c => c.id === char.id));
                             if (s) {
                                 setGameState(prev => ({
                                     ...prev,
                                     selectedSceneId: s.id,
                                     selectedCharacterId: char.id,
                                     currentScreen: 'chat'
                                 }));
                             }
                        }}
                        onBack={() => setGameState(prev => ({...prev, currentScreen: 'sceneSelection'}))}
                    />
                )}

                {gameState.currentScreen === 'mobileProfile' && gameState.userProfile && (
                    <MobileProfile 
                        userProfile={gameState.userProfile}
                        journalEntries={gameState.journalEntries}
                        mailbox={gameState.mailbox}
                        history={gameState.history}
                        onOpenSettings={() => setShowSettings(true)}
                        onLogout={handleLogout}
                        onUpdateProfile={(profile) => setGameState(prev => ({ ...prev, userProfile: profile }))}
                    />
                )}

                {gameState.currentScreen === 'chat' && activeCharacter && (
                    <div className="h-full pb-0 relative z-20"> 
                        <ChatWindow 
                            character={activeCharacter}
                            customScenario={gameState.selectedScenarioId ? gameState.customScenarios.find(s => s.id === gameState.selectedScenarioId) : undefined}
                            history={gameState.history[activeCharacter.id] || []}
                            scenarioState={gameState.currentScenarioState}
                            settings={gameState.settings}
                            userProfile={gameState.userProfile!}
                            activeJournalEntryId={gameState.activeJournalEntryId}
                            onUpdateHistory={(msgs) => setGameState(prev => ({...prev, history: {...prev.history, [activeCharacter!.id]: msgs}}))}
                            onUpdateScenarioState={(nodeId) => setGameState(prev => ({ ...prev, currentScenarioState: { ...prev.currentScenarioState!, currentNodeId: nodeId } }))}
                            onBack={() => setGameState(prev => ({...prev, currentScreen: 'characterSelection', selectedCharacterId: null, tempStoryCharacter: null, selectedScenarioId: null }))}
                        />
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showSettings && (
                <SettingsModal 
                    settings={gameState.settings}
                    gameState={gameState}
                    onSettingsChange={s => setGameState(prev => ({...prev, settings: s}))}
                    onUpdateProfile={(profile) => setGameState(prev => ({ ...prev, userProfile: profile }))}
                    onClose={() => setShowSettings(false)}
                    onLogout={handleLogout}
                    onBindAccount={() => { setShowSettings(false); setShowLoginModal(true); }}
                />
            )}
            
            {showLoginModal && (
                <LoginModal
                    onLoginSuccess={handleLoginSuccess}
                    onCancel={() => setShowLoginModal(false)}
                    initialNickname={
                        gameState.currentScreen === 'profileSetup' && profileNickname.trim()
                            ? profileNickname.trim()
                            : gameState.userProfile?.isGuest 
                                ? gameState.userProfile.nickname 
                                : undefined
                    }
                />
            )}
            
            {showMailbox && (
                <MailboxModal 
                    mails={gameState.mailbox}
                    onClose={() => setShowMailbox(false)}
                    onMarkAsRead={id => setGameState(prev => ({...prev, mailbox: prev.mailbox.map(m => m.id === id ? {...m, isRead: true} : m)}))}
                />
            )}

            {/* CREATOR MODALS */}
            {showEraCreator && (
                <EraConstructorModal 
                    initialScene={gameState.userWorldScenes.find(s => s.id === gameState.selectedSceneId) || gameState.customScenes.find(s => s.id === gameState.selectedSceneId) || null}
                    onSave={handleSaveEra}
                    onDelete={async () => {
                        const sceneId = gameState.selectedSceneId;
                        if (!sceneId) return;
                        
                        const confirmed = await showConfirm("确定要删除这个场景吗？删除后将移至回收站，可以随时恢复。", '删除场景', 'warning');
                        if (confirmed) {
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

                            // 2. 异步同步到服务器（如果已登录且ID是数字）
                            const token = localStorage.getItem('auth_token');
                            const isNumericId = /^\d+$/.test(sceneId);
                            if (token && gameState.userProfile && !gameState.userProfile.isGuest && isNumericId) {
                                (async () => {
                                    try {
                                        const eraId = parseInt(sceneId, 10);
                                        await eraApi.deleteEra(eraId, token);
                                        console.log('[Mobile] 场景删除同步成功:', eraId);
                                    } catch (error) {
                                        console.error('[Mobile] 场景删除同步失败:', error);
                                    }
                                })();
                            }
                        }
                    }}
                    onClose={() => setShowEraCreator(false)}
                />
            )}
            
            {showCharacterCreator && currentScene && (
                <CharacterConstructorModal
                    scene={currentScene}
                    onSave={handleSaveCharacter}
                    onClose={() => setShowCharacterCreator(false)}
                />
            )}
            
            {showScenarioBuilder && (
                 <div className="absolute inset-0 z-50 bg-black">
                     <MobileScenarioBuilder 
                         onSave={handleSaveScenario}
                         onCancel={() => setShowScenarioBuilder(false)}
                     />
                 </div>
            )}

            {/* NAV BAR */}
            {gameState.currentScreen !== 'chat' && gameState.currentScreen !== 'connectionSpace' && !showScenarioBuilder && (
                <MobileBottomNav 
                    currentScreen={gameState.currentScreen}
                    onNavigate={(s) => setGameState(prev => ({...prev, currentScreen: s}))}
                    hasUnreadMail={gameState.mailbox.some(m => !m.isRead)}
                    onOpenMail={() => setShowMailbox(true)}
                />
            )}
        </div>
    );
};
