// 用户剧本管理API（管理员专用）
import { request } from '../base/request';
import type { AdminScript } from './types';

/**
 * 用户剧本管理API（管理员专用）
 */
export const adminScriptsApi = {
  /**
   * 获取所有用户剧本
   */
  getAll: (token: string): Promise<AdminScript[]> => {
    return request<AdminScript[]>('/admin/system/scripts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取用户剧本
   */
  getById: (id: number, token: string): Promise<AdminScript> => {
    return request<AdminScript>(`/admin/system/scripts/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建用户剧本
   */
  create: (
    data: {
      title: string;
      description?: string;
      content: string;
      sceneCount?: number;
      systemEraId?: number | null;
      characterIds?: string | null;
      tags?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    },
    token: string
  ): Promise<AdminScript> => {
    return request<AdminScript>('/admin/system/scripts', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新用户剧本
   */
  update: (
    id: number,
    data: {
      title: string;
      description?: string;
      content: string;
      sceneCount?: number;
      systemEraId?: number | null;
      characterIds?: string | null;
      tags?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    },
    token: string
  ): Promise<AdminScript> => {
    return request<AdminScript>(`/admin/system/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除用户剧本
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/scripts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

