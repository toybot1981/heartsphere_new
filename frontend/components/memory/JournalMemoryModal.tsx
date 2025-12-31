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
        
        logger.debug('[JournalMemoryModal] 加载日记记忆成功', {
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
      logger.debug('[JournalMemoryModal] 删除记忆成功', { memoryId });
    } catch (error) {
      logger.error('[JournalMemoryModal] 删除记忆失败', error);
      alert('删除失败，请重试');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">日记记忆</h2>
            <p className="text-sm text-slate-400 mt-1">
              {journalId ? '查看此日记提取的记忆' : '查看所有从日记中提取的记忆'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
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
              className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
            <select
              value={filter.type || ''}
              onChange={(e) => setFilter({ ...filter, type: e.target.value as MemoryType || undefined })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="">所有类型</option>
              {Object.entries(memoryTypeNames).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <select
              value={filter.importance || ''}
              onChange={(e) => setFilter({ ...filter, importance: e.target.value as MemoryImportance || undefined })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : memories.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400">
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
                    className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700/50"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: importanceColorMap[memory.importance] }}
                        />
                        <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
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
                          <span className="text-xs text-slate-500">
                            来源日记: {memory.sourceId.substring(0, 8)}...
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500">
                          {new Date(memory.timestamp).toLocaleDateString('zh-CN')}
                        </span>
                        <button
                          onClick={() => handleDelete(memory.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors p-1"
                          title="删除记忆"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-white mb-2 leading-relaxed">{memory.content}</p>
                    
                    {memory.structuredData && (
                      <div className="text-xs text-slate-400 mb-2 space-y-1">
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
                                className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/50">
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
        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

