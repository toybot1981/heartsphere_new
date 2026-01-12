/**
 * 情绪感知系统 React Hook
 */

import { useEffect, useState, useRef } from 'react';
import { EmotionSystem, EmotionSystemConfig } from '../EmotionSystem';
import { EmotionRecord, EmotionAnalysisResponse, EmotionTrend } from '../types/EmotionTypes';

/**
 * useEmotionSystem Hook
 */
export const useEmotionSystem = (config: EmotionSystemConfig & { aiEnhanced?: boolean }) => {
  const systemRef = useRef<EmotionSystem | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionRecord | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化系统
    const system = new EmotionSystem({
      ...config,
      aiEnhanced: config.aiEnhanced ?? false,
    });
    systemRef.current = system;
    setIsReady(true);

    // 获取当前情绪
    system.getCurrentEmotion().then(setCurrentEmotion);

    return () => {
      // 清理
      systemRef.current = null;
    };
  }, [config.userId]);

  /**
   * 分析情绪
   */
  const analyzeEmotion = async (
    text: string,
    source: 'conversation' | 'journal' | 'behavior' = 'conversation'
  ): Promise<EmotionAnalysisResponse> => {
    if (!systemRef.current) {
      throw new Error('EmotionSystem not initialized');
    }

    const result = await systemRef.current.analyzeEmotion({
      text,
      source: source as any,
      context: {
        timeOfDay: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
      },
    });

    // 更新当前情绪
    const current = await systemRef.current.getCurrentEmotion();
    setCurrentEmotion(current);

    return result;
  };

  /**
   * 获取情绪趋势
   */
  const getTrend = async (period: 'hour' | 'day' | 'week' | 'month' = 'week'): Promise<EmotionTrend> => {
    if (!systemRef.current) {
      throw new Error('EmotionSystem not initialized');
    }
    return systemRef.current.analyzeTrend(period);
  };

  /**
   * 获取情绪统计
   */
  const getStatistics = async (period: 'day' | 'week' | 'month' = 'week') => {
    if (!systemRef.current) {
      throw new Error('EmotionSystem not initialized');
    }
    return systemRef.current.getEmotionStatistics(period);
  };

  /**
   * 获取情绪历史
   */
  const getHistory = async (options?: {
    startDate?: number;
    endDate?: number;
    limit?: number;
  }): Promise<EmotionRecord[]> => {
    if (!systemRef.current) {
      throw new Error('EmotionSystem not initialized');
    }
    return systemRef.current.getEmotionHistory(options);
  };

  return {
    system: systemRef.current,
    currentEmotion,
    isReady,
    analyzeEmotion,
    getTrend,
    getStatistics,
    getHistory,
  };
};

