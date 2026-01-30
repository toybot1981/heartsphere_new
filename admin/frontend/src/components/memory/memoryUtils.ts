import type { MemoryItem } from '../../services/api/hsmem/hsmemApi';
import type { UserMemory } from '../../services/api/admin/memory';

/**
 * 将 HSMem MemoryItem 转为用户记忆列表展示用的 UserMemory 形状
 */
export function hsmemItemToUserMemory(item: MemoryItem, userId: number): UserMemory {
  const content = item.content ?? item.summary ?? '';
  const preview = content.length > 100 ? content.slice(0, 100) + '...' : content;
  const imp = item.importance;
  let importanceStr = 'normal';
  if (typeof imp === 'number') {
    if (imp >= 0.8) importanceStr = 'core';
    else if (imp >= 0.5) importanceStr = 'important';
    else if (imp < 0.2) importanceStr = 'temporary';
  } else if (typeof imp === 'string') importanceStr = imp.toLowerCase();
  return {
    id: item.id,
    userId,
    memoryType: item.memory_type ?? 'general',
    contentPreview: preview,
    importance: importanceStr,
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? new Date().toISOString(),
    accessCount: 0,
  };
}
