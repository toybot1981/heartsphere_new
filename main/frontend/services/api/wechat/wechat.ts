// 微信登录API
import { request } from '../base/request';
import type {
  WechatQrCodeResponse,
  WechatLoginStatusResponse,
  WechatAppIdResponse,
} from './types';

/**
 * 微信登录API
 */
export const wechatApi = {
  /**
   * 获取微信登录二维码URL
   */
  getQrCodeUrl: (): Promise<WechatQrCodeResponse> => {
    return request<WechatQrCodeResponse>('/wechat/qr-code');
  },

  /**
   * 检查登录状态
   * @param state - 登录状态标识
   */
  checkStatus: (state: string): Promise<WechatLoginStatusResponse> => {
    return request<WechatLoginStatusResponse>(`/wechat/status/${state}`);
  },

  /**
   * 获取微信AppID（兼容旧接口）
   */
  getAppId: (): Promise<WechatAppIdResponse> => {
    return request<WechatAppIdResponse>('/wechat/appid');
  },
};

