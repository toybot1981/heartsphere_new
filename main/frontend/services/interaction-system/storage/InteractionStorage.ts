/**
 * 互动系统存储
 */

import { Like, Comment, Share, Favorite, ContentType } from '../types/InteractionTypes';

/**
 * 互动存储类
 */
export class InteractionStorage {
  private userId: number;
  private likesKey: string;
  private commentsKey: string;
  private sharesKey: string;
  private favoritesKey: string;

  constructor(userId: number) {
    this.userId = userId;
    this.likesKey = `interaction_likes_${userId}`;
    this.commentsKey = `interaction_comments_${userId}`;
    this.sharesKey = `interaction_shares_${userId}`;
    this.favoritesKey = `interaction_favorites_${userId}`;
  }

  // ========== 点赞相关 ==========

  /**
   * 保存点赞
   */
  async saveLike(like: Like): Promise<void> {
    try {
      const likes = this.getLikes();
      const existingIndex = likes.findIndex(
        (l) =>
          l.userId === like.userId &&
          l.contentType === like.contentType &&
          l.contentId === like.contentId
      );
      if (existingIndex >= 0) {
        likes[existingIndex] = like;
      } else {
        likes.push(like);
      }
      localStorage.setItem(this.likesKey, JSON.stringify(likes));
    } catch (error) {
      console.error('[InteractionStorage] 保存点赞失败:', error);
    }
  }

  /**
   * 获取所有点赞
   */
  getLikes(): Like[] {
    try {
      const data = localStorage.getItem(this.likesKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[InteractionStorage] 获取点赞失败:', error);
    }
    return [];
  }

  /**
   * 删除点赞
   */
  async removeLike(contentType: ContentType, contentId: string): Promise<void> {
    try {
      const likes = this.getLikes();
      const filtered = likes.filter(
        (l) => !(l.userId === this.userId && l.contentType === contentType && l.contentId === contentId)
      );
      localStorage.setItem(this.likesKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('[InteractionStorage] 删除点赞失败:', error);
    }
  }

  /**
   * 检查是否已点赞
   */
  isLiked(contentType: ContentType, contentId: string): boolean {
    const likes = this.getLikes();
    return likes.some(
      (l) => l.userId === this.userId && l.contentType === contentType && l.contentId === contentId
    );
  }

  /**
   * 获取内容的点赞数
   */
  getLikeCount(contentType: ContentType, contentId: string): number {
    const likes = this.getLikes();
    return likes.filter((l) => l.contentType === contentType && l.contentId === contentId).length;
  }

  // ========== 评论相关 ==========

  /**
   * 保存评论
   */
  async saveComment(comment: Comment): Promise<void> {
    try {
      const comments = this.getComments();
      const existingIndex = comments.findIndex((c) => c.id === comment.id);
      if (existingIndex >= 0) {
        comments[existingIndex] = comment;
      } else {
        comments.push(comment);
      }
      localStorage.setItem(this.commentsKey, JSON.stringify(comments));
    } catch (error) {
      console.error('[InteractionStorage] 保存评论失败:', error);
    }
  }

  /**
   * 获取所有评论
   */
  getComments(): Comment[] {
    try {
      const data = localStorage.getItem(this.commentsKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[InteractionStorage] 获取评论失败:', error);
    }
    return [];
  }

  /**
   * 获取内容的评论列表
   */
  getCommentsByContent(contentType: ContentType, contentId: string): Comment[] {
    const comments = this.getComments();
    return comments
      .filter((c) => c.contentType === contentType && c.contentId === contentId && !c.parentId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * 获取评论的回复列表
   */
  getRepliesByComment(commentId: string): Comment[] {
    const comments = this.getComments();
    return comments
      .filter((c) => c.parentId === commentId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: string): Promise<void> {
    try {
      const comments = this.getComments();
      const filtered = comments.filter((c) => c.id !== commentId && c.parentId !== commentId);
      localStorage.setItem(this.commentsKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('[InteractionStorage] 删除评论失败:', error);
    }
  }

  /**
   * 获取内容的评论数
   */
  getCommentCount(contentType: ContentType, contentId: string): number {
    const comments = this.getComments();
    return comments.filter(
      (c) => c.contentType === contentType && c.contentId === contentId && !c.parentId
    ).length;
  }

  // ========== 分享相关 ==========

  /**
   * 保存分享
   */
  async saveShare(share: Share): Promise<void> {
    try {
      const shares = this.getShares();
      shares.push(share);
      localStorage.setItem(this.sharesKey, JSON.stringify(shares));
    } catch (error) {
      console.error('[InteractionStorage] 保存分享失败:', error);
    }
  }

  /**
   * 获取所有分享
   */
  getShares(): Share[] {
    try {
      const data = localStorage.getItem(this.sharesKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[InteractionStorage] 获取分享失败:', error);
    }
    return [];
  }

  /**
   * 获取内容的分享数
   */
  getShareCount(contentType: ContentType, contentId: string): number {
    const shares = this.getShares();
    return shares.filter((s) => s.contentType === contentType && s.contentId === contentId).length;
  }

  // ========== 收藏相关 ==========

  /**
   * 保存收藏
   */
  async saveFavorite(favorite: Favorite): Promise<void> {
    try {
      const favorites = this.getFavorites();
      const existingIndex = favorites.findIndex(
        (f) =>
          f.userId === favorite.userId &&
          f.contentType === favorite.contentType &&
          f.contentId === favorite.contentId
      );
      if (existingIndex >= 0) {
        favorites[existingIndex] = favorite;
      } else {
        favorites.push(favorite);
      }
      localStorage.setItem(this.favoritesKey, JSON.stringify(favorites));
    } catch (error) {
      console.error('[InteractionStorage] 保存收藏失败:', error);
    }
  }

  /**
   * 获取所有收藏
   */
  getFavorites(): Favorite[] {
    try {
      const data = localStorage.getItem(this.favoritesKey);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[InteractionStorage] 获取收藏失败:', error);
    }
    return [];
  }

  /**
   * 删除收藏
   */
  async removeFavorite(contentType: ContentType, contentId: string): Promise<void> {
    try {
      const favorites = this.getFavorites();
      const filtered = favorites.filter(
        (f) => !(f.userId === this.userId && f.contentType === contentType && f.contentId === contentId)
      );
      localStorage.setItem(this.favoritesKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('[InteractionStorage] 删除收藏失败:', error);
    }
  }

  /**
   * 检查是否已收藏
   */
  isFavorited(contentType: ContentType, contentId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(
      (f) => f.userId === this.userId && f.contentType === contentType && f.contentId === contentId
    );
  }

  /**
   * 获取内容的收藏数
   */
  getFavoriteCount(contentType: ContentType, contentId: string): number {
    const favorites = this.getFavorites();
    return favorites.filter((f) => f.contentType === contentType && f.contentId === contentId).length;
  }
}




