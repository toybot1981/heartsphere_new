/**
 * 时间情绪识别器
 * 基于时间段、周期、季节等时间因素识别情绪
 */

import {
  EmotionType,
  EmotionAnalysisResponse,
} from '../types/EmotionTypes';

/**
 * 时间段情绪模式
 */
interface TimeBasedEmotionPattern {
  hour: number; // 0-23
  typicalEmotions: EmotionType[];
  emotionWeights: Record<EmotionType, number>;
}

/**
 * 周期情绪模式
 */
interface WeeklyEmotionPattern {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  typicalEmotions: EmotionType[];
  emotionWeights: Record<EmotionType, number>;
}

/**
 * 季节性情绪模式
 */
interface SeasonalEmotionPattern {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  typicalEmotions: EmotionType[];
  emotionWeights: Record<EmotionType, number>;
}

/**
 * 时间段情绪模式
 */
const timeBasedEmotionPatterns: TimeBasedEmotionPattern[] = [
  {
    hour: 6, // 早晨
    typicalEmotions: [EmotionType.PEACEFUL, EmotionType.HOPEFUL, EmotionType.CALM],
    emotionWeights: {
      [EmotionType.PEACEFUL]: 0.4,
      [EmotionType.HOPEFUL]: 0.3,
      [EmotionType.CALM]: 0.3,
    },
  },
  {
    hour: 12, // 中午
    typicalEmotions: [EmotionType.HAPPY, EmotionType.CONTENT],
    emotionWeights: {
      [EmotionType.HAPPY]: 0.5,
      [EmotionType.CONTENT]: 0.5,
    },
  },
  {
    hour: 18, // 傍晚
    typicalEmotions: [EmotionType.RELAXED, EmotionType.CONTENT],
    emotionWeights: {
      [EmotionType.RELAXED]: 0.6,
      [EmotionType.CONTENT]: 0.4,
    },
  },
  {
    hour: 22, // 深夜
    typicalEmotions: [EmotionType.LONELY, EmotionType.THOUGHTFUL, EmotionType.SAD],
    emotionWeights: {
      [EmotionType.LONELY]: 0.4,
      [EmotionType.THOUGHTFUL]: 0.3,
      [EmotionType.SAD]: 0.3,
    },
  },
];

/**
 * 周期情绪模式
 */
const weeklyEmotionPatterns: WeeklyEmotionPattern[] = [
  {
    dayOfWeek: 1, // Monday
    typicalEmotions: [EmotionType.ANXIOUS, EmotionType.TIRED],
    emotionWeights: {
      [EmotionType.ANXIOUS]: 0.5,
      [EmotionType.TIRED]: 0.5,
    },
  },
  {
    dayOfWeek: 5, // Friday
    typicalEmotions: [EmotionType.HAPPY, EmotionType.EXCITED],
    emotionWeights: {
      [EmotionType.HAPPY]: 0.6,
      [EmotionType.EXCITED]: 0.4,
    },
  },
  {
    dayOfWeek: 0, // Sunday
    typicalEmotions: [EmotionType.RELAXED, EmotionType.PEACEFUL],
    emotionWeights: {
      [EmotionType.RELAXED]: 0.5,
      [EmotionType.PEACEFUL]: 0.5,
    },
  },
];

/**
 * 季节性情绪模式
 */
const seasonalEmotionPatterns: SeasonalEmotionPattern[] = [
  {
    season: 'winter',
    typicalEmotions: [EmotionType.SAD, EmotionType.LONELY],
    emotionWeights: {
      [EmotionType.SAD]: 0.5,
      [EmotionType.LONELY]: 0.5,
    },
  },
  {
    season: 'spring',
    typicalEmotions: [EmotionType.HAPPY, EmotionType.HOPEFUL],
    emotionWeights: {
      [EmotionType.HAPPY]: 0.6,
      [EmotionType.HOPEFUL]: 0.4,
    },
  },
  {
    season: 'summer',
    typicalEmotions: [EmotionType.EXCITED, EmotionType.HAPPY],
    emotionWeights: {
      [EmotionType.EXCITED]: 0.5,
      [EmotionType.HAPPY]: 0.5,
    },
  },
  {
    season: 'autumn',
    typicalEmotions: [EmotionType.THOUGHTFUL, EmotionType.CALM],
    emotionWeights: {
      [EmotionType.THOUGHTFUL]: 0.5,
      [EmotionType.CALM]: 0.5,
    },
  },
];

