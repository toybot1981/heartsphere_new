// 会员相关API
import { request } from '../base/request';
import type { Membership, SubscriptionPlan } from './types';

/**
 * 会员相关API
 */
export const membershipApi = {
  /**
   * 获取当前用户的会员信息
   * @param token - 用户token
   */
  getCurrent: (token: string): Promise<Membership> => {
    return request<Membership>('/membership/current', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取所有订阅计划
   * @param billingCycle - 可选，计费周期
   * @param token - 可选，用户token
   */
  getPlans: (
    billingCycle?: string,
    token?: string
  ): Promise<SubscriptionPlan[]> => {
    const url = billingCycle
      ? `/membership/plans?billingCycle=${billingCycle}`
      : '/membership/plans';
    return request<SubscriptionPlan[]>(url, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : undefined,
    });
  },
};

