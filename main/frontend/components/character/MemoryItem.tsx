/**
 * 记忆项组件
 * 用于显示单个记忆的详细信息
 */

import React, { useState } from 'react';
import type { UserMemory, MemoryType, MemoryImportance, MemorySource } from '../../services/memory-system/types/MemoryTypes';
import { MemoryType as MemoryTypeEnum, MemoryImportance as MemoryImportanceEnum, MemorySource as MemorySourceEnum } from '../../services/memory-system/types/MemoryTypes';

interface MemoryItemProps {
  memory: UserMemory;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

/**
 * 获取记忆类型的显示名称
 */
const getMemoryTypeLabel = (type: MemoryType): string => {
  const labels: Record<MemoryType, string> = {
    [MemoryTypeEnum.PERSONAL_INFO]: '个人信息',
    [MemoryTypeEnum.PREFERENCE]: '偏好',
    [MemoryTypeEnum.HABIT]: '习惯',
    [MemoryTypeEnum.PERSONALITY]: '性格',
    [MemoryTypeEnum.IMPORTANT_MOMENT]: '重要时刻',
    [MemoryTypeEnum.EMOTIONAL_EXPERIENCE]: '情感体验',
    [MemoryTypeEnum.EMOTION_PATTERN]: '情感模式',
    [MemoryTypeEnum.EMOTIONAL_PREFERENCE]: '情感偏好',
    [MemoryTypeEnum.FREQUENT_CHARACTER]: '频繁角色',
    [MemoryTypeEnum.CONVERSATION_TOPIC]: '对话话题',
    [MemoryTypeEnum.INTERACTION_PREFERENCE]: '交互偏好',
    [MemoryTypeEnum.CONVERSATION_STYLE]: '对话风格',
    [MemoryTypeEnum.CREATED_CONTENT]: '创建内容',
    [MemoryTypeEnum.FOCUSED_CONTENT]: '关注内容',
    [MemoryTypeEnum.FAVORITED_CONTENT]: '收藏内容',
    [MemoryTypeEnum.SHARED_CONTENT]: '分享内容',
    [MemoryTypeEnum.GROWTH_TRAJECTORY]: '成长轨迹',
    [MemoryTypeEnum.MILESTONE]: '里程碑',
    [MemoryTypeEnum.ACHIEVEMENT]: '成就',
    [MemoryTypeEnum.REFLECTION]: '反思',
  };
  return labels[type] || type;
};

/**
 * 获取重要性的显示名称和颜色
 */
const getImportanceInfo = (importance: MemoryImportance): { label: string; style: React.CSSProperties } => {
  const info: Record<MemoryImportance, { label: string; style: React.CSSProperties }> = {
    [MemoryImportanceEnum.CORE]: {
      label: '核心',
      style: {
        backgroundColor: 'var(--bg-error-alpha)',
        color: 'var(--color-error)',
        borderColor: 'var(--border-error-alpha)',
      },
    },
    [MemoryImportanceEnum.IMPORTANT]: {
      label: '重要',
      style: {
        backgroundColor: 'var(--bg-warning-alpha)',
        color: 'var(--color-warning)',
        borderColor: 'var(--border-warning-alpha)',
      },
    },
    [MemoryImportanceEnum.NORMAL]: {
      label: '普通',
      style: {
        backgroundColor: 'var(--bg-info-alpha)',
        color: 'var(--color-info)',
        borderColor: 'var(--border-info-alpha)',
      },
    },
    [MemoryImportanceEnum.TEMPORARY]: {
      label: '临时',
      style: {
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-tertiary)',
        borderColor: 'var(--border-color-overlay)',
      },
    },
  };
  return info[importance] || {
    label: importance,
    style: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-tertiary)',
      borderColor: 'var(--border-color-overlay)',
    },
  };
};

/**
 * 获取来源的显示名称
 */
