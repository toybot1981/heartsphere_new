
import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Character, Message, WorldScene, JournalEntry, AppSettings, CustomScenario } from '../types';
import { aiService } from '../services/ai/AIService';
import { storageService } from '../services/storage';
import { WORLD_SCENES } from '../constants';
import { authApi, journalApi, worldApi, eraApi, characterApi, scriptApi, presetScriptApi, userMainStoryApi } from '../services/api';
import { getWorldIdForSceneId, initCustomSceneMappings } from '../utils/sceneMapping';
import { useJournalHandlers } from '../hooks/useJournalHandlers';
import { useGameState } from '../contexts/GameStateContext';
import { useSharedMode } from '../hooks/useSharedMode';
// 不再使用 syncService，直接调用 API
import { initSyncConfigs } from '../services/sync/syncConfig';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileErrorBoundary } from './components/MobileErrorBoundary';
import { showAlert, showConfirm } from '../utils/dialog';
import { MobileLoginScreen } from './screens/MobileLoginScreen';
import { MobileSettingsModal } from './components/modals/MobileSettingsModal';
import type { ShareConfig } from '../services/api/heartconnect/types';
import { convertBackendScriptToScenario } from '../utils/dataTransformers';

// Phase 5优化: 使用懒加载导入Screen组件（除了ProfileSetup需要在初始化时使用）
import { MobileProfileSetupScreen } from './screens/MobileProfileSetupScreen';
// 其他Screen组件通过路由系统懒加载，不需要在这里导入

// 导入MobileScenarioBuilder组件
import { MobileScenarioBuilder } from './MobileScenarioBuilder';

// 导入路由渲染系统（第一阶段构建的架构）
import { renderCurrentScreen } from './utils/renderScreen';
import type { ScreenPropsBuilder } from './utils/buildScreenProps';
import { MobileQuickConnectModal } from './components/modals/MobileQuickConnectModal';

// Mobile Modals
import { MobileEraConstructorModal } from './components/modals/MobileEraConstructorModal';
import { MobileCharacterConstructorModal } from './components/modals/MobileCharacterConstructorModal';

interface MobileAppProps {
    onSwitchToPC: () => void;
}

