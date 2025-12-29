/**
 * 表情系统 React Hook
 */

import { useState, useEffect } from 'react';
import { EmojiSystem, EmojiSystemConfig } from '../EmojiSystem';
import { Emoji, EmojiCategory, EmojiUsage } from '../types/EmojiTypes';

/**
 * 表情系统 Hook
 */
export function useEmojiSystem(config: EmojiSystemConfig) {
  const [system, setSystem] = useState<EmojiSystem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    const emojiSystem = new EmojiSystem(config);
    setSystem(emojiSystem);
    setIsReady(true);
  }, [config.enabled, config.userId]);

  /**
   * 获取表情列表
   */
  const getEmojis = (category?: EmojiCategory): Emoji[] => {
    if (system) {
      if (category) {
        return system.getEmojisByCategory(category);
      }
      return system.getAllEmojis();
    }
    return [];
  };

  /**
   * 搜索表情
   */
  const searchEmojis = (query: string): Emoji[] => {
    if (system) {
      return system.searchEmojis(query);
    }
    return [];
  };

  /**
   * 获取表情
   */
  const getEmoji = (id: string): Emoji | undefined => {
    if (system) {
      return system.getEmojiById(id);
    }
    return undefined;
  };

  /**
   * 记录表情使用
   */
  const recordUsage = async (
    emojiId: string,
    context: EmojiUsage['context'],
    contextId?: string
  ) => {
    if (system) {
      await system.recordUsage(emojiId, context, contextId);
    }
  };

  /**
   * 获取最近使用的表情
   */
  const getRecentEmojis = (limit: number = 20): Emoji[] => {
    if (system) {
      return system.getRecentEmojis(limit);
    }
    return [];
  };

  /**
   * 获取常用表情
   */
  const getFrequentEmojis = (limit: number = 20): Emoji[] => {
    if (system) {
      return system.getFrequentEmojis(limit);
    }
    return [];
  };

  return {
    system,
    isReady,
    getEmojis,
    searchEmojis,
    getEmoji,
    recordUsage,
    getRecentEmojis,
    getFrequentEmojis,
  };
}

