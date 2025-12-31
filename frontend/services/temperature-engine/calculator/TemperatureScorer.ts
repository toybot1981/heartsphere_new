/**
 * 温度感评分器
 * 根据情绪、上下文、历史等因素计算温度感评分
 */

import {
  TemperatureScore,
  TemperatureCalculationInput,
  TemperatureLevel,
  TemperatureSuggestion,
  EmotionType,
} from '../types/TemperatureTypes';
import { EmotionAnalyzer } from './EmotionAnalyzer';
import { ContextAwareness } from './ContextAwareness';

/**
 * 温度感评分器类
 */
export class TemperatureScorer {
  private emotionAnalyzer: EmotionAnalyzer;
  private contextAwareness: ContextAwareness;

  constructor() {
    this.emotionAnalyzer = new EmotionAnalyzer();
    this.contextAwareness = new ContextAwareness();
  }

  /**
   * 计算温度感评分
   */
  async calculate(input: TemperatureCalculationInput): Promise<TemperatureScore> {
    const { userEmotion, context, history } = input;

    // 1. 分析情绪因子
    const emotionFactor = await this.calculateEmotionFactor(userEmotion, history);

    // 2. 分析上下文因子
    const contextFactor = this.calculateContextFactor(context);

    // 3. 分析历史因子
    const historyFactor = this.calculateHistoryFactor(history);

    // 4. 分析交互因子
    const interactionFactor = this.calculateInteractionFactor(context);

    // 5. 综合计算温度感评分
    const score = this.computeScore({
      emotion: emotionFactor,
      context: contextFactor,
      history: historyFactor,
      interaction: interactionFactor,
    });

    // 6. 确定温度感级别
    const level = this.scoreToLevel(score);

    // 7. 生成建议
    const suggestions = this.generateSuggestions({
      score,
      level,
      emotion: emotionFactor,
      context: contextFactor,
    });

    return {
      score,
      level,
      factors: {
        emotion: emotionFactor,
        context: contextFactor,
        history: historyFactor,
        interaction: interactionFactor,
      },
      suggestions,
      timestamp: Date.now(),
    };
  }

  /**
   * 计算情绪因子
   */
  private async calculateEmotionFactor(
    userEmotion?: EmotionType,
    history?: any[]
  ): Promise<number> {
    if (!userEmotion) {
      // 如果没有提供情绪，尝试从历史中分析
      if (history && history.length > 0) {
        const lastMessage = history[history.length - 1];
        const text = typeof lastMessage === 'string' 
          ? lastMessage 
          : lastMessage?.content || '';
        
        if (text) {
          const analysis = await this.emotionAnalyzer.analyze({ text, conversationHistory: history });
          return this.emotionToScore(analysis.type, analysis.intensity);
        }
      }
      return 0.5; // 默认中性
    }

    // 根据情绪类型和强度计算得分
    return this.emotionToScore(userEmotion, 0.7); // 默认中等强度
  }

  /**
   * 情绪转分数
   */
  private emotionToScore(emotion: EmotionType, intensity: number): number {
    const baseScores: Record<EmotionType, number> = {
      happy: 0.9,
      excited: 0.95,
      calm: 0.7,
      neutral: 0.5,
      tired: 0.4,
      sad: 0.3,
      anxious: 0.35,
    };

    const baseScore = baseScores[emotion] || 0.5;
    
    // 根据强度调整
    return baseScore * (0.5 + intensity * 0.5);
  }

  /**
   * 计算上下文因子
   */
  private calculateContextFactor(context: TemperatureCalculationInput['context']): number {
    if (!context) {
      return 0.5; // 默认中性
    }

    const analysis = this.contextAwareness.analyzeContext(context);
    
    // 综合温暖度、活跃度和参与度
    return (
      analysis.warmth * 0.5 +
      analysis.activity * 0.3 +
      analysis.engagement * 0.2
    );
  }

  /**
   * 计算历史因子
   */
  private calculateHistoryFactor(history?: any[]): number {
    if (!history || history.length === 0) {
      return 0.5; // 默认中性
    }

    // 分析历史对话的情感倾向
    let positiveCount = 0;
    let negativeCount = 0;
    let totalCount = 0;

    const recentHistory = history.slice(-20); // 最近20条消息

    for (const item of recentHistory) {
      const text = typeof item === 'string' ? item : item?.content || '';
      if (!text) continue;

      // 简单的情感判断
      const lowerText = text.toLowerCase();
      if (this.isPositiveText(lowerText)) {
        positiveCount++;
      } else if (this.isNegativeText(lowerText)) {
        negativeCount++;
      }
      totalCount++;
    }

    if (totalCount === 0) {
      return 0.5;
    }

    // 计算情感倾向得分
    const positiveRatio = positiveCount / totalCount;
    const negativeRatio = negativeCount / totalCount;
    
    // 正情感增加得分，负情感降低得分
    return 0.5 + (positiveRatio - negativeRatio) * 0.4;
  }

