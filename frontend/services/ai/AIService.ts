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

const API_BASE_URL = 'http://localhost:8081/api';

/**
 * 统一AI服务类
 */
export class AIService {
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
   */
  async generateCharacterFromPrompt(prompt: string, eraName: string): Promise<any> {
    const systemPrompt = `You are a creative writer. Create a complete character profile for a world/era named "${eraName}".
Output JSON only with these properties: 
- name, age (number), role, bio
- systemInstruction (detailed roleplay instructions)
- firstMessage (greeting)
- themeColor (hex), colorAccent (hex)
- mbti (e.g. INFJ)
- tags (array of strings, personality keywords)
- speechStyle (description of how they talk)
- catchphrases (array of strings, 2-3 common phrases)
- secrets (hidden depth/secret)
- motivations (current goal)

The content MUST be in Chinese.`;
    
    const userPrompt = `Character concept: "${prompt}".`;

    try {
      const responseText = await this.generateTextString(userPrompt, systemPrompt, { jsonMode: true });
      const details = JSON.parse(responseText);

      // 使用占位符图片以节省成本
      const avatarUrl = 'https://picsum.photos/seed/default_avatar/400/600';
      const backgroundUrl = 'https://picsum.photos/seed/default_bg/1080/1920';

      return {
        id: `custom_${Date.now()}`,
        voiceName: 'Kore',
        ...details,
        avatarUrl,
        backgroundUrl,
      };
    } catch (error) {
      throw new AIServiceException(
        `角色生成失败: ${error instanceof Error ? error.message : String(error)}`,
        'unknown'
      );
    }
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
   */
  async generateSceneDescription(history: Array<{role: string, text: string}>): Promise<string | null> {
    try {
      const prompt = "Summarize the current visual setting and atmosphere of the story based on the last few messages. Keep it concise (1-2 sentences), focusing on visual elements for image generation.";
      const context = history.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');
      const responseText = await this.generateTextString(`${prompt}\n\nSTORY CONTEXT:\n${context}`);
      return responseText || null;
    } catch (error) {
      console.error('[AIService] 生成场景描述失败:', error);
      return null;
    }
  }

  /**
   * 生成智慧回响（从对话历史中提取）
   */
  async generateWisdomEcho(history: Array<{role: string, text: string}>, characterName: string): Promise<string | null> {
    try {
      const prompt = `Analyze the conversation history. Extract a single, profound, and memorable quote (max 30 words) that represents the core wisdom or emotional comfort provided by ${characterName}. Output ONLY the quote.`;
      const context = history.map(m => `${m.role}: ${m.text}`).join('\n');
      const responseText = await this.generateTextString(`${prompt}\n\nCONVERSATION:\n${context}`);
      return responseText || null;
    } catch (error) {
      console.error('[AIService] 生成智慧回响失败:', error);
      return null;
    }
  }

  /**
   * 生成心情图片
   */
  async generateMoodImage(text: string, worldStyle?: string): Promise<string | null> {
    try {
      // 构建提示词
      let prompt = `A moody, atmospheric scene that captures the emotional essence of: "${text}". `;
      if (worldStyle) {
        prompt += `Style: ${worldStyle}. `;
      }
      prompt += `High quality, cinematic lighting, vibrant colors. Aspect Ratio: 16:9.`;

      const response = await this.generateImage({
        prompt,
        aspectRatio: '16:9',
      });

      if (response.images && response.images.length > 0) {
        return response.images[0].url || response.images[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error('[AIService] 生成心情图片失败:', error);
      return null;
    }
  }

  /**
   * 生成每日问候
   */
  async generateDailyGreeting(
    recentEntries: Array<{title: string, content: string, timestamp: number}>,
    userName?: string
  ): Promise<{greeting: string, question: string} | null> {
    try {
      let recentEntriesContext = '';
      if (recentEntries.length > 0) {
        recentEntriesContext = recentEntries.slice(-3).map((entry, index) => 
          `日记${index + 1}（${new Date(entry.timestamp).toLocaleDateString()}）：\n标题：${entry.title}\n内容：${entry.content.substring(0, 300)}${entry.content.length > 300 ? '...' : ''}`
        ).join('\n\n');
      } else {
        recentEntriesContext = '暂无日记记录';
      }

      const systemInstruction = `You are a gentle, philosophical AI companion in the "HeartSphere" world.
Your goal is to greet the user and ask a deep, thought-provoking question to help them start journaling.

Context:
- User Name: ${userName || '旅人'}
- Recent Journal Entries (if any): 
${recentEntriesContext}

Instructions:
1. Write a short, warm greeting (1 sentence). If they haven't written in a while, welcome them back gently.
2. Write a single, insightful question (prompt) based on their recent themes (e.g., if they were sad, ask about healing; if happy, ask about gratitude).
3. If no entries, ask a universal question about their current state or dreams.
4. Output strictly in JSON format: { "greeting": "...", "prompt": "..." }
5. Language: Chinese. Tone: Poetic, empathetic, calm.`;

      const prompt = '请生成问候和问题。';
      const responseText = await this.generateTextString(prompt, systemInstruction, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonStr);

      return {
        greeting: result.greeting || (recentEntries.length === 0 
          ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
          : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。'),
        question: result.prompt || result.question || (recentEntries.length === 0
          ? '今天有什么让你印象深刻的事吗？'
          : '今天想记录些什么新的想法呢？')
      };
    } catch (error) {
      console.error('[AIService] 生成每日问候失败:', error);
      // 返回默认问候
      return {
        greeting: recentEntries.length === 0 
          ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
          : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。',
        question: recentEntries.length === 0
          ? '今天有什么让你印象深刻的事吗？'
          : '今天想记录些什么新的想法呢？'
      };
    }
  }

  /**
   * 生成时间信件（Chronos Letter）
   */
  async generateChronosLetter(
    sender: {name: string, role: string, systemInstruction?: string},
    userProfile: {nickname: string},
    journalEntries: Array<{title: string}>
  ): Promise<{subject: string, content: string} | null> {
    try {
      const randomEntry = journalEntries.length > 0 ? journalEntries[Math.floor(Math.random() * journalEntries.length)] : null;
      const memoryContext = randomEntry ? `I remember you wrote about "${randomEntry.title}"...` : '';

      const prompt = `Write a warm, personal letter to ${userProfile.nickname}.
You haven't seen them in a while. 
Mention something specific about their journey or the "memory" provided below to show you care.
MEMORY CONTEXT: ${memoryContext}
Output JSON with "subject" and "content".`;

      const systemInstruction = `You are ${sender.name} (${sender.role}). ${sender.systemInstruction || ''}`;
      const responseText = await this.generateTextString(prompt, systemInstruction, { jsonMode: true });
      const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('[AIService] 生成时间信件失败:', error);
      return null;
    }
  }

  /**
   * 从提示词生成图片
   */
  async generateImageFromPrompt(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'): Promise<string | null> {
    try {
      const response = await this.generateImage({
        prompt,
        aspectRatio,
      });

      if (response.images && response.images.length > 0) {
        return response.images[0].url || response.images[0].base64 || null;
      }
      return null;
    } catch (error) {
      console.error('[AIService] 从提示词生成图片失败:', error);
      return null;
    }
  }

  /**
   * 生成语音（文本转语音）
   */
  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string | null> {
    try {
      const response = await this.textToSpeech({
        text,
        voice: voiceName,
      });

      if (response.audio) {
        return response.audio.base64 || response.audio.url || null;
      }
      return null;
    } catch (error) {
      console.error('[AIService] 生成语音失败:', error);
      return null;
    }
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
        provider: backendData.provider as AIProvider,
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
        provider: backendData.provider as AIProvider,
        model: backendData.model,
        usage: backendData.usage ? {
          imagesGenerated: backendData.usage.imagesGenerated,
        } : undefined,
      };
    } catch (error) {
      if (error instanceof AIServiceException) {
        throw error;
      }
      throw new AIServiceException(
        `图片生成失败: ${error instanceof Error ? error.message : String(error)}`
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
        provider: backendData.provider as AIProvider,
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
        provider: backendData.provider as AIProvider,
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
        provider: backendData.provider as AIProvider,
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
  async generateCharacterImage(character: {name: string, role: string, bio: string, themeColor: string}, worldStyle?: string): Promise<string | null> {
    try {
      const { constructCharacterAvatarPrompt } = await import('../../utils/promptConstructors');
      const prompt = constructCharacterAvatarPrompt(character.name, character.role, character.bio, character.themeColor, worldStyle);
      return await this.generateImageFromPrompt(prompt, '3:4');
    } catch (error) {
      console.error('[AIService] 生成角色图片失败:', error);
      return null;
    }
  }

  /**
   * 生成镜像洞察
   */
  async generateMirrorInsight(journalContent: string, pastEntries: string[]): Promise<string | null> {
    try {
      const prompt = `You are the "Mirror of Truth" (本我镜像). Analyze the user's journal entry and their past patterns (if any).
Your goal is to provide a sharp, psychological insight about their subconscious desires, fears, or hidden strengths.

Style Guidelines:
- Be objective but supportive.
- Be slightly mysterious, like a tarot reading or a Jungian analysis.
- Keep it under 50 words.
- Speak in Chinese.`;

      const context = `CURRENT ENTRY: ${journalContent}\n\nPAST ENTRIES CONTEXT:\n${pastEntries.join('\n')}`;
      const responseText = await this.generateTextString(`${prompt}\n\nCONTEXT:\n${context}`);
      return responseText || null;
    } catch (error) {
      console.error('[AIService] 生成镜像洞察失败:', error);
      return null;
    }
  }

  /**
   * 分析图片生成时代描述（仅支持 Gemini，因为它需要图片输入）
   * 注意：这个方法可能需要特殊处理，因为不是所有适配器都支持图片输入
   */
  async analyzeImageForEra(base64Image: string): Promise<{name: string, description: string} | null> {
    // 这个方法需要图片输入，目前只有 Gemini 支持，所以暂时返回 null
    // 如果需要，可以在 GeminiAdapter 中实现专门的图片分析功能
    console.warn('[AIService] analyzeImageForEra 暂未实现，需要图片输入支持');
    return null;
  }

  /**
   * 获取风格提示词后缀（辅助方法）
   */
}

// 单例实例
export const aiService = new AIService();

