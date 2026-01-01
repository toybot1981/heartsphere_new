/**
 * 统一AI服务
 * 支持双模式：统一接入模式和本地配置模式
 * 注意：当前版本仅实现本地配置模式，统一接入模式需要等待后端API
 */

import {
  TextGenerationRequest,
  TextGenerationResponse,
  TextGenerationChunk,
  ImageGenerationRequest,
  ImageGenerationResponse,
  TextToSpeechRequest,
  SpeechToTextRequest,
  AudioResponse,
  VideoGenerationRequest,
  VideoGenerationResponse,
  UserAIConfig,
  AIProvider,
  AIMode,
  AIServiceException,
} from './types';
import { AIConfigManager } from './config';
import { adapterManager } from './AdapterManager';
import { BusinessServiceManager } from './business/BusinessServiceManager';
import { AppSettings, DebugLog } from '../../types';
import { API_BASE_URL } from '../api/config';

/**
 * 统一AI服务类
 */
export class AIService {
  // 业务服务管理器
  private _businessServices?: BusinessServiceManager;

  /**
   * 获取业务服务管理器（延迟初始化）
   */
  get businessServices(): BusinessServiceManager {
    if (!this._businessServices) {
      this._businessServices = new BusinessServiceManager(this);
    }
    return this._businessServices;
  }
  /**
   * 生成文本
   */
  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const config = await AIConfigManager.getUserConfig();
    
