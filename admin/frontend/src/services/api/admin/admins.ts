// 系统管理员管理API
import { request } from "../request";

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
  getAll: async (token: string): Promise<SystemAdmin[]> => {
    const response = await request<{ code: number; message: string; data: SystemAdmin[] }>('/system/admins', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // 适配后端包装格式 { code, data, message }
    if (response && 'data' in response && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    return [];
  },

  /**
   * 根据ID获取管理员
   */
  getById: async (id: number, token: string): Promise<SystemAdmin> => {
    const response = await request<{ code: number; message: string; data: SystemAdmin }>(`/system/admins/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // 适配后端包装格式 { code, data, message }
    if (response && 'data' in response) {
      return response.data;
    }
    return response as SystemAdmin;
  },

  /**
   * 创建管理员
   */
  create: async (data: CreateSystemAdminRequest, token: string): Promise<SystemAdmin> => {
    const response = await request<{ code: number; message: string; data: SystemAdmin }>('/system/admins', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    // 适配后端包装格式 { code, data, message }
    if (response && 'data' in response) {
      return response.data;
    }
    return response as SystemAdmin;
  },

  /**
   * 更新管理员
   */
  update: async (id: number, data: UpdateSystemAdminRequest, token: string): Promise<SystemAdmin> => {
    const response = await request<{ code: number; message: string; data: SystemAdmin }>(`/system/admins/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    // 适配后端包装格式 { code, data, message }
    if (response && 'data' in response) {
      return response.data;
    }
    return response as SystemAdmin;
  },

  /**
   * 删除管理员
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/system/admins/${id}`, {
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
    return request<void>(`/system/admins/${id}/change-password`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};




