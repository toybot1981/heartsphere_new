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

