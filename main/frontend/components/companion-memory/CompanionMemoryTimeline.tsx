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
        <p 
          style={{ color: 'var(--text-tertiary)' }}
        >
          还没有陪伴记忆，让我们一起创造美好的回忆吧～
        </p>
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
            <div 
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.2))' }}
            />
            <div className="px-4">
              <h3 
                className="text-lg font-semibold"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatDate(date)}
              </h3>
            </div>
            <div 
              className="flex-1 h-px"
              style={{ backgroundColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.2))' }}
            />
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

  const colorStyle = getMemoryColorStyle(memory.type);
  
  return (
    <div
      className="rounded-lg p-4 border backdrop-blur-md transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: colorStyle.bg,
        borderColor: colorStyle.border,
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 
            className="text-base font-semibold mb-1"
            style={{ color: 'var(--text-primary)' }}
          >
            {memory.title}
          </h4>
          <p 
            className="text-sm mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {memory.content}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {memory.tags && memory.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {memory.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {formatTime(memory.timestamp)}
            </span>
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
 * 获取记忆颜色（CSS变量版本）
 */
function getMemoryColorStyle(type: CompanionMemory['type']): {
  bg: string;
  border: string;
} {
  const colorMap: Record<CompanionMemory['type'], { bg: string; border: string }> = {
    conversation: {
      bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
      border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
    },
    milestone: {
      bg: 'var(--color-warning, rgba(234, 179, 8, 0.2))',
      border: 'var(--color-warning, rgba(234, 179, 8, 0.5))',
    },
    emotion_share: {
      bg: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
      border: 'var(--color-primary, rgba(236, 72, 153, 0.5))',
    },
    special_moment: {
      bg: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
      border: 'var(--color-primary, rgba(168, 85, 247, 0.5))',
    },
    anniversary: {
      bg: 'var(--color-error, rgba(239, 68, 68, 0.2))',
      border: 'var(--color-error, rgba(239, 68, 68, 0.5))',
    },
    growth: {
      bg: 'var(--color-success, rgba(34, 197, 94, 0.2))',
      border: 'var(--color-success, rgba(34, 197, 94, 0.5))',
    },
    care_message: {
      bg: 'var(--color-primary, rgba(99, 102, 241, 0.2))',
      border: 'var(--color-primary, rgba(99, 102, 241, 0.5))',
    },
  };
  return colorMap[type] || {
    bg: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
    border: 'var(--border-color-overlay, rgba(255, 255, 255, 0.2))',
  };
}

/**
 * 获取记忆颜色（保留原函数以兼容）
 */
function getMemoryColor(type: CompanionMemory['type']): {
  bg: string;
  border: string;
} {
  return getMemoryColorStyle(type);
}




