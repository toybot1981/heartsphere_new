/**
 * 交互调节器
 * 根据温度感调整交互行为、反馈方式、响应速度等
 */

import { TemperatureLevel, TemperatureScore } from '../types/TemperatureTypes';

/**
 * 交互配置
 */
interface InteractionConfig {
  /** 反馈延迟（毫秒） */
  feedbackDelay: number;
  /** 动画持续时间（毫秒） */
  animationDuration: number;
  /** 反馈强度 */
  feedbackIntensity: 'subtle' | 'normal' | 'strong';
  /** 是否启用触觉反馈 */
  hapticFeedback: boolean;
  /** 声音反馈 */
  soundFeedback: {
    enabled: boolean;
    volume: number;
  };
}

/**
 * 交互调节器类
 */
export class InteractionAdjuster {
  private currentConfig: InteractionConfig | null = null;

  /**
   * 调节交互温度感
   */
  async adjust(
    targetLevel: TemperatureLevel,
    options?: {
      elements?: string[];
      haptic?: boolean;
      sound?: boolean;
    }
  ): Promise<void> {
    const config = this.getInteractionConfig(targetLevel);
    
    // 应用配置
    this.applyConfig(config, options);
    
    // 更新当前配置
    this.currentConfig = config;
  }

  /**
   * 根据温度感级别获取交互配置
   */
  private getInteractionConfig(level: TemperatureLevel): InteractionConfig {
    const configs: Record<TemperatureLevel, InteractionConfig> = {
      cold: {
        feedbackDelay: 150,
        animationDuration: 200,
        feedbackIntensity: 'subtle',
        hapticFeedback: false,
        soundFeedback: {
          enabled: false,
          volume: 0,
        },
      },
      neutral: {
        feedbackDelay: 100,
        animationDuration: 250,
        feedbackIntensity: 'normal',
        hapticFeedback: false,
        soundFeedback: {
          enabled: false,
          volume: 0,
        },
      },
      warm: {
        feedbackDelay: 50,
        animationDuration: 300,
        feedbackIntensity: 'normal',
        hapticFeedback: true,
        soundFeedback: {
          enabled: true,
          volume: 0.3,
        },
      },
      hot: {
        feedbackDelay: 30,
        animationDuration: 350,
        feedbackIntensity: 'strong',
        hapticFeedback: true,
        soundFeedback: {
          enabled: true,
          volume: 0.5,
        },
      },
    };

    return configs[level];
  }

  /**
   * 应用配置
   */
  private applyConfig(
    config: InteractionConfig,
    options?: {
      elements?: string[];
      haptic?: boolean;
      sound?: boolean;
    }
  ): void {
    // 应用CSS变量
    const root = document.documentElement;
    root.style.setProperty('--interaction-feedback-delay', `${config.feedbackDelay}ms`);
    root.style.setProperty('--interaction-animation-duration', `${config.animationDuration}ms`);
    root.style.setProperty('--interaction-feedback-intensity', config.feedbackIntensity);

    // 设置触觉反馈
    if (options?.haptic !== false && config.hapticFeedback) {
      this.enableHapticFeedback(config.feedbackIntensity);
    }

    // 设置声音反馈
    if (options?.sound !== false && config.soundFeedback.enabled) {
      this.enableSoundFeedback(config.soundFeedback.volume);
    }
  }

  /**
   * 启用触觉反馈
   */
  private enableHapticFeedback(intensity: 'subtle' | 'normal' | 'strong'): void {
    // 检查是否支持触觉反馈
    if (!('vibrate' in navigator)) {
      return;
    }

    // 根据强度设置震动模式
    const patterns: Record<string, number[]> = {
      subtle: [10],
      normal: [20],
      strong: [30, 10, 30],
    };

    // 为按钮点击添加触觉反馈
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        navigator.vibrate(patterns[intensity]);
      }
    }, { once: false });
  }

  /**
   * 启用声音反馈
   */
  private enableSoundFeedback(volume: number): void {
    // 创建音频上下文（如果需要）
    // 这里只是示例，实际实现可能需要音频文件
    console.log('[InteractionAdjuster] Sound feedback enabled with volume:', volume);
  }

  /**
   * 添加交互反馈
   */
  addFeedback(
    element: HTMLElement,
    type: 'click' | 'hover' | 'focus',
    config?: Partial<InteractionConfig>
  ): void {
    const finalConfig = config || this.currentConfig || this.getInteractionConfig('warm');

    switch (type) {
      case 'click':
        element.addEventListener('click', () => {
          this.handleClickFeedback(element, finalConfig);
        });
        break;

      case 'hover':
        element.addEventListener('mouseenter', () => {
          this.handleHoverFeedback(element, finalConfig);
        });
        break;

      case 'focus':
        element.addEventListener('focus', () => {
          this.handleFocusFeedback(element, finalConfig);
        });
        break;
    }
  }

  /**
   * 处理点击反馈
   */
  private handleClickFeedback(element: HTMLElement, config: InteractionConfig): void {
    // 添加点击动画
    element.style.transition = `transform ${config.animationDuration}ms ease-out`;
    element.style.transform = 'scale(0.95)';

    setTimeout(() => {
      element.style.transform = 'scale(1)';
    }, config.feedbackDelay);

    // 触觉反馈
    if (config.hapticFeedback && 'vibrate' in navigator) {
      const patterns: Record<string, number[]> = {
        subtle: [10],
        normal: [20],
        strong: [30, 10, 30],
      };
      navigator.vibrate(patterns[config.feedbackIntensity]);
    }
  }

  /**
   * 处理悬停反馈
   */
  private handleHoverFeedback(element: HTMLElement, config: InteractionConfig): void {
    element.style.transition = `transform ${config.animationDuration}ms ease-out`;
    element.style.transform = 'translateY(-2px)';
    
    // 添加阴影效果
    if (config.feedbackIntensity !== 'subtle') {
      element.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }
  }

  /**
   * 处理焦点反馈
   */
  private handleFocusFeedback(element: HTMLElement, config: InteractionConfig): void {
    element.style.transition = `all ${config.animationDuration}ms ease-out`;
    element.style.outline = `2px solid var(--temperature-primary, #FF9999)`;
    element.style.outlineOffset = '2px';
  }

  /**
   * 根据温度感评分调整交互
   */
  async adjustByScore(score: TemperatureScore): Promise<void> {
    await this.adjust(score.level, {
      haptic: score.level === 'warm' || score.level === 'hot',
      sound: score.level === 'warm' || score.level === 'hot',
    });
  }

  /**
   * 重置交互配置
   */
  reset(): void {
    this.currentConfig = null;
    
    // 移除CSS变量
    const root = document.documentElement;
    root.style.removeProperty('--interaction-feedback-delay');
    root.style.removeProperty('--interaction-animation-duration');
    root.style.removeProperty('--interaction-feedback-intensity');
  }

  /**
   * 获取当前配置
   */
  getCurrentConfig(): InteractionConfig | null {
    return this.currentConfig;
  }
}

