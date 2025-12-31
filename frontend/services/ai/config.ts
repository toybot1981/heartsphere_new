/**
 * AI服务配置管理
 * 支持双模式：统一接入模式和本地配置模式
 */

import { AIMode, AIProvider, UserAIConfig } from './types';
import { getApiUrl } from '../api/config';

const CONFIG_STORAGE_KEY = 'ai_service_config';
const API_KEYS_STORAGE_KEY = 'ai_api_keys'; // 本地配置模式的API Keys

/**
 * 默认配置
 * 注意：默认AI接入模式为"统一接入模式"（unified）
 * - unified: 使用后端统一管理的API配置
 * - local: 使用本地配置的API Keys
 */
const DEFAULT_CONFIG: UserAIConfig = {
  mode: 'unified', // 默认使用统一接入模式（统一接入模式）
  textProvider: 'gemini',
  textModel: 'gemini-2.0-flash-exp',
  imageProvider: 'gemini',
  imageModel: 'imagen-3.0-generate-001',
  enableFallback: true,
};

/**
 * 系统默认模型配置
 */
const DEFAULT_MODELS: Record<AIProvider, Record<string, string>> = {
  gemini: {
    text: 'gemini-2.0-flash-exp',
    image: 'imagen-3.0-generate-001',
    audio: 'gemini-2.0-flash-exp',
    video: 'veo-2',
  },
  openai: {
    text: 'gpt-4',
    image: 'dall-e-3',
    audio: 'tts-1',
    video: 'video-generation',
  },
  qwen: {
    text: 'qwen-max',
    image: 'wanx-v1',
    audio: 'paraformer-zh',
    video: 'video-generation',
  },
  doubao: {
    text: 'doubao-pro-4k',
    image: 'doubao-image',
    audio: 'doubao-tts',
    video: 'doubao-video',
  },
};

/**
 * AI配置管理器
 */
export class AIConfigManager {
  /**
   * 获取用户配置
   */
  static async getUserConfig(): Promise<UserAIConfig> {
    const config = this.getUserConfigSync();
    
    // 如果是统一接入模式，尝试从后端获取配置
    if (config.mode === 'unified') {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const response = await fetch(getApiUrl('/ai/config'), {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok) {
            const apiResponse = await response.json();
            if (apiResponse.code === 200 && apiResponse.data) {
              // 合并后端配置和本地配置
              return { ...DEFAULT_CONFIG, ...config, ...apiResponse.data };
            }
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // 如果是连接错误，提供更详细的提示
        if (errorMessage.includes('Failed to fetch') || 
            errorMessage.includes('ERR_CONNECTION_REFUSED') ||
            errorMessage.includes('NetworkError')) {
          console.warn('[AIConfigManager] 无法连接到后端服务，使用本地配置。请确保后端服务已启动（端口 8081）');
        } else {
          console.warn('[AIConfigManager] Failed to fetch config from backend, using local config:', error);
        }
      }
    }
    
    return config;
  }

  /**
   * 同步获取用户配置（从localStorage）
   * 如果没有保存的配置，默认使用统一接入模式（unified）
   */
  static getUserConfigSync(): UserAIConfig {
    try {
      const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored) as UserAIConfig;
        // 合并默认配置和用户保存的配置（用户配置优先）
        // 但如果用户没有明确保存过mode，使用默认的'unified'
        const mergedConfig = { 
          ...DEFAULT_CONFIG, 
          ...config,
          // 如果用户保存的配置中没有mode字段，使用默认的'unified'
          mode: config.mode || DEFAULT_CONFIG.mode
        };
        console.log('[AIConfigManager] 从localStorage加载配置, mode:', mergedConfig.mode);
        return mergedConfig;
      } else {
        // 没有保存的配置，使用默认配置（默认模式为 'unified'）
        console.log('[AIConfigManager] localStorage中没有配置，使用默认配置, mode:', DEFAULT_CONFIG.mode, '(统一接入模式)');
      }
    } catch (error) {
      console.error('[AIConfigManager] 加载配置失败，使用默认配置:', error);
    }
    // 返回默认配置（默认模式为 'unified'）
    return { ...DEFAULT_CONFIG };
  }

  /**
   * 保存用户配置
   */
  static async saveUserConfig(config: UserAIConfig): Promise<void> {
    // 如果是统一接入模式，同步到后端
    if (config.mode === 'unified') {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // 不保存API Keys到后端
          const { localApiKeys, ...configToSave } = config;
          
          const response = await fetch(getApiUrl('/ai/config'), {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(configToSave),
          });
          
          if (!response.ok) {
            console.warn('[AIConfigManager] Failed to save config to backend');
          }
        }
      } catch (error) {
        console.warn('[AIConfigManager] Failed to save config to backend:', error);
      }
    }
    
    // 同时保存到本地
    try {
      // 不保存API Keys到配置中
      const { localApiKeys, ...configToSave } = config;
      console.log('[AIConfigManager] 保存配置到localStorage, mode:', configToSave.mode);
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
      console.log('[AIConfigManager] 配置保存成功');
    } catch (error) {
      console.error('[AIConfigManager] 保存配置失败:', error);
    }
  }

  /**
   * 获取本地API Keys（本地配置模式）
   */
  static getLocalApiKeys(): Record<AIProvider, string | undefined> {
    try {
      const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[AIConfigManager] Failed to load API keys:', error);
    }
    return {
      gemini: undefined,
      openai: undefined,
      qwen: undefined,
      doubao: undefined,
    };
  }

  /**
   * 保存本地API Keys（本地配置模式）
   */
  static saveLocalApiKeys(apiKeys: Record<AIProvider, string | undefined>): void {
    try {
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(apiKeys));
    } catch (error) {
      console.error('[AIConfigManager] Failed to save API keys:', error);
    }
  }

  /**
   * 获取指定提供商的API Key（本地配置模式）
   */
  static getApiKey(provider: AIProvider): string | undefined {
    const apiKeys = this.getLocalApiKeys();
    return apiKeys[provider];
  }

  /**
   * 设置指定提供商的API Key（本地配置模式）
   */
  static setApiKey(provider: AIProvider, apiKey: string | undefined): void {
    const apiKeys = this.getLocalApiKeys();
    apiKeys[provider] = apiKey;
    this.saveLocalApiKeys(apiKeys);
  }

  /**
   * 获取默认模型
   */
  static getDefaultModel(provider: AIProvider, capability: 'text' | 'image' | 'audio' | 'video'): string {
    return DEFAULT_MODELS[provider]?.[capability] || '';
  }

  /**
   * 检查本地配置模式是否已配置API Key
   */
  static isLocalModeConfigured(): boolean {
    const config = this.getUserConfigSync();
    if (config.mode !== 'local') {
      return true; // 统一接入模式不需要本地配置
    }

    const apiKeys = this.getLocalApiKeys();
    // 检查至少有一个provider配置了API Key
    return Object.values(apiKeys).some(key => key && key.trim() !== '');
  }

  /**
   * 清除所有配置
   */
  static clearConfig(): void {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    localStorage.removeItem(API_KEYS_STORAGE_KEY);
  }
}

