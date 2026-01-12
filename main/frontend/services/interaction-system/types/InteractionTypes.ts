/**
 * 互动系统类型定义
 */

/**
 * 互动类型
 */
export enum InteractionType {
  LIKE = 'like', // 点赞
  COMMENT = 'comment', // 评论
  SHARE = 'share', // 分享
  FAVORITE = 'favorite', // 收藏
}

/**
 * 内容类型
 */
export enum ContentType {
  MESSAGE = 'message', // 消息
  CARD = 'card', // 卡片
  POST = 'post', // 帖子
  COMMENT = 'comment', // 评论
}

/**
 * 点赞记录
 */
export interface Like {
  id: string;
  userId: number;
  contentType: ContentType;
  contentId: string;
  createdAt: number;
}

/**
 * 评论
 */
export interface Comment {
  id: string;
  userId: number;
  userName?: string;
  userAvatar?: string;
  contentType: ContentType;
  contentId: string;
  parentId?: string; // 父评论ID（用于回复）
  content: string;
  likes: number; // 点赞数
  replies: number; // 回复数
  createdAt: number;
  updatedAt?: number;
}

/**
 * 分享记录
 */
export interface Share {
  id: string;
  userId: number;
  contentType: ContentType;
  contentId: string;
  shareType: 'link' | 'copy' | 'platform'; // 分享类型
  platform?: string; // 分享平台（如微信、微博等）
  createdAt: number;
}

/**
 * 收藏记录
 */
export interface Favorite {
  id: string;
  userId: number;
  contentType: ContentType;
  contentId: string;
  tags?: string[]; // 标签
  notes?: string; // 备注
  createdAt: number;
}

/**
 * 互动统计
 */
export interface InteractionStats {
  contentType: ContentType;
  contentId: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  favoriteCount: number;
  isLiked: boolean; // 当前用户是否已点赞
  isFavorited: boolean; // 当前用户是否已收藏
}

/**
 * 互动配置
 */
export interface InteractionConfig {
  enabled: boolean;
  userId: number;
  showLikeButton?: boolean;
  showCommentButton?: boolean;
  showShareButton?: boolean;
  showFavoriteButton?: boolean;
}




