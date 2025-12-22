/**
 * Gemini适配器实现
 * 支持文本生成、图片生成、音频处理、视频生成
 */

import { BaseAdapter } from '../base/BaseAdapter';
import {
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
  TokenUsage,
} from '../types';
import { AIConfigManager } from '../config';

/**
 * Gemini适配器
 */
export class GeminiAdapter extends BaseAdapter {
  private readonly defaultBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';

  constructor(apiKey?: string) {
    super(apiKey);
    this.baseUrl = this.defaultBaseUrl;
  }

  getProviderType(): AIProvider {
    return 'gemini';
  }

  supportsTextGeneration(): boolean {
    return true;
  }

  supportsImageGeneration(): boolean {
    return true;
  }

  supportsTextToSpeech(): boolean {
    return true;
  }

  supportsSpeechToText(): boolean {
    return true;
  }

  supportsVideoGeneration(): boolean {
    return true;
  }

  getSupportedModels(capability: 'text' | 'image' | 'audio' | 'video'): string[] {
    const models: Record<string, string[]> = {
      text: [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-pro',
      ],
      image: [
        'imagen-3.0-generate-001',
        'imagen-2',
      ],
      audio: [
        'gemini-2.0-flash-exp',
      ],
      video: [
        'veo-2',
      ],
    };
    return models[capability] || [];
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('gemini', 'text');
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    // 构建请求体
    const requestBody: any = {
      contents: [],
    };

    // 添加系统指令
    if (request.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: request.systemInstruction }],
      };
    }

    // 添加对话历史或当前提示
    if (request.messages && request.messages.length > 0) {
      requestBody.contents = request.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
    } else {
      requestBody.contents = [{
        role: 'user',
        parts: [{ text: request.prompt }],
      }];
    }

    // 添加生成配置
    requestBody.generationConfig = {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 2048,
    };

    try {
      const response = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // 解析响应
      const content = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = response.usageMetadata ? {
        inputTokens: response.usageMetadata.promptTokenCount || 0,
        outputTokens: response.usageMetadata.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata.totalTokenCount || 0,
      } : undefined;

      return {
        content,
        provider: 'gemini',
        model,
        usage,
        finishReason: response.candidates?.[0]?.finishReason,
      };
    } catch (error) {
      throw new Error(`Gemini text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('gemini', 'text');
    const url = `${this.baseUrl}/models/${model}:streamGenerateContent?key=${this.apiKey}`;

    // 构建请求体（与generateText相同）
    const requestBody: any = {
      contents: [],
    };

    if (request.systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: request.systemInstruction }],
      };
    }

    if (request.messages && request.messages.length > 0) {
      requestBody.contents = request.messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
    } else {
      requestBody.contents = [{
        role: 'user',
        parts: [{ text: request.prompt }],
      }];
    }

    requestBody.generationConfig = {
      temperature: request.temperature ?? 0.7,
      maxOutputTokens: request.maxTokens ?? 2048,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            const data = JSON.parse(line);
            const chunkText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            
            if (chunkText) {
              fullContent += chunkText;
              onChunk({
                content: chunkText,
                done: false,
              });
            }

            // 检查是否完成
            if (data.candidates?.[0]?.finishReason) {
              const usage = data.usageMetadata ? {
                inputTokens: data.usageMetadata.promptTokenCount || 0,
                outputTokens: data.usageMetadata.candidatesTokenCount || 0,
                totalTokens: data.usageMetadata.totalTokenCount || 0,
              } : undefined;

              onChunk({
                content: '',
                done: true,
                usage,
              });
            }
          } catch (e) {
            // 忽略解析错误，继续处理下一行
          }
        }
      }
    } catch (error) {
      throw new Error(`Gemini stream generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('gemini', 'image');
    
    // Gemini 使用 generateContent API 生成图片
    const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`;

    // 计算宽高比
    const width = request.width || 1024;
    const height = request.height || 1024;
    let aspectRatio = '1:1';
    if (width > height) {
      aspectRatio = `${Math.round(width / height)}:1`;
    } else if (height > width) {
      aspectRatio = `1:${Math.round(height / width)}`;
    }

    const requestBody = {
      contents: [{
        parts: [{
          text: request.prompt,
        }],
      }],
      generationConfig: {
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    };

    try {
      const response = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const images: Array<{ url?: string; base64?: string }> = [];
      
      // 解析响应中的图片数据
      const candidates = response.candidates || [];
      for (const candidate of candidates) {
        const parts = candidate.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData) {
            // Gemini 返回 base64 数据
            const base64 = part.inlineData.data;
            const mimeType = part.inlineData.mimeType || 'image/png';
            const dataUrl = `data:${mimeType};base64,${base64}`;
            
            images.push({
              base64: dataUrl,
            });
          }
        }
      }

      // 如果请求多张图片，需要多次调用（Gemini API 一次只能生成一张）
      const numberOfImages = request.numberOfImages || 1;
      if (numberOfImages > 1 && images.length < numberOfImages) {
        // 生成剩余的图片
        for (let i = images.length; i < numberOfImages; i++) {
          try {
            const additionalResponse = await this.makeRequest<any>(url, {
              method: 'POST',
              body: JSON.stringify(requestBody),
            });
            
            const additionalCandidates = additionalResponse.candidates || [];
            for (const candidate of additionalCandidates) {
              const parts = candidate.content?.parts || [];
              for (const part of parts) {
                if (part.inlineData) {
                  const base64 = part.inlineData.data;
                  const mimeType = part.inlineData.mimeType || 'image/png';
                  const dataUrl = `data:${mimeType};base64,${base64}`;
                  images.push({ base64: dataUrl });
                  break;
                }
              }
            }
          } catch (error) {
            console.warn(`[GeminiAdapter] Failed to generate additional image ${i + 1}:`, error);
          }
        }
      }

      return {
        images: images.slice(0, numberOfImages),
        provider: 'gemini',
        model,
        usage: {
          imagesGenerated: images.length,
        },
      };
    } catch (error) {
      throw new Error(`Gemini image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['text']);

    // TODO: 实现Gemini TTS
    throw new Error('Gemini TTS not implemented yet');
  }

  async speechToText(request: SpeechToTextRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['audioFile']);

    // TODO: 实现Gemini STT
    throw new Error('Gemini STT not implemented yet');
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    // TODO: 实现Gemini视频生成
    throw new Error('Gemini video generation not implemented yet');
  }
}

