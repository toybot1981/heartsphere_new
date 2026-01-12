/**
 * 温度感引擎主入口
 */

// 核心类
export { TemperatureEngine } from './core/TemperatureEngine';
export { EngineAPI } from './core/EngineAPI';
export { EngineStateManager } from './core/EngineState';

// 配置
export { ConfigManager } from './config/TemperatureConfig';

// 事件系统
export { EventSystem } from './events/EventSystem';

// 计算层
export { EmotionAnalyzer } from './calculator/EmotionAnalyzer';
export { ContextAwareness } from './calculator/ContextAwareness';
export { TemperatureScorer } from './calculator/TemperatureScorer';
export { TemperaturePredictor } from './calculator/TemperaturePredictor';
export type { TemperaturePrediction } from './calculator/TemperaturePredictor';

// 调节层
export { UIAdjuster } from './adjusters/UIAdjuster';
export { InteractionAdjuster } from './adjusters/InteractionAdjuster';
export { ContentAdjuster } from './adjusters/ContentAdjuster';
export { CharacterAdjuster } from './adjusters/CharacterAdjuster';
export type { CharacterExpression, CharacterAction } from './adjusters/CharacterAdjuster';

// 插件系统
export { PluginManager } from './plugins/PluginManager';
export type { TemperaturePlugin, PluginConfig, PluginState, UserInteraction } from './plugins/PluginInterface';
export { GreetingPlugin } from './plugins/builtin/GreetingPlugin';
export { ExpressionPlugin } from './plugins/builtin/ExpressionPlugin';
export { DialoguePlugin } from './plugins/builtin/DialoguePlugin';

// 类型定义
export * from './types/TemperatureTypes';
export * from './events/EventTypes';

// React Hooks
export { useTemperatureEngine } from './hooks/useTemperatureEngine';

// 默认导出API类（推荐使用）
import { EngineAPI } from './core/EngineAPI';
export default EngineAPI;

