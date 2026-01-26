// 系统主线剧情API
// 注意：此文件已废弃，main 项目不使用系统主线剧情的管理接口
// 如需访问系统主线剧情，请使用 presetMainStoryApi（/api/system/main-stories）

import { request } from '../base/request';
import type { SystemMainStory } from './types';

/**
 * @deprecated 此 API 已废弃
 * main 项目应该使用 presetMainStoryApi 访问系统主线剧情
 * 如需获取系统预设主线剧情，请使用 /api/system/main-stories 路径
 */
export const systemMainStoryApi = {
  /**
   * @deprecated 此方法已废弃
   * 请使用 presetMainStoryApi.getAll() 代替
   */
  getAll: async (token: string): Promise<SystemMainStory[]> => {
    // 改用 main 项目的 API 路径（注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api）
    return request<SystemMainStory[]>('/system/main-stories', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

