/**
 * 情绪时间线组件
 * 展示用户情绪的时间变化趋势
 */

import React, { useEffect, useState } from 'react';
import { useEmotionSystem } from '../../services/emotion-system';
import { EmotionRecord, EmotionType } from '../../services/emotion-system/types/EmotionTypes';

interface EmotionTimelineProps {
  userId: number;
  period?: 'day' | 'week' | 'month';
  height?: number;
}

/**
 * 情绪颜色映射
 */
const emotionColorMap: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: '#4CAF50',
  [EmotionType.EXCITED]: '#8BC34A',
  [EmotionType.CONTENT]: '#81C784',
  [EmotionType.PEACEFUL]: '#A5D6A7',
  [EmotionType.HOPEFUL]: '#66BB6A',
  [EmotionType.GRATEFUL]: '#43A047',
  [EmotionType.CALM]: '#2196F3',
  [EmotionType.THOUGHTFUL]: '#64B5F6',
  [EmotionType.FOCUSED]: '#42A5F5',
  [EmotionType.RELAXED]: '#90CAF9',
  [EmotionType.SAD]: '#F44336',
  [EmotionType.ANXIOUS]: '#FF9800',
  [EmotionType.ANGRY]: '#E53935',
  [EmotionType.LONELY]: '#EF5350',
  [EmotionType.TIRED]: '#FFB74D',
  [EmotionType.CONFUSED]: '#FFA726',
};

/**
 * 计算情绪分数
 */
function calculateEmotionScore(emotion: EmotionType, intensity: string): number {
  const baseScores: Record<EmotionType, number> = {
    [EmotionType.HAPPY]: 0.8,
    [EmotionType.EXCITED]: 0.9,
    [EmotionType.CONTENT]: 0.6,
    [EmotionType.PEACEFUL]: 0.4,
    [EmotionType.HOPEFUL]: 0.7,
    [EmotionType.GRATEFUL]: 0.7,
    [EmotionType.CALM]: 0.3,
    [EmotionType.THOUGHTFUL]: 0.0,
    [EmotionType.FOCUSED]: 0.1,
    [EmotionType.RELAXED]: 0.4,
    [EmotionType.SAD]: -0.7,
    [EmotionType.ANXIOUS]: -0.6,
    [EmotionType.ANGRY]: -0.8,
    [EmotionType.LONELY]: -0.7,
    [EmotionType.TIRED]: -0.4,
    [EmotionType.CONFUSED]: -0.5,
  };

  const intensityMultiplier = intensity === 'strong' ? 1.3 : intensity === 'moderate' ? 1.0 : 0.7;
  return baseScores[emotion] * intensityMultiplier;
}

