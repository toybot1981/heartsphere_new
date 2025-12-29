/**
 * 温度感引擎核心类
 */

import { EventSystem } from '../events/EventSystem';
import { ConfigManager } from '../config/TemperatureConfig';
import { EngineStateManager } from './EngineState';
import { EmotionAnalyzer } from '../calculator/EmotionAnalyzer';
import { ContextAwareness } from '../calculator/ContextAwareness';
import { TemperatureScorer } from '../calculator/TemperatureScorer';
import { TemperaturePredictor } from '../calculator/TemperaturePredictor';
import { UIAdjuster } from '../adjusters/UIAdjuster';
import { InteractionAdjuster } from '../adjusters/InteractionAdjuster';
import { ContentAdjuster } from '../adjusters/ContentAdjuster';
import { CharacterAdjuster } from '../adjusters/CharacterAdjuster';
import { PluginManager } from '../plugins/PluginManager';
import { TemperaturePlugin } from '../plugins/PluginInterface';
import { GreetingPlugin } from '../plugins/builtin/GreetingPlugin';
import { ExpressionPlugin } from '../plugins/builtin/ExpressionPlugin';
import { DialoguePlugin } from '../plugins/builtin/DialoguePlugin';
import {
  TemperatureEngineConfig,
  TemperatureScore,
  TemperatureCalculationInput,
  EmotionAnalysis,
  EmotionInput,
  TemperatureLevel,
  AdjustOptions,
  ContentAdjustInput,
  TemperatureContext,
  EngineEventType,
  EmotionType,
} from '../types/TemperatureTypes';

/**
 * 温度感引擎类
 */
export class TemperatureEngine {
  private eventSystem: EventSystem;
  private configManager: ConfigManager;
  private stateManager: EngineStateManager;
  private emotionAnalyzer: EmotionAnalyzer;
  private contextAwareness: ContextAwareness;
  private temperatureScorer: TemperatureScorer;
  private temperaturePredictor: TemperaturePredictor;
  private uiAdjuster: UIAdjuster;
  private interactionAdjuster: InteractionAdjuster;
  private contentAdjuster: ContentAdjuster;
  private characterAdjuster: CharacterAdjuster;
  private pluginManager: PluginManager;
  private isInitialized: boolean = false;

  constructor(config?: Partial<TemperatureEngineConfig>) {
    // 初始化配置管理器
    this.configManager = new ConfigManager(config);
    
    // 初始化事件系统
    this.eventSystem = new EventSystem();
    
    // 初始化状态管理器
    this.stateManager = new EngineStateManager(this.eventSystem);
    
    // 初始化计算层
    this.emotionAnalyzer = new EmotionAnalyzer();
    this.contextAwareness = new ContextAwareness();
    this.temperatureScorer = new TemperatureScorer();
    this.temperaturePredictor = new TemperaturePredictor();
    
    // 初始化调节层
    this.uiAdjuster = new UIAdjuster();
    this.interactionAdjuster = new InteractionAdjuster();
    this.contentAdjuster = new ContentAdjuster();
    this.characterAdjuster = new CharacterAdjuster();
    
    // 初始化插件管理器
    this.pluginManager = new PluginManager(this, this.eventSystem, this.configManager);
    
    // 注册内置插件
    this.registerBuiltinPlugins();
    
    this.isInitialized = true;
  }

  /**
   * 启动引擎
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Engine not initialized');
    }

    if (this.stateManager.isRunning()) {
      console.warn('[TemperatureEngine] Engine is already running');
      return;
    }

    const config = this.configManager.getConfig();
    if (!config.enabled) {
      console.warn('[TemperatureEngine] Engine is disabled in config');
      return;
    }

    // 初始化插件
    await this.pluginManager.init();

    this.stateManager.setRunning(true);
    
    // 启动插件
    await this.pluginManager.start();
    
    this.eventSystem.emit('engineStarted');
    
    console.log('[TemperatureEngine] Engine started');
  }

  /**
   * 停止引擎
   */
  async stop(): Promise<void> {
    if (!this.stateManager.isRunning()) {
      console.warn('[TemperatureEngine] Engine is not running');
      return;
    }

    // 停止插件
    await this.pluginManager.stop();

    this.stateManager.setRunning(false);
    this.eventSystem.emit('engineStopped');
    
    console.log('[TemperatureEngine] Engine stopped');
  }

