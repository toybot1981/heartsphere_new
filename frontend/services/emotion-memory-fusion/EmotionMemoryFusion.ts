/**
 * 情绪与记忆融合系统
 * 将情绪感知和记忆系统结合，提供更个性化的交互
 */

import { EmotionSystem } from '../emotion-system/EmotionSystem';
import { MemorySystem } from '../memory-system/MemorySystem';
import { EmotionRecord, EmotionType } from '../emotion-system/types/EmotionTypes';
import { UserMemory, MemoryType } from '../memory-system/types/MemoryTypes';
import { EmotionResponseGenerator } from '../emotion-system/response/EmotionResponseGenerator';

/**
 * 融合上下文
 */
export interface FusionContext {
  userId: number;
  currentEmotion?: EmotionType;
  conversationHistory?: string[];
  userProfile?: any;
}

/**
 * 个性化建议
 */
export interface PersonalizedSuggestion {
  type: 'greeting' | 'response' | 'care' | 'recommendation';
  content: string;
  relatedMemories?: UserMemory[];
  emotionContext?: EmotionType;
}

/**
 * 情绪与记忆融合系统类
 */
export class EmotionMemoryFusion {
  private emotionSystem: EmotionSystem;
  private memorySystem: MemorySystem;
  private responseGenerator: EmotionResponseGenerator;

  constructor(
    emotionSystem: EmotionSystem,
    memorySystem: MemorySystem
  ) {
    this.emotionSystem = emotionSystem;
    this.memorySystem = memorySystem;
    this.responseGenerator = new EmotionResponseGenerator();
  }

  /**
   * 生成个性化问候
   */
  async generatePersonalizedGreeting(context: FusionContext): Promise<string> {
    // 获取相关记忆
    const memories = await this.memorySystem.getRelevantMemories('问候', 3);
    
    // 获取当前情绪
    const currentEmotion = await this.emotionSystem.getCurrentEmotion();
    
    // 生成基础问候
    let greeting = '你好';
    
    // 根据记忆个性化
    const nameMemory = memories.find(m => 
      m.memoryType === MemoryType.PERSONAL_INFO && 
      m.structuredData?.key === 'name'
    );
    if (nameMemory) {
      greeting = `你好，${nameMemory.structuredData?.value}`;
    }
    
    // 根据情绪调整
    if (currentEmotion) {
      if (currentEmotion.emotionType === EmotionType.HAPPY || currentEmotion.emotionType === EmotionType.EXCITED) {
        greeting += '！今天看起来心情不错呢 ✨';
      } else if (currentEmotion.emotionType === EmotionType.SAD || currentEmotion.emotionType === EmotionType.ANXIOUS) {
        greeting += '，我在这里陪着你 💙';
      }
    }
    
    // 根据时间个性化
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      greeting = greeting.replace('你好', '早上好');
    } else if (hour >= 12 && hour < 18) {
      greeting = greeting.replace('你好', '下午好');
    } else if (hour >= 18 && hour < 22) {
      greeting = greeting.replace('你好', '晚上好');
    }
    
    return greeting;
  }

  /**
   * 生成个性化回应
   */
  async generatePersonalizedResponse(
    emotion: EmotionType,
    userMessage: string,
    context: FusionContext
  ): Promise<string> {
    // 获取相关记忆
    const relevantMemories = await this.memorySystem.getRelevantMemories(userMessage, 3);
    
    // 生成基础回应
    const emotionAnalysis: any = {
      primaryEmotion: emotion,
      intensity: 'moderate',
      confidence: 0.8,
      emotionTags: [],
      keyPhrases: [],
    };
    let response = this.responseGenerator.generateResponse(emotionAnalysis, {
      userName: context.userProfile?.name,
    });
    
    // 根据记忆增强回应
    if (relevantMemories.length > 0) {
      const memory = relevantMemories[0];
      if (memory.memoryType === MemoryType.PREFERENCE) {
        response += ` 我记得你${memory.content}，这让我更了解你了。`;
      } else if (memory.memoryType === MemoryType.IMPORTANT_MOMENT) {
        response += ` 我想起了你之前提到的${memory.content}，那一定是个特别的时刻。`;
      }
    }
    
    return response;
  }

  /**
   * 生成个性化建议
   */
  async generatePersonalizedSuggestions(context: FusionContext): Promise<PersonalizedSuggestion[]> {
    const suggestions: PersonalizedSuggestion[] = [];
    
    // 获取当前情绪
    const currentEmotion = await this.emotionSystem.getCurrentEmotion();
    
    // 获取相关记忆
    const memories = await this.memorySystem.getRelevantMemories('建议', 5);
    
    // 根据情绪生成建议
    if (currentEmotion) {
      if (currentEmotion.emotionType === EmotionType.SAD || currentEmotion.emotionType === EmotionType.ANXIOUS) {
        suggestions.push({
          type: 'care',
          content: this.responseGenerator.generateCaringMessage(currentEmotion.emotionType),
          emotionContext: currentEmotion.emotionType,
        });
      }
      
      // 根据记忆推荐活动
      const preferenceMemories = memories.filter(m => m.memoryType === MemoryType.PREFERENCE);
      if (preferenceMemories.length > 0) {
        const preference = preferenceMemories[0];
        suggestions.push({
          type: 'recommendation',
          content: `我记得你${preference.content}，也许现在做这些会让你感觉好一些？`,
          relatedMemories: [preference],
          emotionContext: currentEmotion.emotionType,
        });
      }
    }
    
    return suggestions;
  }

  /**
   * 关联情绪与记忆
   */
  async associateEmotionWithMemory(
    emotionRecord: EmotionRecord,
    memoryId: string
  ): Promise<void> {
    const memory = await this.memorySystem.searchMemories({
      keyword: memoryId,
      limit: 1,
    });
    
    if (memory.length > 0) {
      const mem = memory[0];
      mem.metadata = {
        ...mem.metadata,
        emotion: emotionRecord.emotionType,
      };
      await this.memorySystem.updateMemory(mem);
    }
  }

  /**
   * 获取情绪相关的记忆
   */
  async getEmotionRelatedMemories(emotion: EmotionType): Promise<UserMemory[]> {
    // 搜索包含该情绪的记忆
    const allMemories = await this.memorySystem.searchMemories({});
    return allMemories.filter(m => m.metadata?.emotion === emotion);
  }
}

