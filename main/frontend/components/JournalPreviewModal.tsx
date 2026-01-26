/**
 * 日志预览模态框
 * 清新舒爽的设计，展示日志的完整信息
 */

import React, { useEffect, useState, useRef } from 'react';
import { JournalEntry } from '../types';
import { useMemorySystem } from '../services/memory-system';
import { UserMemory, MemoryType, MemoryImportance, MemorySource } from '../services/memory-system/types/MemoryTypes';
import { logger } from '../utils/logger';

interface JournalPreviewModalProps {
  entry: JournalEntry | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (entry: JournalEntry) => void;
  onDelete?: (entryId: string) => void;
  userId: number;
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

export const JournalPreviewModal: React.FC<JournalPreviewModalProps> = ({
  entry,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  userId,
}) => {
  const memorySystem = useMemorySystem({
    enabled: true,
    autoExtraction: true,
    aiEnhanced: true,
    userId,
    useRemoteStorage: true,
  });

  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [isLoadingMemories, setIsLoadingMemories] = useState(false);
  const entryIdRef = useRef<string | null>(null);

  useEffect(() => {
    // 如果模态框未打开或没有entry，清空记忆
    if (!isOpen || !entry) {
      setMemories([]);
      setIsLoadingMemories(false);
      entryIdRef.current = null;
      return;
    }

    // 如果entry.id没有变化，且已经加载过，不重复加载
    if (entryIdRef.current === entry.id && memories.length >= 0) {
      return;
    }

    // 如果记忆系统未就绪，等待
    if (!memorySystem.isReady) {
      return;
    }

    // 记录当前entry.id，防止重复加载
    entryIdRef.current = entry.id;

    const loadMemories = async () => {
      setIsLoadingMemories(true);
      try {
        // 加载来源为日记的记忆，且sourceId匹配当前日记ID
        const allMemories = await memorySystem.searchMemories({
          source: MemorySource.JOURNAL,
          limit: 100,
        });
        
        // 筛选出当前日记的记忆
        const journalMemories = allMemories.filter(
          m => m.sourceId === entry.id
        );
        
        setMemories(journalMemories);
        
        logger.info('[JournalPreviewModal] 加载日记记忆成功', {
          total: journalMemories.length,
          journalId: entry.id,
        });
      } catch (error) {
        logger.error('[JournalPreviewModal] 加载记忆失败', error);
        setMemories([]);
      } finally {
        setIsLoadingMemories(false);
      }
    };

    loadMemories();
    // 只依赖 isOpen, entry?.id, memorySystem.isReady
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, entry?.id, memorySystem.isReady]);

  if (!isOpen || !entry) return null;

  const handleDelete = () => {
    if (onDelete && confirm('确定要删除这篇日记吗？')) {
      onDelete(entry.id);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in"
      style={{
        backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.6))',
      }}
    >
      <div 
        className="rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border overflow-hidden"
        style={{
          background: 'var(--gradient-bg, linear-gradient(to bottom right, #f8fafc, #f1f5f9))',
          borderColor: 'var(--border-color-overlay, #e2e8f0)',
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b backdrop-blur-sm"
          style={{
            borderColor: 'var(--border-color-overlay, #e2e8f0)',
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.5))',
          }}
        >
          <div className="flex-1">
            <h2 
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {entry.title}
            </h2>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-disabled)' }}
            >
              {new Date(entry.timestamp).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(entry);
                  onClose();
                }}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
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
                编辑
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-error, #ef4444)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-error, #dc2626)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-error, #ef4444)';
                }}
              >
                删除
              </button>
            )}
            <button
              onClick={onClose}
              className="transition-colors p-2 rounded-lg"
              style={{ color: 'var(--text-tertiary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(241, 245, 249, 1))';
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Image */}
          {entry.imageUrl && (
            <div 
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{
                background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(243, 232, 255, 1), rgba(219, 234, 254, 1)))',
              }}
            >
              <img
                src={entry.imageUrl}
                alt={entry.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div 
            className="rounded-2xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary, #ffffff)',
              borderColor: 'var(--border-color-overlay, #e2e8f0)',
            }}
          >
            <h3 
              className="text-lg font-semibold mb-4 flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="text-2xl">📝</span>
              <span>日志内容</span>
            </h3>
            <div className="prose prose-slate max-w-none">
              <p 
                className="leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-secondary)' }}
              >
                {entry.content}
              </p>
            </div>
          </div>

          {/* Mirror Insight */}
          {entry.insight && (
            <div 
              className="rounded-2xl p-6 shadow-sm border"
              style={{
                background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(207, 250, 254, 1), rgba(219, 234, 254, 1)))',
                borderColor: 'var(--color-info, rgba(6, 182, 212, 0.2))',
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🔮</span>
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-info, #0891b2)' }}
                  >
                    本我镜像
                  </h3>
                  <p 
                    className="text-xs uppercase tracking-wider"
                    style={{ color: 'var(--color-info, #06b6d4)' }}
                  >
                    Mirror of Truth
                  </p>
                </div>
              </div>
              <div 
                className="rounded-xl p-4 border"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.6))',
                  borderColor: 'var(--color-info, rgba(6, 182, 212, 0.2))',
                }}
              >
                <p 
                  className="italic leading-relaxed"
                  style={{ color: 'var(--color-info, #0e7490)' }}
                >
                  "{entry.insight}"
                </p>
              </div>
            </div>
          )}

          {/* Tags */}
          {entry.tags && entry.tags.trim() && (
            <div className="flex flex-wrap gap-2">
              {entry.tags.split(',').map((tag, idx) => {
                const trimmedTag = tag.trim();
                if (!trimmedTag) return null;
                return (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-sm font-medium border"
                    style={{
                      backgroundColor: 'var(--color-primary, rgba(99, 102, 241, 0.1))',
                      color: 'var(--color-primary, #6366f1)',
                      borderColor: 'var(--color-primary, rgba(99, 102, 241, 0.2))',
                    }}
                  >
                    #{trimmedTag}
                  </span>
                );
              })}
            </div>
          )}

          {/* Memories */}
          <div 
            className="rounded-2xl p-6 shadow-sm border"
            style={{
              backgroundColor: 'var(--bg-primary, #ffffff)',
              borderColor: 'var(--border-color-overlay, #e2e8f0)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🧠</span>
              <div>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  提取的回忆
                </h3>
                <p 
                  className="text-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  从这篇日记中自动提取的记忆
                </p>
              </div>
            </div>

            {isLoadingMemories ? (
              <div className="flex items-center justify-center py-8">
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
                className="text-center py-8"
                style={{ color: 'var(--text-disabled)' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">暂无提取的记忆</p>
                <p className="text-xs mt-1">系统会自动从日记中提取重要信息</p>
              </div>
            ) : (
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div
                    key={memory.id}
                    className="rounded-xl p-4 border hover:shadow-md transition-shadow"
                    style={{
                      background: 'var(--gradient-bg, linear-gradient(to right, #f8fafc, #f1f5f9))',
                      borderColor: 'var(--border-color-overlay, #e2e8f0)',
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: importanceColorMap[memory.importance] }}
                        />
                        <span 
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            color: 'var(--text-secondary)',
                            backgroundColor: 'var(--bg-secondary, #e2e8f0)',
                          }}
                        >
                          {memoryTypeNames[memory.memoryType]}
                        </span>
                        <span
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            backgroundColor: `${importanceColorMap[memory.importance]}20`,
                            color: importanceColorMap[memory.importance],
                          }}
                        >
                          {importanceNames[memory.importance]}
                        </span>
                      </div>
                      <span 
                        className="text-xs"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        置信度: {(memory.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <p 
                      className="mb-2 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {memory.content}
                    </p>
                    
                    {memory.structuredData && (
                      <div 
                        className="text-xs space-y-1 mt-2"
                        style={{ color: 'var(--text-secondary)' }}
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
                                  backgroundColor: 'var(--color-primary, rgba(99, 102, 241, 0.1))',
                                  color: 'var(--color-primary, #6366f1)',
                                }}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-6 border-t backdrop-blur-sm flex justify-end"
          style={{
            borderColor: 'var(--border-color-overlay, #e2e8f0)',
            backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.5))',
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: 'var(--bg-secondary, #e2e8f0)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, #cbd5e1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #e2e8f0)';
            }}
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

