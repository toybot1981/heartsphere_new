/**
 * 评论列表组件
 */

import React, { useState, useEffect } from 'react';
import { Comment, ContentType } from '../../services/interaction-system/types/InteractionTypes';
import { useInteractionSystem } from '../../services/interaction-system/hooks/useInteractionSystem';

interface CommentListProps {
  contentType: ContentType;
  contentId: string;
  userId: number;
  onClose?: () => void;
}

export const CommentList: React.FC<CommentListProps> = ({
  contentType,
  contentId,
  userId,
  onClose,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const interactionSystem = useInteractionSystem({
    enabled: true,
    userId,
  });

  // 加载评论列表
  useEffect(() => {
    if (interactionSystem.isReady) {
      const loadedComments = interactionSystem.getComments(contentType, contentId);
      setComments(loadedComments);
    }
  }, [interactionSystem.isReady, contentType, contentId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !interactionSystem.isReady) return;

    try {
      const comment = await interactionSystem.addComment(contentType, contentId, newComment);
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('添加评论失败:', error);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !interactionSystem.isReady) return;

    try {
      await interactionSystem.addComment(contentType, contentId, replyContent, parentId);
      // 重新加载评论列表
      const loadedComments = interactionSystem.getComments(contentType, contentId);
      setComments(loadedComments);
      setReplyingTo(null);
      setReplyContent('');
    } catch (error) {
      console.error('添加回复失败:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!interactionSystem.isReady) return;

    try {
      await interactionSystem.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('删除评论失败:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[600px] flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">评论 ({comments.length})</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* 评论列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-400">暂无评论</div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-semibold">
                  {comment.userName?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-800">
                      {comment.userName || `用户 ${comment.userId}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="hover:text-pink-600 transition-colors"
                    >
                      回复
                    </button>
                    {comment.userId === userId && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="hover:text-red-600 transition-colors"
                      >
                        删除
                      </button>
                    )}
                  </div>

                  {/* 回复输入框 */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="输入回复..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSubmitReply(comment.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleSubmitReply(comment.id)}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      >
                        发送
                      </button>
                    </div>
                  )}

                  {/* 回复列表 */}
                  {comment.replies > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      {interactionSystem.getReplies(comment.id).map((reply) => (
                        <div key={reply.id} className="mb-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-800 text-sm">
                              {reply.userName || `用户 ${reply.userId}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加评论 */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="输入评论..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSubmitComment();
              }
            }}
          />
          <button
            onClick={handleSubmitComment}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
};



