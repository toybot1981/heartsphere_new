/**
 * 情绪感知系统类型定义
 */

/**
 * 情绪类型
 */
export enum EmotionType {
  // 积极情绪
  HAPPY = 'happy',
  EXCITED = 'excited',
  CONTENT = 'content',
  PEACEFUL = 'peaceful',
  HOPEFUL = 'hopeful',
  GRATEFUL = 'grateful',
  
  // 中性情绪
  CALM = 'calm',
  THOUGHTFUL = 'thoughtful',
  FOCUSED = 'focused',
  RELAXED = 'relaxed',
  
  // 消极情绪
  SAD = 'sad',
  ANXIOUS = 'anxious',
  ANGRY = 'angry',
  LONELY = 'lonely',
  TIRED = 'tired',
  CONFUSED = 'confused'
}

/**
 * 情绪强度
 */
export enum EmotionIntensity {
  MILD = 'mild',      // 轻度
  MODERATE = 'moderate', // 中度
  STRONG = 'strong'   // 强烈
}

/**
 * 情绪来源
 */
export enum EmotionSource {
  CONVERSATION = 'conversation', // 对话
  JOURNAL = 'journal',           // 日记
  BEHAVIOR = 'behavior',         // 行为
  MANUAL = 'manual'              // 手动标记
}

/**
 * 情绪记录
 */
export interface EmotionRecord {
  id: string;
  userId: number;
  emotionType: EmotionType;
  emotionIntensity: EmotionIntensity;
  emotionTags: string[];
  confidence: number; // 识别置信度（0-1）
  source: EmotionSource;
  context: string; // 上下文信息（触发情绪的内容）
  timestamp: number;
  metadata?: {
    conversationId?: string;
    journalEntryId?: string;
    triggerText?: string;
    keyPhrases?: string[];
    reasoning?: string;
  };
}

/**
 * 情绪分析请求
 */
export interface EmotionAnalysisRequest {
  text?: string;
  context?: {
    conversationHistory?: string[];
    userProfile?: any;
    timeOfDay?: number; // 0-23
    dayOfWeek?: number; // 0-6
  };
  source: EmotionSource;
}

/**
 * 情绪分析响应
 */
export interface EmotionAnalysisResponse {
  primaryEmotion: EmotionType;
  secondaryEmotions?: EmotionType[];
  intensity: EmotionIntensity;
  confidence: number; // 0-1
  emotionTags: string[];
  reasoning?: string;
  keyPhrases: string[];
}

/**
 * 情绪关键词
 */
export interface EmotionKeyword {
  keyword: string;
  emotionType: EmotionType;
  intensity: EmotionIntensity;
  weight: number; // 关键词权重（0-1）
  context?: string[]; // 上下文关键词（需要同时出现才触发）
}

/**
 * 情绪趋势
 */
export interface EmotionTrend {
  period: 'hour' | 'day' | 'week' | 'month';
  trend: 'improving' | 'declining' | 'stable' | 'fluctuating';
  changeRate: number; // 变化速率（-1到1）
  recentEmotions: EmotionRecord[];
  trendDescription: string;
}

/**
 * 情绪融合配置
 */
export interface EmotionFusionConfig {
  sources: {
    source: EmotionSource;
    weight: number; // 权重（0-1）
    confidence: number; // 该来源的置信度
  }[];
}

/**
 * 交互频率分析
 */
export interface InteractionFrequencyAnalysis {
  period: 'day' | 'week' | 'month';
  currentFrequency: number;
  averageFrequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  deviation: number; // 偏离度（百分比）
  emotionIndicator?: EmotionType;
}

/**
 * 交互时长分析
 */
export interface InteractionDurationAnalysis {
  averageDuration: number;
  recentAverageDuration: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  emotionIndicator?: EmotionType;
}

/**
 * 活跃度分析
 */
export interface ActivityAnalysis {
  recentActivity: number; // 最近活跃度（0-100）
  historicalAverage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  emotionIndicator?: EmotionType;
  lastActiveTime: number;
  daysSinceLastActive: number;
}




