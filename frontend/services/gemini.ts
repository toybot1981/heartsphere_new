
import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type } from "@google/genai";
import { Message, Character, StoryNode, CustomScenario, UserProfile, WorldScene, JournalEcho, JournalEntry, AppSettings, AIProvider, DebugLog, DialogueStyle } from "../types";
import { createScenarioContext } from "../constants";

// 根据对话风格生成风格指令
const getDialogueStyleInstruction = (style: DialogueStyle = 'mobile-chat'): string => {
  switch (style) {
    case 'mobile-chat':
      return `\n\n[对话风格：即时网聊]
- 使用短句，像微信聊天一样自然
- 可以适当使用 Emoji 表情（😊、😢、🤔、💭 等）
- 动作描写用 *动作内容* 格式，例如：*轻轻拍了拍你的肩膀*
- 节奏要快，回复要简洁有力
- 语气要轻松、亲切，像和朋友聊天
- 避免冗长的描述，重点突出对话和互动`;
    
    case 'visual-novel':
      return `\n\n[对话风格：沉浸小说]
- 侧重心理描写和环境渲染
- 辞藻优美，富有文学性
- 像读轻小说一样，有代入感和画面感
- 可以详细描述角色的内心活动、表情、动作
- 适当描写周围环境，营造氛围
- 回复可以较长，但要保持节奏感
- 注重情感表达和细节刻画`;
    
    case 'stage-script':
      return `\n\n[对话风格：剧本独白]
- 格式严格：动作用 [动作内容] 表示，台词直接说
- 例如：[缓缓转身] 你来了...
- 干脆利落，适合作为创作大纲
- 动作和台词要清晰分离
- 避免过多的心理描写，重点在动作和对话
- 风格要简洁、有力，像舞台剧脚本`;
    
    case 'poetic':
      return `\n\n[对话风格：诗意留白]
- 极简、隐晦、富有哲理
- 像《主要还是看气质》或《光遇》的风格
- 用词要精炼，意境要深远
- 可以适当留白，让读者自己体会
- 避免直白的表达，多用隐喻和象征
- 节奏要慢，每个字都要有分量
- 注重氛围和情感，而非具体情节`;
    
    default:
      return '';
  }
};

// Helper to sanitize history for the API
const formatHistory = (history: Message[]) => {
  return history.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));
};

// Helper to format history for OpenAI Compatible APIs
const formatOpenAIHistory = (history: Message[], systemInstruction: string) => {
  const msgs = history.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user',
    content: msg.text
  }));
  // Prepend system instruction
  return [
    { role: 'system', content: systemInstruction },
    ...msgs
  ];
};

export class GeminiService {
  private ai?: GoogleGenAI;
  private chatSessions: Map<string, Chat> = new Map();
  
  // Configuration State
  private settings: AppSettings | null = null;
  
  // Debug Logging
  private logCallback: ((log: DebugLog) => void) | null = null;

  constructor() {
    // Default initialization with environment key if available
    // Prevent crash if API_KEY is missing during startup
    if (process.env.API_KEY) {
      try {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      } catch (e) {
        console.warn("Failed to initialize GoogleGenAI with process.env.API_KEY", e);
      }
    }
  }

  // Hook for App.tsx to receive logs
  setLogCallback(callback: ((log: DebugLog) => void) | null) {
      this.logCallback = callback;
  }

  private log(method: string, type: string, data: any, specificModel?: string, provider?: string) {
      if (this.settings?.debugMode && this.logCallback) {
          let safeData = data;
          try { safeData = JSON.parse(JSON.stringify(data)); } catch(e) { /* ignore circular */ }

          this.logCallback({
              id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              timestamp: Date.now(),
              provider: provider || 'unknown',
              model: specificModel || 'unknown',
              method,
              type,
              data: safeData
          });
      }
      // Also log to console for immediate visibility during dev
      if (type === 'error' || type === 'fallback_error') {
          console.error(`[${provider}] ${method} Error:`, data);
      }
  }

  // Update internal configuration based on AppSettings
  updateConfig(settings: AppSettings) {
    this.settings = settings;

    // Re-initialize Gemini client if key changed in geminiConfig and is not empty
    // If empty, we keep the default constructor instance (which might have process.env.API_KEY)
    if (settings.geminiConfig.apiKey) {
        this.ai = new GoogleGenAI({ apiKey: settings.geminiConfig.apiKey });
    } else if (process.env.API_KEY) {
        // Fallback to env key if settings key is cleared/empty
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    } else {
        // No key available
        this.ai = undefined;
    }
    // Clear sessions on config change to avoid stale state
    this.chatSessions.clear();
  }

  // Helper to get configuration for a specific provider
  private getConfigForProvider(provider: AIProvider) {
      if (!this.settings) return null;
      switch (provider) {
          case 'openai': return this.settings.openaiConfig;
          case 'qwen': return this.settings.qwenConfig;
          case 'doubao': return this.settings.doubaoConfig;
          case 'gemini': default: return this.settings.geminiConfig;
      }
  }

  // --- FALLBACK STRATEGY LOGIC ---

