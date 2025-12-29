/**
 * 陪伴记忆系统 React Hook
 */

import { useState, useEffect } from 'react';
import {
  CompanionMemorySystem,
  CompanionMemorySystemConfig,
} from '../CompanionMemorySystem';
import {
  CompanionMemory,
  CompanionMemoryStatistics,
} from '../types/CompanionMemoryTypes';

/**
 * 陪伴记忆系统 Hook
 */
export function useCompanionMemorySystem(config: CompanionMemorySystemConfig) {
  const [system, setSystem] = useState<CompanionMemorySystem | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [statistics, setStatistics] = useState<CompanionMemoryStatistics | null>(null);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    // 初始化系统
    const memorySystem = new CompanionMemorySystem(config);
    setSystem(memorySystem);
    setIsReady(true);

    // 加载统计数据
    const stats = memorySystem.getStatistics();
    setStatistics(stats);
  }, [config.enabled, config.userId]);

  /**
   * 记录对话记忆
   */
  const recordConversationMemory = async (
    conversationId: string,
    summary: string,
    emotion?: string
  ) => {
    if (system) {
      const memory = await system.recordConversationMemory(conversationId, summary, emotion);
      if (memory) {
        const stats = system.getStatistics();
        setStatistics(stats);
      }
      return memory;
    }
    return null;
  };

  /**
   * 记录里程碑记忆
   */
  const recordMilestoneMemory = async (milestone: any) => {
    if (system) {
      const memory = await system.recordMilestoneMemory(milestone);
      if (memory) {
        const stats = system.getStatistics();
        setStatistics(stats);
      }
      return memory;
    }
    return null;
  };

  /**
   * 记录情绪记忆
   */
  const recordEmotionMemory = async (
    emotionType: string,
    emotionIntensity: string,
    context: string
  ) => {
    if (system) {
      const memory = await system.recordEmotionMemory(emotionType, emotionIntensity, context);
      if (memory) {
        const stats = system.getStatistics();
        setStatistics(stats);
      }
      return memory;
    }
    return null;
  };

  /**
   * 记录特殊时刻记忆
   */
  const recordSpecialMomentMemory = async (
    title: string,
    content: string,
    metadata?: Record<string, any>
  ) => {
    if (system) {
      const memory = await system.recordSpecialMomentMemory(title, content, metadata);
      if (memory) {
        const stats = system.getStatistics();
        setStatistics(stats);
      }
      return memory;
    }
    return null;
  };

  /**
   * 记录关怀消息记忆
   */
  const recordCareMessageMemory = async (careMessage: string, triggerType: string) => {
    if (system) {
      const memory = await system.recordCareMessageMemory(careMessage, triggerType);
      if (memory) {
        const stats = system.getStatistics();
        setStatistics(stats);
      }
      return memory;
    }
    return null;
  };

  /**
   * 获取记忆
   */
  const getMemories = (options?: {
    type?: string;
    importance?: 'low' | 'medium' | 'high';
    startDate?: number;
    endDate?: number;
    limit?: number;
  }) => {
    if (system) {
      return system.getMemories(options);
    }
    return [];
  };

  /**
   * 刷新统计数据
   */
  const refreshStatistics = () => {
    if (system) {
      const stats = system.getStatistics();
      setStatistics(stats);
    }
  };

  return {
    system,
    isReady,
    statistics,
    recordConversationMemory,
    recordMilestoneMemory,
    recordEmotionMemory,
    recordSpecialMomentMemory,
    recordCareMessageMemory,
    getMemories,
    refreshStatistics,
  };
}

