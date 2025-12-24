// 认证API
import { request } from '../base/request';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  CurrentUser,
} from './types';

/**
 * 认证相关API
 */
export const authApi = {
  /**
   * 用户登录
   * @param username - 用户名
   * @param password - 密码
   * @returns 认证响应，包含token和用户信息
   */
  login: (username: string, password: string): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * 用户注册
   * @param username - 用户名
   * @param email - 邮箱
   * @param password - 密码
   * @param nickname - 昵称（可选）
   * @param inviteCode - 邀请码（可选）
   * @param emailVerificationCode - 邮箱验证码（可选）
   * @returns 认证响应，包含token和用户信息
   */
  register: (
    username: string,
    email: string,
    password: string,
    nickname?: string,
    inviteCode?: string,
    emailVerificationCode?: string
  ): Promise<AuthResponse> => {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        password,
        nickname: nickname || username,
        inviteCode,
        emailVerificationCode,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取当前用户信息
   * @param token - 认证token
   * @returns 当前用户信息
   */
  getCurrentUser: (token: string): Promise<CurrentUser> => {
    return request<CurrentUser>('/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

