// 剧本物品API

import { request } from '../base/request';
import type { ScenarioItem, CreateScenarioItemDTO, UpdateScenarioItemDTO } from './types';

/**
 * 剧本物品API
 */
export const scenarioItemApi = {
  /**
   * 获取所有系统预设物品
   */
  getSystemItems: async (token?: string): Promise<ScenarioItem[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    // 使用 /system/all 避免与 /{id} 路由冲突
    return request<ScenarioItem[]>('/scenario-items/system/all', {
      method: 'GET',
      headers,
    });
  },

  /**
   * 根据场景ID获取所有物品（包括系统物品和用户自定义物品）
   */
  getItemsByEraId: async (eraId: number, token?: string): Promise<ScenarioItem[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioItem[]>(`/scenario-items/era/${eraId}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 根据场景ID和物品类型获取物品
   */
  getItemsByEraIdAndType: async (eraId: number, itemType: string, token?: string): Promise<ScenarioItem[]> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioItem[]>(`/scenario-items/era/${eraId}/type/${itemType}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 获取用户的所有自定义物品
   */
  getMyItems: async (token: string): Promise<ScenarioItem[]> => {
    return request<ScenarioItem[]>('/scenario-items/my', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取物品
   */
  getItemById: async (id: number, token?: string): Promise<ScenarioItem> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioItem>(`/scenario-items/${id}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 根据itemId获取物品
   */
  getItemByItemId: async (itemId: string, token?: string): Promise<ScenarioItem> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return request<ScenarioItem>(`/scenario-items/by-item-id/${itemId}`, {
      method: 'GET',
      headers,
    });
  },

  /**
   * 创建物品
   */
  createItem: async (data: CreateScenarioItemDTO, token: string): Promise<ScenarioItem> => {
    return request<ScenarioItem>('/scenario-items', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新物品
   */
  updateItem: async (id: number, data: UpdateScenarioItemDTO, token: string): Promise<ScenarioItem> => {
    return request<ScenarioItem>(`/scenario-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除物品
   */
  deleteItem: async (id: number, token: string): Promise<void> => {
    return request<void>(`/scenario-items/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

