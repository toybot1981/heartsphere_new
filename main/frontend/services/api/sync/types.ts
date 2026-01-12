// 笔记同步API类型定义

/**
 * Notion授权URL响应
 */
export interface NotionAuthUrlResponse {
  authorizationUrl: string;
  state: string;
}

/**
 * 笔记同步配置
 */
export interface NoteSync {
  id: number;
  userId: number;
  provider: string;
  isActive: boolean;
  lastSyncAt: string | null;
  syncStatus: string | null;
  syncError: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 同步状态
 */
export interface SyncStatus {
  authorized: boolean;
  lastSyncAt?: string;
  syncStatus?: string;
}

/**
 * 同步结果
 */
export interface SyncResult {
  success: boolean;
  syncedCount: number;
  error: string | null;
}

/**
 * 笔记信息
 */
export interface Note {
  id: number;
  userId: number;
  provider: string;
  providerNoteId: string;
  title: string;
  content: string;
  contentType: string | null;
  notebookName: string | null;
  tags: string | null;
  url: string | null;
  createdAtProvider: string | null;
  updatedAtProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