export const EmotionTimeline: React.FC<EmotionTimelineProps> = ({
  userId,
  period = 'week',
  height = 200,
}) => {
  const emotionSystem = useEmotionSystem({
    enabled: true,
    userId,
  });

  const [emotionHistory, setEmotionHistory] = useState<EmotionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!emotionSystem.isReady) return;

    const loadHistory = async () => {
      setIsLoading(true);
      try {
        const now = Date.now();
        const periodMs = period === 'day' ? 24 * 60 * 60 * 1000 :
                        period === 'week' ? 7 * 24 * 60 * 60 * 1000 :
                        30 * 24 * 60 * 60 * 1000;
        
        const history = await emotionSystem.getHistory({
          startDate: now - periodMs,
          endDate: now,
        });
        
        setEmotionHistory(history);
      } catch (error) {
        console.error('[EmotionTimeline] 加载历史失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, [emotionSystem.isReady, userId, period]);

  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center h-48 rounded-lg"
        style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}
      >
        <div 
          className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: 'var(--color-primary, #6366f1)',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  }

  if (emotionHistory.length === 0) {
    return (
      <div 
        className="flex items-center justify-center h-48 rounded-lg"
        style={{
          backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))',
          color: 'var(--text-tertiary)',
        }}
      >
        <p>暂无情绪数据</p>
      </div>
    );
  }

  // 准备图表数据
  const chartData = emotionHistory.map(record => ({
    timestamp: record.timestamp,
    score: calculateEmotionScore(record.emotionType, record.emotionIntensity),
    emotion: record.emotionType,
    color: emotionColorMap[record.emotionType] || '#9E9E9E',
  }));

  // 计算图表尺寸
  const width = 800;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 计算时间范围
  const minTime = Math.min(...chartData.map(d => d.timestamp));
  const maxTime = Math.max(...chartData.map(d => d.timestamp));
  const timeRange = maxTime - minTime;

  // 计算分数范围
  const minScore = Math.min(-1, ...chartData.map(d => d.score));
  const maxScore = Math.max(1, ...chartData.map(d => d.score));
  const scoreRange = maxScore - minScore;

  // 转换坐标
  const getX = (timestamp: number) => {
    return padding.left + ((timestamp - minTime) / timeRange) * chartWidth;
  };

  const getY = (score: number) => {
    return padding.top + chartHeight - ((score - minScore) / scoreRange) * chartHeight;
  };

  // 验证并格式化坐标值
  const formatCoord = (val: number) => {
    if (!isFinite(val)) return '0';
    return val.toFixed(2);
  };
  
  // 生成路径
  const pathData = chartData
    .map((point, index) => {
      const x = getX(point.timestamp);
      const y = getY(point.score);
      // 验证坐标有效性
      if (!isFinite(x) || !isFinite(y)) {
        return null;
      }
      return index === 0 ? `M ${formatCoord(x)} ${formatCoord(y)}` : `L ${formatCoord(x)} ${formatCoord(y)}`;
    })
    .filter((cmd): cmd is string => cmd !== null)
    .join(' ');

  // 生成区域路径（用于填充）
  const maxX = getX(maxTime);
  const minX = getX(minTime);
  const zeroY = getY(0);
  
  let areaPath = pathData;
  if (pathData && isFinite(maxX) && isFinite(minX) && isFinite(zeroY)) {
    areaPath = `${pathData} L ${formatCoord(maxX)} ${formatCoord(zeroY)} L ${formatCoord(minX)} ${formatCoord(zeroY)} Z`;
  }

  return (
    <div 
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}
    >
      <div className="mb-4">
        <h3 
          className="text-lg font-bold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          情绪时间线
        </h3>
        <div 
          className="flex items-center gap-4 text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <span>周期: {period === 'day' ? '一天' : period === 'week' ? '一周' : '一月'}</span>
          <span>记录数: {emotionHistory.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={width} height={height} className="w-full">
          {/* 背景网格 */}
          <defs>
            <linearGradient id="emotionGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-success)" stopOpacity="0.3" />
              <stop offset="50%" stopColor="var(--text-tertiary)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="var(--color-error)" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* 零线 */}
          <line
            x1={padding.left}
            y1={getY(0)}
            x2={width - padding.right}
            y2={getY(0)}
            stroke="var(--border-color-overlay, #666666)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* 填充区域 */}
          <path
            d={areaPath}
            fill="url(#emotionGradient)"
            opacity="0.3"
          />

          {/* 折线 */}
          <path
            d={pathData}
            fill="none"
            stroke="var(--color-success, #4CAF50)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 数据点 */}
          {chartData.map((point, index) => (
            <circle
              key={index}
              cx={getX(point.timestamp)}
              cy={getY(point.score)}
              r="4"
              fill={point.color}
              stroke="var(--text-primary)"
              strokeWidth="2"
              className="cursor-pointer hover:r-6 transition-all"
            >
              <title>
                {new Date(point.timestamp).toLocaleString()}: {point.emotion} ({point.score.toFixed(2)})
              </title>
            </circle>
          ))}

          {/* Y轴标签 */}
          <text
            x={padding.left - 10}
            y={getY(1)}
            textAnchor="end"
            fill="var(--text-tertiary, #9E9E9E)"
            fontSize="12"
          >
            积极
          </text>
          <text
            x={padding.left - 10}
            y={getY(0)}
            textAnchor="end"
            fill="var(--text-tertiary, #9E9E9E)"
            fontSize="12"
          >
            中性
          </text>
          <text
            x={padding.left - 10}
            y={getY(-1)}
            textAnchor="end"
            fill="var(--text-tertiary, #9E9E9E)"
            fontSize="12"
          >
            消极
          </text>
        </svg>
      </div>

      {/* 图例 */}
      <div 
        className="mt-4 flex flex-wrap gap-2 text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <div className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--color-success, #22c55e)' }}
          />
          <span>积极情绪</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--color-info, #3b82f6)' }}
          />
          <span>中性情绪</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: 'var(--color-error, #ef4444)' }}
          />
          <span>消极情绪</span>
        </div>
      </div>
    </div>
  );
};




