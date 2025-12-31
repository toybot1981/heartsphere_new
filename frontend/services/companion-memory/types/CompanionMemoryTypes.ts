/**
 * 陪伴记忆系统类型定义
 */

/**
 * 陪伴记忆类型
 */
export type CompanionMemoryType =
  | 'conversation'      // 对话记忆
  | 'milestone'         // 里程碑记忆
  | 'emotion_share'     // 情绪分享记忆
  | 'special_moment'    // 特殊时刻记忆
  | 'anniversary'       // 纪念日记忆
  | 'growth'            // 成长记忆
  | 'care_message';     // 关怀消息记忆

/**
 * 陪伴记忆
 */
export interface CompanionMemory {
  id: string;
  userId: number;
  type: CompanionMemoryType;
  title: string;
  content: string;
  timestamp: number;
  importance: 'low' | 'medium' | 'high';
  emotion?: string; // 关联的情绪
  milestoneId?: string; // 关联的里程碑ID
  conversationId?: string; // 关联的对话ID
  metadata?: Record<string, any>;
  tags?: string[];
}

/**
 * 陪伴记忆统计
 */
export interface CompanionMemoryStatistics {
  totalMemories: number;
  memoriesByType: Record<CompanionMemoryType, number>;
  recentMemories: CompanionMemory[];
  importantMemories: CompanionMemory[];
  memoryTimeline: {
    date: number;
    count: number;
    memories: CompanionMemory[];
  }[];
}

/**
 * 陪伴记忆系统配置
 */
export interface CompanionMemorySystemConfig {
  enabled: boolean;
  userId: number;
  autoRecord: boolean; // 自动记录
  recordConversations: boolean; // 记录对话
  recordMilestones: boolean; // 记录里程碑
  recordEmotions: boolean; // 记录情绪
}



