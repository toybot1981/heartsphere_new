// 订阅计划管理API
import { request } from '../base/request';
import type { SubscriptionPlan } from './types';

/**
 * 订阅计划管理API
 */
export const adminSubscriptionPlansApi = {
  /**
   * 获取所有订阅计划
   * 注意：如果端点未实现（404），会静默返回空数组
   */
  getAll: async (token: string): Promise<SubscriptionPlan[]> => {
    try {
      return await request<SubscriptionPlan[]>('/admin/system/subscription-plans', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err: any) {
      // 如果是404错误，说明端点未实现，静默返回空数组
      const errorMessage = err?.message || err?.toString() || '';
      if (errorMessage.includes('Not Found') || errorMessage.includes('404')) {
        // 静默处理，不输出错误日志
        return [];
      }
      // 其他错误也返回空数组，避免阻塞其他数据加载
      console.warn('[API] 订阅计划加载失败:', errorMessage);
      return [];
    }
  },

  /**
   * 根据ID获取订阅计划
   */
  getById: (id: number, token: string): Promise<SubscriptionPlan> => {
    return request<SubscriptionPlan>(`/admin/system/subscription-plans/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建订阅计划
   */
  create: (data: any, token: string): Promise<SubscriptionPlan> => {
    return request<SubscriptionPlan>('/admin/system/subscription-plans', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新订阅计划
   */
  update: (id: number, data: any, token: string): Promise<SubscriptionPlan> => {
    return request<SubscriptionPlan>(`/admin/system/subscription-plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除订阅计划
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/admin/system/subscription-plans/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

