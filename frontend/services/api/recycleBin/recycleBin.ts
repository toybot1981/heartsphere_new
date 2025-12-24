// 回收站 API
import { request } from '../base/request';
import type { RecycleBinData } from './types';

/**
 * 回收站API
 */
export const recycleBinApi = {
  /**
   * 获取回收站数据
   * @param token - 用户token
   */
  getRecycleBin: (token: string): Promise<RecycleBinData> => {
    return request<RecycleBinData>('/recycle-bin', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 恢复角色
   * @param id - 角色ID
   * @param token - 用户token
   */
  restoreCharacter: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/characters/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 恢复世界
   * @param id - 世界ID
   * @param token - 用户token
   */
  restoreWorld: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/worlds/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 恢复场景
   * @param id - 场景ID
   * @param token - 用户token
   */
  restoreEra: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/eras/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 恢复剧本
   * @param id - 剧本ID
   * @param token - 用户token
   */
  restoreScript: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/scripts/${id}/restore`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 永久删除角色
   * @param id - 角色ID
   * @param token - 用户token
   */
  permanentlyDeleteCharacter: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/characters/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 永久删除世界
   * @param id - 世界ID
   * @param token - 用户token
   */
  permanentlyDeleteWorld: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/worlds/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 永久删除场景
   * @param id - 场景ID
   * @param token - 用户token
   */
  permanentlyDeleteEra: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/eras/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 永久删除剧本
   * @param id - 剧本ID
   * @param token - 用户token
   */
  permanentlyDeleteScript: (id: number, token: string): Promise<void> => {
    return request<void>(`/recycle-bin/scripts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

