/**
 * 温度感引擎对外API
 * 提供简化的API接口，方便使用
 */

import { TemperatureEngine } from './TemperatureEngine';
import {
  TemperatureEngineConfig,
  TemperatureCalculationInput,
  EmotionInput,
  TemperatureLevel,
  AdjustOptions,
  ContentAdjustInput,
} from '../types/TemperatureTypes';

/**
 * 引擎API类
 * 提供更友好的API接口
 */
export class EngineAPI {
  private engine: TemperatureEngine;

  constructor(config?: Partial<TemperatureEngineConfig>) {
    this.engine = new TemperatureEngine(config);
  }

  /**
   * 启动引擎
   */
  async start(): Promise<void> {
    return await this.engine.start();
  }

  /**
   * 停止引擎
   */
  async stop(): Promise<void> {
    return await this.engine.stop();
  }

  /**
   * 计算温度感（简化版）
   */
  async calculate(input: TemperatureCalculationInput) {
    return await this.engine.calculateTemperature(input);
  }

  /**
   * 分析情绪（简化版）
   */
  async analyzeEmotion(input: EmotionInput) {
    return await this.engine.analyzeEmotion(input);
  }

  /**
   * 调节温度感（简化版）
   */
  async adjust(target: TemperatureLevel, options?: AdjustOptions) {
    return await this.engine.adjustTemperature(target, options);
  }

  /**
   * 调节内容（简化版）
   */
  async adjustContent(input: ContentAdjustInput) {
    return await this.engine.adjustContent(input);
  }

  /**
   * 获取当前温度感
   */
  getTemperature() {
    return this.engine.getCurrentTemperature();
  }

  /**
   * 获取当前情绪
   */
  getEmotion() {
    return this.engine.getCurrentEmotion();
  }

  /**
   * 获取配置
   */
  getConfig() {
    return this.engine.getConfig();
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<TemperatureEngineConfig>) {
    this.engine.updateConfig(updates);
  }

  /**
   * 事件监听
   */
  on(event: string, listener: (data?: any) => void) {
    this.engine.on(event as any, listener);
  }

  /**
   * 移除事件监听
   */
  off(event: string, listener: (data?: any) => void) {
    this.engine.off(event as any, listener);
  }

  /**
   * 获取底层引擎实例（高级用法）
   */
  getEngine(): TemperatureEngine {
    return this.engine;
  }
}




