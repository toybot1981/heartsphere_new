/**
 * 计费管理API服务
 * 注意：main 项目只使用用户统计相关的 API（/api/billing），不使用管理后台 API（/admin/billing）
 */
import { request } from './base/request';

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
 * 注意：main 项目只使用用户统计相关的 API（/api/billing），不使用管理后台 API（/admin/billing）
 * 管理后台的功能（providers, models, pricing, cost, quota, resourcePool）已迁移到 admin 项目
 */
export const billingApi = {
  // 用户使用统计
  statistics: {
    getMyStatistics: (token: string) => {
      // 注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api
      return request<UserUsageStatistics>('/billing/statistics/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    getUserStatistics: (userId: number, token: string) => {
      // 注意：不包含 /api，因为 request.ts 中的 API_BASE_URL 已经包含了 /api
      return request<UserUsageStatistics>(`/billing/statistics/users/${userId}`, {
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

