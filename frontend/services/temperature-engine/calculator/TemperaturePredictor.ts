/**
 * 温度感预测器
 * 基于历史数据和趋势预测未来温度感变化
 */

import {
  TemperatureScore,
  TemperatureLevel,
  TemperatureContext,
} from '../types/TemperatureTypes';

/**
 * 温度感历史数据点
 */
interface TemperatureDataPoint {
  score: number;
  level: TemperatureLevel;
  timestamp: number;
  factors: {
    emotion: number;
    context: number;
    history: number;
    interaction: number;
  };
}

/**
 * 温度感预测结果
 */
export interface TemperaturePrediction {
  /** 预测的分数 */
  predictedScore: number;
  /** 预测的级别 */
  predictedLevel: TemperatureLevel;
  /** 置信度 (0-1) */
  confidence: number;
  /** 趋势方向 */
  trend: 'increasing' | 'decreasing' | 'stable';
  /** 趋势强度 (0-1) */
  trendStrength: number;
  /** 预测时间范围（毫秒） */
  timeRange: number;
}

/**
 * 温度感预测器类
 */
export class TemperaturePredictor {
  private history: TemperatureDataPoint[] = [];
  private maxHistorySize: number = 50;

  /**
   * 添加历史数据点
   */
  addDataPoint(score: TemperatureScore): void {
    this.history.push({
      score: score.score,
      level: score.level,
      timestamp: score.timestamp,
      factors: { ...score.factors },
    });

    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * 预测未来温度感
   */
  predict(timeRange: number = 60000): TemperaturePrediction {
    if (this.history.length < 2) {
      // 历史数据不足，返回当前值
      const last = this.history[this.history.length - 1];
      if (last) {
        return {
          predictedScore: last.score,
          predictedLevel: last.level,
          confidence: 0.3,
          trend: 'stable',
          trendStrength: 0,
          timeRange,
        };
      }
      // 完全没有历史，返回默认值
      return {
        predictedScore: 50,
        predictedLevel: 'neutral',
        confidence: 0.1,
        trend: 'stable',
        trendStrength: 0,
        timeRange,
      };
    }

    // 分析趋势
    const trend = this.analyzeTrend();
    
    // 计算预测分数
    const predictedScore = this.calculatePredictedScore(trend, timeRange);
    
    // 确定预测级别
    const predictedLevel = this.scoreToLevel(predictedScore);
    
    // 计算置信度
    const confidence = this.calculateConfidence();

    return {
      predictedScore: Math.max(0, Math.min(100, predictedScore)),
      predictedLevel,
      confidence,
      trend: trend.direction,
      trendStrength: trend.strength,
      timeRange,
    };
  }

  /**
   * 分析趋势
   */
  private analyzeTrend(): {
    direction: 'increasing' | 'decreasing' | 'stable';
    strength: number;
    slope: number;
  } {
    if (this.history.length < 2) {
      return {
        direction: 'stable',
        strength: 0,
        slope: 0,
      };
    }

    // 使用最近的数据点进行线性回归
    const recentPoints = this.history.slice(-10); // 最近10个点
    const n = recentPoints.length;

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      const x = i;
      const y = recentPoints[i].score;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }

    // 计算斜率
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    
    // 确定趋势方向
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (slope > 2) {
      direction = 'increasing';
    } else if (slope < -2) {
      direction = 'decreasing';
    } else {
      direction = 'stable';
    }

    // 计算趋势强度（斜率的绝对值）
    const strength = Math.min(1, Math.abs(slope) / 10);

    return {
      direction,
      strength,
      slope,
    };
  }

  /**
   * 计算预测分数
   */
  private calculatePredictedScore(
    trend: { direction: string; strength: number; slope: number },
    timeRange: number
  ): number {
    const lastPoint = this.history[this.history.length - 1];
    if (!lastPoint) {
      return 50; // 默认值
    }

    // 基于当前分数和趋势计算预测
    let predictedScore = lastPoint.score;

    // 根据趋势调整
    if (trend.direction === 'increasing') {
      // 上升趋势，预测会继续上升
      const increase = trend.slope * (timeRange / 60000); // 按分钟计算
      predictedScore += increase;
    } else if (trend.direction === 'decreasing') {
      // 下降趋势，预测会继续下降
      const decrease = Math.abs(trend.slope) * (timeRange / 60000);
      predictedScore -= decrease;
    }
    // stable 趋势保持当前值

    // 考虑因子变化
    const factorChange = this.estimateFactorChange();
    predictedScore += factorChange * 20; // 因子变化影响

    return predictedScore;
  }

  /**
   * 估计因子变化
   */
  private estimateFactorChange(): number {
    if (this.history.length < 2) {
      return 0;
    }

    const recent = this.history.slice(-5);
    const first = recent[0];
    const last = recent[recent.length - 1];

    // 计算各因子的平均变化
    const emotionChange = last.factors.emotion - first.factors.emotion;
    const contextChange = last.factors.context - first.factors.context;
    const historyChange = last.factors.history - first.factors.history;
    const interactionChange = last.factors.interaction - first.factors.interaction;

    // 加权平均
    return (
      emotionChange * 0.4 +
      contextChange * 0.3 +
      historyChange * 0.2 +
      interactionChange * 0.1
    );
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(): number {
    if (this.history.length < 3) {
      return 0.3; // 数据不足，置信度低
    }

    // 基于历史数据的一致性计算置信度
    const recent = this.history.slice(-10);
    const scores = recent.map(p => p.score);
    
    // 计算方差
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => {
      return sum + Math.pow(score - mean, 2);
    }, 0) / scores.length;
    
    // 方差越小，置信度越高
    const stdDev = Math.sqrt(variance);
    const confidence = Math.max(0.3, Math.min(1, 1 - stdDev / 50));

    // 数据点越多，置信度越高
    const dataPointBonus = Math.min(0.2, this.history.length / 50 * 0.2);

    return Math.min(1, confidence + dataPointBonus);
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
   * 获取历史数据
   */
  getHistory(): TemperatureDataPoint[] {
    return [...this.history];
  }

  /**
   * 清空历史数据
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 设置最大历史记录大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    if (this.history.length > size) {
      this.history = this.history.slice(-size);
    }
  }
}

