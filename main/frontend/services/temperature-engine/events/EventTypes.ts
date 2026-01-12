/**
 * 温度感引擎事件类型定义
 */

/**
 * 事件监听器类型
 */
export type EventListener = (data?: any) => void;

/**
 * 温度感相关事件
 */
export type TemperatureEvent = 
  | 'temperatureChanged'      // 温度感变化
  | 'temperatureCalculated'   // 温度感计算完成
  | 'temperatureAdjusted';    // 温度感调节完成

/**
 * 情绪相关事件
 */
export type EmotionEvent =
  | 'emotionDetected'         // 情绪检测
  | 'emotionChanged'          // 情绪变化
  | 'emotionAnalyzed';        // 情绪分析完成

/**
 * 上下文相关事件
 */
export type ContextEvent =
  | 'contextUpdated'          // 上下文更新
  | 'contextChanged';         // 上下文变化

/**
 * 交互相关事件
 */
export type InteractionEvent =
  | 'userInteraction'         // 用户交互
  | 'messageSent'             // 消息发送
  | 'messageReceived';        // 消息接收

/**
 * 插件相关事件
 */
export type PluginEvent =
  | 'pluginRegistered'        // 插件注册
  | 'pluginEnabled'           // 插件启用
  | 'pluginDisabled'          // 插件禁用
  | 'pluginError';            // 插件错误

/**
 * 引擎相关事件
 */
export type EngineEvent =
  | 'engineStarted'           // 引擎启动
  | 'engineStopped'           // 引擎停止
  | 'engineError'             // 引擎错误
  | 'configUpdated';          // 配置更新

/**
 * 所有事件类型
 */
export type EngineEventType = 
  | TemperatureEvent 
  | EmotionEvent 
  | ContextEvent 
  | InteractionEvent 
  | PluginEvent 
  | EngineEvent;

/**
 * 事件数据接口
 */
export interface EventData {
  type: EngineEventType;
  timestamp: number;
  data?: any;
}




