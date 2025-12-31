/**
 * 表情插件
 * 根据温度感和情绪自动更新角色表情
 */

import { TemperaturePlugin } from '../PluginInterface';
import { TemperatureEngine } from '../../core/TemperatureEngine';
import {
  TemperatureScore,
  EmotionAnalysis,
  TemperatureLevel,
} from '../../types/TemperatureTypes';
import { CharacterAdjuster, CharacterExpression } from '../../adjusters/CharacterAdjuster';

/**
 * 表情插件类
 */
export class ExpressionPlugin implements TemperaturePlugin {
  id = 'expression';
  name = '表情插件';
  version = '1.0.0';
  description = '根据温度感和情绪自动更新角色表情';
  priority = 9;

  private engine: TemperatureEngine | null = null;
  private characterAdjuster: CharacterAdjuster;
  private currentExpression: CharacterExpression | null = null;
  private expressionCallbacks: Set<(expression: CharacterExpression) => void> = new Set();

  constructor() {
    this.characterAdjuster = new CharacterAdjuster();
  }

  /**
   * 插件初始化
   */
  async onInit(engine: TemperatureEngine): Promise<void> {
    this.engine = engine;
    console.log('[ExpressionPlugin] Initialized');
  }

  /**
   * 插件启动
   */
  async onStart(): Promise<void> {
    // 设置初始表情
    const temperature = this.engine?.getCurrentTemperature();
    if (temperature) {
      await this.updateExpression(temperature.level);
    } else {
      await this.updateExpression('neutral');
    }
    
    console.log('[ExpressionPlugin] Started');
  }

  /**
   * 温度感变化时
   */
  async onTemperatureChange(temperature: TemperatureScore): Promise<void> {
    await this.updateExpression(temperature.level);
  }

  /**
   * 情绪检测时
   */
  async onEmotionDetected(emotion: EmotionAnalysis): Promise<void> {
    const temperature = this.engine?.getCurrentTemperature();
    const level = temperature?.level || 'neutral';
    
    const config = await this.characterAdjuster.adjust(level, {
      emotion: emotion.type,
    });

    if (config.expression !== this.currentExpression) {
      this.currentExpression = config.expression;
      this.notifyExpressionChange(config.expression);
    }
  }

  /**
   * 情绪变化时
   */
  async onEmotionChanged(emotion: EmotionAnalysis): Promise<void> {
    await this.onEmotionDetected(emotion);
  }

  /**
   * 更新表情
   */
  private async updateExpression(level: TemperatureLevel): Promise<void> {
    const emotion = this.engine?.getCurrentEmotion();
    
    const config = await this.characterAdjuster.adjust(level, {
      emotion: emotion?.type,
    });

    if (config.expression !== this.currentExpression) {
      this.currentExpression = config.expression;
      this.notifyExpressionChange(config.expression);
    }
  }

  /**
   * 通知表情变化
   */
  private notifyExpressionChange(expression: CharacterExpression): void {
    this.expressionCallbacks.forEach(callback => {
      try {
        callback(expression);
      } catch (error) {
        console.error('[ExpressionPlugin] Error in expression callback:', error);
      }
    });

    // 触发自定义事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('temperatureExpressionChanged', {
          detail: { expression },
        })
      );
    }
  }

  /**
   * 注册表情变化回调
   */
  onExpressionChange(callback: (expression: CharacterExpression) => void): () => void {
    this.expressionCallbacks.add(callback);
    
    // 返回取消注册函数
    return () => {
      this.expressionCallbacks.delete(callback);
    };
  }

  /**
   * 插件方法
   */
  methods = {
    getCurrentExpression: () => this.currentExpression,
    
    setExpression: async (expression: CharacterExpression) => {
      this.currentExpression = expression;
      this.notifyExpressionChange(expression);
    },
    
    onExpressionChange: (callback: (expression: CharacterExpression) => void) => {
      return this.onExpressionChange(callback);
    },
  };
}



