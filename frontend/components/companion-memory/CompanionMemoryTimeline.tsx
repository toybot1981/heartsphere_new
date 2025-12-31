/**
 * 陪伴记忆时间线组件
 * 展示陪伴记忆的时间线
 */

import React from 'react';
import { CompanionMemory } from '../../services/companion-memory/types/CompanionMemoryTypes';

interface CompanionMemoryTimelineProps {
  memories: CompanionMemory[];
  className?: string;
}

export const CompanionMemoryTimeline: React.FC<CompanionMemoryTimelineProps> = ({
  memories,
  className = '',
}) => {
  if (memories.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-white/50">还没有陪伴记忆，让我们一起创造美好的回忆吧～</p>
      </div>
    );
  }

  // 按日期分组
  const groupedMemories = groupMemoriesByDate(memories);

  return (
    <div className={`space-y-6 ${className}`}>
      {Object.entries(groupedMemories).map(([date, dayMemories]) => (
        <div key={date} className="relative">
          {/* 日期标题 */}
          <div className="flex items-center mb-4">
            <div className="flex-1 h-px bg-white/20" />
            <div className="px-4">
              <h3 className="text-lg font-semibold text-white">{formatDate(date)}</h3>
            </div>
            <div className="flex-1 h-px bg-white/20" />
          </div>

          {/* 记忆列表 */}
          <div className="space-y-3">
            {dayMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 记忆卡片组件
 */
interface MemoryCardProps {
  memory: CompanionMemory;
}

const MemoryCard: React.FC<MemoryCardProps> = ({ memory }) => {
  const icon = getMemoryIcon(memory.type);
  const color = getMemoryColor(memory.type);

  return (
    <div
      className={`rounded-lg p-4 border backdrop-blur-md ${color.bg} ${color.border} transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className="text-base font-semibold text-white mb-1">{memory.title}</h4>
          <p className="text-sm text-white/70 mb-2">{memory.content}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-white/50">{formatTime(memory.timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 按日期分组记忆
 */
function groupMemoriesByDate(memories: CompanionMemory[]): Record<string, CompanionMemory[]> {
  const grouped: Record<string, CompanionMemory[]> = {};

  memories.forEach((memory) => {
    const date = formatDateKey(memory.timestamp);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(memory);
  });

  // 按日期排序（最新的在前）
  Object.keys(grouped).forEach((date) => {
    grouped[date].sort((a, b) => b.timestamp - a.timestamp);
  });

  return grouped;
}

/**
 * 格式化日期键
 */
function formatDateKey(timestamp: number): string {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * 格式化日期显示
 */
function formatDate(dateKey: string): string {
  const date = new Date(dateKey);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateKey === formatDateKey(today.getTime())) {
    return '今天';
  } else if (dateKey === formatDateKey(yesterday.getTime())) {
    return '昨天';
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }
}

/**
 * 格式化时间
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/**
 * 获取记忆图标
 */
function getMemoryIcon(type: CompanionMemory['type']): string {
  const icons: Record<CompanionMemory['type'], string> = {
    conversation: '💬',
    milestone: '⭐',
    emotion_share: '💙',
    special_moment: '✨',
    anniversary: '🎂',
    growth: '🌱',
    care_message: '💝',
  };
  return icons[type] || '📝';
}

/**
 * 获取记忆颜色
 */
function getMemoryColor(type: CompanionMemory['type']): {
  bg: string;
  border: string;
} {
  const colors: Record<CompanionMemory['type'], { bg: string; border: string }> = {
    conversation: {
      bg: 'bg-blue-500/20',
      border: 'border-blue-400/50',
    },
    milestone: {
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-400/50',
    },
    emotion_share: {
      bg: 'bg-pink-500/20',
      border: 'border-pink-400/50',
    },
    special_moment: {
      bg: 'bg-purple-500/20',
      border: 'border-purple-400/50',
    },
    anniversary: {
      bg: 'bg-red-500/20',
      border: 'border-red-400/50',
    },
    growth: {
      bg: 'bg-green-500/20',
      border: 'border-green-400/50',
    },
    care_message: {
      bg: 'bg-indigo-500/20',
      border: 'border-indigo-400/50',
    },
  };
  return colors[type] || {
    bg: 'bg-white/10',
    border: 'border-white/20',
  };
}



