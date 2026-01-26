/**
 * 里程碑展示组件
 * 展示用户的成长里程碑
 */

import React, { useState } from 'react';
import { GrowthMilestone, MilestoneType } from '../../services/growth-system/types/GrowthTypes';

interface MilestoneDisplayProps {
  milestones: GrowthMilestone[];
  recentOnly?: boolean; // 是否只显示最近的里程碑
  maxDisplay?: number; // 最多显示数量
  className?: string;
}

export const MilestoneDisplay: React.FC<MilestoneDisplayProps> = ({
  milestones,
  recentOnly = false,
  maxDisplay = 10,
  className = '',
}) => {
  const [selectedMilestone, setSelectedMilestone] = useState<GrowthMilestone | null>(null);

  // 排序里程碑（最新的在前）
  const sortedMilestones = [...milestones].sort((a, b) => b.achievedAt - a.achievedAt);

  // 过滤最近的里程碑
  const displayMilestones = recentOnly
    ? sortedMilestones.slice(0, maxDisplay)
    : sortedMilestones;

  if (displayMilestones.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p 
          style={{ color: 'var(--text-tertiary)' }}
        >
          还没有里程碑，继续努力吧！💪
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 
        className="text-lg font-semibold"
        style={{ color: 'var(--text-primary)' }}
      >
        成长里程碑
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayMilestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            isSelected={selectedMilestone?.id === milestone.id}
            onClick={() => setSelectedMilestone(milestone)}
          />
        ))}
      </div>

      {/* 里程碑详情弹窗 */}
      {selectedMilestone && (
        <MilestoneDetailModal
          milestone={selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
        />
      )}
    </div>
  );
};

/**
 * 里程碑卡片组件
 */
interface MilestoneCardProps {
  milestone: GrowthMilestone;
  isSelected: boolean;
  onClick: () => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  isSelected,
  onClick,
}) => {
  const icon = getMilestoneIcon(milestone.type);
  const color = getMilestoneColor(milestone.type);

  return (
    <div
      className="rounded-lg p-4 border backdrop-blur-md cursor-pointer transition-all"
      style={{
        backgroundColor: isSelected
          ? getMilestoneColorStyle(milestone.type).bg
          : 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
        borderColor: isSelected
          ? getMilestoneColorStyle(milestone.type).border
          : 'var(--border-color-overlay, rgba(255, 255, 255, 0.2))',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isSelected ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.15))';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
        }
      }}
    >
      <div className="flex items-start space-x-3">
        <div className={`text-3xl ${isSelected ? 'animate-bounce' : ''}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 
            className="text-lg font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {milestone.title}
          </h4>
          <p 
            className="text-sm mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {milestone.description}
          </p>
          <div className="flex items-center justify-between">
            <span 
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {formatDate(milestone.achievedAt)}
            </span>
            {milestone.value && (
              <span 
                className="text-xs font-semibold"
                style={{ color: getMilestoneColorStyle(milestone.type).text }}
              >
                {milestone.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 里程碑详情弹窗
 */
interface MilestoneDetailModalProps {
  milestone: GrowthMilestone;
  onClose: () => void;
}

const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  milestone,
  onClose,
}) => {
  const icon = getMilestoneIcon(milestone.type);
  const color = getMilestoneColor(milestone.type);

  const colorStyle = getMilestoneColorStyle(milestone.type);
  
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.5))' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-md w-full border backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-card, #111827)',
          borderColor: colorStyle.border,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <h3 
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {milestone.title}
              </h3>
              <p 
                className="text-sm"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {formatDate(milestone.achievedAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <p 
          className="mb-4"
          style={{ color: 'var(--text-secondary)' }}
        >
          {milestone.description}
        </p>

        {milestone.value && (
          <div 
            className="rounded-lg p-3 mb-4"
            style={{ backgroundColor: colorStyle.bg }}
          >
            <p 
              className="text-sm mb-1"
              style={{ color: 'var(--text-secondary)' }}
            >
              达成值
            </p>
            <p 
              className="text-2xl font-bold"
              style={{ color: colorStyle.text }}
            >
              {milestone.value}
            </p>
          </div>
        )}

        {milestone.metadata && Object.keys(milestone.metadata).length > 0 && (
          <div 
            className="border-t pt-4"
            style={{ borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))' }}
          >
            <p 
              className="text-sm mb-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              详细信息
            </p>
            <div className="space-y-1">
              {Object.entries(milestone.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>{key}:</span>
                  <span style={{ color: 'var(--text-primary)' }}>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full border rounded-lg py-2 font-semibold transition-opacity"
          style={{
            backgroundColor: colorStyle.bg,
            borderColor: colorStyle.border,
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          关闭
        </button>
      </div>
    </div>
  );
};

/**
 * 获取里程碑图标
 */
function getMilestoneIcon(type: MilestoneType): string {
  const icons: Record<MilestoneType, string> = {
    first_use: '🎉',
    first_conversation: '💬',
    first_memory: '📝',
    conversation_count: '💭',
    memory_count: '📚',
    emotion_insight: '💡',
    growth_streak: '🔥',
    anniversary: '🎂',
  };
  return icons[type] || '⭐';
}

/**
 * 获取里程碑颜色（CSS变量版本）
 */
function getMilestoneColorStyle(type: MilestoneType): {
  bg: string;
  border: string;
  text: string;
} {
  const colorMap: Record<MilestoneType, { bg: string; border: string; text: string }> = {
    first_use: {
      bg: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
      border: 'var(--color-warning, rgba(234, 179, 8, 0.5))',
      text: 'var(--color-warning, #fbbf24)',
    },
    first_conversation: {
      bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
      border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
      text: 'var(--color-info, #60a5fa)',
    },
    first_memory: {
      bg: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
      border: 'var(--color-primary, rgba(168, 85, 247, 0.5))',
      text: 'var(--color-primary, #a78bfa)',
    },
    conversation_count: {
      bg: 'var(--color-primary, rgba(99, 102, 241, 0.2))',
      border: 'var(--color-primary, rgba(99, 102, 241, 0.5))',
      text: 'var(--color-primary, #818cf8)',
    },
    memory_count: {
      bg: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
      border: 'var(--color-primary, rgba(236, 72, 153, 0.5))',
      text: 'var(--color-primary, #f472b6)',
    },
    emotion_insight: {
      bg: 'var(--color-success, rgba(34, 197, 94, 0.2))',
      border: 'var(--color-success, rgba(34, 197, 94, 0.5))',
      text: 'var(--color-success, #4ade80)',
    },
    growth_streak: {
      bg: 'var(--color-warning, rgba(251, 146, 60, 0.2))',
      border: 'var(--color-warning, rgba(251, 146, 60, 0.5))',
      text: 'var(--color-warning, #fb923c)',
    },
    anniversary: {
      bg: 'var(--color-error, rgba(239, 68, 68, 0.2))',
      border: 'var(--color-error, rgba(239, 68, 68, 0.5))',
      text: 'var(--color-error, #f87171)',
    },
  };
  return colorMap[type] || {
    bg: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
    border: 'var(--border-color-overlay, rgba(255, 255, 255, 0.2))',
    text: 'var(--text-primary)',
  };
}

/**
 * 获取里程碑颜色（保留原函数以兼容）
 */
function getMilestoneColor(type: MilestoneType): {
  bg: string;
  border: string;
  text: string;
} {
  return getMilestoneColorStyle(type);
}

/**
 * 格式化日期
 */
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days}天前`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    return `${weeks}周前`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${months}个月前`;
  } else {
    const years = Math.floor(days / 365);
    return `${years}年前`;
  }
}




