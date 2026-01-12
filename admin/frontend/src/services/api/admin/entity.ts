/**
 * 实体API（场景、角色、事件、物品等）
 */
import { request } from "../request";
import type { 
  Era, 
  Character, 
  ScenarioEvent, 
  ScenarioItem, 
  World,
  EntityListResponse 
} from './entityTypes';

export const adminEntityApi = {
  /**
   * 获取场景列表
   */
  getEras: (token: string, page?: number, size?: number): Promise<EntityListResponse<Era>> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<EntityListResponse<Era>>(`/entities/eras${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取角色列表
   */
  getCharacters: (token: string, eraId?: number, page?: number, size?: number): Promise<EntityListResponse<Character>> => {
    const params = new URLSearchParams();
    if (eraId !== undefined) params.append('eraId', eraId.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<EntityListResponse<Character>>(`/entities/characters${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取事件列表
   */
  getEvents: (token: string, eraId?: number, page?: number, size?: number): Promise<EntityListResponse<ScenarioEvent>> => {
    const params = new URLSearchParams();
    if (eraId !== undefined) params.append('eraId', eraId.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<EntityListResponse<ScenarioEvent>>(`/entities/events${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取事件详情
   */
  getEventById: (id: number, token: string): Promise<ScenarioEvent> => {
    return request<ScenarioEvent>(`/entities/events/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建事件
   */
  createEvent: (data: Partial<ScenarioEvent>, token: string): Promise<ScenarioEvent> => {
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
   * 更新事件
   */
  updateEvent: (id: number, data: Partial<ScenarioEvent>, token: string): Promise<ScenarioEvent> => {
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
   * 删除事件
   */
  deleteEvent: (id: number, token: string): Promise<void> => {
    return request<void>(`/entities/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取物品列表
   */
  getItems: (token: string, eraId?: number, page?: number, size?: number): Promise<EntityListResponse<ScenarioItem>> => {
    const params = new URLSearchParams();
    if (eraId !== undefined) params.append('eraId', eraId.toString());
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<EntityListResponse<ScenarioItem>>(`/entities/items${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取物品详情
   */
  getItemById: (id: number, token: string): Promise<ScenarioItem> => {
    return request<ScenarioItem>(`/entities/items/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建物品
   */
  createItem: (data: Partial<ScenarioItem>, token: string): Promise<ScenarioItem> => {
    return request<ScenarioItem>('/entities/items', {
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
  updateItem: (id: number, data: Partial<ScenarioItem>, token: string): Promise<ScenarioItem> => {
    return request<ScenarioItem>(`/entities/items/${id}`, {
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
  deleteItem: (id: number, token: string): Promise<void> => {
    return request<void>(`/entities/items/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取世界列表
   */
  getWorlds: (token: string, page?: number, size?: number): Promise<EntityListResponse<World>> => {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (size !== undefined) params.append('size', size.toString());
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<EntityListResponse<World>>(`/entities/worlds${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
