/**
 * 温度感引擎状态管理
 */

import { EngineState, TemperatureScore, EmotionAnalysis, TemperatureContext } from '../types/TemperatureTypes';
import { EventSystem } from '../events/EventSystem';

/**
 * 引擎状态管理器
 */
export class EngineStateManager {
  private state: EngineState;
  private eventSystem: EventSystem;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.state = {
      isRunning: false,
      currentTemperature: null,
      currentEmotion: null,
      currentContext: null,
      lastUpdateTime: 0,
    };
  }

  /**
   * 获取当前状态
   */
  getState(): EngineState {
    return { ...this.state };
  }

  /**
   * 设置运行状态
   */
  setRunning(isRunning: boolean): void {
    if (this.state.isRunning !== isRunning) {
      this.state.isRunning = isRunning;
      this.state.lastUpdateTime = Date.now();
      this.eventSystem.emit(isRunning ? 'engineStarted' : 'engineStopped');
    }
  }

  /**
   * 更新温度感
   */
  updateTemperature(temperature: TemperatureScore): void {
    const previous = this.state.currentTemperature;
    this.state.currentTemperature = temperature;
    this.state.lastUpdateTime = Date.now();

    // 如果温度感发生变化，触发事件
    if (!previous || previous.level !== temperature.level || previous.score !== temperature.score) {
      this.eventSystem.emit('temperatureChanged', temperature);
    }
    
    this.eventSystem.emit('temperatureCalculated', temperature);
  }

  /**
   * 更新情绪
   */
  updateEmotion(emotion: EmotionAnalysis): void {
    const previous = this.state.currentEmotion;
    this.state.currentEmotion = emotion;
    this.state.lastUpdateTime = Date.now();

    // 如果情绪发生变化，触发事件
    if (!previous || previous.type !== emotion.type) {
      this.eventSystem.emit('emotionChanged', emotion);
    }
    
    this.eventSystem.emit('emotionDetected', emotion);
    this.eventSystem.emit('emotionAnalyzed', emotion);
  }

  /**
   * 更新上下文
   */
  updateContext(context: TemperatureContext): void {
    const previous = this.state.currentContext;
    this.state.currentContext = context;
    this.state.lastUpdateTime = Date.now();

    // 如果上下文发生变化，触发事件
    if (previous && this.hasContextChanged(previous, context)) {
      this.eventSystem.emit('contextChanged', context);
    }
    
    this.eventSystem.emit('contextUpdated', context);
  }

  /**
   * 检查上下文是否发生变化
   */
  private hasContextChanged(prev: TemperatureContext, current: TemperatureContext): boolean {
    return (
      prev.timeOfDay !== current.timeOfDay ||
      prev.device !== current.device ||
      prev.userActivity.sessionDuration !== current.userActivity.sessionDuration ||
      prev.conversation.length !== current.conversation.length ||
      prev.conversation.sentiment !== current.conversation.sentiment
    );
  }

  /**
   * 获取当前温度感
   */
  getCurrentTemperature(): TemperatureScore | null {
    return this.state.currentTemperature;
  }

  /**
   * 获取当前情绪
   */
  getCurrentEmotion(): EmotionAnalysis | null {
    return this.state.currentEmotion;
  }

  /**
   * 获取当前上下文
   */
  getCurrentContext(): TemperatureContext | null {
    return this.state.currentContext;
  }

  /**
   * 检查是否运行中
   */
  isRunning(): boolean {
    return this.state.isRunning;
  }

  /**
   * 重置状态
   */
  reset(): void {
    this.state = {
      isRunning: false,
      currentTemperature: null,
      currentEmotion: null,
      currentContext: null,
      lastUpdateTime: 0,
    };
  }

  /**
   * 获取状态快照
   */
  getSnapshot(): EngineState {
    return {
      isRunning: this.state.isRunning,
      currentTemperature: this.state.currentTemperature
        ? { ...this.state.currentTemperature }
        : null,
      currentEmotion: this.state.currentEmotion
        ? { ...this.state.currentEmotion }
        : null,
      currentContext: this.state.currentContext
        ? { ...this.state.currentContext }
        : null,
      lastUpdateTime: this.state.lastUpdateTime,
    };
  }
}

