/**
 * 成长记录系统 React Hook
 */

import { useState, useEffect } from 'react';
import { GrowthSystem, GrowthSystemConfig } from '../GrowthSystem';
import { GrowthStatistics, GrowthMilestone } from '../types/GrowthTypes';

/**
 * 成长记录系统 Hook
 */
export function useGrowthSystem(config: GrowthSystemConfig) {
  const [system, setSystem] = useState<GrowthSystem | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [statistics, setStatistics] = useState<GrowthStatistics | null>(null);
  const [recentMilestones, setRecentMilestones] = useState<GrowthMilestone[]>([]);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    // 初始化系统
    const growthSystem = new GrowthSystem(config);
    setSystem(growthSystem);
    setIsReady(true);

    // 加载统计数据
    const stats = growthSystem.getStatistics();
    setStatistics(stats);
    setRecentMilestones(
      stats.milestones
        .sort((a, b) => b.achievedAt - a.achievedAt)
        .slice(0, 10) // 最近10个里程碑
    );
  }, [config.enabled, config.userId]);

  /**
   * 记录成长数据
   */
  const recordGrowth = async (data: {
    conversationCount?: number;
    memoryCount?: number;
    emotionRecords?: number;
    emotionScore?: number;
  }) => {
    if (system) {
      await system.recordGrowth(data);
      // 更新统计数据
      const stats = system.getStatistics();
      setStatistics(stats);
      setRecentMilestones(
        stats.milestones
          .sort((a, b) => b.achievedAt - a.achievedAt)
          .slice(0, 10)
      );
    }
  };

  /**
   * 刷新统计数据
   */
  const refreshStatistics = () => {
    if (system) {
      const stats = system.getStatistics();
      setStatistics(stats);
      setRecentMilestones(
        stats.milestones
          .sort((a, b) => b.achievedAt - a.achievedAt)
          .slice(0, 10)
      );
    }
  };

  return {
    system,
    isReady,
    statistics,
    recentMilestones,
    recordGrowth,
    refreshStatistics,
  };
}

