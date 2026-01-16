/**
 * 温度感计算层使用示例
 */

import { TemperatureEngine } from '../core/TemperatureEngine';
import { EmotionAnalyzer } from '../calculator/EmotionAnalyzer';
import { ContextAwareness } from '../calculator/ContextAwareness';
import { TemperatureScorer } from '../calculator/TemperatureScorer';
import { TemperaturePredictor } from '../calculator/TemperaturePredictor';

// ========== 示例1：完整流程 ==========

async function example1() {
  const engine = new TemperatureEngine({
    enabled: true,
    features: {
      emotionAnalysis: true,
      contextAwareness: true,
      uiAdjustment: true,
      characterAdjustment: true,
      contentAdjustment: true,
    },
  });

  await engine.start();

  // 1. 分析用户情绪
  const emotion = await engine.analyzeEmotion({
    text: '我今天很开心！',
    conversationHistory: [],
  });


  // 2. 计算温度感
  const temperature = await engine.calculateTemperature({
    userEmotion: emotion.type,
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
    history: [],
  });


  // 3. 预测未来温度感
  const prediction = engine.predictTemperature(60000); // 预测1分钟后
}

// ========== 示例2：单独使用情绪分析器 ==========

async function example2() {
  const analyzer = new EmotionAnalyzer();

  const emotion = await analyzer.analyze({
    text: '我今天有点难过，但是没关系',
    context: {
      timeOfDay: 'evening',
      device: 'mobile',
      userActivity: {
        sessionDuration: 5000,
        messageCount: 2,
        lastInteraction: 2000,
      },
      conversation: {
        length: 3,
        sentiment: 'negative',
      },
    },
    conversationHistory: [
      '你好',
      '我今天心情不太好',
    ],
  });

}

// ========== 示例3：使用上下文感知 ==========

function example3() {
  const awareness = new ContextAwareness();

  // 构建完整上下文
  const context = awareness.buildContext({
    timeOfDay: 'morning',
    device: 'desktop',
    userActivity: {
      sessionDuration: 300000, // 5分钟
      messageCount: 15,
      lastInteraction: 5000,
    },
    conversation: {
      length: 20,
      sentiment: 'positive',
    },
  });


  // 分析上下文
  const analysis = awareness.analyzeContext(context);
    warmth: analysis.warmth,
    activity: analysis.activity,
    engagement: analysis.engagement,
  });

  // 判断是否需要调整
  const shouldAdjust = awareness.shouldAdjustTemperature(context);

  // 获取建议
  const suggestions = awareness.getContextSuggestions(context);
}

// ========== 示例4：使用温度感评分器 ==========

async function example4() {
  const scorer = new TemperatureScorer();

  const score = await scorer.calculate({
    userEmotion: 'happy',
    context: {
      timeOfDay: 'afternoon',
      device: 'desktop',
      userActivity: {
        sessionDuration: 180000, // 3分钟
        messageCount: 12,
        lastInteraction: 3000,
      },
      conversation: {
        length: 15,
        sentiment: 'positive',
      },
    },
    history: [
      '你好',
      '今天天气真好',
      '是啊，心情也很好',
    ],
  });

}

// ========== 示例5：使用温度感预测器 ==========

async function example5() {
  const predictor = new TemperaturePredictor();
  const scorer = new TemperatureScorer();

  // 模拟一系列温度感数据
  for (let i = 0; i < 10; i++) {
    const score = await scorer.calculate({
      userEmotion: i % 2 === 0 ? 'happy' : 'neutral',
      context: {
        timeOfDay: 'morning',
        device: 'desktop',
        userActivity: {
          sessionDuration: i * 60000,
          messageCount: i * 2,
          lastInteraction: 1000,
        },
        conversation: {
          length: i * 2,
          sentiment: i % 2 === 0 ? 'positive' : 'neutral',
        },
      },
    });

    predictor.addDataPoint(score);
  }

  // 预测未来温度感
  const prediction = predictor.predict(60000); // 预测1分钟后
    score: prediction.predictedScore,
    level: prediction.predictedLevel,
    trend: prediction.trend,
    confidence: prediction.confidence,
  });
}

// ========== 示例6：在React组件中使用 ==========

/*
import { useTemperatureEngine } from '../hooks/useTemperatureEngine';

function ChatComponent() {
  const { engine, state, isReady } = useTemperatureEngine();

  const handleMessage = async (message: string) => {
    if (!engine || !isReady) return;

    // 分析情绪
    const emotion = await engine.analyzeEmotion({
      text: message,
    });

    // 计算温度感
    const temperature = await engine.calculateTemperature({
      userEmotion: emotion.type,
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

    // 根据温度感调整UI
    if (temperature.level === 'warm') {
      document.body.classList.add('temperature-warm');
    }
  };

  return (
    <div>
      {state?.currentTemperature && (
        <div>
          <p>当前温度感: {state.currentTemperature.level}</p>
          <p>评分: {state.currentTemperature.score}</p>
        </div>
      )}
    </div>
  );
}
*/

export { example1, example2, example3, example4, example5 };




