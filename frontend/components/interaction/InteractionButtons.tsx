/**
 * 互动按钮组件
 */

import React, { useState } from 'react';
import { ContentType, InteractionStats } from '../../services/interaction-system/types/InteractionTypes';
import { useInteractionSystem } from '../../services/interaction-system/hooks/useInteractionSystem';

interface InteractionButtonsProps {
  contentType: ContentType;
  contentId: string;
  userId: number;
  showLike?: boolean;
  showComment?: boolean;
  showShare?: boolean;
  showFavorite?: boolean;
  onCommentClick?: () => void;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  contentType,
  contentId,
  userId,
  showLike = true,
  showComment = true,
  showShare = true,
  showFavorite = true,
  onCommentClick,
}) => {
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  const interactionSystem = useInteractionSystem({
    enabled: true,
    userId,
  });

  // 加载统计信息
  React.useEffect(() => {
    if (interactionSystem.isReady) {
      const initialStats = interactionSystem.getInteractionStats(contentType, contentId);
      setStats(initialStats);
    }
  }, [interactionSystem.isReady, contentType, contentId]);

  const handleLike = async () => {
    if (isLiking || !interactionSystem.isReady) return;
    setIsLiking(true);
    try {
      const newLiked = await interactionSystem.toggleLike(contentType, contentId);
      const newStats = interactionSystem.getInteractionStats(contentType, contentId);
      setStats(newStats);
    } catch (error) {
      console.error('点赞失败:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleFavorite = async () => {
    if (isFavoriting || !interactionSystem.isReady) return;
    setIsFavoriting(true);
    try {
      const newFavorited = await interactionSystem.toggleFavorite(contentType, contentId);
      const newStats = interactionSystem.getInteractionStats(contentType, contentId);
      setStats(newStats);
    } catch (error) {
      console.error('收藏失败:', error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleShare = async () => {
    if (!interactionSystem.isReady) return;
    try {
      // 复制链接到剪贴板
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      
      // 记录分享
      await interactionSystem.shareContent(contentType, contentId, 'copy');
      
      // 更新统计
      const newStats = interactionSystem.getInteractionStats(contentType, contentId);
      setStats(newStats);
      
      // 显示提示
      alert('链接已复制到剪贴板');
    } catch (error) {
      console.error('分享失败:', error);
    }
  };

  if (!stats) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      {showLike && (
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
            stats.isLiked
              ? 'bg-pink-100 text-pink-600 hover:bg-pink-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="点赞"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${stats.isLiked ? 'fill-current' : ''}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{stats.likeCount}</span>
        </button>
      )}

      {showComment && (
        <button
          onClick={onCommentClick}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title="评论"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{stats.commentCount}</span>
        </button>
      )}

      {showShare && (
        <button
          onClick={handleShare}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          title="分享"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span>{stats.shareCount}</span>
        </button>
      )}

      {showFavorite && (
        <button
          onClick={handleFavorite}
          disabled={isFavoriting}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
            stats.isFavorited
              ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          } ${isFavoriting ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="收藏"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${stats.isFavorited ? 'fill-current' : ''}`}
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
          <span>{stats.favoriteCount}</span>
        </button>
      )}
    </div>
  );
};



