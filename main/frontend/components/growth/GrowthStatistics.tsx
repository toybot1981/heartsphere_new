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
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          成长进度
        </h3>
        
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
      <div 
        className="rounded-lg p-4 backdrop-blur-md"
        style={{ backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          平均情绪分数
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div 
              className="flex justify-between text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span>情绪健康度</span>
              <span>{(statistics.averageEmotionScore * 100).toFixed(1)}%</span>
            </div>
            <div 
              className="w-full rounded-full h-3"
              style={{ backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))' }}
            >
              <div
                className="h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${statistics.averageEmotionScore * 100}%`,
                  background: 'var(--gradient-primary, linear-gradient(to right, var(--color-primary, #ec4899), var(--color-primary, #a855f7)))',
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
      <div 
        className="rounded-lg p-4 backdrop-blur-md"
        style={{ backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))' }}
      >
        <h3 
          className="text-lg font-semibold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          成长趋势（最近30天）
        </h3>
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
  const colorStyles = {
    blue: {
      bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
      border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
    },
    purple: {
      bg: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
      border: 'var(--color-primary, rgba(168, 85, 247, 0.5))',
    },
    green: {
      bg: 'var(--color-success, rgba(34, 197, 94, 0.2))',
      border: 'var(--color-success, rgba(34, 197, 94, 0.5))',
    },
    orange: {
      bg: 'var(--color-warning, rgba(251, 146, 60, 0.2))',
      border: 'var(--color-warning, rgba(251, 146, 60, 0.5))',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className="rounded-lg p-4 border backdrop-blur-md transition-all hover:scale-105"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span 
          className="text-2xl font-bold"
          style={{ color: 'var(--text-primary)' }}
        >
          {value}
        </span>
      </div>
      <p 
        className="text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {title}
      </p>
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

  const colorStyles = {
    blue: 'var(--color-info, #3b82f6)',
    purple: 'var(--color-primary, #a855f7)',
    orange: 'var(--color-warning, #fb923c)',
  };

  return (
    <div>
      <div 
        className="flex justify-between text-sm mb-2"
        style={{ color: 'var(--text-secondary)' }}
      >
        <span>{label}</span>
        <span>
          {current} / {max}
        </span>
      </div>
      <div 
        className="w-full rounded-full h-3 overflow-hidden"
        style={{ backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))' }}
      >
        <div
          className="h-3 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
          style={{
            width: `${percentage}%`,
            backgroundColor: colorStyles[color],
          }}
        >
          {percentage > 10 && (
            <span 
              className="text-xs font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
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
      <div 
        className="text-center py-8"
        style={{ color: 'var(--text-tertiary)' }}
      >
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
    if (data.length === 0 || !isFinite(max) || max <= 0) return '';
    
    const points = data.map((value, index) => {
      const normalizedValue = Math.max(0, Math.min(value, max)); // 限制在有效范围内
      const x = padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
      const y = height - padding - (normalizedValue / max) * (height - padding * 2);
      
      // 验证数值有效性并格式化
      if (!isFinite(x) || !isFinite(y)) {
        return null;
      }
      
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    }).filter((point): point is string => point !== null);

    if (points.length === 0) return '';
    
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
            <stop offset="0%" stopColor="var(--color-info)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-info)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="memoryGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 对话趋势线 */}
        <path
          d={conversationPath}
          fill="none"
          stroke="var(--color-info)"
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
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeDasharray="4 4"
          className="drop-shadow-lg"
        />
      </svg>

      {/* 图例 */}
      <div 
        className="flex items-center justify-center space-x-4 mt-2 text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-0.5"
            style={{ backgroundColor: 'var(--color-info, #3b82f6)' }}
          />
          <span>对话</span>
        </div>
        <div className="flex items-center space-x-2">
          <div 
            className="w-4 h-0.5 border-dashed border-t-2"
            style={{ borderColor: 'var(--color-primary, #a855f7)' }}
          />
          <span>记忆</span>
        </div>
      </div>
    </div>
  );
};




