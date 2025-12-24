// 系统角色管理API
import { request } from '../base/request';
import type { SystemCharacter } from './types';

/**
 * 系统角色管理API
 */
export const adminCharactersApi = {
  /**
   * 获取所有系统角色
   */
  getAll: (token: string): Promise<SystemCharacter[]> => {
    return request<SystemCharacter[]>('/admin/system/characters', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取系统角色
   */
  getById: (id: number, token: string): Promise<SystemCharacter> => {
    return request<SystemCharacter>(`/admin/system/characters/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建系统角色
   */
  create: (data: any, token: string): Promise<SystemCharacter> => {
    return request<SystemCharacter>('/admin/system/characters', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新系统角色
   */
  update: (id: number, data: any, token: string): Promise<SystemCharacter> => {
    return request<SystemCharacter>(`/admin/system/characters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除系统角色
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/characters/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

