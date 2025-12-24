// 跨时空信箱API（时间信件API）类型定义

/**
 * 信件信息
 */
export interface ChronosLetter {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string;
  subject: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  themeColor: string;
  type: string;
  parentLetterId?: string;
}

/**
 * 未读信件数量
 */
export interface UnreadLetterCount {
  count: number;
}

/**
 * 创建用户反馈信件请求
 */
export interface CreateUserFeedbackRequest {
  subject: string;
  content: string;
  senderId?: string;
  senderName?: string;
  senderAvatarUrl?: string;
  themeColor?: string;
}

