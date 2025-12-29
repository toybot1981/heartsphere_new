/**
 * 温度感引擎配置定义
 */

import { TemperatureEngineConfig, DEFAULT_ENGINE_CONFIG } from '../types/TemperatureTypes';

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 配置管理器类
 */
export class ConfigManager {
  private config: TemperatureEngineConfig;
  private storageKey: string = 'temperature_engine_config';

  constructor(initialConfig?: Partial<TemperatureEngineConfig>) {
    // 合并默认配置、存储配置和初始配置
    const defaultConfig = { ...DEFAULT_ENGINE_CONFIG };
    const savedConfig = this.loadFromStorage();
    const mergedConfig = this.mergeConfig(defaultConfig, savedConfig, initialConfig);
    
    // 验证配置
    const validation = this.validate(mergedConfig);
    if (!validation.valid) {
      console.warn('[TemperatureEngine] Config validation failed:', validation.errors);
      // 使用默认配置
      this.config = defaultConfig;
    } else {
      this.config = mergedConfig;
    }
  }

  /**
   * 获取配置
   */
  getConfig(): TemperatureEngineConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   */
  updateConfig(updates: Partial<TemperatureEngineConfig>): void {
    const newConfig = this.mergeConfig(this.config, updates);
    const validation = this.validate(newConfig);
    
    if (!validation.valid) {
      throw new Error(`Config validation failed: ${validation.errors.join(', ')}`);
    }
    
    this.config = newConfig;
    this.saveToStorage();
  }

  /**
   * 重置配置为默认值
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_ENGINE_CONFIG };
    this.saveToStorage();
  }

  /**
   * 验证配置
   */
  validate(config: TemperatureEngineConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 验证基础配置
    if (typeof config.enabled !== 'boolean') {
      errors.push('enabled must be a boolean');
    }

    if (!['auto', 'manual', 'hybrid'].includes(config.mode)) {
      errors.push('mode must be one of: auto, manual, hybrid');
    }

    // 验证温度感配置
    if (!['cold', 'neutral', 'warm', 'hot'].includes(config.temperature.default)) {
      errors.push('temperature.default must be one of: cold, neutral, warm, hot');
    }

    if (config.temperature.range.min < 0 || config.temperature.range.min > 100) {
      errors.push('temperature.range.min must be between 0 and 100');
    }

    if (config.temperature.range.max < 0 || config.temperature.range.max > 100) {
      errors.push('temperature.range.max must be between 0 and 100');
    }

    if (config.temperature.range.min >= config.temperature.range.max) {
      errors.push('temperature.range.min must be less than max');
    }

    if (!['low', 'medium', 'high'].includes(config.temperature.sensitivity)) {
      errors.push('temperature.sensitivity must be one of: low, medium, high');
    }

    // 验证性能配置
    if (config.performance.updateInterval < 0) {
      errors.push('performance.updateInterval must be >= 0');
    }

    if (config.performance.debounceDelay < 0) {
      errors.push('performance.debounceDelay must be >= 0');
    }

    // 警告检查
    if (config.performance.updateInterval < 100) {
      warnings.push('updateInterval is very low, may impact performance');
    }

    if (!config.features.emotionAnalysis && config.features.characterAdjustment) {
      warnings.push('characterAdjustment requires emotionAnalysis to be enabled');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * 合并配置
   */
  private mergeConfig(
    ...configs: Array<Partial<TemperatureEngineConfig> | undefined>
  ): TemperatureEngineConfig {
    return configs.reduce((acc, config) => {
      if (!config) return acc;
      
      return {
        ...acc,
        ...config,
        temperature: {
          ...acc.temperature,
          ...config.temperature,
          range: {
            ...acc.temperature.range,
            ...config.temperature?.range,
          },
        },
        features: {
          ...acc.features,
          ...config.features,
        },
        performance: {
          ...acc.performance,
          ...config.performance,
        },
        plugins: {
          ...acc.plugins,
          ...config.plugins,
          config: {
            ...acc.plugins.config,
            ...config.plugins?.config,
          },
        },
        ui: {
          ...acc.ui,
          ...config.ui,
          animation: {
            ...acc.ui?.animation,
            ...config.ui?.animation,
          },
          colors: {
            ...acc.ui?.colors,
            ...config.ui?.colors,
          },
        },
      };
    }, { ...DEFAULT_ENGINE_CONFIG }) as TemperatureEngineConfig;
  }

  /**
   * 从存储加载配置
   */
  private loadFromStorage(): Partial<TemperatureEngineConfig> | null {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[TemperatureEngine] Failed to load config from storage:', error);
    }
    return null;
  }

  /**
   * 保存配置到存储
   */
  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (error) {
      console.error('[TemperatureEngine] Failed to save config to storage:', error);
    }
  }

  /**
   * 设置存储键
   */
  setStorageKey(key: string): void {
    this.storageKey = key;
  }
}

