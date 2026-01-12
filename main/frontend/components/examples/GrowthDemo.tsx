/**
 * 成长系统演示组件
 * 展示成长统计和里程碑功能
 */

import React from 'react';
import { useGrowthSystem } from '../../services/growth-system/hooks/useGrowthSystem';
import { GrowthDashboard } from '../growth/GrowthDashboard';
import { CelebrationProvider } from '../growth/CelebrationProvider';

interface GrowthDemoProps {
  userId: number;
}

export const GrowthDemo: React.FC<GrowthDemoProps> = ({ userId }) => {
  const { system, isReady, statistics, recentMilestones, recordGrowth, refreshStatistics } = useGrowthSystem({
    enabled: true,
    userId,
    autoRecord: true,
  });

  if (!isReady || !statistics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/50">加载中...</div>
      </div>
    );
  }

  // 处理记录成长后的刷新
  const handleRecordGrowth = async (data: Parameters<typeof recordGrowth>[0]) => {
    await recordGrowth(data);
    // 等待一下让系统处理里程碑
    setTimeout(() => {
      refreshStatistics();
    }, 500);
  };

  return (
    <CelebrationProvider userId={userId} milestones={statistics.milestones}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">成长记录系统</h1>
          <p className="text-white/70">记录你的成长轨迹，见证每一步进步</p>
        </div>

        {/* 成长仪表板 */}
        <GrowthDashboard statistics={statistics} />

        {/* 测试按钮 */}
        <div className="bg-white/10 rounded-lg p-6 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white mb-4">测试功能</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleRecordGrowth({ conversationCount: 1 })}
              className="px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg transition-colors"
            >
              记录对话 +1
            </button>
            <button
              onClick={() => handleRecordGrowth({ memoryCount: 1 })}
              className="px-4 py-2 bg-purple-500/80 hover:bg-purple-500 text-white rounded-lg transition-colors"
            >
              记录记忆 +1
            </button>
            <button
              onClick={() => handleRecordGrowth({ emotionRecords: 1, emotionScore: 0.8 })}
              className="px-4 py-2 bg-green-500/80 hover:bg-green-500 text-white rounded-lg transition-colors"
            >
              记录情绪
            </button>
          </div>
          <p className="text-sm text-white/50 mt-4">
            提示：当达到里程碑时，会自动显示庆祝动画
          </p>
        </div>
      </div>
    </CelebrationProvider>
  );
};

