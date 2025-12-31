/**
 * 情绪感知系统使用示例
 */

import { EmotionSystem } from '../EmotionSystem';
import { EmotionSource, EmotionType } from '../types/EmotionTypes';
import { BehaviorEmotionRecognizer, Interaction } from '../recognizers/BehaviorEmotionRecognizer';

async function example1() {
  // 创建情绪系统
  const emotionSystem = new EmotionSystem({
    enabled: true,
    fusionEnabled: true,
    storageEnabled: true,
    autoAnalysis: true,
    userId: 1,
  });

  // 分析文本情绪
  const textResult = await emotionSystem.analyzeEmotion({
    text: '我今天非常开心，感觉棒极了！',
    source: EmotionSource.CONVERSATION,
    context: {
      timeOfDay: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
    },
  });

  console.log('文本情绪分析:', textResult);

  // 分析行为情绪
  const interactions: Interaction[] = [
    { id: '1', userId: 1, type: 'message', timestamp: Date.now() - 1000, duration: 5000 },
    { id: '2', userId: 1, type: 'message', timestamp: Date.now() - 500, duration: 3000 },
  ];

  const behaviorResult = await emotionSystem.analyzeEmotion(
    {
      text: '',
      source: EmotionSource.BEHAVIOR,
    },
    interactions
  );

  console.log('行为情绪分析:', behaviorResult);

  // 获取当前情绪
  const currentEmotion = await emotionSystem.getCurrentEmotion();
  console.log('当前情绪:', currentEmotion);

  // 分析情绪趋势
  const trend = await emotionSystem.analyzeTrend('week');
  console.log('情绪趋势:', trend);

  // 获取情绪统计
  const statistics = await emotionSystem.getEmotionStatistics('week');
  console.log('情绪统计:', statistics);
}

async function example2() {
  // 在对话中集成情绪分析
  const emotionSystem = new EmotionSystem({
    enabled: true,
    fusionEnabled: true,
    storageEnabled: true,
    autoAnalysis: true,
    userId: 1,
  });

  const userMessages = [
    '今天工作很累',
    '但是完成了重要任务，很开心',
    '明天要休息一下',
  ];

  for (const message of userMessages) {
    const emotion = await emotionSystem.analyzeEmotion({
      text: message,
      source: EmotionSource.CONVERSATION,
    });
    
    console.log(`消息: ${message}`);
    console.log(`情绪: ${emotion.primaryEmotion} (${emotion.intensity})`);
    console.log(`置信度: ${(emotion.confidence * 100).toFixed(0)}%`);
    console.log('---');
  }
}

export { example1, example2 };



