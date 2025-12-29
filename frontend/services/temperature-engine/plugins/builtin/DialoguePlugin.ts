/**
 * 对话插件
 * 优化对话体验，根据温度感调整对话风格和内容
 */

import { TemperaturePlugin } from '../PluginInterface';
import { TemperatureEngine } from '../../core/TemperatureEngine';
import {
  TemperatureScore,
  EmotionAnalysis,
  TemperatureLevel,
} from '../../types/TemperatureTypes';
import { ContentAdjuster } from '../../adjusters/ContentAdjuster';

/**
 * 对话插件类
 */
export class DialoguePlugin implements TemperaturePlugin {
  id = 'dialogue';
  name = '对话插件';
  version = '1.0.0';
  description = '优化对话体验，根据温度感调整对话风格和内容';
  priority = 7;

  private engine: TemperatureEngine | null = null;
  private contentAdjuster: ContentAdjuster;
  private messageHistory: Array<{ role: 'user' | 'assistant'; content: string; timestamp: number }> = [];

  constructor() {
    this.contentAdjuster = new ContentAdjuster();
  }

  /**
   * 插件初始化
   */
  async onInit(engine: TemperatureEngine): Promise<void> {
    this.engine = engine;
    console.log('[DialoguePlugin] Initialized');
  }

  /**
   * 插件启动
   */
  async onStart(): Promise<void> {
    // 显示对话开始问候
    await this.showDialogueStartGreeting();
    console.log('[DialoguePlugin] Started');
  }

  /**
   * 消息发送时
   */
  async onMessageSent(message: string, context?: any): Promise<void> {
    // 记录消息
    this.messageHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    // 限制历史记录大小
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }

    // 根据消息内容调整温度感
    const emotion = await this.engine?.analyzeEmotion({
      text: message,
      conversationHistory: this.messageHistory,
    });

    if (emotion) {
      // 根据情绪给出回应建议
      const suggestions = this.getResponseSuggestions(emotion);
      if (suggestions.length > 0) {
        // 可以在这里触发建议显示
        console.log('[DialoguePlugin] Response suggestions:', suggestions);
      }
    }
  }

  /**
   * 消息接收时
   */
  async onMessageReceived(message: string, context?: any): Promise<void> {
    // 记录消息
    this.messageHistory.push({
      role: 'assistant',
      content: message,
      timestamp: Date.now(),
    });

    // 限制历史记录大小
    if (this.messageHistory.length > 100) {
      this.messageHistory.shift();
    }

    // 根据温度感调整接收到的消息
    const temperature = this.engine?.getCurrentTemperature();
    if (temperature && temperature.level !== 'neutral') {
      const adjustedMessage = await this.engine?.adjustContent({
        original: message,
        targetTemperature: temperature.level,
      });

      if (adjustedMessage && adjustedMessage !== message) {
        // 触发消息调整事件
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('temperatureMessageAdjusted', {
              detail: {
                original: message,
                adjusted: adjustedMessage,
                temperature: temperature.level,
              },
            })
          );
        }
      }
    }
  }

  /**
   * 温度感变化时
   */
  async onTemperatureChange(temperature: TemperatureScore): Promise<void> {
    // 如果温度感变低，可以主动关怀
    if (temperature.level === 'cold' || temperature.score < 40) {
      await this.showCaringMessage();
    }

    // 如果温度感变高，可以庆祝
    if (temperature.level === 'hot' || temperature.score > 85) {
      await this.showCelebrationMessage();
    }
  }

  /**
   * 情绪检测时
   */
  async onEmotionDetected(emotion: EmotionAnalysis): Promise<void> {
    // 根据情绪给出相应的回应
    const response = this.getEmotionResponse(emotion);
    if (response) {
      // 可以在这里触发回应显示
      console.log('[DialoguePlugin] Emotion response:', response);
    }
  }

  /**
   * 显示对话开始问候
   */
  private async showDialogueStartGreeting(): Promise<void> {
    const temperature = this.engine?.getCurrentTemperature();
    const context = this.engine?.getCurrentContext();
    
    const level = temperature?.level || 'warm';
    const greeting = this.contentAdjuster.generateGreeting(level, context || undefined);
    
    // 触发问候显示事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('temperatureDialogueStart', {
          detail: { greeting },
        })
      );
    }
  }

  /**
   * 显示关怀消息
   */
  private async showCaringMessage(): Promise<void> {
    const messages = [
      '感觉你好像有点不开心...想聊聊吗？我会陪着你的 💙',
      '如果你愿意，我随时都在这里，想说什么都可以 ✨',
      '有什么困扰的事吗？我会认真听的',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('temperatureCaringMessage', {
          detail: { message },
        })
      );
    }
  }

  /**
   * 显示庆祝消息
   */
  private async showCelebrationMessage(): Promise<void> {
    const messages = [
      '看到你开心我也很高兴！✨',
      '感受到你的好心情了！💙',
      '你的快乐也感染了我呢！⭐',
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('temperatureCelebrationMessage', {
          detail: { message },
        })
      );
    }
  }

  /**
   * 获取回应建议
   */
  private getResponseSuggestions(emotion: EmotionAnalysis): string[] {
    const suggestions: string[] = [];

    switch (emotion.type) {
      case 'happy':
        suggestions.push('看到你开心我也很高兴！✨');
        suggestions.push('感受到你的好心情了！💙');
        break;

      case 'sad':
        suggestions.push('抱抱你 🤗 不开心的时候，我在这里陪你');
        suggestions.push('如果你想倾诉，我随时都在 💙');
        break;

      case 'anxious':
        suggestions.push('深呼吸，慢慢来 💙');
        suggestions.push('不用担心，我们一起想办法');
        break;

      default:
        break;
    }

    return suggestions;
  }

  /**
   * 获取情绪回应
   */
  private getEmotionResponse(emotion: EmotionAnalysis): string | null {
    if (emotion.confidence < 0.5) {
      return null;
    }

    const responses: Record<string, string[]> = {
      happy: [
        '看到你开心我也很高兴！✨',
        '感受到你的好心情了！💙',
      ],
      sad: [
        '抱抱你 🤗 不开心的时候，我在这里陪你',
        '如果你想倾诉，我随时都在 💙',
      ],
      anxious: [
        '深呼吸，慢慢来 💙',
        '不用担心，我们一起想办法',
      ],
    };

    const emotionResponses = responses[emotion.type];
    if (emotionResponses && emotionResponses.length > 0) {
      return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
    }

    return null;
  }

  /**
   * 插件方法
   */
  methods = {
    getMessageHistory: () => [...this.messageHistory],
    
    clearMessageHistory: () => {
      this.messageHistory = [];
    },
    
    getResponseSuggestion: (emotion: EmotionAnalysis) => {
      return this.getResponseSuggestions(emotion);
    },
  };
}

