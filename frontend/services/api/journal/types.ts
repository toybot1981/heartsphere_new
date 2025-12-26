// 记录相关API类型定义

/**
 * 日记条目
 */
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  entryDate: string;
  insight?: string;
  tags?: string;
  imageUrl?: string; // 日志配图URL
  worldId?: number;
  eraId?: number;
  characterId?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 创建日记条目请求
 */
export interface CreateJournalEntryRequest {
  title: string;
  content: string;
  entryDate?: string;
  insight?: string;
  tags?: string;
  imageUrl?: string; // 日志配图URL
  worldId?: number;
  eraId?: number;
  characterId?: number;
}

/**
 * 更新日记条目请求
 */
export interface UpdateJournalEntryRequest {
  title: string;
  content: string;
  entryDate?: string;
  insight?: string;
  tags?: string;
  imageUrl?: string; // 日志配图URL
  worldId?: number;
  eraId?: number;
  characterId?: number;
}

