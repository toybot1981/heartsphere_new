// 教育版教师管理API
import { request } from "../../request";
import type { Teacher } from '../../../../types/edu';

/**
 * 教师列表响应
 */
export interface TeacherPageResponse {
  teachers: Teacher[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 教育版教师管理API
 */
export const adminEduTeachersApi = {
  /**
   * 获取教师列表（分页、搜索）
   * @param token - 管理员token
   * @param page - 页码，从0开始
   * @param size - 每页大小
   * @param search - 可选，搜索关键词（姓名或邮箱）
   * @param status - 可选，状态筛选（all, pending, approved）
   */
  getAll: (
    token: string,
    page: number = 0,
    size: number = 20,
    search?: string,
    status?: string
  ): Promise<TeacherPageResponse> => {
    let url = `/edu/teachers?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    return request<TeacherPageResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取教师详情
   */
  getById: (id: number, token: string): Promise<Teacher> => {
    return request<Teacher>(`/edu/teachers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 审核通过教师申请
   */
  approve: (id: number, token: string): Promise<Teacher> => {
    return request<Teacher>(`/edu/teachers/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 拒绝教师申请
   */
  reject: (id: number, reason: string, token: string): Promise<Teacher> => {
    return request<Teacher>(`/edu/teachers/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新教师信息
   */
  update: (
    id: number,
    data: Partial<Teacher>,
    token: string
  ): Promise<Teacher> => {
    return request<Teacher>(`/edu/teachers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新教师权限
   */
  updatePermissions: (
    id: number,
    permissions: Record<string, any>,
    token: string
  ): Promise<Teacher> => {
    return request<Teacher>(`/edu/teachers/${id}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify(permissions),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新教师账户状态
   */
  updateStatus: (
    id: number,
    isEnabled: boolean,
    token: string
  ): Promise<Teacher> => {
    return request<Teacher>(`/edu/teachers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};
