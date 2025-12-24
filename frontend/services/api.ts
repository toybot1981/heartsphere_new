// API服务，用于处理与后端的通信
// 注意：此文件正在逐步迁移到模块化结构（services/api/）
// 新的API模块位于 services/api/ 目录下

// 从新模块导入API（已完成迁移）
// 场景模块
export { eraApi } from './api/scene';
export type { SystemEra, UserEra, CreateEraDTO, UpdateEraDTO } from './api/scene/types';

// 角色模块
export { characterApi } from './api/character';
export type { SystemCharacter, UserCharacter, CreateCharacterDTO, UpdateCharacterDTO } from './api/character/types';

// 剧本模块
export { scriptApi, presetScriptApi, systemScriptApi } from './api/script';
export type { UserScript, SystemScript, CreateScriptDTO, UpdateScriptDTO } from './api/script/types';

// 主线剧情模块
export { userMainStoryApi, presetMainStoryApi, systemMainStoryApi } from './api/mainStory';
export type { UserMainStory, SystemMainStory, CreateUserMainStoryDTO, UpdateUserMainStoryDTO } from './api/mainStory/types';

// 导出计费管理API
export { billingApi } from './api/billing';
export type { 
  AIProvider, 
  AIModel, 
  AIModelPricing, 
  UserTokenQuota, 
  AIUsageRecord, 
  AICostDaily 
} from './api/billing';

// 认证模块（已迁移）
export { authApi, emailApi, authConfigApi } from './api/auth';
export type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  CurrentUser,
  UserWorld,
  EmailVerificationRequest,
  EmailCodeVerificationRequest,
  MessageResponse,
  ConfigCheckResponse,
} from './api/auth/types';

// 管理后台模块（已迁移）
export { adminApi } from './api/admin';
export type {
  AdminLoginResponse,
  SystemWorld,
  // 注意：SystemEra, SystemCharacter, SystemMainStory 已在其他模块导出，这里不再重复导出
  InviteCode,
  WechatConfig,
  EmailConfig,
  NotionConfig,
  WechatPayConfig,
  AlipayConfig,
  AIModelConfig,
  RoutingStrategy,
  RoutingStrategyType,
  SystemResource,
  ResourceMatchResult,
  AdminScript,
  SubscriptionPlan,
  AdminUser,
  UserPageResponse,
} from './api/admin/types';

// 微信模块（已迁移）
export { wechatApi } from './api/wechat';
export type {
  WechatQrCodeResponse,
  WechatLoginStatus,
  WechatLoginStatusResponse,
  WechatAppIdResponse,
} from './api/wechat/types';

// 支付模块（已迁移）
export { paymentApi } from './api/payment';
export type {
  PaymentType,
  PaymentOrderStatus,
  CreatePaymentOrderResponse,
  PaymentOrder,
} from './api/payment/types';

// 用户模块（已迁移）
export { userProfileApi } from './api/user';
export type { UserProfile } from './api/user/types';

// 资源模块（已迁移）
export { resourceApi } from './api/resource';
export type { Resource } from './api/resource/types';

// 会员模块（已迁移）
export { membershipApi } from './api/membership';
export type { Membership, SubscriptionPlan as MembershipPlan } from './api/membership/types';

// 世界模块（已迁移）
export { worldApi } from './api/world';
export type { World } from './api/world/types';

// 图片模块（已迁移）
export { imageApi } from './api/image';
export type {
  ProxyDownloadResponse,
  ImageUploadResponse,
  ImageDeleteResponse,
} from './api/image/types';

// 回收站模块（已迁移）
export { recycleBinApi } from './api/recycleBin';
export type { RecycleBinData } from './api/recycleBin/types';

// 同步模块（已迁移）
export { noteSyncApi } from './api/sync';
export type {
  NotionAuthUrlResponse,
  NoteSync,
  SyncStatus,
  SyncResult,
  Note,
} from './api/sync/types';

// 跨时空信箱模块（已迁移）
export { chronosLetterApi } from './api/chronosLetter';
export type {
  ChronosLetter,
  UnreadLetterCount,
  CreateUserFeedbackRequest,
} from './api/chronosLetter/types';

// 日记模块（已迁移）
export { journalApi } from './api/journal';
export type {
  JournalEntry,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
} from './api/journal/types';

// 导出基础请求函数（向后兼容）
export { request } from './api/base/request';
export type { RequestOptions } from './api/base/request';

// 导出Token存储工具（向后兼容）
export { tokenStorage, getToken, saveToken, removeToken } from './api/base/tokenStorage';

// 注意：所有API模块已迁移到 services/api/ 目录下
// 主文件现在仅作为统一导出入口，保持向后兼容

