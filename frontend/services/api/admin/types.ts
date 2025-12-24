// 管理后台API类型定义

/**
 * 管理员登录响应
 */
export interface AdminLoginResponse {
  token: string;
  username: string;
  email: string;
  adminId: number;
}

/**
 * 系统世界
 */
export interface SystemWorld {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统场景
 */
export interface SystemEra {
  id: number;
  name: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统角色
 */
export interface SystemCharacter {
  id: number;
  name: string;
  description: string;
  age: number | null;
  gender: string | null;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  voiceName: string | null;
  mbti: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  relationships: string | null;
  systemEraId: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统主线剧情
 */
export interface SystemMainStory {
  id: number;
  systemEraId: number;
  systemEraName: string | null;
  name: string;
  age: number | null;
  role: string | null;
  bio: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  themeColor: string | null;
  colorAccent: string | null;
  firstMessage: string | null;
  systemInstruction: string | null;
  voiceName: string | null;
  tags: string | null;
  speechStyle: string | null;
  catchphrases: string | null;
  secrets: string | null;
  motivations: string | null;
  isActive: boolean;
  sortOrder: number;
}

/**
 * 邀请码
 */
export interface InviteCode {
  id: number;
  code: string;
  isUsed: boolean;
  usedByUserId: number | null;
  usedAt: string | null;
  expiresAt: string;
  createdByAdminId: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 系统配置类型
 */
export interface WechatConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export interface EmailConfig {
  type: string; // 邮箱类型：163、qq、custom
  host: string;
  port: string;
  username: string;
  password: string;
  from: string;
}

export interface NotionConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  syncButtonEnabled: boolean;
}

export interface WechatPayConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  apiV3Key: string;
  certPath: string;
  notifyUrl: string;
}

export interface AlipayConfig {
  appId: string;
  privateKey: string;
  publicKey: string;
  notifyUrl: string;
  returnUrl: string;
  gatewayUrl: string;
}

/**
 * AI模型配置
 */
export interface AIModelConfig {
  id: number;
  provider: string;
  modelName: string;
  capability: string;
  apiKey: string;
  baseUrl?: string;
  modelParams?: string;
  isDefault: boolean;
  priority: number;
  costPerToken?: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * AI路由策略
 */
export type RoutingStrategyType = 'single' | 'fallback' | 'economy';

export interface FallbackChainItem {
  provider: string;
  model: string;
  priority: number;
}

export interface EconomyConfig {
  enabled: boolean;
  preferredProvider?: string;
  maxCostPerToken?: number;
}

export interface RoutingStrategy {
  id: number;
  capability: string;
  strategyType: RoutingStrategyType;
  config: any;
  isActive: boolean;
  description?: string;
  defaultProvider?: string;
  defaultModel?: string;
  fallbackChain?: FallbackChainItem[];
  economyConfig?: EconomyConfig;
}

/**
 * 系统资源
 */
export interface SystemResource {
  id: number;
  name: string;
  url: string;
  category: string;
  description?: string;
  prompt?: string;
  tags?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

/**
 * 资源匹配更新结果
 */
export interface ResourceMatchResult {
  eraMatchedCount: number;
  characterAvatarMatchedCount: number;
  characterBackgroundMatchedCount: number;
  eraMatched: string[];
  characterMatched: string[];
  eraNotFound: string[];
  characterNotFound: string[];
  totalEras: number;
  totalCharacters: number;
}

/**
 * 用户剧本（管理员视图）
 */
export interface AdminScript {
  id: number;
  title: string;
  description?: string;
  content: string;
  sceneCount: number;
  systemEraId: number | null;
  eraName?: string;
  characterIds?: string;
  tags?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
  originalPrice?: number;
  discountPercent?: number;
  pointsPerMonth: number;
  maxImagesPerMonth?: number;
  maxVideosPerMonth?: number;
  maxTextGenerationsPerMonth?: number;
  maxAudioGenerationsPerMonth?: number;
  allowedAiModels?: string;
  maxImageResolution?: string;
  maxVideoDuration?: number;
  allowPriorityQueue: boolean;
  allowWatermarkRemoval: boolean;
  allowBatchProcessing: boolean;
  allowApiAccess: boolean;
  maxApiCallsPerDay?: number;
  aiBenefits?: string;
  features?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户信息（管理员视图）
 */
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  nickname: string | null;
  avatar: string | null;
  wechatOpenid: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 用户分页响应
 */
export interface UserPageResponse {
  users: AdminUser[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

