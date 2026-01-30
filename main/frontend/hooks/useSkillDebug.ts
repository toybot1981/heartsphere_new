/**
 * 技能调试 Hook
 * 用于在 ChatWindow 中管理技能调试状态和数据
 */
import { useState, useEffect, useCallback } from 'react';
import { SkillExecutionRecord, SkillDebugInfo } from '../types/skill';
import { skillDebugService } from '../services/api/skill/skillDebugService';

interface UseSkillDebugOptions {
  conversationId?: number;
  userId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // 毫秒
}

export const useSkillDebug = (options: UseSkillDebugOptions = {}) => {
  const {
    conversationId,
    userId,
    autoRefresh = false,
    refreshInterval = 5000, // 默认5秒
  } = options;

  const [debugInfo, setDebugInfo] = useState<SkillDebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 加载技能执行历史
   */
  const loadSkillHistory = useCallback(async () => {
    if (!conversationId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const records = await skillDebugService.getConversationHistory(conversationId);
      setDebugInfo({
        records,
        lastUpdate: new Date().toISOString(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载技能历史失败';
      setError(errorMessage);
      console.error('Failed to load skill history:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  /**
   * 加载统计数据
   */
  const loadStatistics = useCallback(async () => {
    if (!userId) {
      return;
    }

    try {
      const statistics = await skillDebugService.getUserStatistics(userId, 7);
      setDebugInfo((prev) => ({
        ...prev,
        statistics,
      }));
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  }, [userId]);

  /**
   * 刷新数据
   */
  const refresh = useCallback(async () => {
    await Promise.all([
      loadSkillHistory(),
      loadStatistics(),
    ]);
  }, [loadSkillHistory, loadStatistics]);

  // 初始加载
  useEffect(() => {
    if (conversationId) {
      loadSkillHistory();
    }
    if (userId) {
      loadStatistics();
    }
  }, [conversationId, userId, loadSkillHistory, loadStatistics]);

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh || !conversationId) {
      return;
    }

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, conversationId, refreshInterval, refresh]);

  return {
    debugInfo,
    loading,
    error,
    refresh,
    loadSkillHistory,
    loadStatistics,
  };
};
