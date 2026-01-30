/**
 * 能力雷达图组件
 * 展示角色的多维度能力，包含关系维度
 */

import React, { useEffect, useState } from 'react';
import { capabilityApi, RadarChartData } from '../../services/api/capability/capability';
import { logger } from '../../utils/logger';

interface CapabilityRadarChartProps {
  characterId: number;
  characterName?: string;
}

export const CapabilityRadarChart: React.FC<CapabilityRadarChartProps> = ({
  characterId,
  characterName = '角色',
}) => {
  const [data, setData] = useState<RadarChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const radarData = await capabilityApi.getRadarChartData(characterId);
        setData(radarData);
      } catch (err) {
        logger.error('[CapabilityRadarChart] 加载数据失败:', err);
        setError(err instanceof Error ? err.message : '加载数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    if (characterId) {
      loadData();
    }
  }, [characterId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 rounded-lg" style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary, #6366f1)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))', color: 'var(--text-error, #ef4444)' }}>
        <p>加载失败: {error}</p>
      </div>
    );
  }

  if (!data || !data.dimensions || data.dimensions.length === 0) {
    return (
      <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))', color: 'var(--text-tertiary)' }}>
        <p>暂无能力数据</p>
      </div>
    );
  }

  // 简化的雷达图实现（使用SVG）
  const centerX = 200;
  const centerY = 200;
  const radius = 150;
  const dimensionCount = data.dimensions.length;
  const angleStep = (2 * Math.PI) / dimensionCount;

  // 生成雷达图路径点
  const generatePath = () => {
    const points = data.dimensions.map((dim, index) => {
      const angle = (index * angleStep) - Math.PI / 2; // 从顶部开始
      const scoreRatio = Math.max(0, Math.min(1, dim.score / dim.maxScore)); // 限制在 0-1 之间
      const r = radius * scoreRatio;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      // 验证数值有效性
      if (!isFinite(x) || !isFinite(y)) {
        logger.warn('[CapabilityRadarChart] 无效的坐标值', { dim, x, y, scoreRatio, r });
        return { x: centerX, y: centerY, dimension: dim };
      }
      
      return { x, y, dimension: dim };
    });

    // 闭合路径
    if (points.length > 0) {
      const first = points[0];
      // 确保路径命令之间有空格，并且数值格式正确
      const pathCommands = points.map((p, i) => {
        const x = Number.isFinite(p.x) ? p.x.toFixed(2) : '0';
        const y = Number.isFinite(p.y) ? p.y.toFixed(2) : '0';
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      });
      
      // 闭合路径
      const firstX = Number.isFinite(first.x) ? first.x.toFixed(2) : '0';
      const firstY = Number.isFinite(first.y) ? first.y.toFixed(2) : '0';
      const path = pathCommands.join(' ') + ` L ${firstX} ${firstY} Z`;
      
      return { path, points };
    }
    return { path: '', points: [] };
  };

  const { path, points } = generatePath();

  return (
    <div className="capability-radar-chart p-4">
      <div className="mb-4">
        <h4 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
          {characterName} 的能力雷达图
        </h4>
        <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          综合得分: {data.overallScore} / 100
        </p>
      </div>

      <div className="flex justify-center">
        <svg width="400" height="400" viewBox="0 0 400 400">
          {/* 背景网格 */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((ratio, i) => (
            <circle
              key={i}
              cx={centerX}
              cy={centerY}
              r={radius * ratio}
              fill="none"
              stroke="var(--border-color, #374151)"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}

          {/* 维度轴线 */}
          {data.dimensions.map((dim, index) => {
            const angle = (index * angleStep) - Math.PI / 2;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            return (
              <line
                key={dim.code}
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke="var(--border-color, #374151)"
                strokeWidth="1"
                opacity="0.3"
              />
            );
          })}

          {/* 能力区域 */}
          <path
            d={path}
            fill="var(--color-primary, #6366f1)"
            fillOpacity="0.3"
            stroke="var(--color-primary, #6366f1)"
            strokeWidth="2"
          />

          {/* 维度标签和得分 */}
          {points.map((point, index) => {
            const dim = data.dimensions[index];
            const angle = (index * angleStep) - Math.PI / 2;
            const labelX = centerX + (radius + 30) * Math.cos(angle);
            const labelY = centerY + (radius + 30) * Math.sin(angle);
            
            return (
              <g key={dim.code}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="var(--color-primary, #6366f1)"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium"
                  style={{ fill: 'var(--text-primary)' }}
                >
                  {dim.name}
                </text>
                <text
                  x={labelX}
                  y={labelY + 15}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs"
                  style={{ fill: 'var(--text-secondary)' }}
                >
                  {dim.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 关系维度详情 */}
      {data.dimensions.find(d => d.code === 'RELATIONSHIP')?.subDimensions && (
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary, rgba(15, 23, 42, 0.3))' }}>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>关系维度详情</p>
          <div className="flex gap-4">
            {data.dimensions.find(d => d.code === 'RELATIONSHIP')?.subDimensions?.map((subDim) => (
              <div key={subDim.code} className="flex-1">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{subDim.name}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-primary, #6366f1)' }}>
                  {subDim.score} / 100
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
