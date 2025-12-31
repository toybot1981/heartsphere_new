/**
 * 表情系统类型定义
 */

/**
 * 表情分类
 */
export enum EmojiCategory {
  SMILEYS = 'smileys', // 笑脸和人物
  ANIMALS = 'animals', // 动物和自然
  FOOD = 'food', // 食物和饮料
  ACTIVITIES = 'activities', // 活动
  TRAVEL = 'travel', // 旅行和地点
  OBJECTS = 'objects', // 物品
  SYMBOLS = 'symbols', // 符号
  FLAGS = 'flags', // 旗帜
  CUSTOM = 'custom', // 自定义
  RECENT = 'recent', // 最近使用
  FREQUENT = 'frequent', // 常用
}

/**
 * 表情
 */
export interface Emoji {
  id: string;
  code: string; // Unicode代码或标识符
  name: string; // 表情名称
  category: EmojiCategory; // 分类
  keywords: string[]; // 搜索关键词
  skinTones?: string[]; // 肤色变体（如果适用）
  isCustom: boolean; // 是否自定义
  creatorId?: number; // 创建者ID（自定义表情）
}

/**
 * 表情使用记录
 */
export interface EmojiUsage {
  id: string;
  userId: number;
  emojiId: string;
  context: 'conversation' | 'comment' | 'message' | 'diary' | 'other'; // 使用场景
  contextId?: string; // 场景ID
  usedAt: number; // 使用时间戳
}

/**
 * 表情使用统计
 */
export interface EmojiUsageStats {
  emojiId: string;
  usageCount: number;
  lastUsedAt: number;
}

/**
 * 表情选择器配置
 */
export interface EmojiPickerConfig {
  multiSelect?: boolean; // 是否多选
  maxSelection?: number; // 最大选择数量
  showPreview?: boolean; // 显示预览
  showSearch?: boolean; // 显示搜索
  showCategories?: boolean; // 显示分类
  defaultCategory?: EmojiCategory; // 默认分类
}

/**
 * 表情选择器回调
 */
export interface EmojiPickerCallbacks {
  onSelect: (emoji: Emoji) => void;
  onClose: () => void;
  onMultiSelect?: (emojis: Emoji[]) => void; // 多选模式
}