export const MobileApp: React.FC<MobileAppProps> = ({ onSwitchToPC }) => {
    
    // --- STATE ---
    // 使用GameStateProvider提供的状态管理
    const { state: gameState, dispatch } = useGameState();
    
    // 共享模式状态管理（复用PC版本的Hook）
    const { isActive: isSharedModeActive, shareConfig, leaveSharedMode, enterSharedMode } = useSharedMode();
    
    // 共享场景列表（用于共享模式下获取场景）
    const [sharedScenes, setSharedScenes] = useState<WorldScene[]>([]);
    
    // 在共享模式下加载共享场景数据
    useEffect(() => {
        if (!isSharedModeActive || !shareConfig) {
            setSharedScenes([]);
            return;
        }
        
        const loadSharedScenes = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                if (!token) return;
                
                const { sharedApi } = await import('../services/api/heartconnect');
                const { convertErasToWorldScenes } = await import('../utils/dataTransformers');
                
                const worlds = await sharedApi.getSharedWorlds(token);
                const eras = await sharedApi.getSharedEras(token);
                
                // 加载所有场景的角色数据
                const allCharacters: any[] = [];
                const characterPromises = eras.map(async (era) => {
                    try {
                        const characters = await sharedApi.getSharedCharactersByEraId(era.id, token);
                        return characters.map((char: any) => ({ ...char, eraId: era.id }));
                    } catch (err) {
                        return [];
                    }
                });
                const characterArrays = await Promise.all(characterPromises);
                characterArrays.forEach((chars) => allCharacters.push(...chars));
                
                const convertedCharacters = allCharacters.map((char: any) => ({
                    id: `character_${char.id}`,
                    name: char.name || '未命名角色',
                    description: char.description || '',
                    avatarUrl: char.avatarUrl || '',
                    personality: char.personality || '',
                    background: char.background || '',
                    eraId: char.eraId?.toString() || '',
                    worldId: eras.find(e => e.id === char.eraId)?.worldId?.toString() || '',
                }));
                
                const scenes = convertErasToWorldScenes(
                    worlds,
                    eras,
                    convertedCharacters,
                    undefined,
                    undefined,
                    true
                );
                
                setSharedScenes(scenes);
            } catch (err) {
                console.error('[MobileApp] 加载共享场景失败:', err);
                setSharedScenes([]);
            }
        };
        
        loadSharedScenes();
    }, [isSharedModeActive, shareConfig]);
    
    const [isLoaded, setIsLoaded] = useState(false);
    const [profileNickname, setProfileNickname] = useState('');
    const [showGuestNicknameModal, setShowGuestNicknameModal] = useState(false);
    
    // UI States
    const [showSettings, setShowSettings] = useState(false);
    const [showEraCreator, setShowEraCreator] = useState(false);
    const [showCharacterCreator, setShowCharacterCreator] = useState(false);
    const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showQuickConnect, setShowQuickConnect] = useState(false);

    // --- INIT & STORAGE ---
    // 注意：GameStateProvider会自动加载状态，这里只需要初始化场景映射和同步服务
    useEffect(() => {
        const init = async () => {
            // 初始化同步配置
            initSyncConfigs();
            
            // 初始化场景映射（如果已登录）
            const token = localStorage.getItem('auth_token');
            if (token) {
                await initCustomSceneMappings();
            }
            setIsLoaded(true);
        };
        init();
    }, []);

    // 自动登录检查（类似PC版本的useAuthHandlers中的checkAuth）
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            // 只在有token但没有用户信息时执行自动登录
            if (token && (!gameState.userProfile || gameState.userProfile.isGuest)) {
                try {
                    const userInfo = await authApi.getCurrentUser(token);
                    
                    // 获取日记列表
                    const journalEntries = await journalApi.getAllJournalEntries(token);
                    
                    // 获取世界列表
                    const remoteWorlds = await worldApi.getAllWorlds(token);
                    
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
                    remoteWorlds.forEach(world => {
                        const worldEras = erasByWorldId.get(world.id) || [];
                        worldEras.forEach(era => {
                            const eraCharacters = charactersByEraId.get(era.id) || [];
                            const scene: WorldScene = {
                                id: era.id.toString(),
                                name: era.name,
                                description: era.description,
                                imageUrl: era.imageUrl || '',
                                systemEraId: era.systemEraId || undefined,
                                characters: eraCharacters.map((char: any) => ({
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
                                    catchphrases: char.catchphrases || [],
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
                    
                    // 更新用户信息
                    dispatch({ type: 'SET_USER_PROFILE', payload: {
                        id: String(userInfo.id),
                        nickname: userInfo.nickname || userInfo.username || '用户',
                        avatarUrl: userInfo.avatar || '',
                        isGuest: false,
                    }});
                    
                    // 更新日记列表
                    dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: journalEntries.map(entry => ({
                        id: entry.id,
                        title: entry.title,
                        content: entry.content,
                        timestamp: new Date(entry.entryDate).getTime(),
                        imageUrl: entry.imageUrl || '',
                        insight: entry.insight || undefined,
                        tags: entry.tags || undefined,
                        syncStatus: 1 as any,
                        lastSyncTime: Date.now(),
                        syncError: undefined,
                    }))});
                    
                    // 更新世界场景
                    dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
                    
                    // 如果有场景，选择第一个
                    if (userWorldScenes.length > 0 && !gameState.selectedSceneId) {
                        dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: userWorldScenes[0].id });
                    }
                    
                } catch (err: any) {
                    console.error('[MobileApp] 自动登录失败:', err.message || err);
                    // token无效，清除
                    localStorage.removeItem('auth_token');
                }
            }
        };
        
        checkAuth();
    }, []); // 只在组件挂载时执行一次

    // 监听navigateToShared事件（用于从外部进入共享心域）
    useEffect(() => {
        const handleNavigateToShared = async (event: Event) => {
            const customEvent = event as CustomEvent<{ shareConfig: ShareConfig; visitorId: number }>;
            const { shareConfig, visitorId } = customEvent.detail || {};
            
            if (shareConfig && visitorId) {
                try {
                    enterSharedMode(shareConfig, visitorId);
                    dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
                } catch (err) {
                    console.error('[MobileApp] 进入共享模式失败:', err);
                }
            }
        };
        
        window.addEventListener('navigateToShared', handleNavigateToShared);
        return () => {
            window.removeEventListener('navigateToShared', handleNavigateToShared);
        };
    }, [enterSharedMode, dispatch]);

    // 更新AI服务配置（当settings变化时）
    useEffect(() => {
        if (!isLoaded) return;
        aiService.updateConfigFromAppSettings(gameState.settings);
    }, [gameState.settings, isLoaded]);

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
            return;
        }

        const loadData = async () => {
            try {
                // 检查是否处于共享模式（通过全局状态）
                const { getSharedModeState } = await import('../services/api/base/sharedModeState');
                const sharedModeState = getSharedModeState();
                const isSharedMode = sharedModeState.shareConfigId !== null;
                
                let worlds, eras;
                if (isSharedMode) {
                    // 共享模式：调用共享模式专用接口
                    const { sharedApi } = await import('../services/api/heartconnect');
                    worlds = await sharedApi.getSharedWorlds(token);
                    eras = await sharedApi.getSharedEras(token);
                } else {
                    // 正常模式：调用原有接口
                    worlds = await worldApi.getAllWorlds(token);
                    eras = await eraApi.getAllEras(token);
                }
                
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
                dispatch({ type: 'SET_USER_WORLD_SCENES', payload: userWorldScenes });
                
            } catch (error) {
                console.error('[Mobile DataLoader] 数据加载失败:', error);
            }
        };
        
        loadData();
    }, [gameState.currentScreen, gameState.userProfile?.id]);

    // --- ACTIONS ---

    const handleSwitchToPCWrapper = async () => {
        // GameStateProvider会自动保存状态，这里只需要切换模式
        onSwitchToPC();
    };

    const handleProfileSubmit = () => {
        if (!profileNickname.trim()) return;
        dispatch({ 
            type: 'SET_USER_PROFILE', 
            payload: { nickname: profileNickname.trim(), avatarUrl: '', isGuest: true, id: `guest_${Date.now()}` }
        });
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'realWorld' });
        setShowGuestNicknameModal(false);
        setProfileNickname('');
    };

    const handleLogout = () => {
        // 保留settings，清除其他状态
        dispatch({ type: 'SET_USER_PROFILE', payload: null });
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'profileSetup' });
        dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: null });
        dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: null });
        dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: null });
        dispatch({ type: 'CLEAR_HISTORY', payload: 'all' });
        dispatch({ type: 'SET_USER_WORLD_SCENES', payload: [] });
        dispatch({ type: 'SET_CUSTOM_SCENES', payload: [] });
        dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {} });
        dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: [] });
        dispatch({ type: 'SET_JOURNAL_ENTRIES', payload: [] });
        setShowSettings(false);
    };

    // 兼容层：将复杂的setGameState调用转换为dispatch
    // 用于处理需要访问prev状态的复杂更新
    const setGameState = useCallback((updater: GameState | ((prev: GameState) => GameState)) => {
        if (typeof updater === 'function') {
            const newState = updater(gameState);
            dispatch({ type: 'BATCH_UPDATE', payload: newState });
        } else {
            dispatch({ type: 'BATCH_UPDATE', payload: updater });
        }
    }, [gameState, dispatch]);

    const handleLoginSuccess = async (method: 'password' | 'wechat', identifier: string, isFirstLogin?: boolean, worlds?: any[]) => {
        // 从localStorage获取token
        const token = localStorage.getItem('auth_token');
        
        // 初始化场景映射
        if (token) {
            await initCustomSceneMappings();
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

    // 与PC版本保持一致：优先使用 userWorldScenes（含游客初始化后的场景），为空时才回退到 WORLD_SCENES
    const getCurrentScenes = () => {
        if (gameState.userWorldScenes && gameState.userWorldScenes.length > 0) {
            return gameState.userWorldScenes;
        }
        return WORLD_SCENES;
    };

    const allScenes = getCurrentScenes();
    let currentScene = allScenes.find(s => s.id === gameState.selectedSceneId);
    // 在共享模式下，如果 allScenes 中找不到，从 sharedScenes 中查找
    if (!currentScene && isSharedModeActive && gameState.selectedSceneId) {
        currentScene = sharedScenes.find(s => s.id === gameState.selectedSceneId);
    }
    
    // Get Characters for current scene（不再使用本地缓存的 customCharacters）
    const currentSceneChars = currentScene 
        ? currentScene.characters
        : [];
        
    // Get Scenarios for current scene
    // 获取当前场景的剧本（包括用户自定义和系统预设）
    const [systemScripts, setSystemScripts] = React.useState<CustomScenario[]>([]);
    
    React.useEffect(() => {
        // 当场景变化时，加载系统预设剧本
        if (currentScene && currentScene.id) {
            const eraId = parseInt(currentScene.id);
            if (!isNaN(eraId)) {
                presetScriptApi.getByEraId(eraId)
                    .then(scripts => {
                        // 将系统预设剧本转换为 CustomScenario 格式
                        const convertedScripts: CustomScenario[] = scripts.map(script => {
                            try {
                                const content = JSON.parse(script.content || '{}');
                                // 确保 nodes 是对象类型
                                const nodes = content.nodes || {};
                                if (typeof nodes !== 'object' || Array.isArray(nodes)) {
                                    console.warn('[MobileApp] 系统预设剧本 nodes 格式无效:', { scriptId: script.id, nodesType: typeof nodes });
                                    return {
                                        id: `system_script_${script.id}`,
                                        sceneId: currentScene.id,
                                        title: script.title,
                                        description: script.description || '',
                                        author: '系统预设',
                                        startNodeId: 'start',
                                        nodes: {} // 确保是空对象而不是 undefined
                                    };
                                }
                                return {
                                    id: `system_script_${script.id}`,
                                    sceneId: currentScene.id,
                                    title: script.title,
                                    description: script.description || '',
                                    author: '系统预设',
                                    startNodeId: content.startNodeId || Object.keys(nodes)[0] || 'start',
                                    nodes: nodes // 确保是对象
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

    // 从当前场景的 scripts 获取剧本（不再使用本地缓存的 customScenarios）
    const currentSceneScenarios = currentScene
        ? [
            ...(currentScene.scripts || []).map(script => {
              try {
                // 使用统一的转换函数确保 nodes 格式正确
                return convertBackendScriptToScenario(script, currentScene.id);
              } catch (error) {
                console.error('[MobileApp] 转换剧本失败:', { scriptId: script.id, error });
                // 降级处理：尝试直接解析
                let nodes = {};
                let startNodeId = '';
                try {
                  if (script.content) {
                    const parsed = JSON.parse(script.content);
                    nodes = parsed.nodes || {};
                    startNodeId = parsed.startNodeId || Object.keys(nodes)[0] || '';
                  }
                } catch (parseError) {
                  console.error('[MobileApp] 解析剧本内容失败:', parseError);
                }
                return {
                  id: script.id.toString(),
                  title: script.title,
                  description: script.description || null,
                  sceneId: currentScene.id,
                  nodes: nodes, // 确保是对象而不是 undefined
                  startNodeId: startNodeId,
                  author: '用户',
                  participatingCharacters: script.characterIds ? JSON.parse(script.characterIds) : []
                };
              }
            }),
            ...systemScripts
          ]
        : [];

    let activeCharacter = null;
    if (gameState.selectedCharacterId) {
        
        // Also check if it's the narrator for a scenario
        if (gameState.tempStoryCharacter && gameState.tempStoryCharacter.id === gameState.selectedCharacterId) {
             activeCharacter = gameState.tempStoryCharacter;
        } else if (currentScene) {
             activeCharacter = currentSceneChars.find(c => c.id === gameState.selectedCharacterId);
             // Fallback to main story if id matches
             if (!activeCharacter && currentScene.mainStory?.id === gameState.selectedCharacterId) {
                 activeCharacter = currentScene.mainStory;
             } else if (activeCharacter) {
             }
        }
        
        // 在共享模式下，如果 currentScene 中找不到，从 sharedScenes 中查找
        if (!activeCharacter && isSharedModeActive && gameState.selectedCharacterId) {
            for (const scene of sharedScenes) {
                const char = scene.characters.find(c => c.id === gameState.selectedCharacterId);
                if (char) {
                    activeCharacter = char;
                    break;
                }
                // 也检查 mainStory
                if (scene.mainStory?.id === gameState.selectedCharacterId) {
                    activeCharacter = scene.mainStory;
                    break;
                }
            }
            if (!activeCharacter) {
                console.warn('[MobileApp] 在 sharedScenes 中未找到角色，selectedCharacterId:', gameState.selectedCharacterId);
                console.warn('[MobileApp] sharedScenes 中的角色ID列表:', sharedScenes.flatMap(s => s.characters.map(c => c.id)));
            }
        }
        
        if (!activeCharacter) {
            console.error('[MobileApp] ❌ 无法找到 activeCharacter，selectedCharacterId:', gameState.selectedCharacterId);
        } else {
        }
    }

    const handleSelectScene = (sceneId: string) => {
        // 在共享模式下，导航到 sharedCharacterSelection
        const targetScreen = isSharedModeActive ? 'sharedCharacterSelection' : 'characterSelection';
        setGameState(prev => ({
            ...prev,
            selectedSceneId: sceneId,
            selectedCharacterId: null,
            currentScreen: targetScreen // Go to detail view
        }));
    };

    const handleSelectCharacter = (char: Character) => {
        // 在共享模式下，导航到 sharedChat，并保存角色数据到 tempStoryCharacter
        const targetScreen = isSharedModeActive ? 'sharedChat' : 'chat';
        setGameState(prev => ({
            ...prev,
            selectedCharacterId: char.id,
            // 在共享模式下，保存角色数据到 tempStoryCharacter，以便 activeCharacter 计算逻辑能够找到
            tempStoryCharacter: isSharedModeActive ? char : null,
            selectedScenarioId: null,
            currentScenarioState: undefined,
            currentScreen: targetScreen
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

        aiService.resetSession(narrator.id);

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
                // 新建模式：不保存到本地，直接提交到服务器
                // 临时更新 UI，但会在服务器同步后刷新
                return prev;
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

                // 刷新场景列表，从服务器获取最新数据
                const worlds = await worldApi.getAllWorlds(token);
                const eras = await eraApi.getAllEras(token);
                const characters = await characterApi.getAllCharacters(token);
                const scripts = await scriptApi.getAllScripts(token);
                const userMainStories = await userMainStoryApi.getAll(token);
                
                const { convertErasToWorldScenes } = await import('../utils/dataTransformers');
                const updatedUserWorldScenes = convertErasToWorldScenes(
                    worlds,
                    eras,
                    characters,
                    scripts,
                    userMainStories
                );

                // 保留原有的 memories
                const scenesWithMemories = updatedUserWorldScenes.map(scene => {
                    const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
                    return {
                        ...scene,
                        memories: existingScene?.memories
                    };
                });

                dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
                dispatch({ type: 'SET_CUSTOM_SCENES', payload: [] }); // 清空本地缓存
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
        // 直接调用 useCharacterHandlers 的 handleSaveCharacter（不再使用本地缓存）
        const { useCharacterHandlers } = await import('../hooks/useCharacterHandlers');
        // 注意：这里需要直接调用 API，而不是通过 hook
        // 由于 hook 只能在组件中使用，我们需要直接调用 API
        const token = localStorage.getItem('auth_token');
        const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
        
        if (!token || isGuest) {
            showAlert('请先登录才能保存角色', '需要登录', 'warning');
            return;
        }

        try {
            // 使用 useCharacterHandlers 的逻辑，但直接调用 API
            // 这里简化处理，直接调用 characterApi
            const allScenes = (gameState.userWorldScenes && gameState.userWorldScenes.length > 0)
                ? gameState.userWorldScenes
                : WORLD_SCENES;
            const currentScene = allScenes.find(s => s.id === sceneId);
            const worldId = currentScene?.worldId || getWorldIdForSceneId(sceneId);
            
            // 提取 eraId
            const numericMatch = sceneId.match(/\d+$/);
            const eraId = numericMatch ? parseInt(numericMatch[0], 10) : null;

            const isNumericId = /^\d+$/.test(newCharacter.id);
            
            if (isNumericId) {
                // 更新现有角色
                const characterId = parseInt(newCharacter.id, 10);
                await characterApi.updateCharacter(characterId, {
                    name: newCharacter.name,
                    description: newCharacter.bio || newCharacter.description || '',
                    age: newCharacter.age,
                    gender: newCharacter.role || newCharacter.gender || '',
                    worldId: worldId,
                    eraId: eraId || null,
                    role: newCharacter.role,
                    bio: newCharacter.bio,
                    avatarUrl: newCharacter.avatarUrl,
                    backgroundUrl: newCharacter.backgroundUrl,
                    themeColor: newCharacter.themeColor,
                    colorAccent: newCharacter.colorAccent,
                    firstMessage: newCharacter.firstMessage,
                    systemInstruction: newCharacter.systemInstruction,
                    voiceName: newCharacter.voiceName,
                    mbti: newCharacter.mbti,
                    tags: Array.isArray(newCharacter.tags) ? newCharacter.tags.join(',') : newCharacter.tags,
                    speechStyle: newCharacter.speechStyle,
                    catchphrases: Array.isArray(newCharacter.catchphrases) ? newCharacter.catchphrases.join(',') : newCharacter.catchphrases,
                    secrets: newCharacter.secrets,
                    motivations: newCharacter.motivations,
                    relationships: newCharacter.relationships,
                }, token);
            } else {
                // 创建新角色
                await characterApi.createCharacter({
                    name: newCharacter.name,
                    description: newCharacter.bio || newCharacter.description || '',
                    age: newCharacter.age,
                    gender: newCharacter.role || newCharacter.gender || '',
                    worldId: worldId,
                    eraId: eraId || null,
                    role: newCharacter.role,
                    bio: newCharacter.bio,
                    avatarUrl: newCharacter.avatarUrl,
                    backgroundUrl: newCharacter.backgroundUrl,
                    themeColor: newCharacter.themeColor,
                    colorAccent: newCharacter.colorAccent,
                    firstMessage: newCharacter.firstMessage,
                    systemInstruction: newCharacter.systemInstruction,
                    voiceName: newCharacter.voiceName,
                    mbti: newCharacter.mbti,
                    tags: Array.isArray(newCharacter.tags) ? newCharacter.tags.join(',') : newCharacter.tags,
                    speechStyle: newCharacter.speechStyle,
                    catchphrases: Array.isArray(newCharacter.catchphrases) ? newCharacter.catchphrases.join(',') : newCharacter.catchphrases,
                    secrets: newCharacter.secrets,
                    motivations: newCharacter.motivations,
                    relationships: newCharacter.relationships,
                }, token);
            }

            // 刷新场景列表，从服务器获取最新数据
            const worlds = await worldApi.getAllWorlds(token);
            const eras = await eraApi.getAllEras(token);
            const characters = await characterApi.getAllCharacters(token);
            const scripts = await scriptApi.getAllScripts(token);
            const userMainStories = await userMainStoryApi.getAll(token);
            
            const { convertErasToWorldScenes } = await import('../utils/dataTransformers');
            const updatedUserWorldScenes = convertErasToWorldScenes(
                worlds,
                eras,
                characters,
                scripts,
                userMainStories
            );

            // 保留原有的 memories
            const scenesWithMemories = updatedUserWorldScenes.map(scene => {
                const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
                return {
                    ...scene,
                    memories: existingScene?.memories
                };
            });

            dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
            dispatch({ type: 'SET_CUSTOM_CHARACTERS', payload: {} }); // 清空本地缓存
            setShowCharacterCreator(false);
        } catch (error: any) {
            console.error('[Mobile] 角色保存失败:', error);
            const errorMessage = error.message || '未知错误';
            showAlert(`角色保存失败: ${errorMessage}`, '保存失败', 'error');
        }
    };

    const handleSaveScenario = async (scenario: CustomScenario) => {
        if (!gameState.selectedSceneId) return;
        
        const token = localStorage.getItem('auth_token');
        const isGuest = !gameState.userProfile || gameState.userProfile.isGuest;
        
        if (!token || isGuest) {
            showAlert('请先登录才能保存剧本', '需要登录', 'warning');
            return;
        }

        try {
            // 获取当前场景信息，以便获取 worldId 和 eraId
            const currentScene = allScenes.find(s => s.id === gameState.selectedSceneId);
            const worldId = currentScene?.worldId || getWorldIdForSceneId(gameState.selectedSceneId);
            
            // 提取 eraId（场景ID中的数字部分）
            const numericMatch = gameState.selectedSceneId.match(/\d+$/);
            const eraId = numericMatch ? parseInt(numericMatch[0], 10) : null;

            // 将 CustomScenario 转换为 CreateScriptDTO 或 UpdateScriptDTO
            const scriptContent = JSON.stringify(scenario);
            const isNumericId = /^\d+$/.test(scenario.id);
            
            if (isNumericId) {
                // 更新现有剧本
                const scriptId = parseInt(scenario.id, 10);
                await scriptApi.updateScript(scriptId, {
                    title: scenario.title,
                    description: scenario.description || null,
                    content: scriptContent,
                    sceneCount: Object.keys(scenario.nodes || {}).length,
                    characterIds: null,
                    tags: null,
                    worldId: worldId,
                    eraId: eraId || undefined,
                }, token);
            } else {
                // 创建新剧本
                const createdScript = await scriptApi.createScript({
                    title: scenario.title,
                    description: scenario.description || null,
                    content: scriptContent,
                    sceneCount: Object.keys(scenario.nodes || {}).length,
                    characterIds: null,
                    tags: null,
                    worldId: worldId,
                    eraId: eraId || undefined,
                }, token);
            }

            // 刷新场景列表，从服务器获取最新数据
            const worlds = await worldApi.getAllWorlds(token);
            const eras = await eraApi.getAllEras(token);
            const characters = await characterApi.getAllCharacters(token);
            const scripts = await scriptApi.getAllScripts(token);
            const userMainStories = await userMainStoryApi.getAll(token);
            
            const { convertErasToWorldScenes } = await import('../utils/dataTransformers');
            const updatedUserWorldScenes = convertErasToWorldScenes(
                worlds,
                eras,
                characters,
                scripts,
                userMainStories
            );

            // 保留原有的 memories
            const scenesWithMemories = updatedUserWorldScenes.map(scene => {
                const existingScene = gameState.userWorldScenes.find(s => s.id === scene.id);
                return {
                    ...scene,
                    memories: existingScene?.memories
                };
            });

            dispatch({ type: 'SET_USER_WORLD_SCENES', payload: scenesWithMemories });
            dispatch({ type: 'SET_CUSTOM_SCENARIOS', payload: [] }); // 清空本地缓存
            dispatch({ type: 'SET_EDITING_SCENARIO_ID', payload: null });
            setShowScenarioBuilder(false);
        } catch (error: any) {
            console.error('[Mobile] 剧本保存失败:', error);
            const errorMessage = error.message || '未知错误';
            showAlert(`剧本保存失败: ${errorMessage}`, '保存失败', 'error');
        }
    };


    // --- RENDER ---
    
    if (!isLoaded) return (
      <div 
        className="h-screen flex items-center justify-center"
        style={{
          backgroundColor: 'var(--bg-primary, #000000)',
          color: 'var(--text-primary)',
        }}
      >
        Loading Mobile Core...
      </div>
    );

    // ProfileSetup Screen - 使用独立的Screen组件（特殊处理，不通过路由映射）
    // 注意：ProfileSetup在CONTENT AREA中单独处理，这里不需要重复渲染
    // if (gameState.currentScreen === 'profileSetup') {
    //     return (
    //         <MobileProfileSetupScreen
    //             onGuestEnter={handleProfileSubmit}
    //             onLogin={() => setShowLoginModal(true)}
    //         />
    //     );
    // }

    // 准备handlers对象（用于新的路由渲染系统）
    const handlers = {
        handleNavigate: (screen: GameState['currentScreen']) => {
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
        },
        handleSelectScene: handleSelectScene,
        handleSelectCharacter: handleSelectCharacter,
        handlePlayScenario: handlePlayScenario,
        handleBack: () => {
            // 根据当前屏幕和共享模式状态返回到正确的页面
            const currentScreen = gameState.currentScreen;
            if (currentScreen === 'sharedChat') {
                // 从 sharedChat 返回：返回到 sharedHeartSphere（共享场景列表）
                setGameState(prev => ({ ...prev, currentScreen: 'sharedHeartSphere', selectedSceneId: null, selectedCharacterId: null }));
            } else if (currentScreen === 'sharedCharacterSelection') {
                // 从 sharedCharacterSelection 返回：返回到 sharedHeartSphere（共享场景列表）
                setGameState(prev => ({ ...prev, currentScreen: 'sharedHeartSphere', selectedSceneId: null }));
            } else if (isSharedModeActive) {
                // 其他共享模式页面：返回到 sharedHeartSphere
                setGameState(prev => ({ ...prev, currentScreen: 'sharedHeartSphere' }));
            } else {
                // 正常模式：返回到 sceneSelection
                setGameState(prev => ({ ...prev, currentScreen: 'sceneSelection', selectedSceneId: null }));
            }
        },
        handleAddEntry: async (title: string, content: string, imageUrl?: string, insight?: string, tags?: string) => {
                            const token = localStorage.getItem('auth_token');
                            if (!token || !gameState.userProfile || gameState.userProfile.isGuest) {
                                showAlert('请先登录', '提示', 'warning');
                                return;
                            }

                            try {
                                const apiRequestData: any = {
                    title,
                    content,
                                    entryDate: new Date().toISOString()
                                };
                if (tags) apiRequestData.tags = tags;
                if (insight) apiRequestData.insight = insight;
                if (imageUrl !== undefined && imageUrl !== null) apiRequestData.imageUrl = imageUrl;
                
                                await journalApi.createJournalEntry(apiRequestData, token);
                                const allEntries = await journalApi.getAllJournalEntries(token);
                                const mappedEntries = allEntries.map(entry => ({
                                    id: entry.id.toString(),
                                    title: entry.title,
                                    content: entry.content,
                                    timestamp: new Date(entry.entryDate).getTime(),
                                    imageUrl: entry.imageUrl || undefined,
                                    insight: entry.insight || undefined,
                                    tags: entry.tags || undefined,
                                }));
                                
                setGameState(prev => ({ ...prev, journalEntries: mappedEntries }));
                            } catch (error) {
                                console.error('[Mobile] 日记创建失败:', error);
                                showAlert('日记创建失败，请重试', '错误', 'error');
                            }
        },
        handleUpdateEntry: async (entry: JournalEntry) => {
            // 验证 entry.id 是否存在且有效
            if (!entry.id) {
                showAlert('日记ID无效，无法更新', '提示', 'warning');
                return;
            }

            const isTemporaryId = entry.id.startsWith('entry_') || entry.id.startsWith('e_');
            if (isTemporaryId) {
                showAlert('临时日记无法更新', '提示', 'warning');
                return;
            }

            // 验证 ID 是否为非空字符串（后端接受String类型的ID，包括UUID）
            if (!entry.id || entry.id.trim() === '') {
                console.error('[Mobile] 无效的日记ID: 空字符串');
                showAlert('日记ID无效，无法更新', '提示', 'warning');
                return;
            }

            const token = localStorage.getItem('auth_token');
            if (!token) {
                showAlert('请先登录', '提示', 'warning');
                return;
            }

            try {
                await journalApi.updateJournalEntry(entry.id, {
                                    title: entry.title,
                                    content: entry.content,
                                    imageUrl: entry.imageUrl || undefined,
                                    insight: entry.insight || undefined,
                                    tags: entry.tags || undefined,
                }, token);
                
                const allEntries = await journalApi.getAllJournalEntries(token);
                const mappedEntries = allEntries.map(e => ({
                    id: e.id.toString(),
                    title: e.title,
                    content: e.content,
                    timestamp: new Date(e.entryDate).getTime(),
                    imageUrl: e.imageUrl || undefined,
                    insight: e.insight || undefined,
                    tags: e.tags || undefined,
                }));
                
                setGameState(prev => ({ ...prev, journalEntries: mappedEntries }));
                            } catch (error) {
                                console.error('[Mobile] 日记更新失败:', error);
                                showAlert('日记更新失败，请重试', '错误', 'error');
                            }
        },
        handleDeleteEntry: async (id: string) => {
            // 验证 ID 是否存在且有效
            if (!id || id.trim() === '') {
                showAlert('日记ID无效，无法删除', '提示', 'warning');
                return;
            }

            // 验证是否为临时ID
            const isTemporaryId = id.startsWith('entry_') || id.startsWith('e_');
            if (isTemporaryId) {
                showAlert('临时日记无法删除', '提示', 'warning');
                return;
            }

            const token = localStorage.getItem('auth_token');
            if (!token) {
                showAlert('请先登录', '提示', 'warning');
                return;
            }

            try {
                await journalApi.deleteJournalEntry(id, token);
                                const allEntries = await journalApi.getAllJournalEntries(token);
                                const mappedEntries = allEntries.map(entry => ({
                                    id: entry.id.toString(),
                                    title: entry.title,
                                    content: entry.content,
                                    timestamp: new Date(entry.entryDate).getTime(),
                                    imageUrl: entry.imageUrl || undefined,
                                    insight: entry.insight || undefined,
                                    tags: entry.tags || undefined,
                                }));
                                
                setGameState(prev => ({ ...prev, journalEntries: mappedEntries }));
                            } catch (error) {
                                console.error('[Mobile] 日记删除失败:', error);
                                showAlert('日记删除失败，请重试', '错误', 'error');
                            }
        },
        handleExplore: (entry: JournalEntry) => {
            dispatch({ type: 'SET_ACTIVE_JOURNAL_ENTRY_ID', payload: entry.id });
            dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sceneSelection' });
        },
        handleSaveScenario: handleSaveScenario,
        handleOpenSettings: () => setShowSettings(true),
        handleOpenLoginModal: () => setShowLoginModal(true),
        handleOpenEraCreator: () => setShowEraCreator(true),
        handleOpenCharacterCreator: () => setShowCharacterCreator(true),
        handleOpenScenarioBuilder: () => setShowScenarioBuilder(true),
        handleOpenQuickConnect: () => {
            setShowQuickConnect(true);
        },
        handleLogout: handleLogout,
        handleSwitchToPC: handleSwitchToPCWrapper,
        handleLoginSuccess: handleLoginSuccess,
        handleConsultMirror: (content: string, recentContext: string[]) => aiService.generateMirrorInsight(content, recentContext),
    };

    // 准备computed对象（用于新的路由渲染系统）
    const computed = {
        allScenes,
        currentScene,
        currentSceneChars,
        currentSceneScenarios,
        activeCharacter,
    };

    // 使用新的路由渲染系统（第一阶段构建的架构）
    const screenBuilder: ScreenPropsBuilder = {
        gameState,
        dispatch,
        handlers,
        computed,
    };

    const renderedScreen = renderCurrentScreen(gameState, screenBuilder);

    return (
        <MobileErrorBoundary>
        <div 
          className="h-screen w-full relative overflow-hidden"
          style={{
            backgroundColor: 'var(--bg-primary, #000000)',
            color: 'var(--text-primary)',
          }}
        >
            
            {/* CONTENT AREA */}
            <div className="h-full w-full relative overflow-hidden">
                {/* ProfileSetupScreen特殊处理，不走路由系统 */}
                {gameState.currentScreen === 'profileSetup' && (
                    <div 
                        key="profileSetup"
                        className="w-full h-full animate-fade-in transition-all duration-300 ease-in-out"
                    >
                        <MobileProfileSetupScreen
                            onGuestEnter={handleProfileSubmit}
                            onLogin={() => {
                                setShowLoginModal(true);
                            }}
                        />
                    </div>
                )}
                {/* 使用新的路由渲染系统（第一阶段构建的架构） */}
                {gameState.currentScreen !== 'profileSetup' && (
                    <div className="w-full h-full">
                        {renderedScreen}
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showSettings && (
                <MobileSettingsModal 
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
                <div className="fixed inset-0 z-[9999]">
                    <MobileLoginScreen
                        onLoginSuccess={handleLoginSuccess}
                        onCancel={() => {
                            setShowLoginModal(false);
                        }}
                        initialNickname={
                            gameState.currentScreen === 'profileSetup' && profileNickname.trim()
                                ? profileNickname.trim()
                                : gameState.userProfile?.isGuest 
                                    ? gameState.userProfile.nickname 
                                    : undefined
                        }
                    />
                </div>
            )}
            
            {showQuickConnect && (
                <MobileQuickConnectModal
                    isOpen={showQuickConnect}
                    onClose={() => setShowQuickConnect(false)}
                    onEnterSharedMode={() => {
                        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedHeartSphere' });
                    }}
                    onSelectCharacter={(quickConnectCharacter) => {
                        // 在共享模式下，选择角色后导航到共享聊天窗口
                        
                        // 将QuickConnectCharacter转换为Character对象
                        const character: Character = {
                            id: quickConnectCharacter.characterId.toString(),
                            name: quickConnectCharacter.characterName || quickConnectCharacter.name || '未知角色',
                            age: quickConnectCharacter.age || 0,
                            role: quickConnectCharacter.role || '角色',
                            bio: quickConnectCharacter.bio || '',
                            avatarUrl: quickConnectCharacter.avatarUrl || '',
                            backgroundUrl: quickConnectCharacter.backgroundUrl || '',
                            themeColor: quickConnectCharacter.themeColor || 'blue-500',
                            colorAccent: quickConnectCharacter.colorAccent || '#3b82f6',
                            firstMessage: quickConnectCharacter.firstMessage || '',
                            systemInstruction: quickConnectCharacter.systemInstruction || '',
                            voiceName: quickConnectCharacter.voiceName || 'Aoede',
                            mbti: quickConnectCharacter.mbti || 'INFJ',
                            tags: quickConnectCharacter.tags ? (typeof quickConnectCharacter.tags === 'string' ? quickConnectCharacter.tags.split(',').filter((tag: string) => tag.trim()) : quickConnectCharacter.tags) : [],
                            speechStyle: quickConnectCharacter.speechStyle || '',
                            catchphrases: quickConnectCharacter.catchphrases || [],
                            secrets: quickConnectCharacter.secrets || '',
                            motivations: quickConnectCharacter.motivations || '',
                            relationships: quickConnectCharacter.relationships || '',
                        };
                        
                        // 保存到tempStoryCharacter（用于sharedChat）
                        dispatch({ type: 'SET_TEMP_STORY_CHARACTER', payload: character });
                        dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: character.id });
                        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'sharedChat' });
                    }}
                />
            )}
            

            {/* CREATOR MODALS */}
            {showEraCreator && (
                <MobileEraConstructorModal 
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
                <MobileCharacterConstructorModal
                    scene={currentScene}
                    onSave={handleSaveCharacter}
                    onClose={() => setShowCharacterCreator(false)}
                />
            )}
            
            {showScenarioBuilder && (
                 <div 
                   className="absolute inset-0 z-50"
                   style={{ backgroundColor: 'var(--bg-primary, #000000)' }}
                 >
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
                    onOpenMail={() => {
                        const token = localStorage.getItem('auth_token');
                        const currentUserId = gameState.userProfile?.id ? parseInt(String(gameState.userProfile.id)) : 0;
                        if (!token || !currentUserId) {
                            showAlert('请先登录', '提示', 'warning');
                            return;
                        }
                        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'mailbox' });
                    }}
                />
            )}
        </div>
        </MobileErrorBoundary>
    );
};