  /**
   * 计算温度感
   */
  async calculateTemperature(input: TemperatureCalculationInput): Promise<TemperatureScore> {
    if (!this.stateManager.isRunning()) {
      throw new Error('Engine is not running');
    }

    const config = this.configManager.getConfig();
    if (!config.features.contextAwareness) {
      // 如果上下文感知未启用，返回默认温度感
      return this.getDefaultTemperature();
    }

    // 构建完整上下文
    const fullContext = this.contextAwareness.buildContext(input.context);
    this.stateManager.updateContext(fullContext);
    
    // 分发事件到插件
    await this.pluginManager.dispatchEvent('contextUpdated', fullContext);

    // 使用温度感评分器计算
    const temperature = await this.temperatureScorer.calculate({
      userEmotion: input.userEmotion,
      context: fullContext,
      history: input.history,
    });

    // 更新状态
    this.stateManager.updateTemperature(temperature);

    // 添加到预测器历史
    this.temperaturePredictor.addDataPoint(temperature);

    // 触发事件
    this.eventSystem.emit('temperatureCalculated', temperature);

    // 分发事件到插件
    await this.pluginManager.dispatchEvent('temperatureCalculated', temperature);
    await this.pluginManager.dispatchEvent('temperatureChanged', temperature);

    return temperature;
  }

  /**
   * 分析情绪
   */
  async analyzeEmotion(input: EmotionInput): Promise<EmotionAnalysis> {
    if (!this.stateManager.isRunning()) {
      throw new Error('Engine is not running');
    }

    const config = this.configManager.getConfig();
    if (!config.features.emotionAnalysis) {
      // 如果情绪分析未启用，返回中性情绪
      return this.getDefaultEmotion();
    }

    // 构建上下文
    const context = this.contextAwareness.buildContext(input.context);

    // 使用情绪分析器分析
    const emotion = await this.emotionAnalyzer.analyze({
      ...input,
      context,
    });

    // 更新状态
    this.stateManager.updateEmotion(emotion);

    // 分发事件到插件
    await this.pluginManager.dispatchEvent('emotionDetected', emotion);
    await this.pluginManager.dispatchEvent('emotionAnalyzed', emotion);

    return emotion;
  }

  /**
   * 调节温度感
   */
  async adjustTemperature(
    target: TemperatureLevel,
    options?: AdjustOptions
  ): Promise<void> {
    if (!this.stateManager.isRunning()) {
      throw new Error('Engine is not running');
    }

    const config = this.configManager.getConfig();

    // UI调节
    if (config.features.uiAdjustment) {
      await this.uiAdjuster.adjust(target, options);
    }

    // 交互调节
    if (config.features.uiAdjustment) {
      await this.interactionAdjuster.adjust(target, options);
    }

    // 触发事件
    this.eventSystem.emit('temperatureAdjusted', { target, options });
    
    // 分发事件到插件
    await this.pluginManager.dispatchEvent('temperatureAdjusted', { target, options });
    
    console.log(`[TemperatureEngine] Temperature adjusted to: ${target}`);
  }

  /**
   * 调节内容温度感
   */
  async adjustContent(input: ContentAdjustInput): Promise<string> {
    if (!this.stateManager.isRunning()) {
      throw new Error('Engine is not running');
    }

    const config = this.configManager.getConfig();
    if (!config.features.contentAdjustment) {
      // 如果内容调节未启用，返回原始内容
      return input.original;
    }

    // 使用内容调节器
    return await this.contentAdjuster.adjust(input);
  }

  /**
   * 事件监听
   */
  on(event: EngineEventType, listener: (data?: any) => void): void {
    this.eventSystem.on(event, listener);
  }

  /**
   * 移除事件监听
   */
  off(event: EngineEventType, listener: (data?: any) => void): void {
    this.eventSystem.off(event, listener);
  }

  /**
   * 一次性事件监听
   */
  once(event: EngineEventType, listener: (data?: any) => void): void {
    this.eventSystem.once(event, listener);
  }

  /**
   * 获取配置
   */
  getConfig(): TemperatureEngineConfig {
    return this.configManager.getConfig();
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<TemperatureEngineConfig>): void {
    this.configManager.updateConfig(updates);
    this.eventSystem.emit('configUpdated', updates);
  }

  /**
   * 获取状态
   */
  getState() {
    return this.stateManager.getState();
  }

  /**
   * 获取当前温度感
   */
  getCurrentTemperature(): TemperatureScore | null {
    return this.stateManager.getCurrentTemperature();
  }

  /**
   * 获取当前情绪
   */
  getCurrentEmotion(): EmotionAnalysis | null {
    return this.stateManager.getCurrentEmotion();
  }

  /**
   * 获取当前上下文
   */
  getCurrentContext(): TemperatureContext | null {
    return this.stateManager.getCurrentContext();
  }

  /**
   * 预测温度感
   */
  predictTemperature(timeRange: number = 60000) {
    return this.temperaturePredictor.predict(timeRange);
  }

  /**
   * 获取上下文分析
   */
  analyzeContext(context?: Partial<TemperatureContext>) {
    const fullContext = this.contextAwareness.buildContext(context);
    return this.contextAwareness.analyzeContext(fullContext);
  }

  /**
   * 获取上下文建议
   */
  getContextSuggestions(context?: Partial<TemperatureContext>) {
    const fullContext = this.contextAwareness.buildContext(context);
    return this.contextAwareness.getContextSuggestions(fullContext);
  }