    if (config.mode === 'unified') {
      // 统一接入模式：调用后端API（待实现）
      return this.generateTextUnified(request);
    } else {
      // 本地配置模式：直接调用适配器
      return this.generateTextLocal(request);
    }
  }

  /**
   * 流式生成文本
   */
  async generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    const config = await AIConfigManager.getUserConfig();
    
    if (config.mode === 'unified') {
      // 统一接入模式：调用后端API（待实现）
      return this.generateTextStreamUnified(request, onChunk);
    } else {
      // 本地配置模式：直接调用适配器
      return this.generateTextStreamLocal(request, onChunk);
    }
  }

  /**
   * 生成图片
   */
  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const config = await AIConfigManager.getUserConfig();
    
    if (config.mode === 'unified') {
      return this.generateImageUnified(request);
    } else {
      return this.generateImageLocal(request);
    }
  }

  /**
   * 文本转语音
   */
  async textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse> {
    const config = await AIConfigManager.getUserConfig();
    
    if (config.mode === 'unified') {
      return this.textToSpeechUnified(request);
    } else {
      return this.textToSpeechLocal(request);
    }
  }

  /**
   * 语音转文本
   */
  async speechToText(request: SpeechToTextRequest): Promise<AudioResponse> {
    const config = await AIConfigManager.getUserConfig();
    
    if (config.mode === 'unified') {
      return this.speechToTextUnified(request);
    } else {
      return this.speechToTextLocal(request);
    }
  }

  /**
   * 生成文本（简化版，返回文本字符串）
   * 用于需要同步文本生成的场景（如角色生成、场景生成等）
   */
  async generateTextString(
    prompt: string,
    systemInstruction?: string,
    options?: {
      jsonMode?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<string> {
    try {
      const request: TextGenerationRequest = {
        prompt,
        systemInstruction,
        temperature: options?.temperature,
        maxTokens: options?.maxTokens,
      };

      const response = await this.generateText(request);
      let text = response.content || '';

      // JSON模式：清理markdown代码块
      if (options?.jsonMode) {
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }

      return text;
    } catch (error) {
      throw new AIServiceException(
        `文本生成失败: ${error instanceof Error ? error.message : String(error)}`,
        'unknown'
      );
    }
  }

  /**
   * 生成角色（从提示词）
   * 统一的角色生成接口，支持所有模式和provider
   * @deprecated 使用 businessServices.character.generateCharacterFromPrompt 代替
   */
  async generateCharacterFromPrompt(prompt: string, eraName: string): Promise<any> {
    return this.businessServices.character.generateCharacterFromPrompt(prompt, eraName);
  }

  /**
   * 生成视频
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const config = await AIConfigManager.getUserConfig();
    
    if (config.mode === 'unified') {
      return this.generateVideoUnified(request);
    } else {
      return this.generateVideoLocal(request);
    }
  }

  /**
   * 生成场景描述（基于对话历史）
   * @deprecated 使用 businessServices.scene.generateSceneDescription 代替
   */
  async generateSceneDescription(history: Array<{role: string, text: string}>): Promise<string | null> {
    return this.businessServices.scene.generateSceneDescription(history);
  }

  /**
   * 生成智慧回响（从对话历史中提取）
   * @deprecated 使用 businessServices.dialogue.generateWisdomEcho 代替
   */
  async generateWisdomEcho(history: Array<{role: string, text: string}>, characterName: string): Promise<string | null> {
    return this.businessServices.dialogue.generateWisdomEcho(history, characterName);
  }

  /**
   * 生成心情图片
   * @deprecated 使用 businessServices.scene.generateMoodImage 代替
   */
  async generateMoodImage(text: string, worldStyle?: string): Promise<string | null> {
    return this.businessServices.scene.generateMoodImage(text, worldStyle);
  }

  /**
   * 生成每日问候
   * @deprecated 使用 businessServices.journal.generateDailyGreeting 代替
   */
  async generateDailyGreeting(
    recentEntries: Array<{title: string, content: string, timestamp: number}>,
    userName?: string
  ): Promise<{greeting: string, question: string} | null> {
    return this.businessServices.journal.generateDailyGreeting(recentEntries, userName);
  }


  /**
   * 生成时间信件（Chronos Letter）
   * @deprecated 使用 businessServices.letter.generateChronosLetter 代替
   */
  async generateChronosLetter(
    sender: {name: string, role: string, systemInstruction?: string},
    userProfile: {nickname: string},
    journalEntries: Array<{title: string}>
  ): Promise<{subject: string, content: string} | null> {
    return this.businessServices.letter.generateChronosLetter(sender, userProfile, journalEntries);
  }

  /**
   * 从提示词生成图片
   * @deprecated 使用 businessServices.media.generateImageFromPrompt 代替
   */
  async generateImageFromPrompt(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'): Promise<string | null> {
    return this.businessServices.media.generateImageFromPrompt(prompt, aspectRatio);
  }

  /**
   * 生成语音（文本转语音）
   * @deprecated 使用 businessServices.media.generateSpeech 代替
   */
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string | null> {
    return this.businessServices.media.generateSpeech(text, voiceName);
  }

  /**
   * 获取用户配置
   */
  async getUserConfig(): Promise<UserAIConfig> {
    return await AIConfigManager.getUserConfig();
  }

  /**
   * 更新用户配置
   */
  async updateUserConfig(config: Partial<UserAIConfig>): Promise<void> {
    const currentConfig = await AIConfigManager.getUserConfig();
    const newConfig = { ...currentConfig, ...config };
    await AIConfigManager.saveUserConfig(newConfig);
    
    // 如果是本地配置模式，重新初始化适配器
    if (newConfig.mode === 'local') {
      adapterManager.reinitialize();
    }
  }

  /**
   * 从 AppSettings 更新配置（兼容旧接口）
   */
  async updateConfigFromAppSettings(settings: AppSettings): Promise<void> {
    // 获取当前配置，保留 mode 字段（不覆盖用户的选择）
    const currentConfig = AIConfigManager.getUserConfigSync();
    
    // 将 AppSettings 转换为 UserAIConfig
    const userConfig: Partial<UserAIConfig> = {
      // 不设置 mode 字段，保留用户当前的选择（默认是 'unified'）
      textProvider: settings.textProvider,
      textModel: settings.geminiConfig?.modelName || settings.openaiConfig?.modelName || settings.qwenConfig?.modelName || settings.doubaoConfig?.modelName,
      imageProvider: settings.imageProvider,
      imageModel: settings.geminiConfig?.imageModel || settings.openaiConfig?.imageModel || settings.qwenConfig?.imageModel || settings.doubaoConfig?.imageModel,
      videoProvider: settings.videoProvider,
      videoModel: settings.geminiConfig?.videoModel || settings.openaiConfig?.videoModel || settings.qwenConfig?.videoModel || settings.doubaoConfig?.videoModel,
      audioProvider: settings.audioProvider,
      enableFallback: settings.enableFallback,
      localApiKeys: {
        gemini: settings.geminiConfig?.apiKey || undefined,
        openai: settings.openaiConfig?.apiKey || undefined,
        qwen: settings.qwenConfig?.apiKey || undefined,
        doubao: settings.doubaoConfig?.apiKey || undefined,
      },
    };
    
    // 如果当前配置是 'unified'，不要覆盖为 'local'
    if (currentConfig.mode === 'unified') {
      // 移除 mode 字段，保持当前配置的 mode（'unified'）
      delete userConfig.mode;
      console.log('[AIService] 当前模式为统一接入模式，保留不覆盖');
    }
    
    // 更新配置
    await this.updateUserConfig(userConfig);
    
    // 更新本地 API Keys
    if (userConfig.localApiKeys) {
      AIConfigManager.saveLocalApiKeys(userConfig.localApiKeys as any);
    }
  }

  // 日志回调
  private logCallback: ((log: DebugLog) => void) | null = null;

  /**
   * 设置日志回调
   */
  setLogCallback(callback: ((log: DebugLog) => void) | null): void {
    this.logCallback = callback;
    if (callback) {
      console.log('[AIService] 日志回调已设置');
    } else {
      console.log('[AIService] 日志回调已清除');
    }
  }

  // 会话管理
  private chatSessions: Map<string, any> = new Map();

  /**
   * 重置会话
   */
  resetSession(characterId: string): void {
    this.chatSessions.delete(characterId);
    console.log(`[AIService] 会话已重置: ${characterId}`);
  }

  // ========== 本地配置模式实现 ==========

  /**
   * 本地配置模式：生成文本
   */
  private async generateTextLocal(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const config = AIConfigManager.getUserConfigSync();
    adapterManager.initializeLocalAdapters();

    // 优先使用配置的provider（本地配置模式的核心：使用用户配置）
    const preferredProvider = config.textProvider || request.provider || 'gemini';
    const model = request.model || config.textModel;
    
    // 获取所有已配置的provider（只尝试本地配置了API key的provider）
    const apiKeys = AIConfigManager.getLocalApiKeys();
    const configuredProviders: AIProvider[] = (['gemini', 'openai', 'qwen', 'doubao'] as AIProvider[])
      .filter(provider => {
        const apiKey = apiKeys[provider];
        const adapter = adapterManager.getAdapter(provider);
        return apiKey && apiKey.trim() !== '' && adapter?.isConfigured() && adapter.supportsTextGeneration();
      });
    
    if (configuredProviders.length === 0) {
      throw new AIServiceException(
        '本地模式：没有配置任何provider的API key。请在设置中配置至少一个provider的API key。',
        preferredProvider
      );
    }
    
    // 构建尝试列表：优先使用配置的provider，然后是其他已配置的provider
    const providersToTry: AIProvider[] = [];
    if (configuredProviders.includes(preferredProvider)) {
      providersToTry.push(preferredProvider);
    }
    // 添加其他已配置的provider
    configuredProviders.forEach(provider => {
      if (provider !== preferredProvider) {
        providersToTry.push(provider);
      }
    });
    
    // 如果没有找到配置的provider，但请求指定了provider，也尝试（即使未配置，可能adapter有其他方式获取key）
    if (request.provider && !providersToTry.includes(request.provider)) {
      const adapter = adapterManager.getAdapter(request.provider);
      if (adapter?.isConfigured() && adapter.supportsTextGeneration()) {
        providersToTry.unshift(request.provider); // 插入到最前面
      }
    }

    console.log('[AIService] 本地模式（同步） - 配置的provider:', preferredProvider);
    console.log('[AIService] 本地模式（同步） - 已配置的providers:', configuredProviders);
    console.log('[AIService] 本地模式（同步） - 准备尝试providers:', providersToTry);

    // 尝试每个provider，直到成功
    let lastError: Error | null = null;
    for (const provider of providersToTry) {
      const adapter = adapterManager.getAdapter(provider);
      
      // 再次检查（防御性编程）
      if (!adapter || !adapter.isConfigured()) {
        console.warn(`[AIService] Provider ${provider} 未配置，跳过`);
        continue;
      }

      // 检查是否支持文本生成
      if (!adapter.supportsTextGeneration()) {
        console.warn(`[AIService] Provider ${provider} 不支持文本生成，跳过`);
        continue;
      }

      try {
        console.log(`[AIService] 本地模式（同步） - 尝试使用provider: ${provider}`);
        
        // 确定使用的model
        let providerModel: string | undefined;
        if (provider === preferredProvider) {
          // 配置的provider，使用配置的model或请求的model
          providerModel = model;
        } else {
          // 容错切换到其他已配置的provider时，清除原provider的model，使用新provider的默认模型
          providerModel = undefined; // 设为undefined，让adapter使用其默认模型
        }
        
        const requestForProvider: TextGenerationRequest = {
          ...request,
          provider,
          model: providerModel,
        };
        
        console.log(`[AIService] 本地模式（同步） - 使用provider: ${provider}, model: ${providerModel || '(使用adapter默认模型)'}`);
        
        const response = await adapter.generateText(requestForProvider);
        console.log(`[AIService] 本地模式（同步） - Provider ${provider} 调用成功`);
        return response;
      } catch (error) {
        console.error(`[AIService] 本地模式（同步） - Provider ${provider} 调用失败:`, error);
        lastError = error instanceof Error ? error : new Error(String(error));
        // 继续尝试下一个provider
        continue;
      }
    }

    // 所有provider都失败了
    throw new AIServiceException(
      `所有本地文本生成provider都失败。尝试过的providers: ${providersToTry.join(', ')}。最后错误: ${lastError?.message || '未知错误'}`,
      preferredProvider
    );
  }

  // 用于跟踪当前正在进行的流式请求，防止竞态条件
  private activeStreamRequestId: string | null = null;

  /**
   * 本地配置模式：流式生成文本
   */
  private async generateTextStreamLocal(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    const config = AIConfigManager.getUserConfigSync();
    adapterManager.initializeLocalAdapters();

    // 生成当前请求的唯一ID
    const requestId = `stream_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // 检查是否有正在进行的请求，如果有则取消它
    if (this.activeStreamRequestId !== null) {
      console.warn(`[AIService] 检测到并发流式请求，取消前一个请求: ${this.activeStreamRequestId}`);
      // 取消前一个请求
      if (this.activeStreamAbortController) {
        this.activeStreamAbortController.abort();
      }
      // 清理旧的请求标记
      this.activeStreamRequestId = null;
      this.activeStreamAbortController = null;
    }

    // 创建新的AbortController用于取消当前请求
    const abortController = new AbortController();
    this.activeStreamAbortController = abortController;
    
    // 设置当前请求ID
    this.activeStreamRequestId = requestId;
    console.log(`[AIService] 开始新的流式请求: ${requestId}`);

    try {
      // 创建一个包装的onChunk，确保只处理当前请求的响应
      let isRequestActive = true;
      const wrappedOnChunk = (chunk: TextGenerationChunk) => {
        // 检查请求是否被取消
        if (abortController.signal.aborted) {
          console.warn(`[AIService] 请求 ${requestId} 已被取消，忽略chunk`);
          return;
        }
        
        // 检查请求是否仍然有效（没有被新的请求替换）
        if (this.activeStreamRequestId === requestId && isRequestActive) {
          try {
            onChunk(chunk);
            // 如果完成，标记请求结束
            if (chunk.done) {
              isRequestActive = false;
            }
          } catch (error) {
            console.error(`[AIService] onChunk回调执行失败:`, error);
          }
        } else {
          console.warn(`[AIService] 收到过期的chunk，忽略。当前请求ID: ${this.activeStreamRequestId}, 此chunk的请求ID: ${requestId}`);
        }
      };

      // 优先使用配置的provider（本地配置模式的核心：使用用户配置）
      const preferredProvider = config.textProvider || request.provider || 'gemini';
      const model = request.model || config.textModel;
      
      // 获取所有已配置的provider（只尝试本地配置了API key的provider）
      const apiKeys = AIConfigManager.getLocalApiKeys();
      const configuredProviders: AIProvider[] = (['gemini', 'openai', 'qwen', 'doubao'] as AIProvider[])
        .filter(provider => {
          const apiKey = apiKeys[provider];
          const adapter = adapterManager.getAdapter(provider);
          return apiKey && apiKey.trim() !== '' && adapter?.isConfigured() && adapter.supportsTextGeneration();
        });
      
      if (configuredProviders.length === 0) {
        throw new AIServiceException(
          '本地模式：没有配置任何provider的API key。请在设置中配置至少一个provider的API key。',
          preferredProvider
        );
      }
      
      // 构建尝试列表：优先使用配置的provider，然后是其他已配置的provider
      const providersToTry: AIProvider[] = [];
      if (configuredProviders.includes(preferredProvider)) {
        providersToTry.push(preferredProvider);
      }
      // 添加其他已配置的provider
      configuredProviders.forEach(provider => {
        if (provider !== preferredProvider) {
          providersToTry.push(provider);
        }
      });
      
      // 如果没有找到配置的provider，但请求指定了provider，也尝试（即使未配置，可能adapter有其他方式获取key）
      if (request.provider && !providersToTry.includes(request.provider)) {
        const adapter = adapterManager.getAdapter(request.provider);
        if (adapter?.isConfigured() && adapter.supportsTextGeneration()) {
          providersToTry.unshift(request.provider); // 插入到最前面
        }
      }

      console.log(`[AIService] 本地模式 [${requestId}] - 配置的provider:`, preferredProvider);
      console.log(`[AIService] 本地模式 [${requestId}] - 已配置的providers:`, configuredProviders);
      console.log(`[AIService] 本地模式 [${requestId}] - 准备尝试providers:`, providersToTry);

      // 尝试每个provider，直到成功
      let lastError: Error | null = null;
      for (const provider of providersToTry) {
        // 检查请求是否被取消
        if (abortController.signal.aborted) {
          console.warn(`[AIService] 请求 ${requestId} 已被取消，停止尝试`);
          throw new AIServiceException('请求已被取消', preferredProvider);
        }
        
        // 再次检查请求是否仍然有效
        if (this.activeStreamRequestId !== requestId) {
          console.warn(`[AIService] 请求 ${requestId} 已被新的请求替换，停止尝试`);
          throw new AIServiceException('请求已被新的请求替换', preferredProvider);
        }

        const adapter = adapterManager.getAdapter(provider);
        
        // 再次检查（防御性编程）
        if (!adapter || !adapter.isConfigured()) {
          console.warn(`[AIService] Provider ${provider} 未配置，跳过`);
          continue;
        }

        // 检查是否支持文本生成
        if (!adapter.supportsTextGeneration()) {
          console.warn(`[AIService] Provider ${provider} 不支持文本生成，跳过`);
          continue;
        }

        try {
          console.log(`[AIService] 本地模式 [${requestId}] - 尝试使用provider: ${provider}`);
          
          // 为当前provider构建请求，确保使用对应provider的正确模型
          let providerModel: string | undefined;
          
          // 确定使用的model
          if (provider === preferredProvider) {
            // 配置的provider，使用配置的model或请求的model
            providerModel = model;
          } else {
            // 容错切换到其他已配置的provider时，清除原provider的model，使用新provider的默认模型
            providerModel = undefined; // 设为undefined，让adapter使用其默认模型
          }
          
          // 构建请求，明确使用对应provider的model（如果为undefined，adapter会使用默认模型）
          const requestForProvider: TextGenerationRequest = {
            ...request,
            provider,
            model: providerModel, // 明确设置，如果为undefined则adapter会使用默认模型
          };
          
          // 确保不传递错误的model给其他provider
          console.log(`[AIService] 本地模式 [${requestId}] - 使用provider: ${provider}, model: ${providerModel || '(使用adapter默认模型)'}`);
          
          await adapter.generateTextStream(requestForProvider, wrappedOnChunk);
          console.log(`[AIService] 本地模式 [${requestId}] - Provider ${provider} 调用成功`);
          
          // 只有在当前请求仍然有效时才返回
          if (this.activeStreamRequestId === requestId) {
            return; // 成功，退出循环
          } else {
            throw new AIServiceException('请求已被新的请求替换', provider);
          }
        } catch (error) {
          // 检查是否是请求被取消或替换导致的错误
          if (abortController.signal.aborted) {
            console.warn(`[AIService] 请求 ${requestId} 在处理过程中被取消`);
            throw new AIServiceException('请求已被取消', preferredProvider);
          }
          
          if (this.activeStreamRequestId !== requestId) {
            console.warn(`[AIService] 请求 ${requestId} 在处理过程中被新请求替换`);
            throw new AIServiceException('请求已被新的请求替换', preferredProvider);
          }
          
          console.error(`[AIService] 本地模式 [${requestId}] - Provider ${provider} 调用失败:`, error);
          lastError = error instanceof Error ? error : new Error(String(error));
          // 继续尝试下一个provider
          continue;
        }
      }

      // 所有provider都失败了
      throw new AIServiceException(
        `所有本地文本生成provider都失败。尝试过的providers: ${providersToTry.join(', ')}。最后错误: ${lastError?.message || '未知错误'}`,
        preferredProvider
      );
    } finally {
      // 清理：如果这是当前活动的请求，清除标记
      if (this.activeStreamRequestId === requestId) {
        this.activeStreamRequestId = null;
        this.activeStreamAbortController = null;
        console.log(`[AIService] 流式请求完成，清理: ${requestId}`);
      }
    }
  }

  /**
   * 本地配置模式：生成图片
   */
  private async generateImageLocal(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const config = AIConfigManager.getUserConfigSync();
    adapterManager.initializeLocalAdapters();

    const provider = request.provider || config.imageProvider || 'gemini';
    const model = request.model || config.imageModel;

    const adapter = adapterManager.getAdapter(provider);
    
    // 如果适配器不存在或未配置，且启用了容错，直接尝试容错
    if ((!adapter || !adapter.isConfigured()) && config.enableFallback) {
      return this.tryFallback(request, provider, 'image', 'generateImage');
    }

    // 如果适配器不存在或未配置，且未启用容错，抛出异常
    if (!adapter || !adapter.isConfigured()) {
      throw new AIServiceException(
        `Adapter not configured for provider: ${provider}`,
        provider
      );
    }

    try {
      const requestWithModel = model ? { ...request, model } : request;
      return await adapter.generateImage(requestWithModel);
    } catch (error) {
      if (config.enableFallback) {
        return this.tryFallback(request, provider, 'image', 'generateImage');
      }
      throw error;
    }
  }

  /**
   * 本地配置模式：文本转语音
   */
  private async textToSpeechLocal(request: TextToSpeechRequest): Promise<AudioResponse> {
    const config = AIConfigManager.getUserConfigSync();
    adapterManager.initializeLocalAdapters();

    const provider = request.provider || config.audioProvider || 'openai';
    const model = request.model || config.audioModel;

    const adapter = adapterManager.getAdapter(provider);
    if (!adapter || !adapter.isConfigured()) {
      throw new AIServiceException(
        `Adapter not configured for provider: ${provider}`,
        provider
      );
    }

    const requestWithModel = model ? { ...request, model } : request;
    return await adapter.textToSpeech(requestWithModel);
  }

  /**
   * 本地配置模式：语音转文本
   */
  private async speechToTextLocal(request: SpeechToTextRequest): Promise<AudioResponse> {
    const config = AIConfigManager.getUserConfigSync();
    adapterManager.initializeLocalAdapters();

    const provider = request.provider || config.audioProvider || 'openai';
    const model = request.model || config.audioModel;

    const adapter = adapterManager.getAdapter(provider);
    if (!adapter || !adapter.isConfigured()) {
      throw new AIServiceException(
        `Adapter not configured for provider: ${provider}`,
        provider
      );
    }

    const requestWithModel = model ? { ...request, model } : request;
    return await adapter.speechToText(requestWithModel);
  }

  /**
   * 本地配置模式：生成视频
   */
  private async generateVideoLocal(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const config = AIConfigManager.getUserConfigSync();
    adapterManager.initializeLocalAdapters();

    const provider = request.provider || config.videoProvider || 'gemini';
    const model = request.model || config.videoModel;

    const adapter = adapterManager.getAdapter(provider);
    if (!adapter || !adapter.isConfigured()) {
      throw new AIServiceException(
        `Adapter not configured for provider: ${provider}`,
        provider
      );
    }

    const requestWithModel = model ? { ...request, model } : request;
    return await adapter.generateVideo(requestWithModel);
  }

  // ========== 统一接入模式实现（待后端API） ==========

  /**
   * 将后端返回的提供商名称转换为前端格式
   * 处理 DASHSCOPE/qwen/QWEN -> dashscope 的转换
   */
  private normalizeProvider(provider: string): AIProvider {
    const normalized = (provider || '').toLowerCase();
    // 特殊处理：DASHSCOPE/qwen/QWEN 统一转换为 dashscope
    if (normalized === 'qwen' || normalized === 'dashscope') {
      return 'dashscope';
    }
    // 其他提供商保持不变
    return normalized as AIProvider;
  }

  /**
   * 统一接入模式：生成文本
   */
  private async generateTextUnified(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new AIServiceException('Authentication required for unified mode');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/text/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '请求失败' }));
        throw new AIServiceException(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const apiResponse = await response.json();
      if (apiResponse.code !== 200) {
        throw new AIServiceException(apiResponse.message || '文本生成失败');
      }

      // 转换后端响应格式到前端格式
      const backendData = apiResponse.data;
      
      return {
        content: backendData.content,
        provider: this.normalizeProvider(backendData.provider || ''),
        model: backendData.model,
        usage: backendData.usage ? {
          inputTokens: backendData.usage.inputTokens,
          outputTokens: backendData.usage.outputTokens,
          totalTokens: backendData.usage.totalTokens,
        } : undefined,
        finishReason: backendData.finishReason,
      };
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new AIServiceException(
        `文本生成失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 统一接入模式：流式生成文本
   */
  private async generateTextStreamUnified(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[AIService] 统一接入模式需要认证token');
      throw new AIServiceException('Authentication required for unified mode');
    }

    const requestBody = { ...request, stream: true };
    console.log('[AIService] 统一接入模式 - 开始流式文本生成请求', {
      url: `${API_BASE_URL}/ai/text/generate/stream`,
      provider: request.provider,
      model: request.model,
      hasPrompt: !!request.prompt,
      hasMessages: !!request.messages,
      messagesCount: request.messages?.length || 0,
      hasSystemInstruction: !!request.systemInstruction,
      temperature: request.temperature,
      maxTokens: request.maxTokens,
      stream: true,
    });

    try {
      console.log('[AIService] 统一接入模式 - 准备发送fetch请求', {
        url: `${API_BASE_URL}/ai/text/generate/stream`,
        method: 'POST',
        hasToken: !!token,
        requestBodyKeys: Object.keys(requestBody),
      });
      
      const response = await fetch(`${API_BASE_URL}/ai/text/generate/stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('[AIService] 统一接入模式 - 收到响应', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (!response.ok) {
        let errorData: any = { message: '请求失败' };
        try {
          const text = await response.text();
          console.error('[AIService] 响应错误 - 状态码:', response.status, '响应文本:', text);
          try {
            errorData = JSON.parse(text);
          } catch {
            errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` };
          }
        } catch (e) {
          console.error('[AIService] 解析错误响应失败:', e);
        }
        throw new AIServiceException(
          errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      // 使用EventSource或ReadableStream处理SSE
      console.log('[AIService] 统一接入模式 - 检查响应body', {
        hasBody: !!response.body,
        bodyType: response.body?.constructor?.name,
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        console.error('[AIService] 统一接入模式 - 无法获取响应body reader');
        throw new AIServiceException('无法读取流式响应');
      }

      console.log('[AIService] 统一接入模式 - 开始读取流式响应', {
        readerType: reader.constructor?.name,
      });
      let buffer = '';
      let finalUsage: import('./types').TokenUsage | undefined;
      let chunkCount = 0;
      let readCount = 0;

      while (true) {
        readCount++;
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[AIService] 流式响应读取完成 - 总读取次数:', readCount, '总chunks:', chunkCount, '剩余buffer长度:', buffer.length);
          if (buffer.trim()) {
            console.warn('[AIService] 流式响应结束时仍有未处理的数据:', buffer.substring(0, 200));
          }
          break;
        }

        const decoded = decoder.decode(value, { stream: true });
        if (readCount <= 3 || readCount % 10 === 0) {
          console.log(`[AIService] 读取原始数据 #${readCount}`, {
            length: decoded.length,
            preview: decoded.substring(0, 100).replace(/\n/g, '\\n'),
          });
        }
        
        buffer += decoded;
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留最后一个不完整的行

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue; // 跳过空行
          
          // 处理SSE格式：data: {...} 或 data:{...}（可能有或没有空格）
          if (trimmedLine.startsWith('data:')) {
            try {
              // 提取data:后面的内容（跳过"data:"，可能有空格）
              let jsonStr = trimmedLine.substring(5).trim(); // 跳过"data:"，去除前后空格
              
              // 如果JSON字符串被引号包裹，需要去除引号并处理转义
              if (jsonStr.startsWith('"') && jsonStr.endsWith('"')) {
                // 去除外层引号
                jsonStr = jsonStr.slice(1, -1);
                // 处理转义的字符：\" -> ", \\ -> \
                jsonStr = jsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
              }
              
              // 统一接入模式详细日志
              if (chunkCount < 5 || chunkCount % 10 === 0) {
                console.log('[AIService] 统一接入模式 - 解析SSE行', {
                  chunkIndex: chunkCount + 1,
                  originalLineLength: trimmedLine.length,
                  originalLinePreview: trimmedLine.substring(0, 150),
                  jsonStrLength: jsonStr.length,
                  jsonStrPreview: jsonStr.substring(0, 150),
                });
              }
              
              const data = JSON.parse(jsonStr);
              
              // 统一接入模式详细日志
              if (chunkCount < 5 || chunkCount % 10 === 0) {
                console.log(`[AIService] 统一接入模式 - 解析SSE数据 #${chunkCount + 1}`, {
                  hasChoices: !!(data.choices && Array.isArray(data.choices)),
                  choicesLength: data.choices?.length || 0,
                  hasContent: !!data.content,
                  hasDone: !!data.done,
                  hasFinishReason: !!(data.choices?.[0]?.finish_reason),
                  finishReason: data.choices?.[0]?.finish_reason,
                  hasUsage: !!data.usage,
                  rawDataPreview: JSON.stringify(data).substring(0, 200),
                });
              }
              
              if (data.error) {
                console.error('[AIService] 收到错误响应:', data.error);
                throw new AIServiceException(data.error);
              }

              // 处理 OpenAI 兼容格式：choices[0].delta.content
              // 或内部格式：content 字段
              let content = '';
              let isDone = false;
              let usage: any = null;
              
              if (data.choices && Array.isArray(data.choices) && data.choices.length > 0) {
                // OpenAI 兼容格式
                const choice = data.choices[0];
                if (choice.delta && choice.delta.content) {
                  content = choice.delta.content;
                  if (chunkCount < 5 || chunkCount % 10 === 0) {
                    console.log(`[AIService] 统一接入模式 - 从choices[0].delta.content提取内容`, {
                      contentLength: content.length,
                      contentPreview: content.substring(0, 50),
                    });
                  }
                }
                if (choice.finish_reason && choice.finish_reason !== null && choice.finish_reason !== 'null') {
                  isDone = true;
                  console.log('[AIService] 统一接入模式 - 检测到完成信号', {
                    finishReason: choice.finish_reason,
                  });
                }
                if (data.usage) {
                  usage = data.usage;
                }
              } else if (data.content !== undefined) {
                // 内部格式
                content = data.content || '';
                isDone = data.done === true;
                if (data.usage) {
                  usage = data.usage;
                }
                if (chunkCount < 5 || chunkCount % 10 === 0) {
                  console.log(`[AIService] 统一接入模式 - 从content字段提取内容`, {
                    contentLength: content.length,
                    contentPreview: content.substring(0, 50),
                    isDone: isDone,
                  });
                }
              } else if (data.done === true) {
                // 完成信号
                isDone = true;
                if (data.usage) {
                  usage = data.usage;
                }
                console.log('[AIService] 统一接入模式 - 收到done=true完成信号');
              }

              if (isDone) {
                console.log('[AIService] 统一接入模式 - 收到完成信号', {
                  hasUsage: !!usage,
                  totalChunks: chunkCount,
                  usage: usage,
                });
                if (usage) {
                  finalUsage = {
                    inputTokens: usage.prompt_tokens || usage.inputTokens || 0,
                    outputTokens: usage.completion_tokens || usage.outputTokens || 0,
                    totalTokens: usage.total_tokens || usage.totalTokens || 0,
                  };
                  console.log('[AIService] 统一接入模式 - Token使用量', finalUsage);
                }
                onChunk({
                  content: '',
                  done: true,
                  usage: finalUsage,
                });
                console.log('[AIService] 统一接入模式 - 流式响应处理完成');
                return;
              } else if (content) {
                chunkCount++;
                if (chunkCount <= 5 || chunkCount % 10 === 0) {
                  console.log(`[AIService] 统一接入模式 - 收到chunk #${chunkCount}`, {
                    contentLength: content.length,
                    contentPreview: content.substring(0, 50),
                    totalChunks: chunkCount,
                  });
                }
                onChunk({
                  content: content,
                  done: false,
                });
              } else {
                // 没有内容但也不是完成信号，可能是空chunk
                if (chunkCount < 5) {
                  console.log(`[AIService] 统一接入模式 - 收到空chunk`, {
                    dataKeys: Object.keys(data),
                    rawData: JSON.stringify(data).substring(0, 200),
                  });
                }
              }
            } catch (e) {
              console.warn('[AIService] 解析SSE数据失败:', e, '原始行:', trimmedLine.substring(0, 100));
            }
          } else if (trimmedLine === '[DONE]') {
            console.log('[AIService] 收到[DONE]信号');
            // OpenAI格式的结束信号，可以忽略，因为已经有done=true的处理
          } else {
            // 记录非data行（可能是其他SSE事件）
            console.log('[AIService] 收到非data SSE行:', trimmedLine.substring(0, 100));
          }
        }
      }
    } catch (error) {
      console.error('[AIService] 流式文本生成异常:', error);
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new AIServiceException(
        `流式文本生成失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 统一接入模式：生成图片
   */
  private async generateImageUnified(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new AIServiceException('Authentication required for unified mode');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/image/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '请求失败' }));
        throw new AIServiceException(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const apiResponse = await response.json();
      if (apiResponse.code !== 200) {
        throw new AIServiceException(apiResponse.message || '图片生成失败');
      }

      // 转换后端响应格式到前端格式
      const backendData = apiResponse.data;
      return {
        images: backendData.images.map((img: any) => ({
          url: img.url,
          base64: img.base64,
        })),
        provider: this.normalizeProvider(backendData.provider || ''),
        model: backendData.model,
        usage: backendData.usage ? {
          imagesGenerated: backendData.usage.imagesGenerated,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      
      // 检查是否是连接错误
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('Failed to fetch') || 
          errorMessage.includes('ERR_CONNECTION_REFUSED') ||
          errorMessage.includes('NetworkError')) {
        throw new AIServiceException(
          '无法连接到后端服务，请确保后端服务已启动（端口 8081）。如果后端运行在不同端口，请检查配置。'
        );
      }
      
      throw new AIServiceException(
        `图片生成失败: ${errorMessage}`
      );
    }
  }

  /**
   * 统一接入模式：文本转语音
   */
  private async textToSpeechUnified(request: TextToSpeechRequest): Promise<AudioResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new AIServiceException('Authentication required for unified mode');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/audio/tts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '请求失败' }));
        throw new AIServiceException(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const apiResponse = await response.json();
      if (apiResponse.code !== 200) {
        throw new AIServiceException(apiResponse.message || '文本转语音失败');
      }

      const backendData = apiResponse.data;
      return {
        audioUrl: backendData.audioUrl,
        audioBase64: backendData.audioBase64,
        duration: backendData.duration,
        provider: this.normalizeProvider(backendData.provider || ''),
        model: backendData.model,
      };
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new AIServiceException(
        `文本转语音失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 统一接入模式：语音转文本
   */
  private async speechToTextUnified(request: SpeechToTextRequest): Promise<AudioResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new AIServiceException('Authentication required for unified mode');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/audio/stt`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '请求失败' }));
        throw new AIServiceException(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const apiResponse = await response.json();
      if (apiResponse.code !== 200) {
        throw new AIServiceException(apiResponse.message || '语音转文本失败');
      }

      const backendData = apiResponse.data;
      return {
        audioUrl: backendData.audioUrl,
        audioBase64: backendData.audioBase64,
        duration: backendData.duration,
        provider: this.normalizeProvider(backendData.provider || ''),
        model: backendData.model,
      };
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new AIServiceException(
        `语音转文本失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 统一接入模式：生成视频
   */
  private async generateVideoUnified(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new AIServiceException('Authentication required for unified mode');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ai/video/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '请求失败' }));
        throw new AIServiceException(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const apiResponse = await response.json();
      if (apiResponse.code !== 200) {
        throw new AIServiceException(apiResponse.message || '视频生成失败');
      }

      const backendData = apiResponse.data;
      return {
        videoUrl: backendData.videoUrl,
        videoId: backendData.videoId,
        status: backendData.status,
        provider: this.normalizeProvider(backendData.provider || ''),
        model: backendData.model,
        duration: backendData.duration,
      };
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new AIServiceException(
        `视频生成失败: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // ========== 辅助方法 ==========

  /**
   * 尝试降级到其他provider
   */
  private async tryFallback<T extends TextGenerationRequest | ImageGenerationRequest>(
    request: T,
    failedProvider: AIProvider,
    capability: 'text' | 'image',
    method: 'generateText' | 'generateImage'
  ): Promise<any> {
    console.log(`[AIService] 尝试容错降级，失败的provider: ${failedProvider}, 能力: ${capability}`);
    
    const availableProviders = adapterManager.getAvailableProviders(capability);
    console.log(`[AIService] 可用的providers:`, availableProviders);
    
    const fallbackProviders = availableProviders.filter(p => p !== failedProvider);
    console.log(`[AIService] 容错providers:`, fallbackProviders);

    if (fallbackProviders.length === 0) {
      throw new AIServiceException(
        `No fallback providers available for ${capability} generation. Failed provider: ${failedProvider}`,
        failedProvider
      );
    }

    for (const provider of fallbackProviders) {
      try {
        console.log(`[AIService] 尝试使用容错provider: ${provider}`);
        const adapter = adapterManager.getAdapter(provider);
        if (!adapter || !adapter.isConfigured()) {
          console.warn(`[AIService] Provider ${provider} 未配置，跳过`);
          continue;
        }

        if (method === 'generateText') {
          const result = await adapter.generateText(request as TextGenerationRequest);
          console.log(`[AIService] 容错成功，使用provider: ${provider}`);
          return result;
        } else if (method === 'generateImage') {
          const result = await adapter.generateImage(request as ImageGenerationRequest);
          console.log(`[AIService] 容错成功，使用provider: ${provider}`);
          return result;
        }
      } catch (error) {
        console.warn(`[AIService] 容错provider ${provider} 也失败:`, error);
        continue;
      }
    }

    throw new AIServiceException(
      `All fallback providers failed for ${capability} generation. Original provider: ${failedProvider}`,
      failedProvider
    );
  }

  /**
   * 根据标题、场景、简介、标签和角色生成剧本节点流程
   */
  async generateScriptWithCharacters(params: {
    title: string;
    sceneName: string;
    sceneDescription?: string;
    description?: string;
    tags?: string;
    characters: Array<{
      id: string;
      name: string;
      role?: string;
      bio?: string;
    }>;
  }): Promise<{ nodes: Record<string, any>; startNodeId: string }> {
    try {
      // 构建角色信息字符串
      let characterInfo = '';
      if (params.characters && params.characters.length > 0) {
        characterInfo = '\n\n参与角色信息：\n';
        params.characters.forEach(char => {
          characterInfo += `- ${char.name}`;
          if (char.role) characterInfo += `（${char.role}）`;
          if (char.bio) characterInfo += `：${char.bio}`;
          characterInfo += '\n';
        });
        characterInfo += '\n故事应主要围绕这些角色展开，确保他们的性格、背景和关系在故事中得到体现。';
      }

      // 构建标签信息
      const tagsInfo = params.tags ? `\n标签：${params.tags}` : '';

      // 构建场景信息
      const sceneInfo = params.sceneDescription 
        ? `\n场景背景：${params.sceneDescription}`
        : '';

      const userPrompt = `请根据以下信息创建一个互动视觉小说剧本的节点流程结构：

剧本标题：${params.title}
${sceneInfo}
场景名称：${params.sceneName}
${params.description ? `剧本简介：${params.description}` : ''}
${tagsInfo}
${characterInfo}

请生成一个包含至少4-6个节点的分支剧情结构。每个节点应包含：
- id: 节点唯一标识符（如 "start", "node_1", "node_2" 等）
- title: 节点标题（简短描述）
- prompt: 场景描述和剧情推进内容（要详细，包含对话和动作，使用中文）
- options: 选项数组，每个选项包含 id, text（选项文本）, nextNodeId（指向的下一个节点ID）

要求：
1. 第一个节点的id必须是"start"
2. 每个节点应该有2-3个选项分支
3. 剧情要有逻辑性和连贯性
4. 内容必须使用中文
5. 确保选项能够形成合理的分支路径
6. 故事要围绕参与角色展开，体现他们的性格特点

请直接返回JSON格式，不要包含其他文本说明。JSON格式：
{
  "startNodeId": "start",
  "nodes": {
    "start": {
      "id": "start",
      "title": "...",
      "prompt": "...",
      "options": [
        {
          "id": "opt_1",
          "text": "...",
          "nextNodeId": "node_1"
        }
      ]
    },
    "node_1": { ... }
  }
}`;

      const systemPrompt = `You are a creative director for an interactive visual novel game.
Generate a branching scenario structure in JSON format based on the provided information.
The content MUST be in Chinese.`;

      const responseText = await this.generateTextString(userPrompt, systemPrompt, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const scenarioData = JSON.parse(jsonStr);

      // 验证并返回节点数据
      if (!scenarioData.nodes || typeof scenarioData.nodes !== 'object') {
        throw new Error('生成的剧本节点格式无效');
      }

      return {
        nodes: scenarioData.nodes,
        startNodeId: scenarioData.startNodeId || 'start'
      };
    } catch (error) {
      console.error('[AIService] 生成剧本失败:', error);
      throw new AIServiceException(
        `生成剧本失败: ${error instanceof Error ? error.message : String(error)}`,
        'unknown'
      );
    }
  }

  /**
   * 从提示词生成场景剧本（简化版）
   */
  async generateScenarioFromPrompt(prompt: string): Promise<any> {
    try {
      const systemPrompt = `You are a creative director for an interactive visual novel game.
Based on the user's idea, generate a branching scenario structure in JSON format.
JSON Structure: { "title": "...", "description": "...", "startNodeId": "node_1", "nodes": { "node_1": { "id": "node_1", "title": "...", "prompt": "...", "options": [...] } } }
Create at least 3-4 nodes with choices. The content MUST be in Chinese.`;

      const responseText = await this.generateTextString(prompt, systemPrompt, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const scenarioData = JSON.parse(jsonStr);

      return {
        id: `scenario_${Date.now()}`,
        sceneId: '',
        author: 'AI Architect',
        ...scenarioData
      };
    } catch (error) {
      console.error('[AIService] 生成场景剧本失败:', error);
      throw new AIServiceException(
        `生成场景剧本失败: ${error instanceof Error ? error.message : String(error)}`,
        'unknown'
      );
    }
  }

  /**
   * 生成主线故事角色
   */
  async generateMainStory(
    eraName: string,
    eraDescription: string,
    characters: Array<{name: string, role: string, bio: string}>,
    optionalPrompt?: string
  ): Promise<any> {
    try {
      const charactersInfo = characters.map(c => `- ${c.name} (${c.role}): ${c.bio || '无简介'}`).join('\n');
      
      const userPrompt = optionalPrompt 
        ? `场景: "${eraName}"\n场景描述: ${eraDescription}\n\n预设角色:\n${charactersInfo}\n\n额外要求: ${optionalPrompt}\n\n请为这个场景生成一个完整的主线剧情序章。`
        : `场景: "${eraName}"\n场景描述: ${eraDescription}\n\n预设角色:\n${charactersInfo}\n\n请为这个场景生成一个完整的主线剧情序章。`;

      const systemPrompt = `You are a creative narrative director for an interactive story game. Create a main story prologue (主线剧情序章) for a scene/era.

The prologue should:
- Hook the player with an immersive opening scene
- Set the atmosphere and tone
- Introduce a key event or choice point
- Be engaging and draw the player into the story

Output JSON only with these properties:
- name: Story title (e.g., "未完成的春日合奏", "霓虹下的忒修斯")
- role: "叙事者" or "剧情向导"
- bio: Brief story description (2-3 sentences)
- firstMessage: Opening message (序幕) - should be immersive, set the scene, include an event or hook. Format: 【序幕：标题】\\n\\n[详细描述]\\n\\n[突发事件或选择提示]
- themeColor: Tailwind color class (e.g., "indigo-500", "cyan-500")
- colorAccent: Hex color (e.g., "#6366f1", "#06b6d4")
- age: Number (narrator age, usually 20-30)
- voiceName: Voice name (e.g., "Fenrir", "Charon")
- tags: Comma-separated tags (e.g., "Narrator,Story,Adventure")
- speechStyle: Description of narrative style (e.g., "紧张，快节奏，冷硬派" or "温柔，诗意，充满希望")
- motivations: What drives the story forward

The content MUST be in Chinese. The story should be engaging, with clear character involvement and meaningful choices.`;

      const responseText = await this.generateTextString(userPrompt, systemPrompt, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const details = JSON.parse(jsonStr);

      return {
        name: details.name || `${eraName}的主线剧情`,
        role: details.role || '叙事者',
        bio: details.bio || '',
        firstMessage: details.firstMessage || '',
        themeColor: details.themeColor || 'indigo-500',
        colorAccent: details.colorAccent || '#6366f1',
        age: details.age || 25,
        voiceName: details.voiceName || 'Fenrir',
        tags: details.tags || 'Narrator,Story',
        speechStyle: details.speechStyle || '',
        motivations: details.motivations || ''
      };
    } catch (error) {
      console.error('[AIService] 生成主线故事失败:', error);
      throw new AIServiceException(
        `生成主线故事失败: ${error instanceof Error ? error.message : String(error)}`,
        'unknown'
      );
    }
  }

  /**
   * 生成角色图片
   */
  /**
   * 生成角色图片
   * @deprecated 使用 businessServices.character.generateCharacterImage 代替
   */
  async generateCharacterImage(character: {name: string, role: string, bio: string, themeColor: string}, worldStyle?: string): Promise<string | null> {
    return this.businessServices.character.generateCharacterImage(character, worldStyle);
  }

  /**
   * 生成镜像洞察
   * @deprecated 使用 businessServices.journal.generateMirrorInsight 代替
   */
  async generateMirrorInsight(journalContent: string, pastEntries: string[]): Promise<string | null> {
    return this.businessServices.journal.generateMirrorInsight(journalContent, pastEntries);
  }

  /**
   * 分析图片生成时代描述（仅支持 Gemini，因为它需要图片输入）
   * 注意：这个方法可能需要特殊处理，因为不是所有适配器都支持图片输入
   */
  /**
   * 分析图片生成时代信息
   * @deprecated 使用 businessServices.media.analyzeImageForEra 代替
   */
  async analyzeImageForEra(base64Image: string): Promise<{name: string, description: string} | null> {
    return this.businessServices.media.analyzeImageForEra(base64Image);
  }


  /**
   * 生成用户头像
   * @deprecated 使用 businessServices.media.generateUserAvatar 代替
   */
  async generateUserAvatar(nickname: string, worldStyle?: string): Promise<string | null> {
    return this.businessServices.media.generateUserAvatar(nickname, worldStyle);
  }

  /**
   * 生成视频（从提示词）
   * @deprecated 使用 generateVideo 代替
   */
  async generateVideoFromPrompt(prompt: string): Promise<string | null> {
    try {
      const response = await this.generateVideo({
        prompt,
        aspectRatio: '16:9',
      });
      if (response.videos && response.videos.length > 0) {
        return response.videos[0].url || response.videos[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error('[AIService] 生成视频失败:', error);
      return null;
    }
  }
}

// 单例实例
export const aiService = new AIService();

