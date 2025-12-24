/**
 * GeminiService 兼容层
 * 将 geminiService 的方法委托给 aiService，保持向后兼容
 * 
 * @deprecated 请直接使用 aiService 代替 geminiService
 */

import { aiService } from './AIService';
import { AIConfigManager } from './config';
import { adapterManager } from './AdapterManager';
import { Character, Message, UserProfile, JournalEntry, CustomScenario, StoryNode, AppSettings, DebugLog } from '../../types';
import { GenerateContentResponse } from '@google/genai';
import { UserAIConfig } from './types';

/**
 * GeminiService 兼容类
 * 将所有方法委托给 aiService 和业务服务
 */
class GeminiServiceCompat {
  private logCallback: ((log: DebugLog) => void) | null = null;
  private chatSessions: Map<string, any> = new Map();

  /**
   * 将 AppSettings 转换为 UserAIConfig
   */
  private convertAppSettingsToUserAIConfig(settings: AppSettings): Partial<UserAIConfig> {
    const config: Partial<UserAIConfig> = {
      mode: 'local', // AppSettings 使用本地配置模式
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

    return config;
  }

  /**
   * 更新配置
   * @deprecated 使用 aiService.updateUserConfig 代替
   */
  updateConfig(settings: AppSettings): void {
    try {
      // 将 AppSettings 转换为 UserAIConfig
      const userConfig = this.convertAppSettingsToUserAIConfig(settings);
      
      // 更新 AIService 配置
      aiService.updateUserConfig(userConfig).catch(error => {
        console.error('[GeminiServiceCompat] Failed to update AIService config:', error);
      });

      // 更新本地 API Keys
      if (userConfig.localApiKeys) {
        AIConfigManager.saveLocalApiKeys(userConfig.localApiKeys as any);
      }

      // 重新初始化适配器
      adapterManager.reinitialize();
    } catch (error) {
      console.error('[GeminiServiceCompat] updateConfig failed:', error);
    }
  }

  /**
   * 设置日志回调
   * @deprecated 日志功能已迁移到 AIService
   */
  setLogCallback(callback: ((log: DebugLog) => void) | null): void {
    this.logCallback = callback;
    // 注意：AIService 目前没有日志回调功能，这里只是保存回调
    // 如果需要，可以在 AIService 中添加日志功能
    if (callback) {
      console.warn('[GeminiServiceCompat] setLogCallback: 日志功能已迁移，回调已保存但可能不会触发');
    }
  }

  /**
   * 重置会话
   * @deprecated 会话管理已迁移到 AIService
   */
  resetSession(characterId: string): void {
    this.chatSessions.delete(characterId);
    // 注意：AIService 目前没有会话管理功能
    // 如果需要，可以在 AIService 中添加会话管理
    console.warn('[GeminiServiceCompat] resetSession: 会话管理已迁移，本地会话已清除');
  }

  /**
   * 发送消息流
   * @deprecated 使用 aiService.generateTextStream 代替
   */
  async sendMessageStream(
    character: Character,
    history: Message[],
    userMessage: string,
    userProfile: UserProfile | null
  ): Promise<AsyncIterable<GenerateContentResponse>> {
    console.warn('[GeminiServiceCompat] sendMessageStream 已弃用，请使用 aiService.generateTextStream');
    
    // 将消息历史转换为 AIService 格式
    const messages = history.map(m => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text
    }));

    // 构建系统指令
    let systemInstruction = character.systemInstruction || '';
    if (character.mbti) systemInstruction += `\nMBTI: ${character.mbti}`;
    if (character.speechStyle) systemInstruction += `\nSpeaking Style: ${character.speechStyle}`;
    if (character.catchphrases) systemInstruction += `\nCommon Phrases: ${character.catchphrases.join(', ')}`;
    if (character.secrets) systemInstruction += `\nSecrets: ${character.secrets}`;

    // 使用 AIService 的流式生成
    let fullContent = '';
    const chunks: string[] = [];
    
    await aiService.generateTextStream(
      {
        prompt: userMessage,
        systemInstruction,
        messages,
      },
      (chunk) => {
        if (chunk.content) {
          fullContent += chunk.content;
          chunks.push(chunk.content);
        }
      }
    );

