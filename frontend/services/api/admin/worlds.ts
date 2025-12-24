// 系统世界管理API
import { request } from '../base/request';
import type { SystemWorld } from './types';

/**
 * 系统世界管理API
 */
export const adminWorldsApi = {
  /**
   * 获取所有系统世界
   */
  getAll: (token: string): Promise<SystemWorld[]> => {
    return request<SystemWorld[]>('/admin/system/worlds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取系统世界
   */
  getById: (id: number, token: string): Promise<SystemWorld> => {
    return request<SystemWorld>(`/admin/system/worlds/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建系统世界
   */
  create: (data: any, token: string): Promise<SystemWorld> => {
    return request<SystemWorld>('/admin/system/worlds', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新系统世界
   */
  update: (id: number, data: any, token: string): Promise<SystemWorld> => {
    return request<SystemWorld>(`/admin/system/worlds/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除系统世界
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/worlds/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

