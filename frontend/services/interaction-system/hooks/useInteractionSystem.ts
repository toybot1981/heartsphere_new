/**
 * 互动系统 React Hook
 */

import { useState, useEffect } from 'react';
import { InteractionSystem, InteractionSystemConfig } from '../InteractionSystem';
import {
  Like,
  Comment,
  Share,
  Favorite,
  InteractionStats,
  ContentType,
} from '../types/InteractionTypes';

/**
 * 互动系统 Hook
 */
export function useInteractionSystem(config: InteractionSystemConfig) {
  const [system, setSystem] = useState<InteractionSystem | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!config.enabled) {
      return;
    }

    const interactionSystem = new InteractionSystem(config);
    setSystem(interactionSystem);
    setIsReady(true);
  }, [config.enabled, config.userId]);

  /**
   * 点赞内容
   */
  const likeContent = async (contentType: ContentType, contentId: string): Promise<Like> => {
    if (system) {
      return await system.likeContent(contentType, contentId);
    }
    throw new Error('互动系统未就绪');
  };

  /**
   * 取消点赞
   */
  const unlikeContent = async (contentType: ContentType, contentId: string): Promise<void> => {
    if (system) {
      await system.unlikeContent(contentType, contentId);
    }
  };

  /**
   * 切换点赞状态
   */
  const toggleLike = async (contentType: ContentType, contentId: string): Promise<boolean> => {
    if (system) {
      return await system.toggleLike(contentType, contentId);
    }
    return false;
  };

  /**
   * 检查是否已点赞
   */
  const isLiked = (contentType: ContentType, contentId: string): boolean => {
    if (system) {
      return system.isLiked(contentType, contentId);
    }
    return false;
  };

  /**
   * 获取点赞数
   */
  const getLikeCount = (contentType: ContentType, contentId: string): number => {
    if (system) {
      return system.getLikeCount(contentType, contentId);
    }
    return 0;
  };

  /**
   * 添加评论
   */
  const addComment = async (
    contentType: ContentType,
    contentId: string,
    content: string,
    parentId?: string
  ): Promise<Comment> => {
    if (system) {
      return await system.addComment(contentType, contentId, content, parentId);
    }
    throw new Error('互动系统未就绪');
  };

  /**
   * 获取评论列表
   */
  const getComments = (contentType: ContentType, contentId: string): Comment[] => {
    if (system) {
      return system.getComments(contentType, contentId);
    }
    return [];
  };

  /**
   * 获取评论的回复列表
   */
  const getReplies = (commentId: string): Comment[] => {
    if (system) {
      return system.getReplies(commentId);
    }
    return [];
  };

  /**
   * 删除评论
   */
  const deleteComment = async (commentId: string): Promise<void> => {
    if (system) {
      await system.deleteComment(commentId);
    }
  };

  /**
   * 获取评论数
   */
  const getCommentCount = (contentType: ContentType, contentId: string): number => {
    if (system) {
      return system.getCommentCount(contentType, contentId);
    }
    return 0;
  };

  /**
   * 分享内容
   */
  const shareContent = async (
    contentType: ContentType,
    contentId: string,
    shareType: 'link' | 'copy' | 'platform',
    platform?: string
  ): Promise<Share> => {
    if (system) {
      return await system.shareContent(contentType, contentId, shareType, platform);
    }
    throw new Error('互动系统未就绪');
  };

  /**
   * 获取分享数
   */
  const getShareCount = (contentType: ContentType, contentId: string): number => {
    if (system) {
      return system.getShareCount(contentType, contentId);
    }
    return 0;
  };

  /**
   * 收藏内容
   */
  const favoriteContent = async (
    contentType: ContentType,
    contentId: string,
    tags?: string[],
    notes?: string
  ): Promise<Favorite> => {
    if (system) {
      return await system.favoriteContent(contentType, contentId, tags, notes);
    }
    throw new Error('互动系统未就绪');
  };

  /**
   * 取消收藏
   */
  const unfavoriteContent = async (contentType: ContentType, contentId: string): Promise<void> => {
    if (system) {
      await system.unfavoriteContent(contentType, contentId);
    }
  };

  /**
   * 切换收藏状态
   */
  const toggleFavorite = async (contentType: ContentType, contentId: string): Promise<boolean> => {
    if (system) {
      return await system.toggleFavorite(contentType, contentId);
    }
    return false;
  };

  /**
   * 检查是否已收藏
   */
  const isFavorited = (contentType: ContentType, contentId: string): boolean => {
    if (system) {
      return system.isFavorited(contentType, contentId);
    }
    return false;
  };

  /**
   * 获取收藏数
   */
  const getFavoriteCount = (contentType: ContentType, contentId: string): number => {
    if (system) {
      return system.getFavoriteCount(contentType, contentId);
    }
    return 0;
  };

  /**
   * 获取所有收藏
   */
  const getAllFavorites = (): Favorite[] => {
    if (system) {
      return system.getAllFavorites();
    }
    return [];
  };

  /**
   * 获取互动统计
   */
  const getInteractionStats = (
    contentType: ContentType,
    contentId: string
  ): InteractionStats => {
    if (system) {
      return system.getInteractionStats(contentType, contentId);
    }
    return {
      contentType,
      contentId,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      favoriteCount: 0,
      isLiked: false,
      isFavorited: false,
    };
  };

  return {
    system,
    isReady,
    likeContent,
    unlikeContent,
    toggleLike,
    isLiked,
    getLikeCount,
    addComment,
    getComments,
    getReplies,
    deleteComment,
    getCommentCount,
    shareContent,
    getShareCount,
    favoriteContent,
    unfavoriteContent,
    toggleFavorite,
    isFavorited,
    getFavoriteCount,
    getAllFavorites,
    getInteractionStats,
  };
}



