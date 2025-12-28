import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, AppSettings } from '../types';
import { storageService } from '../services/storage';
import { aiService } from '../services/ai/AIService';

/**
 * 游戏状态管理Hook
 * 封装了gameState的状态管理和持久化逻辑
 */
export const useGameState = (defaultState: GameState) => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [isLoaded, setIsLoaded] = useState(false);
  const gameStateRef = useRef(gameState);

  // 保持ref同步
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  // 加载游戏数据
  const loadGameData = useCallback(async (): Promise<void> => {
    setIsLoaded(false);
    const loadedState = await storageService.loadState();
    if (loadedState) {
      const savedSettings = (loadedState.settings || {}) as Partial<AppSettings>;
      
      const mergedSettings: AppSettings = {
        ...defaultState.settings,
        ...savedSettings,
        geminiConfig: { ...defaultState.settings.geminiConfig, ...(savedSettings.geminiConfig || {}) },
        openaiConfig: { ...defaultState.settings.openaiConfig, ...(savedSettings.openaiConfig || {}) },
        qwenConfig: { ...defaultState.settings.qwenConfig, ...(savedSettings.qwenConfig || {}) },
        doubaoConfig: { ...defaultState.settings.doubaoConfig, ...(savedSettings.doubaoConfig || {}) },
        autoGenerateAvatars: savedSettings.autoGenerateAvatars ?? defaultState.settings.autoGenerateAvatars,
        autoGenerateStoryScenes: savedSettings.autoGenerateStoryScenes ?? defaultState.settings.autoGenerateStoryScenes,
        autoGenerateJournalImages: savedSettings.autoGenerateJournalImages ?? defaultState.settings.autoGenerateJournalImages,
        dialogueStyle: savedSettings.dialogueStyle || defaultState.settings.dialogueStyle,
        textProvider: savedSettings.textProvider || defaultState.settings.textProvider,
        imageProvider: savedSettings.imageProvider || defaultState.settings.imageProvider,
        videoProvider: savedSettings.videoProvider || defaultState.settings.videoProvider,
        audioProvider: savedSettings.audioProvider || defaultState.settings.audioProvider,
        enableFallback: savedSettings.enableFallback ?? defaultState.settings.enableFallback,
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
      
      aiService.updateConfigFromAppSettings(mergedSettings);
    } else {
      aiService.updateConfigFromAppSettings(defaultState.settings);
    }
    setIsLoaded(true);
  }, [defaultState]);

  // 更新游戏状态（带防抖保存）
  const updateGameState = useCallback((updates: Partial<GameState> | ((prev: GameState) => GameState)) => {
    setGameState(prev => {
      const newState = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      return newState;
    });
  }, []);

  // 保存游戏状态
  const saveGameState = useCallback((state?: GameState) => {
    const stateToSave = state || gameStateRef.current;
    storageService.saveState({ ...stateToSave, lastLoginTime: Date.now() });
  }, []);

  return {
    gameState,
    setGameState: updateGameState,
    isLoaded,
    setIsLoaded,
    loadGameData,
    saveGameState,
    gameStateRef,
  };
};





