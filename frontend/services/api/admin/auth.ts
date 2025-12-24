// 管理员认证API
import { request } from '../base/request';
import type { AdminLoginResponse } from './types';

/**
 * 管理员认证API
 */
export const adminAuthApi = {
  /**
   * 管理员登录
   * @param username - 用户名
   * @param password - 密码
   * @returns 登录响应，包含token和管理员信息
   */
  login: (username: string, password: string): Promise<AdminLoginResponse> => {
    return request<AdminLoginResponse>('/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

