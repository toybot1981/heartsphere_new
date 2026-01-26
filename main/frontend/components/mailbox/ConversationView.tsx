import React, { useState, useEffect, useRef } from 'react';
import { Conversation, ConversationMessage } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';

interface ConversationViewProps {
  conversation: Conversation;
  token: string;
  currentUserId: number;
  onBack: () => void;
}

/**
 * 对话界面组件
 */
export const ConversationView: React.FC<ConversationViewProps> = ({ 
  conversation, 
  token, 
  currentUserId,
  onBack 
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // 标记为已读
    if (conversation.unreadCount2 > 0 || conversation.unreadCount1 > 0) {
      mailboxApi.markConversationAsRead(conversation.id, token).catch(console.error);
    }
  }, [conversation.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (beforeMessageId?: number) => {
    setLoading(true);
    try {
      // 使用分页方式加载消息
      const page = beforeMessageId ? 0 : 0; // 简化处理，实际应该根据beforeMessageId计算page
      const result = await mailboxApi.getConversationMessages(
        conversation.id,
        page,
        20,
        beforeMessageId,
        token
      );

      // 后端返回的是Page格式
      if (beforeMessageId) {
        // 加载更早的消息，添加到前面
        setMessages(prev => [...result.content, ...prev]);
      } else {
        // 初始加载或刷新
        setMessages(result.content);
      }

      setHasMore(!result.last);
    } catch (error) {
      console.error('加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) {
      return;
    }

    const content = input.trim();
    setInput('');
    setSending(true);

    try {
      const result = await mailboxApi.sendConversationMessage(
        conversation.id,
        {
          messageType: 'text',
          content: content,
        },
        token
      );

      // 重新加载消息列表以获取新消息
      await loadMessages();
    } catch (error) {
      console.error('发送消息失败:', error);
      alert('发送失败，请重试');
      setInput(content); // 恢复输入内容
    } finally {
      setSending(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && messages.length > 0) {
      const firstMessageId = messages[0].id;
      loadMessages(firstMessageId);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherParticipantId = conversation.participant1Id === currentUserId 
    ? conversation.participant2Id 
    : conversation.participant1Id;

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
          className="transition-all duration-200 mr-4 p-2 rounded-lg active:scale-95"
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
        </button>
        
        <div className="flex items-center gap-4 flex-1">
          {(conversation as any).participant2Avatar ? (
            <img
              src={(conversation as any).participant2Avatar}
              alt={(conversation as any).participant2Name || '用户'}
              className="w-12 h-12 rounded-full object-cover border-2 shadow-lg"
              style={{
                borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
              }}
            />
          ) : (
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to bottom right, #9333ea, #ec4899, #6366f1))',
                color: 'var(--text-primary)',
                borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
              }}
            >
              {(conversation as any).participant2Name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 
              className="text-lg font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {(conversation as any).participant2Name || '未知用户'}
            </h2>
            <p 
              className="text-xs"
              style={{ color: 'var(--text-tertiary)' }}
            >
              在线
            </p>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent"
        style={{
          background: 'var(--gradient-bg, linear-gradient(to bottom, #0f172a, #0f172a, #020617))',
          backgroundImage: `radial-gradient(circle at 20% 50%, var(--color-primary, rgba(139, 92, 246, 0.03)) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, var(--color-primary, rgba(236, 72, 153, 0.03)) 0%, transparent 50%)`
        }}
      >
        {hasMore && (
          <div className="text-center pb-4">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="text-sm px-5 py-2.5 rounded-xl transition-all duration-200 disabled:opacity-50 border font-medium"
              style={{
                color: 'var(--text-tertiary)',
                backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                }
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                    style={{
                      borderColor: 'var(--text-disabled, rgba(148, 163, 184, 0.3))',
                      borderTopColor: 'var(--text-tertiary, #94a3b8)',
                    }}
                  />
                  加载中...
                </span>
              ) : (
                '加载更早的消息'
              )}
            </button>
          </div>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div 
              className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
              style={{
                borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
                borderTopColor: 'var(--color-primary, #9333ea)',
              }}
            />
            <p style={{ color: 'var(--text-tertiary)' }}>加载中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center h-full"
            style={{ color: 'var(--text-disabled)' }}
          >
            <div className="text-6xl mb-6 animate-bounce">💬</div>
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              暂无消息
            </p>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-disabled)' }}
            >
              开始对话吧！
            </p>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === currentUserId}
            />
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div 
        className="px-6 py-4 border-t backdrop-blur-sm"
        style={{
          borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
          background: 'var(--gradient-bg, linear-gradient(to right, #020617, #0f172a))',
        }}
      >
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Enter发送，Shift+Enter换行)"
              className="w-full px-5 py-3 rounded-2xl border outline-none resize-none transition-all"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.8))',
                borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, rgba(147, 51, 234, 0.5))';
                e.currentTarget.style.outline = '2px solid var(--color-primary, rgba(147, 51, 234, 0.2))';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(71, 85, 105, 0.5))';
                e.currentTarget.style.outline = 'none';
              }}
              rows={1}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-8 py-3 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg"
            style={{
              background: 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!sending && input.trim()) {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #a855f7, #f472b6))';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))';
              }
            }}
            onMouseLeave={(e) => {
              if (!sending && input.trim()) {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
              }
            }}
            onMouseDown={(e) => {
              if (!sending && input.trim()) {
                e.currentTarget.style.transform = 'scale(0.95)';
              }
            }}
            onMouseUp={(e) => {
              if (!sending && input.trim()) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <div
                  className="w-4 h-4 border-2 rounded-full animate-spin"
                  style={{
                    borderColor: 'var(--border-color-overlay)',
                    borderTopColor: 'var(--text-primary)',
                  }}
                />
                发送中
              </span>
            ) : (
              '发送'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 消息气泡组件
 */
interface MessageBubbleProps {
  message: ConversationMessage;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'} flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
        {!isOwn && (
          <div 
            className="text-xs mb-1.5 ml-2 font-medium"
            style={{ color: 'var(--text-disabled)' }}
          >
            {message.senderType === 'system' ? '系统' : '用户'}
          </div>
        )}
        <div
          className="px-5 py-3 rounded-2xl shadow-lg transition-all duration-200 border backdrop-blur-sm"
          style={{
            background: isOwn
              ? 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899, #9333ea))'
              : 'var(--bg-overlay, rgba(30, 41, 59, 0.8))',
            color: isOwn
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
            borderColor: isOwn
              ? 'transparent'
              : 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
            borderRadius: isOwn ? '0.75rem 0.75rem 0.25rem 0.75rem' : '0.75rem 0.75rem 0.75rem 0.25rem',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
          {message.isEdited && (
            <div 
              className="text-xs opacity-70 mt-1.5 italic"
              style={{ color: 'inherit' }}
            >
              (已编辑)
            </div>
          )}
        </div>
        <div 
          className={`text-xs mt-1.5 ${isOwn ? 'mr-2' : 'ml-2'} flex items-center gap-1`}
          style={{ color: 'var(--text-disabled)' }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {new Date(message.createdAt).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};

