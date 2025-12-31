/**
 * 成长记录系统类型定义
 */

/**
 * 成长里程碑类型
 */
export type MilestoneType =
  | 'first_use'           // 首次使用
  | 'first_conversation'  // 首次对话
  | 'first_memory'       // 首次记忆
  | 'conversation_count' // 对话次数
  | 'memory_count'       // 记忆数量
  | 'emotion_insight'    // 情绪洞察
  | 'growth_streak'      // 连续使用
  | 'anniversary';       // 纪念日

/**
 * 成长里程碑
 */
export interface GrowthMilestone {
  id: string;
  userId: number;
  type: MilestoneType;
  title: string;
  description: string;
  achievedAt: number;
  value?: number; // 达成值（如对话次数、记忆数量等）
  metadata?: Record<string, any>;
}

/**
 * 成长记录
 */
export interface GrowthRecord {
  id: string;
  userId: number;
  date: number; // 日期（时间戳）
  metrics: {
    conversationCount: number;      // 对话次数
    memoryCount: number;            // 记忆数量
    emotionRecords: number;         // 情绪记录数
    activeDays: number;             // 活跃天数
    averageEmotionScore: number;   // 平均情绪分数
  };
  milestones: GrowthMilestone[];    // 当天达成的里程碑
  summary?: string;                 // 成长总结
}

/**
 * 成长统计
 */
export interface GrowthStatistics {
  totalConversations: number;       // 总对话次数
  totalMemories: number;            // 总记忆数量
  totalEmotionRecords: number;      // 总情绪记录数
  activeDays: number;               // 活跃天数
  currentStreak: number;            // 当前连续使用天数
  longestStreak: number;            // 最长连续使用天数
  averageEmotionScore: number;      // 平均情绪分数
  milestones: GrowthMilestone[];    // 所有里程碑
  growthTrend: {
    date: number;
    conversations: number;
    memories: number;
    emotionScore: number;
  }[];
}

/**
 * 成长记录系统配置
 */
export interface GrowthSystemConfig {
  enabled: boolean;
  userId: number;
  autoRecord: boolean; // 自动记录
}



