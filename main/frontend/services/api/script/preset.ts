// 预置剧本API（公共API，不需要认证）

import { request } from '../base/request';
import type { SystemScript } from './types';

/**
 * 预置剧本API
 * 用于普通用户访问系统预置剧本（公开接口，不需要认证）
 */
export const presetScriptApi = {
  /**
   * 获取所有系统预置剧本
   */
  getAll: async (): Promise<SystemScript[]> => {
    return request<SystemScript[]>('/preset-scripts', {
      method: 'GET',
    });
  },

  /**
   * 根据场景ID获取系统预置剧本
   */
  getByEraId: async (eraId: number): Promise<SystemScript[]> => {
    return request<SystemScript[]>(`/preset-scripts/era/${eraId}`, {
      method: 'GET',
    });
  },

  /**
   * 根据ID获取系统预置剧本
   */
  getById: async (id: number): Promise<SystemScript> => {
    return request<SystemScript>(`/preset-scripts/${id}`, {
      method: 'GET',
    });
  },
};

