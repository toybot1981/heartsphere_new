/**
 * 传送门API类型定义
 */

/**
 * 传送门配置DTO
 */
export interface PortalConfig {
  id: number;
  userId: number;
  sceneId: number;
  portalName: string;
  portalType: 'stargate' | 'wormhole' | 'quantum' | 'garden' | 'sakura' | 'butterfly' | 'rainbow';
  targetHeartsphereId?: number;
  targetShareCode?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  size?: number;
  permissionType: 'public' | 'approval' | 'invite';
  description?: string;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
  // 目标心域信息（从关联查询获取）
  targetHeartsphereName?: string;
  targetOwnerName?: string;
  targetCoverImageUrl?: string;
}

/**
 * 创建传送门请求
 */
export interface CreatePortalRequest {
  sceneId: number;
  portalName: string;
  portalType: 'stargate' | 'wormhole' | 'quantum' | 'garden' | 'sakura' | 'butterfly' | 'rainbow';
  targetHeartsphereId?: number;
  targetShareCode?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  size?: number;
  permissionType?: 'public' | 'approval' | 'invite';
  description?: string;
}

/**
 * 更新传送门请求
 */
export interface UpdatePortalRequest {
  portalName?: string;
  portalType?: 'stargate' | 'wormhole' | 'quantum';
  targetHeartsphereId?: number;
  targetShareCode?: string;
  positionX?: number;
  positionY?: number;
  positionZ?: number;
  size?: number;
  permissionType?: 'public' | 'approval' | 'invite';
  description?: string;
  isActive?: boolean;
}

/**
 * 传送门预览DTO
 */
export interface PortalPreview {
  targetHeartsphereId?: number;
  targetHeartsphereName?: string;
  targetOwnerName?: string;
  targetOwnerAvatar?: string;
  targetCoverImageUrl?: string;
  targetDescription?: string;
  targetCharacterCount?: number;
  targetSceneCount?: number;
  targetAccessPermission?: string;
  canAccess?: boolean;
  cannotAccessReason?: string;
}

/**
 * 传送请求
 */
export interface TeleportationRequest {
  skipAnimation?: boolean;
}

/**
 * 传送结果
 */
export interface TeleportationResult {
  success: boolean;
  targetHeartsphereId?: number;
  targetShareCode?: string;
  durationMs?: number;
  errorMessage?: string;
}

/**
 * 邀请用户请求
 */
export interface InviteUserRequest {
  userId: number;
  message?: string;
}
