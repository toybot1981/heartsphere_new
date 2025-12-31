/**
 * 对话服务
 * 处理对话过程和结束
 */

import { GreetingService, GreetingContext, UserEmotion } from './GreetingService';

/**
 * 对话结束类型
 */
export type DialogueEndType =
  | 'blessing'
  | 'expectation'
  | 'caring'
  | 'encouragement';

/**
 * 对话记忆类型
 */
export type DialogueMemoryType =
  | 'summary'
  | 'emotion'
  | 'important'
  | 'milestone';

/**
 * 对话记忆
 */
export interface DialogueMemory {
  id: string;
  type: DialogueMemoryType;
  content: string;
  emotion?: UserEmotion;
  timestamp: number;
}

/**
 * 对话结束问候
 */
export const DialogueEndGreetings = {
  blessing: [
    '愿你今天过得愉快！',
    '祝你今天一切顺利！✨',
    '愿美好的一天属于你！💙',
    '愿你的每一天都充满阳光！',
  ],
  expectation: [
    '期待下次和你聊天！',
    '下次见，我会想你的！💙',
    '期待我们的下次相遇！✨',
    '再见，下次见！',
  ],
  caring: [
    '记得照顾好自己哦！',
    '要注意休息，别太累了！💙',
    '照顾好自己，有需要随时找我！',
    '记得按时吃饭，好好休息！✨',
  ],
  encouragement: [
    '相信你一定能做到的！',
    '你能行的，加油！💪',
    '相信自己，你一定可以！✨',
    '坚持住，你能做到的！💙',
  ],
};

/**
 * 对话服务类
 */
