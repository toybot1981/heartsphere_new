/**
 * 陪伴式交互系统核心类
 * 负责主动关怀和陪伴交互
 */

import {
  CompanionSystemConfig,
  CareTrigger,
  CareMessage,
  ProactiveCareConfig,
} from './types/CompanionTypes';
import { CareTriggerManager } from './triggers/CareTriggerManager';
import { aiService } from '../ai';

/**
 * 陪伴式交互系统类
 */
export class CompanionSystem {
  private config: CompanionSystemConfig;
  private triggerManager: CareTriggerManager;
  private careMessages: CareMessage[] = [];

  constructor(config: CompanionSystemConfig) {
    this.config = config;
    this.triggerManager = new CareTriggerManager(config.userId);
    this.loadCareMessages();
  }

  /**
   * 检查并生成关怀消息
   */
  async checkAndGenerateCareMessages(): Promise<CareMessage[]> {
    if (!this.config.enabled || !this.config.proactiveCare.enabled) {
      return [];
    }

    const triggers = await this.triggerManager.checkAllTriggers();
    const newMessages: CareMessage[] = [];

    for (const trigger of triggers) {
      // 检查是否已经发送过类似的消息
      const existingMessage = this.careMessages.find(
        (msg) =>
          msg.trigger.type === trigger.type &&
          Date.now() - msg.timestamp < 24 * 60 * 60 * 1000 // 24小时内
      );

      if (existingMessage) {
        continue;
      }

      // 生成关怀消息
      const message = await this.generateCareMessage(trigger);
      if (message) {
        newMessages.push(message);
        this.careMessages.push(message);
      }
    }

    if (newMessages.length > 0) {
      this.saveCareMessages();
    }

    return newMessages;
  }

  /**
   * 生成关怀消息
   */
  private async generateCareMessage(trigger: CareTrigger): Promise<CareMessage | null> {
    let content = trigger.messageTemplate || '';

    // 如果没有模板，使用AI生成
    if (!content) {
      content = await this.generateCareMessageWithAI(trigger);
    }

    if (!content) {
      return null;
    }

    const message: CareMessage = {
      id: `care_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      trigger,
      content,
      timestamp: Date.now(),
      read: false,
      priority: this.getPriority(trigger),
      metadata: trigger.metadata,
    };

    return message;
  }

  /**
   * 使用AI生成关怀消息
   */
  private async generateCareMessageWithAI(trigger: CareTrigger): Promise<string> {
    try {
      const prompt = this.buildCareMessagePrompt(trigger);
      const response = await aiService.generateText({
        prompt,
        systemInstruction:
          '你是一个温暖贴心的陪伴者，擅长用温柔、关怀的语气与用户交流。',
        temperature: 0.8,
        maxTokens: 200,
      });

      return response.content || '';
    } catch (error) {
      console.error('[CompanionSystem] AI生成关怀消息失败:', error);
      return '';
    }
  }

  /**
   * 构建关怀消息提示词
   */
  private buildCareMessagePrompt(trigger: CareTrigger): string {
    const triggerDescriptions: Record<CareTrigger['type'], string> = {
      scheduled_greeting: '定期问候',
      inactivity: '长时间未互动',
      special_time: '特殊时间关怀',
      habit_time: '用户习惯时间',
      negative_emotion: '消极情绪关怀',
      milestone: '里程碑庆祝',
      anniversary: '纪念日',
      weather: '天气变化',
      proactive_suggestion: '主动建议',
    };

    const levelDescriptions: Record<string, string> = {
      gentle: '温和',
      moderate: '中等',
      strong: '强烈',
    };

    return `
请生成一条温暖贴心的关怀消息。

触发类型：${triggerDescriptions[trigger.type] || trigger.type}
关怀强度：${trigger.level ? levelDescriptions[trigger.level] : '温和'}
${trigger.duration ? `持续时间：${trigger.duration}小时` : ''}

要求：
- 语气温柔、关怀
- 简洁明了（不超过50字）
- 符合触发场景
- 不要过于正式或生硬
- 可以适当使用表情符号

请直接返回消息内容，不要包含其他说明。
`;
  }

  /**
   * 获取消息优先级
   */
  private getPriority(trigger: CareTrigger): 'low' | 'medium' | 'high' {
    if (trigger.level === 'strong') {
      return 'high';
    } else if (trigger.level === 'moderate') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * 获取未读关怀消息
   */
  getUnreadMessages(): CareMessage[] {
    return this.careMessages.filter((msg) => !msg.read);
  }

  /**
   * 标记消息为已读
   */
  markAsRead(messageId: string): void {
    const message = this.careMessages.find((msg) => msg.id === messageId);
    if (message) {
      message.read = true;
      this.saveCareMessages();
    }
  }

  /**
   * 更新最后互动时间
   */
  updateLastInteractionTime(): void {
    this.triggerManager.updateLastInteractionTime();
  }

  /**
   * 保存关怀消息
   */
  private saveCareMessages(): void {
    try {
      localStorage.setItem(
        `care_messages_${this.config.userId}`,
        JSON.stringify(this.careMessages)
      );
    } catch (error) {
      console.error('[CompanionSystem] 保存关怀消息失败:', error);
    }
  }

  /**
   * 加载关怀消息
   */
  private loadCareMessages(): void {
    try {
      const data = localStorage.getItem(`care_messages_${this.config.userId}`);
      if (data) {
        this.careMessages = JSON.parse(data);
      }
    } catch (error) {
      console.error('[CompanionSystem] 加载关怀消息失败:', error);
      this.careMessages = [];
    }
  }
}