  /**
   * 调节角色
   */
  async adjustCharacter(
    targetLevel: TemperatureLevel,
    options?: {
      emotion?: EmotionType;
      context?: any;
    }
  ) {
    if (!this.stateManager.isRunning()) {
      throw new Error('Engine is not running');
    }

    const config = this.configManager.getConfig();
    if (!config.features.characterAdjustment) {
      return null;
    }

    return await this.characterAdjuster.adjust(targetLevel, options);
  }

  /**
   * 生成问候语
   */
  generateGreeting(
    level: TemperatureLevel,
    context?: Partial<TemperatureContext>
  ): string {
    return this.contentAdjuster.generateGreeting(level, context);
  }

  /**
   * 生成鼓励语
   */
  generateEncouragement(level: TemperatureLevel): string {
    return this.contentAdjuster.generateEncouragement(level);
  }

  /**
   * 生成告别语
   */
  generateFarewell(level: TemperatureLevel): string {
    return this.contentAdjuster.generateFarewell(level);
  }

  /**
   * 获取UI调节器
   */
  getUIAdjuster(): UIAdjuster {
    return this.uiAdjuster;
  }

  /**
   * 获取交互调节器
   */
  getInteractionAdjuster(): InteractionAdjuster {
    return this.interactionAdjuster;
  }

  /**
   * 获取内容调节器
   */
  getContentAdjuster(): ContentAdjuster {
    return this.contentAdjuster;
  }

  /**
   * 获取角色调节器
   */
  getCharacterAdjuster(): CharacterAdjuster {
    return this.characterAdjuster;
  }

  /**
   * 检查是否运行中
   */
  isRunning(): boolean {
    return this.stateManager.isRunning();
  }

  /**
   * 获取默认温度感
   */
  private getDefaultTemperature(): TemperatureScore {
    const config = this.configManager.getConfig();
    const defaultLevel = config.temperature.default;
    
    return {
      score: this.levelToScore(defaultLevel),
      level: defaultLevel,
      factors: {
        emotion: 0.5,
        context: 0.5,
        history: 0.5,
        interaction: 0.5,
      },
      suggestions: [],
      timestamp: Date.now(),
    };
  }

  /**
   * 获取默认情绪
   */
  private getDefaultEmotion(): EmotionAnalysis {
    return {
      type: 'neutral',
      confidence: 0.5,
      intensity: 0.5,
      factors: {
        text: 0.5,
        context: 0.5,
        history: 0.5,
      },
      suggestions: [],
      timestamp: Date.now(),
    };
  }

  /**
   * 温度感级别转分数
   */
  private levelToScore(level: TemperatureLevel): number {
    const mapping = {
      cold: 25,
      neutral: 50,
      warm: 75,
      hot: 90,
    };
    return mapping[level];
  }

  /**
   * 注册内置插件
   */
  private registerBuiltinPlugins(): void {
    const config = this.configManager.getConfig();
    const enabledPlugins = config.plugins.enabled || [];

    // 注册问候插件
    if (enabledPlugins.length === 0 || enabledPlugins.includes('greeting')) {
      this.pluginManager.registerPlugin(new GreetingPlugin());
    }

    // 注册表情插件
    if (enabledPlugins.length === 0 || enabledPlugins.includes('expression')) {
      this.pluginManager.registerPlugin(new ExpressionPlugin());
    }

    // 注册对话插件
    if (enabledPlugins.length === 0 || enabledPlugins.includes('dialogue')) {
      this.pluginManager.registerPlugin(new DialoguePlugin());
    }
  }

  /**
   * 注册自定义插件
   */
  async registerPlugin(plugin: TemperaturePlugin): Promise<void> {
    await this.pluginManager.registerPlugin(plugin);
  }

  /**
   * 注销插件
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    await this.pluginManager.unregisterPlugin(pluginId);
  }

  /**
   * 启用插件
   */
  async enablePlugin(pluginId: string): Promise<void> {
    await this.pluginManager.enablePlugin(pluginId);
  }

  /**
   * 禁用插件
   */
  async disablePlugin(pluginId: string): Promise<void> {
    await this.pluginManager.disablePlugin(pluginId);
  }

  /**
   * 获取插件管理器
   */
  getPluginManager(): PluginManager {
    return this.pluginManager;
  }

  /**
   * 调用插件方法
   */
  callPluginMethod(pluginId: string, methodName: string, ...args: any[]): any {
    return this.pluginManager.callPluginMethod(pluginId, methodName, ...args);
  }

  /**
   * 销毁引擎
   */
  async destroy(): Promise<void> {
    await this.stop();
    
    // 销毁插件
    await this.pluginManager.destroy();
    
    // 重置调节器
    this.uiAdjuster.reset();
    this.interactionAdjuster.reset();
    
    this.stateManager.reset();
    this.eventSystem.removeAllListeners();
    this.isInitialized = false;
  }
}

