/**
 * 温度感引擎插件系统使用示例
 */

import { TemperatureEngine } from '../core/TemperatureEngine';
import { TemperaturePlugin } from '../plugins/PluginInterface';
import { GreetingPlugin } from '../plugins/builtin/GreetingPlugin';
import { ExpressionPlugin } from '../plugins/builtin/ExpressionPlugin';
import { DialoguePlugin } from '../plugins/builtin/DialoguePlugin';

// ========== 示例1：使用内置插件 ==========

async function example1() {
  const engine = new TemperatureEngine({
    enabled: true,
    plugins: {
      enabled: ['greeting', 'expression', 'dialogue'],
    },
  });

  await engine.start();

  // 插件会自动工作
  // - 问候插件会在启动时显示问候语
  // - 表情插件会根据温度感更新表情
  // - 对话插件会优化对话体验

  // 计算温度感，插件会自动响应
  const temperature = await engine.calculateTemperature({
    userEmotion: 'happy',
    context: {
      timeOfDay: 'morning',
      device: 'desktop',
      userActivity: {
        sessionDuration: 10000,
        messageCount: 5,
        lastInteraction: 1000,
      },
      conversation: {
        length: 10,
        sentiment: 'positive',
      },
    },
  });

  console.log('Temperature:', temperature);

  // 分析情绪，插件会自动响应
  const emotion = await engine.analyzeEmotion({
    text: '我今天非常开心！',
  });

  console.log('Emotion:', emotion);
}

// ========== 示例2：创建自定义插件 ==========

class CustomNotificationPlugin implements TemperaturePlugin {
  id = 'custom-notification';
  name = '自定义通知插件';
  version = '1.0.0';
  description = '在温度感变化时显示自定义通知';
  priority = 5;

  private engine: TemperatureEngine | null = null;

  async onInit(engine: TemperatureEngine): Promise<void> {
    this.engine = engine;
    console.log('[CustomNotificationPlugin] Initialized');
  }

  async onStart(): Promise<void> {
    console.log('[CustomNotificationPlugin] Started');
  }

  async onTemperatureChange(temperature: any): Promise<void> {
    // 显示自定义通知
    if (temperature.level === 'warm' || temperature.level === 'hot') {
      this.showNotification(`温度感：${temperature.level} (${temperature.score})`);
    }
  }

  private showNotification(message: string): void {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
    `;

    document.body.appendChild(notification);

    // 3秒后移除
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async onStop(): Promise<void> {
    console.log('[CustomNotificationPlugin] Stopped');
  }

  async onDestroy(): Promise<void> {
    console.log('[CustomNotificationPlugin] Destroyed');
  }
}

async function example2() {
  const engine = new TemperatureEngine({
    enabled: true,
  });

  // 注册自定义插件
  await engine.registerPlugin(new CustomNotificationPlugin());

  await engine.start();

  // 插件会自动响应温度感变化
  await engine.calculateTemperature({
    userEmotion: 'happy',
    context: {
      timeOfDay: 'morning',
      device: 'desktop',
      userActivity: {
        sessionDuration: 10000,
        messageCount: 5,
        lastInteraction: 1000,
      },
      conversation: {
        length: 10,
        sentiment: 'positive',
      },
    },
  });
}

// ========== 示例3：管理插件 ==========

async function example3() {
  const engine = new TemperatureEngine({
    enabled: true,
    plugins: {
      enabled: ['greeting', 'expression'],
    },
  });

  await engine.start();

  // 获取插件管理器
  const pluginManager = engine.getPluginManager();

  // 获取所有插件
  const allPlugins = pluginManager.getAllPlugins();
  console.log('All plugins:', allPlugins);

  // 获取启用的插件
  const enabledPlugins = pluginManager.getEnabledPlugins();
  console.log('Enabled plugins:', enabledPlugins);

  // 检查插件是否启用
  const isGreetingEnabled = pluginManager.isPluginEnabled('greeting');
  console.log('Greeting plugin enabled:', isGreetingEnabled);

  // 禁用插件
  await engine.disablePlugin('greeting');
  console.log('Greeting plugin disabled');

  // 启用插件
  await engine.enablePlugin('greeting');
  console.log('Greeting plugin enabled');

  // 调用插件方法
  const greetingPlugin = pluginManager.getPlugin('greeting');
  if (greetingPlugin && greetingPlugin.methods) {
    // 手动显示问候语
    await engine.callPluginMethod('greeting', 'showGreeting', 'warm');
  }
}

// ========== 示例4：监听插件事件 ==========

async function example4() {
  const engine = new TemperatureEngine({
    enabled: true,
    plugins: {
      enabled: ['expression'],
    },
  });

  await engine.start();

  // 监听表情变化事件（由表情插件触发）
  window.addEventListener('temperatureExpressionChanged', (event: any) => {
    const { expression } = event.detail;
    console.log('Expression changed:', expression);
    // 更新UI中的角色表情
  });

  // 监听对话开始事件（由对话插件触发）
  window.addEventListener('temperatureDialogueStart', (event: any) => {
    const { greeting } = event.detail;
    console.log('Dialogue started:', greeting);
    // 显示问候语
  });

  // 监听消息调整事件（由对话插件触发）
  window.addEventListener('temperatureMessageAdjusted', (event: any) => {
    const { original, adjusted, temperature } = event.detail;
    console.log('Message adjusted:', { original, adjusted, temperature });
    // 使用调整后的消息
  });
}

// ========== 示例5：在React组件中使用插件 ==========

/*
import { useTemperatureEngine } from '../hooks/useTemperatureEngine';
import { useEffect } from 'react';

function ChatComponent() {
  const { engine, state, isReady } = useTemperatureEngine({
    plugins: {
      enabled: ['greeting', 'expression', 'dialogue'],
    },
  });

  useEffect(() => {
    if (!engine || !isReady) return;

    // 监听表情变化
    window.addEventListener('temperatureExpressionChanged', (event: any) => {
      const { expression } = event.detail;
      // 更新角色表情
      updateCharacterExpression(expression);
    });

    // 监听对话开始
    window.addEventListener('temperatureDialogueStart', (event: any) => {
      const { greeting } = event.detail;
      // 显示问候语
      showGreeting(greeting);
    });

    // 监听消息调整
    window.addEventListener('temperatureMessageAdjusted', (event: any) => {
      const { adjusted } = event.detail;
      // 使用调整后的消息
      displayMessage(adjusted);
    });
  }, [engine, isReady]);

  const handleSendMessage = async (message: string) => {
    // 发送消息，对话插件会自动处理
    await engine?.onMessageSent?.(message);
  };

  return <div>...</div>;
}
*/

export { example1, example2, example3, example4 };

