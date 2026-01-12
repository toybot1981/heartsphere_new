// 认证相关类型定义

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
 * 认证响应
 */
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  isFirstLogin?: boolean;
  worlds?: UserWorld[];
}

/**
 * 登录请求
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
  inviteCode?: string;
  emailVerificationCode?: string;
}

/**
 * 当前用户信息
 */
export interface CurrentUser {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
}

/**
 * 邮箱验证请求
 */
export interface EmailVerificationRequest {
  email: string;
}

/**
 * 邮箱验证码验证请求
 */
export interface EmailCodeVerificationRequest {
  email: string;
  code: string;
}

/**
 * 通用消息响应
 */
export interface MessageResponse {
  message: string;
}

/**
 * 配置检查响应
 */
export interface ConfigCheckResponse {
  inviteCodeRequired?: boolean;
  emailVerificationRequired?: boolean;
}

