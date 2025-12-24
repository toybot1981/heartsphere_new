// 邀请码管理API
import { request } from '../base/request';
import type { InviteCode } from './types';

/**
 * 邀请码管理API
 */
export const adminInviteCodesApi = {
  /**
   * 获取所有邀请码
   */
  getAll: (token: string): Promise<InviteCode[]> => {
    return request<InviteCode[]>('/admin/system/invite-codes', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 生成邀请码
   * @param quantity - 生成数量
   * @param expiresAt - 过期时间
   * @param token - 管理员token
   */
  generate: (
    quantity: number,
    expiresAt: string,
    token: string
  ): Promise<InviteCode[]> => {
    return request<InviteCode[]>('/admin/system/invite-codes/generate', {
      method: 'POST',
      body: JSON.stringify({ quantity, expiresAt }),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};