const getSourceLabel = (source: MemorySource): string => {
  const labels: Record<MemorySource, string> = {
    [MemorySourceEnum.CONVERSATION]: '对话',
    [MemorySourceEnum.JOURNAL]: '日记',
    [MemorySourceEnum.BEHAVIOR]: '行为',
    [MemorySourceEnum.MANUAL]: '手动',
    [MemorySourceEnum.SYSTEM]: '系统',
  };
  return labels[source] || source;
};

/**
 * 格式化时间戳
 */
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '今天';
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return `${days} 天前`;
  } else if (days < 30) {
    return `${Math.floor(days / 7)} 周前`;
  } else if (days < 365) {
    return `${Math.floor(days / 30)} 个月前`;
  } else {
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  }
};

/**
 * 记忆项组件
 */
export const MemoryItem: React.FC<MemoryItemProps> = ({ 
  memory, 
  isExpanded: controlledExpanded, 
  onToggleExpanded 
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  
  // 使用受控或非受控模式
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const handleToggle = () => {
    if (onToggleExpanded) {
      onToggleExpanded();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

  const importanceInfo = getImportanceInfo(memory.importance);
  const memoryTypeLabel = getMemoryTypeLabel(memory.memoryType);
  const sourceLabel = getSourceLabel(memory.source);

  return (
    <div 
      className="border rounded-lg p-4 transition-colors"
      style={{
        backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
        borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--bg-hover, #475569)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
      }}
    >
      {/* 记忆内容 */}
      <div className="mb-3">
        <p 
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
        >
          {memory.content}
        </p>
      </div>

      {/* 元数据标签 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className="px-2 py-1 rounded text-xs border"
          style={importanceInfo.style}
        >
          {importanceInfo.label}
        </span>
        <span 
          className="px-2 py-1 rounded text-xs border"
          style={{
            backgroundColor: 'var(--bg-secondary, rgba(55, 65, 81, 0.5))',
            color: 'var(--text-secondary)',
            borderColor: 'var(--bg-overlay, #475569)',
          }}
        >
          {memoryTypeLabel}
        </span>
        <span 
          className="px-2 py-1 rounded text-xs border"
          style={{
            backgroundColor: 'var(--bg-secondary, rgba(55, 65, 81, 0.5))',
            color: 'var(--text-secondary)',
            borderColor: 'var(--bg-overlay, #475569)',
          }}
        >
          {sourceLabel}
        </span>
      </div>

      {/* 时间信息 */}
      <div 
        className="flex items-center justify-between text-xs"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <span>创建于 {formatTimestamp(memory.timestamp)}</span>
        {memory.lastUsedAt && (
          <span>最后使用 {formatTimestamp(memory.lastUsedAt)}</span>
        )}
      </div>

      {/* 展开/收起按钮 */}
      {(memory.structuredData || memory.usageCount > 0 || memory.confidence !== undefined) && (
        <button
          onClick={handleToggle}
          className="mt-3 text-xs transition-colors flex items-center gap-1"
          style={{ color: 'var(--color-info, #22d3ee)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-info-light, #67e8f9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-info, #22d3ee)';
          }}
        >
          {isExpanded ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              收起详情
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              展开详情
            </>
          )}
        </button>
      )}

      {/* 详细信息（展开时显示） */}
      {isExpanded && (
        <div 
          className="mt-3 pt-3 border-t space-y-2"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          {memory.structuredData && (
            <div>
              <p 
                className="text-xs mb-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                结构化数据：
              </p>
              <pre 
                className="text-xs p-2 rounded overflow-x-auto"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
                }}
              >
                {JSON.stringify(memory.structuredData, null, 2)}
              </pre>
            </div>
          )}
          <div 
            className="flex items-center gap-4 text-xs"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {memory.usageCount > 0 && (
              <span>使用次数: {memory.usageCount}</span>
            )}
            {memory.confidence !== undefined && (
              <span>置信度: {(memory.confidence * 100).toFixed(0)}%</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
