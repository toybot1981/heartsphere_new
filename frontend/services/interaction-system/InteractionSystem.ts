/**
 * 互动系统核心类
 */

import {
  Like,
  Comment,
  Share,
  Favorite,
  InteractionStats,
  ContentType,
  InteractionType,
} from './types/InteractionTypes';
import { InteractionStorage } from './storage/InteractionStorage';

/**
 * 互动系统配置
 */
export interface InteractionSystemConfig {
  enabled: boolean;
  userId: number;
}

/**
 * 互动系统类
 */
export class InteractionSystem {
  private config: InteractionSystemConfig;
  private storage: InteractionStorage;

  constructor(config: InteractionSystemConfig) {
    this.config = config;
    this.storage = new InteractionStorage(config.userId);
  }

  // ========== 点赞相关 ==========

  /**
   * 点赞内容
   */
  async likeContent(contentType: ContentType, contentId: string): Promise<Like> {
    const like: Like = {
      id: `like_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      contentType,
      contentId,
      createdAt: Date.now(),
    };

    await this.storage.saveLike(like);
    return like;
  }

  /**
   * 取消点赞
   */
  async unlikeContent(contentType: ContentType, contentId: string): Promise<void> {
    await this.storage.removeLike(contentType, contentId);
  }

  /**
   * 切换点赞状态
   */
  async toggleLike(contentType: ContentType, contentId: string): Promise<boolean> {
    const isLiked = this.storage.isLiked(contentType, contentId);
    if (isLiked) {
      await this.unlikeContent(contentType, contentId);
      return false;
    } else {
      await this.likeContent(contentType, contentId);
      return true;
    }
  }

  /**
   * 检查是否已点赞
   */
  isLiked(contentType: ContentType, contentId: string): boolean {
    return this.storage.isLiked(contentType, contentId);
  }

  /**
   * 获取点赞数
   */
  getLikeCount(contentType: ContentType, contentId: string): number {
    return this.storage.getLikeCount(contentType, contentId);
  }

  // ========== 评论相关 ==========

  /**
   * 添加评论
   */
  async addComment(
    contentType: ContentType,
    contentId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> {
    const comment: Comment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      contentType,
      contentId,
      parentId,
      content,
      likes: 0,
      replies: 0,
      createdAt: Date.now(),
    };

    await this.storage.saveComment(comment);

    // 如果是回复，更新父评论的回复数
    if (parentId) {
      const comments = this.storage.getComments();
      const parentComment = comments.find((c) => c.id === parentId);
      if (parentComment) {
        parentComment.replies = (parentComment.replies || 0) + 1;
        await this.storage.saveComment(parentComment);
      }
    }

    return comment;
  }

  /**
   * 获取评论列表
   */
  getComments(contentType: ContentType, contentId: string): Comment[] {
    return this.storage.getCommentsByContent(contentType, contentId);
  }

  /**
   * 获取评论的回复列表
   */
  getReplies(commentId: string): Comment[] {
    return this.storage.getRepliesByComment(commentId);
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: string): Promise<void> {
    await this.storage.deleteComment(commentId);
  }

  /**
   * 获取评论数
   */
  getCommentCount(contentType: ContentType, contentId: string): number {
    return this.storage.getCommentCount(contentType, contentId);
  }

  // ========== 分享相关 ==========

  /**
   * 分享内容
   */
  async shareContent(
    contentType: ContentType,
    contentId: string,
    shareType: 'link' | 'copy' | 'platform',
    platform?: string
  ): Promise<Share> {
    const share: Share = {
      id: `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      contentType,
      contentId,
      shareType,
      platform,
      createdAt: Date.now(),
    };

    await this.storage.saveShare(share);
    return share;
  }

  /**
   * 获取分享数
   */
  getShareCount(contentType: ContentType, contentId: string): number {
    return this.storage.getShareCount(contentType, contentId);
  }

  // ========== 收藏相关 ==========

  /**
   * 收藏内容
   */
  async favoriteContent(
    contentType: ContentType,
    contentId: string,
    tags?: string[],
    notes?: string
  ): Promise<Favorite> {
    const favorite: Favorite = {
      id: `favorite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.config.userId,
      contentType,
      contentId,
      tags,
      notes,
      createdAt: Date.now(),
    };

    await this.storage.saveFavorite(favorite);
    return favorite;
  }

  /**
   * 取消收藏
   */
  async unfavoriteContent(contentType: ContentType, contentId: string): Promise<void> {
    await this.storage.removeFavorite(contentType, contentId);
  }

  /**
   * 切换收藏状态
   */
  async toggleFavorite(contentType: ContentType, contentId: string): Promise<boolean> {
    const isFavorited = this.storage.isFavorited(contentType, contentId);
    if (isFavorited) {
      await this.unfavoriteContent(contentType, contentId);
      return false;
    } else {
      await this.favoriteContent(contentType, contentId);
      return true;
    }
  }

  /**
   * 检查是否已收藏
   */
  isFavorited(contentType: ContentType, contentId: string): boolean {
    return this.storage.isFavorited(contentType, contentId);
  }

  /**
   * 获取收藏数
   */
  getFavoriteCount(contentType: ContentType, contentId: string): number {
    return this.storage.getFavoriteCount(contentType, contentId);
  }

  /**
   * 获取所有收藏
   */
  getAllFavorites(): Favorite[] {
    return this.storage.getFavorites();
  }

  // ========== 统计相关 ==========

  /**
   * 获取互动统计
   */
  getInteractionStats(contentType: ContentType, contentId: string): InteractionStats {
    return {
      contentType,
      contentId,
      likeCount: this.getLikeCount(contentType, contentId),
      commentCount: this.getCommentCount(contentType, contentId),
      shareCount: this.getShareCount(contentType, contentId),
      favoriteCount: this.getFavoriteCount(contentType, contentId),
      isLiked: this.isLiked(contentType, contentId),
      isFavorited: this.isFavorited(contentType, contentId),
    };
  }
}



