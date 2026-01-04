/**
 * 实体API（场景、角色、事件、物品等）
 */
import { request } from '../base/request';
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
    return request<EntityListResponse<Era>>(`/admin/entities/eras${query}`, {
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
    return request<EntityListResponse<Character>>(`/admin/entities/characters${query}`, {
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
    return request<EntityListResponse<ScenarioEvent>>(`/admin/entities/events${query}`, {
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
    return request<EntityListResponse<ScenarioItem>>(`/admin/entities/items${query}`, {
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
    return request<EntityListResponse<World>>(`/admin/entities/worlds${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
