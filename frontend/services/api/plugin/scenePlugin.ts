// 场景插件API
import { request } from '../base/request';

export interface ScenePluginDTO {
  id: number;
  pluginInstanceId: number;
  pluginId: string;
  pluginName: string;
  sceneId: string;
  positionX: number;
  positionY: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  config: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AddPluginRequest {
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  config?: Record<string, any>;
}

export interface PositionUpdateRequest {
  positionX: number;
  positionY: number;
  width?: number;
  height?: number;
  zIndex?: number;
}

export interface VisibilityUpdateRequest {
  visible: boolean;
}

/**
 * 场景插件API
 */
export const scenePluginApi = {
  /**
   * 获取场景插件列表
   */
  getScenePlugins: (sceneId: string, token?: string): Promise<ScenePluginDTO[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<ScenePluginDTO[]>(`/scenes/${sceneId}/plugins`, {
      headers,
    });
  },

  /**
   * 添加插件到场景
   */
  addPluginToScene: (
    sceneId: string,
    pluginId: string,
    requestData: AddPluginRequest,
    token?: string
  ): Promise<ScenePluginDTO> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<ScenePluginDTO>(`/scenes/${sceneId}/plugins/${pluginId}/add`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData),
    });
  },

  /**
   * 从场景删除插件
   */
  removePluginFromScene: (sceneId: string, pluginInstanceId: number, token?: string): Promise<void> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<void>(`/scenes/${sceneId}/plugins/${pluginInstanceId}`, {
      method: 'DELETE',
      headers,
    });
  },

  /**
   * 更新插件位置
   */
  updatePluginPosition: (
    sceneId: string,
    pluginInstanceId: number,
    requestData: PositionUpdateRequest,
    token?: string
  ): Promise<void> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<void>(`/scenes/${sceneId}/plugins/${pluginInstanceId}/position`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestData),
    });
  },

  /**
   * 更新插件配置
   */
  updatePluginConfig: (
    sceneId: string,
    pluginInstanceId: number,
    config: Record<string, any>,
    token?: string
  ): Promise<void> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<void>(`/scenes/${sceneId}/plugins/${pluginInstanceId}/config`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ config }),
    });
  },

  /**
   * 切换插件可见性
   */
  togglePluginVisibility: (
    sceneId: string,
    pluginInstanceId: number,
    visible: boolean,
    token?: string
  ): Promise<void> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return request<void>(`/scenes/${sceneId}/plugins/${pluginInstanceId}/visibility`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ visible }),
    });
  },
};
