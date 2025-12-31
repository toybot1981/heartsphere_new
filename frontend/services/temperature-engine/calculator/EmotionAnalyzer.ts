/**
 * 情绪分析器
 * 分析用户文本、上下文和历史，识别用户情绪
 */

import {
  EmotionType,
  EmotionAnalysis,
  EmotionInput,
  EmotionSuggestion,
  TemperatureContext,
} from '../types/TemperatureTypes';

/**
 * 情绪关键词映射
 */
const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  happy: [
    '开心', '高兴', '快乐', '愉快', '兴奋', '满足', '幸福', '喜悦',
    '太棒了', '太好了', '喜欢', '爱', '😊', '😄', '😁', '😃',
    'awesome', 'great', 'wonderful', 'amazing', 'love', 'like',
  ],
  sad: [
    '难过', '伤心', '沮丧', '失落', '失望', '不开心', '郁闷', '悲伤',
    '😔', '😢', '😭', '😞', '😟',
    'sad', 'unhappy', 'depressed', 'disappointed', 'upset',
  ],
  anxious: [
    '担心', '焦虑', '紧张', '不安', '害怕', '恐惧', '担忧', '烦躁',
    '😰', '😨', '😱', '😟', '😖',
    'anxious', 'worried', 'nervous', 'stressed', 'afraid', 'scared',
  ],
  calm: [
    '平静', '放松', '安静', '宁静', '舒适', '轻松', '平和',
    '😌', '😊', '😇',
    'calm', 'relaxed', 'peaceful', 'comfortable', 'easy',
  ],
  excited: [
    '兴奋', '激动', '期待', '期待', '迫不及待', '兴奋不已',
    '😆', '🤩', '😍',
    'excited', 'thrilled', 'eager', 'enthusiastic',
  ],
  tired: [
    '累', '疲惫', '疲倦', '困', '疲劳', '乏力', '没精神',
    '😴', '😪', '😫', '😩',
    'tired', 'exhausted', 'sleepy', 'weary', 'fatigued',
  ],
  neutral: [],
};

/**
 * 情绪强度关键词
 */
const INTENSITY_KEYWORDS = {
  high: ['非常', '特别', '超级', '极其', '十分', '很', '太', 'really', 'very', 'extremely', 'super'],
  medium: ['比较', '有点', '稍微', 'quite', 'somewhat', 'a bit'],
  low: ['一点', '稍微', 'slightly', 'a little'],
};

/**
 * 情绪分析器类
 */
export class EmotionAnalyzer {
  /**
   * 分析情绪
   */
  async analyze(input: EmotionInput): Promise<EmotionAnalysis> {
    const { text, context, conversationHistory, userProfile } = input;

    // 1. 文本分析
    const textAnalysis = this.analyzeText(text);

    // 2. 上下文分析
    const contextAnalysis = this.analyzeContext(context);

    // 3. 历史分析
    const historyAnalysis = this.analyzeHistory(conversationHistory);

    // 4. 综合计算
    const emotion = this.computeEmotion(textAnalysis, contextAnalysis, historyAnalysis);

    // 5. 生成建议
    const suggestions = this.generateSuggestions(emotion, context);

    return {
      type: emotion.type,
      confidence: emotion.confidence,
      intensity: emotion.intensity,
      factors: {
        text: textAnalysis.score,
        context: contextAnalysis.score,
        history: historyAnalysis.score,
      },
      suggestions,
      timestamp: Date.now(),
    };
  }

  /**
   * 分析文本
   */
  private analyzeText(text: string): {
    type: EmotionType;
    score: number;
    intensity: number;
  } {
    const lowerText = text.toLowerCase();
    const emotionScores: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      anxious: 0,
      calm: 0,
      excited: 0,
      tired: 0,
      neutral: 0,
    };

    // 计算每种情绪的关键词匹配度
    for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
      if (emotion === 'neutral') continue;

      const matches = keywords.filter(keyword =>
        lowerText.includes(keyword.toLowerCase())
      ).length;

