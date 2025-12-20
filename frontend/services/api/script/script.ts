// 用户剧本API

import { request } from '../base/request';
import type { UserScript, CreateScriptDTO, UpdateScriptDTO } from './types';

/**
 * 用户剧本API
 * 包含用户剧本的CRUD操作
 */
export const scriptApi = {
  /**
   * 获取所有用户剧本
   */
  getAllScripts: async (token: string): Promise<UserScript[]> => {
    return request<UserScript[]>('/scripts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据世界ID获取用户剧本
   */
  getScriptsByWorldId: async (worldId: number, token: string): Promise<UserScript[]> => {
    return request<UserScript[]>(`/scripts/world/${worldId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据场景ID获取用户剧本
   */
  getScriptsByEraId: async (eraId: number, token: string): Promise<UserScript[]> => {
    return request<UserScript[]>(`/scripts/era/${eraId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建用户剧本
   */
  createScript: async (data: CreateScriptDTO, token: string): Promise<UserScript> => {
    return request<UserScript>('/scripts', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新用户剧本
   */
  updateScript: async (id: number, data: UpdateScriptDTO, token: string): Promise<UserScript> => {
    return request<UserScript>(`/scripts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除用户剧本
   */
  deleteScript: async (id: number, token: string): Promise<void> => {
    return request<void>(`/scripts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

