/**
 * 成长统计图表组件
 * 展示用户的成长统计数据
 */

import React from 'react';
import { GrowthStatistics } from '../../services/growth-system/types/GrowthTypes';

interface GrowthStatisticsProps {
  statistics: GrowthStatistics;
  className?: string;
}

export const GrowthStatisticsComponent: React.FC<GrowthStatisticsProps> = ({
  statistics,
  className = '',
}) => {
  // 计算百分比（用于进度条）
  const calculatePercentage = (current: number, max: number = 1000) => {
    return Math.min((current / max) * 100, 100);
  };

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 总体统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总对话次数"
          value={formatNumber(statistics.totalConversations)}
          icon="💬"
          color="blue"
        />
        <StatCard
          title="总记忆数量"
          value={formatNumber(statistics.totalMemories)}
          icon="📝"
          color="purple"
        />
        <StatCard
          title="活跃天数"
          value={statistics.activeDays.toString()}
          icon="📅"
          color="green"
        />
        <StatCard
          title="连续使用"
          value={`${statistics.currentStreak}天`}
          icon="🔥"
          color="orange"
        />
      </div>

      {/* 进度条统计 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">成长进度</h3>
        
        <ProgressBar
          label="对话进度"
          current={statistics.totalConversations}
          max={1000}
          color="blue"
        />
        
        <ProgressBar
          label="记忆进度"
          current={statistics.totalMemories}
          max={500}
          color="purple"
        />
        
        <ProgressBar
          label="连续使用"
          current={statistics.currentStreak}
          max={100}
          color="orange"
        />
      </div>

      {/* 情绪分数 */}
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">平均情绪分数</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-white/70 mb-2">
              <span>情绪健康度</span>
              <span>{(statistics.averageEmotionScore * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${statistics.averageEmotionScore * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="text-3xl">
            {statistics.averageEmotionScore >= 0.7 ? '😊' :
             statistics.averageEmotionScore >= 0.4 ? '😐' : '😢'}
          </div>
        </div>
      </div>

      {/* 成长趋势图表 */}
      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-md">
        <h3 className="text-lg font-semibold text-white mb-4">成长趋势（最近30天）</h3>
        <GrowthTrendChart trend={statistics.growthTrend} />
      </div>
    </div>
  );
};

/**
 * 统计卡片组件
 */
interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-400/50',
    purple: 'bg-purple-500/20 border-purple-400/50',
    green: 'bg-green-500/20 border-green-400/50',
    orange: 'bg-orange-500/20 border-orange-400/50',
  };

  return (
    <div
      className={`rounded-lg p-4 border backdrop-blur-md ${colorClasses[color]} transition-all hover:scale-105`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm text-white/70">{title}</p>
    </div>
  );
};

/**
 * 进度条组件
 */
interface ProgressBarProps {
  label: string;
  current: number;
  max: number;
  color: 'blue' | 'purple' | 'orange';
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, current, max, color }) => {
  const percentage = Math.min((current / max) * 100, 100);

  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-white/70 mb-2">
        <span>{label}</span>
        <span>
          {current} / {max}
        </span>
      </div>
      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
        <div
          className={`${colorClasses[color]} h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && (
            <span className="text-xs text-white font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * 成长趋势图表组件
 */
interface GrowthTrendChartProps {
  trend: GrowthStatistics['growthTrend'];
}

const GrowthTrendChart: React.FC<GrowthTrendChartProps> = ({ trend }) => {
  if (trend.length === 0) {
    return (
      <div className="text-center text-white/50 py-8">
        <p>暂无数据</p>
      </div>
    );
  }

  // 计算最大值（用于缩放）
  const maxConversations = Math.max(...trend.map((t) => t.conversations), 1);
  const maxMemories = Math.max(...trend.map((t) => t.memories), 1);

  // SVG图表尺寸
  const width = 100;
  const height = 60;
  const padding = 5;

  // 生成路径点
  const generatePath = (data: number[], max: number) => {
    if (data.length === 0) return '';
    
    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (value / max) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const conversationPath = generatePath(
    trend.map((t) => t.conversations),
    maxConversations
  );
  const memoryPath = generatePath(
    trend.map((t) => t.memories),
    maxMemories
  );

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-32"
        preserveAspectRatio="none"
      >
        {/* 网格线 */}
        <defs>
          <linearGradient id="conversationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
          </linearGradient>
          <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
          </linearGradient>
        </defs>

        {/* 对话趋势线 */}
        <path
          d={conversationPath}
          fill="none"
          stroke="rgba(59, 130, 246, 1)"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        <path
          d={`${conversationPath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`}
          fill="url(#conversationGradient)"
        />

        {/* 记忆趋势线 */}
        <path
          d={memoryPath}
          fill="none"
          stroke="rgba(168, 85, 247, 1)"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="drop-shadow-lg"
        />
      </svg>

      {/* 图例 */}
      <div className="flex items-center justify-center space-x-4 mt-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500" />
          <span className="text-white/70">对话</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-purple-500 border-dashed border-t-2" />
          <span className="text-white/70">记忆</span>
        </div>
      </div>
    </div>
  );
};




