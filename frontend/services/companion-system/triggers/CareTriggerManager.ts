/**
 * 关怀触发管理器
 * 负责检测和触发各种关怀条件
 */

import {
  CareTrigger,
  CareTriggerType,
  CareLevel,
  ScheduledGreetingTrigger,
  InactivityTrigger,
  SpecialTimeCareTrigger,
  UserHabitTimeTrigger,
  NegativeEmotionTrigger,
} from '../types/CompanionTypes';

/**
 * 关怀触发管理器类
 */
export class CareTriggerManager {
  private userId: number;
  private lastInteractionTime: number = 0;
  private lastCareTimes: Map<string, number> = new Map();

  constructor(userId: number) {
    this.userId = userId;
    this.loadLastInteractionTime();
  }

  /**
   * 检查所有触发条件
   */
  async checkAllTriggers(): Promise<CareTrigger[]> {
    const triggers: CareTrigger[] = [];

    // 检查定期问候
    const scheduledGreeting = this.checkScheduledGreeting();
    if (scheduledGreeting) triggers.push(scheduledGreeting);

    // 检查长时间未互动
    const inactivity = this.checkInactivity();
    if (inactivity) triggers.push(inactivity);

    // 检查特殊时间
    const specialTime = this.checkSpecialTime();
    if (specialTime) triggers.push(specialTime);

    // 检查用户习惯时间
    const habitTime = await this.checkUserHabitTime();
    if (habitTime) triggers.push(habitTime);

    return triggers;
  }

  /**
   * 检查定期问候触发
   */
  checkScheduledGreeting(): CareTrigger | null {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 默认问候时间点
    const defaultGreetingSlots = [
      { hour: 7, minute: 0, greetingType: 'morning' as const },
      { hour: 12, minute: 0, greetingType: 'afternoon' as const },
      { hour: 18, minute: 0, greetingType: 'evening' as const },
      { hour: 21, minute: 0, greetingType: 'night' as const },
    ];

    for (const slot of defaultGreetingSlots) {
      // 检查是否在时间点前后5分钟内
      const timeDiff = Math.abs(
        (currentHour * 60 + currentMinute) - (slot.hour * 60 + slot.minute)
      );

      if (timeDiff <= 5) {
        const triggerKey = `scheduled_greeting_${slot.hour}_${slot.minute}`;
        const lastCareTime = this.lastCareTimes.get(triggerKey) || 0;
        const hoursSinceLastCare = (Date.now() - lastCareTime) / (1000 * 60 * 60);

        // 至少间隔1小时才再次触发
        if (hoursSinceLastCare >= 1) {
          this.lastCareTimes.set(triggerKey, Date.now());
          return {
            type: 'scheduled_greeting',
            level: 'gentle',
            metadata: {
              greetingType: slot.greetingType,
              hour: slot.hour,
              minute: slot.minute,
            },
          };
        }
      }
    }

    return null;
  }

  /**
   * 检查长时间未互动触发
   */
  checkInactivity(): CareTrigger | null {
    const now = Date.now();
    const hoursSinceLastInteraction = (now - this.lastInteractionTime) / (1000 * 60 * 60);

    const inactivityThresholds = [
      { duration: 24, careLevel: 'gentle' as CareLevel, messageTemplate: '好久不见，想你了～' },
      { duration: 72, careLevel: 'moderate' as CareLevel, messageTemplate: '好几天没见了，最近还好吗？' },
      { duration: 168, careLevel: 'strong' as CareLevel, messageTemplate: '一周没见了，想和你聊聊～' },
    ];

    for (const threshold of inactivityThresholds) {
      if (hoursSinceLastInteraction >= threshold.duration) {
        const triggerKey = `inactivity_${threshold.careLevel}`;
        const lastCareTime = this.lastCareTimes.get(triggerKey) || 0;
        const hoursSinceLastCare = (now - lastCareTime) / (1000 * 60 * 60);

        // 至少间隔阈值的一半时间才再次触发
        if (hoursSinceLastCare >= threshold.duration / 2) {
          this.lastCareTimes.set(triggerKey, now);
          return {
            type: 'inactivity',
            level: threshold.careLevel,
            duration: hoursSinceLastInteraction,
            messageTemplate: threshold.messageTemplate,
          };
        }
      }
    }

    return null;
  }

  /**
   * 检查特殊时间触发
   */
  checkSpecialTime(): CareTrigger | null {
    const now = new Date();
    const currentHour = now.getHours();
    const dayOfWeek = now.getDay();

    const specialTimeTriggers = [
      {
        timeRange: [23, 6] as [number, number],
        careType: 'late_night' as const,
        messageTemplate: '这么晚了还在呀，要注意休息哦 💙',
      },
      {
        timeRange: [0, 24] as [number, number],
        dayOfWeek: [0, 6] as number[],
        careType: 'weekend' as const,
        messageTemplate: '周末愉快！有什么计划吗？',
      },
      {
        timeRange: [22, 2] as [number, number],
        careType: 'lonely_hour' as const,
        messageTemplate: '夜深了，如果你感到孤单，我在这里陪着你 🌙',
      },
    ];

    for (const trigger of specialTimeTriggers) {
      const [startHour, endHour] = trigger.timeRange;
      let isInTimeRange = false;

      if (startHour <= endHour) {
        // 正常时间范围
        isInTimeRange = currentHour >= startHour && currentHour < endHour;
      } else {
        // 跨天时间范围（如23-6）
        isInTimeRange = currentHour >= startHour || currentHour < endHour;
      }

      // 检查星期几
      if (trigger.dayOfWeek && !trigger.dayOfWeek.includes(dayOfWeek)) {
        continue;
      }

      if (isInTimeRange) {
        const triggerKey = `special_time_${trigger.careType}`;
        const lastCareTime = this.lastCareTimes.get(triggerKey) || 0;
        const hoursSinceLastCare = (Date.now() - lastCareTime) / (1000 * 60 * 60);

        // 至少间隔6小时才再次触发
        if (hoursSinceLastCare >= 6) {
          this.lastCareTimes.set(triggerKey, Date.now());
          return {
            type: 'special_time',
            level: 'gentle',
            messageTemplate: trigger.messageTemplate,
            metadata: {
              careType: trigger.careType,
            },
          };
        }
      }
    }

    return null;
  }

