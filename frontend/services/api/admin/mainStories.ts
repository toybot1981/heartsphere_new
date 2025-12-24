// 系统主线剧情管理API
import { request } from '../base/request';
import type { SystemMainStory } from './types';

/**
 * 系统主线剧情管理API
 */
export const adminMainStoriesApi = {
  /**
   * 获取所有系统主线剧情
   */
  getAll: (token: string): Promise<SystemMainStory[]> => {
    return request<SystemMainStory[]>('/admin/system/main-stories', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取系统主线剧情
   */
  getById: (id: number, token: string): Promise<SystemMainStory> => {
    return request<SystemMainStory>(`/admin/system/main-stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据场景ID获取系统主线剧情
   */
  getByEraId: (eraId: number, token: string): Promise<SystemMainStory> => {
    return request<SystemMainStory>(`/admin/system/main-stories/era/${eraId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建系统主线剧情
   */
  create: (data: any, token: string): Promise<SystemMainStory> => {
    return request<SystemMainStory>('/admin/system/main-stories', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新系统主线剧情
   */
  update: (id: number, data: any, token: string): Promise<SystemMainStory> => {
    return request<SystemMainStory>(`/admin/system/main-stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除系统主线剧情
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/main-stories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

