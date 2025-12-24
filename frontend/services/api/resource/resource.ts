// 资源API - 供普通用户使用（不需要管理员权限）
import { request } from '../base/request';
import type { Resource } from './types';

/**
 * 资源API
 */
export const resourceApi = {
  /**
   * 获取所有资源（按分类筛选）
   * @param token - 用户token
   * @param category - 可选，资源分类
   */
  getAll: (token: string, category?: string): Promise<Resource[]> => {
    const url = category ? `/resources?category=${category}` : '/resources';
    return request<Resource[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取资源详情
   * @param id - 资源ID
   * @param token - 用户token
   */
  getById: (id: number, token: string): Promise<Resource> => {
    return request<Resource>(`/resources/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

