/**
 * 陪伴式交互系统类型定义
 */

/**
 * 关怀触发类型
 */
export type CareTriggerType = 
  | 'scheduled_greeting'      // 定期问候
  | 'inactivity'              // 长时间未互动
  | 'special_time'            // 特殊时间
  | 'habit_time'              // 用户习惯时间
  | 'negative_emotion'        // 消极情绪
  | 'milestone'               // 里程碑
  | 'anniversary'             // 纪念日
  | 'weather'                 // 天气变化
  | 'proactive_suggestion';   // 主动建议

/**
 * 关怀强度
 */
export type CareLevel = 'gentle' | 'moderate' | 'strong';

/**
 * 问候类型
 */
export type GreetingType = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * 关怀触发条件
 */
export interface CareTrigger {
  type: CareTriggerType;
  level?: CareLevel;
  duration?: number; // 持续时间（小时或分钟）
  messageTemplate?: string;
  metadata?: Record<string, any>;
}

/**
 * 定期问候触发配置
 */
export interface ScheduledGreetingTrigger {
  type: 'scheduled_greeting';
  timeSlots: Array<{
    hour: number; // 0-23
    minute: number; // 0-59
    greetingType: GreetingType;
    enabled: boolean;
  }>;
  userPreference?: {
    enabled: boolean;
    preferredTimes?: number[]; // 偏好时间（小时）
    timezone?: string; // 用户时区
  };
}

/**
 * 长时间未互动触发配置
 */
export interface InactivityTrigger {
  type: 'inactivity';
  thresholds: Array<{
    duration: number; // 未互动时长（小时）
    careLevel: CareLevel;
    messageTemplate: string;
  }>;
}

/**
 * 特殊时间关怀触发配置
 */
export interface SpecialTimeCareTrigger {
  type: 'special_time';
  specialTimes: Array<{
    timeRange: [number, number]; // 时间范围（小时）
    dayOfWeek?: number[]; // 星期几（0-6，可选）
    careType: 'late_night' | 'weekend' | 'holiday' | 'lonely_hour';
    messageTemplate: string;
  }>;
}

/**
 * 用户习惯时间触发配置
 */
export interface UserHabitTimeTrigger {
  type: 'habit_time';
  userHabitPattern: {
    userId: number;
    preferredHours: number[]; // 用户常用的时间段（小时）
    confidence: number; // 习惯模式的置信度（0-1）
    lastUpdated: number;
  };
}

/**
 * 消极情绪触发配置
 */
export interface NegativeEmotionTrigger {
  type: 'negative_emotion';
  emotionTypes: string[]; // 触发关怀的消极情绪类型
  intensityThreshold: string; // 强度阈值
  durationThreshold?: number; // 持续时间阈值（小时）
  careInterval: number; // 关怀间隔（小时）
}

/**
 * 关怀消息
 */
export interface CareMessage {
  id: string;
  userId: number;
  trigger: CareTrigger;
  content: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

/**
 * 主动关怀配置
 */
export interface ProactiveCareConfig {
  enabled: boolean;
  scheduledGreeting: ScheduledGreetingTrigger;
  inactivity: InactivityTrigger;
  specialTime: SpecialTimeCareTrigger;
  negativeEmotion: NegativeEmotionTrigger;
  userHabit?: UserHabitTimeTrigger;
}

/**
 * 陪伴式交互系统配置
 */
export interface CompanionSystemConfig {
  enabled: boolean;
  proactiveCare: ProactiveCareConfig;
  userId: number;
}




