/**
 * AI服务类型定义
 * 支持双模式：统一接入模式和本地配置模式
 */

/**
 * AI提供商类型
 */
export type AIProvider = 'gemini' | 'openai' | 'qwen' | 'dashscope' | 'doubao';

/**
 * AI模式类型
 */
export type AIMode = 'unified' | 'local';

/**
 * 文本生成请求
 */
export interface TextGenerationRequest {
  provider?: AIProvider;  // 可选：指定提供商，不指定则使用用户配置
  model?: string;  // 可选：指定模型名称，不指定则使用默认模型
  prompt: string;  // 用户输入的文本
  systemInstruction?: string;  // 系统指令（可选）
  messages?: Array<{  // 可选：对话历史
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;  // 可选：0-1，默认0.7
  maxTokens?: number;  // 可选：最大输出Token数
  stream?: boolean;  // 可选：是否流式返回，默认false
}

/**
 * Token使用量
 */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

/**
 * 文本生成响应
 */
export interface TextGenerationResponse {
  content: string;  // 生成的文本内容
  provider: AIProvider;
  model: string;
  usage?: TokenUsage;
  finishReason?: string;
}

/**
 * 流式响应数据块
 */
export interface TextGenerationChunk {
  content: string;  // 增量内容
  done: boolean;  // 是否完成
  usage?: TokenUsage;  // 完成时的使用量
}

/**
 * 图片生成请求
 */
export interface ImageGenerationRequest {
  provider?: AIProvider;
  model?: string;
  prompt: string;  // 生成图片的提示词
  negativePrompt?: string;  // 负面提示词（可选）
  width?: number;  // 可选：图片宽度，默认1024
  height?: number;  // 可选：图片高度，默认1024
  aspectRatio?: string;  // 可选：宽高比
  numberOfImages?: number;  // 可选：生成图片数量，默认1
  style?: string;  // 可选：图片风格
}

/**
 * 生成的图片
 */
export interface GeneratedImage {
  url?: string;  // 图片URL
  base64?: string;  // Base64编码（可选）
}

/**
 * 图片生成响应
 */
export interface ImageGenerationResponse {
  images: GeneratedImage[];
  provider: AIProvider;
  model: string;
  usage?: {
    imagesGenerated: number;
  };
}

/**
 * 音频处理请求（文本转语音）
 */
export interface TextToSpeechRequest {
  provider?: AIProvider;
  model?: string;
  text: string;  // 要转换为语音的文本
  voice?: string;  // 可选：语音类型
  speed?: number;  // 可选：语速
  pitch?: number;  // 可选：音调
}

/**
 * 音频处理请求（语音转文本）
 */
export interface SpeechToTextRequest {
  provider?: AIProvider;
  model?: string;
  audioFile: File | Blob;  // 音频文件
  language?: string;  // 可选：语言
}

/**
 * 音频处理响应
 */
export interface AudioResponse {
  audioUrl?: string;  // 音频文件URL（TTS）
  audioBase64?: string;  // Base64编码（可选）
  text?: string;  // 识别出的文本（STT）
  duration?: number;  // 音频时长（秒）
  provider: AIProvider;
  model: string;
  confidence?: number;  // 置信度（STT）
}

/**
 * 视频生成请求
 */
export interface VideoGenerationRequest {
  provider?: AIProvider;
  model?: string;
  prompt: string;  // 生成视频的提示词
  duration?: number;  // 视频时长（秒）
  resolution?: string;  // 分辨率
}

/**
 * 视频生成响应
 */
export interface VideoGenerationResponse {
  videoUrl?: string;
  videoId?: string;  // 视频ID（异步生成时使用）
  status: 'completed' | 'processing';
  provider: AIProvider;
  model: string;
  duration?: number;
}

/**
 * 用户AI配置
 */
export interface UserAIConfig {
  userId?: number;
  mode: AIMode;  // 统一接入模式或本地配置模式
  textProvider?: AIProvider;  // 文本生成提供商
  textModel?: string;  // 文本生成模型名称
  imageProvider?: AIProvider;  // 图片生成提供商
  imageModel?: string;  // 图片生成模型名称
  audioProvider?: AIProvider;  // 音频处理提供商
  audioModel?: string;  // 音频处理模型名称
  videoProvider?: AIProvider;  // 视频生成提供商
  videoModel?: string;  // 视频生成模型名称
  enableFallback?: boolean;  // 是否启用降级
  // 本地配置模式的API Keys（存储在客户端）
  localApiKeys?: {
    gemini?: string;
    openai?: string;
    qwen?: string;
    doubao?: string;
  };
}

/**
 * 模型适配器接口
 */
export interface ModelAdapter {
  /**
   * 获取适配器类型（提供商名称）
   */
  getProviderType(): AIProvider;
  
  /**
   * 是否支持文本生成
   */
  supportsTextGeneration(): boolean;
  
  /**
   * 是否支持图片生成
   */
  supportsImageGeneration(): boolean;
  
  /**
   * 是否支持文本转语音
   */
  supportsTextToSpeech(): boolean;
  
  /**
   * 是否支持语音转文本
   */
  supportsSpeechToText(): boolean;
  
  /**
   * 是否支持视频生成
   */
  supportsVideoGeneration(): boolean;
  
  /**
   * 生成文本
   */
  generateText(request: TextGenerationRequest): Promise<TextGenerationResponse>;
  
  /**
   * 流式生成文本
   */
  generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void>;
  
  /**
   * 生成图片
   */
  generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
  
  /**
   * 文本转语音
   */
  textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse>;
  
  /**
   * 语音转文本
   */
  speechToText(request: SpeechToTextRequest): Promise<AudioResponse>;
  
  /**
   * 生成视频
   */
  generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse>;
  
  /**
   * 获取支持的模型列表
   */
  getSupportedModels(capability: 'text' | 'image' | 'audio' | 'video'): string[];
  
  /**
   * 检查API Key是否配置
   */
  isConfigured(): boolean;
}

/**
 * AI服务异常
 */
export class AIServiceException extends Error {
  constructor(
    message: string,
    public provider?: AIProvider,
    public model?: string,
    public errorCode: string = 'AI_SERVICE_ERROR'
  ) {
    super(message);
    this.name = 'AIServiceException';
  }
}

/**
 * 不支持的模型异常
 */
export class UnsupportedModelException extends AIServiceException {
  constructor(provider: AIProvider, model: string) {
    super(
      `Unsupported model: ${model} for provider: ${provider}`,
      provider,
      model,
      'UNSUPPORTED_MODEL'
    );
    this.name = 'UnsupportedModelException';
  }
}

/**
 * API Key未配置异常
 */
export class APIKeyNotConfiguredException extends AIServiceException {
  constructor(provider: AIProvider) {
    super(
      `API Key not configured for provider: ${provider}`,
      provider,
      undefined,
      'API_KEY_NOT_CONFIGURED'
    );
    this.name = 'APIKeyNotConfiguredException';
  }
}

