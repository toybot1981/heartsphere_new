/**
 * 心域连接模块API服务
 */

import { request } from '../base/request';
import type {
  QuickConnectCharacter,
  Favorite,
  AccessHistory,
  AccessStatistics,
  GetQuickConnectCharactersParams,
  GetQuickConnectCharactersResponse,
  SearchCharactersResponse,
  AddFavoriteRequest,
  ToggleFavoriteRequest,
  FavoriteReorderItem,
  RecordAccessRequest,
} from './types';

/**
 * 获取认证token
 */
const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * 心域连接API
 */
export const quickConnectApi = {
  /**
   * 获取快速连接列表
   */
  getQuickConnectCharacters: async (
    params: GetQuickConnectCharactersParams = {}
  ): Promise<GetQuickConnectCharactersResponse> => {
    console.log('[quickConnectApi] 获取快速连接列表', params);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append('filter', params.filter);
    if (params.sceneId) queryParams.append('sceneId', params.sceneId.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.search) queryParams.append('search', params.search);
    
    const url = `/quick-connect/characters?${queryParams.toString()}`;
    
    return request<GetQuickConnectCharactersResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 搜索E-SOUL
   */
  searchCharacters: async (
    query: string,
    filter?: 'all' | 'favorite' | 'recent',
    limit?: number
  ): Promise<SearchCharactersResponse> => {
    console.log('[quickConnectApi] 搜索E-SOUL', { query, filter, limit });
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const queryParams = new URLSearchParams();
    queryParams.append('query', query);
    if (filter) queryParams.append('filter', filter);
    if (limit) queryParams.append('limit', limit.toString());
    
    const url = `/quick-connect/search?${queryParams.toString()}`;
    
    return request<SearchCharactersResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 添加收藏
   */
  addFavorite: async (request: AddFavoriteRequest): Promise<Favorite> => {
    console.log('[quickConnectApi] 添加收藏', request);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<Favorite>('/favorites', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除收藏
   */
  removeFavorite: async (characterId: number): Promise<void> => {
    console.log('[quickConnectApi] 删除收藏', characterId);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<void>(`/favorites/${characterId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 切换收藏状态
   */
  toggleFavorite: async (request: ToggleFavoriteRequest): Promise<Favorite | null> => {
    console.log('[quickConnectApi] 切换收藏状态', request);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<Favorite | null>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取收藏列表
   */
  getFavorites: async (sortBy?: 'created' | 'sortOrder' | 'access'): Promise<Favorite[]> => {
    console.log('[quickConnectApi] 获取收藏列表', sortBy);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const queryParams = new URLSearchParams();
    if (sortBy) queryParams.append('sortBy', sortBy);
    
    const url = `/favorites?${queryParams.toString()}`;
    
    return request<Favorite[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 检查是否已收藏
   */
  checkFavorite: async (characterId: number): Promise<boolean> => {
    console.log('[quickConnectApi] 检查收藏状态', characterId);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<boolean>(`/favorites/check/${characterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取收藏数量
   */
  getFavoriteCount: async (): Promise<number> => {
    console.log('[quickConnectApi] 获取收藏数量');
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<number>('/favorites/count', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 调整收藏顺序
   */
  reorderFavorites: async (items: FavoriteReorderItem[]): Promise<void> => {
    console.log('[quickConnectApi] 调整收藏顺序', items);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<void>('/favorites/reorder', {
      method: 'PUT',
      body: JSON.stringify(items),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 记录访问历史
   */
  recordAccess: async (request: RecordAccessRequest): Promise<AccessHistory> => {
    console.log('[quickConnectApi] 记录访问历史', request);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<AccessHistory>('/access-history', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取访问历史
   */
  getAccessHistory: async (
    characterId?: number,
    limit?: number
  ): Promise<AccessHistory[]> => {
    console.log('[quickConnectApi] 获取访问历史', { characterId, limit });
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const queryParams = new URLSearchParams();
    if (characterId) queryParams.append('characterId', characterId.toString());
    if (limit) queryParams.append('limit', limit.toString());
    
    const url = `/access-history?${queryParams.toString()}`;
    
    return request<AccessHistory[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取访问统计
   */
  getAccessStatistics: async (characterId: number): Promise<AccessStatistics> => {
    console.log('[quickConnectApi] 获取访问统计', characterId);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    return request<AccessStatistics>(`/access-history/statistics/${characterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取最近访问的角色ID列表
   */
  getRecentCharacterIds: async (limit: number = 10): Promise<number[]> => {
    console.log('[quickConnectApi] 获取最近访问的角色', limit);
    
    const token = getToken();
    if (!token) {
      throw new Error('未登录');
    }
    
    const url = `/access-history/recent?limit=${limit}`;
    
    return request<number[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

