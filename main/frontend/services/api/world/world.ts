// 世界相关API
import { request } from '../base/request';
import type { World } from './types';

/**
 * 世界管理API
 */
export const worldApi = {
  /**
   * 获取所有世界
   * @param token - 用户token
   */
  getAllWorlds: (token: string): Promise<World[]> => {
    return request<World[]>('/worlds', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取单个世界
   * @param id - 世界ID
   * @param token - 用户token
   */
  getWorldById: (id: number, token: string): Promise<World> => {
    return request<World>(`/worlds/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建世界
   * @param name - 世界名称
   * @param description - 世界描述
   * @param token - 用户token
   */
  createWorld: (
    name: string,
    description: string,
    token: string
  ): Promise<World> => {
    return request<World>('/worlds', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 更新世界
   * @param id - 世界ID
   * @param name - 世界名称
   * @param description - 世界描述
   * @param token - 用户token
   */
  updateWorld: (
    id: number,
    name: string,
    description: string,
    token: string
  ): Promise<World> => {
    return request<World>(`/worlds/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 删除世界
   * @param id - 世界ID
   * @param token - 用户token
   */
  deleteWorld: (id: number, token: string): Promise<void> => {
    return request<void>(`/worlds/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

