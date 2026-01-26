/**
 * 日记记忆查看模态框
 * 展示从日记中提取的记忆
 */

import React, { useEffect, useState } from 'react';
import { useMemorySystem } from '../../services/memory-system';
import { UserMemory, MemoryType, MemoryImportance, MemorySource } from '../../services/memory-system/types/MemoryTypes';
import { logger } from '../../utils/logger';

interface JournalMemoryModalProps {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  journalId?: string; // 可选：查看特定日记的记忆
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

export const JournalMemoryModal: React.FC<JournalMemoryModalProps> = ({
  userId,
  isOpen,
  onClose,
  journalId,
}) => {
  const memorySystem = useMemorySystem({
    enabled: true,
    autoExtraction: true,
    aiEnhanced: true,
    userId,
    useRemoteStorage: true, // 使用远程存储连接到Redis/MongoDB
  });

  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<{
    type?: MemoryType;
    importance?: MemoryImportance;
    keyword?: string;
  }>({});

  useEffect(() => {
    if (!isOpen || !memorySystem.isReady) return;

    const loadMemories = async () => {
      setIsLoading(true);
      try {
        // 只加载来源为日记的记忆
        const allMemories = await memorySystem.searchMemories({
          ...filter,
          limit: 100,
        });
        
        // 筛选出来源为日记的记忆
        let journalMemories = allMemories.filter(m => m.source === MemorySource.JOURNAL);
        
        // 如果指定了日记ID，进一步筛选
        if (journalId) {
          journalMemories = journalMemories.filter(m => m.sourceId === journalId);
        }
        
        setMemories(journalMemories);
        
        logger.info('[JournalMemoryModal] 加载日记记忆成功', {
          total: journalMemories.length,
          journalId,
        });
      } catch (error) {
        logger.error('[JournalMemoryModal] 加载记忆失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [isOpen, memorySystem.isReady, userId, filter, journalId]);

  const handleDelete = async (memoryId: string) => {
    if (!confirm('确定要删除这条记忆吗？')) {
      return;
    }

    try {
      await memorySystem.system?.deleteMemory(memoryId);
      setMemories(memories.filter(m => m.id !== memoryId));
      logger.info('[JournalMemoryModal] 删除记忆成功', { memoryId });
    } catch (error) {
      logger.error('[JournalMemoryModal] 删除记忆失败', error);
      alert('删除失败，请重试');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.6))',
      }}
    >
      <div 
        className="rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border"
        style={{
          backgroundColor: 'var(--bg-secondary, #0f172a)',
          borderColor: 'var(--border-color-overlay, #334155)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--border-color-overlay, #334155)' }}
        >
          <div>
            <h2 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              日记记忆
            </h2>
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {journalId ? '查看此日记提取的记忆' : '查看所有从日记中提取的记忆'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="transition-colors p-2 rounded-lg"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(30, 41, 59, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* 筛选器 */}
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="搜索记忆..."
              value={filter.keyword || ''}
              onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
              className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1e3a8a)',
                borderColor: 'var(--border-color-overlay, #334155)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                e.currentTarget.style.outline = '1px solid var(--color-primary, #6366f1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
                e.currentTarget.style.outline = 'none';
              }}
            />
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as MemoryType || undefined })}
              className="border rounded-lg px-4 py-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1e3a8a)',
                borderColor: 'var(--border-color-overlay, #334155)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                e.currentTarget.style.outline = '1px solid var(--color-primary, #6366f1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
                e.currentTarget.style.outline = 'none';
              }}
            >
              <option value="">所有类型</option>
              {Object.entries(memoryTypeNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filter.importance || ''}
              onChange={(e) => setFilter({ ...filter, importance: e.target.value as MemoryImportance || undefined })}
              className="border rounded-lg px-4 py-2 outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1e3a8a)',
                borderColor: 'var(--border-color-overlay, #334155)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #6366f1)';
                e.currentTarget.style.outline = '1px solid var(--color-primary, #6366f1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay, #334155)';
                e.currentTarget.style.outline = 'none';
              }}
            >
              <option value="">所有重要性</option>
              {Object.entries(importanceNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 记忆列表 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div 
                  className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor: 'var(--color-primary, #6366f1)',
                    borderTopColor: 'transparent',
                  }}
                />
              </div>
            ) : memories.length === 0 ? (
              <div 
                className="flex flex-col items-center justify-center h-48"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">暂无记忆</p>
                <p className="text-sm mt-2">创建日记后，系统会自动提取记忆</p>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="p-4 rounded-lg transition-colors border"
                    style={{
                      backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 0.5))',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 1))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: importanceColorMap[memory.importance] }}
                        />
                        <span 
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--bg-overlay, rgba(51, 65, 85, 0.5))',
                            color: 'var(--text-tertiary)',
                          }}
                        >
                          {memoryTypeNames[memory.memoryType]}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: `${importanceColorMap[memory.importance]}20`,
                            color: importanceColorMap[memory.importance],
                          }}
                        >
                          {importanceNames[memory.importance]}
                        </span>
                        {memory.sourceId && (
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            来源日记: {memory.sourceId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="text-xs"
                          style={{ color: 'var(--text-disabled)' }}
                        >
                          {new Date(memory.timestamp).toLocaleDateString('zh-CN')}
                        </span>
                        <button
                          onClick={() => handleDelete(memory.id)}
                          className="transition-colors p-1"
                          style={{ color: 'var(--text-disabled)' }}
                          title="删除记忆"
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
                      className="mb-2 leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {memory.content}
                    </p>
                    
                    {memory.structuredData && (
                      <div 
                        className="text-xs mb-2 space-y-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {memory.structuredData.key && (
                          <div>
                            <span className="font-semibold">{memory.structuredData.key}:</span>{' '}
                            <span>{String(memory.structuredData.value)}</span>
                          </div>
                        )}
                        {memory.structuredData.tags && memory.structuredData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {memory.structuredData.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-xs"
                                style={{
                                  backgroundColor: 'var(--color-primary, rgba(99, 102, 241, 0.2))',
                                  color: 'var(--color-primary, #a5b4fc)',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div 
                      className="flex items-center gap-4 text-xs mt-3 pt-3 border-t"
                      style={{
                        color: 'var(--text-disabled)',
                        borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 0.5))',
                      }}
                    >
                      <span>使用次数: {memory.usageCount}</span>
                      <span>置信度: {(memory.confidence * 100).toFixed(0)}%</span>
                      {memory.lastUsedAt && (
                        <span>
                          最后使用: {new Date(memory.lastUsedAt).toLocaleDateString('zh-CN')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t flex justify-end"
          style={{ borderColor: 'var(--border-color-overlay, #334155)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--color-primary, #6366f1)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #6366f1)';
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

