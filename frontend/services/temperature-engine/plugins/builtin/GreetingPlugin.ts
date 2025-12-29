/**
 * 问候插件
 * 根据温度感、时间、情绪等自动生成和显示问候语
 */

import { TemperaturePlugin } from '../PluginInterface';
import { TemperatureEngine } from '../../core/TemperatureEngine';
import {
  TemperatureScore,
  EmotionAnalysis,
  TemperatureContext,
  TemperatureLevel,
} from '../../types/TemperatureTypes';
import { ContentAdjuster } from '../../adjusters/ContentAdjuster';

/**
 * 问候插件类
 */
export class GreetingPlugin implements TemperaturePlugin {
  id = 'greeting';
  name = '问候插件';
  version = '1.0.0';
  description = '根据温度感、时间、情绪自动生成和显示问候语';
  priority = 8;

  private engine: TemperatureEngine | null = null;
  private contentAdjuster: ContentAdjuster;
  private lastGreeting: string | null = null;
  private greetingDisplayElement: HTMLElement | null = null;

  constructor() {
    this.contentAdjuster = new ContentAdjuster();
  }

  /**
   * 插件初始化
   */
  async onInit(engine: TemperatureEngine): Promise<void> {
    this.engine = engine;
    console.log('[GreetingPlugin] Initialized');
  }

  /**
   * 插件启动
   */
  async onStart(): Promise<void> {
    // 创建问候语显示元素
    this.createGreetingDisplay();
    
    // 显示初始问候语
    await this.showInitialGreeting();
    
    console.log('[GreetingPlugin] Started');
  }

  /**
   * 温度感变化时
   */
  async onTemperatureChange(temperature: TemperatureScore): Promise<void> {
    // 如果温度感变为warm或hot，显示问候语
    if (temperature.level === 'warm' || temperature.level === 'hot') {
      await this.showGreeting(temperature.level);
    }
  }

  /**
   * 情绪检测时
   */
  async onEmotionDetected(emotion: EmotionAnalysis): Promise<void> {
    // 根据情绪调整问候语
    const context = this.engine?.getCurrentContext();
    const greeting = this.contentAdjuster.generateGreeting('warm', context || undefined);
    
    if (greeting !== this.lastGreeting) {
      await this.displayGreeting(greeting);
      this.lastGreeting = greeting;
    }
  }

  /**
   * 上下文更新时
   */
  async onContextUpdated(context: TemperatureContext): Promise<void> {
    // 根据上下文（如时间变化）更新问候语
    const temperature = this.engine?.getCurrentTemperature();
    if (temperature) {
      await this.showGreeting(temperature.level, context);
    }
  }

  /**
   * 显示初始问候语
   */
  private async showInitialGreeting(): Promise<void> {
    const context = this.engine?.getCurrentContext();
    const greeting = this.contentAdjuster.generateGreeting('warm', context || undefined);
    await this.displayGreeting(greeting);
    this.lastGreeting = greeting;
  }

  /**
   * 显示问候语
   */
  private async showGreeting(
    level: TemperatureLevel,
    context?: TemperatureContext
  ): Promise<void> {
    const greeting = this.contentAdjuster.generateGreeting(level, context);
    
    if (greeting !== this.lastGreeting) {
      await this.displayGreeting(greeting);
      this.lastGreeting = greeting;
    }
  }

  /**
   * 创建问候语显示元素
   */
  private createGreetingDisplay(): void {
    // 检查是否已存在
    const existing = document.getElementById('temperature-greeting-display');
    if (existing) {
      this.greetingDisplayElement = existing;
      return;
    }

    // 创建显示元素
    const element = document.createElement('div');
    element.id = 'temperature-greeting-display';
    element.className = 'temperature-greeting';
    element.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #FF9999 0%, #FFB3B3 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 24px;
      box-shadow: 0 4px 16px rgba(255, 153, 153, 0.3);
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transition: opacity 0.3s ease-out;
      pointer-events: none;
    `;

    document.body.appendChild(element);
    this.greetingDisplayElement = element;
  }

  /**
   * 显示问候语
   */
  private async displayGreeting(greeting: string): Promise<void> {
    if (!this.greetingDisplayElement) {
      this.createGreetingDisplay();
    }

    if (!this.greetingDisplayElement) {
      return;
    }

    // 更新内容
    this.greetingDisplayElement.textContent = greeting;
    
    // 显示动画
    this.greetingDisplayElement.style.opacity = '1';
    
    // 3秒后淡出
    setTimeout(() => {
      if (this.greetingDisplayElement) {
        this.greetingDisplayElement.style.opacity = '0';
      }
    }, 3000);
  }

  /**
   * 插件停止
   */
  async onStop(): Promise<void> {
    if (this.greetingDisplayElement) {
      this.greetingDisplayElement.style.opacity = '0';
    }
  }

  /**
   * 插件销毁
   */
  async onDestroy(): Promise<void> {
    if (this.greetingDisplayElement) {
      this.greetingDisplayElement.remove();
      this.greetingDisplayElement = null;
    }
    this.lastGreeting = null;
  }

  /**
   * 插件方法：手动显示问候语
   */
  methods = {
    showGreeting: async (level: TemperatureLevel, context?: TemperatureContext) => {
      await this.showGreeting(level, context);
    },
    
    hideGreeting: () => {
      if (this.greetingDisplayElement) {
        this.greetingDisplayElement.style.opacity = '0';
      }
    },
  };
}

