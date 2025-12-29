/**
 * 温度感引擎插件接口
 */

import {
  TemperatureScore,
  EmotionAnalysis,
  TemperatureContext,
  TemperatureLevel,
  EngineEventType,
} from '../types/TemperatureTypes';
import { TemperatureEngine } from '../core/TemperatureEngine';

/**
 * 插件配置
 */
export interface PluginConfig {
  [key: string]: any;
}

/**
 * 用户交互信息
 */
export interface UserInteraction {
  type: 'click' | 'hover' | 'input' | 'message' | 'other';
  target?: string;
  data?: any;
  timestamp: number;
}

/**
 * 温度感引擎插件接口
 */
export interface TemperaturePlugin {
  /** 插件ID（唯一标识） */
  id: string;
  
  /** 插件名称 */
  name: string;
  
  /** 插件版本 */
  version: string;
  
  /** 插件描述 */
  description?: string;
  
  /** 插件作者 */
  author?: string;
  
  /** 插件配置 */
  config?: PluginConfig;
  
  /** 是否启用 */
  enabled?: boolean;
  
  /** 优先级（数字越大优先级越高） */
  priority?: number;

  // ========== 生命周期钩子 ==========
  
  /**
   * 插件初始化（引擎创建时调用）
   */
  onInit?: (engine: TemperatureEngine) => void | Promise<void>;
  
  /**
   * 插件启动（引擎启动时调用）
   */
  onStart?: () => void | Promise<void>;
  
  /**
   * 插件停止（引擎停止时调用）
   */
  onStop?: () => void | Promise<void>;
  
  /**
   * 插件销毁（引擎销毁时调用）
   */
  onDestroy?: () => void | Promise<void>;

  // ========== 事件钩子 ==========
  
  /**
   * 温度感变化时调用
   */
  onTemperatureChange?: (temperature: TemperatureScore) => void | Promise<void>;
  
  /**
   * 温度感计算完成时调用
   */
  onTemperatureCalculated?: (temperature: TemperatureScore) => void | Promise<void>;
  
  /**
   * 温度感调节完成时调用
   */
  onTemperatureAdjusted?: (level: TemperatureLevel, options?: any) => void | Promise<void>;
  
  /**
   * 情绪检测时调用
   */
  onEmotionDetected?: (emotion: EmotionAnalysis) => void | Promise<void>;
  
  /**
   * 情绪变化时调用
   */
  onEmotionChanged?: (emotion: EmotionAnalysis) => void | Promise<void>;
  
  /**
   * 情绪分析完成时调用
   */
  onEmotionAnalyzed?: (emotion: EmotionAnalysis) => void | Promise<void>;
  
  /**
   * 上下文更新时调用
   */
  onContextUpdated?: (context: TemperatureContext) => void | Promise<void>;
  
  /**
   * 上下文变化时调用
   */
  onContextChanged?: (context: TemperatureContext) => void | Promise<void>;
  
  /**
   * 用户交互时调用
   */
  onUserInteraction?: (interaction: UserInteraction) => void | Promise<void>;
  
  /**
   * 消息发送时调用
   */
  onMessageSent?: (message: string, context?: any) => void | Promise<void>;
  
  /**
   * 消息接收时调用
   */
  onMessageReceived?: (message: string, context?: any) => void | Promise<void>;
  
  /**
   * 配置更新时调用
   */
  onConfigUpdated?: (config: any) => void | Promise<void>;

  // ========== 插件方法 ==========
  
  /**
   * 插件提供的方法（可选）
   */
  methods?: {
    [methodName: string]: (...args: any[]) => any;
  };
}

/**
 * 插件状态
 */
export interface PluginState {
  /** 是否已初始化 */
  initialized: boolean;
  /** 是否运行中 */
  running: boolean;
  /** 错误信息 */
  error?: string;
  /** 最后更新时间 */
  lastUpdateTime: number;
}

/**
 * 插件注册信息
 */
export interface PluginRegistration {
  plugin: TemperaturePlugin;
  state: PluginState;
  instance: any;
}

