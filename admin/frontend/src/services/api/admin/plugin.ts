// 插件管理API（管理员专用）
import { request } from "../request";
import type { Plugin, PluginListRequest, PluginListResponse, PluginConfigRequest, PluginPreview } from './pluginTypes';

/**
 * 插件管理API（管理员专用）
 */
export const adminPluginApi = {
  /**
   * 获取插件列表
   */
  getList: (params: PluginListRequest, token: string): Promise<PluginListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    queryParams.append('page', String(params.page || 0));
    queryParams.append('size', String(params.size || 20));
    if (params.sort) queryParams.append('sort', params.sort);

    return request<PluginListResponse>(`/plugins?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取插件详情
   */
  getById: (pluginId: string, token: string): Promise<Plugin> => {
    return request<Plugin>(`/plugins/${pluginId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 启用插件
   */
  enable: (pluginId: string, token: string): Promise<void> => {
    return request<void>(`/plugins/${pluginId}/enable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 禁用插件
   */
  disable: (pluginId: string, force: boolean, token: string): Promise<void> => {
    return request<void>(`/plugins/${pluginId}/disable?force=${force}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 更新插件配置
   */
  updateConfig: (pluginId: string, config: PluginConfigRequest, token: string): Promise<void> => {
    return request<void>(`/plugins/${pluginId}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取插件预览信息
   */
  getPreview: (pluginId: string, token: string): Promise<PluginPreview> => {
    return request<PluginPreview>(`/plugins/${pluginId}/preview`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 发布插件
   */
  publish: (pluginId: string, publishNote: string | undefined, token: string): Promise<void> => {
    return request<void>(`/plugins/${pluginId}/publish`, {
      method: 'POST',
      body: JSON.stringify({ publishNote: publishNote || '' }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 取消发布插件
   */
  unpublish: (pluginId: string, token: string): Promise<void> => {
    return request<void>(`/plugins/${pluginId}/unpublish`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
