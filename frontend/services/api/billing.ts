/**
 * 计费管理API服务
 */
import { request } from './base/request';

const BASE_PATH = '/admin/billing';

// 类型定义
export interface AIProvider {
  id: number;
  name: string;
  displayName: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIModel {
  id: number;
  providerId: number;
  modelCode: string;
  modelName: string;
  modelType: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  provider?: AIProvider | {
    id: number;
    name: string;
    displayName: string;
    enabled: boolean;
  };
}

export interface AIModelPricing {
  id: number;
  modelId: number;
  pricingType: string;
  unitPrice: number;
  unit: string;
  minChargeUnit: number;
  effectiveDate: string;
  expiryDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  model?: AIModel;
}

export interface UserTokenQuota {
  id: number;
  userId: number;
  textTokenTotal: number;
  textTokenUsed: number;
  textTokenMonthlyQuota: number;
  textTokenMonthlyUsed: number;
  imageQuotaTotal: number;
  imageQuotaUsed: number;
  imageQuotaMonthly: number;
  imageQuotaMonthlyUsed: number;
  audioQuotaTotal: number;
  audioQuotaUsed: number;
  audioQuotaMonthly: number;
  audioQuotaMonthlyUsed: number;
  videoQuotaTotal: number;
  videoQuotaUsed: number;
  videoQuotaMonthly: number;
  videoQuotaMonthlyUsed: number;
  lastResetDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AIUsageRecord {
  id: number;
  userId: number;
  providerId: number;
  modelId: number;
  usageType: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  imageCount: number;
  audioDuration: number;
  videoDuration: number;
  costAmount: number;
  tokenConsumed: number;
  status: string;
  requestId: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface AICostDaily {
  id: number;
  statDate: string;
  providerId: number;
  modelId: number;
  usageType: string;
  totalUsage: number;
  totalCost: number;
  callCount: number;
  createdAt: string;
}

export interface ProviderResourcePool {
  id: number;
  providerId: number;
  totalBalance: number;
  usedAmount: number;
  availableBalance: number;
  warningThreshold: number;
  isLowBalance: boolean;
  lastRechargeDate: string | null;
  lastCheckDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourcePoolRecharge {
  id: number;
  providerId: number;
  rechargeAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  rechargeType: string;
  operatorId: number | null;
  remark: string | null;
  createdAt: string;
}

export interface BillingAlert {
  id: number;
  providerId: number;
  alertType: string;
  alertLevel: string;
  balancePercentage: number;
  availableBalance: number;
  message: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: number | null;
  createdAt: string;
}

/**
 * 计费管理API
 */
export const billingApi = {
  // 提供商管理
  providers: {
    getAll: (token: string) => {
      return request<AIProvider[]>(`${BASE_PATH}/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getById: (id: number, token: string) => {
      return request<AIProvider>(`${BASE_PATH}/providers/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    create: (data: { name: string; displayName: string; enabled?: boolean }, token: string) => {
      return request<AIProvider>(`${BASE_PATH}/providers`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: { name?: string; displayName?: string; enabled?: boolean }, token: string) => {
      return request<AIProvider>(`${BASE_PATH}/providers/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`${BASE_PATH}/providers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },

  // 模型管理
  models: {
    getAll: (token: string, providerId?: number) => {
      let url = `${BASE_PATH}/models`;
      if (providerId) {
        url += `?providerId=${providerId}`;
      }
      return request<AIModel[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getById: (id: number, token: string) => {
      return request<AIModel>(`${BASE_PATH}/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    create: (data: {
      providerId: number;
      modelCode: string;
      modelName: string;
      modelType: string;
      enabled?: boolean;
    }, token: string) => {
      return request<AIModel>(`${BASE_PATH}/models`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: {
      providerId?: number;
      modelCode?: string;
      modelName?: string;
      modelType?: string;
      enabled?: boolean;
    }, token: string) => {
      return request<AIModel>(`${BASE_PATH}/models/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`${BASE_PATH}/models/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },

  // 资费配置管理
  pricing: {
    getAll: (token: string, modelId?: number) => {
      let url = `${BASE_PATH}/pricing`;
      if (modelId) {
        url += `?modelId=${modelId}`;
      }
      return request<AIModelPricing[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getById: (id: number, token: string) => {
      return request<AIModelPricing>(`${BASE_PATH}/pricing/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    create: (data: {
      modelId: number;
      pricingType: string;
      unitPrice: number;
      unit: string;
      minChargeUnit?: number;
      effectiveDate: string;
      expiryDate?: string | null;
      isActive?: boolean;
    }, token: string) => {
      return request<AIModelPricing>(`${BASE_PATH}/pricing`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    update: (id: number, data: {
      modelId?: number;
      pricingType?: string;
      unitPrice?: number;
      unit?: string;
      minChargeUnit?: number;
      effectiveDate?: string;
      expiryDate?: string | null;
      isActive?: boolean;
    }, token: string) => {
      return request<AIModelPricing>(`${BASE_PATH}/pricing/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    delete: (id: number, token: string) => {
      return request<void>(`${BASE_PATH}/pricing/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },

  // 使用记录查询
  usage: {
    getRecords: (token: string, params?: {
      userId?: number;
      providerId?: number;
      modelId?: number;
      startDate?: string;
      endDate?: string;
      page?: number;
      size?: number;
    }) => {
      let url = `${BASE_PATH}/usage/records`;
      const queryParams = new URLSearchParams();
      if (params?.userId) queryParams.append('userId', params.userId.toString());
      if (params?.providerId) queryParams.append('providerId', params.providerId.toString());
      if (params?.modelId) queryParams.append('modelId', params.modelId.toString());
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      return request<{
        records: AIUsageRecord[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
      }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },

  // 成本统计
  cost: {
    getDailyStats: (token: string, params?: {
      startDate?: string;
      endDate?: string;
      providerId?: number;
      modelId?: number;
    }) => {
      let url = `${BASE_PATH}/cost/daily`;
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.providerId) queryParams.append('providerId', params.providerId.toString());
      if (params?.modelId) queryParams.append('modelId', params.modelId.toString());
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      return request<AICostDaily[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    aggregate: (token: string, params?: {
      date?: string;
      days?: number;
    }) => {
      let url = `${BASE_PATH}/cost/aggregate`;
      const queryParams = new URLSearchParams();
      if (params?.date) queryParams.append('date', params.date);
      if (params?.days) queryParams.append('days', params.days.toString());
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      return request<{ success: boolean; message: string }>(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    aggregateRange: (token: string, startDate: string, endDate: string) => {
      return request<{ success: boolean; message: string }>(`${BASE_PATH}/cost/aggregate/range?startDate=${startDate}&endDate=${endDate}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },

  // 用户配额管理
  quota: {
    getUserQuota: (userId: number, token: string) => {
      return request<UserTokenQuota>(`${BASE_PATH}/quota/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    grantQuota: (userId: number, data: {
      quotaType: string;
      amount: number;
      source: string;
      description?: string;
    }, token: string) => {
      return request<UserTokenQuota>(`${BASE_PATH}/quota/users/${userId}/grant`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
  },

  // 资源池管理
  resourcePool: {
    getAll: (token: string) => {
      return request<ProviderResourcePool[]>(`${BASE_PATH}/resource-pool`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getByProvider: (providerId: number, token: string) => {
      return request<ProviderResourcePool>(`${BASE_PATH}/resource-pool/providers/${providerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    recharge: (providerId: number, data: {
      amount: number;
      remark?: string;
      operatorId?: number;
    }, token: string) => {
      return request<{
        recharge: ResourcePoolRecharge;
        pool: ProviderResourcePool;
      }>(`${BASE_PATH}/resource-pool/providers/${providerId}/recharge`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    getRecharges: (providerId: number, token: string, params?: {
      page?: number;
      size?: number;
    }) => {
      let url = `${BASE_PATH}/resource-pool/providers/${providerId}/recharges`;
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      return request<{
        recharges: ResourcePoolRecharge[];
        totalElements: number;
        totalPages: number;
        currentPage: number;
        pageSize: number;
      }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getAlerts: (token: string, params?: {
      isResolved?: boolean;
      providerId?: number;
    }) => {
      let url = `${BASE_PATH}/resource-pool/alerts`;
      const queryParams = new URLSearchParams();
      if (params?.isResolved !== undefined) queryParams.append('isResolved', params.isResolved.toString());
      if (params?.providerId) queryParams.append('providerId', params.providerId.toString());
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }
      return request<BillingAlert[]>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    resolveAlert: (alertId: number, data?: {
      resolvedBy?: number;
    }, token?: string) => {
      return request<void>(`${BASE_PATH}/resource-pool/alerts/${alertId}/resolve`, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    },
    check: (token: string) => {
      return request<{ message: string }>(`${BASE_PATH}/resource-pool/check`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },
  // 用户使用统计
  statistics: {
    getMyStatistics: (token: string) => {
      return request<UserUsageStatistics>('/api/billing/statistics/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getUserStatistics: (userId: number, token: string) => {
      return request<UserUsageStatistics>(`/api/billing/statistics/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  },
};

// 用户使用统计类型定义
export interface UserUsageStatistics {
  userId: number;
  planName?: string;
  planType?: string;
  currentMonth: string;
  lastResetDate?: string;
  textTokenStats: TokenStats;
  imageStats: ImageStats;
  audioStats: AudioStats;
  videoStats: VideoStats;
}

export interface TokenStats {
  totalQuota: number;
  totalUsed: number;
  totalAvailable: number;
  monthlyQuota: number;
  monthlyUsed: number;
  monthlyActualUsage: number;
  monthlyAvailable: number;
  planMonthlyQuota?: number;
  permanentQuota?: number;
  totalUsageRate?: number;
  monthlyUsageRate?: number;
}

export interface ImageStats {
  totalQuota: number;
  totalUsed: number;
  totalAvailable: number;
  monthlyQuota: number;
  monthlyUsed: number;
  monthlyActualUsage: number;
  monthlyAvailable: number;
  planMonthlyQuota?: number;
  totalUsageRate?: number;
  monthlyUsageRate?: number;
}

export interface AudioStats {
  totalQuota: number;
  totalUsed: number;
  totalAvailable: number;
  monthlyQuota: number;
  monthlyUsed: number;
  monthlyActualUsage: number;
  monthlyAvailable: number;
  planMonthlyQuota?: number;
  totalUsageRate?: number;
  monthlyUsageRate?: number;
}

export interface VideoStats {
  totalQuota: number;
  totalUsed: number;
  totalAvailable: number;
  monthlyQuota: number;
  monthlyUsed: number;
  monthlyActualUsage: number;
  monthlyAvailable: number;
  planMonthlyQuota?: number;
  totalUsageRate?: number;
  monthlyUsageRate?: number;
}

