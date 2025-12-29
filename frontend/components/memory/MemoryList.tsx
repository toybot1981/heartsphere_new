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
      <div className="flex items-center justify-center h-48 bg-slate-900/50 rounded-lg">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-4">我的记忆</h3>
        
        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            type="text"
            placeholder="搜索记忆..."
            value={filter.keyword || ''}
            onChange={(e) => setFilter({ ...filter, keyword: e.target.value })}
            className="flex-1 min-w-[200px] bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {memories.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-400">
          <p>暂无记忆</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
          {memories.map((memory) => (
            <div
              key={memory.id}
              className="p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              onClick={() => onMemoryClick?.(memory)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: importanceColorMap[memory.importance] }}
                  />
                  <span className="text-xs text-slate-400">
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
                  <span className="text-xs text-slate-500">
                    {new Date(memory.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(memory.id);
                    }}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <p className="text-white mb-2">{memory.content}</p>
              
              {memory.structuredData && (
                <div className="text-xs text-slate-400 mb-2">
                  {memory.structuredData.key && (
                    <span className="mr-2">
                      {memory.structuredData.key}: {String(memory.structuredData.value)}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs text-slate-500">
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

