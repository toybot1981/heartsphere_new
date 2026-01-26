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
      // 触发消息更新事件，通知列表刷新
      window.dispatchEvent(new CustomEvent('mailbox:message-updated'));
      // 触发未读数量更新
      window.dispatchEvent(new CustomEvent('mailbox:unread-updated'));
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
        }
      }
    } catch (error) {
      console.error('回复失败:', error);
      alert('回复失败，请重试');
    }
  };

  const isESoul = isESoulLetter(message);
  
  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'var(--gradient-bg, linear-gradient(to bottom, #0f172a, #020617))',
      }}
    >
      {/* 头部 */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-b backdrop-blur-sm relative z-10"
        style={{
          borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
          background: 'var(--gradient-bg, linear-gradient(to right, #020617, #0f172a))',
        }}
      >
        <button
          onClick={onBack}
          className="transition-all duration-200 p-2 rounded-lg active:scale-95 flex items-center gap-2"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
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
            className="px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 relative overflow-hidden border"
            style={{
              background: message.isStarred
                ? 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))'
                : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
              color: message.isStarred
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
              borderColor: message.isStarred
                ? 'transparent'
                : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
              boxShadow: message.isStarred
                ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!message.isStarred && !isStarring) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
              }
            }}
            onMouseLeave={(e) => {
              if (!message.isStarred && !isStarring) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
              }
            }}
            title="收藏"
          >
            {message.isStarred && (
              <div 
                className="absolute inset-0 animate-pulse"
                style={{
                  background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
                }}
              />
            )}
            <span className="relative z-10 text-base">{isStarring ? '...' : message.isStarred ? '★' : '☆'}</span>
          </button>
          
          <button
            onClick={handleMarkImportant}
            disabled={isMarkingImportant}
            className="px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 relative overflow-hidden border"
            style={{
              background: message.isImportant
                ? 'var(--gradient-primary, linear-gradient(to right, #fbbf24, #f59e0b))'
                : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
              color: message.isImportant
                ? 'var(--text-primary)'
                : 'var(--text-secondary)',
              borderColor: message.isImportant
                ? 'transparent'
                : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
              boxShadow: message.isImportant
                ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                : 'none',
            }}
            onMouseEnter={(e) => {
              if (!message.isImportant && !isMarkingImportant) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
              }
            }}
            onMouseLeave={(e) => {
              if (!message.isImportant && !isMarkingImportant) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
              }
            }}
            title="标记重要"
          >
            {message.isImportant && (
              <div 
                className="absolute inset-0 animate-pulse"
                style={{
                  background: 'var(--gradient-primary, linear-gradient(to right, rgba(251, 191, 36, 0.2), rgba(245, 158, 11, 0.2)))',
                }}
              />
            )}
            <span className="relative z-10 text-base">{isMarkingImportant ? '...' : '⭐'}</span>
          </button>
          
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-xl transition-all duration-200 active:scale-95"
            style={{
              background: 'var(--gradient-primary, linear-gradient(to right, #dc2626, #ec4899))',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #ef4444, #f472b6))';
              e.currentTarget.style.boxShadow = 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #dc2626, #ec4899))';
              e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
            }}
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
          <div 
            className="flex items-start gap-6 mb-8 pb-6 border-b relative"
            style={{
              borderColor: isESoul
                ? 'var(--color-primary, rgba(147, 51, 234, 0.5))'
                : 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
            }}
          >
            {isESoul && (
              <>
                <div 
                  className="absolute inset-0 rounded-2xl blur-xl"
                  style={{
                    background: 'var(--gradient-bg, linear-gradient(to right, rgba(88, 28, 135, 0.2), rgba(157, 23, 77, 0.2), rgba(88, 28, 135, 0.2)))',
                  }}
                />
                <div 
                  className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl"
                  style={{
                    backgroundColor: 'var(--color-primary, rgba(147, 51, 234, 0.1))',
                  }}
                />
              </>
            )}
            
            <div className="relative z-10">
              {message.senderAvatar ? (
                <div 
                  className="relative"
                  style={isESoul ? {
                    boxShadow: '0 0 0 4px var(--color-primary, rgba(147, 51, 234, 0.3)), 0 0 0 8px var(--bg-overlay, #0f172a)',
                  } : {}}
                >
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName || '发送者'}
                    className="w-20 h-20 rounded-full border-4 object-cover shadow-2xl"
                    style={{
                      borderColor: isESoul
                        ? 'var(--color-primary, rgba(147, 51, 234, 0.5))'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
                    }}
                  />
                  {isESoul && (
                    <div 
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-lg animate-pulse"
                      style={{
                        background: 'var(--gradient-primary, linear-gradient(to bottom right, #9333ea, #ec4899))',
                        color: 'var(--text-primary)',
                      }}
                    >
                      ✨
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl shadow-2xl"
                  style={{
                    background: isESoul
                      ? 'var(--gradient-primary, linear-gradient(to bottom right, #9333ea, #ec4899, #6366f1))'
                      : 'var(--gradient-primary, linear-gradient(to bottom right, #475569, #334155))',
                    color: 'var(--text-primary)',
                  }}
                >
                  {(message.senderName || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <div className="flex-1 relative z-10">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h2 
                  className="text-3xl font-bold"
                  style={isESoul ? {
                    background: 'var(--gradient-text, linear-gradient(to right, #fbcfe8, #e9d5ff))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  } : {
                    color: 'var(--text-primary)',
                  }}
                >
                  {message.title || '无标题'}
                </h2>
                {isESoul && (
                  <span 
                    className="text-xs px-3 py-1.5 rounded-full font-semibold border backdrop-blur-sm"
                    style={{
                      background: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
                      color: 'var(--color-primary, #e9d5ff)',
                      borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
                    }}
                  >
                    E-SOUL来信
                  </span>
                )}
              </div>
              <div className="space-y-1.5">
                <p 
                  className="text-sm font-medium"
                  style={{
                    color: isESoul ? 'var(--color-primary, #c7d2fe)' : 'var(--text-tertiary)',
                  }}
                >
                  来自：<span 
                    className="font-semibold"
                    style={{
                      color: isESoul ? 'var(--color-primary, #fbcfe8)' : 'var(--color-primary, #a78bfa)',
                    }}
                  >
                    {message.senderName || '未知发送者'}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p 
                    className="text-xs"
                    style={{
                      color: isESoul ? 'var(--color-primary, rgba(196, 181, 253, 0.7))' : 'var(--text-disabled)',
                    }}
                  >
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
          <div 
            className="relative p-8 rounded-2xl border shadow-2xl"
            style={isESoul ? {
              background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(88, 28, 135, 0.4), rgba(157, 23, 77, 0.3), rgba(88, 28, 135, 0.4)))',
              borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.4))',
              boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
            } : {
              backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.3))',
              borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
            }}
          >
            {isESoul && (
              <div 
                className="absolute inset-0 rounded-2xl opacity-50"
                style={{
                  background: 'var(--gradient-bg, linear-gradient(to right, transparent, rgba(255, 255, 255, 0.05), transparent))',
                }}
              />
            )}
            <div 
              className="whitespace-pre-wrap leading-relaxed relative z-10"
              style={{
                color: isESoul ? 'var(--color-primary, #f3e8ff)' : 'var(--text-secondary)',
                fontSize: isESoul ? '1.125rem' : '1rem',
              }}
            >
              {message.content}
            </div>
          </div>

          {/* 回复按钮（仅E-SOUL来信） */}
          {isESoul && (
            <div 
              className="mt-8 pt-6 border-t"
              style={{
                borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
              }}
            >
              <button
                onClick={handleReply}
                className="w-full py-4 px-6 rounded-2xl transition-all duration-200 font-semibold text-lg"
                style={{
                  background: 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899, #9333ea))',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #a855f7, #f472b6, #a855f7))';
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-2xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899, #9333ea))';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))';
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
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

