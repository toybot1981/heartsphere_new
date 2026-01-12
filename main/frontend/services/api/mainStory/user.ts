// 用户主线剧情API

import { request } from '../base/request';
import type { UserMainStory, CreateUserMainStoryDTO, UpdateUserMainStoryDTO } from './types';

/**
 * 用户主线剧情API
 * 包含用户主线剧情的CRUD操作
 */
export const userMainStoryApi = {
  /**
   * 获取当前用户的所有主线剧情
   */
  getAll: async (token: string): Promise<UserMainStory[]> => {
    return request<UserMainStory[]>('/user-main-stories', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据场景ID获取当前用户的主线剧情
   */
  getByEraId: async (eraId: number, token: string): Promise<UserMainStory | null> => {
    try {
      return await request<UserMainStory>(`/user-main-stories/era/${eraId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      // 如果是 404，返回 null（表示该场景没有主线剧情）
      if (error?.message?.includes('404') || error?.message?.includes('not found') || error?.message?.includes('Not Found')) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 根据ID获取主线剧情
   */
  getById: async (id: number, token: string): Promise<UserMainStory> => {
    return request<UserMainStory>(`/user-main-stories/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建主线剧情
   */
  create: async (data: CreateUserMainStoryDTO, token: string): Promise<UserMainStory> => {
    // 只传递必要的字段：systemMainStoryId 和 eraId
    const cleanData: {
      systemMainStoryId?: number;
      eraId: number;
      name?: string;
    } = {
      eraId: data.eraId,
    };
    
    // 如果提供了 systemMainStoryId，添加到请求中
    if (data.systemMainStoryId) {
      cleanData.systemMainStoryId = data.systemMainStoryId;
    }
    
    // 如果提供了自定义名称，添加到请求中
    if (data.name) {
      cleanData.name = data.name;
    }
    
    console.log('[API] userMainStoryApi.create - 发送数据（仅ID）:', cleanData);
    return request<UserMainStory>('/user-main-stories', {
      method: 'POST',
      body: JSON.stringify(cleanData),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新主线剧情
   */
  update: async (id: number, data: UpdateUserMainStoryDTO, token: string): Promise<UserMainStory> => {
    // 明确过滤掉不需要的字段（双重保护）
    const { description, mbti, relationships, ...cleanData } = data as any;
    return request<UserMainStory>(`/user-main-stories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cleanData),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除主线剧情
   */
  delete: async (id: number, token: string): Promise<void> => {
    return request<void>(`/user-main-stories/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

