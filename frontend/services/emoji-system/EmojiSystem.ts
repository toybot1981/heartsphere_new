/**
 * 表情系统核心类
 */

import { Emoji, EmojiCategory, EmojiUsage } from './types/EmojiTypes';
import { EMOJI_DATA, getEmojisByCategory, searchEmojis, getEmojiById } from './data/EmojiData';
import { EmojiStorage } from './storage/EmojiStorage';

/**
 * 表情系统配置
 */
export interface EmojiSystemConfig {
  enabled: boolean;
  userId: number;
  autoRecord: boolean; // 自动记录使用
}

/**
 * 表情系统类
 */
export class EmojiSystem {
  private config: EmojiSystemConfig;
  private storage: EmojiStorage;

  constructor(config: EmojiSystemConfig) {
    this.config = config;
    this.storage = new EmojiStorage(config.userId);
  }

  /**
   * 获取所有表情
   */
  getAllEmojis(): Emoji[] {
    return EMOJI_DATA;
  }

  /**
   * 根据分类获取表情
   */
  getEmojisByCategory(category: EmojiCategory): Emoji[] {
    if (category === EmojiCategory.RECENT) {
      return this.getRecentEmojis();
    } else if (category === EmojiCategory.FREQUENT) {
      return this.getFrequentEmojis();
    }
    return getEmojisByCategory(category);
  }

  /**
   * 搜索表情
   */
  searchEmojis(query: string): Emoji[] {
    return searchEmojis(query);
  }

  /**
   * 根据ID获取表情
   */
  getEmojiById(id: string): Emoji | undefined {
    return getEmojiById(id);
  }

  /**
   * 获取最近使用的表情
   */
  getRecentEmojis(limit: number = 20): Emoji[] {
    const emojiIds = this.storage.getRecentEmojiIds(limit);
    return emojiIds
      .map((id) => getEmojiById(id))
      .filter((emoji): emoji is Emoji => emoji !== undefined);
  }

  /**
   * 获取常用表情
   */
  getFrequentEmojis(limit: number = 20): Emoji[] {
    const emojiIds = this.storage.getFrequentEmojiIds(limit);
    return emojiIds
      .map((id) => getEmojiById(id))
      .filter((emoji): emoji is Emoji => emoji !== undefined);
  }

  /**
   * 记录表情使用
   */
  async recordUsage(
    emojiId: string,
    context: EmojiUsage['context'],
    contextId?: string
  ): Promise<void> {
    if (!this.config.enabled || !this.config.autoRecord) {
      return;
    }

    await this.storage.recordUsage(emojiId, context, contextId);
  }

  /**
   * 获取使用统计
   */
  getUsageStats(limit: number = 20) {
    return this.storage.getFrequentEmojiStats(limit);
  }
}




