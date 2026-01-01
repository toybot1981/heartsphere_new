/**
 * 情绪统计组件
 * 展示情绪分布和统计信息
 */

import React, { useEffect, useState } from 'react';
import { useEmotionSystem } from '../../services/emotion-system';
import { EmotionType } from '../../services/emotion-system/types/EmotionTypes';

interface EmotionStatisticsProps {
  userId: number;
  period?: 'day' | 'week' | 'month';
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
 * 情绪名称映射
 */
const emotionNameMap: Record<EmotionType, string> = {
  [EmotionType.HAPPY]: '开心',
  [EmotionType.EXCITED]: '兴奋',
  [EmotionType.CONTENT]: '满足',
  [EmotionType.PEACEFUL]: '平静',
  [EmotionType.HOPEFUL]: '希望',
  [EmotionType.GRATEFUL]: '感激',
  [EmotionType.CALM]: '冷静',
  [EmotionType.THOUGHTFUL]: '思考',
  [EmotionType.FOCUSED]: '专注',
  [EmotionType.RELAXED]: '放松',
  [EmotionType.SAD]: '悲伤',
  [EmotionType.ANXIOUS]: '焦虑',
  [EmotionType.ANGRY]: '愤怒',
  [EmotionType.LONELY]: '孤独',
  [EmotionType.TIRED]: '疲惫',
  [EmotionType.CONFUSED]: '困惑',
};

export const EmotionStatistics: React.FC<EmotionStatisticsProps> = ({
  userId,
  period = 'week',
}) => {
  const emotionSystem = useEmotionSystem({
    enabled: true,
    userId,
  });

  const [statistics, setStatistics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!emotionSystem.isReady) return;

    const loadStatistics = async () => {
      setIsLoading(true);
      try {
        const stats = await emotionSystem.getStatistics(period);
        setStatistics(stats);
      } catch (error) {
        console.error('[EmotionStatistics] 加载统计失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, [emotionSystem.isReady, userId, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!statistics || statistics.total === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg text-slate-400">
        <p>暂无统计数据</p>
      </div>
    );
  }

  // 准备饼图数据（只显示有数据的情绪）
  const pieData = Object.entries(statistics.byType)
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count: count as number,
      percentage: ((count as number) / statistics.total) * 100,
      color: emotionColorMap[emotion as EmotionType] || '#9E9E9E',
      name: emotionNameMap[emotion as EmotionType] || emotion,
    }))
    .sort((a, b) => b.count - a.count);

  // 计算饼图
  let currentAngle = -90; // 从顶部开始
  const radius = 80;
  const centerX = 120;
  const centerY = 120;

  const pieSegments = pieData.map((item, index) => {
    const angle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
    
    const largeArcFlag = angle > 180 ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');
    
    currentAngle += angle;
    
    return {
      ...item,
      pathData,
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="bg-slate-900/50 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-2">情绪统计</h3>
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>周期: {period === 'day' ? '一天' : period === 'week' ? '一周' : '一月'}</span>
          <span>总记录: {statistics.total}</span>
          <span>平均置信度: {(statistics.averageConfidence * 100).toFixed(0)}%</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* 饼图 */}
        <div className="flex-shrink-0">
          <svg width="240" height="240" className="mx-auto">
            {pieSegments.map((segment, index) => (
              <g key={index}>
                <path
                  d={segment.pathData}
                  fill={segment.color}
                  stroke="#1a1a1a"
                  strokeWidth="2"
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <title>
                    {segment.name}: {segment.count}次 ({segment.percentage.toFixed(1)}%)
                  </title>
                </path>
              </g>
            ))}
            {/* 中心文字 */}
            <text
              x={centerX}
              y={centerY - 10}
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="bold"
            >
              {statistics.total}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              fill="#9E9E9E"
              fontSize="12"
            >
              总记录
            </text>
          </svg>
        </div>

        {/* 统计列表 */}
        <div className="flex-1 space-y-2">
          {pieData.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-white font-medium">{item.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400 text-sm">{item.count}次</span>
                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <span className="text-slate-400 text-sm w-12 text-right">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 强度统计 */}
      {statistics.byIntensity && (
        <div className="mt-6 pt-4 border-t border-slate-700">
          <h4 className="text-sm font-bold text-slate-300 mb-3">情绪强度分布</h4>
          <div className="flex gap-4">
            {Object.entries(statistics.byIntensity).map(([intensity, count]) => (
              <div key={intensity} className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">
                    {intensity === 'mild' ? '轻度' : intensity === 'moderate' ? '中度' : '强烈'}
                  </span>
                  <span className="text-xs text-slate-500">{count as number}次</span>
                </div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${((count as number) / statistics.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};




