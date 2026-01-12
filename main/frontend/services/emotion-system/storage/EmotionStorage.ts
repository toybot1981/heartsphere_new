/**
 * 情绪存储系统
 * 负责情绪的存储、检索和管理
 */

import {
  EmotionRecord,
  EmotionType,
  EmotionSource,
  EmotionTrend,
} from '../types/EmotionTypes';

/**
 * 情绪存储接口
 */
export interface IEmotionStorage {
  save(record: EmotionRecord): Promise<void>;
  getById(id: string): Promise<EmotionRecord | null>;
  getByUserId(userId: number, options?: {
    startDate?: number;
    endDate?: number;
    source?: EmotionSource;
    emotionType?: EmotionType;
    limit?: number;
  }): Promise<EmotionRecord[]>;
  delete(id: string): Promise<void>;
  clear(userId: number): Promise<void>;
}

/**
 * 本地存储实现（使用localStorage）
 */
export class LocalEmotionStorage implements IEmotionStorage {
  private storageKey = 'emotion_records';
  private maxRecords = 1000; // 最多保存1000条记录

  /**
   * 保存情绪记录
   */
  async save(record: EmotionRecord): Promise<void> {
    const records = this.getAllRecords();
    
    // 检查是否已存在（根据ID）
    const index = records.findIndex(r => r.id === record.id);
    if (index !== -1) {
      records[index] = record;
    } else {
      records.push(record);
    }
    
    // 限制记录数量
    if (records.length > this.maxRecords) {
      // 保留最新的记录，删除最旧的
      records.sort((a, b) => b.timestamp - a.timestamp);
      records.splice(this.maxRecords);
    }
    
    // 保存到localStorage
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(records));
    } catch (error) {
      console.error('[EmotionStorage] 保存失败:', error);
      // 如果存储空间不足，尝试清理旧记录
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanOldRecords(records);
        localStorage.setItem(this.storageKey, JSON.stringify(records));
      }
    }
  }

  /**
   * 根据ID获取记录
   */
  async getById(id: string): Promise<EmotionRecord | null> {
    const records = this.getAllRecords();
    return records.find(r => r.id === id) || null;
  }

  /**
   * 根据用户ID获取记录
   */
  async getByUserId(
    userId: number,
    options?: {
      startDate?: number;
      endDate?: number;
      source?: EmotionSource;
      emotionType?: EmotionType;
      limit?: number;
    }
  ): Promise<EmotionRecord[]> {
    let records = this.getAllRecords().filter(r => r.userId === userId);
    
    // 时间过滤
    if (options?.startDate) {
      records = records.filter(r => r.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      records = records.filter(r => r.timestamp <= options.endDate!);
    }
    
    // 来源过滤
    if (options?.source) {
      records = records.filter(r => r.source === options.source);
    }
    
    // 情绪类型过滤
    if (options?.emotionType) {
      records = records.filter(r => r.emotionType === options.emotionType);
    }
    
    // 按时间排序（最新的在前）
    records.sort((a, b) => b.timestamp - a.timestamp);
    
    // 限制数量
    if (options?.limit) {
      records = records.slice(0, options.limit);
    }
    
    return records;
  }

  /**
   * 删除记录
   */
  async delete(id: string): Promise<void> {
    const records = this.getAllRecords();
    const filtered = records.filter(r => r.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  /**
   * 清空用户记录
   */
  async clear(userId: number): Promise<void> {
    const records = this.getAllRecords();
    const filtered = records.filter(r => r.userId !== userId);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  /**
   * 获取所有记录
   */
  private getAllRecords(): EmotionRecord[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as EmotionRecord[];
    } catch (error) {
      console.error('[EmotionStorage] 读取失败:', error);
      return [];
    }
  }

  /**
   * 清理旧记录
   */
  private cleanOldRecords(records: EmotionRecord[]): void {
    // 按时间排序，保留最新的70%
    records.sort((a, b) => b.timestamp - a.timestamp);
    const keepCount = Math.floor(records.length * 0.7);
    records.splice(keepCount);
  }
}

/**
 * 情绪分析器
 */
export class EmotionAnalyzer {
  private storage: IEmotionStorage;

  constructor(storage?: IEmotionStorage) {
    this.storage = storage || new LocalEmotionStorage();
  }

  /**
   * 分析情绪趋势
   */
  async analyzeTrend(
    userId: number,
    period: 'hour' | 'day' | 'week' | 'month' = 'week'
  ): Promise<EmotionTrend> {
    const periodMs = this.getPeriodMs(period);
    const now = Date.now();
    const startDate = now - periodMs;
    
    const records = await this.storage.getByUserId(userId, {
      startDate,
      endDate: now,
    });
    
    if (records.length < 2) {
      return {
        period,
        trend: 'stable',
        changeRate: 0,
        recentEmotions: records,
        trendDescription: '数据不足，无法分析趋势',
      };
    }
    
    // 将情绪转换为数值
    const emotionValues = records.map(r => {
      const baseValue = this.getEmotionValue(r.emotionType);
      const intensityMultiplier = r.emotionIntensity === 'strong' ? 1.5 :
                                  r.emotionIntensity === 'moderate' ? 1.0 : 0.5;
      return baseValue * intensityMultiplier * r.confidence;
    });
    
    // 计算趋势（使用线性回归）
    const trend = this.calculateLinearTrend(emotionValues);
    
    // 判断趋势类型
    let trendType: EmotionTrend['trend'];
    if (Math.abs(trend.slope) < 0.1) {
      trendType = 'stable';
    } else if (trend.slope > 0) {
      trendType = 'improving';
    } else {
      trendType = 'declining';
    }
    
    // 计算变化速率
    const changeRate = trend.slope;
    
    return {
      period,
      trend: trendType,
      changeRate,
      recentEmotions: records.slice(-10),
      trendDescription: this.generateTrendDescription(trendType, changeRate),
    };
  }

  /**
   * 获取情绪数值
   */
  private getEmotionValue(emotion: EmotionType): number {
    const positiveEmotions = [
      EmotionType.HAPPY,
      EmotionType.EXCITED,
      EmotionType.CONTENT,
      EmotionType.PEACEFUL,
      EmotionType.HOPEFUL,
      EmotionType.GRATEFUL,
    ];
    
    const negativeEmotions = [
      EmotionType.SAD,
      EmotionType.ANXIOUS,
      EmotionType.ANGRY,
      EmotionType.LONELY,
      EmotionType.TIRED,
      EmotionType.CONFUSED,
    ];
    
    if (positiveEmotions.includes(emotion)) {
      return 1;
    } else if (negativeEmotions.includes(emotion)) {
      return -1;
    } else {
      return 0; // 中性情绪
    }
  }

  /**
   * 计算线性趋势
   */
  private calculateLinearTrend(values: number[]): { slope: number; intercept: number } {
    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      const x = i;
      const y = values[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    const denominator = n * sumXX - sumX * sumX;
    if (denominator === 0) {
      return { slope: 0, intercept: sumY / n };
    }
    
    const slope = (n * sumXY - sumX * sumY) / denominator;
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  }

  /**
   * 生成趋势描述
   */
  private generateTrendDescription(trend: EmotionTrend['trend'], changeRate: number): string {
    switch (trend) {
      case 'improving':
        return `情绪呈上升趋势，变化速率为${changeRate.toFixed(2)}，整体情绪在改善。`;
      case 'declining':
        return `情绪呈下降趋势，变化速率为${changeRate.toFixed(2)}，需要关注。`;
      case 'stable':
        return `情绪保持稳定，变化速率为${changeRate.toFixed(2)}。`;
      case 'fluctuating':
        return `情绪波动较大，变化速率为${changeRate.toFixed(2)}。`;
      default:
        return '无法确定趋势。';
    }
  }

  /**
   * 获取周期毫秒数
   */
  private getPeriodMs(period: 'hour' | 'day' | 'week' | 'month'): number {
    const hourMs = 60 * 60 * 1000;
    const dayMs = 24 * hourMs;
    switch (period) {
      case 'hour':
        return hourMs;
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

  /**
   * 获取情绪统计
   */
  async getEmotionStatistics(
    userId: number,
    period: 'day' | 'week' | 'month' = 'week'
  ): Promise<{
    total: number;
    byType: Record<EmotionType, number>;
    byIntensity: Record<string, number>;
    averageConfidence: number;
  }> {
    const periodMs = this.getPeriodMs(period);
    const now = Date.now();
    const startDate = now - periodMs;
    
    const records = await this.storage.getByUserId(userId, {
      startDate,
      endDate: now,
    });
    
    const byType: Record<EmotionType, number> = {} as any;
    const byIntensity: Record<string, number> = {};
    let totalConfidence = 0;
    
    // 初始化
    Object.values(EmotionType).forEach(emotion => {
      byType[emotion] = 0;
    });
    
    records.forEach(record => {
      byType[record.emotionType] = (byType[record.emotionType] || 0) + 1;
      byIntensity[record.emotionIntensity] = (byIntensity[record.emotionIntensity] || 0) + 1;
      totalConfidence += record.confidence;
    });
    
    return {
      total: records.length,
      byType,
      byIntensity,
      averageConfidence: records.length > 0 ? totalConfidence / records.length : 0,
    };
  }
}




