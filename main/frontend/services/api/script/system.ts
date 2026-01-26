// 系统剧本API
// 注意：此文件已废弃，main 项目不使用系统剧本的管理接口
// 如需访问系统剧本，请使用 presetScriptApi（/api/system/scripts）

import { request } from '../base/request';
import type { SystemScript } from './types';

/**
 * @deprecated 此 API 已废弃
 * main 项目应该使用 presetScriptApi 访问系统剧本
 * 如需获取系统预设剧本，请使用 /api/system/scripts 路径
 */
export const systemScriptApi = {
  /**
   * @deprecated 此方法已废弃
   * 请使用 presetScriptApi.getAll() 代替
   */
  getAll: async (token: string): Promise<SystemScript[]> => {
    // 改用 main 项目的 API 路径（注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api）
    return request<SystemScript[]>('/system/scripts', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

