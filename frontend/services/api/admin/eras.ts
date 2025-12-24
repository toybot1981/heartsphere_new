// 系统场景管理API
import { request } from '../base/request';
import type { SystemEra } from './types';

/**
 * 系统场景管理API
 */
export const adminErasApi = {
  /**
   * 获取所有系统场景
   */
  getAll: (token: string): Promise<SystemEra[]> => {
    return request<SystemEra[]>('/admin/system/eras', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取系统场景
   */
  getById: (id: number, token: string): Promise<SystemEra> => {
    return request<SystemEra>(`/admin/system/eras/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建系统场景
   */
  create: (data: any, token: string): Promise<SystemEra> => {
    return request<SystemEra>('/admin/system/eras', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新系统场景
   */
  update: (id: number, data: any, token: string): Promise<SystemEra> => {
    return request<SystemEra>(`/admin/system/eras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除系统场景
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/eras/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

