/**
 * 情绪融合系统
 * 融合多个来源的情绪识别结果
 */

import {
  EmotionType,
  EmotionIntensity,
  EmotionSource,
  EmotionAnalysisResponse,
  EmotionFusionConfig,
} from './types/EmotionTypes';

/**
 * 情绪融合器类
 */
export class EmotionFusion {
  private defaultConfig: EmotionFusionConfig = {
    sources: [
      { source: EmotionSource.CONVERSATION, weight: 0.5, confidence: 0.8 },
      { source: EmotionSource.BEHAVIOR, weight: 0.3, confidence: 0.6 },
      { source: EmotionSource.JOURNAL, weight: 0.2, confidence: 0.7 },
    ],
  };

  /**
   * 融合情绪识别结果
   */
  fuseEmotionResults(
    results: Array<{ source: EmotionSource; emotion: EmotionAnalysisResponse }>,
    config?: EmotionFusionConfig
  ): EmotionAnalysisResponse {
    const fusionConfig = config || this.defaultConfig;
    
    if (results.length === 0) {
      return this.getDefaultResponse();
    }
    
    // 如果只有一个结果，直接返回
    if (results.length === 1) {
      return results[0].emotion;
    }
    
    // 计算各情绪的综合得分
    const emotionScores: Record<EmotionType, number> = {} as any;
    
    // 初始化得分
    Object.values(EmotionType).forEach(emotion => {
      emotionScores[emotion] = 0;
    });
    
    // 加权计算各来源的情绪得分
    results.forEach(result => {
      const sourceConfig = fusionConfig.sources.find(s => s.source === result.source);
      if (!sourceConfig) return;
      
      const weight = sourceConfig.weight * result.emotion.confidence * sourceConfig.confidence;
      const intensityScore = this.getIntensityScore(result.emotion.intensity);
      
      // 主要情绪得分
      emotionScores[result.emotion.primaryEmotion] = 
        (emotionScores[result.emotion.primaryEmotion] || 0) + weight * intensityScore;
      
      // 次要情绪得分
      if (result.emotion.secondaryEmotions) {
        result.emotion.secondaryEmotions.forEach(emotion => {
          emotionScores[emotion] = (emotionScores[emotion] || 0) + weight * intensityScore * 0.5;
        });
      }
    });
    
    // 选择得分最高的情绪作为主要情绪
    const primaryEmotion = Object.entries(emotionScores)
      .sort((a, b) => b[1] - a[1])[0]?.[0] as EmotionType;
    
    // 选择次要情绪（得分第二、第三高的）
    const secondaryEmotions = Object.entries(emotionScores)
      .filter(([emotion]) => emotion !== primaryEmotion)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .filter(([, score]) => score > 0.1)
      .map(([emotion]) => emotion as EmotionType);
    
    // 计算综合置信度
    const overallConfidence = results.reduce((sum, r, i) => {
      const sourceConfig = fusionConfig.sources.find(s => s.source === r.source);
      return sum + (r.emotion.confidence * (sourceConfig?.weight || 0));
    }, 0);
    
    // 确定情绪强度
    const primaryScore = emotionScores[primaryEmotion] || 0;
    const intensity = this.determineIntensity(primaryScore);
    
    // 合并情绪标签和关键短语
    const emotionTags = this.mergeTags(results.map(r => r.emotion.emotionTags));
    const keyPhrases = this.mergePhrases(results.map(r => r.emotion.keyPhrases));
    
    // 生成融合理由
    const reasoning = this.generateFusionReasoning(results, primaryEmotion, overallConfidence);
    
    return {
      primaryEmotion,
      secondaryEmotions: secondaryEmotions.length > 0 ? secondaryEmotions : undefined,
      intensity,
      confidence: Math.min(0.95, overallConfidence),
      emotionTags,
      keyPhrases,
      reasoning,
    };
  }

  /**
   * 获取强度分数
   */
  private getIntensityScore(intensity: EmotionIntensity): number {
    switch (intensity) {
      case EmotionIntensity.MILD:
        return 0.5;
      case EmotionIntensity.MODERATE:
        return 1.0;
      case EmotionIntensity.STRONG:
        return 1.5;
      default:
        return 1.0;
    }
  }

  /**
   * 确定情绪强度
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
   * 合并标签
   */
  private mergeTags(tagsArrays: string[][]): string[] {
    const tagSet = new Set<string>();
    tagsArrays.forEach(tags => {
      tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }

  /**
   * 合并关键短语
   */
  private mergePhrases(phrasesArrays: string[][]): string[] {
    const phraseSet = new Set<string>();
    phrasesArrays.forEach(phrases => {
      phrases.forEach(phrase => phraseSet.add(phrase));
    });
    return Array.from(phraseSet).slice(0, 5); // 最多返回5个
  }

  /**
   * 生成融合理由
   */
  private generateFusionReasoning(
    results: Array<{ source: EmotionSource; emotion: EmotionAnalysisResponse }>,
    primaryEmotion: EmotionType,
    confidence: number
  ): string {
    const sourceNames = results.map(r => {
      switch (r.source) {
        case EmotionSource.CONVERSATION:
          return '对话';
        case EmotionSource.JOURNAL:
          return '日记';
        case EmotionSource.BEHAVIOR:
          return '行为';
        default:
          return '其他';
      }
    });
    
    return `融合${results.length}个来源（${sourceNames.join('、')}）的情绪识别结果，综合判断为${primaryEmotion}情绪，置信度${(confidence * 100).toFixed(0)}%。`;
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

