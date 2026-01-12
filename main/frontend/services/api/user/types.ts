// 用户相关API类型定义

/**
 * 用户资料
 */
export interface UserProfile {
  id: number;
  username: string;
  email: string;
  nickname: string;
  avatar: string;
  wechatOpenid?: string;
}

