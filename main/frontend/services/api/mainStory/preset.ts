// 预置主线剧情API（公共API，不需要认证）

import { request } from '../base/request';
import type { SystemMainStory } from './types';

/**
 * 预置主线剧情API
 * 用于普通用户访问系统预置主线剧情（公开接口，不需要认证）
 */
export const presetMainStoryApi = {
  /**
   * 获取所有系统预设主线剧情
   */
  getAll: async (): Promise<SystemMainStory[]> => {
    return request<SystemMainStory[]>('/preset-main-stories', {
      method: 'GET',
    });
  },

  /**
   * 根据场景ID获取系统预设主线剧情
   */
  getByEraId: async (eraId: number): Promise<SystemMainStory | null> => {
    try {
      const result = await request<SystemMainStory>(`/preset-main-stories/era/${eraId}`, {
        method: 'GET',
      });
      return result;
    } catch (error: any) {
      // 如果是 404，返回 null（表示该场景没有主线剧情）
      if (error?.message?.includes('404') || error?.message?.includes('not found') || error?.message?.includes('Not Found')) {
        console.log(`[presetMainStoryApi] 场景 ${eraId} 没有预置主线剧情（404）`);
        return null;
      }
      // 其他错误重新抛出
      throw error;
    }
  },

  /**
   * 根据ID获取系统预设主线剧情
   */
  getById: async (id: number): Promise<SystemMainStory> => {
    return request<SystemMainStory>(`/preset-main-stories/${id}`, {
      method: 'GET',
    });
  },
};

