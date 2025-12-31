// 用户管理API
import { request } from '../base/request';
import type { AdminUser, UserPageResponse } from './types';

/**
 * 用户管理API
 */
export const adminUsersApi = {
  /**
   * 获取所有用户（分页）
   * @param token - 管理员token
   * @param page - 页码，从0开始
   * @param size - 每页大小
   * @param search - 可选，搜索关键词
   */
  getAll: (
    token: string,
    page: number = 0,
    size: number = 20,
    search?: string
  ): Promise<UserPageResponse> => {
    let url = `/admin/users?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    return request<UserPageResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取用户
   */
  getById: (id: number, token: string): Promise<AdminUser> => {
    return request<AdminUser>(`/admin/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 更新用户状态
   */
  updateStatus: (
    id: number,
    isEnabled: boolean,
    token: string
  ): Promise<AdminUser> => {
    return request<AdminUser>(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isEnabled }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新用户信息
   */
  update: (
    id: number,
    data: { nickname?: string; avatar?: string },
    token: string
  ): Promise<AdminUser> => {
    return request<AdminUser>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除用户
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/users/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 强制删除用户（先清空所有关联数据，再删除用户）
   */
  forceDelete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/users/${id}/force`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

