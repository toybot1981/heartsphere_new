// 系统剧本API（管理后台接口，需要管理员认证）

import { request } from '../base/request';
import type { SystemScript } from './types';

/**
 * 系统剧本API
 * 用于管理后台访问系统预置剧本（需要管理员认证）
 */
export const systemScriptApi = {
  /**
   * 获取所有系统预设剧本（管理后台接口）
   */
  getAll: async (token: string): Promise<SystemScript[]> => {
    return request<SystemScript[]>('/admin/system/scripts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

