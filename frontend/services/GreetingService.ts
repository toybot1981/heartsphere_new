/**
 * 对话开场系统服务
 * 实现时间感知、情绪感知、记忆关联等开场方式
 */

/**
 * 问候类型
 */
export type GreetingType = 
  | 'time_based'
  | 'emotion_based'
  | 'memory_based'
  | 'holiday_based'
  | 'caring'
  | 'sharing'
  | 'asking'
  | 'encouraging';

/**
 * 用户情绪类型
 */
export type UserEmotion = 
  | 'happy'
  | 'sad'
  | 'anxious'
  | 'calm'
  | 'neutral';

/**
 * 记忆类型
 */
export type MemoryType = 
  | 'recent_conversation'
  | 'important_event'
  | 'user_preference'
  | 'last_visit';

/**
 * 时间感知问候
 */
export interface TimeBasedGreeting {
  timeRange: [number, number];
  greetings: string[];
}

export const TimeBasedGreetings: TimeBasedGreeting[] = [
  {
    timeRange: [5, 9],
    greetings: [
      '早上好！新的一天开始了呢 ✨',
      '早安！今天也要加油哦 💙',
      '早上好呀！昨晚睡得好吗？',
      '早上好！准备好迎接新的一天了吗？',
    ],
  },
  {
    timeRange: [9, 12],
    greetings: [
      '上午好！今天过得怎么样？',
      '上午好呀！有什么想聊的吗？',
      '上午好！看到你真好 ✨',
    ],
  },
  {
    timeRange: [12, 14],
    greetings: [
      '中午好！吃饭了吗？',
      '中午好呀！午休时间到了呢 💛',
      '中午好！今天上午过得怎么样？',
    ],
  },
  {
    timeRange: [14, 18],
    greetings: [
      '下午好！今天下午有什么安排吗？',
      '下午好呀！今天过得还好吗？',
      '下午好！想聊点什么吗？',
    ],
  },
  {
    timeRange: [18, 22],
    greetings: [
      '晚上好！今天过得怎么样？',
      '晚上好呀！一天辛苦了 💙',
      '晚上好！今天有什么想分享的吗？',
    ],
  },
  {
    timeRange: [22, 5],
    greetings: [
      '这么晚了还在呀，要注意休息哦 ✨',
      '夜深了，有什么心事想聊聊吗？',
      '晚上好！今天过得还好吗？',
    ],
  },
];

/**
 * 情绪感知问候
 */
export interface EmotionBasedGreeting {
  userEmotion: UserEmotion;
  greetings: string[];
}

export const EmotionBasedGreetings: EmotionBasedGreeting[] = [
  {
    userEmotion: 'happy',
    greetings: [
      '看起来你今天心情很好呢！有什么开心的事想分享吗？ ✨',
      '你看起来很开心！我也为你感到高兴 💙',
      '感受到你的好心情了！今天发生了什么好事吗？',
    ],
  },
  {
    userEmotion: 'sad',
    greetings: [
      '感觉你好像有点不开心...想聊聊吗？我会陪着你的 💙',
      '看起来你今天心情不太好...有什么我可以帮你的吗？',
      '如果你愿意，我随时都在这里，想说什么都可以 ✨',
    ],
  },
  {
    userEmotion: 'anxious',
    greetings: [
      '感觉你好像有些焦虑...放轻松，慢慢说，我听着呢 💙',
      '如果有什么让你担心的事，可以跟我说说，我们一起想想办法',
      '深呼吸，慢慢来，我会一直在这里支持你的 ✨',
    ],
  },
  {
    userEmotion: 'calm',
    greetings: [
      '看起来你今天很平静呢，这种状态真好 💙',
      '感受到你的平静了，这种时刻很珍贵 ✨',
      '你今天看起来很放松，想聊点什么呢？',
    ],
  },
  {
    userEmotion: 'neutral',
    greetings: [
      '你好呀！今天想聊点什么吗？ ✨',
      '看到你真好！有什么想分享的吗？',
      '你好！今天过得怎么样？',
    ],
  },
];

/**
 * 记忆关联问候模板
 */
export interface MemoryBasedGreeting {
  memoryType: MemoryType;
  template: string;
  variables: string[];
}

export const MemoryBasedGreetingTemplates: MemoryBasedGreeting[] = [
  {
    memoryType: 'recent_conversation',
    template: '上次我们聊到{话题}，现在怎么样了？',
    variables: ['话题'],
  },
  {
    memoryType: 'important_event',
    template: '还记得你说过{事件}，现在进展如何？',
    variables: ['事件'],
  },
  {
    memoryType: 'user_preference',
    template: '我知道你喜欢{偏好}，最近有新的想法吗？',
    variables: ['偏好'],
  },
  {
    memoryType: 'last_visit',
    template: '距离上次见面已经{时间}了，很想你呢 💙',
    variables: ['时间'],
  },
];

/**
 * 节日问候
 */
export interface HolidayGreeting {
  holiday: string;
  date: string;
  greetings: string[];
}

export const HolidayGreetings: HolidayGreeting[] = [
  {
    holiday: '新年',
    date: '01-01',
    greetings: [
      '新年快乐！新的一年，新的开始 ✨ 有什么新年的愿望吗？',
      '新年好！愿你在新的一年里一切都好 💙',
      '新年快乐！新的一年想聊点什么呢？',
    ],
  },
  {
    holiday: '生日',
    date: '用户生日',
    greetings: [
      '生日快乐！🎂 今天是个特殊的日子，有什么愿望吗？',
      '生日快乐呀！希望你的新一岁充满美好 ✨',
      '生日快乐！在这个特殊的日子里，想聊点什么呢？',
    ],
  },
];