  private getPrioritizedProviders(modality: 'text' | 'image' | 'video' | 'audio'): AIProvider[] {
      if (!this.settings) {
          // 如果没有设置，尝试所有可能的 providers（包括环境变量中的 Gemini）
          const allProviders: AIProvider[] = ['gemini', 'openai', 'qwen', 'doubao'];
          return allProviders.filter(p => {
              if (p === 'gemini') return true; // Gemini 可能使用环境变量
              return false; // 其他需要配置
          });
      }

      let primary: AIProvider = 'gemini';
      switch(modality) {
          case 'text': primary = this.settings.textProvider; break;
          case 'image': primary = this.settings.imageProvider; break;
          case 'video': primary = this.settings.videoProvider; break;
          case 'audio': primary = this.settings.audioProvider; break;
      }

      const order: AIProvider[] = [];
      const added = new Set<AIProvider>();

      // 定义 capabilities
      const capabilities: Record<AIProvider, string[]> = {
          'gemini': ['text', 'image', 'video', 'audio'],
          'openai': ['text'], // Add 'image' if DALL-E logic implemented
          'qwen': ['text', 'image', 'video'], // Qwen supports text, image, video
          'doubao': ['text', 'image', 'video'] // Doubao supports text, image, video
      };
      
      // 添加 primary provider（即使没有配置，也先尝试，失败后会 fallback）
      if (capabilities[primary].includes(modality)) {
          order.push(primary);
          added.add(primary);
      }

      // 添加 fallback providers
      if (this.settings.enableFallback) {
          const fallbacks: AIProvider[] = ['gemini', 'openai', 'qwen', 'doubao'];
          
          for (const p of fallbacks) {
              if (!added.has(p) && capabilities[p].includes(modality)) {
                  // 检查是否有配置的 API key，或者 Gemini 可能使用环境变量
                  const config = this.getConfigForProvider(p);
                  const hasApiKey = (config && config.apiKey && config.apiKey.trim() !== '') || (p === 'gemini' && process.env.API_KEY);
                  if (hasApiKey) {
                      order.push(p);
                      added.add(p);
                  }
              }
          }
      } else {
          // 即使没有启用 fallback，也要检查 primary 是否有配置
          // 如果没有配置，尝试其他可用的
          const primaryConfig = this.getConfigForProvider(primary);
          const hasPrimaryKey = (primaryConfig && primaryConfig.apiKey && primaryConfig.apiKey.trim() !== '') || (primary === 'gemini' && process.env.API_KEY);
          
          if (!hasPrimaryKey) {
              // Primary 没有配置，尝试其他可用的
              const fallbacks: AIProvider[] = ['gemini', 'openai', 'qwen', 'doubao'];
              for (const p of fallbacks) {
                  if (!added.has(p) && capabilities[p].includes(modality)) {
                      const config = this.getConfigForProvider(p);
                      const hasApiKey = (config && config.apiKey && config.apiKey.trim() !== '') || (p === 'gemini' && process.env.API_KEY);
                      if (hasApiKey) {
                          order.push(p);
                          added.add(p);
                      }
                  }
              }
          }
      }
      
      // 如果没有任何可用的，至少返回 primary（让错误处理来处理）
      return order.length > 0 ? order : [primary];
  }

  private async retry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
       // ... existing error checking logic ...
      let isRateLimit = error?.status === 429 || error?.code === 429 || error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED';
      // Handle nested error object from Google GenAI SDK
      if (error?.error?.code === 429 || error?.error?.status === 'RESOURCE_EXHAUSTED') {
          isRateLimit = true;
      }
      
