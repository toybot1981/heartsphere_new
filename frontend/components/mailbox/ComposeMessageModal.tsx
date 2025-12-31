/**
 * 写信/创建消息模态框组件
 * 
 * 用于用户创建新的消息（如用户反馈）
 */

import React, { useState } from 'react';
import { MessageCategory, MessageType, SenderType, CreateMessageRequest } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';

interface ComposeMessageModalProps {
  token: string;
  currentUserId: number;
  onClose: () => void;
  onSuccess?: () => void;
  defaultReceiverId?: number; // 默认接收者ID（如管理员）
}

export const ComposeMessageModal: React.FC<ComposeMessageModalProps> = ({
  token,
  currentUserId,
  onClose,
  onSuccess,
  defaultReceiverId,
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subject.trim() || !content.trim()) {
      setError('请填写主题和内容');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const request: CreateMessageRequest = {
        receiverId: defaultReceiverId || 1, // 默认发送给管理员（ID=1）
        senderType: SenderType.USER,
        senderId: currentUserId,
        messageType: MessageType.SYSTEM_FEEDBACK,
        messageCategory: MessageCategory.SYSTEM,
        title: subject.trim(),
        content: content.trim(),
        isRead: false,
        isImportant: false,
        isStarred: false,
      };

      await mailboxApi.createMessage(request, token);
      
      setSubject('');
      setContent('');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('发送消息失败:', err);
      setError(err.message || '发送失败，请稍后重试');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            ✉️ 写信
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-slate-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              主题
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="请输入主题..."
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
              disabled={isSending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="请输入内容..."
              rows={6}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
              disabled={isSending}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isSending}
              className="flex-1 px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/50"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSending || !subject.trim() || !content.trim()}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
            >
              {isSending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  发送中...
                </span>
              ) : (
                '发送'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

