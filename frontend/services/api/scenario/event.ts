// 剧本事件API

import { request } from '../base/request';
import type { ScenarioEvent, CreateScenarioEventDTO, UpdateScenarioEventDTO } from './types';

/**
 * 剧本事件API
 */
export const scenarioEventApi = {
  /**
   * 获取所有系统预设事件
   */
  getSystemEvents: async (token?: string): Promise<ScenarioEvent[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // 使用 /system/all 避免与 /{id} 路由冲突
    return request<ScenarioEvent[]>('/scenario-events/system/all', {
      method: 'GET',
      headers,
    });
  },

  /**
   * 根据场景ID获取所有事件（包括系统事件和用户自定义事件）
   */
  getEventsByEraId: async (eraId: number, token?: string): Promise<ScenarioEvent[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioEvent[]>(`/scenario-events/era/${eraId}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 获取用户的所有自定义事件
   */
  getMyEvents: async (token: string): Promise<ScenarioEvent[]> => {
    return request<ScenarioEvent[]>('/scenario-events/my', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取事件
   */
  getEventById: async (id: number, token?: string): Promise<ScenarioEvent> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioEvent>(`/scenario-events/${id}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 根据eventId获取事件
   */
  getEventByEventId: async (eventId: string, token?: string): Promise<ScenarioEvent> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioEvent>(`/scenario-events/by-event-id/${eventId}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 创建事件
   */
  createEvent: async (data: CreateScenarioEventDTO, token: string): Promise<ScenarioEvent> => {
    return request<ScenarioEvent>('/scenario-events', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新事件
   */
  updateEvent: async (id: number, data: UpdateScenarioEventDTO, token: string): Promise<ScenarioEvent> => {
    return request<ScenarioEvent>(`/scenario-events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除事件
   */
  deleteEvent: async (id: number, token: string): Promise<void> => {
    return request<void>(`/scenario-events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

