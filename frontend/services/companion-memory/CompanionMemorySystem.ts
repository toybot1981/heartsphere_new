/**
 * 陪伴记忆系统核心类
 * 负责记录系统与用户共同度过的美好时光
 */

import {
  CompanionMemorySystemConfig,
  CompanionMemory,
  CompanionMemoryType,
  CompanionMemoryStatistics,
} from './types/CompanionMemoryTypes';
import { GrowthMilestone } from '../growth-system/types/GrowthTypes';

/**
 * 陪伴记忆系统类
 */
export class CompanionMemorySystem {
  private config: CompanionMemorySystemConfig;
  private memories: CompanionMemory[] = [];

  constructor(config: CompanionMemorySystemConfig) {
    this.config = config;
    this.loadMemories();
  }

  /**
   * 记录对话记忆
   */
  async recordConversationMemory(
    conversationId: string,
    summary: string,
    emotion?: string
  ): Promise<CompanionMemory | null> {
    if (!this.config.enabled || !this.config.recordConversations) {
      return null;
    }

    const memory: CompanionMemory = {
      id: `companion_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      type: 'conversation',
      title: '一次美好的对话',
      content: summary,
      timestamp: Date.now(),
      importance: this.determineImportance(summary, emotion),
      emotion,
      conversationId,
      tags: this.extractTags(summary),
    };

    this.memories.push(memory);
    this.saveMemories();
    return memory;
  }

  /**
   * 记录里程碑记忆
   */
  async recordMilestoneMemory(milestone: GrowthMilestone): Promise<CompanionMemory | null> {
    if (!this.config.enabled || !this.config.recordMilestones) {
      return null;
    }

    const memory: CompanionMemory = {
      id: `companion_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      type: 'milestone',
      title: `里程碑：${milestone.title}`,
      content: milestone.description,
      timestamp: milestone.achievedAt,
      importance: this.determineMilestoneImportance(milestone),
      milestoneId: milestone.id,
      metadata: {
        milestoneType: milestone.type,
        milestoneValue: milestone.value,
      },
      tags: ['里程碑', '成长'],
    };

    this.memories.push(memory);
    this.saveMemories();
    return memory;
  }

  /**
   * 记录情绪分享记忆
   */
  async recordEmotionMemory(
    emotionType: string,
    emotionIntensity: string,
    context: string
  ): Promise<CompanionMemory | null> {
    if (!this.config.enabled || !this.config.recordEmotions) {
      return null;
    }

    const memory: CompanionMemory = {
      id: `companion_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      type: 'emotion_share',
      title: `情绪分享：${this.getEmotionName(emotionType)}`,
      content: context,
      timestamp: Date.now(),
      importance: emotionIntensity === 'strong' ? 'high' : emotionIntensity === 'moderate' ? 'medium' : 'low',
      emotion: emotionType,
      metadata: {
        intensity: emotionIntensity,
      },
      tags: ['情绪', emotionType],
    };

    this.memories.push(memory);
    this.saveMemories();
    return memory;
  }

  /**
   * 记录特殊时刻记忆
   */
  async recordSpecialMomentMemory(
    title: string,
    content: string,
    metadata?: Record<string, any>
  ): Promise<CompanionMemory | null> {
    if (!this.config.enabled) {
      return null;
    }

    const memory: CompanionMemory = {
      id: `companion_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      type: 'special_moment',
      title,
      content,
      timestamp: Date.now(),
      importance: 'high',
      metadata,
      tags: ['特殊时刻'],
    };

    this.memories.push(memory);
    this.saveMemories();
    return memory;
  }

