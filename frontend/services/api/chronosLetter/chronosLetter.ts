// 跨时空信箱API（时间信件API）
// 注意：与EmailService（真实邮件发送）区分开
import { request } from '../base/request';
import type {
  ChronosLetter,
  UnreadLetterCount,
  CreateUserFeedbackRequest,
} from './types';

/**
 * 跨时空信箱API
 */
export const chronosLetterApi = {
  /**
   * 获取所有信件
   * @param token - 用户token
   */
  getAllLetters: (token: string): Promise<ChronosLetter[]> => {
    return request<ChronosLetter[]>('/chronos-letters', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取未读信件数量
   * @param token - 用户token
   */
  getUnreadLetterCount: (token: string): Promise<UnreadLetterCount> => {
    return request<UnreadLetterCount>('/chronos-letters/unread/count', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取未读信件
   * @param token - 用户token
   */
  getUnreadLetters: (token: string): Promise<ChronosLetter[]> => {
    return request<ChronosLetter[]>('/chronos-letters/unread', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取单个信件
   * @param id - 信件ID
   * @param token - 用户token
   */
  getLetterById: (id: string, token: string): Promise<ChronosLetter> => {
    return request<ChronosLetter>(`/chronos-letters/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建用户反馈信件
   * @param data - 信件数据
   * @param token - 用户token
   */
  createUserFeedback: (
    data: CreateUserFeedbackRequest,
    token: string
  ): Promise<ChronosLetter> => {
    return request<ChronosLetter>('/chronos-letters', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * 标记信件为已读
   * @param id - 信件ID
   * @param token - 用户token
   */
  markAsRead: (id: string, token: string): Promise<ChronosLetter> => {
    return request<ChronosLetter>(`/chronos-letters/${id}/read`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 删除信件
   * @param id - 信件ID
   * @param token - 用户token
   */
  deleteLetter: (id: string, token: string): Promise<{ message: string }> => {
    return request<{ message: string }>(`/chronos-letters/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取信件的回复
   * @param id - 信件ID
   * @param token - 用户token
   */
  getLetterReplies: (id: string, token: string): Promise<ChronosLetter[]> => {
    return request<ChronosLetter[]>(`/chronos-letters/${id}/replies`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};

