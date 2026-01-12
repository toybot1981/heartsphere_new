/**
 * 场景事件 API 服务 - Admin 版本
 */
import { request } from './request';

/**
 * 场景事件
 */
export interface ScenarioEvent {
  id: number;
  name: string;
  eventId: string;
  description?: string;
  eraId?: number;
  systemEraId?: number;
  userId?: number;
  isSystem?: boolean;
  iconUrl?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 创建场景事件 DTO
 */
export interface CreateScenarioEventDTO {
  name: string;
  eventId: string;
  description?: string;
  eraId?: number;
  systemEraId?: number;
  iconUrl?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * 更新场景事件 DTO
 */
export interface UpdateScenarioEventDTO {
  name?: string;
  description?: string;
  eraId?: number;
  systemEraId?: number;
  iconUrl?: string;
  tags?: string;
  sortOrder?: number;
  isActive?: boolean;
}

/**
 * 场景事件 API
 */
export const scenarioEventApi = {
  /**
   * 获取所有场景事件
   */
  getAll: (token: string, eraId?: number): Promise<ScenarioEvent[]> => {
    let url = '/entities/events';
    if (eraId) {
      url += `?eraId=${eraId}`;
    }
    return request<ScenarioEvent[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据 ID 获取场景事件
   */
  getById: (id: number, token: string): Promise<ScenarioEvent> => {
    return request<ScenarioEvent>(`/entities/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建场景事件
   */
  create: (data: CreateScenarioEventDTO, token: string): Promise<ScenarioEvent> => {
    return request<ScenarioEvent>('/entities/events', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新场景事件
   */
  update: (id: number, data: UpdateScenarioEventDTO, token: string): Promise<ScenarioEvent> => {
    return request<ScenarioEvent>(`/entities/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除场景事件
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/entities/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
