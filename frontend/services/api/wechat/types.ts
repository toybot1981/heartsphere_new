// 微信API类型定义

/**
 * 微信登录二维码响应
 */
export interface WechatQrCodeResponse {
  qrCodeUrl: string;
  state: string;
}

/**
 * 微信登录状态
 */
export type WechatLoginStatus = 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error';

/**
 * 用户世界信息
 */
export interface UserWorld {
  id: number;
  name: string;
  description: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 微信登录状态响应
 */
export interface WechatLoginStatusResponse {
  status: WechatLoginStatus;
  token?: string;
  userId?: number;
  username?: string;
  nickname?: string;
  avatar?: string;
  isFirstLogin?: boolean;
  worlds?: UserWorld[];
  error?: string;
}

/**
 * 微信AppID响应
 */
export interface WechatAppIdResponse {
  appid: string;
}

