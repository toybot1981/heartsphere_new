// 用户资料API
import { request } from '../base/request';
import type { UserProfile } from './types';

/**
 * 用户资料API
 */
export const userProfileApi = {
  /**
   * 更新用户昵称
   * @param token - 用户token
   * @param nickname - 新昵称
   */
  updateNickname: (token: string, nickname: string): Promise<UserProfile> => {
    return request<UserProfile>('/user/profile/nickname', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nickname }),
    });
  },

  /**
   * 更新用户头像
   * @param token - 用户token
   * @param avatar - 新头像URL
   */
  updateAvatar: (token: string, avatar: string): Promise<UserProfile> => {
    return request<UserProfile>('/user/profile/avatar', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatar }),
    });
  },

  /**
   * 获取用户资料
   * @param token - 用户token
   */
  getProfile: (token: string): Promise<UserProfile> => {
    return request<UserProfile>('/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

