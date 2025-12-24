// 系统资源管理API
import { request } from '../base/request';
import type { SystemResource, ResourceMatchResult } from './types';

/**
 * 系统资源管理API
 */
export const adminResourcesApi = {
  /**
   * 获取所有系统资源
   * @param token - 管理员token
   * @param category - 可选，资源分类
   */
  getAll: (token: string, category?: string): Promise<SystemResource[]> => {
    const url = category
      ? `/admin/system/resources?category=${category}`
      : '/admin/system/resources';
    return request<SystemResource[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取系统资源
   */
  getById: (id: number, token: string): Promise<SystemResource> => {
    return request<SystemResource>(`/admin/system/resources/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建系统资源
   */
  create: (
    file: File,
    category: string,
    name?: string,
    description?: string,
    prompt?: string,
    tags?: string,
    token?: string
  ): Promise<{
    id: number;
    name: string;
    url: string;
    category: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (name) formData.append('name', name);
    if (description) formData.append('description', description);
    if (prompt) formData.append('prompt', prompt);
    if (tags) formData.append('tags', tags);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return request<{
      id: number;
      name: string;
      url: string;
      category: string;
    }>('/admin/system/resources', {
      method: 'POST',
      body: formData,
      headers: headers,
    });
  },

  /**
   * 更新系统资源
   */
  update: (
    id: number,
    data: {
      name?: string;
      description?: string;
      prompt?: string;
      tags?: string;
      url?: string;
    },
    token: string
  ): Promise<SystemResource> => {
    return request<SystemResource>(`/admin/system/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除系统资源
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/resources/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 匹配并更新资源
   */
  matchAndUpdate: (token: string): Promise<ResourceMatchResult> => {
    return request<ResourceMatchResult>(
      '/admin/system/resources/match-and-update',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },
};

