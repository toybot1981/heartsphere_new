/**
 * 行为情绪识别器
 * 通过分析用户行为模式识别情绪
 */

import {
  EmotionType,
  EmotionAnalysisResponse,
  InteractionFrequencyAnalysis,
  InteractionDurationAnalysis,
  ActivityAnalysis,
} from '../types/EmotionTypes';

/**
 * 交互记录
 */
export interface Interaction {
  id: string;
  userId: number;
  type: 'message' | 'click' | 'view' | 'scroll' | 'other';
  timestamp: number;
  duration?: number; // 交互时长（毫秒）
  metadata?: any;
}

/**
 * 行为情绪识别器类
 */
export class BehaviorEmotionRecognizer {
  /**
   * 分析交互频率
   */
  analyzeInteractionFrequency(
    interactions: Interaction[],
    period: 'day' | 'week' | 'month' = 'week'
  ): InteractionFrequencyAnalysis {
    const periodMs = this.getPeriodMs(period);
    const now = Date.now();
    const periodStart = now - periodMs;
    
    // 当前期间的交互次数
    const currentInteractions = interactions.filter(i => i.timestamp >= periodStart);
    const currentFrequency = currentInteractions.length;
    
    // 历史平均交互次数（使用更早的数据）
    const historicalStart = periodStart - periodMs * 3; // 往前推3个周期
    const historicalInteractions = interactions.filter(
      i => i.timestamp >= historicalStart && i.timestamp < periodStart
    );
    const averageFrequency = historicalInteractions.length / 3;
    
    // 计算偏离度
    const deviation = averageFrequency > 0
      ? ((currentFrequency - averageFrequency) / averageFrequency) * 100
      : 0;
    
    // 判断趋势
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (deviation > 10) {
      trend = 'increasing';
    } else if (deviation < -10) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    // 推断情绪指示
    let emotionIndicator: EmotionType | undefined;
    if (deviation < -30) {
      // 交互频率明显下降，可能情绪低落
      emotionIndicator = EmotionType.SAD;
    } else if (deviation > 30) {
      // 交互频率明显上升，可能情绪积极
      emotionIndicator = EmotionType.HAPPY;
    }
    
    return {
      period,
      currentFrequency,
      averageFrequency,
      trend,
      deviation,
      emotionIndicator,
    };
  }

  /**
   * 分析交互时长
   */
  analyzeInteractionDuration(interactions: Interaction[]): InteractionDurationAnalysis {
    // 过滤有时长记录的交互
    const interactionsWithDuration = interactions.filter(i => i.duration !== undefined);
    
    if (interactionsWithDuration.length === 0) {
      return {
        averageDuration: 0,
        recentAverageDuration: 0,
        trend: 'stable',
      };
    }
    
    // 最近10次交互
    const recentInteractions = interactionsWithDuration
      .slice(0, 10)
      .filter(i => i.duration !== undefined) as Array<Interaction & { duration: number }>;
    
    const recentAvg = recentInteractions.length > 0
      ? recentInteractions.reduce((sum, i) => sum + i.duration!, 0) / recentInteractions.length
      : 0;
    
    // 历史平均
    const historicalAvg = interactionsWithDuration.reduce(
      (sum, i) => sum + (i.duration || 0),
      0
    ) / interactionsWithDuration.length;
    
    // 判断趋势
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (recentAvg > historicalAvg * 1.1) {
      trend = 'increasing';
    } else if (recentAvg < historicalAvg * 0.9) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    // 推断情绪指示
    let emotionIndicator: EmotionType | undefined;
    if (recentAvg < historicalAvg * 0.7) {
      // 交互时长明显缩短，可能情绪不佳
      emotionIndicator = EmotionType.SAD;
    } else if (recentAvg > historicalAvg * 1.3) {
      // 交互时长明显增加，可能情绪积极
      emotionIndicator = EmotionType.HAPPY;
    }
    
    return {
      averageDuration: historicalAvg,
      recentAverageDuration: recentAvg,
      trend,
      emotionIndicator,
    };
  }

