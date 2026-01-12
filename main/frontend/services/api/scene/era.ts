// 场景（Era）相关API

import { request } from '../base/request';
import type { SystemEra, UserEra, CreateEraDTO, UpdateEraDTO } from './types';

/**
 * 场景API
 * 包含系统预置场景和用户场景的CRUD操作
 */
export const eraApi = {
  /**
   * 获取所有系统预置场景（公共API，不需要认证）
   */
  getSystemEras: async (): Promise<SystemEra[]> => {
    return request<SystemEra[]>('/preset-eras', {
      method: 'GET',
    });
  },

  /**
   * 获取所有用户场景（需要认证）
   */
  getAllEras: async (token: string): Promise<UserEra[]> => {
    return request<UserEra[]>('/eras', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据世界ID获取用户场景
   */
  getErasByWorldId: async (worldId: number, token: string): Promise<UserEra[]> => {
    return request<UserEra[]>(`/eras/world/${worldId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建用户场景
   */
  createEra: async (data: CreateEraDTO, token: string): Promise<UserEra> => {
    return request<UserEra>('/eras', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新用户场景
   */
  updateEra: async (id: number, data: UpdateEraDTO, token: string): Promise<UserEra> => {
    return request<UserEra>(`/eras/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除用户场景
   */
  deleteEra: async (id: number, token: string): Promise<void> => {
    return request<void>(`/eras/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

