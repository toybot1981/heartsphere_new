/**
 * 文本情绪识别器
 * 通过分析文本内容识别用户情绪
 */

import {
  EmotionType,
  EmotionIntensity,
  EmotionAnalysisRequest,
  EmotionAnalysisResponse,
  EmotionKeyword,
} from '../types/EmotionTypes';

/**
 * 情绪关键词库
 */
const emotionKeywords: EmotionKeyword[] = [
  // 积极情绪关键词
  { keyword: '开心', emotionType: EmotionType.HAPPY, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '高兴', emotionType: EmotionType.HAPPY, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '快乐', emotionType: EmotionType.HAPPY, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '太棒了', emotionType: EmotionType.EXCITED, intensity: EmotionIntensity.STRONG, weight: 0.9 },
  { keyword: '兴奋', emotionType: EmotionType.EXCITED, intensity: EmotionIntensity.STRONG, weight: 0.9 },
  { keyword: '满足', emotionType: EmotionType.CONTENT, intensity: EmotionIntensity.MILD, weight: 0.7 },
  { keyword: '平静', emotionType: EmotionType.PEACEFUL, intensity: EmotionIntensity.MILD, weight: 0.6 },
  { keyword: '希望', emotionType: EmotionType.HOPEFUL, intensity: EmotionIntensity.MODERATE, weight: 0.7 },
  { keyword: '感激', emotionType: EmotionType.GRATEFUL, intensity: EmotionIntensity.MODERATE, weight: 0.7 },
  
  // 消极情绪关键词
  { keyword: '难过', emotionType: EmotionType.SAD, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '伤心', emotionType: EmotionType.SAD, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '焦虑', emotionType: EmotionType.ANXIOUS, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '担心', emotionType: EmotionType.ANXIOUS, intensity: EmotionIntensity.MILD, weight: 0.7 },
  { keyword: '生气', emotionType: EmotionType.ANGRY, intensity: EmotionIntensity.STRONG, weight: 0.9 },
  { keyword: '愤怒', emotionType: EmotionType.ANGRY, intensity: EmotionIntensity.STRONG, weight: 0.9 },
  { keyword: '孤独', emotionType: EmotionType.LONELY, intensity: EmotionIntensity.MODERATE, weight: 0.8 },
  { keyword: '累', emotionType: EmotionType.TIRED, intensity: EmotionIntensity.MILD, weight: 0.6 },
  { keyword: '疲惫', emotionType: EmotionType.TIRED, intensity: EmotionIntensity.MODERATE, weight: 0.7 },
  { keyword: '迷茫', emotionType: EmotionType.CONFUSED, intensity: EmotionIntensity.MODERATE, weight: 0.7 },
];

/**
 * 文本情绪识别器类
 */
export class TextEmotionRecognizer {
  private keywords: EmotionKeyword[];

  constructor(customKeywords?: EmotionKeyword[]) {
    this.keywords = customKeywords || emotionKeywords;
  }

  /**
   * 分析文本情绪
   */
  async analyze(request: EmotionAnalysisRequest): Promise<EmotionAnalysisResponse> {
    if (!request.text) {
      return this.getDefaultResponse();
    }

    const text = request.text.toLowerCase();
    
    // 1. 关键词匹配
    const keywordMatches = this.matchKeywords(text);
    
    // 2. 标点符号分析
    const punctuationScore = this.analyzePunctuation(request.text);
    
    // 3. 表情符号分析
    const emojiScore = this.analyzeEmojis(request.text);
    
    // 4. 文本长度和复杂度分析
    const complexityScore = this.analyzeComplexity(request.text);
    
    // 5. 综合评分
    const emotionScores = this.calculateEmotionScores(
      keywordMatches,
      punctuationScore,
      emojiScore,
      complexityScore
    );
    
    // 6. 选择主要情绪
    const primaryEmotion = this.selectPrimaryEmotion(emotionScores);
    const secondaryEmotions = this.selectSecondaryEmotions(emotionScores, primaryEmotion);
    
    // 7. 确定强度
    const intensity = this.determineIntensity(emotionScores[primaryEmotion] || 0);
    
    // 8. 计算置信度
    const confidence = this.calculateConfidence(emotionScores, primaryEmotion);
    
    // 9. 提取关键短语
    const keyPhrases = this.extractKeyPhrases(request.text, keywordMatches);
    
    // 10. 生成情绪标签
    const emotionTags = this.generateEmotionTags(primaryEmotion, request.context);
    
    return {
      primaryEmotion,
      secondaryEmotions,
      intensity,
      confidence,
      emotionTags,
      keyPhrases,
      reasoning: this.generateReasoning(primaryEmotion, intensity, keywordMatches),
    };
  }