  /**
   * 分析活跃度
   */
  analyzeActivity(interactions: Interaction[]): ActivityAnalysis {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const weekMs = 7 * dayMs;
    
    // 最近一周的交互
    const recentInteractions = interactions.filter(
      i => i.timestamp >= now - weekMs
    );
    
    // 计算最近活跃度（基于最近一周的交互次数）
    const recentActivity = Math.min(100, (recentInteractions.length / 50) * 100);
    
    // 历史平均活跃度（使用更早的数据）
    const historicalStart = now - weekMs * 4;
    const historicalInteractions = interactions.filter(
      i => i.timestamp >= historicalStart && i.timestamp < now - weekMs
    );
    const historicalAverage = Math.min(100, (historicalInteractions.length / (50 * 3)) * 100);
    
    // 判断趋势
    let trend: 'increasing' | 'decreasing' | 'stable';
    if (recentActivity > historicalAverage * 1.1) {
      trend = 'increasing';
    } else if (recentActivity < historicalAverage * 0.9) {
      trend = 'decreasing';
    } else {
      trend = 'stable';
    }
    
    // 推断情绪指示
    let emotionIndicator: EmotionType | undefined;
    if (recentActivity < historicalAverage * 0.7) {
      emotionIndicator = EmotionType.SAD;
    } else if (recentActivity > historicalAverage * 1.3) {
      emotionIndicator = EmotionType.HAPPY;
    }
    
    // 最后活跃时间
    const lastActiveTime = interactions.length > 0
      ? Math.max(...interactions.map(i => i.timestamp))
      : now;
    
    const daysSinceLastActive = (now - lastActiveTime) / dayMs;
    
    return {
      recentActivity,
      historicalAverage,
      trend,
      emotionIndicator,
      lastActiveTime,
      daysSinceLastActive,
    };
  }

  /**
   * 基于行为分析情绪
   */
  async analyzeFromBehavior(
    interactions: Interaction[]
  ): Promise<EmotionAnalysisResponse | null> {
    // 分析交互频率
    const frequencyAnalysis = this.analyzeInteractionFrequency(interactions);
    
    // 分析交互时长
    const durationAnalysis = this.analyzeInteractionDuration(interactions);
    
    // 分析活跃度
    const activityAnalysis = this.analyzeActivity(interactions);
    
    // 综合判断情绪
    const emotionIndicators = [
      frequencyAnalysis.emotionIndicator,
      durationAnalysis.emotionIndicator,
      activityAnalysis.emotionIndicator,
    ].filter(Boolean) as EmotionType[];
    
    if (emotionIndicators.length === 0) {
      return null;
    }
    
    // 选择最常见的情绪
    const emotionCounts: Record<EmotionType, number> = {} as any;
    emotionIndicators.forEach(emotion => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });
    
    const primaryEmotion = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionType;
    
    if (!primaryEmotion) {
      return null;
    }
    
    // 计算置信度（基于多个指标的一致性）
    const confidence = emotionIndicators.filter(e => e === primaryEmotion).length / emotionIndicators.length;
    
    return {
      primaryEmotion,
      intensity: confidence > 0.6 ? 'moderate' : 'mild',
      confidence: Math.max(0.4, confidence),
      emotionTags: ['行为分析'],
      keyPhrases: [],
      reasoning: `基于交互频率、时长和活跃度分析，推断用户情绪为${primaryEmotion}。`,
    };
  }

  /**
   * 获取周期毫秒数
   */
  private getPeriodMs(period: 'day' | 'week' | 'month'): number {
    const dayMs = 24 * 60 * 60 * 1000;
    switch (period) {
      case 'day':
        return dayMs;
      case 'week':
        return dayMs * 7;
      case 'month':
        return dayMs * 30;
      default:
        return dayMs * 7;
    }
  }
}



