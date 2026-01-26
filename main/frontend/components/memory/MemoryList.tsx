/**
 * 记忆列表组件
 * 展示和管理用户记忆
 */

import React, { useEffect, useState } from 'react';
import { useMemorySystem } from '../../services/memory-system';
import { UserMemory, MemoryType, MemoryImportance } from '../../services/memory-system/types/MemoryTypes';

interface MemoryListProps {
  userId: number;
  onMemoryClick?: (memory: UserMemory) => void;
}

/**
 * 记忆类型名称映射
 */
const memoryTypeNames: Record<MemoryType, string> = {
  [MemoryType.PERSONAL_INFO]: '个人信息',
  [MemoryType.PREFERENCE]: '偏好',
  [MemoryType.HABIT]: '习惯',
  [MemoryType.PERSONALITY]: '性格',
  [MemoryType.IMPORTANT_MOMENT]: '重要时刻',
  [MemoryType.EMOTIONAL_EXPERIENCE]: '情感经历',
  [MemoryType.EMOTION_PATTERN]: '情绪模式',
  [MemoryType.EMOTIONAL_PREFERENCE]: '情感偏好',
  [MemoryType.FREQUENT_CHARACTER]: '常用角色',
  [MemoryType.CONVERSATION_TOPIC]: '对话主题',
  [MemoryType.INTERACTION_PREFERENCE]: '交互偏好',
  [MemoryType.CONVERSATION_STYLE]: '对话风格',
  [MemoryType.CREATED_CONTENT]: '创作内容',
  [MemoryType.FOCUSED_CONTENT]: '关注内容',
  [MemoryType.FAVORITED_CONTENT]: '收藏内容',
  [MemoryType.SHARED_CONTENT]: '分享内容',
  [MemoryType.GROWTH_TRAJECTORY]: '成长轨迹',
  [MemoryType.MILESTONE]: '里程碑',
  [MemoryType.ACHIEVEMENT]: '成就',
  [MemoryType.REFLECTION]: '反思',
};

/**
 * 重要性颜色映射
 */
const importanceColorMap: Record<MemoryImportance, string> = {
  [MemoryImportance.CORE]: '#FF5252',
  [MemoryImportance.IMPORTANT]: '#FF9800',
  [MemoryImportance.NORMAL]: '#2196F3',
  [MemoryImportance.TEMPORARY]: '#9E9E9E',
};

/**
 * 重要性名称映射
 */
const importanceNames: Record<MemoryImportance, string> = {
  [MemoryImportance.CORE]: '核心',
  [MemoryImportance.IMPORTANT]: '重要',
  [MemoryImportance.NORMAL]: '普通',
  [MemoryImportance.TEMPORARY]: '临时',
};

export const MemoryList: React.FC<MemoryListProps> = ({
  userId,
  onMemoryClick,
}) => {
  const memorySystem = useMemorySystem({
    enabled: true,
    userId,
  });

  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: MemoryType;
    importance?: MemoryImportance;
    keyword?: string;
  }>({});

  useEffect(() => {
    if (!memorySystem.isReady) return;

    const loadMemories = async () => {
      setIsLoading(true);
      try {
        const results = await memorySystem.searchMemories({
          ...filter,
          limit: 50,
        });
        setMemories(results);
      } catch (error) {
        console.error('[MemoryList] 加载记忆失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [memorySystem.isReady, userId, filter]);

  const handleDelete = async (memoryId: string) => {
    if (!confirm('确定要删除这条记忆吗？')) {
      return;
    }

    try {
      await memorySystem.system?.deleteMemory(memoryId);
      setMemories(memories.filter(m => m.id !== memoryId));
    } catch (error) {
      console.error('[MemoryList] 删除记忆失败:', error);
      alert('删除失败，请重试');
    }
  };

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

  return (
    <div 
      className="rounded-lg p-4"
      style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}
    >
      <div className="mb-4">
        <h3 
          className="text-lg font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          我的记忆
        </h3>
        
        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="搜索记忆..."
            value={filter.keyword || ''}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            className="flex-1 min-w-[200px] rounded-lg px-3 py-2 outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary, #1e293b)',
              borderColor: 'var(--border-color-overlay, #334155)',
              borderWidth: '1px',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
              e.currentTarget.style.outline = '1px solid var(--color-primary, rgba(99, 102, 241, 0.5))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
              e.currentTarget.style.outline = 'none';
            }}
          />
        </div>
      </div>

      {memories.length === 0 ? (
        <div 
          className="flex items-center justify-center h-48"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <p>暂无记忆</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="p-4 rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: 'var(--bg-secondary, rgba(30, 41, 59, 0.5))',
              }}
              onClick={() => onMemoryClick?.(memory)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary, rgba(30, 41, 59, 1))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary, rgba(30, 41, 59, 0.5))';
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: importanceColorMap[memory.importance] }}
                  />
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {memoryTypeNames[memory.memoryType]}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: `${importanceColorMap[memory.importance]}20`,
                      color: importanceColorMap[memory.importance],
                    }}
                  >
                    {importanceNames[memory.importance]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    {new Date(memory.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(memory.id);
                    }}
                    className="transition-colors"
                    style={{ color: 'var(--text-disabled)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-error, #f87171)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-disabled)';
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p 
                className="mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                {memory.content}
              </p>
              
              {memory.structuredData && (
                <div 
                  className="text-xs mb-2"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {memory.structuredData.key && (
                    <span className="mr-2">
                      {memory.structuredData.key}: {String(memory.structuredData.value)}
                    </span>
                  )}
                </div>
              )}
              
              <div 
                className="flex items-center gap-4 text-xs"
                style={{ color: 'var(--text-disabled)' }}
              >
                <span>使用次数: {memory.usageCount}</span>
                <span>置信度: {(memory.confidence * 100).toFixed(0)}%</span>
                {memory.lastUsedAt && (
                  <span>
                    最后使用: {new Date(memory.lastUsedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};