/**
 * 时间情绪识别器类
 */
export class TimeEmotionRecognizer {
  /**
   * 基于时间分析情绪
   */
  async analyzeFromTime(
    timeOfDay?: number,
    dayOfWeek?: number,
    season?: 'spring' | 'summer' | 'autumn' | 'winter'
  ): Promise<EmotionAnalysisResponse | null> {
    const now = new Date();
    const hour = timeOfDay ?? now.getHours();
    const day = dayOfWeek ?? now.getDay();
    const currentSeason = season ?? this.getCurrentSeason(now);
    
    // 获取时间段模式
    const timePattern = this.getTimePattern(hour);
    
    // 获取周期模式
    const weeklyPattern = this.getWeeklyPattern(day);
    
    // 获取季节模式
    const seasonalPattern = this.getSeasonalPattern(currentSeason);
    
    // 综合计算情绪得分
    const emotionScores: Record<EmotionType, number> = {} as any;
    
    // 初始化得分
    Object.values(EmotionType).forEach(emotion => {
      emotionScores[emotion] = 0;
    });
    
    // 时间段得分（权重0.4）
    if (timePattern) {
      Object.entries(timePattern.emotionWeights).forEach(([emotion, weight]) => {
        emotionScores[emotion as EmotionType] = (emotionScores[emotion as EmotionType] || 0) + weight * 0.4;
      });
    }
    
    // 周期得分（权重0.3）
    if (weeklyPattern) {
      Object.entries(weeklyPattern.emotionWeights).forEach(([emotion, weight]) => {
        emotionScores[emotion as EmotionType] = (emotionScores[emotion as EmotionType] || 0) + weight * 0.3;
      });
    }
    
    // 季节得分（权重0.3）
    if (seasonalPattern) {
      Object.entries(seasonalPattern.emotionWeights).forEach(([emotion, weight]) => {
        emotionScores[emotion as EmotionType] = (emotionScores[emotion as EmotionType] || 0) + weight * 0.3;
      });
    }
    
    // 选择得分最高的情绪
    const primaryEmotion = Object.entries(emotionScores)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionType;
    
    if (!primaryEmotion || emotionScores[primaryEmotion] < 0.2) {
      return null; // 时间因素不明显
    }
    
    // 计算置信度
    const maxScore = emotionScores[primaryEmotion];
    const confidence = Math.min(0.7, Math.max(0.4, maxScore));
    
    return {
      primaryEmotion,
      intensity: maxScore > 0.5 ? 'moderate' : 'mild',
      confidence,
      emotionTags: ['时间模式'],
      keyPhrases: [],
      reasoning: `基于时间段（${hour}点）、周期（${this.getDayName(day)}）和季节（${currentSeason}）分析，推断典型情绪为${primaryEmotion}。`,
    };
  }

  /**
   * 获取时间段模式
   */
  private getTimePattern(hour: number): TimeBasedEmotionPattern | null {
    // 找到最接近的时间段
    let closestPattern = timeBasedEmotionPatterns[0];
    let minDiff = Math.abs(hour - closestPattern.hour);
    
    for (const pattern of timeBasedEmotionPatterns) {
      const diff = Math.abs(hour - pattern.hour);
      if (diff < minDiff) {
        minDiff = diff;
        closestPattern = pattern;
      }
    }
    
    // 如果差异太大，返回null
    if (minDiff > 6) {
      return null;
    }
    
    return closestPattern;
  }

  /**
   * 获取周期模式
   */
  private getWeeklyPattern(dayOfWeek: number): WeeklyEmotionPattern | null {
    return weeklyEmotionPatterns.find(p => p.dayOfWeek === dayOfWeek) || null;
  }

  /**
   * 获取季节模式
   */
  private getSeasonalPattern(season: string): SeasonalEmotionPattern | null {
    return seasonalEmotionPatterns.find(p => p.season === season) || null;
  }

  /**
   * 获取当前季节
   */
  private getCurrentSeason(date: Date): 'spring' | 'summer' | 'autumn' | 'winter' {
    const month = date.getMonth(); // 0-11
    if (month >= 2 && month <= 4) {
      return 'spring';
    } else if (month >= 5 && month <= 7) {
      return 'summer';
    } else if (month >= 8 && month <= 10) {
      return 'autumn';
    } else {
      return 'winter';
    }
  }

  /**
   * 获取星期名称
   */
  private getDayName(dayOfWeek: number): string {
    const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return names[dayOfWeek] || '未知';
  }
}