      emotionScores[emotion as EmotionType] = matches / Math.max(keywords.length, 1);
    }

    // 计算强度
    let intensity = 0.5; // 默认中等强度
    for (const [level, keywords] of Object.entries(INTENSITY_KEYWORDS)) {
      if (keywords.some(kw => lowerText.includes(kw.toLowerCase()))) {
        intensity = level === 'high' ? 0.9 : level === 'medium' ? 0.6 : 0.3;
        break;
      }
    }

    // 找到得分最高的情绪
    let maxScore = 0;
    let detectedEmotion: EmotionType = 'neutral';

    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedEmotion = emotion as EmotionType;
      }
    }

    // 如果所有情绪得分都很低，返回中性
    if (maxScore < 0.1) {
      detectedEmotion = 'neutral';
      maxScore = 0.5;
    }

    return {
      type: detectedEmotion,
      score: Math.min(maxScore, 1),
      intensity,
    };
  }

  /**
   * 分析上下文
   */
  private analyzeContext(context?: Partial<TemperatureContext>): {
    score: number;
    emotionHint?: EmotionType;
  } {
    if (!context) {
      return { score: 0.5 };
    }

    let score = 0.5;
    let emotionHint: EmotionType | undefined;

    // 根据时间判断
    if (context.timeOfDay) {
      switch (context.timeOfDay) {
        case 'morning':
          score += 0.1; // 早上通常情绪较好
          emotionHint = 'calm';
          break;
        case 'evening':
        case 'night':
          score -= 0.1; // 晚上可能更疲惫
          emotionHint = 'tired';
          break;
      }
    }

    // 根据对话情感倾向判断
    if (context.conversation?.sentiment) {
      switch (context.conversation.sentiment) {
        case 'positive':
          score += 0.2;
          emotionHint = 'happy';
          break;
        case 'negative':
          score -= 0.2;
          emotionHint = 'sad';
          break;
      }
    }

    // 根据会话时长判断
    if (context.userActivity?.sessionDuration) {
      const duration = context.userActivity.sessionDuration;
      if (duration > 3600000) { // 超过1小时
        score -= 0.1;
        emotionHint = 'tired';
      }
    }

    return {
      score: Math.max(0, Math.min(1, score)),
      emotionHint,
    };
  }

  /**
   * 分析历史
   */
  private analyzeHistory(history?: any[]): {
    score: number;
    emotionTrend?: EmotionType;
  } {
    if (!history || history.length === 0) {
      return { score: 0.5 };
    }

    // 分析最近的情绪趋势
    const recentMessages = history.slice(-10); // 最近10条消息
    const emotionCounts: Record<EmotionType, number> = {
      happy: 0,
      sad: 0,
      anxious: 0,
      calm: 0,
      excited: 0,
      tired: 0,
      neutral: 0,
    };

    // 简单统计最近消息中的情绪关键词
    for (const message of recentMessages) {
      const text = typeof message === 'string' ? message : message.content || '';
      const textAnalysis = this.analyzeText(text);
      emotionCounts[textAnalysis.type]++;
    }

    // 找到最常见的情绪
    let maxCount = 0;
    let dominantEmotion: EmotionType = 'neutral';

    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion as EmotionType;
      }
    }

    // 计算得分（基于情绪一致性）
    const totalMessages = recentMessages.length;
    const consistency = maxCount / Math.max(totalMessages, 1);
    const score = 0.5 + (consistency - 0.5) * 0.5; // 归一化到0-1

    return {
      score: Math.max(0, Math.min(1, score)),
      emotionTrend: dominantEmotion,
    };
  }

  /**
   * 综合计算情绪
   */
  private computeEmotion(
    textAnalysis: { type: EmotionType; score: number; intensity: number },
    contextAnalysis: { score: number; emotionHint?: EmotionType },
    historyAnalysis: { score: number; emotionTrend?: EmotionType }
  ): {
    type: EmotionType;
    confidence: number;
    intensity: number;
  } {
    // 权重分配
    const textWeight = 0.5;
    const contextWeight = 0.3;
    const historyWeight = 0.2;

    // 确定最终情绪类型
    let finalEmotion: EmotionType = textAnalysis.type;

    // 如果上下文或历史有强烈提示，考虑调整
    if (contextAnalysis.emotionHint && contextAnalysis.score > 0.7) {
      // 上下文提示较强，但文本分析优先级更高
      if (textAnalysis.score < 0.3) {
        finalEmotion = contextAnalysis.emotionHint;
      }
    }

    if (historyAnalysis.emotionTrend && historyAnalysis.score > 0.7) {
      // 历史趋势较强，但文本分析优先级最高
      if (textAnalysis.score < 0.2) {
        finalEmotion = historyAnalysis.emotionTrend;
      }
    }

    // 计算置信度
    const confidence =
      textAnalysis.score * textWeight +
      contextAnalysis.score * contextWeight +
      historyAnalysis.score * historyWeight;

    // 强度主要来自文本分析
    const intensity = textAnalysis.intensity;

    return {
      type: finalEmotion,
      confidence: Math.max(0.3, Math.min(1, confidence)), // 置信度至少0.3
      intensity: Math.max(0.3, Math.min(1, intensity)), // 强度至少0.3
    };
  }

  /**
   * 生成建议
   */
  private generateSuggestions(
    emotion: { type: EmotionType; confidence: number; intensity: number },
    context?: Partial<TemperatureContext>
  ): EmotionSuggestion[] {
    const suggestions: EmotionSuggestion[] = [];

    // 根据情绪类型生成建议
    switch (emotion.type) {
      case 'happy':
        suggestions.push({
          type: 'expression',
          value: 'happy',
          priority: 'high',
        });
        suggestions.push({
          type: 'greeting',
          value: '看到你开心我也很高兴！✨',
          priority: 'medium',
        });
        break;

      case 'sad':
        suggestions.push({
          type: 'expression',
          value: 'sad',
          priority: 'high',
        });
        suggestions.push({
          type: 'greeting',
          value: '抱抱你 🤗 不开心的时候，我在这里陪你',
          priority: 'high',
        });
        break;

      case 'anxious':
        suggestions.push({
          type: 'expression',
          value: 'thinking',
          priority: 'high',
        });
        suggestions.push({
          type: 'greeting',
          value: '深呼吸，慢慢来 💙',
          priority: 'high',
        });
        break;

      case 'calm':
        suggestions.push({
          type: 'expression',
          value: 'neutral',
          priority: 'medium',
        });
        suggestions.push({
          type: 'greeting',
          value: '这种平静的状态真好 💙',
          priority: 'low',
        });
        break;

      case 'excited':
        suggestions.push({
          type: 'expression',
          value: 'happy',
          priority: 'high',
        });
        suggestions.push({
          type: 'greeting',
          value: '感受到你的兴奋了！✨',
          priority: 'medium',
        });
        break;

      case 'tired':
        suggestions.push({
          type: 'expression',
          value: 'neutral',
          priority: 'medium',
        });
        suggestions.push({
          type: 'greeting',
          value: '看起来你有点累了，要注意休息哦 💙',
          priority: 'high',
        });
        break;

      default:
        suggestions.push({
          type: 'expression',
          value: 'neutral',
          priority: 'low',
        });
    }

    return suggestions;
  }
}



