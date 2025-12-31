/**
 * 表情使用记录存储
 */

import { EmojiUsage, EmojiUsageStats } from '../types/EmojiTypes';

/**
 * 表情使用记录存储类
 */
export class EmojiStorage {
  private userId: number;
  private storageKey: string;

  constructor(userId: number) {
    this.userId = userId;
    this.storageKey = `emoji_usage_${userId}`;
  }

  /**
   * 记录表情使用
   */
  async recordUsage(
    emojiId: string,
    context: EmojiUsage['context'],
    contextId?: string
  ): Promise<void> {
    try {
      const usage: EmojiUsage = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: this.userId,
        emojiId,
        context,
        contextId,
        usedAt: Date.now(),
      };

      const usages = this.getUsages();
      usages.push(usage);

      // 只保留最近1000条记录
      if (usages.length > 1000) {
        usages.sort((a, b) => b.usedAt - a.usedAt);
        usages.splice(1000);
      }

      localStorage.setItem(this.storageKey, JSON.stringify(usages));
    } catch (error) {
      console.error('[EmojiStorage] 记录表情使用失败:', error);
    }
  }

  /**
   * 获取使用记录
   */
  getUsages(): EmojiUsage[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[EmojiStorage] 获取使用记录失败:', error);
    }
    return [];
  }

  /**
   * 获取最近使用的表情ID
   */
  getRecentEmojiIds(limit: number = 20): string[] {
    const usages = this.getUsages();
    const recent = usages
      .sort((a, b) => b.usedAt - a.usedAt)
      .slice(0, limit)
      .map((usage) => usage.emojiId);

    // 去重，保持顺序
    const unique: string[] = [];
    for (const id of recent) {
      if (!unique.includes(id)) {
        unique.push(id);
      }
    }
    return unique;
  }

  /**
   * 获取常用表情统计
   */
  getFrequentEmojiStats(limit: number = 20): EmojiUsageStats[] {
    const usages = this.getUsages();
    const statsMap = new Map<string, { count: number; lastUsedAt: number }>();

    usages.forEach((usage) => {
      const existing = statsMap.get(usage.emojiId);
      if (existing) {
        existing.count++;
        if (usage.usedAt > existing.lastUsedAt) {
          existing.lastUsedAt = usage.usedAt;
        }
      } else {
        statsMap.set(usage.emojiId, {
          count: 1,
          lastUsedAt: usage.usedAt,
        });
      }
    });

    const stats: EmojiUsageStats[] = Array.from(statsMap.entries()).map(
      ([emojiId, data]) => ({
        emojiId,
        usageCount: data.count,
        lastUsedAt: data.lastUsedAt,
      })
    );

    // 按使用次数排序，如果次数相同则按最后使用时间排序
    stats.sort((a, b) => {
      if (b.usageCount !== a.usageCount) {
        return b.usageCount - a.usageCount;
      }
      return b.lastUsedAt - a.lastUsedAt;
    });

    return stats.slice(0, limit);
  }

  /**
   * 获取常用表情ID
   */
  getFrequentEmojiIds(limit: number = 20): string[] {
    return this.getFrequentEmojiStats(limit).map((stat) => stat.emojiId);
  }

  /**
   * 清除使用记录
   */
  clearUsages(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('[EmojiStorage] 清除使用记录失败:', error);
    }
  }
}



