/**
 * 适配器管理器
 * 负责管理所有模型适配器的创建和获取
 */

import {
  ModelAdapter,
  AIProvider,
} from './types';
import {
  GeminiAdapter,
  OpenAIAdapter,
  QwenAdapter,
  DoubaoAdapter,
} from './adapters';
import { AIConfigManager } from './config';

/**
 * 适配器管理器
 */
export class AdapterManager {
  private adapters: Map<AIProvider, ModelAdapter> = new Map();
  private initialized = false;

  /**
   * 初始化适配器（本地配置模式）
   */
  initializeLocalAdapters(): void {
    if (this.initialized) {
      return;
    }

    const apiKeys = AIConfigManager.getLocalApiKeys();

    // 创建适配器实例
    if (apiKeys.gemini) {
      this.adapters.set('gemini', new GeminiAdapter(apiKeys.gemini));
    }
    if (apiKeys.openai) {
      this.adapters.set('openai', new OpenAIAdapter(apiKeys.openai));
    }
    if (apiKeys.qwen) {
      this.adapters.set('qwen', new QwenAdapter(apiKeys.qwen));
    }
    if (apiKeys.doubao) {
      this.adapters.set('doubao', new DoubaoAdapter(apiKeys.doubao));
    }

    this.initialized = true;
  }

  /**
   * 获取适配器
   */
  getAdapter(provider: AIProvider): ModelAdapter | null {
    return this.adapters.get(provider) || null;
  }

  /**
   * 设置适配器（用于动态更新API Key）
   */
  setAdapter(provider: AIProvider, adapter: ModelAdapter): void {
    this.adapters.set(provider, adapter);
  }

  /**
   * 更新适配器的API Key
   */
  updateAdapterApiKey(provider: AIProvider, apiKey: string | undefined): void {
    const adapter = this.adapters.get(provider);
    if (adapter) {
      if (apiKey) {
        adapter.setApiKey(apiKey);
      } else {
        // 移除适配器
        this.adapters.delete(provider);
      }
    } else if (apiKey) {
      // 创建新适配器
      let newAdapter: ModelAdapter;
      switch (provider) {
        case 'gemini':
          newAdapter = new GeminiAdapter(apiKey);
          break;
        case 'openai':
          newAdapter = new OpenAIAdapter(apiKey);
          break;
        case 'qwen':
          newAdapter = new QwenAdapter(apiKey);
          break;
        case 'doubao':
          newAdapter = new DoubaoAdapter(apiKey);
          break;
        default:
          return;
      }
      this.adapters.set(provider, newAdapter);
    }
  }

  /**
   * 获取所有可用的提供商
   */
  getAvailableProviders(capability: 'text' | 'image' | 'audio' | 'video'): AIProvider[] {
    const providers: AIProvider[] = [];
    
    for (const [provider, adapter] of this.adapters.entries()) {
      let supports = false;
      switch (capability) {
        case 'text':
          supports = adapter.supportsTextGeneration();
          break;
        case 'image':
          supports = adapter.supportsImageGeneration();
          break;
        case 'audio':
          supports = adapter.supportsTextToSpeech() || adapter.supportsSpeechToText();
          break;
        case 'video':
          supports = adapter.supportsVideoGeneration();
          break;
      }
      
      if (supports && adapter.isConfigured()) {
        providers.push(provider);
      }
    }
    
    return providers;
  }

  /**
   * 清除所有适配器
   */
  clear(): void {
    this.adapters.clear();
    this.initialized = false;
  }

  /**
   * 重新初始化（用于配置更新后）
   */
  reinitialize(): void {
    this.clear();
    this.initializeLocalAdapters();
  }
}

// 单例实例
export const adapterManager = new AdapterManager();


