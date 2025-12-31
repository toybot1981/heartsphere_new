/**
 * 个性化记忆系统类型定义
 */

import { EmotionType } from '../../emotion-system/types/EmotionTypes';

/**
 * 记忆类型
 */
export enum MemoryType {
  // 个人信息
  PERSONAL_INFO = 'personal_info',
  PREFERENCE = 'preference',
  HABIT = 'habit',
  PERSONALITY = 'personality',
  
  // 情感记忆
  IMPORTANT_MOMENT = 'important_moment',
  EMOTIONAL_EXPERIENCE = 'emotional_experience',
  EMOTION_PATTERN = 'emotion_pattern',
  EMOTIONAL_PREFERENCE = 'emotional_preference',
  
  // 交互记忆
  FREQUENT_CHARACTER = 'frequent_character',
  CONVERSATION_TOPIC = 'conversation_topic',
  INTERACTION_PREFERENCE = 'interaction_preference',
  CONVERSATION_STYLE = 'conversation_style',
  
  // 内容记忆
  CREATED_CONTENT = 'created_content',
  FOCUSED_CONTENT = 'focused_content',
  FAVORITED_CONTENT = 'favorited_content',
  SHARED_CONTENT = 'shared_content',
  
  // 成长记忆
  GROWTH_TRAJECTORY = 'growth_trajectory',
  MILESTONE = 'milestone',
  ACHIEVEMENT = 'achievement',
  REFLECTION = 'reflection'
}

/**
 * 记忆重要性
 */
export enum MemoryImportance {
  CORE = 'core',       // 核心记忆
  IMPORTANT = 'important', // 重要记忆
  NORMAL = 'normal',   // 普通记忆
  TEMPORARY = 'temporary' // 临时记忆
}

/**
 * 记忆来源
 */
export enum MemorySource {
  CONVERSATION = 'conversation', // 对话
  JOURNAL = 'journal',           // 日记
  BEHAVIOR = 'behavior',         // 行为
  MANUAL = 'manual',             // 手动添加
  SYSTEM = 'system'              // 系统生成
}

/**
 * 用户记忆
 */
export interface UserMemory {
  id: string;
  userId: number;
  memoryType: MemoryType;
  importance: MemoryImportance;
  content: string;
  structuredData?: {
    key?: string;
    value?: any;
    tags?: string[];
  };
  source: MemorySource;
  sourceId?: string;
  timestamp: number;
  lastUsedAt?: number;
  usageCount: number;
  confidence: number; // 提取置信度（0-1）
  metadata?: {
    emotion?: EmotionType;
    eraId?: number;
    characterId?: string;
  };
}

/**
 * 记忆检索选项
 */
export interface MemorySearchOptions {
  keyword?: string;
  memoryType?: MemoryType;
  importance?: MemoryImportance;
  startDate?: number;
  endDate?: number;
  limit?: number;
  context?: string; // 上下文（用于语义检索）
}

/**
 * 记忆关联类型
 */
export enum MemoryRelationType {
  RELATED = 'related',     // 相关
  SIMILAR = 'similar',     // 相似
  OPPOSITE = 'opposite',   // 相反
  SEQUENTIAL = 'sequential' // 连续
}

/**
 * 记忆关联
 */
export interface MemoryRelation {
  id: string;
  memoryId1: string;
  memoryId2: string;
  relationType: MemoryRelationType;
  strength: number; // 关联强度（0-1）
  timestamp: number;
}