  /**
   * 检查用户习惯时间触发
   */
  async checkUserHabitTime(): Promise<CareTrigger | null> {
    // 从localStorage获取用户使用历史
    const usageHistory = this.getUserUsageHistory(30); // 最近30天

    if (usageHistory.length === 0) {
      return null;
    }

    // 统计每个小时的使用频率
    const hourFrequency = new Array(24).fill(0);
    usageHistory.forEach((usage: any) => {
      const hour = new Date(usage.timestamp).getHours();
      hourFrequency[hour]++;
    });

    // 找出使用频率最高的时间段
    const avgFrequency = hourFrequency.reduce((a, b) => a + b, 0) / 24;
    const preferredHours = hourFrequency
      .map((freq, hour) => ({ hour, freq }))
      .filter(({ freq }) => freq > avgFrequency * 1.5)
      .map(({ hour }) => hour);

    if (preferredHours.length === 0) {
      return null;
    }

    const now = new Date();
    const currentHour = now.getHours();

    // 检查当前时间是否在用户习惯时间内
    if (preferredHours.includes(currentHour)) {
      const triggerKey = `habit_time_${currentHour}`;
      const lastCareTime = this.lastCareTimes.get(triggerKey) || 0;
      const hoursSinceLastCare = (Date.now() - lastCareTime) / (1000 * 60 * 60);

      // 至少间隔12小时才再次触发
      if (hoursSinceLastCare >= 12) {
        this.lastCareTimes.set(triggerKey, Date.now());
        return {
          type: 'habit_time',
          level: 'gentle',
          metadata: {
            preferredHours,
            confidence: this.calculateConfidence(hourFrequency, preferredHours),
          },
        };
      }
    }

    return null;
  }

  /**
   * 检查消极情绪触发
   */
  checkNegativeEmotion(
    currentEmotion: string,
    intensity: string,
    duration: number
  ): CareTrigger | null {
    const negativeEmotions = ['sad', 'anxious', 'angry', 'lonely', 'tired', 'confused'];

    if (!negativeEmotions.includes(currentEmotion)) {
      return null;
    }

    // 检查强度阈值
    if (intensity !== 'moderate' && intensity !== 'strong') {
      return null;
    }

    // 检查持续时间阈值（至少持续1小时）
    if (duration < 1) {
      return null;
    }

    const triggerKey = `negative_emotion_${currentEmotion}`;
    const lastCareTime = this.lastCareTimes.get(triggerKey) || 0;
    const hoursSinceLastCare = (Date.now() - lastCareTime) / (1000 * 60 * 60);

    // 至少间隔2小时才再次触发
    if (hoursSinceLastCare >= 2) {
      this.lastCareTimes.set(triggerKey, Date.now());
      return {
        type: 'negative_emotion',
        level: intensity === 'strong' ? 'strong' : 'moderate',
        duration,
        metadata: {
          emotionType: currentEmotion,
          intensity,
        },
      };
    }

    return null;
  }

  /**
   * 更新最后互动时间
   */
  updateLastInteractionTime(): void {
    this.lastInteractionTime = Date.now();
    this.saveLastInteractionTime();
  }

  /**
   * 获取用户使用历史
   */
  private getUserUsageHistory(days: number): any[] {
    try {
      const data = localStorage.getItem(`user_usage_history_${this.userId}`);
      if (!data) {
        return [];
      }
      const history = JSON.parse(data);
      const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
      return history.filter((item: any) => item.timestamp >= cutoffTime);
    } catch {
      return [];
    }
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(hourFrequency: number[], preferredHours: number[]): number {
    const totalFrequency = hourFrequency.reduce((a, b) => a + b, 0);
    const preferredFrequency = preferredHours.reduce(
      (sum, hour) => sum + hourFrequency[hour],
      0
    );
    return totalFrequency > 0 ? preferredFrequency / totalFrequency : 0;
  }

  /**
   * 保存最后互动时间
   */
  private saveLastInteractionTime(): void {
    try {
      localStorage.setItem(
        `last_interaction_time_${this.userId}`,
        this.lastInteractionTime.toString()
      );
    } catch (error) {
      console.error('[CareTriggerManager] 保存最后互动时间失败:', error);
    }
  }

  /**
   * 加载最后互动时间
   */
  private loadLastInteractionTime(): void {
    try {
      const data = localStorage.getItem(`last_interaction_time_${this.userId}`);
      if (data) {
        this.lastInteractionTime = parseInt(data, 10);
      }
    } catch (error) {
      console.error('[CareTriggerManager] 加载最后互动时间失败:', error);
    }
  }
}

