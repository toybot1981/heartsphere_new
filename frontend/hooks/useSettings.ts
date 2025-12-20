/**
 * 设置相关业务Hook
 * 封装应用设置相关的状态操作和业务逻辑
 */

import { useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { AppSettings } from '../types';
import { geminiService } from '../services/gemini';

export const useSettings = () => {
  const { state, dispatch } = useGameState();

  // 获取当前设置
  const settings = state.settings;

  // 更新设置
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: updates });
    
    // 如果更新了gemini相关配置，同步更新geminiService
    if (updates.geminiConfig || updates.textProvider || updates.imageProvider) {
      const newSettings = { ...settings, ...updates };
      geminiService.updateConfig(newSettings);
    }
  }, [dispatch, settings]);

  // 重置设置
  const resetSettings = useCallback(() => {
    // 这里可以设置默认值
    const defaultSettings: AppSettings = {
      autoGenerateAvatars: false,
      autoGenerateStoryScenes: false,
      autoGenerateJournalImages: false,
      debugMode: false,
      showNoteSync: false,
      dialogueStyle: 'mobile-chat',
      textProvider: 'gemini',
      imageProvider: 'gemini',
      videoProvider: 'gemini',
      audioProvider: 'gemini',
      enableFallback: true,
      geminiConfig: {
        apiKey: '',
        modelName: 'gemini-2.5-flash',
        imageModel: 'gemini-2.5-flash-image',
        videoModel: 'veo-3.1-fast-generate-preview'
      },
      openaiConfig: {
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        modelName: 'gpt-4o',
        imageModel: 'dall-e-3'
      },
      qwenConfig: {
        apiKey: '',
        baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        modelName: 'qwen-max',
        imageModel: 'qwen-image-plus',
        videoModel: 'wanx-video'
      },
      doubaoConfig: {
        apiKey: '',
        baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',
        modelName: 'ep-...',
        imageModel: 'doubao-image-v1',
        videoModel: 'doubao-video-v1'
      }
    };
    
    dispatch({ type: 'SET_SETTINGS', payload: defaultSettings });
    geminiService.updateConfig(defaultSettings);
  }, [dispatch]);

  return {
    // 数据
    settings,
    
    // 方法
    updateSettings,
    resetSettings
  };
};

