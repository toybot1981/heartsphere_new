// 笔记同步相关API
import { request } from '../base/request';
import type {
  NotionAuthUrlResponse,
  NoteSync,
  SyncStatus,
  SyncResult,
  Note,
} from './types';

/**
 * 笔记同步API
 */
export const noteSyncApi = {
  /**
   * 获取 Notion 授权URL
   * @param callbackUrl - 回调URL
   * @param token - 用户token
   */
  getNotionAuthUrl: (
    callbackUrl: string,
    token: string
  ): Promise<NotionAuthUrlResponse> => {
    return request<NotionAuthUrlResponse>(
      `/notes/notion/authorize?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 更新 Notion 数据库 ID
   * @param databaseId - 数据库ID
   * @param token - 用户token
   */
  updateNotionDatabaseId: (
    databaseId: string,
    token: string
  ): Promise<{ databaseId: string; message: string }> => {
    return request<{ databaseId: string; message: string }>(
      '/notes/syncs/notion/database-id',
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseId }),
      }
    );
  },

  /**
   * 获取笔记同步配置列表
   * @param token - 用户token
   */
  getSyncs: (token: string): Promise<NoteSync[]> => {
    return request<NoteSync[]>('/notes/syncs', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取指定provider的同步状态
   * @param provider - 同步提供商
   * @param token - 用户token
   */
  getSyncStatus: (provider: string, token: string): Promise<SyncStatus> => {
    return request<SyncStatus>(`/notes/syncs/${provider}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 同步笔记
   * @param provider - 同步提供商
   * @param token - 用户token
   */
  syncNotes: (provider: string, token: string): Promise<SyncResult> => {
    return request<SyncResult>(`/notes/syncs/${provider}/sync`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 撤销授权
   * @param provider - 同步提供商
   * @param token - 用户token
   */
  revokeAuthorization: (provider: string, token: string): Promise<void> => {
    return request<void>(`/notes/syncs/${provider}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取笔记列表
   * @param provider - 可选，同步提供商
   * @param token - 可选，用户token
   */
  getNotes: (provider?: string, token?: string): Promise<Note[]> => {
    const url = provider ? `/notes?provider=${provider}` : '/notes';
    return request<Note[]>(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  },

  /**
   * 获取单个笔记详情
   * @param id - 笔记ID
   * @param token - 用户token
   */
  getNoteById: (id: number, token: string): Promise<Note> => {
    return request<Note>(`/notes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

