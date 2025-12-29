/**
 * 心域共享API类型定义
 */

/**
 * 共享配置DTO
 */
export interface ShareConfig {
  id: number;
  userId: number;
  shareCode: string;
  shareType: 'all' | 'world' | 'era';
  shareStatus: 'active' | 'paused' | 'closed';
  accessPermission: 'approval' | 'free' | 'invite';
  description?: string;
  coverImageUrl?: string;
  viewCount: number;
  requestCount: number;
  approvedCount: number;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
  scopes?: ShareScope[];
  worldCount?: number;
  eraCount?: number;
  characterCount?: number;
}

/**
 * 共享范围DTO
 */
export interface ShareScope {
  id: number;
  shareConfigId: number;
  scopeType: 'world' | 'era';
  scopeId: number;
  scopeName?: string;
  createdAt: number;
}

/**
 * 创建共享配置请求
 */
export interface CreateShareConfigRequest {
  shareType: 'all' | 'world' | 'era';
  accessPermission: 'approval' | 'free' | 'invite';
  description?: string;
  coverImageUrl?: string;
  scopes?: ShareScopeItem[];
  expiresAt?: number;
}

/**
 * 共享范围项
 */
export interface ShareScopeItem {
  scopeType: 'world' | 'era';
  scopeId: number;
}

/**
 * 更新共享配置请求
 */
export interface UpdateShareConfigRequest {
  shareType?: 'all' | 'world' | 'era';
  shareStatus?: 'active' | 'paused' | 'closed';
  accessPermission?: 'approval' | 'free' | 'invite';
  description?: string;
  coverImageUrl?: string;
  scopes?: ShareScopeItem[];
  expiresAt?: number;
}

/**
 * 连接请求DTO
 */
export interface ConnectionRequest {
  id: number;
  shareConfigId: number;
  requesterId: number;
  requesterName?: string;
  requesterAvatar?: string;
  requestStatus: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestMessage?: string;
  responseMessage?: string;
  requestedAt: number;
  respondedAt?: number;
  expiresAt?: number;
  shareConfig?: ShareConfig;
}

/**
 * 创建连接请求请求
 */
export interface CreateConnectionRequestRequest {
  shareCode: string;
  requestMessage?: string;
}

/**
 * 响应连接请求请求
 */
export interface ResponseConnectionRequestRequest {
  action: 'approve' | 'reject';
  responseMessage?: string;
}

/**
 * 共享心域DTO（用于发现页面）
 */
export interface SharedHeartSphere {
  shareConfigId: number;
  shareCode: string;
  ownerId: number;
  ownerName?: string;
  ownerAvatar?: string;
  heartSphereName?: string;
  description?: string;
  coverImageUrl?: string;
  shareType: 'all' | 'world' | 'era';
  accessPermission: 'approval' | 'free' | 'invite';
  viewCount: number;
  requestCount: number;
  approvedCount: number;
  worldCount?: number;
  eraCount?: number;
  characterCount?: number;
  requestStatus?: 'pending' | 'approved' | 'rejected';
  requestedAt?: number;
}

