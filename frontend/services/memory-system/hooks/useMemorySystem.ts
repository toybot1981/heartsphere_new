/**
 * 个性化记忆系统 React Hook
 */

import { useEffect, useState, useRef } from 'react';
import { MemorySystem, MemorySystemConfig } from '../MemorySystem';
import { UserMemory, MemorySearchOptions } from '../types/MemoryTypes';
import { MemorySource } from '../types/MemoryTypes';

/**
 * useMemorySystem Hook
 */
export const useMemorySystem = (config: MemorySystemConfig & { aiEnhanced?: boolean }) => {
  const systemRef = useRef<MemorySystem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化系统
    const system = new MemorySystem({
      ...config,
      aiEnhanced: config.aiEnhanced ?? false,
    });
    systemRef.current = system;
    setIsReady(true);

    return () => {
      // 清理
      systemRef.current = null;
    };
  }, [config.userId]);

  /**
   * 提取并保存记忆
   */
  const extractAndSave = async (
    text: string,
    source: MemorySource = MemorySource.CONVERSATION,
    sourceId?: string
  ): Promise<UserMemory[]> => {
    if (!systemRef.current) {
      throw new Error('MemorySystem not initialized');
    }

    return systemRef.current.extractAndSave({
      text,
      source,
      sourceId,
      context: {
        userProfile: { id: config.userId },
      },
    });
  };

  /**
   * 搜索记忆
   */
  const searchMemories = async (options: MemorySearchOptions): Promise<UserMemory[]> => {
    if (!systemRef.current) {
      throw new Error('MemorySystem not initialized');
    }
    return systemRef.current.searchMemories(options);
  };

  /**
   * 获取相关记忆
   */
  const getRelevantMemories = async (context: string, limit: number = 5): Promise<UserMemory[]> => {
    if (!systemRef.current) {
      throw new Error('MemorySystem not initialized');
    }
    return systemRef.current.getRelevantMemories(context, limit);
  };

  /**
   * 添加记忆
   */
  const addMemory = async (memory: Omit<UserMemory, 'id' | 'userId' | 'timestamp' | 'usageCount'>): Promise<UserMemory> => {
    if (!systemRef.current) {
      throw new Error('MemorySystem not initialized');
    }
    return systemRef.current.addMemory(memory);
  };

  /**
   * 获取记忆统计
   */
  const getStatistics = async () => {
    if (!systemRef.current) {
      throw new Error('MemorySystem not initialized');
    }
    return systemRef.current.getMemoryStatistics();
  };

  return {
    system: systemRef.current,
    isReady,
    extractAndSave,
    searchMemories,
    getRelevantMemories,
    addMemory,
    getStatistics,
  };
};