export class DialogueService {
  /**
   * 获取对话结束问候
   */
  static getEndingGreeting(type: DialogueEndType = 'caring'): string {
    const greetings = DialogueEndGreetings[type];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
  /**
   * 分析对话并生成记忆
   */
  static analyzeDialogue(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    emotion?: UserEmotion
  ): DialogueMemory[] {
    const memories: DialogueMemory[] = [];
    const now = Date.now();
    
    // 1. 生成对话总结
    const summary = this.generateSummary(messages);
    if (summary) {
      memories.push({
        id: this.generateId(),
        type: 'summary',
        content: summary,
        timestamp: now,
      });
    }
    
    // 2. 记录情绪
    if (emotion) {
      memories.push({
        id: this.generateId(),
        type: 'emotion',
        content: this.getEmotionDescription(emotion),
        emotion,
        timestamp: now,
      });
    }
    
    // 3. 标记重要内容
    const importantPoints = this.extractImportantPoints(messages);
    importantPoints.forEach(point => {
      memories.push({
        id: this.generateId(),
        type: 'important',
        content: point,
        timestamp: now,
      });
    });
    
    // 4. 标记里程碑
    const milestones = this.extractMilestones(messages);
    milestones.forEach(milestone => {
      memories.push({
        id: this.generateId(),
        type: 'milestone',
        content: milestone,
        timestamp: now,
      });
    });
    
    return memories;
  }
  
  /**
   * 生成对话总结
   */
  private static generateSummary(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string {
    const userMessages = messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) return '';
    
    // 简化总结逻辑，实际应该使用AI生成
    const topics = userMessages.map(m => m.content).slice(-3);
    return `我们聊了${topics.length}个话题`;
  }
  
  /**
   * 获取情绪描述
   */
  private static getEmotionDescription(emotion: UserEmotion): string {
    const descriptions: Record<UserEmotion, string> = {
      happy: '用户今天心情很好，感到开心和满足',
      sad: '用户今天心情不太好，有些难过',
      anxious: '用户有些焦虑，需要安慰和支持',
      calm: '用户今天很平静，状态很好',
      neutral: '用户情绪正常，没有特别的情绪波动',
    };
    
    return descriptions[emotion];
  }
  
  /**
   * 提取重要内容
   */
  private static extractImportantPoints(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string[] {
    const importantPoints: string[] = [];
    const keywords = ['想要', '希望', '目标', '计划', '决定', '承诺'];
    
    messages.forEach(message => {
      if (message.role === 'user') {
        const hasImportant = keywords.some(keyword =>
          message.content.includes(keyword)
        );
        if (hasImportant) {
          importantPoints.push(message.content);
        }
      }
    });
    
    return importantPoints.slice(0, 3); // 最多保留3个重要内容
  }
  
  /**
   * 提取里程碑
   */
  private static extractMilestones(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>
  ): string[] {
    const milestones: string[] = [];
    const milestoneKeywords = ['第一次', '终于', '成功', '完成了', '达成了'];
    
    messages.forEach(message => {
      if (message.role === 'user') {
        const hasMilestone = milestoneKeywords.some(keyword =>
          message.content.includes(keyword)
        );
        if (hasMilestone) {
          milestones.push(message.content);
        }
      }
    });
    
    return milestones.slice(0, 2); // 最多保留2个里程碑
  }
  
  /**
   * 生成对话结束消息
   */
  static generateEndingMessage(
    dialogueType: DialogueEndType = 'caring',
    hasSummary = true
  ): string {
    const greeting = this.getEndingGreeting(dialogueType);
    
    if (hasSummary) {
      return `${greeting} 记得今天的对话哦，我会记在心里 💙`;
    }
    
    return greeting;
  }
  
  /**
   * 处理对话过程 - 情感回应
   */
  static processEmotionalResponse(
    userMessage: string,
    userEmotion?: UserEmotion
  ): string {
    // 这里应该集成AI模型来生成回应
    // 简化版本，根据情绪返回预设回应
    
    if (!userEmotion) {
      // 如果没有情绪信息，尝试从消息中推断
      return this.inferEmotionAndRespond(userMessage);
    }
    
    switch (userEmotion) {
      case 'happy':
        return this.getHappyResponse();
      case 'sad':
        return this.getSadResponse();
      case 'anxious':
        return this.getAnxiousResponse();
      case 'calm':
        return this.getCalmResponse();
      default:
        return this.getNeutralResponse();
    }
  }
  
  /**
   * 推断情绪并回应
   */
  private static inferEmotionAndRespond(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (
      lowerMessage.includes('开心') ||
      lowerMessage.includes('高兴') ||
      lowerMessage.includes('快乐')
    ) {
      return this.getHappyResponse();
    }
    
    if (
      lowerMessage.includes('难过') ||
      lowerMessage.includes('不开心') ||
      lowerMessage.includes('伤心')
    ) {
      return this.getSadResponse();
    }
    
    if (
      lowerMessage.includes('担心') ||
      lowerMessage.includes('焦虑') ||
      lowerMessage.includes('害怕')
    ) {
      return this.getAnxiousResponse();
    }
    
    return this.getNeutralResponse();
  }
  
  /**
   * 开心情回应
   */
  private static getHappyResponse(): string {
    const responses = [
      '看到你开心我也很高兴！✨',
      '真为你感到开心！💙',
      '你的快乐也感染了我呢！',
      '保持这份好心情！⭐',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * 难过回应
   */
  private static getSadResponse(): string {
    const responses = [
      '抱抱你 🤗 不开心的时候，我在这里陪你',
      '如果你想倾诉，我随时都在 💙',
      '难过也没关系，我会陪着你',
      '没关系，说出来会好一些的',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * 焦虑回应
   */
  private static getAnxiousResponse(): string {
    const responses = [
      '深呼吸，慢慢来 💙',
      '不用担心，我们一起想办法',
      '焦虑是很正常的，别给自己太大压力',
      '我会一直在这里支持你，放轻松 ✨',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * 平静回应
   */
  private static getCalmResponse(): string {
    const responses = [
      '这种平静的状态真好 💙',
      '继续保持这份宁静吧',
      '平静的心境很有力量',
      '享受这份平静的时刻 ✨',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * 中性回应
   */
  private static getNeutralResponse(): string {
    const responses = [
      '嗯，我在听 💙',
      '继续说，我在听呢',
      '嗯嗯，我明白了',
      '有什么想说的都可以告诉我 ✨',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `dialogue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 构建问候上下文
   */
  static buildGreetingContext(partialContext?: Partial<GreetingContext>): GreetingContext {
    return {
      currentTime: new Date(),
      ...partialContext,
    };
  }
}

export default DialogueService;



