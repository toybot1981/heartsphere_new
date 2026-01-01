// API Key管理API
import { request } from '../base/request';

export interface ApiKey {
  id: number;
  keyName: string;
  apiKey: string; // 完整Key仅在创建时返回
  userId?: number;
  isActive: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  rateLimit?: number;
  description?: string;
  createdByAdminId?: number;
  createdAt: string;
  updatedAt: string;
  isExpired?: boolean;
}

export interface CreateApiKeyRequest {
  keyName: string;
  userId?: number;
  expiresAt?: string;
  rateLimit?: number;
  description?: string;
}

/**
 * API Key管理API
 */
export const apiKeysApi = {
  /**
   * 获取所有API Key
   */
  getAll: (token: string): Promise<ApiKey[]> => {
    return request<ApiKey[]>('/admin/api-keys', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取API Key
   */
  getById: (id: number, token: string): Promise<ApiKey> => {
    return request<ApiKey>(`/admin/api-keys/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建API Key
   */
  create: (data: CreateApiKeyRequest, token: string): Promise<ApiKey> => {
    return request<ApiKey>('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 启用/禁用API Key
   */
  toggle: (id: number, isActive: boolean, token: string): Promise<ApiKey> => {
    return request<ApiKey>(`/admin/api-keys/${id}/toggle?isActive=${isActive}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 删除API Key
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/api-keys/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};




