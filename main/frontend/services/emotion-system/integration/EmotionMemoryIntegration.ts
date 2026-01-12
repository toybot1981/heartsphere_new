/**
 * 情绪与记忆系统集成工具
 * 提供便捷的集成方法
 */

import { EmotionSystem } from '../EmotionSystem';
import { MemorySystem } from '../../memory-system/MemorySystem';
import { EmotionMemoryFusion } from '../../emotion-memory-fusion';
import { EmotionAnalysisRequest, EmotionSource } from '../types/EmotionTypes';
import { MemorySource } from '../../memory-system/types/MemoryTypes';

/**
 * 情绪与记忆集成配置
 */
export interface EmotionMemoryIntegrationConfig {
  userId: number;
  emotionSystem: EmotionSystem;
  memorySystem: MemorySystem;
  fusion?: EmotionMemoryFusion;
}

/**
 * 情绪与记忆集成类
 */
export class EmotionMemoryIntegration {
  private config: EmotionMemoryIntegrationConfig;
  private fusion: EmotionMemoryFusion;

  constructor(config: EmotionMemoryIntegrationConfig) {
    this.config = config;
    this.fusion = config.fusion || new EmotionMemoryFusion(
      config.emotionSystem,
      config.memorySystem
    );
  }

  /**
   * 处理用户消息（分析情绪并提取记忆）
   */
  async processUserMessage(
    text: string,
    source: EmotionSource = EmotionSource.CONVERSATION,
    sourceId?: string
  ): Promise<{
    emotion: any;
    memories: any[];
    personalizedResponse?: string;
  }> {
    // 1. 分析情绪
    const emotion = await this.config.emotionSystem.analyzeEmotion({
      text,
      source,
      context: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
      },
    });

    // 2. 提取记忆
    const memories = await this.config.memorySystem.extractAndSave({
      text,
      source: source === EmotionSource.CONVERSATION ? MemorySource.CONVERSATION :
              source === EmotionSource.JOURNAL ? MemorySource.JOURNAL :
              MemorySource.BEHAVIOR,
      sourceId,
    });

    // 3. 生成个性化回应（可选）
    let personalizedResponse: string | undefined;
    try {
      personalizedResponse = await this.fusion.generatePersonalizedResponse(
        emotion.primaryEmotion,
        text,
        {
          userId: this.config.userId,
          currentEmotion: emotion.primaryEmotion,
        }
      );
    } catch (error) {
      console.error('[EmotionMemoryIntegration] 生成个性化回应失败:', error);
    }

    return {
      emotion,
      memories,
      personalizedResponse,
    };
  }

  /**
   * 获取相关记忆用于上下文
   */
  async getRelevantMemories(context: string, limit: number = 5): Promise<any[]> {
    return this.config.memorySystem.getRelevantMemories(context, limit);
  }

  /**
   * 生成个性化问候
   */
  async generatePersonalizedGreeting(userProfile?: any): Promise<string> {
    return this.fusion.generatePersonalizedGreeting({
      userId: this.config.userId,
      userProfile,
    });
  }

  /**
   * 获取情绪趋势
   */
  async getEmotionTrend(period: 'hour' | 'day' | 'week' | 'month' = 'week') {
    return this.config.emotionSystem.analyzeTrend(period);
  }

  /**
   * 获取情绪统计
   */
  async getEmotionStatistics(period: 'day' | 'week' | 'month' = 'week') {
    return this.config.emotionSystem.getEmotionStatistics(period);
  }
}




