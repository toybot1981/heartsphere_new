/**
 * UI调节器
 * 根据温度感动态调整UI样式、颜色、动画等
 */

import { TemperatureLevel, TemperatureScore } from '../types/TemperatureTypes';

/**
 * UI样式配置
 */
interface UIStyleConfig {
  /** 颜色主题 */
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  /** 动画配置 */
  animation: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  /** 阴影配置 */
  shadow: {
    enabled: boolean;
    intensity: number;
  };
  /** 圆角配置 */
  borderRadius: {
    enabled: boolean;
    size: number;
  };
}

/**
 * UI调节器类
 */
export class UIAdjuster {
  private currentStyle: UIStyleConfig | null = null;
  private styleElement: HTMLStyleElement | null = null;

  /**
   * 调节UI温度感
   */
  async adjust(
    targetLevel: TemperatureLevel,
    options?: {
      elements?: string[];
      animation?: boolean;
      duration?: number;
    }
  ): Promise<void> {
    const styleConfig = this.getStyleConfig(targetLevel);
    
    // 应用样式
    this.applyStyle(styleConfig, options);
    
    // 更新当前样式
    this.currentStyle = styleConfig;
  }

  /**
   * 根据温度感级别获取样式配置
   */
  private getStyleConfig(level: TemperatureLevel): UIStyleConfig {
    const configs: Record<TemperatureLevel, UIStyleConfig> = {
      cold: {
        colors: {
          primary: '#7FB8D1',      // 冷静蓝
          secondary: '#9FC9E0',
          background: '#E8F4F8',   // 淡蓝背景
          text: '#2C2C2C',
          accent: '#5A9BB8',
        },
        animation: {
          enabled: true,
          duration: 200,
          easing: 'ease-out',
        },
        shadow: {
          enabled: true,
          intensity: 0.5,
        },
        borderRadius: {
          enabled: true,
          size: 8,
        },
      },
      neutral: {
        colors: {
          primary: '#9E9E9E',      // 中性灰
          secondary: '#BDBDBD',
          background: '#F5F5F5',   // 浅灰背景
          text: '#2C2C2C',
          accent: '#757575',
        },
        animation: {
          enabled: true,
          duration: 250,
          easing: 'ease-out',
        },
        shadow: {
          enabled: true,
          intensity: 0.6,
        },
        borderRadius: {
          enabled: true,
          size: 8,
        },
      },
      warm: {
        colors: {
          primary: '#FF9999',      // 温暖粉
          secondary: '#FFB3B3',
          background: '#FFF5F5',   // 淡粉背景
          text: '#2C2C2C',
          accent: '#FF8080',
        },
        animation: {
          enabled: true,
          duration: 300,
          easing: 'ease-out',
        },
        shadow: {
          enabled: true,
          intensity: 0.8,
        },
        borderRadius: {
          enabled: true,
          size: 12,
        },
      },
      hot: {
        colors: {
          primary: '#FF6B6B',      // 热情红
          secondary: '#FF8E8E',
          background: '#FFF0F0',    // 淡红背景
          text: '#2C2C2C',
          accent: '#FF5252',
        },
        animation: {
          enabled: true,
          duration: 350,
          easing: 'ease-out',
        },
        shadow: {
          enabled: true,
          intensity: 1.0,
        },
        borderRadius: {
          enabled: true,
          size: 16,
        },
      },
    };

    return configs[level];
  }

  /**
   * 应用样式
   */
  private applyStyle(
    config: UIStyleConfig,
    options?: {
      elements?: string[];
      animation?: boolean;
      duration?: number;
    }
  ): void {
    // 创建或获取样式元素
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'temperature-engine-ui-style';
      document.head.appendChild(this.styleElement);
    }

    const elements = options?.elements || ['button', '.card', 'input', '.warm-ui'];
    const animationEnabled = options?.animation !== false && config.animation.enabled;
    const duration = options?.duration || config.animation.duration;

    // 生成CSS
    const css = this.generateCSS(config, elements, animationEnabled, duration);
    
    // 应用CSS
    this.styleElement.textContent = css;

