// 教育版内容管理API
import { request } from "../../request";
import type { Scene, Character } from '../../../../types/edu';

/**
 * 内容DTO（场景或角色）
 */
export type ContentDTO = Scene | Character;

/**
 * 内容列表响应
 */
export interface ContentPageResponse {
  content: ContentDTO[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 内容统计数据
 */
export interface ContentStatistics {
  totalContent: number;
  pendingReview: number;
  approvedContent: number;
  rejectedContent: number;
}

/**
 * 教育版内容管理API
 */
export const adminEduContentApi = {
  /**
   * 获取内容审核队列（分页、筛选）
   * @param token - 管理员token
   * @param page - 页码，从0开始
   * @param size - 每页大小
   * @param type - 可选，内容类型（scene, character）
   * @param status - 可选，状态筛选（pending, approved, rejected）
   */
  getReviewQueue: (
    token: string,
    page: number = 0,
    size: number = 20,
    type?: string,
    status?: string
  ): Promise<ContentPageResponse> => {
    let url = `/edu/content/review-queue?page=${page}&size=${size}`;
    if (type) {
      url += `&type=${encodeURIComponent(type)}`;
    }
    if (status) {
      url += `&status=${encodeURIComponent(status)}`;
    }
    return request<ContentPageResponse>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 审核通过内容
   */
  approve: (id: number, token: string): Promise<ContentDTO> => {
    return request<ContentDTO>(`/edu/content/${id}/approve`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 审核拒绝内容
   */
  reject: (id: number, reason: string, token: string): Promise<ContentDTO> => {
    return request<ContentDTO>(`/edu/content/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 根据ID获取内容详情
   */
  getById: (id: number, token: string): Promise<ContentDTO> => {
    return request<ContentDTO>(`/edu/content/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 更新内容信息
   */
  update: (
    id: number,
    data: Partial<ContentDTO>,
    token: string
  ): Promise<ContentDTO> => {
    return request<ContentDTO>(`/edu/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除内容
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/edu/content/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取内容统计数据
   */
  getStatistics: (token: string): Promise<ContentStatistics> => {
    return request<ContentStatistics>(`/edu/content/statistics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
