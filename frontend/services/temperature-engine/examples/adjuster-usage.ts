/**
 * 温度感调节层使用示例
 */

import { TemperatureEngine } from '../core/TemperatureEngine';
import { UIAdjuster } from '../adjusters/UIAdjuster';
import { InteractionAdjuster } from '../adjusters/InteractionAdjuster';
import { ContentAdjuster } from '../adjusters/ContentAdjuster';
import { CharacterAdjuster } from '../adjusters/CharacterAdjuster';

// ========== 示例1：完整调节流程 ==========

async function example1() {
  const engine = new TemperatureEngine({
    enabled: true,
    features: {
      uiAdjustment: true,
      characterAdjustment: true,
      contentAdjustment: true,
    },
  });

  await engine.start();

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

  // 根据温度感自动调节所有方面
  await engine.adjustTemperature(temperature.level, {
    elements: ['button', '.card', 'input'],
    animation: true,
  });

  // 调节内容
  const warmMessage = await engine.adjustContent({
    original: '你好',
    targetTemperature: temperature.level,
  });
  console.log('调节后的内容:', warmMessage);

  // 调节角色
  const characterConfig = await engine.adjustCharacter(temperature.level, {
    emotion: 'happy',
  });
  console.log('角色配置:', characterConfig);
}

// ========== 示例2：UI调节 ==========

async function example2() {
  const uiAdjuster = new UIAdjuster();

  // 调节到温暖模式
  await uiAdjuster.adjust('warm', {
    elements: ['button', '.card', 'input'],
    animation: true,
    duration: 300,
  });

  // 根据温度感评分调节
  const score = {
    score: 75,
    level: 'warm' as const,
    factors: {
      emotion: 0.8,
      context: 0.7,
      history: 0.75,
      interaction: 0.7,
    },
    suggestions: [],
    timestamp: Date.now(),
  };
  await uiAdjuster.adjustByScore(score);
}

// ========== 示例3：交互调节 ==========

async function example3() {
  const interactionAdjuster = new InteractionAdjuster();

  // 调节到温暖模式
  await interactionAdjuster.adjust('warm', {
    haptic: true,
    sound: true,
  });

  // 为特定元素添加反馈
  const button = document.querySelector('button');
  if (button) {
    interactionAdjuster.addFeedback(button, 'click');
    interactionAdjuster.addFeedback(button, 'hover');
  }
}

// ========== 示例4：内容调节 ==========

async function example4() {
  const contentAdjuster = new ContentAdjuster();

  // 调节内容温度感
  const warmContent = await contentAdjuster.adjust({
    original: '你好',
    targetTemperature: 'warm',
    context: {
      timeOfDay: 'morning',
    },
  });
  console.log('温暖内容:', warmContent);

  // 生成问候语
  const greeting = contentAdjuster.generateGreeting('warm', {
    timeOfDay: 'morning',
  });
  console.log('问候语:', greeting);

  // 生成鼓励语
  const encouragement = contentAdjuster.generateEncouragement('warm');
  console.log('鼓励语:', encouragement);

  // 批量调节
  const contents = ['你好', '好的', '再见'];
  const adjusted = await contentAdjuster.adjustBatch(contents, 'warm');
  console.log('批量调节:', adjusted);
}

// ========== 示例5：角色调节 ==========

async function example5() {
  const characterAdjuster = new CharacterAdjuster();

  // 调节角色
  const config = await characterAdjuster.adjust('warm', {
    emotion: 'happy',
  });
  console.log('角色配置:', config);

  // 获取表情建议
  const expression = characterAdjuster.getExpressionSuggestion('warm', 'happy');
  console.log('建议表情:', expression);

  // 获取动作建议
  const action = characterAdjuster.getActionSuggestion('warm', 'happy');
  console.log('建议动作:', action);

  // 根据温度感评分调整
  const score = {
    score: 75,
    level: 'warm' as const,
    factors: {
      emotion: 0.8,
      context: 0.7,
      history: 0.75,
      interaction: 0.7,
    },
    suggestions: [],
    timestamp: Date.now(),
  };
  const characterConfig = await characterAdjuster.adjustByScore(score);
  console.log('角色配置:', characterConfig);
}

// ========== 示例6：在React组件中使用 ==========

/*
import { useTemperatureEngine } from '../hooks/useTemperatureEngine';

function ChatComponent() {
  const { engine, state, isReady } = useTemperatureEngine();

  useEffect(() => {
    if (!engine || !isReady) return;

    // 监听温度感变化，自动调节
    engine.on('temperatureChanged', async (temperature) => {
      // 调节UI
      await engine.adjustTemperature(temperature.level, {
        elements: ['button', '.card'],
        animation: true,
      });

      // 调节角色
      const emotion = state?.currentEmotion?.type;
      await engine.adjustCharacter(temperature.level, {
        emotion,
      });
    });
  }, [engine, isReady, state]);

  const handleSendMessage = async (message: string) => {
    // 分析情绪
    const emotion = await engine?.analyzeEmotion({ text: message });
    
    // 计算温度感
    const temperature = await engine?.calculateTemperature({
      userEmotion: emotion?.type,
      context: { /* ... */ },
    });

    // 自动调节
    if (temperature) {
      await engine?.adjustTemperature(temperature.level);
    }
  };

  return <div>...</div>;
}
*/

export { example1, example2, example3, example4, example5 };




