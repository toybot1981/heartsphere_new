// 邮箱验证API
import { request } from '../base/request';
import type {
  EmailVerificationRequest,
  EmailCodeVerificationRequest,
  MessageResponse,
  ConfigCheckResponse,
} from './types';

/**
 * 邮箱验证相关API
 */
export const emailApi = {
  /**
   * 发送邮箱验证码
   * @param email - 邮箱地址
   * @returns 响应消息
   */
  sendVerificationCode: (email: string): Promise<MessageResponse> => {
    return request<MessageResponse>('/auth/email/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 验证邮箱验证码
   * @param email - 邮箱地址
   * @param code - 验证码
   * @returns 响应消息
   */
  verifyCode: (
    email: string,
    code: string
  ): Promise<MessageResponse> => {
    return request<MessageResponse>('/auth/email/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },
};

/**
 * 认证配置检查API
 */
export const authConfigApi = {
  /**
   * 检查是否需要邀请码
   * @returns 配置检查响应
   */
  isInviteCodeRequired: (): Promise<{ inviteCodeRequired: boolean }> => {
    return request<{ inviteCodeRequired: boolean }>(
      '/auth/invite-code-required'
    );
  },

  /**
   * 检查是否需要邮箱验证
   * @returns 配置检查响应
   */
  isEmailVerificationRequired: (): Promise<{
    emailVerificationRequired: boolean;
  }> => {
    return request<{ emailVerificationRequired: boolean }>(
      '/auth/email-verification-required'
    );
  },
};