  /**
   * 判断是否为正情感文本
   */
  private isPositiveText(text: string): boolean {
    const positiveKeywords = [
      '开心', '高兴', '快乐', '喜欢', '爱', '好', '棒', '赞',
      'happy', 'good', 'great', 'love', 'like', 'awesome',
    ];
    return positiveKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 判断是否为负情感文本
   */
  private isNegativeText(text: string): boolean {
    const negativeKeywords = [
      '难过', '伤心', '不开心', '不好', '糟糕', '讨厌',
      'sad', 'bad', 'hate', 'unhappy', 'terrible',
    ];
    return negativeKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * 计算交互因子
   */
  private calculateInteractionFactor(context: TemperatureCalculationInput['context']): number {
    if (!context) {
      return 0.5;
    }

    const { userActivity, conversation } = context;
    let score = 0.5;

    // 消息频率
    const messageCount = userActivity.messageCount;
    if (messageCount > 10) {
      score += 0.2; // 高频率交互
    } else if (messageCount < 3) {
      score -= 0.1; // 低频率交互
    }

    // 最后交互时间
    const lastInteraction = userActivity.lastInteraction;
    if (lastInteraction < 10000) { // 10秒内
      score += 0.15; // 高活跃度
    } else if (lastInteraction > 300000) { // 5分钟以上
      score -= 0.2; // 可能离开
    }

    // 对话长度
    if (conversation.length > 15) {
      score += 0.1; // 长对话通常更温暖
    }

    // 对话情感
    if (conversation.sentiment === 'positive') {
      score += 0.15;
    } else if (conversation.sentiment === 'negative') {
      score -= 0.15;
    }

    return Math.max(0, Math.min(1, score));
  }

  /**
   * 综合计算评分
   */
  private computeScore(factors: {
    emotion: number;
    context: number;
    history: number;
    interaction: number;
  }): number {
    // 权重分配
    const weights = {
      emotion: 0.4,      // 情绪最重要
      context: 0.3,       // 上下文次之
      history: 0.2,       // 历史参考
      interaction: 0.1,   // 交互补充
    };

    const score =
      factors.emotion * weights.emotion +
      factors.context * weights.context +
      factors.history * weights.history +
      factors.interaction * weights.interaction;

    // 转换为0-100分
    return Math.round(score * 100);
  }

  /**
   * 分数转级别
   */
  private scoreToLevel(score: number): TemperatureLevel {
    if (score < 30) {
      return 'cold';
    } else if (score < 60) {
      return 'neutral';
    } else if (score < 80) {
      return 'warm';
    } else {
      return 'hot';
    }
  }

  /**
   * 生成建议
   */
  private generateSuggestions(params: {
    score: number;
    level: TemperatureLevel;
    emotion: number;
    context: number;
  }): TemperatureSuggestion[] {
    const suggestions: TemperatureSuggestion[] = [];

    // 根据温度感级别生成建议
    switch (params.level) {
      case 'cold':
        suggestions.push({
          type: 'greeting',
          priority: 'high',
          action: 'showWarmGreeting',
          params: { urgency: 'high' },
        });
        suggestions.push({
          type: 'ui',
          priority: 'high',
          action: 'adjustToWarm',
        });
        break;

      case 'neutral':
        suggestions.push({
          type: 'greeting',
          priority: 'medium',
          action: 'showFriendlyGreeting',
        });
        break;

      case 'warm':
        suggestions.push({
          type: 'expression',
          priority: 'medium',
          action: 'showWarmExpression',
        });
        suggestions.push({
          type: 'content',
          priority: 'low',
          action: 'useWarmLanguage',
        });
        break;

      case 'hot':
        suggestions.push({
          type: 'expression',
          priority: 'high',
          action: 'showExcitedExpression',
        });
        suggestions.push({
          type: 'action',
          priority: 'medium',
          action: 'showEncouragingAction',
        });
        break;
    }

    // 如果情绪因子很高，建议显示表情
    if (params.emotion > 0.7) {
      suggestions.push({
        type: 'expression',
        priority: 'high',
        action: 'showEmotionExpression',
        params: { intensity: params.emotion },
      });
    }

    // 如果上下文因子很低，建议调整UI
    if (params.context < 0.3) {
      suggestions.push({
        type: 'ui',
        priority: 'medium',
        action: 'enhanceWarmth',
      });
    }

    return suggestions;
  }
}



