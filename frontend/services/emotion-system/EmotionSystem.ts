/**
 * 情绪感知系统核心类
 * 整合所有情绪识别器和分析功能
 */

import {
  EmotionType,
  EmotionIntensity,
  EmotionSource,
  EmotionRecord,
  EmotionAnalysisRequest,
  EmotionAnalysisResponse,
  EmotionTrend,
} from './types/EmotionTypes';
import { TextEmotionRecognizer } from './recognizers/TextEmotionRecognizer';
import { BehaviorEmotionRecognizer, Interaction } from './recognizers/BehaviorEmotionRecognizer';
import { TimeEmotionRecognizer } from './recognizers/TimeEmotionRecognizer';
import { EmotionFusion } from './EmotionFusion';
import { EmotionAnalyzer, LocalEmotionStorage, IEmotionStorage } from './storage/EmotionStorage';
import { AIEmotionAnalyzer } from './ai/AIEmotionAnalyzer';

/**
 * 情绪系统配置
 */
export interface EmotionSystemConfig {
  enabled: boolean;
  fusionEnabled: boolean;
  storageEnabled: boolean;
  autoAnalysis: boolean;
  aiEnhanced: boolean; // 是否使用AI增强分析
  userId: number;
}

/**
 * 情绪感知系统类
 */
export class EmotionSystem {
  private config: EmotionSystemConfig;
  private textRecognizer: TextEmotionRecognizer;
  private behaviorRecognizer: BehaviorEmotionRecognizer;
  private timeRecognizer: TimeEmotionRecognizer;
  private fusion: EmotionFusion;
  private analyzer: EmotionAnalyzer;
  private storage: IEmotionStorage;
  private aiAnalyzer: AIEmotionAnalyzer;

  constructor(config: EmotionSystemConfig, storage?: IEmotionStorage) {
    this.config = config;
    this.storage = storage || new LocalEmotionStorage();
    
    this.textRecognizer = new TextEmotionRecognizer();
    this.behaviorRecognizer = new BehaviorEmotionRecognizer();
    this.timeRecognizer = new TimeEmotionRecognizer();
    this.fusion = new EmotionFusion();
    this.analyzer = new EmotionAnalyzer(this.storage);
    this.aiAnalyzer = new AIEmotionAnalyzer();
  }

  /**
   * 分析情绪（综合多种来源）
   */
  async analyzeEmotion(
    request: EmotionAnalysisRequest,
    interactions?: Interaction[]
  ): Promise<EmotionAnalysisResponse> {
    if (!this.config.enabled) {
      return this.getDefaultResponse();
    }

    const results: Array<{ source: EmotionSource; emotion: EmotionAnalysisResponse }> = [];

    // 1. 文本情绪识别（优先使用AI增强）
    if (request.text) {
      try {
        let textResult: EmotionAnalysisResponse;
        
        if (this.config.aiEnhanced) {
          // 使用AI增强分析
          textResult = await this.aiAnalyzer.analyzeWithAI(request);
        } else {
          // 使用基础分析
          textResult = await this.textRecognizer.analyze(request);
        }
        
        if (textResult.confidence > 0.3) {
          results.push({
            source: request.source,
            emotion: textResult,
          });
        }
      } catch (error) {
        console.error('[EmotionSystem] 文本情绪识别失败:', error);
        // 降级到基础分析
        try {
          const fallbackResult = await this.textRecognizer.analyze(request);
          if (fallbackResult.confidence > 0.3) {
            results.push({
              source: request.source,
              emotion: fallbackResult,
            });
          }
        } catch (fallbackError) {
          console.error('[EmotionSystem] 基础分析也失败:', fallbackError);
        }
      }
    }

    // 2. 行为情绪识别
    if (interactions && interactions.length > 0) {
      try {
        const behaviorResult = await this.behaviorRecognizer.analyzeFromBehavior(interactions);
        if (behaviorResult && behaviorResult.confidence > 0.3) {
          results.push({
            source: EmotionSource.BEHAVIOR,
            emotion: behaviorResult,
          });
        }
      } catch (error) {
        console.error('[EmotionSystem] 行为情绪识别失败:', error);
      }
    }

    // 3. 时间情绪识别
    try {
      const timeResult = await this.timeRecognizer.analyzeFromTime(
        request.context?.timeOfDay,
        request.context?.dayOfWeek
      );
      if (timeResult && timeResult.confidence > 0.3) {
        results.push({
          source: EmotionSource.BEHAVIOR, // 时间因素作为行为的一部分
          emotion: timeResult,
        });
      }
    } catch (error) {
      console.error('[EmotionSystem] 时间情绪识别失败:', error);
    }

    // 4. 融合结果
    let finalResult: EmotionAnalysisResponse;
    if (this.config.fusionEnabled && results.length > 1) {
      finalResult = this.fusion.fuseEmotionResults(results);
    } else if (results.length > 0) {
      finalResult = results[0].emotion;
    } else {
      finalResult = this.getDefaultResponse();
    }

    // 5. 保存记录
    if (this.config.storageEnabled && finalResult.confidence > 0.4) {
      await this.saveEmotionRecord(finalResult, request);
    }

    return finalResult;
  }

  /**
   * 保存情绪记录
   */
  private async saveEmotionRecord(
    emotion: EmotionAnalysisResponse,
    request: EmotionAnalysisRequest
  ): Promise<void> {
    const record: EmotionRecord = {
      id: `emotion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      emotionType: emotion.primaryEmotion,
      emotionIntensity: emotion.intensity,
      emotionTags: emotion.emotionTags,
      confidence: emotion.confidence,
      source: request.source,
      context: request.text || '行为分析',
      timestamp: Date.now(),
      metadata: {
        triggerText: request.text,
        keyPhrases: emotion.keyPhrases,
        reasoning: emotion.reasoning,
      },
    };

    try {
      await this.storage.save(record);
    } catch (error) {
      console.error('[EmotionSystem] 保存情绪记录失败:', error);
    }
  }

  /**
   * 获取当前情绪
   */
  async getCurrentEmotion(): Promise<EmotionRecord | null> {
    const records = await this.storage.getByUserId(this.config.userId, {
      limit: 1,
    });
    return records.length > 0 ? records[0] : null;
  }

  /**
   * 获取情绪历史
   */
  async getEmotionHistory(options?: {
    startDate?: number;
    endDate?: number;
    source?: EmotionSource;
    emotionType?: EmotionType;
    limit?: number;
  }): Promise<EmotionRecord[]> {
    return this.storage.getByUserId(this.config.userId, options);
  }

  /**
   * 分析情绪趋势
   */
  async analyzeTrend(period: 'hour' | 'day' | 'week' | 'month' = 'week'): Promise<EmotionTrend> {
    return this.analyzer.analyzeTrend(this.config.userId, period);
  }

  /**
   * 获取情绪统计
   */
  async getEmotionStatistics(period: 'day' | 'week' | 'month' = 'week') {
    return this.analyzer.getEmotionStatistics(this.config.userId, period);
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

  /**
   * 更新配置
   */
  updateConfig(config: Partial<EmotionSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取配置
   */
  getConfig(): Readonly<EmotionSystemConfig> {
    return this.config;
  }
}

