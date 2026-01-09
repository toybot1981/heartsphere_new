// 用户插件API
import { request } from '../base/request';
import type { Plugin, PluginListRequest, PluginListResponse } from '../../admin/pluginTypes';

/**
 * 用户插件API
 */
export const userPluginApi = {
  /**
   * 获取可用插件列表（已发布的插件）
   */
  getAvailablePlugins: (params?: PluginListRequest, token?: string): Promise<PluginListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    if (params?.category) queryParams.append('category', params.category);
    queryParams.append('status', 'ACTIVE');
    queryParams.append('publishStatus', 'PUBLISHED');
    queryParams.append('page', String(params?.page || 0));
    queryParams.append('size', String(params?.size || 20));
    if (params?.sort) queryParams.append('sort', params.sort);

    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<PluginListResponse>(`/plugins?${queryParams.toString()}`, {
      headers,
    });
  },

  /**
   * 根据ID获取插件详情
   */
  getPluginById: (pluginId: string, token?: string): Promise<Plugin> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<Plugin>(`/plugins/${pluginId}`, {
      headers,
    });
  },

  /**
   * 执行插件功能
   */
  executePlugin: (
    pluginId: string,
    options?: {
      sceneId?: string;
      action?: string;
      params?: Record<string, any>;
    },
    token?: string
  ): Promise<any> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const queryParams = new URLSearchParams();
    if (options?.sceneId) queryParams.append('sceneId', options.sceneId);
    if (options?.action) queryParams.append('action', options.action);

    return request<any>(`/plugins/${pluginId}/execute${queryParams.toString() ? '?' + queryParams.toString() : ''}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(options?.params || {}),
    });
  },
};