      if (isRateLimit && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retry(fn, retries - 1, delay * 2); 
      }
      throw error;
    }
  }

  // --- EXECUTION STRATEGIES (Low Level) ---

  private async executeTextGeneration(provider: AIProvider, prompt: string, systemInstruction: string, jsonMode: boolean): Promise<string> {
      const config = this.getConfigForProvider(provider);
      // Gemini can use process.env.API_KEY if config.apiKey is missing
      const effectiveKey = config?.apiKey || (provider === 'gemini' ? process.env.API_KEY : '');

      if (provider !== 'gemini' && (!config || !effectiveKey)) {
         throw new Error(`Config/Key missing for ${provider}`);
      }
      
      // 对于 Gemini，如果没有配置，也抛出错误（但会被 fallback 捕获）
      if (provider === 'gemini' && !effectiveKey) {
         throw new Error(`Gemini API Key is not configured. Please set it in Settings.`);
      }
      
      const modelName = config?.modelName || 'gemini-2.5-flash';

      // 1. OpenAI / Qwen / Doubao
      if (provider === 'openai' || provider === 'qwen' || provider === 'doubao') {
            if (!config) throw new Error("Provider config missing");
            const baseUrl = config.baseUrl || (provider === 'openai' ? 'https://api.openai.com/v1' : provider === 'doubao' ? 'https://ark.cn-beijing.volces.com/api/v3' : 'https://dashscope.aliyuncs.com/compatible-mode/v1');
            const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

            const messages = [
                { role: 'system', content: systemInstruction + (jsonMode ? " Respond in valid JSON only." : "") },
                { role: 'user', content: prompt }
            ];
            
            const payload = {
                model: modelName,
                messages: messages,
                temperature: 0.7,
                response_format: jsonMode && provider === 'openai' ? { type: "json_object" } : undefined
            };

            // --- Enhanced Logging for Debugging ---
            console.group(`[GeminiService] ${provider} Request`);
            console.log(`URL: ${url}`);
            console.log(`Model: ${modelName}`);
            console.log("Payload:", payload);
            console.groupEnd();

            this.log('executeText', 'request', { 
                provider, 
                url, 
                modelName, 
                promptExcerpt: prompt.substring(0, 50) + "..." 
            }, modelName, provider);

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${effectiveKey}` },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errText = await response.text();
                    let errJson;
                    try { errJson = JSON.parse(errText); } catch (e) {}

                    console.error(`[GeminiService] ${provider} API Error ${response.status}`, errText);

                    // --- Doubao/Provider Specific Analysis ---
                    let analysis = `HTTP Error ${response.status}`;
                    
                    if (provider === 'doubao') {
                        if (response.status === 404) {
                            analysis = "Endpoint ID 错误 (404)。豆包 (Volcengine) 的 'Model Name' 通常需要填写推理接入点 ID (例如 'ep-20240604...')。请检查设置中的模型名称是否正确。";
                        } else if (response.status === 400) {
                             analysis = "请求参数错误 (400)。请检查模型名称是否符合该提供商要求。";
                        }
                    }

                    const debugInfo = {
                        status: response.status,
                        statusText: response.statusText,
                        errorBody: errJson || errText,
                        analysis: analysis
                    };

                    this.log('executeText', 'error', debugInfo, modelName, provider);
                    throw new Error(`Provider ${provider} (${modelName}) failed: ${analysis} \nRaw: ${errText.substring(0, 200)}`);
                }

                const data = await response.json();
                
                if (data.error) {
                     console.error(`[GeminiService] ${provider} Data Error`, data.error);
                     this.log('executeText', 'api_error', data.error, modelName, provider);
                     throw new Error(`API Error: ${data.error.message}`);
                }

                const result = data.choices?.[0]?.message?.content || '';
                this.log('executeText', 'response', { length: result.length, preview: result.substring(0, 20) }, modelName, provider);
                return result;

            } catch (error: any) {
                console.error(`[GeminiService] ${provider} Exception`, error);
                
                // Check for CORS or Network errors specifically
                if (error instanceof TypeError && error.message === 'Failed to fetch') {
                     const corsMsg = `网络请求失败 (CORS)。浏览器拦截了对 ${provider} 的跨域请求。请注意：豆包/通义千问等国内大模型 API 通常不支持直接在浏览器前端调用 (CORS 限制)。您可能需要配置代理服务器，或使用支持 CORS 的模型 (如 Gemini)。`;
                     this.log('executeText', 'network_error', corsMsg, modelName, provider);
                     throw new Error(corsMsg);
                }
                throw error;
            }
      } 
      // 2. Gemini
      else {
          this.log('executeText', 'request', { provider, modelName, prompt }, modelName, provider);
          const geminiConfig: any = { systemInstruction };
          if (jsonMode) geminiConfig.responseMimeType = "application/json";

          // Use specific key if configured, otherwise fallback to this.ai
          const client = (config && config.apiKey) ? new GoogleGenAI({ apiKey: config.apiKey }) : this.ai;
          
          if (!client) {
             throw new Error("Gemini API Key is not configured. Please set it in Settings.");
          }

          try {
            const response = await client.models.generateContent({
                model: modelName,
                contents: prompt,
                config: geminiConfig
            });
            const result = response.text || '';
            this.log('executeText', 'response', result, modelName, provider);
            return result;
          } catch (e: any) {
             this.log('executeText', 'error', e, modelName, provider);
             throw e;
          }
      }
  }

  private async executeImageGeneration(provider: AIProvider, prompt: string, aspectRatio: string): Promise<string | null> {
      if (provider === 'gemini') {
          const config = this.getConfigForProvider('gemini');
          const model = config?.imageModel || 'gemini-2.5-flash-image'; 
          
          this.log('executeImage', 'request', { prompt, aspectRatio }, model, provider);

          // Use specific key if configured
          const client = (config && config.apiKey) ? new GoogleGenAI({apiKey: config.apiKey}) : this.ai;
          
          if (!client) throw new Error("Gemini API Key missing");

          const response = await client.models.generateContent({
            model: model,
            contents: { parts: [{ text: prompt }] },
            config: { imageConfig: { aspectRatio: aspectRatio as any } }
          });

          for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                this.log('executeImage', 'success', 'Image generated', model, provider);
                return url;
            }
          }
      }
      else if (provider === 'qwen') {
          const config = this.getConfigForProvider('qwen');
          const apiKey = config?.apiKey;
          const model = config?.imageModel || 'qwen-image-plus'; 
          
          if (!apiKey) throw new Error("Qwen API Key missing");
          
          let size = '1024*1024';
          if (aspectRatio === '16:9') size = '1280*720';
          else if (aspectRatio === '9:16') size = '720*1280';
          else if (aspectRatio === '3:4') size = '1024*1024'; 

          this.log('executeImage', 'request', { prompt, model, size }, model, 'qwen');

          try {
              const submitUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
              const submitResponse = await fetch(submitUrl, {
                  method: 'POST',
                  headers: {
                      'Authorization': `Bearer ${apiKey}`,
                      'Content-Type': 'application/json',
                      'X-DashScope-Async': 'enable'
                  },
                  body: JSON.stringify({
                      model: model,
                      input: { prompt: prompt },
                      parameters: { size: size, n: 1 }
                  })
              });

              if (!submitResponse.ok) {
                   const errText = await submitResponse.text();
                   throw new Error(`Qwen Submit Failed (${submitResponse.status}): ${errText}`);
              }

              const submitData = await submitResponse.json();
              if (submitData.code && submitData.code !== '200') {
                  const errMsg = submitData.message || submitData.code || 'Unknown Error';
                  this.log('executeImage', 'error', submitData, model, 'qwen');
                  throw new Error(`Qwen Submit Failed: ${errMsg}`);
              }

              const taskId = submitData.output.task_id;
              this.log('executeImage', 'info', `Task submitted: ${taskId}, polling...`, model, 'qwen');

              let attempts = 0;
              while (attempts < 30) { // Poll for ~60 seconds
                  await new Promise(resolve => setTimeout(resolve, 2000));
                  const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
                  const checkResponse = await fetch(taskUrl, {
                      headers: { 'Authorization': `Bearer ${apiKey}` }
                  });
                  const checkData = await checkResponse.json();

                  if (checkData.output.task_status === 'SUCCEEDED') {
                      const imgUrl = checkData.output.results[0].url;
                      this.log('executeImage', 'success', imgUrl, model, 'qwen');
                      return imgUrl;
                  } else if (checkData.output.task_status === 'FAILED') {
                      this.log('executeImage', 'error', checkData, model, 'qwen');
                      throw new Error(`Qwen Task Failed: ${checkData.output.message}`);
                  }
                  attempts++;
              }
              throw new Error("Qwen Image Generation Timed Out");
          } catch (e: any) {
              if (e instanceof TypeError && e.message === 'Failed to fetch') {
                   const corsMsg = "Network Error (Likely CORS). Qwen/DashScope API does not support direct browser calls. Please use a backend proxy or a browser extension to bypass CORS for testing.";
                   this.log('executeImage', 'error', corsMsg, model, 'qwen');
                   throw new Error(corsMsg);
              }
              throw e;
          }
      }
      else if (provider === 'doubao') {
          this.log('executeImage', 'error', 'Doubao Image generation not implemented (requires backend proxy)', 'doubao-cv', 'doubao');
          throw new Error("Doubao Image Generation not implemented in frontend-only mode.");
      }
      return null;
  }

  private async executeVideoGeneration(provider: AIProvider, prompt: string): Promise<string | null> {
      if (provider === 'gemini') {
          const config = this.getConfigForProvider('gemini');
          const model = config?.videoModel || 'veo-3.1-fast-generate-preview'; 
          
          this.log('executeVideo', 'request', { prompt }, model, provider);
          
          const client = (config && config.apiKey) ? new GoogleGenAI({apiKey: config.apiKey}) : this.ai;
          const effectiveKey = config?.apiKey || process.env.API_KEY;

          if (!client) throw new Error("Gemini API Key missing");

          let operation = await client.models.generateVideos({
              model: model,
              prompt: prompt,
              config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
          });

          while (!operation.done) {
              await new Promise(resolve => setTimeout(resolve, 5000));
              operation = await client.operations.getVideosOperation({operation: operation});
          }

          const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (uri && effectiveKey) {
               const videoUrl = `${uri}&key=${effectiveKey}`;
               this.log('executeVideo', 'success', videoUrl, model, provider);
               return videoUrl;
          }
      }
      else if (provider === 'qwen' || provider === 'doubao') {
          const config = this.getConfigForProvider(provider);
          if (!config || !config.apiKey) return null;
          const model = config.videoModel || 'default-video-model';
          this.log('executeVideo', 'request', { prompt }, model, provider);
          console.warn(`${provider} video generation not fully implemented yet.`);
          return null; 
      }
      return null;
  }

  // --- PUBLIC METHODS (With Routing & Fallback) ---

  private async generateText(prompt: string, systemInstruction: string = '', jsonMode: boolean = false): Promise<string> {
      const providers = this.getPrioritizedProviders('text');
      let lastError: Error | null = null;

      for (const provider of providers) {
          try {
              return await this.executeTextGeneration(provider, prompt, systemInstruction, jsonMode);
          } catch (e) {
              console.warn(`Provider ${provider} failed, trying next...`, e);
              lastError = e;
              this.log('generateText', 'fallback_error', { provider, error: e });
              continue;
          }
      }
      throw lastError || new Error("All text providers failed");
  }

  // --- OpenAI / Qwen / Doubao Compatible Stream Handler ---
  
  private async initOpenAIStreamRequest(
    config: { apiKey: string, baseUrl?: string, modelName: string },
    messages: any[]
  ): Promise<Response> {
    const baseUrl = config.baseUrl || 'https://api.openai.com/v1';
    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const payload = {
        model: config.modelName,
        messages: messages,
        stream: true,
        temperature: 0.8
    };

    // Log the stream init request
    console.group(`[GeminiService] Stream Init (${config.modelName})`);
    console.log(`URL: ${url}`);
    console.log("Payload:", payload);
    console.groupEnd();

    this.log('sendMessageStream', 'init_request', { url, model: config.modelName }, config.modelName, 'generic_stream');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const err = await response.text();
            console.error(`[GeminiService] Stream Init Error ${response.status}`, err);

            let analysis = "Unknown Stream Error";
            if (response.status === 404) analysis = "Endpoint ID Invalid (404). Check Model Name.";
            
            const debugInfo = { status: response.status, body: err, analysis };
            this.log('sendMessageStream', 'init_error', debugInfo, config.modelName, 'generic_stream');
            
            throw new Error(`Stream API Error ${response.status}: ${err} (${analysis})`);
        }
        return response;
    } catch (error: any) {
        console.error(`[GeminiService] Stream Network Error`, error);
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
             throw new Error(`Network Error (CORS). Browser blocked call to ${url}.`);
        }
        throw error;
    }
  }

  private async *parseOpenAIStream(response: Response): AsyncIterable<GenerateContentResponse> {
    if (!response.body) throw new Error("No response body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            
            const dataStr = trimmed.replace('data: ', '');
            if (dataStr === '[DONE]') return;

            try {
                const json = JSON.parse(dataStr);
                const content = json.choices[0]?.delta?.content || '';
                if (content) {
                    yield {
                        text: content,
                        candidates: [],
                        functionCalls: undefined
                    } as unknown as GenerateContentResponse;
                }
            } catch (e) {
                // Ignore parse errors for partial chunks
            }
        }
    }
  }

  // Initialize or retrieve a chat session for a specific character (GEMINI ONLY)
  private getSession(character: Character, history: Message[], userProfile: UserProfile | null): Chat {
    if (!this.chatSessions.has(character.id)) {
      const historyForApi = formatHistory(history.filter(m => m.text)); 
      
      const scenarioContext = createScenarioContext(userProfile);
      
      // --- DEEP CHARACTER INJECTION ---
      let deepCharacterPrompt = `YOUR CHARACTER INSTRUCTION:\n${character.systemInstruction}`;
      
      if (character.mbti || character.tags) {
          deepCharacterPrompt += `\n\n[PERSONALITY ANCHORS]\nMBTI: ${character.mbti || 'Unknown'}\nTags: ${character.tags?.join(', ') || 'None'}`;
      }
      if (character.speechStyle || character.catchphrases) {
          deepCharacterPrompt += `\n\n[LINGUISTIC STYLE]\nStyle: ${character.speechStyle || 'Natural'}\nCatchphrases: ${character.catchphrases?.join(', ') || 'None'}`;
      }
      if (character.secrets || character.motivations) {
          deepCharacterPrompt += `\n\n[PSYCHOLOGICAL DEPTH]\nCurrent Motivation: ${character.motivations || 'To interact with the user.'}\nHidden Secrets (Do not reveal immediately, let them influence your subtext): ${character.secrets || 'None'}`;
      }
      if (character.relationships) {
          deepCharacterPrompt += `\n\n[RELATIONSHIP WEB]\n${character.relationships}`;
      }
      // --------------------------------

      // --- 对话风格注入 ---
      const dialogueStyle = this.settings?.dialogueStyle || 'mobile-chat';
      const styleInstruction = getDialogueStyleInstruction(dialogueStyle);
      // --------------------

      const combinedInstruction = `${scenarioContext}\n\n${deepCharacterPrompt}${styleInstruction}`;

      const config = this.getConfigForProvider('gemini');
      const modelName = config?.modelName || 'gemini-2.5-flash';
      const apiKey = config?.apiKey || process.env.API_KEY;

      if (!apiKey) {
          throw new Error("Gemini API Key is missing. Check your settings.");
      }
      
      const client = new GoogleGenAI({ apiKey });

      const chat = client.chats.create({
        model: modelName,
        config: {
          systemInstruction: combinedInstruction,
          temperature: 0.8,
          topK: 40,
        },
        history: historyForApi,
      });
      
      this.chatSessions.set(character.id, chat);
    }
    return this.chatSessions.get(character.id)!;
  }
  
  // Public method to reset a session
  resetSession(characterId: string) {
    this.chatSessions.delete(characterId);
  }

  // Send message and get stream
  async sendMessageStream(
    character: Character, 
    history: Message[], 
    userMessage: string,
    userProfile: UserProfile | null
  ): Promise<AsyncIterable<GenerateContentResponse>> {
    
    const providers = this.getPrioritizedProviders('text');
    let lastError: Error | null = null;

    for (const provider of providers) {
        try {
            const config = this.getConfigForProvider(provider);
            const effectiveKey = config?.apiKey || (provider === 'gemini' ? process.env.API_KEY : '');
            
            // 如果配置或 API key 缺失，跳过这个 provider，继续尝试下一个
            if (!config || !effectiveKey) {
                console.error(`[GeminiService] ${provider} provider 配置缺失或 API key 不存在，跳过并尝试下一个 provider`);
                this.log('sendMessageStream', 'skip_provider', { provider, reason: 'missing_config_or_key' });
                continue;
            }
            
            this.log('sendMessageStream', 'attempt', { provider }, config.modelName);

            // 1. OpenAI / Qwen / Doubao
            if (provider === 'openai' || provider === 'qwen' || provider === 'doubao') {
                const scenarioContext = createScenarioContext(userProfile);
                
                // --- DEEP CHARACTER INJECTION (Duplicate logic for generic providers) ---
                let deepCharacterPrompt = `YOUR CHARACTER INSTRUCTION:\n${character.systemInstruction}`;
                if (character.mbti) deepCharacterPrompt += `\nMBTI: ${character.mbti}`;
                if (character.speechStyle) deepCharacterPrompt += `\nSpeaking Style: ${character.speechStyle}`;
                if (character.catchphrases) deepCharacterPrompt += `\nCommon Phrases: ${character.catchphrases.join(', ')}`;
                if (character.secrets) deepCharacterPrompt += `\nSecrets: ${character.secrets}`;
                // -----------------------------------------------------------------------

                // --- 对话风格注入 ---
                const dialogueStyle = this.settings?.dialogueStyle || 'mobile-chat';
                const styleInstruction = getDialogueStyleInstruction(dialogueStyle);
                // --------------------

                const combinedInstruction = `${scenarioContext}\n\n${deepCharacterPrompt}${styleInstruction}`;
                
                const messages = formatOpenAIHistory(history, combinedInstruction);
                messages.push({ role: 'user', content: userMessage });
                
                const response = await this.initOpenAIStreamRequest({ ...config, apiKey: effectiveKey }, messages);
                return this.parseOpenAIStream(response);
            }
            // 2. Gemini
            else if (provider === 'gemini') {
                 // 再次确认 Gemini API key 存在（getSession 内部也会检查，但提前检查可以避免不必要的操作）
                 const geminiConfig = this.getConfigForProvider('gemini');
                 const geminiKey = geminiConfig?.apiKey || process.env.API_KEY;
                 if (!geminiKey) {
                     console.error('[GeminiService] Gemini API Key 缺失，跳过并尝试下一个 provider');
                     continue;
                 }
                 
                 let historyForInit = history;
                 if (history.length > 0) {
                    const lastMsg = history[history.length - 1];
                    if (lastMsg.role === 'user' && lastMsg.text === userMessage) {
                        historyForInit = history.slice(0, -1);
                    }
                 }
                 const chat = this.getSession(character, historyForInit, userProfile);
                 return await chat.sendMessageStream({ message: userMessage });
            }

        } catch (e) {
             console.error(`[GeminiService] sendMessageStream failed on ${provider}`, e);
             this.log('sendMessageStream', 'error_fallback', { provider, error: e });
             lastError = e;
             if (provider === 'gemini') this.chatSessions.delete(character.id);
             continue; // Try next provider
        }
    }
    
    // 所有 provider 都失败后，抛出最后一个错误或通用错误
    const errorMessage = lastError 
        ? `所有文本模型都失败，最后尝试的是: ${lastError.message}`
        : "所有文本模型都失败，没有可用的 API key 配置";
    throw new Error(errorMessage);
  }

  // --- Era & Character Constructor ---
  async generateCharacterFromPrompt(prompt: string, eraName: string): Promise<Character | null> {
    return this.retry(async () => {
       try {
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

        const responseText = await this.generateText(userPrompt, systemPrompt, true);
        
        const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const details = JSON.parse(jsonStr);

        // DO NOT Auto Generate Image to save cost. Use placeholder.
        let avatarUrl = 'https://picsum.photos/seed/default_avatar/400/600';
        let backgroundUrl = 'https://picsum.photos/seed/default_bg/1080/1920';

        const newCharacter: Character = {
            id: `custom_${Date.now()}`,
            voiceName: 'Kore', 
            ...details,
            avatarUrl,
            backgroundUrl
        };
        return newCharacter;
       } catch (e) {
         this.log('generateCharacterFromPrompt', 'error', e);
         throw e;
       }
    }, 2, 3000);
  }

  async generateMainStory(eraName: string, eraDescription: string, characters: Array<{name: string, role: string, bio: string}>, optionalPrompt?: string): Promise<{
    name: string;
    role: string;
    bio: string;
    firstMessage: string;
    themeColor: string;
    colorAccent: string;
    age?: number;
    voiceName?: string;
    tags?: string;
    speechStyle?: string;
    motivations?: string;
  } | null> {
    // 使用 fallback 机制，尝试所有可用的 providers
    const providers = this.getPrioritizedProviders('text');
    
    // 调试信息：打印可用的 providers 和配置状态
    console.log('[generateMainStory] 可用的 providers:', providers);
    if (this.settings) {
      console.log('[generateMainStory] Settings:', {
        textProvider: this.settings.textProvider,
        enableFallback: this.settings.enableFallback,
        geminiConfig: { hasKey: !!(this.settings.geminiConfig?.apiKey?.trim()) },
        openaiConfig: { hasKey: !!(this.settings.openaiConfig?.apiKey?.trim()) },
        qwenConfig: { hasKey: !!(this.settings.qwenConfig?.apiKey?.trim()), apiKeyLength: this.settings.qwenConfig?.apiKey?.length || 0 },
        doubaoConfig: { hasKey: !!(this.settings.doubaoConfig?.apiKey?.trim()) }
      });
    } else {
      console.warn('[generateMainStory] Settings 未初始化！');
    }
    
    let lastError: Error | null = null;

    for (const provider of providers) {
      try {
        return await this.retry(async () => {
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

            const responseText = await this.executeTextGeneration(provider, userPrompt, systemPrompt, true);
            
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
          } catch (e) {
            this.log('generateMainStory', 'error', e);
            throw e;
          }
        }, 2, 3000);
      } catch (e: unknown) {
        const error = e instanceof Error ? e : new Error(String(e));
        const errorMsg = error?.message || String(e);
        console.warn(`[generateMainStory] Provider ${provider} failed: ${errorMsg}, trying next...`);
        lastError = error;
        this.log('generateMainStory', 'fallback_error', { provider, error: errorMsg });
        
        // 如果是配置缺失的错误，继续尝试下一个
        if (errorMsg.includes('not configured') || errorMsg.includes('missing') || errorMsg.includes('Key')) {
          continue;
        }
        
        // 其他错误也继续尝试
        continue;
      }
    }
    
    // 构建更友好的错误信息
    if (lastError) {
      const errorMsg = lastError instanceof Error ? lastError.message : String(lastError);
      if (errorMsg.includes('not configured') || errorMsg.includes('missing') || errorMsg.includes('Key')) {
        throw new Error("所有 AI 模型都未配置 API Key。请在设置中配置至少一个模型的 API Key（Gemini、OpenAI、Qwen 或 Doubao）。");
      }
      throw new Error(`所有 AI 模型都失败了：${errorMsg}`);
    }
    
    throw new Error("所有 AI 模型都失败了，请检查配置");
  }

  async generateScenarioFromPrompt(prompt: string): Promise<CustomScenario | null> {
      return this.retry(async () => {
        try {
            const systemPrompt = `You are a creative director for an interactive visual novel game.
            Based on the user's idea, generate a branching scenario structure in JSON format.
            JSON Structure: { "title": "...", "description": "...", "startNodeId": "node_1", "nodes": { "node_1": { "id": "node_1", "title": "...", "prompt": "...", "options": [...] } } }
            Create at least 3-4 nodes with choices. The content MUST be in Chinese.`;

            const responseText = await this.generateText(prompt, systemPrompt, true);
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const scenarioData = JSON.parse(jsonStr);

            const scenario: CustomScenario = {
                id: `scenario_${Date.now()}`,
                sceneId: '', 
                author: 'AI Architect',
                ...scenarioData
            };
            return scenario;
        } catch (e) {
            this.log('generateScenarioFromPrompt', 'error', e);
            throw e;
        }
      }, 2, 3000); 
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
  }): Promise<{ nodes: Record<string, StoryNode>; startNodeId: string }> {
    return this.retry(async () => {
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

        const responseText = await this.generateText(userPrompt, systemPrompt, true);
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
      } catch (e) {
        this.log('generateScriptWithCharacters', 'error', e);
        throw e;
      }
    }, 2, 3000);
  }

  // --- Image Generation ---
  async generateImageFromPrompt(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'): Promise<string | null> {
    const providers = this.getPrioritizedProviders('image');
    for (const provider of providers) {
        try {
            const result = await this.executeImageGeneration(provider, prompt, aspectRatio);
            if (result) return result;
        } catch (e: any) {
            console.warn(`Image gen failed on ${provider}`, e);
            this.log('generateImage', 'fallback_error', { provider, error: e?.message || e });
            continue;
        }
    }
    return null;
  }

  // --- Video Generation ---
  async generateVideoFromPrompt(prompt: string): Promise<string | null> {
      const providers = this.getPrioritizedProviders('video');
      for (const provider of providers) {
          try {
              const result = await this.executeVideoGeneration(provider, prompt);
              if (result) return result;
          } catch(e) {
              console.warn(`Video gen failed on ${provider}`, e);
              continue;
          }
      }
      return null;
  }

  // --- Prompt Constructors (Cost Saving) ---
  constructEraCoverPrompt(name: string, description: string, worldStyle?: string): string {
      const styleSuffix = worldStyle ? this.getStylePromptSuffix(worldStyle) : 'Style: Modern Chinese Anime (Manhua), cinematic lighting, vibrant, epic feel.';
      return `A beautiful, high-quality vertical world illustration for a world named "${name}". The theme is: "${description}". ${styleSuffix}`;
  }

  constructCharacterAvatarPrompt(name: string, role: string, bio: string, themeColor: string, worldStyle?: string): string {
      const styleSuffix = worldStyle ? this.getStylePromptSuffix(worldStyle) : 'Style: Modern Chinese Anime (Manhua), vibrant colors, detailed eyes.';
      return `High-quality vertical character portrait of ${name}. Role: ${role}. Description: ${bio}. ${styleSuffix} Centered character, abstract background matching theme color ${themeColor}.`;
  }

  constructCharacterBackgroundPrompt(name: string, bio: string, eraName: string, worldStyle?: string): string {
      const styleSuffix = worldStyle ? this.getStylePromptSuffix(worldStyle) : 'Style: Modern Chinese Anime (Manhua), high quality, cinematic lighting.';
      return `Atmospheric background scene for the world of "${eraName}". It should match the personality of a character named ${name}, described as: "${bio}". ${styleSuffix}`;
  }

  constructUserAvatarPrompt(nickname: string, worldStyle?: string): string {
      const styleSuffix = worldStyle ? this.getStylePromptSuffix(worldStyle) : 'Style: Modern Anime, Cyberpunk, or Dreamy Digital Art.';
      return `Profile avatar for a user named "${nickname}". ${styleSuffix} High quality, centered face or symbol.`;
  }

  constructMoodPrompt(content: string, worldStyle?: string): string {
      const styleSuffix = worldStyle ? this.getStylePromptSuffix(worldStyle) : 'Style: Ethereal, Dreamlike, Digital Art, vibrant colors, expressive brushstrokes.';
      return `Abstract, artistic, high-quality illustration representing this emotion/thought: "${content.substring(0, 100)}...". ${styleSuffix}`;
  }

  // Helper method to get style prompt suffix
  private getStylePromptSuffix(worldStyle: string): string {
      // Import WORLD_STYLE_DESCRIPTIONS dynamically or use a switch
      const styleMap: Record<string, string> = {
          'anime': 'Style: Modern Chinese Anime (Manhua), vibrant colors, detailed eyes, expressive emotions, cinematic lighting.',
          'realistic': 'Style: Photorealistic, highly detailed, realistic lighting and textures, professional photography quality.',
          'cyberpunk': 'Style: Cyberpunk, neon lights, futuristic technology, dark aesthetic, Blade Runner inspired, high-tech low-life atmosphere.',
          'fantasy': 'Style: Fantasy art, magical elements, epic scenes, mystical atmosphere, high fantasy aesthetic, detailed world-building.',
          'steampunk': 'Style: Steampunk, Victorian era aesthetics, brass and copper machinery, gears and cogs, retro-futuristic technology.',
          'minimalist': 'Style: Minimalist, clean lines, elegant simplicity, modern design, ample white space, refined aesthetics.',
          'watercolor': 'Style: Watercolor painting, soft brushstrokes, dreamy color gradients, artistic and ethereal, flowing pigments.',
          'oil-painting': 'Style: Oil painting, classical art, rich brushstrokes and texture, Renaissance or Baroque inspired, artistic depth.'
      };
      return styleMap[worldStyle] || styleMap['anime'];
  }

  // --- Avatar Gen Wrapper (Legacy/Direct) ---
  async generateCharacterImage(character: Character, worldStyle?: string): Promise<string | null> {
      const prompt = this.constructCharacterAvatarPrompt(character.name, character.role, character.bio, character.themeColor, worldStyle);
      return this.generateImageFromPrompt(prompt, '3:4');
  }

  // --- User Avatar Gen ---
  async generateUserAvatar(nickname: string, worldStyle?: string): Promise<string | null> {
      const prompt = this.constructUserAvatarPrompt(nickname, worldStyle);
      return this.generateImageFromPrompt(prompt, '1:1');
  }

  // --- TTS ---
  async generateSpeech(text: string, voiceName: string): Promise<string | null> {
    if (this.settings?.audioProvider !== 'gemini' && !this.settings?.enableFallback) return null;
    
    const providers = this.getPrioritizedProviders('audio');
    if (!providers.includes('gemini')) return null;

    const config = this.getConfigForProvider('gemini');
    const model = 'gemini-2.5-flash-preview-tts';
    this.log('generateSpeech', 'request', { text, voiceName }, model, 'gemini');
    
    const effectiveKey = config?.apiKey || process.env.API_KEY;

    return this.retry(async () => {
        // Safe Client Creation
        const client = effectiveKey ? new GoogleGenAI({apiKey: effectiveKey}) : this.ai;
        if (!client) throw new Error("Gemini API Key missing for TTS");

        const response = await client.models.generateContent({
            model: model,
            contents: { parts: [{ text }] },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' } }
                }
            }
        });
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            this.log('generateSpeech', 'success', 'Audio generated', model, 'gemini');
            return audioData;
        }
        throw new Error("No audio data returned");
    });
  }

  // --- Story & Logic Helpers ---

  async generateStoryBeatStream(
    node: StoryNode, 
    history: Message[], 
    choiceText: string | null,
    userProfile: UserProfile | null,
    participatingCharacters?: Character[] // 参与剧本的角色列表
  ): Promise<AsyncIterable<GenerateContentResponse>> {
      
      const scenarioContext = createScenarioContext(userProfile);
      
      // 构建角色信息字符串
      let characterInfo = '';
      if (participatingCharacters && participatingCharacters.length > 0) {
          characterInfo = '\n\n参与角色信息：\n';
          participatingCharacters.forEach(char => {
              characterInfo += `- ${char.name}（${char.role}）：${char.bio || '暂无描述'}\n`;
              if (char.mbti) characterInfo += `  MBTI: ${char.mbti}\n`;
              if (char.tags && char.tags.length > 0) characterInfo += `  标签: ${char.tags.join(', ')}\n`;
              if (char.speechStyle) characterInfo += `  说话风格: ${char.speechStyle}\n`;
          });
          characterInfo += '\n故事应主要围绕这些角色展开，确保他们的性格、背景和关系在故事中得到体现。';
      }
      
      // 如果节点指定了聚焦角色，添加额外提示
      let focusCharacterInfo = '';
      if (node.focusCharacterId && participatingCharacters) {
          const focusChar = participatingCharacters.find(c => c.id === node.focusCharacterId);
          if (focusChar) {
              focusCharacterInfo = `\n\n本场景主要聚焦于角色：${focusChar.name}。请确保故事围绕${focusChar.name}展开，突出其性格特点和背景故事。`;
          }
      }
      
      // 检查当前节点是否有选项
      const hasOptions = node.options && node.options.length > 0;
      const optionsHint = hasOptions 
        ? `\n\nIMPORTANT: This scene has user choices available. You should ONLY narrate the current scene outcome based on the prompt. DO NOT continue to the next scene or generate content for subsequent nodes. Stop after narrating the current scene and wait for the user to make a choice.`
        : `\n\nThis scene has no user choices, so this is the end of this branch of the story.`;
      
      const prompt = `
      CURRENT SCENE: "${node.title}"
      SCENE PROMPT: "${node.prompt}"
      USER CHOICE: "${choiceText || 'Scene Start'}"
      ${characterInfo}
      ${focusCharacterInfo}
      
      Narrate the story outcome based on the prompt and user choice. 
      Be immersive and descriptive.
      ${participatingCharacters && participatingCharacters.length > 0 ? 'Focus on the participating characters and their interactions.' : ''}
      ${optionsHint}
      `;

      // --- 对话风格注入 ---
      const dialogueStyle = this.settings?.dialogueStyle || 'mobile-chat';
      const styleInstruction = getDialogueStyleInstruction(dialogueStyle);
      // --------------------

      const narratorChar: Character = {
          id: 'narrator_temp',
          name: 'Narrator',
          role: 'Narrator',
          age: 0,
          bio: 'System Narrator',
          avatarUrl: '', backgroundUrl: '', themeColor: '', colorAccent: '', firstMessage: '', voiceName: '',
          systemInstruction: `You are the interactive story narrator. ${scenarioContext}${characterInfo ? `\n\n${characterInfo}` : ''}${styleInstruction}`
      };

      let historyForGen = history;
      if (choiceText && history.length > 0) {
          const lastMsg = history[history.length - 1];
          if (lastMsg.role === 'user' && lastMsg.text === choiceText) {
              historyForGen = history.slice(0, -1);
          }
      }

      return this.sendMessageStream(narratorChar, historyForGen, prompt, userProfile);
  }

  async generateSceneDescription(history: Message[]): Promise<string | null> {
      const prompt = "Summarize the current visual setting and atmosphere of the story based on the last few messages. Keep it concise (1-2 sentences), focusing on visual elements for image generation.";
      const context = history.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');
      return this.generateText(`${prompt}\n\nSTORY CONTEXT:\n${context}`);
  }

  async generateWisdomEcho(history: Message[], characterName: string): Promise<string | null> {
      const prompt = `Analyze the conversation history. Extract a single, profound, and memorable quote (max 30 words) that represents the core wisdom or emotional comfort provided by ${characterName}. Output ONLY the quote.`;
      const context = history.map(m => `${m.role}: ${m.text}`).join('\n');
      return this.generateText(`${prompt}\n\nCONVERSATION:\n${context}`);
  }

  // --- NEW: Mirror Insight ---
  async generateMirrorInsight(journalContent: string, pastEntries: string[]): Promise<string | null> {
      const prompt = `You are the "Mirror of Truth" (本我镜像). Analyze the user's journal entry and their past patterns (if any).
      Your goal is to provide a sharp, psychological insight about their subconscious desires, fears, or hidden strengths.
      
      Style Guidelines:
      - Be objective but supportive.
      - Be slightly mysterious, like a tarot reading or a Jungian analysis.
      - Keep it under 50 words.
      - Speak in Chinese.
      `;
      const context = `CURRENT ENTRY: ${journalContent}\n\nPAST ENTRIES CONTEXT:\n${pastEntries.join('\n')}`;
      
      try {
          return await this.generateText(`${prompt}\n\nCONTEXT:\n${context}`);
      } catch (e) {
          console.error("Mirror insight failed", e);
          return null;
      }
  }

  async generateMoodImage(text: string, worldStyle?: string): Promise<string | null> {
      const prompt = this.constructMoodPrompt(text, worldStyle);
      return this.generateImageFromPrompt(prompt, '16:9');
  }

  async generateChronosLetter(sender: Character, userProfile: UserProfile, journalEntries: JournalEntry[]): Promise<{subject: string, content: string} | null> {
      const randomEntry = journalEntries.length > 0 ? journalEntries[Math.floor(Math.random() * journalEntries.length)] : null;
      const memoryContext = randomEntry ? `I remember you wrote about "${randomEntry.title}"...` : '';

      const prompt = `Write a warm, personal letter to ${userProfile.nickname}.
      You haven't seen them in a while. 
      Mention something specific about their journey or the "memory" provided below to show you care.
      MEMORY CONTEXT: ${memoryContext}
      Output JSON with "subject" and "content".`;

      const system = `You are ${sender.name} (${sender.role}). ${sender.systemInstruction}`;
      
      try {
          const text = await this.generateText(prompt, system, true);
          const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
          return JSON.parse(jsonStr);
      } catch (e) {
          console.error("Letter generation failed", e);
          return null;
      }
  }

  async analyzeImageForEra(base64Image: string): Promise<{name: string, description: string} | null> {
    const providers = this.getPrioritizedProviders('text');
    if (!providers.includes('gemini') && !this.settings?.enableFallback) return null;

    const config = this.getConfigForProvider('gemini');
    const effectiveKey = config?.apiKey || process.env.API_KEY;
    if (!effectiveKey) return null;
    
    const model = 'gemini-2.5-flash';
    this.log('analyzeImageForEra', 'request', 'Image analysis', model, 'gemini');
    
    return this.retry(async () => {
        const client = new GoogleGenAI({apiKey: effectiveKey});
        const response = await client.models.generateContent({
            model: model,
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image.split(',')[1] } },
                    { text: "Analyze this image. Suggest a creative title (name) and a short atmospheric description for a fictional world or era based on it. Output JSON with 'name' and 'description' keys. The content MUST be in Chinese." }
                ]
            },
            config: { responseMimeType: "application/json" }
        });

        if (response.text) {
             const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
             return JSON.parse(jsonStr);
        }
        return null;
    });
  }

  // --- Daily Greeting Generation ---
  async generateDailyGreeting(recentEntries: JournalEntry[], userName?: string): Promise<{greeting: string, question: string} | null> {
    console.log("========== [GeminiService] 生成每日问候 ==========");
    console.log(`[GeminiService] 最近日记数量: ${recentEntries.length}, 用户名: ${userName || '未提供'}`);
    
    const providers = this.getPrioritizedProviders('text');
    let lastError: Error | null = null;

    // 如果没有任何可用的 provider，直接返回默认问候
    if (!providers || providers.length === 0) {
        console.warn("[GeminiService] 没有可用的 provider，使用默认问候");
        return {
            greeting: recentEntries.length === 0 
                ? '欢迎来到现实记录。这里是你的内心世界，记录下每一个真实的瞬间。'
                : '你好，我注意到你最近记录了一些想法。继续探索你的内心世界吧。',
            question: recentEntries.length === 0
                ? '今天有什么让你印象深刻的事吗？'
                : '今天想记录些什么新的想法呢？'
        };
    }

    for (const provider of providers) {
        try {
            const config = this.getConfigForProvider(provider);
            const effectiveKey = config?.apiKey || (provider === 'gemini' ? process.env.API_KEY : '');
            
            // 如果没有配置或 API key，跳过这个 provider，继续尝试下一个
            if (!config || !effectiveKey) {
                console.warn(`[GeminiService] ${provider} provider 配置缺失或 API key 不存在，跳过`);
                continue;
            }

            this.log('generateDailyGreeting', 'attempt', { provider }, config.modelName || 'default');

            // 构建提示词
            let prompt = '';
            let systemInstruction = '';

            // 构建最近日记上下文
            let recentEntriesContext = '';
            if (recentEntries.length > 0) {
                recentEntriesContext = recentEntries.slice(-3).map((entry, index) => 
                    `日记${index + 1}（${new Date(entry.timestamp).toLocaleDateString()}）：\n标题：${entry.title}\n内容：${entry.content.substring(0, 300)}${entry.content.length > 300 ? '...' : ''}`
                ).join('\n\n');
            } else {
                recentEntriesContext = '暂无日记记录';
            }

            // 使用新的提示词模板
            systemInstruction = `You are a gentle, philosophical AI companion in the "HeartSphere" world.
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

            prompt = '请生成问候和问题。';

            const responseText = await this.executeTextGeneration(provider, prompt, systemInstruction, true);
            
            // 解析JSON响应
            const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(jsonStr);
            
            console.log("[GeminiService] 问候生成成功:", {
                greetingLength: result.greeting?.length || 0,
                questionLength: result.question?.length || 0
            });
            
            this.log('generateDailyGreeting', 'success', { 
                hasGreeting: !!result.greeting, 
                hasQuestion: !!result.question 
            }, config.modelName || 'default', provider);
            
            return {
                greeting: result.greeting || '你好，今天想记录些什么呢？',
                question: result.prompt || result.question || '今天有什么让你印象深刻的事吗？'
            };
        } catch (e: any) {
            console.warn(`[GeminiService] generateDailyGreeting 在 ${provider} 上失败:`, e?.message || e);
            this.log('generateDailyGreeting', 'error_fallback', { provider, error: e });
            lastError = e;
            // 继续尝试下一个 provider
            continue;
        }
    }
    
    // 如果所有provider都失败，返回默认问候（永远不会抛出错误）
    console.warn("[GeminiService] 所有 provider 都失败，使用默认问候", lastError ? `最后错误: ${lastError.message}` : '');
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

export const geminiService = new GeminiService();