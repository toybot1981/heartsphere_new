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
        <p className="text-white/50">还没有里程碑，继续努力吧！💪</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold text-white">成长里程碑</h3>
      
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
      className={`rounded-lg p-4 border backdrop-blur-md cursor-pointer transition-all ${
        isSelected
          ? `${color.bg} ${color.border} scale-105 shadow-lg`
          : 'bg-white/10 border-white/20 hover:bg-white/15'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div className={`text-3xl ${isSelected ? 'animate-bounce' : ''}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1">
            {milestone.title}
          </h4>
          <p className="text-sm text-white/70 mb-2">{milestone.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50">
              {formatDate(milestone.achievedAt)}
            </span>
            {milestone.value && (
              <span className={`text-xs font-semibold ${color.text}`}>
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-gray-900 rounded-lg p-6 max-w-md w-full border ${color.border} backdrop-blur-md`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-4xl">{icon}</span>
            <div>
              <h3 className="text-xl font-bold text-white">{milestone.title}</h3>
              <p className="text-sm text-white/50">{formatDate(milestone.achievedAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors"
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

        <p className="text-white/70 mb-4">{milestone.description}</p>

        {milestone.value && (
          <div className={`${color.bg} rounded-lg p-3 mb-4`}>
            <p className="text-sm text-white/70 mb-1">达成值</p>
            <p className={`text-2xl font-bold ${color.text}`}>{milestone.value}</p>
          </div>
        )}

        {milestone.metadata && Object.keys(milestone.metadata).length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <p className="text-sm text-white/50 mb-2">详细信息</p>
            <div className="space-y-1">
              {Object.entries(milestone.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-white/70">{key}:</span>
                  <span className="text-white">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className={`mt-6 w-full ${color.bg} ${color.border} border rounded-lg py-2 text-white font-semibold hover:opacity-80 transition-opacity`}
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
 * 获取里程碑颜色
 */
function getMilestoneColor(type: MilestoneType): {
  bg: string;
  border: string;
  text: string;
} {
  const colors: Record<MilestoneType, { bg: string; border: string; text: string }> = {
    first_use: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-400/50',
      text: 'text-yellow-400',
    },
    first_conversation: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-400/50',
      text: 'text-blue-400',
    },
    first_memory: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-400/50',
      text: 'text-purple-400',
    },
    conversation_count: {
      bg: 'bg-indigo-500/20',
      border: 'border-indigo-400/50',
      text: 'text-indigo-400',
    },
    memory_count: {
      bg: 'bg-pink-500/20',
      border: 'border-pink-400/50',
      text: 'text-pink-400',
    },
    emotion_insight: {
      bg: 'bg-green-500/20',
      border: 'border-green-400/50',
      text: 'text-green-400',
    },
    growth_streak: {
      bg: 'bg-orange-500/20',
      border: 'border-orange-400/50',
      text: 'text-orange-400',
    },
    anniversary: {
      bg: 'bg-red-500/20',
      border: 'border-red-400/50',
      text: 'text-red-400',
    },
  };
  return colors[type] || {
    bg: 'bg-white/10',
    border: 'border-white/20',
    text: 'text-white',
  };
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



