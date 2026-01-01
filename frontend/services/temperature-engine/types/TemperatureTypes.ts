/**
 * 温度感引擎类型定义
 */

/**
 * 温度感级别
 */
export type TemperatureLevel = 'cold' | 'neutral' | 'warm' | 'hot';

/**
 * 情绪类型
 */
export type EmotionType = 
  | 'happy'      // 开心
  | 'sad'        // 难过
  | 'anxious'    // 焦虑
  | 'calm'       // 平静
  | 'excited'    // 兴奋
  | 'tired'      // 疲惫
  | 'neutral';   // 中性

/**
 * 温度感评分
 */
export interface TemperatureScore {
  /** 评分 (0-100) */
  score: number;
  /** 温度感级别 */
  level: TemperatureLevel;
  /** 各因子得分 */
  factors: {
    /** 情绪因子 (0-1) */
    emotion: number;
    /** 上下文因子 (0-1) */
    context: number;
    /** 历史因子 (0-1) */
    history: number;
    /** 交互因子 (0-1) */
    interaction: number;
  };
  /** 建议操作 */
  suggestions: TemperatureSuggestion[];
  /** 时间戳 */
  timestamp: number;
}

/**
 * 温度感建议
 */
export interface TemperatureSuggestion {
  /** 建议类型 */
  type: 'greeting' | 'expression' | 'action' | 'ui' | 'content';
  /** 优先级 */
  priority: 'low' | 'medium' | 'high';
  /** 操作 */
  action: string;
  /** 参数 */
  params?: Record<string, any>;
}

/**
 * 情绪分析结果
 */
export interface EmotionAnalysis {
  /** 情绪类型 */
  type: EmotionType;
  /** 置信度 (0-1) */
  confidence: number;
  /** 强度 (0-1) */
  intensity: number;
  /** 各因子得分 */
  factors: {
    /** 文本分析 */
    text: number;
    /** 上下文分析 */
    context: number;
    /** 历史分析 */
    history: number;
  };
  /** 建议 */
  suggestions: EmotionSuggestion[];
  /** 时间戳 */
  timestamp: number;
}

/**
 * 情绪建议
 */
export interface EmotionSuggestion {
  /** 建议类型 */
  type: 'expression' | 'greeting' | 'response';
  /** 值 */
  value: string | EmotionType;
  /** 优先级 */
  priority: 'low' | 'medium' | 'high';
}

/**
 * 上下文信息
 */
export interface TemperatureContext {
  /** 一天中的时间 */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  /** 星期几 (0-6) */
  dayOfWeek?: number;
  /** 季节 */
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  /** 天气 */
  weather?: string;
  /** 位置 */
  location?: string;
  /** 设备类型 */
  device: 'desktop' | 'mobile' | 'tablet';
  /** 连接速度 */
  connectionSpeed?: 'fast' | 'medium' | 'slow';
  /** 用户活动 */
  userActivity: {
    /** 会话时长（毫秒） */
    sessionDuration: number;
    /** 消息数量 */
    messageCount: number;
    /** 最后交互时间（毫秒前） */
    lastInteraction: number;
  };
  /** 对话信息 */
  conversation: {
    /** 对话长度 */
    length: number;
    /** 话题 */
    topic?: string;
    /** 情感倾向 */
    sentiment: 'positive' | 'neutral' | 'negative';
  };
  /** 用户情绪 */
  userEmotion?: EmotionType;
  /** 对话历史 */
  history?: any[];
}

/**
 * 温度感计算输入
 */
export interface TemperatureCalculationInput {
  /** 用户情绪 */
  userEmotion?: EmotionType;
  /** 上下文 */
  context: TemperatureContext;
  /** 历史数据 */
  history?: any[];
}

/**
 * 情绪分析输入
 */
export interface EmotionInput {
  /** 文本内容 */
  text: string;
  /** 上下文 */
  context?: Partial<TemperatureContext>;
  /** 对话历史 */
  conversationHistory?: any[];
  /** 用户画像 */
  userProfile?: any;
}

/**
 * 温度感调节选项
 */
export interface AdjustOptions {
  /** 要调节的元素 */
  elements?: string[];
  /** 是否启用动画 */
  animation?: boolean;
  /** 过渡时长（毫秒） */
  duration?: number;
  /** 其他参数 */
  [key: string]: any;
}

/**
 * 内容调节输入
 */
export interface ContentAdjustInput {
  /** 原始内容 */
  original: string;
  /** 目标温度感 */
  targetTemperature: TemperatureLevel;
  /** 上下文 */
  context?: Partial<TemperatureContext>;
  /** 其他参数 */
  params?: Record<string, any>;
}

/**
 * 引擎状态
 */
export interface EngineState {
  /** 是否运行中 */
  isRunning: boolean;
  /** 当前温度感 */
  currentTemperature: TemperatureScore | null;
  /** 当前情绪 */
  currentEmotion: EmotionAnalysis | null;
  /** 当前上下文 */
  currentContext: TemperatureContext | null;
  /** 最后更新时间 */
  lastUpdateTime: number;
}

/**
 * 引擎配置
 */
export interface TemperatureEngineConfig {
  /** 是否启用 */
  enabled: boolean;
  /** 运行模式 */
  mode: 'auto' | 'manual' | 'hybrid';
  /** 温度感配置 */
  temperature: {
    /** 默认温度感 */
    default: TemperatureLevel;
    /** 温度感范围 */
    range: {
      min: number;
      max: number;
    };
    /** 敏感度 */
    sensitivity: 'low' | 'medium' | 'high';
  };
  /** 功能配置 */
  features: {
    /** 情绪分析 */
    emotionAnalysis: boolean;
    /** 上下文感知 */
    contextAwareness: boolean;
    /** UI调节 */
    uiAdjustment: boolean;
    /** 角色调节 */
    characterAdjustment: boolean;
    /** 内容调节 */
    contentAdjustment: boolean;
  };
  /** 性能配置 */
  performance: {
    /** 更新间隔（毫秒） */
    updateInterval: number;
    /** 启用缓存 */
    cacheEnabled: boolean;
    /** 懒加载 */
    lazyLoad: boolean;
    /** 防抖延迟（毫秒） */
    debounceDelay: number;
  };
  /** 插件配置 */
  plugins: {
    /** 启用的插件ID列表 */
    enabled: string[];
    /** 插件特定配置 */
    config: Record<string, any>;
  };
  /** UI配置 */
  ui?: {
    /** 动画配置 */
    animation?: {
      enabled: boolean;
      duration: number;
      easing: string;
    };
    /** 颜色配置 */
    colors?: {
      warm?: any;
      neutral?: any;
      cold?: any;
    };
  };
}

/**
 * 默认配置
 */
export const DEFAULT_ENGINE_CONFIG: TemperatureEngineConfig = {
  enabled: true,
  mode: 'auto',
  temperature: {
    default: 'warm',
    range: {
      min: 0,
      max: 100,
    },
    sensitivity: 'medium',
  },
  features: {
    emotionAnalysis: true,
    contextAwareness: true,
    uiAdjustment: true,
    characterAdjustment: true,
    contentAdjustment: true,
  },
  performance: {
    updateInterval: 1000,
    cacheEnabled: true,
    lazyLoad: true,
    debounceDelay: 300,
  },
  plugins: {
    enabled: [],
    config: {},
  },
};




