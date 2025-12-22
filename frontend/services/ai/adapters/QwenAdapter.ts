/**
 * 通义千问（Qwen）适配器实现
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
 * 通义千问适配器
 */
export class QwenAdapter extends BaseAdapter {
  private readonly defaultBaseUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

  constructor(apiKey?: string) {
    super(apiKey);
    this.baseUrl = this.defaultBaseUrl;
  }

  getProviderType(): AIProvider {
    return 'qwen';
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
        'qwen-max',
        'qwen-plus',
        'qwen-turbo',
      ],
      image: [
        'wanx-v1',
      ],
      audio: [
        'paraformer-zh',
      ],
      video: [],
    };
    return models[capability] || [];
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('qwen', 'text');
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
        provider: 'qwen',
        model,
        usage,
        finishReason: response.choices?.[0]?.finish_reason,
      };
    } catch (error) {
      throw new Error(`Qwen text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    // 实现类似OpenAI的流式生成
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('qwen', 'text');
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
      throw new Error(`Qwen stream generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('qwen', 'image');
    
    // Qwen 使用异步任务模式
    const submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
    
    // 计算尺寸
    const width = request.width || 1024;
    const height = request.height || 1024;
    let size = `${width}*${height}`;
    
    // 根据宽高比调整标准尺寸
    if (request.aspectRatio) {
      const ratio = request.aspectRatio;
      if (ratio === '16:9') size = '1280*720';
      else if (ratio === '9:16') size = '720*1280';
      else if (ratio === '3:4') size = '1024*1024';
      else if (ratio === '4:3') size = '1024*1024';
      else if (ratio === '1:1') size = '1024*1024';
    }

    try {
      // 1. 提交生成任务
      const submitResponse = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-DashScope-Async': 'enable',
        },
        body: JSON.stringify({
          model: model,
          input: {
            prompt: request.prompt,
            negative_prompt: request.negativePrompt,
          },
          parameters: {
            size: size,
            n: request.numberOfImages || 1,
          },
        }),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        throw new Error(`Qwen submit failed (${submitResponse.status}): ${errorText}`);
      }

      const submitData = await submitResponse.json();
      
      if (submitData.code && submitData.code !== '200') {
        throw new Error(`Qwen submit failed: ${submitData.message || submitData.code}`);
      }

      const taskId = submitData.output?.task_id;
      if (!taskId) {
        throw new Error('Qwen submit failed: No task_id returned');
      }

      // 2. 轮询任务状态
      const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
      const maxAttempts = 30; // 最多轮询30次（约60秒）
      let attempts = 0;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒

        const checkResponse = await fetch(taskUrl, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        });

        if (!checkResponse.ok) {
          throw new Error(`Qwen task check failed (${checkResponse.status})`);
        }

        const checkData = await checkResponse.json();
        const taskStatus = checkData.output?.task_status;

        if (taskStatus === 'SUCCEEDED') {
          // 任务成功，获取图片URL
          const results = checkData.output?.results || [];
          const images = results.map((result: any) => ({
            url: result.url,
            base64: result.b64_image, // Qwen 可能返回 base64
          }));

          return {
            images,
            provider: 'qwen',
            model,
            usage: {
              imagesGenerated: images.length,
            },
          };
        } else if (taskStatus === 'FAILED') {
          throw new Error(`Qwen task failed: ${checkData.output?.message || 'Unknown error'}`);
        }

        attempts++;
      }

      throw new Error('Qwen image generation timed out');
    } catch (error) {
      throw new Error(`Qwen image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['text']);

    // TODO: 实现Qwen TTS
    throw new Error('Qwen TTS not implemented yet');
  }

  async speechToText(request: SpeechToTextRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['audioFile']);

    // TODO: 实现Qwen STT
    throw new Error('Qwen STT not implemented yet');
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    throw new Error('Qwen video generation not supported');
  }
}