    // 应用CSS变量到根元素
    this.applyCSSVariables(config);
  }

  /**
   * 生成CSS
   */
  private generateCSS(
    config: UIStyleConfig,
    elements: string[],
    animationEnabled: boolean,
    duration: number
  ): string {
    const selectors = elements.join(', ');
    
    let css = `
      /* 温度感UI样式 - ${config.colors.primary} */
      :root {
        --temperature-primary: ${config.colors.primary};
        --temperature-secondary: ${config.colors.secondary};
        --temperature-background: ${config.colors.background};
        --temperature-text: ${config.colors.text};
        --temperature-accent: ${config.colors.accent};
        --temperature-border-radius: ${config.borderRadius.size}px;
        --temperature-shadow-intensity: ${config.shadow.intensity};
      }

      ${selectors} {
        transition: all ${duration}ms ${config.animation.easing};
      }
    `;

    // 按钮样式
    if (elements.includes('button') || elements.includes('.btn')) {
      css += `
        button, .btn {
          background: linear-gradient(135deg, ${config.colors.primary} 0%, ${config.colors.secondary} 100%);
          color: white;
          border-radius: ${config.borderRadius.size}px;
          ${config.shadow.enabled ? `box-shadow: 0 4px 12px rgba(0, 0, 0, ${0.1 * config.shadow.intensity});` : ''}
        }
        
        button:hover, .btn:hover {
          transform: translateY(-2px);
          ${config.shadow.enabled ? `box-shadow: 0 6px 16px rgba(0, 0, 0, ${0.15 * config.shadow.intensity});` : ''}
        }
      `;
    }

    // 卡片样式
    if (elements.includes('.card') || elements.includes('card')) {
      css += `
        .card {
          background: ${config.colors.background};
          border-radius: ${config.borderRadius.size}px;
          ${config.shadow.enabled ? `box-shadow: 0 2px 8px rgba(0, 0, 0, ${0.08 * config.shadow.intensity});` : ''}
        }
        
        .card:hover {
          ${config.shadow.enabled ? `box-shadow: 0 4px 12px rgba(0, 0, 0, ${0.12 * config.shadow.intensity});` : ''}
        }
      `;
    }

    // 输入框样式
    if (elements.includes('input')) {
      css += `
        input, textarea {
          border-color: ${config.colors.primary};
          border-radius: ${config.borderRadius.size}px;
        }
        
        input:focus, textarea:focus {
          border-color: ${config.colors.accent};
          box-shadow: 0 0 0 3px ${config.colors.primary}20;
        }
      `;
    }

    // 动画
    if (animationEnabled) {
      css += `
        @keyframes temperatureFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .temperature-animate {
          animation: temperatureFadeIn ${duration}ms ${config.animation.easing};
        }
      `;
    }

    return css;
  }

  /**
   * 应用CSS变量
   */
  private applyCSSVariables(config: UIStyleConfig): void {
    const root = document.documentElement;
    root.style.setProperty('--temperature-primary', config.colors.primary);
    root.style.setProperty('--temperature-secondary', config.colors.secondary);
    root.style.setProperty('--temperature-background', config.colors.background);
    root.style.setProperty('--temperature-text', config.colors.text);
    root.style.setProperty('--temperature-accent', config.colors.accent);
    root.style.setProperty('--temperature-border-radius', `${config.borderRadius.size}px`);
  }

  /**
   * 根据温度感评分调整UI
   */
  async adjustByScore(score: TemperatureScore): Promise<void> {
    await this.adjust(score.level, {
      animation: true,
      duration: 300,
    });
  }

  /**
   * 重置UI样式
   */
  reset(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
    this.currentStyle = null;

    // 移除CSS变量
    const root = document.documentElement;
    root.style.removeProperty('--temperature-primary');
    root.style.removeProperty('--temperature-secondary');
    root.style.removeProperty('--temperature-background');
    root.style.removeProperty('--temperature-text');
    root.style.removeProperty('--temperature-accent');
    root.style.removeProperty('--temperature-border-radius');
  }

  /**
   * 获取当前样式
   */
  getCurrentStyle(): UIStyleConfig | null {
    return this.currentStyle;
  }
}

