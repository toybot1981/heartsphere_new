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

  /**
   * 获取配额信息
   * @param token - 用户token
   */
  getQuotaInfo: (token: string): Promise<QuotaInfo> => {
    return request<QuotaInfo>('/membership/quota', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取使用统计
   * @param token - 用户token
   */
  getUsageStats: (token: string): Promise<UsageStats> => {
    return request<UsageStats>('/membership/quota/usage', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取历史使用统计
   * @param startDate - 开始日期
   * @param endDate - 结束日期
   * @param token - 用户token
   */
  getDailyUsage: (
    startDate: string,
    endDate: string,
    token: string
  ): Promise<DailyUsage[]> => {
    return request<DailyUsage[]>(
      `/membership/quota/usage/history?startDate=${startDate}&endDate=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 获取权限信息
   * @param token - 用户token
   */
  getPermissions: (token: string): Promise<PermissionInfo> => {
    return request<PermissionInfo>('/membership/permissions', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取升级价格
   * @param targetPlanId - 目标计划ID
   * @param token - 用户token
   */
  getUpgradePrice: (
    targetPlanId: number,
    token: string
  ): Promise<UpgradePrice> => {
    return request<UpgradePrice>(
      `/membership/upgrade/price?targetPlanId=${targetPlanId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 升级会员
   * @param targetPlanId - 目标计划ID
   * @param token - 用户token
   */
  upgrade: (targetPlanId: number, token: string): Promise<UpgradeResult> => {
    return request<UpgradeResult>('/membership/upgrade', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetPlanId }),
    });
  },

  /**
   * 降级会员
   * @param targetPlanId - 目标计划ID
   * @param token - 用户token
   */
  downgrade: (targetPlanId: number, token: string): Promise<UpgradeResult> => {
    return request<UpgradeResult>('/membership/downgrade', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ targetPlanId }),
    });
  },
};

// 导入类型
import type {
  QuotaInfo,
  UsageStats,
  DailyUsage,
  PermissionInfo,
  UpgradePrice,
  UpgradeResult,
} from './types';