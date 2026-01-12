/**
 * 插件管理器
 * 负责插件的注册、管理、生命周期和事件分发
 */

import {
  TemperaturePlugin,
  PluginRegistration,
  PluginState,
  PluginConfig,
} from './PluginInterface';
import { TemperatureEngine } from '../core/TemperatureEngine';
import { EventSystem } from '../events/EventSystem';
import { ConfigManager } from '../config/TemperatureConfig';
import {
  TemperatureScore,
  EmotionAnalysis,
  TemperatureContext,
  TemperatureLevel,
} from '../types/TemperatureTypes';

/**
 * 插件管理器类
 */
export class PluginManager {
  private plugins: Map<string, PluginRegistration> = new Map();
  private engine: TemperatureEngine | null = null;
  private eventSystem: EventSystem | null = null;
  private configManager: ConfigManager | null = null;
  private isInitialized: boolean = false;

  constructor(
    engine: TemperatureEngine,
    eventSystem: EventSystem,
    configManager: ConfigManager
  ) {
    this.engine = engine;
    this.eventSystem = eventSystem;
    this.configManager = configManager;
    this.isInitialized = true;
  }

  /**
   * 注册插件
   */
  async registerPlugin(plugin: TemperaturePlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[PluginManager] Plugin ${plugin.id} already registered`);
      return;
    }

    const registration: PluginRegistration = {
      plugin,
      state: {
        initialized: false,
        running: false,
        lastUpdateTime: Date.now(),
      },
      instance: null,
    };

    this.plugins.set(plugin.id, registration);

    // 如果引擎已启动，立即初始化插件
    if (this.engine && this.engine.isRunning()) {
      await this.initializePlugin(plugin.id);
      await this.startPlugin(plugin.id);
    }

    this.eventSystem?.emit('pluginRegistered', { pluginId: plugin.id });
    console.log(`[PluginManager] Plugin registered: ${plugin.id}`);
  }

  /**
   * 注销插件
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      console.warn(`[PluginManager] Plugin ${pluginId} not found`);
      return;
    }

    // 停止并销毁插件
    if (registration.state.running) {
      await this.stopPlugin(pluginId);
    }
    if (registration.state.initialized) {
      await this.destroyPlugin(pluginId);
    }

    this.plugins.delete(pluginId);
    this.eventSystem?.emit('pluginDisabled', { pluginId });
    console.log(`[PluginManager] Plugin unregistered: ${pluginId}`);
  }

  /**
   * 初始化所有插件
   */
  async init(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('PluginManager not initialized');
    }

    const config = this.configManager?.getConfig();
    const enabledPlugins = config?.plugins?.enabled || [];

    // 初始化启用的插件
    for (const [pluginId, registration] of this.plugins.entries()) {
      if (enabledPlugins.length === 0 || enabledPlugins.includes(pluginId)) {
        try {
          await this.initializePlugin(pluginId);
        } catch (error) {
          console.error(`[PluginManager] Failed to initialize plugin ${pluginId}:`, error);
          registration.state.error = String(error);
        }
      }
    }
  }

  /**
   * 启动所有插件
   */
  async start(): Promise<void> {
    for (const [pluginId, registration] of this.plugins.entries()) {
      if (registration.state.initialized && !registration.state.running) {
        try {
          await this.startPlugin(pluginId);
        } catch (error) {
          console.error(`[PluginManager] Failed to start plugin ${pluginId}:`, error);
          registration.state.error = String(error);
        }
      }
    }
  }

  /**
   * 停止所有插件
   */
  async stop(): Promise<void> {
    for (const [pluginId, registration] of this.plugins.entries()) {
      if (registration.state.running) {
        try {
          await this.stopPlugin(pluginId);
        } catch (error) {
          console.error(`[PluginManager] Failed to stop plugin ${pluginId}:`, error);
        }
      }
    }
  }

  /**
   * 销毁所有插件
   */
  async destroy(): Promise<void> {
    for (const [pluginId] of this.plugins.entries()) {
      try {
        await this.destroyPlugin(pluginId);
      } catch (error) {
        console.error(`[PluginManager] Failed to destroy plugin ${pluginId}:`, error);
      }
    }
    this.plugins.clear();
  }

  /**
   * 初始化单个插件
   */
  private async initializePlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (registration.state.initialized) {
      return;
    }

    const { plugin } = registration;

    try {
      if (plugin.onInit && this.engine) {
        await plugin.onInit(this.engine);
      }

      registration.state.initialized = true;
      registration.state.lastUpdateTime = Date.now();
    } catch (error) {
      registration.state.error = String(error);
      throw error;
    }
  }

  /**
   * 启动单个插件
   */
  private async startPlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!registration.state.initialized) {
      await this.initializePlugin(pluginId);
    }

    if (registration.state.running) {
      return;
    }

    const { plugin } = registration;

    try {
      if (plugin.onStart) {
        await plugin.onStart();
      }

      registration.state.running = true;
      registration.state.lastUpdateTime = Date.now();
      this.eventSystem?.emit('pluginEnabled', { pluginId });
    } catch (error) {
      registration.state.error = String(error);
      throw error;
    }
  }

  /**
   * 停止单个插件
   */
  private async stopPlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (!registration.state.running) {
      return;
    }

    const { plugin } = registration;

    try {
      if (plugin.onStop) {
        await plugin.onStop();
      }

      registration.state.running = false;
      registration.state.lastUpdateTime = Date.now();
    } catch (error) {
      registration.state.error = String(error);
      throw error;
    }
  }

  /**
   * 销毁单个插件
   */
  private async destroyPlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      return;
    }

    if (registration.state.running) {
      await this.stopPlugin(pluginId);
    }

    const { plugin } = registration;

    try {
      if (plugin.onDestroy) {
        await plugin.onDestroy();
      }

      registration.state.initialized = false;
      registration.state.lastUpdateTime = Date.now();
    } catch (error) {
      registration.state.error = String(error);
      throw error;
    }
  }

  /**
   * 启用插件
   */
  async enablePlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    registration.plugin.enabled = true;

    if (!registration.state.initialized) {
      await this.initializePlugin(pluginId);
    }

    if (!registration.state.running && this.engine?.isRunning()) {
      await this.startPlugin(pluginId);
    }

    // 更新配置
    const config = this.configManager?.getConfig();
    if (config) {
      const enabledPlugins = config.plugins.enabled || [];
      if (!enabledPlugins.includes(pluginId)) {
        this.configManager?.updateConfig({
          plugins: {
            ...config.plugins,
            enabled: [...enabledPlugins, pluginId],
          },
        });
      }
    }
  }

  /**
   * 禁用插件
   */
  async disablePlugin(pluginId: string): Promise<void> {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    registration.plugin.enabled = false;

    if (registration.state.running) {
      await this.stopPlugin(pluginId);
    }

    // 更新配置
    const config = this.configManager?.getConfig();
    if (config) {
      const enabledPlugins = config.plugins.enabled || [];
      this.configManager?.updateConfig({
        plugins: {
          ...config.plugins,
          enabled: enabledPlugins.filter(id => id !== pluginId),
        },
      });
    }

    this.eventSystem?.emit('pluginDisabled', { pluginId });
  }

  /**
   * 分发事件到插件
   */
  async dispatchEvent(
    event: string,
    data?: any
  ): Promise<void> {
    // 按优先级排序插件
    const sortedPlugins = Array.from(this.plugins.values())
      .filter(reg => reg.state.running && reg.plugin.enabled !== false)
      .sort((a, b) => (b.plugin.priority || 0) - (a.plugin.priority || 0));

    for (const registration of sortedPlugins) {
      const { plugin } = registration;

      try {
        // 根据事件类型调用相应的钩子
        switch (event) {
          case 'temperatureChanged':
            if (plugin.onTemperatureChange && data) {
              await plugin.onTemperatureChange(data);
            }
            break;

          case 'temperatureCalculated':
            if (plugin.onTemperatureCalculated && data) {
              await plugin.onTemperatureCalculated(data);
            }
            break;

          case 'temperatureAdjusted':
            if (plugin.onTemperatureAdjusted && data) {
              await plugin.onTemperatureAdjusted(data.level, data.options);
            }
            break;

          case 'emotionDetected':
          case 'emotionChanged':
          case 'emotionAnalyzed':
            if (plugin.onEmotionDetected && data) {
              await plugin.onEmotionDetected(data);
            }
            if (plugin.onEmotionChanged && event === 'emotionChanged' && data) {
              await plugin.onEmotionChanged(data);
            }
            if (plugin.onEmotionAnalyzed && event === 'emotionAnalyzed' && data) {
              await plugin.onEmotionAnalyzed(data);
            }
            break;

          case 'contextUpdated':
          case 'contextChanged':
            if (plugin.onContextUpdated && data) {
              await plugin.onContextUpdated(data);
            }
            if (plugin.onContextChanged && event === 'contextChanged' && data) {
              await plugin.onContextChanged(data);
            }
            break;

          case 'userInteraction':
            if (plugin.onUserInteraction && data) {
              await plugin.onUserInteraction(data);
            }
            break;

          case 'messageSent':
            if (plugin.onMessageSent && data) {
              await plugin.onMessageSent(data.message, data.context);
            }
            break;

          case 'messageReceived':
            if (plugin.onMessageReceived && data) {
              await plugin.onMessageReceived(data.message, data.context);
            }
            break;

          case 'configUpdated':
            if (plugin.onConfigUpdated && data) {
              await plugin.onConfigUpdated(data);
            }
            break;
        }
      } catch (error) {
        console.error(`[PluginManager] Error in plugin ${plugin.id} handling event ${event}:`, error);
        registration.state.error = String(error);
        this.eventSystem?.emit('pluginError', {
          pluginId: plugin.id,
          event,
          error,
        });
      }
    }
  }

  /**
   * 调用插件方法
   */
  callPluginMethod(pluginId: string, methodName: string, ...args: any[]): any {
    const registration = this.plugins.get(pluginId);
    if (!registration) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const { plugin } = registration;

    if (!plugin.methods || !plugin.methods[methodName]) {
      throw new Error(`Method ${methodName} not found in plugin ${pluginId}`);
    }

    return plugin.methods[methodName](...args);
  }

  /**
   * 获取插件
   */
  getPlugin(pluginId: string): TemperaturePlugin | null {
    const registration = this.plugins.get(pluginId);
    return registration ? registration.plugin : null;
  }

  /**
   * 获取插件状态
   */
  getPluginState(pluginId: string): PluginState | null {
    const registration = this.plugins.get(pluginId);
    return registration ? registration.state : null;
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): TemperaturePlugin[] {
    return Array.from(this.plugins.values()).map(reg => reg.plugin);
  }

  /**
   * 获取启用的插件
   */
  getEnabledPlugins(): TemperaturePlugin[] {
    return Array.from(this.plugins.values())
      .filter(reg => reg.plugin.enabled !== false && reg.state.running)
      .map(reg => reg.plugin);
  }

  /**
   * 检查插件是否启用
   */
  isPluginEnabled(pluginId: string): boolean {
    const registration = this.plugins.get(pluginId);
    return registration
      ? registration.plugin.enabled !== false && registration.state.running
      : false;
  }
}