  /**
   * 匹配关键词
   */
  private matchKeywords(text: string): Array<{ keyword: EmotionKeyword; count: number }> {
    const matches: Array<{ keyword: EmotionKeyword; count: number }> = [];
    
    for (const keyword of this.keywords) {
      let count = 0;
      
      // 检查上下文关键词
      if (keyword.context && keyword.context.length > 0) {
        const hasAllContext = keyword.context.every(ctx => text.includes(ctx.toLowerCase()));
        if (hasAllContext && text.includes(keyword.keyword.toLowerCase())) {
          count = 1;
        }
      } else {
        // 简单匹配
        const regex = new RegExp(keyword.keyword, 'gi');
        const matches = text.match(regex);
        count = matches ? matches.length : 0;
      }
      
      if (count > 0) {
        matches.push({ keyword, count });
      }
    }
    
    return matches;
  }

  /**
   * 分析标点符号
   */
  private analyzePunctuation(text: string): Record<EmotionType, number> {
    const scores: Record<EmotionType, number> = {} as any;
    
    const exclamationCount = (text.match(/！|!/g) || []).length;
    const questionCount = (text.match(/[？?]/g) || []).length;
    const ellipsisCount = (text.match(/…|\.\.\./g) || []).length;
    
    // 感叹号通常表示积极或强烈情绪
    if (exclamationCount > 0) {
      scores[EmotionType.EXCITED] = exclamationCount * 0.2;
      scores[EmotionType.HAPPY] = exclamationCount * 0.15;
    }
    
    // 问号可能表示困惑或焦虑
    if (questionCount > 0) {
      scores[EmotionType.CONFUSED] = questionCount * 0.15;
      scores[EmotionType.ANXIOUS] = questionCount * 0.1;
    }
    
    // 省略号可能表示消极情绪或思考
    if (ellipsisCount > 0) {
      scores[EmotionType.SAD] = ellipsisCount * 0.2;
      scores[EmotionType.THOUGHTFUL] = ellipsisCount * 0.15;
    }
    
    return scores;
  }

