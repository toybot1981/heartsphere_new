import React, { useState, useEffect } from 'react';
import { MailboxMessage, MessageCategory } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';
import { isESoulLetter, isResonanceMessage, isSystemMessage } from '../../utils/mailboxHelpers';

interface MessageListProps {
  token: string;
  category?: MessageCategory;
  onMessageClick?: (message: MailboxMessage) => void;
}

/**
 * 消息列表组件
 */
export const MessageList: React.FC<MessageListProps> = ({ 
  token, 
  category,
  onMessageClick 
}) => {
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important' | 'starred'>('all');

  useEffect(() => {
    loadMessages();
  }, [category, filter, page, token]);

  // 监听消息更新事件（删除、标记等）
  useEffect(() => {
    const handleMessageUpdate = () => {
      setPage(0); // 重置到第一页
      // 使用setTimeout确保在下一个事件循环中执行，避免状态更新冲突
      setTimeout(() => {
        loadMessages();
      }, 100);
    };

    window.addEventListener('mailbox:message-updated', handleMessageUpdate);
    window.addEventListener('mailbox:unread-updated', handleMessageUpdate);

    return () => {
      window.removeEventListener('mailbox:message-updated', handleMessageUpdate);
      window.removeEventListener('mailbox:unread-updated', handleMessageUpdate);
    };
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      
      // 构建查询参数
      const queryParams: any = {
        page: page,
        size: 20,
      };
      
      // 如果有分类，添加分类参数
      if (category) {
        queryParams.category = category;
      }
      
      // 根据筛选器添加参数
      if (filter === 'unread') {
        queryParams.isRead = false;
      } else if (filter === 'important') {
        queryParams.isImportant = true;
      } else if (filter === 'starred') {
        queryParams.isStarred = true;
      }
      
      
      const result = await mailboxApi.getMessages(queryParams, token);

      if (page === 0) {
        setMessages(result.content || []);
      } else {
        setMessages(prev => [...prev, ...(result.content || [])]);
      }

      setHasMore(!result.last);
    } catch (error) {
      console.error('[MessageList] 加载消息失败:', error);
      setMessages([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageClick = (message: MailboxMessage) => {
    if (!message.isRead) {
      mailboxApi.markMessageAsRead(message.id, token)
        .then(() => {
          setMessages(prev => prev.map(msg => 
            msg.id === message.id ? { ...msg, isRead: true } : msg
          ));
        })
        .catch(err => console.error('标记已读失败:', err));
    }
    onMessageClick?.(message);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div 
      className="flex flex-col h-full"
      style={{
        background: 'var(--gradient-bg, linear-gradient(to bottom, #0f172a, #020617))',
      }}
    >
      {/* 筛选器 */}
      <div 
        className="flex gap-3 px-6 py-4 border-b backdrop-blur-sm"
        style={{
          borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
          backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.4))',
        }}
      >
        <button
          onClick={() => { setFilter('all'); setPage(0); }}
          className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden border"
          style={{
            background: filter === 'all'
              ? 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))'
              : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
            color: filter === 'all'
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
            borderColor: filter === 'all'
              ? 'transparent'
              : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
            transform: filter === 'all' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: filter === 'all'
              ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'all') {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {filter === 'all' && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
              }}
            />
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="relative z-10">全部</span>
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(0); }}
          className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden border"
          style={{
            background: filter === 'unread'
              ? 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))'
              : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
            color: filter === 'unread'
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
            borderColor: filter === 'unread'
              ? 'transparent'
              : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
            transform: filter === 'unread' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: filter === 'unread'
              ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'unread') {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'unread') {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {filter === 'unread' && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
              }}
            />
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="relative z-10">未读</span>
        </button>
        <button
          onClick={() => { setFilter('important'); setPage(0); }}
          className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden border"
          style={{
            background: filter === 'important'
              ? 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))'
              : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
            color: filter === 'important'
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
            borderColor: filter === 'important'
              ? 'transparent'
              : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
            transform: filter === 'important' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: filter === 'important'
              ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'important') {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'important') {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {filter === 'important' && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
              }}
            />
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="relative z-10">重要</span>
        </button>
        <button
          onClick={() => { setFilter('starred'); setPage(0); }}
          className="px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden border"
          style={{
            background: filter === 'starred'
              ? 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899))'
              : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
            color: filter === 'starred'
              ? 'var(--text-primary)'
              : 'var(--text-secondary)',
            borderColor: filter === 'starred'
              ? 'transparent'
              : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
            transform: filter === 'starred' ? 'scale(1.05)' : 'scale(1)',
            boxShadow: filter === 'starred'
              ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
              : 'none',
          }}
          onMouseEnter={(e) => {
            if (filter !== 'starred') {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (filter !== 'starred') {
              e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          {filter === 'starred' && (
            <div 
              className="absolute inset-0 animate-pulse"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
              }}
            />
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <span className="relative z-10">收藏</span>
        </button>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
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
            <div className="text-6xl mb-6 animate-bounce">📭</div>
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
              当有新消息时，会在这里显示
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={message.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MessageCard
                  message={message}
                  onClick={() => handleMessageClick(message)}
                />
              </div>
            ))}
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border font-medium"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                  borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                  color: 'var(--text-tertiary)',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
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
                  '加载更多'
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/**
 * 消息卡片组件
 */
interface MessageCardProps {
  message: MailboxMessage;
  onClick: () => void;
}

const MessageCard: React.FC<MessageCardProps> = ({ message, onClick }) => {
  // 使用工具函数判断消息类型
  const isESoul = isESoulLetter(message);
  const isResonance = isResonanceMessage(message);
  const isSystem = isSystemMessage(message);
  
  // 根据消息类型和状态确定样式
  const getCardStyle = () => {
    if (isESoul) {
      if (message.isRead) {
        return {
          background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(88, 28, 135, 0.6), rgba(88, 28, 135, 0.4), rgba(67, 56, 202, 0.6)))',
          borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.4))',
        };
      } else {
        return {
          background: 'var(--gradient-primary, linear-gradient(to bottom right, rgba(88, 28, 135, 0.8), rgba(157, 23, 77, 0.6), rgba(88, 28, 135, 0.8)))',
          borderColor: 'var(--color-primary, rgba(236, 72, 153, 0.6))',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
        };
      }
    } else if (isResonance) {
      if (message.isRead) {
        return {
          background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(30, 58, 138, 0.6), rgba(14, 116, 144, 0.4), rgba(19, 78, 74, 0.6)))',
          borderColor: 'var(--color-info, rgba(59, 130, 246, 0.4))',
        };
      } else {
        return {
          background: 'var(--gradient-primary, linear-gradient(to bottom right, rgba(30, 58, 138, 0.8), rgba(14, 116, 144, 0.6), rgba(19, 78, 74, 0.8)))',
          borderColor: 'var(--color-info, rgba(6, 182, 212, 0.6))',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
        };
      }
    } else if (isSystem) {
      if (message.isRead) {
        return {
          background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(146, 64, 14, 0.6), rgba(133, 77, 14, 0.4), rgba(154, 52, 18, 0.6)))',
          borderColor: 'var(--color-warning, rgba(217, 119, 6, 0.4))',
        };
      } else {
        return {
          background: 'var(--gradient-primary, linear-gradient(to bottom right, rgba(146, 64, 14, 0.8), rgba(133, 77, 14, 0.6), rgba(154, 52, 18, 0.8)))',
          borderColor: 'var(--color-warning, rgba(234, 179, 8, 0.6))',
          boxShadow: 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))',
        };
      }
    } else {
      if (message.isRead) {
        return {
          backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.6))',
          borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.4))',
        };
      } else {
        return {
          background: 'var(--gradient-primary, linear-gradient(to right, rgba(30, 41, 59, 0.8), rgba(67, 56, 202, 0.5)))',
          borderColor: 'var(--color-primary, rgba(99, 102, 241, 0.4))',
          boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
        };
      }
    }
  };

  const cardStyle = getCardStyle();

  return (
    <div
      onClick={onClick}
      className="p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group active:scale-[0.98]"
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        if (message.isRead) {
          e.currentTarget.style.borderColor = isESoul 
            ? 'var(--color-primary, rgba(147, 51, 234, 0.6))'
            : isResonance
              ? 'var(--color-info, rgba(59, 130, 246, 0.6))'
              : isSystem
                ? 'var(--color-warning, rgba(217, 119, 6, 0.6))'
                : 'var(--bg-overlay, rgba(71, 85, 105, 0.6))';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = cardStyle.borderColor as string;
      }}
    >
      {/* 背景光效 */}
      {!message.isRead && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}
      
      {/* 未读指示器 */}
      {!message.isRead && (
        <div 
          className="absolute top-3 right-3 w-3 h-3 rounded-full animate-pulse shadow-lg"
          style={{
            backgroundColor: isESoul 
              ? 'var(--color-primary, #ec4899)' 
              : isResonance
                ? 'var(--color-info, #22d3ee)'
                : isSystem
                  ? 'var(--color-warning, #fbbf24)'
                  : 'var(--color-primary, #818cf8)',
            boxShadow: isESoul
              ? '0 0 10px var(--color-primary, rgba(236, 72, 153, 0.5))'
              : isResonance
                ? '0 0 10px var(--color-info, rgba(34, 211, 238, 0.5))'
                : isSystem
                  ? '0 0 10px var(--color-warning, rgba(251, 191, 36, 0.5))'
                  : '0 0 10px var(--color-primary, rgba(129, 140, 248, 0.5))',
          }}
        />
      )}
      
      {/* E-SOUL特殊装饰 */}
      {isESoul && (
        <>
          <div 
            className="absolute top-0 left-0 w-full h-1 opacity-60"
            style={{
              background: 'var(--gradient-primary, linear-gradient(to right, #9333ea, #ec4899, #6366f1))',
            }}
          />
          <div 
            className="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl"
            style={{
              backgroundColor: 'var(--color-primary, rgba(147, 51, 234, 0.1))',
            }}
          />
        </>
      )}
      
      <div className="flex items-start gap-4 relative z-10">
        {message.senderAvatar ? (
          <div 
            className="relative flex-shrink-0 transition-transform group-hover:scale-110"
            style={isESoul ? {
              boxShadow: '0 0 0 2px var(--color-primary, rgba(147, 51, 234, 0.5)), 0 0 0 4px var(--bg-overlay, #0f172a)',
            } : {}}
          >
            <img
              src={message.senderAvatar}
              alt={message.senderName || '发送者'}
              className="w-12 h-12 rounded-full object-cover border-2 flex-shrink-0 transition-all"
              style={{
                borderColor: isESoul
                  ? 'var(--color-primary, rgba(147, 51, 234, 0.6))'
                  : 'var(--bg-overlay, rgba(71, 85, 105, 0.6))',
                boxShadow: isESoul
                  ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                  : 'none',
              }}
            />
            {isESoul && (
              <div 
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-lg animate-pulse"
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
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0"
            style={{
              background: isESoul
                ? 'var(--gradient-primary, linear-gradient(to bottom right, #9333ea, #ec4899))'
                : isResonance
                  ? 'var(--gradient-primary, linear-gradient(to bottom right, #06b6d4, #3b82f6))'
                  : isSystem
                    ? 'var(--gradient-primary, linear-gradient(to bottom right, #fbbf24, #f97316))'
                    : 'var(--gradient-primary, linear-gradient(to bottom right, #475569, #334155))',
              color: 'var(--text-primary)',
            }}
          >
            {(message.senderName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 
                className="font-bold text-base truncate"
                style={{
                  color: message.isRead
                    ? isESoul ? 'var(--color-primary, rgba(196, 181, 253, 0.8))' : 'var(--text-tertiary)'
                    : isESoul ? 'var(--color-primary, #fbcfe8)' : 'var(--text-primary)',
                }}
              >
                {message.senderName || '未知发送者'}
              </h4>
              {isESoul && (
                <span 
                  className="text-xs px-2.5 py-1 rounded-full font-medium border backdrop-blur-sm"
                  style={{
                    background: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
                    color: 'var(--color-primary, #e9d5ff)',
                    borderColor: 'var(--color-primary, rgba(147, 51, 234, 0.3))',
                  }}
                >
                  E-SOUL
                </span>
              )}
              {isResonance && (
                <span 
                  className="text-xs px-2.5 py-1 rounded-full font-medium border backdrop-blur-sm"
                  style={{
                    background: 'var(--color-info, rgba(6, 182, 212, 0.3))',
                    color: 'var(--color-info, #a5f3fc)',
                    borderColor: 'var(--color-info, rgba(6, 182, 212, 0.3))',
                  }}
                >
                  共鸣
                </span>
              )}
              {isSystem && (
                <span 
                  className="text-xs px-2.5 py-1 rounded-full font-medium border backdrop-blur-sm"
                  style={{
                    background: 'var(--color-warning, rgba(234, 179, 8, 0.3))',
                    color: 'var(--color-warning, #fef3c7)',
                    borderColor: 'var(--color-warning, rgba(234, 179, 8, 0.3))',
                  }}
                >
                  系统
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {message.isImportant && (
                <span 
                  className="text-base drop-shadow-lg"
                  style={{ color: 'var(--color-warning, #fbbf24)' }}
                >
                  ⭐
                </span>
              )}
              {message.isStarred && (
                <span 
                  className="text-base drop-shadow-lg"
                  style={{ color: 'var(--color-primary, #a855f7)' }}
                >
                  ★
                </span>
              )}
            </div>
          </div>
          
          {message.title && (
            <p 
              className="text-sm font-semibold truncate mb-2"
              style={{
                color: isESoul ? 'var(--color-primary, #e9d5ff)' : 'var(--text-secondary)',
              }}
            >
              {message.title}
            </p>
          )}
          
          <p 
            className="text-sm line-clamp-2 leading-relaxed mb-3"
            style={{
              color: isESoul ? 'var(--color-primary, rgba(233, 213, 255, 0.9))' : 'var(--text-tertiary)',
            }}
          >
            {message.content}
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
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

