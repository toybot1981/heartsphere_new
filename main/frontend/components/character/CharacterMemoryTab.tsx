/**
 * 角色记忆标签页组件
 * 用于显示角色对当前用户的记忆信息
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { memoryApi } from '../../services/api/memory';
import type { UserMemory, MemoryType, MemoryImportance } from '../../services/memory-system/types/MemoryTypes';
import { logger } from '../../utils/logger';
import { MemoryItem } from './MemoryItem';

interface CharacterMemoryTabProps {
  characterId: number;
  characterName?: string;
  userId: number | string; // 当前用户 ID（支持数字或字符串，会自动转换）
  token?: string | null;
}

// 简单的内存缓存，避免重复请求
const memoryCache = new Map<string, { memories: UserMemory[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

/**
 * 角色记忆标签页组件
 */
export const CharacterMemoryTab: React.FC<CharacterMemoryTabProps> = ({
  characterId,
  characterName,
  userId,
  token,
}) => {
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // 缓存键
  const cacheKey = useMemo(() => `character_${characterId}_user_${userId}`, [characterId, userId]);

  // 加载记忆数据（带缓存）
  useEffect(() => {
    if (characterId && userId && token) {
      loadMemories();
    }
  }, [characterId, userId, token]);

  const loadMemories = useCallback(async () => {
    if (!token) {
      setError('未提供认证令牌');
      return;
    }

    // 确保 userId 是有效的数字
    const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
    if (isNaN(userIdNum) || userIdNum <= 0) {
      setError(`无效的用户ID: ${userId}`);
      return;
    }

    // 检查缓存（使用数字ID作为缓存键）
    const numericCacheKey = `character_${characterId}_user_${userIdNum}`;
    const cached = memoryCache.get(numericCacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setMemories(cached.memories);
      // 使用缓存数据，避免重复请求
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 搜索所有记忆，然后在客户端按 characterId 过滤
      const response = await memoryApi.searchMemories(
        userIdNum,
        {
          limit: 100, // 获取足够多的记忆以便过滤
        },
        token
      );

      // 过滤出与当前角色相关的记忆
      const characterMemories = (response.memories || []).filter(
        (memory) => memory.metadata?.characterId === String(characterId)
      );

      // 按时间戳排序（最新的在前）
      characterMemories.sort((a, b) => b.timestamp - a.timestamp);

      // 更新缓存（使用数字ID作为缓存键）
      const numericCacheKey = `character_${characterId}_user_${userIdNum}`;
      memoryCache.set(numericCacheKey, {
        memories: characterMemories,
        timestamp: Date.now(),
      });

      setMemories(characterMemories);
    } catch (err: any) {
      logger.error('[CharacterMemoryTab] 加载记忆失败', {
        characterId,
        userId,
        error: err?.message || err,
      });
      setError(err?.message || '加载记忆失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [characterId, userId, token]);

  // 切换展开/收起状态
  const toggleExpanded = useCallback((memoryId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(memoryId)) {
        next.delete(memoryId);
      } else {
        next.add(memoryId);
      }
      return next;
    });
  }, []);

  // 按重要性分组记忆（用于更好的展示）
  const groupedMemories = useMemo(() => {
    const groups: Record<string, UserMemory[]> = {
      core: [],
      important: [],
      normal: [],
      temporary: [],
    };

    memories.forEach((memory) => {
      const group = memory.importance || 'normal';
      if (groups[group]) {
        groups[group].push(memory);
      } else {
        groups.normal.push(memory);
      }
    });

    return groups;
  }, [memories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div 
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--color-info, #06b6d4)' }}
          />
          <p 
            className="text-sm"
            style={{ color: 'var(--text-tertiary)' }}
          >
            加载记忆中...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p 
            className="mb-4 text-sm"
            style={{ color: 'var(--color-error)' }}
          >
            {error}
          </p>
          <button
            onClick={loadMemories}
            className="px-4 py-2 rounded-lg transition-colors text-sm"
            style={{
              backgroundColor: 'var(--color-info, #06b6d4)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info-light, #22d3ee)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, #06b6d4)';
            }}
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">💭</div>
          <p 
            className="text-base mb-2 font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {characterName ? `${characterName} 还没有关于你的记忆` : '暂无记忆'}
          </p>
          <p 
            className="text-sm max-w-xs mx-auto"
            style={{ color: 'var(--text-disabled)' }}
          >
            与角色互动后，系统会自动记录相关记忆
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="character-memory-tab p-4 sm:p-6">
      <div className="mb-4">
        <h3 
          className="text-lg sm:text-xl font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {characterName ? `${characterName} 的记忆` : '角色记忆'}
        </h3>
        <p 
          className="text-sm"
          style={{ color: 'var(--text-tertiary)' }}
        >
          共 {memories.length} 条记忆
        </p>
      </div>

      {/* 按重要性分组的记忆列表 */}
      <div className="space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto custom-scrollbar">
        {/* 核心记忆 */}
        {groupedMemories.core.length > 0 && (
          <div>
            <h4
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-error)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-error)' }}
              />
              核心记忆 ({groupedMemories.core.length})
            </h4>
            <div className="space-y-3">
              {groupedMemories.core.map((memory) => (
                <MemoryItem
                  key={memory.id}
                  memory={memory}
                  isExpanded={expandedItems.has(memory.id)}
                  onToggleExpanded={() => toggleExpanded(memory.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 重要记忆 */}
        {groupedMemories.important.length > 0 && (
          <div>
            <h4
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-warning)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-warning)' }}
              />
              重要记忆 ({groupedMemories.important.length})
            </h4>
            <div className="space-y-3">
              {groupedMemories.important.map((memory) => (
                <MemoryItem
                  key={memory.id}
                  memory={memory}
                  isExpanded={expandedItems.has(memory.id)}
                  onToggleExpanded={() => toggleExpanded(memory.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 普通记忆 */}
        {groupedMemories.normal.length > 0 && (
          <div>
            <h4
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--color-info)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--color-info)' }}
              />
              普通记忆 ({groupedMemories.normal.length})
            </h4>
            <div className="space-y-3">
              {groupedMemories.normal.map((memory) => (
                <MemoryItem
                  key={memory.id}
                  memory={memory}
                  isExpanded={expandedItems.has(memory.id)}
                  onToggleExpanded={() => toggleExpanded(memory.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* 临时记忆 */}
        {groupedMemories.temporary.length > 0 && (
          <div>
            <h4
              className="text-sm font-semibold mb-2 flex items-center gap-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: 'var(--text-tertiary)' }}
              />
              临时记忆 ({groupedMemories.temporary.length})
            </h4>
            <div className="space-y-3">
              {groupedMemories.temporary.map((memory) => (
                <MemoryItem
                  key={memory.id}
                  memory={memory}
                  isExpanded={expandedItems.has(memory.id)}
                  onToggleExpanded={() => toggleExpanded(memory.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
