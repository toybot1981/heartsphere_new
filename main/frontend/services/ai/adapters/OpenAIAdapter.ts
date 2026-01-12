/**
 * OpenAI适配器实现
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
 * OpenAI适配器
 */
export class OpenAIAdapter extends BaseAdapter {
  private readonly defaultBaseUrl = 'https://api.openai.com/v1';

  constructor(apiKey?: string) {
    super(apiKey);
    this.baseUrl = this.defaultBaseUrl;
  }

  getProviderType(): AIProvider {
    return 'openai';
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
    return false; // OpenAI暂不支持视频生成
  }

  getSupportedModels(capability: 'text' | 'image' | 'audio' | 'video'): string[] {
    const models: Record<string, string[]> = {
      text: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'gpt-4o',
      ],
      image: [
        'dall-e-3',
        'dall-e-2',
      ],
      audio: [
        'tts-1',
        'tts-1-hd',
        'whisper-1',
      ],
      video: [],
    };
    return models[capability] || [];
  }

  async generateText(request: TextGenerationRequest): Promise<TextGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('openai', 'text');
    const url = `${this.baseUrl}/chat/completions`;

    // 构建消息列表
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
        provider: 'openai',
        model,
        usage,
        finishReason: response.choices?.[0]?.finish_reason,
      };
    } catch (error) {
      throw new Error(`OpenAI text generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateTextStream(
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void
  ): Promise<void> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('openai', 'text');
    
    // 构建初始消息历史
    const messages: Array<any> = [];
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

    // 递归处理流式响应，支持多次 function call
    await this.processStreamWithFunctionCalls(
      model,
      messages,
      request,
      onChunk,
      0, // 递归深度
      10 // 最大递归深度（防止无限循环）
    );
  }

  /**
   * 处理流式响应，支持 Function Calling 的递归调用
   */
  private async processStreamWithFunctionCalls(
    model: string,
    messages: Array<any>,
    request: TextGenerationRequest,
    onChunk: (chunk: TextGenerationChunk) => void,
    depth: number,
    maxDepth: number
  ): Promise<void> {
    if (depth >= maxDepth) {
      console.warn('[OpenAIAdapter] 达到最大递归深度，停止处理 function calls');
      return;
    }

    const url = `${this.baseUrl}/chat/completions`;

    const requestBody: any = {
      model,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 2048,
      stream: true,
    };

    // 添加 Function Calling 支持
    if (request.functionDefinitions && request.functionDefinitions.length > 0) {
      requestBody.tools = request.functionDefinitions.map(fn => ({
        type: 'function',
        function: {
          name: fn.name,
          description: fn.description,
          parameters: fn.parameters,
        },
      }));
    }

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
      let functionCallBuffer: any = null;
      let assistantMessage: any = { role: 'assistant', content: '' };

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
            // 检查是否有 function call 需要处理
            if (functionCallBuffer && request.onFunctionCall) {
              // 将 assistant message 添加到历史
              messages.push(assistantMessage);
              
              // 执行 function call
              try {
                const functionResult = await request.onFunctionCall(functionCallBuffer);
                
                // 将 function call 结果添加到消息历史
                messages.push({
                  role: 'function',
                  name: functionCallBuffer.name,
                  content: JSON.stringify(functionResult),
                });

                // 递归调用以继续流式响应
                await this.processStreamWithFunctionCalls(
                  model,
                  messages,
                  request,
                  onChunk,
                  depth + 1,
                  maxDepth
                );
                return;
              } catch (error) {
                console.error('[OpenAIAdapter] Function call execution failed:', error);
                // 继续处理，不中断
              }
            } else {
              onChunk({ content: '', done: true });
            }
            return;
          }

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta;
            const content = delta?.content || '';
            const functionCall = delta?.function_call;

            // 处理 Function Call
            if (functionCall) {
              if (functionCall.name) {
                functionCallBuffer = {
                  name: functionCall.name,
                  arguments: functionCall.arguments || '',
                };
                assistantMessage.function_call = {
                  name: functionCall.name,
                  arguments: functionCall.arguments || '',
                };
              } else if (functionCall.arguments && functionCallBuffer) {
                functionCallBuffer.arguments += functionCall.arguments;
                if (assistantMessage.function_call) {
                  assistantMessage.function_call.arguments += functionCall.arguments;
                }
              }
            }

            // 处理文本内容
            if (content) {
              assistantMessage.content += content;
              onChunk({
                content,
                done: false,
              });
            }

            // 检查是否完成
            const finishReason = json.choices?.[0]?.finish_reason;
            if (finishReason) {
              // 如果是 function_call，执行函数并递归
              if (finishReason === 'function_call' && functionCallBuffer && request.onFunctionCall) {
                // 将 assistant message 添加到历史
                messages.push(assistantMessage);
                
                // 执行 function call
                try {
                  const functionResult = await request.onFunctionCall(functionCallBuffer);
                  
                  // 将 function call 结果添加到消息历史
                  messages.push({
                    role: 'function',
                    name: functionCallBuffer.name,
                    content: JSON.stringify(functionResult),
                  });

                  // 递归调用以继续流式响应
                  await this.processStreamWithFunctionCalls(
                    model,
                    messages,
                    request,
                    onChunk,
                    depth + 1,
                    maxDepth
                  );
                  return;
                } catch (error) {
                  console.error('[OpenAIAdapter] Function call execution failed:', error);
                  // 继续处理，不中断
                }
              }

              const usage = json.usage ? {
                inputTokens: json.usage.prompt_tokens || 0,
                outputTokens: json.usage.completion_tokens || 0,
                totalTokens: json.usage.total_tokens || 0,
              } : undefined;

              onChunk({
                content: '',
                done: true,
                usage,
              });
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    } catch (error) {
      throw new Error(`OpenAI stream generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['prompt']);

    const model = request.model || AIConfigManager.getDefaultModel('openai', 'image');
    const url = `${this.baseUrl}/images/generations`;

    const requestBody = {
      model,
      prompt: request.prompt,
      n: request.numberOfImages || 1,
      size: `${request.width || 1024}x${request.height || 1024}`,
      quality: 'standard',
    };

    try {
      const response = await this.makeRequest<any>(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      const images = (response.data || []).map((img: any) => ({
        url: img.url,
        base64: img.b64_json,
      }));

      return {
        images,
        provider: 'openai',
        model,
        usage: {
          imagesGenerated: images.length,
        },
      };
    } catch (error) {
      throw new Error(`OpenAI image generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['text']);

    const model = request.model || AIConfigManager.getDefaultModel('openai', 'audio');
    const url = `${this.baseUrl}/audio/speech`;

    const requestBody = {
      model,
      input: request.text,
      voice: request.voice || 'alloy',
      speed: request.speed || 1.0,
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

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        audioUrl,
        provider: 'openai',
        model,
      };
    } catch (error) {
      throw new Error(`OpenAI TTS failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async speechToText(request: SpeechToTextRequest): Promise<AudioResponse> {
    this.ensureConfigured();
    this.validateRequest(request, ['audioFile']);

    const model = request.model || 'whisper-1';
    const url = `${this.baseUrl}/audio/transcriptions`;

    const formData = new FormData();
    formData.append('file', request.audioFile);
    formData.append('model', model);
    if (request.language) {
      formData.append('language', request.language);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      return {
        text: data.text,
        provider: 'openai',
        model,
        confidence: 1.0, // OpenAI不返回置信度
      };
    } catch (error) {
      throw new Error(`OpenAI STT failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    throw new Error('OpenAI video generation not supported');
  }
}


