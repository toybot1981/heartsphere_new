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
import { geminiService } from '../services/gemini';
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
  const [state, dispatch] = useReducer(gameStateReducer, initialState);
  const stateRef = useRef(state);

  // 保持ref同步
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // 加载游戏数据
  const loadGameData = useCallback(async (): Promise<void> => {
    const loadedState = await storageService.loadState();
    if (loadedState) {
      const savedSettings = (loadedState.settings || {}) as Partial<AppSettings>;
      const mergedSettings: AppSettings = {
        ...DEFAULT_GAME_STATE.settings,
        ...savedSettings,
        geminiConfig: {
          ...DEFAULT_GAME_STATE.settings.geminiConfig,
          ...savedSettings.geminiConfig
        },
        openaiConfig: {
          ...DEFAULT_GAME_STATE.settings.openaiConfig,
          ...savedSettings.openaiConfig
        },
        qwenConfig: {
          ...DEFAULT_GAME_STATE.settings.qwenConfig,
          ...savedSettings.qwenConfig
        },
        doubaoConfig: {
          ...DEFAULT_GAME_STATE.settings.doubaoConfig,
          ...savedSettings.doubaoConfig
        }
      };

      dispatch({
        type: 'BATCH_UPDATE',
        payload: {
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
        }
      });

      geminiService.updateConfig(mergedSettings);
    } else {
      geminiService.updateConfig(DEFAULT_GAME_STATE.settings);
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
    // 更新gemini配置
    if (updates.geminiConfig || updates.textProvider || updates.imageProvider) {
      const newSettings = { ...state.settings, ...updates };
      geminiService.updateConfig(newSettings);
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

