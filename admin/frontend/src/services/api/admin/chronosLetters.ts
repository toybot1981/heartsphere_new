// 管理后台超时空信箱（时间信件）API
import { request } from "../request";

export interface ChronosLetter {
  id: string;
  user: {
    id: number;
    username: string;
    nickname: string | null;
    email: string | null;
  };
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  subject: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  themeColor: string | null;
  type: 'user_feedback' | 'admin_reply' | 'ai_generated';
  parentLetterId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReplyRequest {
  content: string;
}

/**
 * 管理后台超时空信箱API
 */
export const adminChronosLettersApi = {
  /**
   * 获取所有用户反馈（写给管理员的新建）
   * @param token - 管理员token
   */
  getUserFeedbacks: (token: string): Promise<ChronosLetter[]> => {
    return request<ChronosLetter[]>('/chronos-letters/user-feedbacks', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取单个信件详情
   * @param letterId - 信件ID
   * @param token - 管理员token
   */
  getLetterById: (letterId: string, token: string): Promise<ChronosLetter> => {
    return request<ChronosLetter>(`/chronos-letters/${letterId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 管理员回复用户反馈
   * @param letterId - 信件ID
   * @param data - 回复内容
   * @param token - 管理员token
   */
  replyToUserFeedback: (
    letterId: string,
    data: CreateReplyRequest,
    token: string
  ): Promise<ChronosLetter> => {
    return request<ChronosLetter>(`/chronos-letters/${letterId}/reply`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
};