/**
 * 关心式问候
 */
export const CaringGreetings = [
  '今天过得怎么样？有什么想分享的吗？ 💙',
  '你最近还好吗？想聊聊吗？',
  '感觉你好像有心事...愿意跟我说说吗？ ✨',
  '今天感觉怎么样？我在这里听着呢',
  '最近有什么让你困扰的事吗？',
];

/**
 * 分享式问候
 */
export const SharingGreetings = [
  '今天想和你分享一个有趣的想法...',
  '我发现了一些有趣的事情，想听听你的看法 ✨',
  '今天想跟你聊聊...',
  '最近想到了一些事情，想跟你分享 💙',
];

/**
 * 询问式问候
 */
export const AskingGreetings = [
  '有什么想聊的吗？我随时都在 ✨',
  '今天想聊点什么？',
  '有什么想法或感受想分享的吗？ 💙',
  '想聊点什么呢？我会认真听的',
];

/**
 * 鼓励式问候
 */
export const EncouragingGreetings = [
  '你看起来很棒！今天一定会有好事发生的 ✨',
  '你今天的状态看起来很好呢 💙',
  '看到你充满活力的样子，我也很开心！',
  '你总是能给我带来正能量 ✨',
];

/**
 * 问候上下文
 */
export interface GreetingContext {
  currentTime: Date;
  userEmotion?: UserEmotion;
  recentMemories?: Array<{
    type: MemoryType;
    content: any;
  }>;
  userPreferences?: Array<{
    type: string;
    value: any;
  }>;
  isHoliday?: boolean;
  holidayName?: string;
  daysSinceLastVisit?: number;
}

/**
 * 问候服务类
 */
export class GreetingService {
  /**
   * 根据上下文选择问候
   */
  static selectGreeting(context: GreetingContext): string {
    const candidates: Array<{ greeting: string; weight: number }> = [];
    
    // 1. 节日问候（权重：25%，如果有节日）
    if (context.isHoliday && context.holidayName) {
      const holidayGreeting = this.selectHolidayGreeting(context.holidayName);
      if (holidayGreeting) {
        const greeting = this.randomSelect(holidayGreeting.greetings);
        candidates.push({ greeting, weight: 0.25 });
      }
    }
    
    // 2. 记忆关联问候（权重：25%，如果有记忆）
    if (context.recentMemories && context.recentMemories.length > 0) {
      const memoryGreeting = this.selectMemoryBasedGreeting(context.recentMemories[0]);
      if (memoryGreeting) {
        candidates.push({ greeting: memoryGreeting, weight: 0.25 });
      }
    }
    
    // 3. 情绪感知问候（权重：25%，如果有情绪）
    if (context.userEmotion) {
      const emotionGreeting = this.selectEmotionBasedGreeting(context.userEmotion);
      const greeting = this.randomSelect(emotionGreeting.greetings);
      candidates.push({ greeting, weight: 0.25 });
    }
    
    // 4. 时间感知问候（权重：30%）
    const timeGreeting = this.selectTimeBasedGreeting(context.currentTime);
    const greeting = this.randomSelect(timeGreeting.greetings);
    candidates.push({ greeting, weight: 0.30 });
    
    // 5. 随机选择（按权重）
    return this.weightedRandomSelect(candidates);
  }
  
  /**
   * 选择时间感知问候
   */
  private static selectTimeBasedGreeting(currentTime: Date): TimeBasedGreeting {
    const hour = currentTime.getHours();
    return (
      TimeBasedGreetings.find(
        greeting => hour >= greeting.timeRange[0] && hour < greeting.timeRange[1]
      ) || TimeBasedGreetings[0]
    );
  }
  
  /**
   * 选择情绪感知问候
   */
  private static selectEmotionBasedGreeting(emotion: UserEmotion): EmotionBasedGreeting | null {
    return (
      EmotionBasedGreetings.find(g => g.userEmotion === emotion) || null
    );
  }
  
  /**
   * 选择记忆关联问候
   */
  private static selectMemoryBasedGreeting(memory: any): string | null {
    const template = MemoryBasedGreetingTemplates.find(
      t => t.memoryType === memory.type
    );
    if (!template) return null;
    
    // 填充模板变量
    let greeting = template.template;
    template.variables.forEach(variable => {
      const value = memory[variable as keyof typeof memory];
      greeting = greeting.replace(`{${variable}}`, String(value));
    });
    
    return greeting;
  }
  
  /**
   * 选择节日问候
   */
  private static selectHolidayGreeting(holidayName: string): HolidayGreeting | null {
    return (
      HolidayGreetings.find(g => g.holiday === holidayName) || null
    );
  }
  
  /**
   * 随机选择
   */
  private static randomSelect<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /**
   * 加权随机选择
   */
  private static weightedRandomSelect(candidates: Array<{ greeting: string; weight: number }>): string {
    if (candidates.length === 0) {
      return '你好呀！今天想聊点什么吗？ ✨';
    }
    
    const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
    let random = Math.random() * totalWeight;
    
    for (const candidate of candidates) {
      random -= candidate.weight;
      if (random <= 0) {
        return candidate.greeting;
      }
    }
    
    return candidates[candidates.length - 1].greeting;
  }
  
  /**
   * 获取特定类型的问候
   */
  static getGreetingByType(type: GreetingType): string {
    switch (type) {
      case 'caring':
        return this.randomSelect(CaringGreetings);
      case 'sharing':
        return this.randomSelect(SharingGreetings);
      case 'asking':
        return this.randomSelect(AskingGreetings);
      case 'encouraging':
        return this.randomSelect(EncouragingGreetings);
      default:
        return '你好呀！今天想聊点什么吗？ ✨';
    }
  }
}

export default GreetingService;




