// 会员API类型定义

/**
 * 会员信息
 */
export interface Membership {
  id: number;
  planType: string;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string | null;
  autoRenew: boolean;
  nextRenewalDate: string | null;
  currentPoints: number;
  totalPointsEarned: number;
  totalPointsUsed: number;
}

/**
 * 订阅计划
 */
export interface SubscriptionPlan {
  id: number;
  name: string;
  type: string;
  billingCycle: string;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  pointsPerMonth: number;
  maxImagesPerMonth: number | null;
  maxVideosPerMonth: number | null;
  features: string;
}

/**
 * 配额信息
 */
export interface QuotaInfo {
  userId: number;
  membershipId: number;
  planType: string;
  textTokenQuota: number;
  textTokenUsed: number;
  textTokenAvailable: number;
  imageQuota: number;
  imageUsed: number;
  imageAvailable: number;
  videoQuota: number;
  videoUsed: number;
  videoAvailable: number;
  apiCallQuotaPerDay: number;
  apiCallUsedToday: number;
  apiCallAvailableToday: number;
  quotaResetDate: string | null;
  lastQuotaResetDate: string | null;
  apiCallResetDate: string | null;
}/**
 * 配额使用统计
 */
export interface QuotaUsageStats {
  quotaTotal: number;
  used: number;
  available: number;
  usageRate: number;
}/**
 * 每日使用统计
 */
export interface DailyUsage {
  date: string;
  textTokenUsed: number;
  imageUsed: number;
  videoUsed: number;
  apiCallUsed: number;
}

/**
 * 使用统计
 */
export interface UsageStats {
  userId: number;
  membershipId: number;
  planType: string;
  periodStart: string;
  periodEnd: string;
  textTokenStats: QuotaUsageStats;
  imageStats: QuotaUsageStats;
  videoStats: QuotaUsageStats;
  apiCallStats: QuotaUsageStats;
  dailyUsageList: DailyUsage[];
}

/**
 * 配额成本分解
 */
export interface QuotaCostBreakdown {
  quotaType: string;
  usage: number;
  overageUsage: number;
  overageCost: number;
  unitPrice: number;
}

/**
 * 成本分析
 */
export interface CostAnalysis {
  userId: number;
  periodStart: string;
  periodEnd: string;
  subscriptionCost: number;
  overageCost: number;
  totalCost: number;
  averageDailyCost: number;
  costBreakdown: QuotaCostBreakdown[];
}

/**
 * 权限信息
 */
export interface PermissionInfo {
  userId: number;
  planType: string;
  canUseApi: boolean;
  canUsePriorityQueue: boolean;
  canRemoveWatermark: boolean;
  canBatchProcess: boolean;
  canUseTeamCollaboration: boolean;
  allowedModels: string[];
  maxImageResolution: string | null;
  maxVideoDuration: number | null;
}

/**
 * 升级价格
 */
export interface UpgradePrice {
  targetPlanId: number;
  targetPlanName: string;
  price: number;
  proRatedAmount: number;
  totalPrice: number;
}

/**
 * 升级结果
 */
export interface UpgradeResult {
  success: boolean;
  userId: number;
  fromPlanId: number;
  toPlanId: number;
  operationType: string;
  amount: number;
  remainingValue: number;
  targetPlanPrice: number;
  actualPaymentAmount: number;
  quotaConversionInfo: string;
  membershipId: number;
  membershipStatus: string;
  newEndDate: string | null;
  errorMessage?: string;
}