// 教育版学生管理API
import { request } from "../../request";
import type { Student } from '../../../../types/edu';

/**
 * 学生列表响应
 */
export interface StudentPageResponse {
  students: Student[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 学生统计响应
 */
export interface StudentStatistics {
  learningRecordsCount: number;
  homeworkSubmittedCount: number;
  scenesCreatedCount: number;
  charactersCreatedCount: number;
  counselingSessionsCount: number;
}

/**
 * 教育版学生管理API
 */
export const adminEduStudentsApi = {
  /**
   * 获取学生列表（分页、搜索）
   * @param token - 管理员token
   * @param page - 页码，从0开始
   * @param size - 每页大小
   * @param search - 可选，搜索关键词（姓名或邮箱）
   * @param ageGroup - 可选，年龄组筛选（1: 6-12岁, 2: 13-18岁）
   * @param school - 可选，学校筛选
   */
  getAll: (
    token: string,
    page: number = 0,
    size: number = 20,
    search?: string,
    ageGroup?: number,
    school?: string
  ): Promise<StudentPageResponse> => {
    let url = `/edu/students?page=${page}&size=${size}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }
    if (ageGroup !== undefined) {
      url += `&ageGroup=${ageGroup}`;
    }
    if (school) {
      url += `&school=${encodeURIComponent(school)}`;
    }
    return request<StudentPageResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取学生详情
   */
  getById: (id: number, token: string): Promise<Student> => {
    return request<Student>(`/edu/students/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 更新学生信息
   */
  update: (
    id: number,
    data: Partial<Student>,
    token: string
  ): Promise<Student> => {
    return request<Student>(`/edu/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新学生账户状态
   */
  updateStatus: (
    id: number,
    isEnabled: boolean,
    token: string
  ): Promise<Student> => {
    return request<Student>(`/edu/students/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isEnabled }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除学生账户
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/edu/students/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取学生学习统计
   */
  getStatistics: (id: number, token: string): Promise<StudentStatistics> => {
    return request<StudentStatistics>(`/edu/students/${id}/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