    // 转换为 GenerateContentResponse 格式（简化版）
    // 注意：这是一个简化的实现，可能不完全兼容原始格式
    return (async function* () {
      for (const chunk of chunks) {
        yield {
          text: () => chunk,
          candidates: [{
            content: {
              parts: [{ text: chunk }]
            }
          }]
        } as any;
      }
    })();
  }

  /**
   * 生成角色（从提示词）
   * @deprecated 使用 aiService.businessServices.character.generateCharacterFromPrompt 代替
   */
  async generateCharacterFromPrompt(prompt: string, eraName: string): Promise<Character | null> {
    return aiService.businessServices.character.generateCharacterFromPrompt(prompt, eraName);
  }

  /**
   * 生成主线剧情
   * @deprecated 使用 aiService.businessServices.story.generateMainStory 代替
   */
  async generateMainStory(
    eraName: string,
    eraDescription: string,
    characters: Array<{name: string, role: string, bio: string}>,
    optionalPrompt?: string
  ): Promise<any> {
    return aiService.businessServices.story.generateMainStory(eraName, eraDescription, characters, optionalPrompt);
  }

  /**
   * 从提示词生成场景
   * @deprecated 使用 aiService.businessServices.story.generateScenarioFromPrompt 代替
   */
  async generateScenarioFromPrompt(prompt: string): Promise<CustomScenario | null> {
    return aiService.businessServices.story.generateScenarioFromPrompt(prompt);
  }

  /**
   * 根据标题、场景、简介、标签和角色生成剧本节点流程
   * @deprecated 使用 aiService.businessServices.story.generateScriptWithCharacters 代替
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
    return aiService.businessServices.story.generateScriptWithCharacters(params);
  }

  /**
   * 生成图片（从提示词）
   * @deprecated 使用 aiService.businessServices.media.generateImageFromPrompt 代替
   */
  async generateImageFromPrompt(prompt: string, aspectRatio: '1:1' | '16:9' | '9:16' | '3:4' | '4:3' = '1:1'): Promise<string | null> {
    return aiService.businessServices.media.generateImageFromPrompt(prompt, aspectRatio);
  }

  /**
   * 生成视频（从提示词）
   * @deprecated 使用 aiService.generateVideoFromPrompt 代替
   */
  async generateVideoFromPrompt(prompt: string): Promise<string | null> {
    return aiService.generateVideoFromPrompt(prompt);
  }

  /**
   * 生成角色图片
   * @deprecated 使用 aiService.businessServices.character.generateCharacterImage 代替
   */
  async generateCharacterImage(character: Character, worldStyle?: string): Promise<string | null> {
    return aiService.businessServices.character.generateCharacterImage(character, worldStyle);
  }

  /**
   * 生成用户头像
   * @deprecated 使用 aiService.businessServices.media.generateUserAvatar 代替
   */
  async generateUserAvatar(nickname: string, worldStyle?: string): Promise<string | null> {
    return aiService.businessServices.media.generateUserAvatar(nickname, worldStyle);
  }

  /**
   * 生成语音
   * @deprecated 使用 aiService.businessServices.media.generateSpeech 代替
   */
  async generateSpeech(text: string, voiceName: string): Promise<string | null> {
    return aiService.businessServices.media.generateSpeech(text, voiceName);
  }

  /**
   * 生成场景描述
   * @deprecated 使用 aiService.businessServices.scene.generateSceneDescription 代替
   */
  async generateSceneDescription(history: Message[]): Promise<string | null> {
    const formattedHistory = history.map(m => ({ role: m.role, text: m.text }));
    return aiService.businessServices.scene.generateSceneDescription(formattedHistory);
  }

  /**
   * 生成智慧回响
   * @deprecated 使用 aiService.businessServices.dialogue.generateWisdomEcho 代替
   */
  async generateWisdomEcho(history: Message[], characterName: string): Promise<string | null> {
    const formattedHistory = history.map(m => ({ role: m.role, text: m.text }));
    return aiService.businessServices.dialogue.generateWisdomEcho(formattedHistory, characterName);
  }

  /**
   * 生成镜像洞察
   * @deprecated 使用 aiService.businessServices.journal.generateMirrorInsight 代替
   */
  async generateMirrorInsight(journalContent: string, pastEntries: string[]): Promise<string | null> {
    return aiService.businessServices.journal.generateMirrorInsight(journalContent, pastEntries);
  }

  /**
   * 生成心情图片
   * @deprecated 使用 aiService.businessServices.scene.generateMoodImage 代替
   */
  async generateMoodImage(text: string, worldStyle?: string): Promise<string | null> {
    return aiService.businessServices.scene.generateMoodImage(text, worldStyle);
  }

  /**
   * 生成时间信件
   * @deprecated 使用 aiService.businessServices.letter.generateChronosLetter 代替
   */
  async generateChronosLetter(
    sender: Character,
    userProfile: UserProfile,
    journalEntries: JournalEntry[]
  ): Promise<{subject: string, content: string} | null> {
    return aiService.businessServices.letter.generateChronosLetter(
      { name: sender.name, role: sender.role || '', systemInstruction: sender.systemInstruction },
      { nickname: userProfile.nickname },
      journalEntries.map(e => ({ title: e.title }))
    );
  }

  /**
   * 分析图片生成时代信息
   * @deprecated 使用 aiService.businessServices.media.analyzeImageForEra 代替
   */
  async analyzeImageForEra(base64Image: string): Promise<{name: string, description: string} | null> {
    return aiService.businessServices.media.analyzeImageForEra(base64Image);
  }

  /**
   * 生成每日问候
   * @deprecated 使用 aiService.businessServices.journal.generateDailyGreeting 代替
   */
  async generateDailyGreeting(
    recentEntries: JournalEntry[],
    userName?: string
  ): Promise<{greeting: string, question: string} | null> {
    const formattedEntries = recentEntries.map(e => ({
      title: e.title,
      content: e.content,
      timestamp: e.timestamp
    }));
    return aiService.businessServices.journal.generateDailyGreeting(formattedEntries, userName);
  }
}

// 导出兼容实例
export const geminiService = new GeminiServiceCompat();

