/**
 * 豆包（Doubao）适配器实现
 * 支持文本生成、图片生成、音频处理
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
} from '../types';
import { AIConfigManager } from '../config';

/**
 * 豆包适配器
 */
export class DoubaoAdapter extends BaseAdapter {
  private readonly defaultBaseUrl = 'https://ark.cn-beijing.volces.com/api/v3';

  constructor(apiKey?: string) {
    super(apiKey);
    this.baseUrl = this.defaultBaseUrl;
  }

  getProviderType(): AIProvider {
    return 'doubao';
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
    return false;
  }

  getSupportedModels(capability: 'text' | 'image' | 'audio' | 'video'): string[] {
    const models: Record<string, string[]> = {
      text: [
        'doubao-pro-4k',
        'doubao-lite-4k',
      ],
      image: [
        'doubao-image',
      ],
      audio: [
        'doubao-tts',
      ],
      video: [],
    };
    return models[capability] || [];
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('doubao', 'text');
    const url = `${this.baseUrl}/chat/completions`;

    const messages: Array<{ role: string; content: string }> = [];

    if (request.systemInstruction) {
      messages.push({
        role: 'system',
        content: request.systemInstruction,
      });
    }

    if (request.messages && request.messages.length > 0) {
      messages.push(...request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })));
    } else {
      messages.push({
        role: 'user',
        content: request.prompt,
      });
    }

    const requestBody = {
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
    };

    try {
      const response = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const content = response.choices?.[0]?.message?.content || '';
      const usage = response.usage ? {
        inputTokens: response.usage.prompt_tokens || 0,
        outputTokens: response.usage.completion_tokens || 0,
        totalTokens: response.usage.total_tokens || 0,
      } : undefined;

      return {
        content,
        provider: 'doubao',
        model,
        usage,
        finishReason: response.choices?.[0]?.finish_reason,
      };
    } catch (error) {
      throw new Error(`Doubao text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    // 实现类似OpenAI的流式生成
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('doubao', 'text');
    const url = `${this.baseUrl}/chat/completions`;

    const messages: Array<{ role: string; content: string }> = [];

    if (request.systemInstruction) {
      messages.push({ role: 'system', content: request.systemInstruction });
    }

    if (request.messages && request.messages.length > 0) {
      messages.push(...request.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })));
    } else {
      messages.push({ role: 'user', content: request.prompt });
    }

    const requestBody = {
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: true,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
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

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6);
          if (data === '[DONE]') {
            onChunk({ content: '', done: true });
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            const content = delta?.content || '';

            if (content) {
              onChunk({ content, done: false });
            }

            if (json.choices?.[0]?.finish_reason) {
              const usage = json.usage ? {
                inputTokens: json.usage.prompt_tokens || 0,
                outputTokens: json.usage.completion_tokens || 0,
                totalTokens: json.usage.total_tokens || 0,
              } : undefined;

              onChunk({ content: '', done: true, usage });
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      throw new Error(`Doubao stream generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('doubao', 'image');
    
    // 豆包图片生成API（需要根据实际API文档调整）
    // 注意：豆包API可能需要后端代理，因为可能存在CORS问题
    const url = `${this.baseUrl}/images/generations`;

    const width = request.width || 1024;
    const height = request.height || 1024;

    const requestBody = {
      model: model,
      prompt: request.prompt,
      negative_prompt: request.negativePrompt,
      width: width,
      height: height,
      n: request.numberOfImages || 1,
    };

    try {
      const response = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      // 解析响应（根据实际API响应格式调整）
      const images = (response.data || response.images || []).map((img: any) => ({
        url: img.url || img.image_url,
        base64: img.b64_json || img.base64,
      }));

      if (images.length === 0) {
        throw new Error('No images generated');
      }

      return {
        images,
        provider: 'doubao',
        model,
        usage: {
          imagesGenerated: images.length,
        },
      };
    } catch (error) {
      // 如果遇到CORS错误，提示使用后端代理
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Doubao image generation requires backend proxy due to CORS restrictions. ' +
          'Please use unified mode or configure a backend proxy.'
        );
      }
      throw new Error(`Doubao image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['text']);

    // TODO: 实现Doubao TTS
    throw new Error('Doubao TTS not implemented yet');
  }

  async speechToText(request: SpeechToTextRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['audioFile']);

    // TODO: 实现Doubao STT
    throw new Error('Doubao STT not implemented yet');
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    throw new Error('Doubao video generation not supported');
  }
}