  /**
   * 分析表情符号
   */
  private analyzeEmojis(text: string): Record<EmotionType, number> {
    const scores: Record<EmotionType, number> = {} as any;
    
    const positiveEmojis = ['😊', '😄', '😁', '😃', '😆', '😍', '🥰', '😘', '🤗', '👍', '❤️', '💙', '✨', '⭐'];
    const negativeEmojis = ['😢', '😭', '😔', '😞', '😟', '😕', '😤', '😠', '😡', '💔', '😰', '😨', '😓'];
    const neutralEmojis = ['🤔', '😐', '😑', '🙂', '😶'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;
    
    for (const emoji of positiveEmojis) {
      if (text.includes(emoji)) positiveCount++;
    }
    
    for (const emoji of negativeEmojis) {
      if (text.includes(emoji)) negativeCount++;
    }
    
    for (const emoji of neutralEmojis) {
      if (text.includes(emoji)) neutralCount++;
    }
    
    if (positiveCount > 0) {
      scores[EmotionType.HAPPY] = positiveCount * 0.3;
      scores[EmotionType.EXCITED] = positiveCount * 0.2;
    }
    
    if (negativeCount > 0) {
      scores[EmotionType.SAD] = negativeCount * 0.3;
      scores[EmotionType.ANXIOUS] = negativeCount * 0.15;
    }
    
    if (neutralCount > 0) {
      scores[EmotionType.CALM] = neutralCount * 0.2;
      scores[EmotionType.THOUGHTFUL] = neutralCount * 0.15;
    }
    
    return scores;
  }

  /**
   * 分析文本复杂度
   */
  private analyzeComplexity(text: string): Record<EmotionType, number> {
    const scores: Record<EmotionType, number> = {} as any;
    
    const length = text.length;
    const wordCount = text.split(/\s+/).length;
    
    // 很短的文本可能表示情绪强烈或简洁
    if (length < 10) {
      scores[EmotionType.EXCITED] = 0.1;
      scores[EmotionType.ANGRY] = 0.1;
    }
    
    // 很长的文本可能表示思考或详细描述
    if (length > 200) {
      scores[EmotionType.THOUGHTFUL] = 0.15;
      scores[EmotionType.CONFUSED] = 0.1;
    }
    
    return scores;
  }

  /**
   * 计算情绪得分
   */
  private calculateEmotionScores(
    keywordMatches: Array<{ keyword: EmotionKeyword; count: number }>,
    punctuationScore: Record<EmotionType, number>,
    emojiScore: Record<EmotionType, number>,
    complexityScore: Record<EmotionType, number>
  ): Record<EmotionType, number> {
    const scores: Record<EmotionType, number> = {} as any;
    
    // 初始化所有情绪得分为0
    Object.values(EmotionType).forEach(emotion => {
      scores[emotion] = 0;
    });
    
    // 关键词得分
    keywordMatches.forEach(({ keyword, count }) => {
      const baseScore = keyword.weight * count;
      const intensityMultiplier = keyword.intensity === EmotionIntensity.STRONG ? 1.5 :
                                  keyword.intensity === EmotionIntensity.MODERATE ? 1.0 : 0.7;
      scores[keyword.emotionType] = (scores[keyword.emotionType] || 0) + baseScore * intensityMultiplier;
    });
    
    // 标点符号得分
    Object.entries(punctuationScore).forEach(([emotion, score]) => {
      scores[emotion as EmotionType] = (scores[emotion as EmotionType] || 0) + score;
    });
    
    // 表情符号得分
    Object.entries(emojiScore).forEach(([emotion, score]) => {
      scores[emotion as EmotionType] = (scores[emotion as EmotionType] || 0) + score;
    });
    
    // 复杂度得分
    Object.entries(complexityScore).forEach(([emotion, score]) => {
      scores[emotion as EmotionType] = (scores[emotion as EmotionType] || 0) + score;
    });
    
    return scores;
  }

  /**
   * 选择主要情绪
   */
  private selectPrimaryEmotion(scores: Record<EmotionType, number>): EmotionType {
    let maxScore = 0;
    let primaryEmotion = EmotionType.CALM;
    
    Object.entries(scores).forEach(([emotion, score]) => {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion as EmotionType;
      }
    });
    
    // 如果所有得分都很低，返回中性情绪
    if (maxScore < 0.3) {
      return EmotionType.CALM;
    }
    
    return primaryEmotion;
  }

  /**
   * 选择次要情绪
   */
  private selectSecondaryEmotions(
    scores: Record<EmotionType, number>,
    primaryEmotion: EmotionType
  ): EmotionType[] {
    const sorted = Object.entries(scores)
      .filter(([emotion]) => emotion !== primaryEmotion)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .filter(([, score]) => score > 0.2)
      .map(([emotion]) => emotion as EmotionType);
    
    return sorted;
  }

  /**
   * 确定强度
   */
  private determineIntensity(score: number): EmotionIntensity {
    if (score >= 1.0) {
      return EmotionIntensity.STRONG;
    } else if (score >= 0.5) {
      return EmotionIntensity.MODERATE;
    } else {
      return EmotionIntensity.MILD;
    }
  }