  /**
   * 记录关怀消息记忆
   */
  async recordCareMessageMemory(
    careMessage: string,
    triggerType: string
  ): Promise<CompanionMemory | null> {
    if (!this.config.enabled) {
      return null;
    }

    const memory: CompanionMemory = {
      id: `companion_memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      type: 'care_message',
      title: '关怀时刻',
      content: careMessage,
      timestamp: Date.now(),
      importance: 'medium',
      metadata: {
        triggerType,
      },
      tags: ['关怀'],
    };

    this.memories.push(memory);
    this.saveMemories();
    return memory;
  }

  /**
   * 获取陪伴记忆
   */
  getMemories(options?: {
    type?: CompanionMemoryType;
    importance?: 'low' | 'medium' | 'high';
    startDate?: number;
    endDate?: number;
    limit?: number;
  }): CompanionMemory[] {
    let filtered = [...this.memories];

    // 类型过滤
    if (options?.type) {
      filtered = filtered.filter((m) => m.type === options.type);
    }

    // 重要性过滤
    if (options?.importance) {
      filtered = filtered.filter((m) => m.importance === options.importance);
    }

    // 时间过滤
    if (options?.startDate) {
      filtered = filtered.filter((m) => m.timestamp >= options.startDate!);
    }
    if (options?.endDate) {
      filtered = filtered.filter((m) => m.timestamp <= options.endDate!);
    }

    // 排序（最新的在前）
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    // 限制数量
    if (options?.limit) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * 获取陪伴记忆统计
   */
  getStatistics(): CompanionMemoryStatistics {
    const memoriesByType: Record<CompanionMemoryType, number> = {
      conversation: 0,
      milestone: 0,
      emotion_share: 0,
      special_moment: 0,
      anniversary: 0,
      growth: 0,
      care_message: 0,
    };

    this.memories.forEach((memory) => {
      memoriesByType[memory.type]++;
    });

    // 最近10条记忆
    const recentMemories = this.memories
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);

    // 重要记忆
    const importantMemories = this.memories
      .filter((m) => m.importance === 'high')
      .sort((a, b) => b.timestamp - a.timestamp);

    // 时间线（按日期分组）
    const memoryTimeline = this.generateMemoryTimeline();

    return {
      totalMemories: this.memories.length,
      memoriesByType,
      recentMemories,
      importantMemories,
      memoryTimeline,
    };
  }

  /**
   * 生成记忆时间线
   */
  private generateMemoryTimeline(): CompanionMemoryStatistics['memoryTimeline'] {
    const timelineMap = new Map<number, CompanionMemory[]>();

    this.memories.forEach((memory) => {
      const date = this.getDateTimestamp(memory.timestamp);
      if (!timelineMap.has(date)) {
        timelineMap.set(date, []);
      }
      timelineMap.get(date)!.push(memory);
    });

    return Array.from(timelineMap.entries())
      .map(([date, memories]) => ({
        date,
        count: memories.length,
        memories: memories.sort((a, b) => b.timestamp - a.timestamp),
      }))
      .sort((a, b) => b.date - a.date);
  }

  /**
   * 确定重要性
   */
  private determineImportance(summary: string, emotion?: string): 'low' | 'medium' | 'high' {
    // 如果包含强烈情绪，重要性较高
    if (emotion && ['sad', 'anxious', 'angry', 'lonely'].includes(emotion)) {
      return 'high';
    }

    // 如果对话较长或包含关键词，重要性中等
    if (summary.length > 100 || this.containsImportantKeywords(summary)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * 确定里程碑重要性
   */
  private determineMilestoneImportance(milestone: GrowthMilestone): 'low' | 'medium' | 'high' {
    if (milestone.type === 'first_use' || milestone.type === 'anniversary') {
      return 'high';
    } else if (
      milestone.type === 'growth_streak' &&
      (milestone.value || 0) >= 30
    ) {
      return 'high';
    } else if (
      (milestone.type === 'conversation_count' || milestone.type === 'memory_count') &&
      (milestone.value || 0) >= 100
    ) {
      return 'high';
    } else {
      return 'medium';
    }
  }

  /**
   * 提取标签
   */
  private extractTags(content: string): string[] {
    const tags: string[] = [];
    const keywords = ['开心', '难过', '焦虑', '成长', '回忆', '重要', '特别'];

    keywords.forEach((keyword) => {
      if (content.includes(keyword)) {
        tags.push(keyword);
      }
    });

    return tags;
  }

  /**
   * 检查是否包含重要关键词
   */
  private containsImportantKeywords(text: string): boolean {
    const importantKeywords = ['重要', '特别', '难忘', '深刻', '意义'];
    return importantKeywords.some((keyword) => text.includes(keyword));
  }

  /**
   * 获取情绪名称
   */
  private getEmotionName(emotionType: string): string {
    const emotionNames: Record<string, string> = {
      happy: '开心',
      excited: '兴奋',
      content: '满足',
      peaceful: '平静',
      hopeful: '希望',
      grateful: '感激',
      calm: '冷静',
      thoughtful: '思考',
      focused: '专注',
      relaxed: '放松',
      sad: '难过',
      anxious: '焦虑',
      angry: '生气',
      lonely: '孤独',
      tired: '疲惫',
      confused: '困惑',
    };

    return emotionNames[emotionType] || emotionType;
  }

  /**
   * 获取日期时间戳（只包含日期部分）
   */
  private getDateTimestamp(timestamp: number): number {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }

  /**
   * 保存记忆
   */
  private saveMemories(): void {
    try {
      localStorage.setItem(
        `companion_memories_${this.config.userId}`,
        JSON.stringify(this.memories)
      );
    } catch (error) {
      console.error('[CompanionMemorySystem] 保存记忆失败:', error);
    }
  }

  /**
   * 加载记忆
   */
  private loadMemories(): void {
    try {
      const data = localStorage.getItem(`companion_memories_${this.config.userId}`);
      if (data) {
        this.memories = JSON.parse(data);
      }
    } catch (error) {
      console.error('[CompanionMemorySystem] 加载记忆失败:', error);
      this.memories = [];
    }
  }
}



