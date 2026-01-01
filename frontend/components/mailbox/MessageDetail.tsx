import React, { useState } from 'react';
import { MailboxMessage } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';
import { isESoulLetter } from '../../utils/mailboxHelpers';

interface MessageDetailProps {
  message: MailboxMessage;
  token: string;
  onBack: () => void;
  onUpdate?: (message: MailboxMessage) => void;
}

/**
 * 消息详情组件
 */
export const MessageDetail: React.FC<MessageDetailProps> = ({ 
  message, 
  token, 
  onBack,
  onUpdate 
}) => {
  const [isStarring, setIsStarring] = useState(false);
  const [isMarkingImportant, setIsMarkingImportant] = useState(false);

  const handleStar = async () => {
    setIsStarring(true);
    try {
      const updated = await mailboxApi.markMessageAsStarred(
        message.id, 
        !message.isStarred, 
        token
      );
      onUpdate?.(updated);
    } catch (error) {
      console.error('收藏操作失败:', error);
      alert('操作失败，请重试');
    } finally {
      setIsStarring(false);
    }
  };

  const handleMarkImportant = async () => {
    setIsMarkingImportant(true);
    try {
      const updated = await mailboxApi.markMessageAsImportant(
        message.id, 
        !message.isImportant, 
        token
      );
      onUpdate?.(updated);
    } catch (error) {
      console.error('标记重要失败:', error);
      alert('操作失败，请重试');
    } finally {
      setIsMarkingImportant(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这条消息吗？')) {
      return;
    }

    try {
      await mailboxApi.deleteMessage(message.id, token);
      onBack();
    } catch (error) {
      console.error('删除消息失败:', error);
      alert('删除失败，请重试');
    }
  };

  const handleReply = async () => {
    // 如果是E-SOUL来信，显示回复功能
    const isESoul = isESoulLetter(message);
    
    if (!isESoul) {
      // 其他类型消息可以创建对话或直接回复
      return;
    }

    const content = prompt('请输入回复内容：');
    if (!content || !content.trim()) {
      return;
    }

    try {
      const result = await mailboxApi.replyToESoulLetter(
        message.id,
        content.trim(),
        'full',
        token
      );
      
      if (result.success) {
        alert('回复成功！');
        // 如果有conversationId，可以跳转到对话页面
        if (result.conversationId) {
          // TODO: 跳转到对话页面
          console.log('对话ID:', result.conversationId);
        }
      }
    } catch (error) {
      console.error('回复失败:', error);
      alert('回复失败，请重试');
    }
  };

  const isESoul = isESoulLetter(message);
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-950/80 to-slate-900/80 backdrop-blur-sm relative z-10">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-all duration-200 p-2 rounded-lg hover:bg-slate-800/50 active:scale-95 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>返回</span>
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={handleStar}
            disabled={isStarring}
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 relative overflow-hidden ${
              message.isStarred
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 border border-slate-700/30'
            }`}
            title="收藏"
          >
            {message.isStarred && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
            )}
            <span className="relative z-10 text-base">{isStarring ? '...' : message.isStarred ? '★' : '☆'}</span>
          </button>
          
          <button
            onClick={handleMarkImportant}
            disabled={isMarkingImportant}
            className={`px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 relative overflow-hidden ${
              message.isImportant
                ? 'bg-gradient-to-r from-yellow-600 to-amber-600 text-white shadow-lg shadow-yellow-500/30'
                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 border border-slate-700/30'
            }`}
            title="标记重要"
          >
            {message.isImportant && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 animate-pulse"></div>
            )}
            <span className="relative z-10 text-base">{isMarkingImportant ? '...' : '⭐'}</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 active:scale-95"
            title="删除"
          >
            删除
          </button>
        </div>
      </div>

      {/* 消息内容 */}
      <div className="flex-1 overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
        <div className="max-w-4xl mx-auto animate-fade-in">
          {/* 发送者信息 */}
          <div className={`flex items-start gap-6 mb-8 pb-6 border-b relative ${
            isESoul 
              ? 'border-purple-700/50' 
              : 'border-slate-700/50'
          }`}>
            {isESoul && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-950/20 via-pink-950/20 to-purple-950/20 rounded-2xl blur-xl"></div>
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl"></div>
              </>
            )}
            
            <div className="relative z-10">
              {message.senderAvatar ? (
                <div className={`relative ${
                  isESoul ? 'ring-4 ring-purple-500/30 ring-offset-4 ring-offset-slate-900' : ''
                }`}>
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName || '发送者'}
                    className={`w-20 h-20 rounded-full border-4 object-cover shadow-2xl ${
                      isESoul 
                        ? 'border-purple-500/50' 
                        : 'border-slate-600/50'
                    }`}
                  />
                  {isESoul && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm shadow-lg animate-pulse">
                      ✨
                    </div>
                  )}
                </div>
              ) : (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-2xl ${
                  isESoul
                    ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500'
                    : 'bg-gradient-to-br from-slate-600 to-slate-700'
                }`}>
                  {(message.senderName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 className={`text-3xl font-bold ${
                  isESoul ? 'text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300' : 'text-white'
                }`}>
                  {message.title || '无标题'}
                </h2>
                {isESoul && (
                  <span className="text-xs bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 px-3 py-1.5 rounded-full font-semibold border border-purple-500/30 backdrop-blur-sm">
                    E-SOUL来信
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <p className={`text-sm font-medium ${
                  isESoul ? 'text-purple-300' : 'text-slate-400'
                }`}>
                  来自：<span className={`font-semibold ${
                    isESoul ? 'text-pink-300' : 'text-purple-400'
                  }`}>
                    {message.senderName || '未知发送者'}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-xs ${
                    isESoul ? 'text-purple-400/70' : 'text-slate-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 消息正文 */}
          <div className={`relative ${
            isESoul 
              ? 'bg-gradient-to-br from-purple-950/40 via-pink-950/30 to-purple-950/40 p-8 rounded-2xl border border-purple-800/40 shadow-2xl shadow-purple-900/20' 
              : 'bg-slate-800/30 p-8 rounded-2xl border border-slate-700/50'
          }`}>
            {isESoul && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 rounded-2xl"></div>
            )}
            <div className={`whitespace-pre-wrap leading-relaxed relative z-10 ${
              isESoul 
                ? 'text-purple-100 text-lg' 
                : 'text-slate-300'
            }`}>
              {message.content}
            </div>
          </div>

          {/* 回复按钮（仅E-SOUL来信） */}
          {isESoul && (
            <div className="mt-8 pt-6 border-t border-purple-700/30">
              <button
                onClick={handleReply}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-2xl hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 transition-all duration-200 font-semibold shadow-xl shadow-purple-900/40 hover:shadow-2xl hover:shadow-purple-900/50 hover:scale-[1.02] active:scale-[0.98] text-lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  回复这封来信
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

