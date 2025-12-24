// 系统管理员管理API
import { request } from '../base/request';

export interface SystemAdmin {
  id: number;
  username: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSystemAdminRequest {
  username: string;
  password: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive?: boolean;
}

export interface UpdateSystemAdminRequest {
  email?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN';
  isActive?: boolean;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/**
 * 系统管理员管理API
 */
export const adminSystemAdminsApi = {
  /**
   * 获取所有管理员
   */
  getAll: (token: string): Promise<SystemAdmin[]> => {
    return request<SystemAdmin[]>('/admin/system/admins', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取管理员
   */
  getById: (id: number, token: string): Promise<SystemAdmin> => {
    return request<SystemAdmin>(`/admin/system/admins/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建管理员
   */
  create: (data: CreateSystemAdminRequest, token: string): Promise<SystemAdmin> => {
    return request<SystemAdmin>('/admin/system/admins', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新管理员
   */
  update: (id: number, data: UpdateSystemAdminRequest, token: string): Promise<SystemAdmin> => {
    return request<SystemAdmin>(`/admin/system/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除管理员
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/admins/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 修改密码
   */
  changePassword: (id: number, data: ChangePasswordRequest, token: string): Promise<void> => {
    return request<void>(`/admin/system/admins/${id}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};

