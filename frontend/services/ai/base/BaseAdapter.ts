/**
 * 基础适配器类
 * 提供适配器的通用实现和工具方法
 */

import {
  ModelAdapter,
  AIProvider,
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
  AIServiceException,
  UnsupportedModelException,
} from '../types';

/**
 * 基础适配器抽象类
 * 提供默认实现和通用方法
 */
export abstract class BaseAdapter implements ModelAdapter {
  protected apiKey?: string;
  protected baseUrl?: string;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  /**
   * 获取适配器类型（由子类实现）
   */
  abstract getProviderType(): AIProvider;

  /**
   * 检查API Key是否配置
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.trim() !== '';
  }

  /**
   * 设置API Key
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * 设置Base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * 检查是否支持文本生成（由子类实现）
   */
  abstract supportsTextGeneration(): boolean;

  /**
   * 检查是否支持图片生成（由子类实现）
   */
  abstract supportsImageGeneration(): boolean;

  /**
   * 检查是否支持文本转语音（由子类实现）
   */
  abstract supportsTextToSpeech(): boolean;

  /**
   * 检查是否支持语音转文本（由子类实现）
   */
  abstract supportsSpeechToText(): boolean;

  /**
   * 检查是否支持视频生成（由子类实现）
   */
  abstract supportsVideoGeneration(): boolean;

  /**
   * 生成文本（由子类实现）
   */
  abstract generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;

  /**
   * 流式生成文本（由子类实现）
   */
  abstract generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void>;

  /**
   * 生成图片（由子类实现）
   */
  abstract generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;

  /**
   * 文本转语音（由子类实现）
   */
  abstract textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse>;

  /**
   * 语音转文本（由子类实现）
   */
  abstract speechToText(request: SpeechToTextRequest): Promise<AudioResponse>;

  /**
   * 生成视频（由子类实现）
   */
  abstract generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;

  /**
   * 获取支持的模型列表（由子类实现）
   */
  abstract getSupportedModels(capability: 'text' | 'image' | 'audio' | 'video'): string[];

  /**
   * 验证请求参数
   */
  protected validateRequest(request: any, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!request[field]) {
        throw new AIServiceException(`Missing required field: ${field}`, this.getProviderType());
      }
    }
  }

  /**
   * 检查模型是否支持
   */
  protected checkModelSupport(model: string, capability: 'text' | 'image' | 'audio' | 'video'): void {
    const supportedModels = this.getSupportedModels(capability);
    if (supportedModels.length > 0 && !supportedModels.includes(model)) {
      throw new UnsupportedModelException(this.getProviderType(), model);
    }
  }

  /**
   * 检查API Key是否配置
   */
  protected ensureConfigured(): void {
    if (!this.isConfigured()) {
      throw new AIServiceException(
        `API Key not configured for provider: ${this.getProviderType()}`,
        this.getProviderType(),
        undefined,
        'API_KEY_NOT_CONFIGURED'
      );
    }
  }

  /**
   * 创建HTTP请求
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      // 不同provider的认证方式可能不同，由子类重写
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new AIServiceException(
        `HTTP ${response.status}: ${errorText}`,
        this.getProviderType(),
        undefined,
        `HTTP_${response.status}`
      );
    }

    return response.json();
  }

  /**
   * 创建流式请求（SSE）
   */
  protected async makeStreamRequest(
    url: string,
    options: RequestInit = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new AIServiceException(
        `HTTP ${response.status}: ${errorText}`,
        this.getProviderType(),
        undefined,
        `HTTP_${response.status}`
      );
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new AIServiceException('Failed to get response reader', this.getProviderType());
    }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          try {
            onChunk(data);
          } catch (error) {
            console.error('[BaseAdapter] Error processing chunk:', error);
          }
        }
      }
    }
  }
}


