// 系统主线剧情API（管理后台接口，需要管理员认证）

import { request } from '../base/request';
import type { SystemMainStory } from './types';

/**
 * 系统主线剧情API
 * 用于管理后台访问系统预置主线剧情（需要管理员认证）
 */
export const systemMainStoryApi = {
  /**
   * 获取所有系统预设主线剧情（管理后台接口）
   */
  getAll: async (token: string): Promise<SystemMainStory[]> => {
    return request<SystemMainStory[]>('/admin/system/main-stories', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