  /**
   * 计算置信度
   */
  private calculateConfidence(
    scores: Record<EmotionType, number>,
    primaryEmotion: EmotionType
  ): number {
    const primaryScore = scores[primaryEmotion] || 0;
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    
    if (totalScore === 0) {
      return 0.3; // 低置信度
    }
    
    const dominance = primaryScore / totalScore;
    const baseConfidence = Math.min(0.9, Math.max(0.5, dominance));
    
    // 如果得分较高，提高置信度
    if (primaryScore > 1.0) {
      return Math.min(0.95, baseConfidence + 0.1);
    }
    
    return baseConfidence;
  }

  /**
   * 提取关键短语
   */
  private extractKeyPhrases(
    text: string,
    keywordMatches: Array<{ keyword: EmotionKeyword; count: number }>
  ): string[] {
    const phrases: string[] = [];
    
    // 提取包含关键词的短语（前后各10个字符）
    keywordMatches.forEach(({ keyword }) => {
      const index = text.toLowerCase().indexOf(keyword.keyword.toLowerCase());
      if (index !== -1) {
        const start = Math.max(0, index - 10);
        const end = Math.min(text.length, index + keyword.keyword.length + 10);
        const phrase = text.substring(start, end).trim();
        if (phrase && !phrases.includes(phrase)) {
          phrases.push(phrase);
        }
      }
    });
    
    return phrases.slice(0, 5); // 最多返回5个短语
  }

  /**
   * 生成情绪标签
   */
  private generateEmotionTags(
    emotion: EmotionType,
    context?: EmotionAnalysisRequest['context']
  ): string[] {
    const tags: string[] = [];
    
    // 基础标签
    const emotionTags: Record<EmotionType, string[]> = {
      [EmotionType.HAPPY]: ['快乐', '愉悦'],
      [EmotionType.EXCITED]: ['兴奋', '激动'],
      [EmotionType.SAD]: ['悲伤', '低落'],
      [EmotionType.ANXIOUS]: ['焦虑', '担心'],
      [EmotionType.ANGRY]: ['愤怒', '生气'],
      [EmotionType.LONELY]: ['孤独', '寂寞'],
      [EmotionType.TIRED]: ['疲惫', '劳累'],
      [EmotionType.CONFUSED]: ['困惑', '迷茫'],
      [EmotionType.CALM]: ['平静', '冷静'],
      [EmotionType.THOUGHTFUL]: ['思考', '沉思'],
      [EmotionType.CONTENT]: ['满足', '满意'],
      [EmotionType.PEACEFUL]: ['平和', '宁静'],
      [EmotionType.HOPEFUL]: ['希望', '期待'],
      [EmotionType.GRATEFUL]: ['感激', '感谢'],
      [EmotionType.FOCUSED]: ['专注', '集中'],
      [EmotionType.RELAXED]: ['放松', '轻松'],
    };
    
    tags.push(...(emotionTags[emotion] || []));
    
    // 根据上下文添加标签
    if (context?.timeOfDay !== undefined) {
      const hour = context.timeOfDay;
      if (hour >= 22 || hour < 6) {
        tags.push('深夜');
      } else if (hour >= 6 && hour < 12) {
        tags.push('早晨');
      } else if (hour >= 12 && hour < 18) {
        tags.push('下午');
      } else {
        tags.push('晚上');
      }
    }
    
    return tags;
  }

  /**
   * 生成分析理由
   */
  private generateReasoning(
    emotion: EmotionType,
    intensity: EmotionIntensity,
    keywordMatches: Array<{ keyword: EmotionKeyword; count: number }>
  ): string {
    const intensityText = intensity === EmotionIntensity.STRONG ? '强烈' :
                          intensity === EmotionIntensity.MODERATE ? '中等' : '轻微';
    
    const keywordText = keywordMatches.length > 0
      ? `检测到${keywordMatches.length}个相关关键词`
      : '未检测到明显关键词';
    
    return `识别为${emotion}情绪，强度为${intensityText}。${keywordText}。`;
  }

  /**
   * 获取默认响应
   */
  private getDefaultResponse(): EmotionAnalysisResponse {
    return {
      primaryEmotion: EmotionType.CALM,
      intensity: EmotionIntensity.MILD,
      confidence: 0.3,
      emotionTags: [],
      keyPhrases: [],
    };
  }
}

