// 系统配置管理API
import { request } from '../base/request';
import type {
  WechatConfig,
  EmailConfig,
  NotionConfig,
  WechatPayConfig,
  AlipayConfig,
} from './types';

/**
 * 系统配置管理API
 */
export const adminConfigApi = {
  /**
   * 获取邀请码是否必需
   */
  getInviteCodeRequired: (token: string): Promise<{ inviteCodeRequired: boolean }> => {
    return request<{ inviteCodeRequired: boolean }>(
      '/admin/system/config/invite-code-required',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 设置邀请码是否必需
   */
  setInviteCodeRequired: (
    required: boolean,
    token: string
  ): Promise<{ inviteCodeRequired: boolean }> => {
    return request<{ inviteCodeRequired: boolean }>(
      '/admin/system/config/invite-code-required',
      {
        method: 'PUT',
        body: JSON.stringify({ inviteCodeRequired: required }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 获取邮箱验证是否必需
   */
  getEmailVerificationRequired: (
    token: string
  ): Promise<{ emailVerificationRequired: boolean }> => {
    return request<{ emailVerificationRequired: boolean }>(
      '/admin/system/config/email-verification-required',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 设置邮箱验证是否必需
   */
  setEmailVerificationRequired: (
    required: boolean,
    token: string
  ): Promise<{ emailVerificationRequired: boolean }> => {
    return request<{ emailVerificationRequired: boolean }>(
      '/admin/system/config/email-verification-required',
      {
        method: 'PUT',
        body: JSON.stringify({ emailVerificationRequired: required }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },

  /**
   * 获取微信配置
   */
  getWechatConfig: (token: string): Promise<WechatConfig> => {
    return request<WechatConfig>('/admin/system/config/wechat', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 设置微信配置
   */
  setWechatConfig: (
    config: { appId?: string; appSecret?: string; redirectUri?: string },
    token: string
  ): Promise<WechatConfig> => {
    return request<WechatConfig>('/admin/system/config/wechat', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取邮箱配置
   */
  getEmailConfig: (token: string): Promise<EmailConfig> => {
    return request<EmailConfig>('/admin/system/config/email', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 设置邮箱配置
   */
  setEmailConfig: (
    config: {
      type?: string; // 邮箱类型：163、qq、custom
      host?: string;
      port?: string;
      username?: string;
      password?: string;
      from?: string;
    },
    token: string
  ): Promise<EmailConfig> => {
    return request<EmailConfig>('/admin/system/config/email', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取Notion配置
   */
  getNotionConfig: (token: string): Promise<NotionConfig> => {
    return request<NotionConfig>('/admin/system/config/notion', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 设置Notion配置
   */
  setNotionConfig: (
    config: {
      clientId?: string;
      clientSecret?: string;
      redirectUri?: string;
      syncButtonEnabled?: boolean;
    },
    token: string
  ): Promise<NotionConfig> => {
    return request<NotionConfig>('/admin/system/config/notion', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取微信支付配置
   */
  getWechatPayConfig: (token: string): Promise<WechatPayConfig> => {
    return request<WechatPayConfig>('/admin/system/config/wechat-pay', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 设置微信支付配置
   */
  setWechatPayConfig: (
    config: {
      appId?: string;
      mchId?: string;
      apiKey?: string;
      apiV3Key?: string;
      certPath?: string;
      notifyUrl?: string;
    },
    token: string
  ): Promise<WechatPayConfig> => {
    return request<WechatPayConfig>('/admin/system/config/wechat-pay', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取支付宝配置
   */
  getAlipayConfig: (token: string): Promise<AlipayConfig> => {
    return request<AlipayConfig>('/admin/system/config/alipay', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 设置支付宝配置
   */
  setAlipayConfig: (
    config: {
      appId?: string;
      privateKey?: string;
      publicKey?: string;
      notifyUrl?: string;
      returnUrl?: string;
      gatewayUrl?: string;
    },
    token: string
  ): Promise<AlipayConfig> => {
    return request<AlipayConfig>('/admin/system/config/alipay', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取计费配额拦截开关状态
   */
  getQuotaEnforcement: (token: string): Promise<{ enabled: boolean; description: string }> => {
    return request<{ enabled: boolean; description: string }>(
      '/admin/system/config/billing/quota-enforcement',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * 设置计费配额拦截开关
   */
  setQuotaEnforcement: (
    enabled: boolean,
    token: string
  ): Promise<{ enabled: boolean; message: string }> => {
    return request<{ enabled: boolean; message: string }>(
      '/admin/system/config/billing/quota-enforcement',
      {
        method: 'POST',
        body: JSON.stringify({ enabled }),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  },
};

