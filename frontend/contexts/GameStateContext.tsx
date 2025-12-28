/**
 * 游戏状态Context和Provider
 * 提供全局状态管理和便捷方法
 */

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
import { GameState } from '../types';
import { GameStateAction, GameStateContextType } from './types/gameState.types';
import { gameStateReducer } from '../reducers/gameStateReducer';
import { DEFAULT_GAME_STATE } from './constants/defaultState';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai/AIService';
import { AppSettings, WorldScene, Character, Message } from '../types';

// 创建Context
const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

/**
 * GameStateProvider Props
 */
interface GameStateProviderProps {
  children: React.ReactNode;
  initialState?: GameState;
}

/**
 * 游戏状态Provider组件
 */
export const GameStateProvider: React.FC<GameStateProviderProps> = ({
  children,
  initialState = DEFAULT_GAME_STATE
}) => {
  // 在初始化时检查是否有 token，如果有则直接设置为 entryPoint，避免闪烁
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
  const initialScreen = hasToken ? 'entryPoint' : initialState.currentScreen;
  const [state, dispatch] = useReducer(gameStateReducer, {
    ...initialState,
    currentScreen: initialScreen
  });
  const stateRef = useRef(state);

  // 保持ref同步
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 加载游戏数据
  const loadGameData = useCallback(async (): Promise<void> => {
    const loadedState = await storageService.loadState();
    // 检查是否有 token（即使 localStorage 中没有 userProfile，如果有 token 也应该显示 entryPoint）
    const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');
    
    if (loadedState) {
      const savedSettings = (loadedState.settings || {}) as Partial<AppSettings>;
      
      // 从 localStorage 加载 localApiKeys（如果存在），并同步到 settings
      const { AIConfigManager } = await import('../services/ai/config');
      const localApiKeys = AIConfigManager.getLocalApiKeys();
      
      const mergedSettings: AppSettings = {
        ...DEFAULT_GAME_STATE.settings,
        ...savedSettings,
        geminiConfig: {
          ...DEFAULT_GAME_STATE.settings.geminiConfig,
          ...savedSettings.geminiConfig,
          // 如果 localApiKeys 中有值，优先使用（因为这是最新的）
          apiKey: localApiKeys.gemini || savedSettings.geminiConfig?.apiKey || DEFAULT_GAME_STATE.settings.geminiConfig.apiKey
        },
        openaiConfig: {
          ...DEFAULT_GAME_STATE.settings.openaiConfig,
          ...savedSettings.openaiConfig,
          apiKey: localApiKeys.openai || savedSettings.openaiConfig?.apiKey || DEFAULT_GAME_STATE.settings.openaiConfig.apiKey
        },
        qwenConfig: {
          ...DEFAULT_GAME_STATE.settings.qwenConfig,
          ...savedSettings.qwenConfig,
          apiKey: localApiKeys.qwen || savedSettings.qwenConfig?.apiKey || DEFAULT_GAME_STATE.settings.qwenConfig.apiKey
        },
        doubaoConfig: {
          ...DEFAULT_GAME_STATE.settings.doubaoConfig,
          ...savedSettings.doubaoConfig,
          apiKey: localApiKeys.doubao || savedSettings.doubaoConfig?.apiKey || DEFAULT_GAME_STATE.settings.doubaoConfig.apiKey
        }
      };

      // 确定应该显示的页面
      let targetScreen: GameState['currentScreen'];
      if (hasToken || loadedState.userProfile) {
        // 如果有 token 或用户已登录，确保停留在 entryPoint
        targetScreen = (loadedState.currentScreen === 'profileSetup' || !loadedState.currentScreen) 
          ? 'entryPoint' 
          : loadedState.currentScreen;
      } else {
        // 如果没有 token 且没有用户信息，显示 profileSetup
        targetScreen = 'profileSetup';
      }

      dispatch({
        type: 'BATCH_UPDATE',
        payload: {
          ...loadedState,
          currentScreen: targetScreen,
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
        }
      });

      aiService.updateConfigFromAppSettings(mergedSettings);
    } else {
      // 即使没有保存的状态，如果有 token，也应该显示 entryPoint
      if (hasToken) {
        dispatch({ type: 'SET_CURRENT_SCREEN', payload: 'entryPoint' });
      }
      aiService.updateConfigFromAppSettings(DEFAULT_GAME_STATE.settings);
    }
  }, []);

  // 保存游戏状态（带防抖）
  const saveGameState = useCallback((stateToSave?: GameState) => {
    const state = stateToSave || stateRef.current;
    storageService.saveState({ ...state, lastLoginTime: Date.now() });
  }, []);

  // 自动保存（当状态变化时）
  useEffect(() => {
    const timer = setTimeout(() => {
      saveGameState();
    }, 1000); // 1秒防抖

    return () => clearTimeout(timer);
  }, [state, saveGameState]);

  // 便捷方法
  const setCurrentScreen = useCallback((screen: GameState['currentScreen']) => {
    dispatch({ type: 'SET_CURRENT_SCREEN', payload: screen });
  }, []);

  const setUserProfile = useCallback((profile: GameState['userProfile']) => {
    dispatch({ type: 'SET_USER_PROFILE', payload: profile });
  }, []);

  const setSelectedSceneId = useCallback((sceneId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SCENE_ID', payload: sceneId });
  }, []);

  const setSelectedCharacterId = useCallback((characterId: string | null) => {
    dispatch({ type: 'SET_SELECTED_CHARACTER_ID', payload: characterId });
  }, []);

  const setSelectedScenarioId = useCallback((scenarioId: string | null) => {
    dispatch({ type: 'SET_SELECTED_SCENARIO_ID', payload: scenarioId });
  }, []);

  // 场景相关方法
  const addUserWorldScene = useCallback((scene: WorldScene) => {
    dispatch({ type: 'ADD_USER_WORLD_SCENE', payload: scene });
  }, []);

  const updateUserWorldScene = useCallback((sceneId: string, updates: Partial<WorldScene>) => {
    dispatch({ type: 'UPDATE_USER_WORLD_SCENE', payload: { sceneId, updates } });
  }, []);

  const removeUserWorldScene = useCallback((sceneId: string) => {
    dispatch({ type: 'REMOVE_USER_WORLD_SCENE', payload: sceneId });
  }, []);

  // 角色相关方法
  const addCharacterToScene = useCallback((sceneId: string, character: Character) => {
    dispatch({ type: 'ADD_CHARACTER_TO_SCENE', payload: { sceneId, character } });
  }, []);

  const updateCharacterInScene = useCallback((sceneId: string, characterId: string, updates: Partial<Character>) => {
    dispatch({ type: 'UPDATE_CHARACTER_IN_SCENE', payload: { sceneId, characterId, updates } });
  }, []);

  const removeCharacterFromScene = useCallback((sceneId: string, characterId: string) => {
    dispatch({ type: 'REMOVE_CHARACTER_FROM_SCENE', payload: { sceneId, characterId } });
  }, []);

  // 对话相关方法
  const addMessage = useCallback((sceneId: string, message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { sceneId, message } });
  }, []);

  const clearHistory = useCallback((sceneId: string) => {
    dispatch({ type: 'CLEAR_HISTORY', payload: sceneId });
  }, []);

  // 设置相关方法
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    // 更新AI服务配置
    if (updates.geminiConfig || updates.textProvider || updates.imageProvider) {
      const newSettings = { ...state.settings, ...updates };
      aiService.updateConfigFromAppSettings(newSettings);
    }
  }, [state.settings]);

  // Context值
  const contextValue = useMemo<GameStateContextType>(() => ({
    state,
    dispatch,
    setCurrentScreen,
    setUserProfile,
    setSelectedSceneId,
    setSelectedCharacterId,
    setSelectedScenarioId,
    addUserWorldScene,
    updateUserWorldScene,
    removeUserWorldScene,
    addCharacterToScene,
    updateCharacterInScene,
    removeCharacterFromScene,
    addMessage,
    clearHistory,
    updateSettings
  }), [
    state,
    dispatch,
    setCurrentScreen,
    setUserProfile,
    setSelectedSceneId,
    setSelectedCharacterId,
    setSelectedScenarioId,
    addUserWorldScene,
    updateUserWorldScene,
    removeUserWorldScene,
    addCharacterToScene,
    updateCharacterInScene,
    removeCharacterFromScene,
    addMessage,
    clearHistory,
    updateSettings
  ]);

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

/**
 * 使用游戏状态Hook
 * 必须在GameStateProvider内部使用
 */
export const useGameState = (): GameStateContextType => {
  const context = useContext(GameStateContext);
  if (context === undefined) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};

// 导出loadGameData和saveGameState供外部使用
export { storageService };

