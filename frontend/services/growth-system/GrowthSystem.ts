/**
 * 成长记录系统核心类
 * 负责记录和追踪用户的成长轨迹
 */

import {
  GrowthSystemConfig,
  GrowthRecord,
  GrowthMilestone,
  GrowthStatistics,
  MilestoneType,
} from './types/GrowthTypes';

/**
 * 成长记录系统类
 */
export class GrowthSystem {
  private config: GrowthSystemConfig;
  private records: GrowthRecord[] = [];
  private milestones: GrowthMilestone[] = [];

  constructor(config: GrowthSystemConfig) {
    this.config = config;
    this.loadData();
  }

  /**
   * 记录成长数据
   */
  async recordGrowth(data: {
    conversationCount?: number;
    memoryCount?: number;
    emotionRecords?: number;
    emotionScore?: number;
  }): Promise<void> {
    if (!this.config.enabled || !this.config.autoRecord) {
      return;
    }

    const today = this.getTodayTimestamp();
    let todayRecord = this.records.find((r) => r.date === today);

    if (!todayRecord) {
      todayRecord = {
        id: `growth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.config.userId,
        date: today,
        metrics: {
          conversationCount: 0,
          memoryCount: 0,
          emotionRecords: 0,
          activeDays: 0,
          averageEmotionScore: 0,
        },
        milestones: [],
      };
      this.records.push(todayRecord);
    }

    // 更新指标
    if (data.conversationCount !== undefined) {
      todayRecord.metrics.conversationCount += data.conversationCount;
    }
    if (data.memoryCount !== undefined) {
      todayRecord.metrics.memoryCount += data.memoryCount;
    }
    if (data.emotionRecords !== undefined) {
      todayRecord.metrics.emotionRecords += data.emotionRecords;
    }
    if (data.emotionScore !== undefined) {
      // 更新平均情绪分数
      const totalRecords = todayRecord.metrics.emotionRecords;
      const currentAvg = todayRecord.metrics.averageEmotionScore;
      todayRecord.metrics.averageEmotionScore =
        (currentAvg * (totalRecords - 1) + data.emotionScore) / totalRecords;
    }

    // 检查里程碑
    const newMilestones = await this.checkMilestones(todayRecord);
    if (newMilestones.length > 0) {
      todayRecord.milestones.push(...newMilestones);
      this.milestones.push(...newMilestones);
    }

    this.saveData();
  }

  /**
   * 检查里程碑
   */
  private async checkMilestones(record: GrowthRecord): Promise<GrowthMilestone[]> {
    const newMilestones: GrowthMilestone[] = [];

    // 检查对话次数里程碑
    const conversationMilestones = [
      { count: 1, title: '第一次对话', description: '你完成了第一次对话！' },
      { count: 10, title: '对话新手', description: '你已经完成了10次对话！' },
      { count: 50, title: '对话达人', description: '你已经完成了50次对话！' },
      { count: 100, title: '对话大师', description: '你已经完成了100次对话！' },
      { count: 500, title: '对话传奇', description: '你已经完成了500次对话！' },
    ];

    for (const milestone of conversationMilestones) {
      if (
        record.metrics.conversationCount === milestone.count &&
        !this.hasMilestone('conversation_count', milestone.count)
      ) {
        newMilestones.push({
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: this.config.userId,
          type: 'conversation_count',
          title: milestone.title,
          description: milestone.description,
          achievedAt: Date.now(),
          value: milestone.count,
        });
      }
    }

    // 检查记忆数量里程碑
    const memoryMilestones = [
      { count: 1, title: '第一份记忆', description: '你保存了第一份记忆！' },
      { count: 10, title: '记忆收集者', description: '你已经保存了10份记忆！' },
      { count: 50, title: '记忆守护者', description: '你已经保存了50份记忆！' },
      { count: 100, title: '记忆大师', description: '你已经保存了100份记忆！' },
    ];

    for (const milestone of memoryMilestones) {
      if (
        record.metrics.memoryCount === milestone.count &&
        !this.hasMilestone('memory_count', milestone.count)
      ) {
        newMilestones.push({
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: this.config.userId,
          type: 'memory_count',
          title: milestone.title,
          description: milestone.description,
          achievedAt: Date.now(),
          value: milestone.count,
        });
      }
    }

    // 检查连续使用天数
    const streak = this.calculateStreak();
    const streakMilestones = [
      { days: 3, title: '三天坚持', description: '你已经连续使用3天了！' },
      { days: 7, title: '一周坚持', description: '你已经连续使用7天了！' },
      { days: 30, title: '一月坚持', description: '你已经连续使用30天了！' },
      { days: 100, title: '百日坚持', description: '你已经连续使用100天了！' },
    ];

    for (const milestone of streakMilestones) {
      if (streak === milestone.days && !this.hasMilestone('growth_streak', milestone.days)) {
        newMilestones.push({
          id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: this.config.userId,
          type: 'growth_streak',
          title: milestone.title,
          description: milestone.description,
          achievedAt: Date.now(),
          value: milestone.days,
        });
      }
    }

    return newMilestones;
  }

  /**
   * 检查是否已有里程碑
   */
  private hasMilestone(type: MilestoneType, value: number): boolean {
    return this.milestones.some(
      (m) => m.type === type && m.value === value
    );
  }

  /**
   * 计算连续使用天数
   */
  private calculateStreak(): number {
    if (this.records.length === 0) {
      return 0;
    }

    // 按日期排序（最新的在前）
    const sortedRecords = [...this.records].sort((a, b) => b.date - a.date);

    let streak = 0;
    let expectedDate = this.getTodayTimestamp();

    for (const record of sortedRecords) {
      const recordDate = this.getDateFromTimestamp(record.date);
      const expectedDateObj = this.getDateFromTimestamp(expectedDate);

      if (
        recordDate.getFullYear() === expectedDateObj.getFullYear() &&
        recordDate.getMonth() === expectedDateObj.getMonth() &&
        recordDate.getDate() === expectedDateObj.getDate()
      ) {
        streak++;
        expectedDate -= 24 * 60 * 60 * 1000; // 减去一天
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 获取成长统计
   */
  getStatistics(): GrowthStatistics {
    const totalConversations = this.records.reduce(
      (sum, r) => sum + r.metrics.conversationCount,
      0
    );
    const totalMemories = this.records.reduce(
      (sum, r) => sum + r.metrics.memoryCount,
      0
    );
    const totalEmotionRecords = this.records.reduce(
      (sum, r) => sum + r.metrics.emotionRecords,
      0
    );
    const activeDays = this.records.length;
    const currentStreak = this.calculateStreak();
    const longestStreak = this.calculateLongestStreak();
    const averageEmotionScore =
      totalEmotionRecords > 0
        ? this.records.reduce(
            (sum, r) =>
              sum + r.metrics.averageEmotionScore * r.metrics.emotionRecords,
            0
          ) / totalEmotionRecords
        : 0;

    // 生成成长趋势（最近30天）
    const growthTrend = this.generateGrowthTrend(30);

    return {
      totalConversations,
      totalMemories,
      totalEmotionRecords,
      activeDays,
      currentStreak,
      longestStreak,
      averageEmotionScore,
      milestones: [...this.milestones],
      growthTrend,
    };
  }

  /**
   * 计算最长连续使用天数
   */
  private calculateLongestStreak(): number {
    if (this.records.length === 0) {
      return 0;
    }

    // 按日期排序
    const sortedRecords = [...this.records].sort((a, b) => a.date - b.date);

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedRecords.length; i++) {
      const prevDate = this.getDateFromTimestamp(sortedRecords[i - 1].date);
      const currDate = this.getDateFromTimestamp(sortedRecords[i].date);

      const daysDiff =
        (currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000);

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  /**
   * 生成成长趋势
   */
  private generateGrowthTrend(days: number): GrowthStatistics['growthTrend'] {
    const trend: GrowthStatistics['growthTrend'] = [];
    const cutoffDate = Date.now() - days * 24 * 60 * 60 * 1000;

    for (let i = days - 1; i >= 0; i--) {
      const date = Date.now() - i * 24 * 60 * 60 * 1000;
      const record = this.records.find((r) => r.date === this.getTodayTimestamp(date));

      trend.push({
        date,
        conversations: record?.metrics.conversationCount || 0,
        memories: record?.metrics.memoryCount || 0,
        emotionScore: record?.metrics.averageEmotionScore || 0,
      });
    }

    return trend;
  }

  /**
   * 获取今天的日期时间戳（只包含日期部分）
   */
  private getTodayTimestamp(date?: number): number {
    const d = date ? new Date(date) : new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  /**
   * 从时间戳获取日期对象
   */
  private getDateFromTimestamp(timestamp: number): Date {
    return new Date(timestamp);
  }

  /**
   * 保存数据
   */
  private saveData(): void {
    try {
      localStorage.setItem(
        `growth_records_${this.config.userId}`,
        JSON.stringify(this.records)
      );
      localStorage.setItem(
        `growth_milestones_${this.config.userId}`,
        JSON.stringify(this.milestones)
      );
    } catch (error) {
      console.error('[GrowthSystem] 保存数据失败:', error);
    }
  }

  /**
   * 加载数据
   */
  private loadData(): void {
    try {
      const recordsData = localStorage.getItem(`growth_records_${this.config.userId}`);
      if (recordsData) {
        this.records = JSON.parse(recordsData);
      }

      const milestonesData = localStorage.getItem(
        `growth_milestones_${this.config.userId}`
      );
      if (milestonesData) {
        this.milestones = JSON.parse(milestonesData);
      }
    } catch (error) {
      console.error('[GrowthSystem] 加载数据失败:', error);
      this.records = [];
      this.milestones = [];
    }
  }
}

