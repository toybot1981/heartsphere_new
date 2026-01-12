// Admin API 统一导出

// 导入 admin API 模块
export * from './admin';

// 导出 adminApi 对象
export { adminApi, adminEntityApi, adminDashboardApi } from './admin';
export type { Entity, EntityListResponse, ScenarioEvent, Era, Character, ScenarioItem, World } from './admin';

// 导出其他 API
export { imageApi, type ImageUploadResponse, type ImageVariants } from './image';
export { videoApi, type VideoUploadResponse } from './video';
export { billingApi } from './billing';
export type {
  AIProvider,
  AIModel,
  AIModelPricing,
  UserTokenQuota,
  AIUsageRecord,
  AICostDaily,
  ProviderResourcePool,
  ResourcePoolRecharge,
  BillingAlert,
  UserUsageStatistics,
  TokenStats,
  ImageStats,
  AudioStats,
  VideoStats,
} from './billing';
