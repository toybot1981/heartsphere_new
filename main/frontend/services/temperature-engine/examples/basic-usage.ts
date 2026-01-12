/**
 * 温度感引擎基础使用示例
 */

import { TemperatureEngine } from '../core/TemperatureEngine';
import { EngineAPI } from '../core/EngineAPI';

// ========== 示例1：基础使用 ==========

async function example1() {
  // 创建引擎实例
  const engine = new TemperatureEngine({
    enabled: true,
    temperature: { default: 'warm' },
  });

  // 启动引擎
  await engine.start();

  // 监听温度感变化
  engine.on('temperatureChanged', (temperature) => {
    console.log('温度感变化:', temperature.level, temperature.score);
  });

  // 计算温度感
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

  console.log('当前温度感:', temperature);

  // 分析情绪
  const emotion = await engine.analyzeEmotion({
    text: '我今天很开心！',
  });

  console.log('检测到的情绪:', emotion);

  // 停止引擎
  await engine.stop();
}

// ========== 示例2：使用简化API ==========

async function example2() {
  // 使用简化API
  const api = new EngineAPI({
    enabled: true,
    temperature: { default: 'warm' },
  });

  // 启动
  await api.start();

  // 计算温度感
  const temperature = await api.calculate({
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

  // 获取当前温度感
  const current = api.getTemperature();
  console.log('当前温度感:', current);

  // 调节温度感
  await api.adjust('warm', {
    elements: ['button', 'card'],
    animation: true,
  });
}

// ========== 示例3：在React组件中使用 ==========

/*
import { useTemperatureEngine } from '../hooks/useTemperatureEngine';

function MyComponent() {
  const { engine, state, isReady } = useTemperatureEngine({
    enabled: true,
    temperature: { default: 'warm' },
  });

  useEffect(() => {
    if (!engine || !isReady) return;

    // 监听事件
    engine.on('temperatureChanged', (temperature) => {
      console.log('温度感变化:', temperature);
    });

    // 计算温度感
    engine.calculateTemperature({
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
  }, [engine, isReady]);

  return (
    <div>
      {state?.currentTemperature && (
        <p>当前温度感: {state.currentTemperature.level}</p>
      )}
    </div>
  );
}
*/

// ========== 示例4：事件监听 ==========

async function example4() {
  const engine = new TemperatureEngine();
  await engine.start();

  // 监听多个事件
  engine.on('temperatureChanged', (temperature) => {
    console.log('温度感变化:', temperature);
  });

  engine.on('emotionDetected', (emotion) => {
    console.log('情绪检测:', emotion);
  });

  engine.on('contextUpdated', (context) => {
    console.log('上下文更新:', context);
  });

  // 一次性监听
  engine.once('engineStarted', () => {
    console.log('引擎已启动');
  });
}

// ========== 示例5：配置管理 ==========

async function example5() {
  const engine = new TemperatureEngine({
    enabled: true,
    temperature: { default: 'warm' },
    features: {
      emotionAnalysis: true,
      contextAwareness: true,
      uiAdjustment: true,
      characterAdjustment: true,
      contentAdjustment: true,
    },
  });

  // 获取配置
  const config = engine.getConfig();
  console.log('当前配置:', config);

  // 更新配置
  engine.updateConfig({
    temperature: { default: 'hot' },
  });

  // 配置会自动保存到localStorage
}

export { example1, example2, example4, example5 };




