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

  const loadMessages = async () => {
    setLoading(true);
    try {
      console.log('[MessageList] 加载消息，参数:', { category, filter, page });
      
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
      
      console.log('[MessageList] 实际查询参数:', queryParams);
      
      const result = await mailboxApi.getMessages(queryParams, token);

      console.log('[MessageList] 收到消息结果:', { 
        total: result.totalElements, 
        count: result.content?.length || 0,
        messages: result.content 
      });

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
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* 筛选器 */}
      <div className="flex gap-3 px-6 py-4 border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-sm">
        <button
          onClick={() => { setFilter('all'); setPage(0); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden ${
            filter === 'all' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105' 
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
          }`}
        >
          {filter === 'all' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="relative z-10">全部</span>
        </button>
        <button
          onClick={() => { setFilter('unread'); setPage(0); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden ${
            filter === 'unread' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105' 
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
          }`}
        >
          {filter === 'unread' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <span className="relative z-10">未读</span>
        </button>
        <button
          onClick={() => { setFilter('important'); setPage(0); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden ${
            filter === 'important' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105' 
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
          }`}
        >
          {filter === 'important' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
          )}
          <svg className="relative z-10 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <span className="relative z-10">重要</span>
        </button>
        <button
          onClick={() => { setFilter('starred'); setPage(0); }}
          className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 relative overflow-hidden ${
            filter === 'starred' 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105' 
              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
          }`}
        >
          {filter === 'starred' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
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
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">加载中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="text-6xl mb-6 animate-bounce">📭</div>
            <p className="text-lg font-medium mb-2">暂无消息</p>
            <p className="text-sm text-slate-600">当有新消息时，会在这里显示</p>
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
                className="w-full py-3 px-4 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 text-slate-400 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-700/30 font-medium"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
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
  
  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden group hover:scale-[1.02] active:scale-[0.98] ${
        isESoul
          ? message.isRead
            ? 'bg-gradient-to-br from-purple-950/60 via-purple-900/40 to-indigo-950/60 border-purple-700/40 hover:border-purple-500/60 hover:shadow-lg hover:shadow-purple-500/10'
            : 'bg-gradient-to-br from-purple-900/80 via-pink-900/60 to-indigo-900/80 border-pink-500/60 hover:border-pink-400/80 shadow-xl shadow-pink-900/30 ring-2 ring-pink-500/20'
          : isResonance
            ? message.isRead
              ? 'bg-gradient-to-br from-blue-950/60 via-cyan-900/40 to-teal-950/60 border-blue-700/40 hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/10'
              : 'bg-gradient-to-br from-blue-900/80 via-cyan-900/60 to-teal-900/80 border-cyan-500/60 hover:border-cyan-400/80 shadow-xl shadow-cyan-900/30 ring-2 ring-cyan-500/20'
            : isSystem
              ? message.isRead
                ? 'bg-gradient-to-br from-amber-950/60 via-yellow-900/40 to-orange-950/60 border-amber-700/40 hover:border-amber-500/60 hover:shadow-lg hover:shadow-amber-500/10'
                : 'bg-gradient-to-br from-amber-900/80 via-yellow-900/60 to-orange-900/80 border-yellow-500/60 hover:border-yellow-400/80 shadow-xl shadow-yellow-900/30 ring-2 ring-yellow-500/20'
              : message.isRead 
                ? 'bg-slate-800/60 border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600/60' 
                : 'bg-gradient-to-r from-slate-800/80 to-indigo-900/50 border-indigo-500/40 hover:border-indigo-400/60 shadow-lg shadow-indigo-900/20'
      }`}
    >
      {/* 背景光效 */}
      {!message.isRead && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}
      
      {/* 未读指示器 */}
      {!message.isRead && (
        <div className={`absolute top-3 right-3 w-3 h-3 rounded-full animate-pulse shadow-lg ${
          isESoul ? 'bg-pink-400 shadow-pink-400/50' : 
          isResonance ? 'bg-cyan-400 shadow-cyan-400/50' :
          isSystem ? 'bg-yellow-400 shadow-yellow-400/50' :
          'bg-indigo-400 shadow-indigo-400/50'
        }`} />
      )}
      
      {/* E-SOUL特殊装饰 */}
      {isESoul && (
        <>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-60"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
        </>
      )}
      
      <div className="flex items-start gap-4 relative z-10">
        {message.senderAvatar ? (
          <div className={`relative flex-shrink-0 transition-transform group-hover:scale-110 ${
            isESoul ? 'ring-2 ring-purple-500/50 ring-offset-2 ring-offset-slate-900' : ''
          }`}>
            <img
              src={message.senderAvatar}
              alt={message.senderName || '发送者'}
              className={`w-12 h-12 rounded-full object-cover border-2 flex-shrink-0 transition-all ${
                isESoul 
                  ? 'border-purple-500/60 shadow-lg shadow-purple-500/30' 
                  : 'border-slate-600/60'
              }`}
            />
            {isESoul && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg animate-pulse">
                ✨
              </div>
            )}
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
            isESoul ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
            isResonance ? 'bg-gradient-to-br from-cyan-500 to-blue-500' :
            isSystem ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
            'bg-gradient-to-br from-slate-600 to-slate-700'
          }`}>
            {(message.senderName || 'U').charAt(0).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h4 className={`font-bold text-base truncate ${
                message.isRead 
                  ? isESoul ? 'text-purple-300/80' : 'text-slate-400'
                  : isESoul ? 'text-pink-200' : 'text-white'
              }`}>
                {message.senderName || '未知发送者'}
              </h4>
              {isESoul && (
                <span className="text-xs bg-gradient-to-r from-purple-500/30 to-pink-500/30 text-purple-200 px-2.5 py-1 rounded-full font-medium border border-purple-500/30 backdrop-blur-sm">
                  E-SOUL
                </span>
              )}
              {isResonance && (
                <span className="text-xs bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-200 px-2.5 py-1 rounded-full font-medium border border-cyan-500/30 backdrop-blur-sm">
                  共鸣
                </span>
              )}
              {isSystem && (
                <span className="text-xs bg-gradient-to-r from-yellow-500/30 to-amber-500/30 text-yellow-200 px-2.5 py-1 rounded-full font-medium border border-yellow-500/30 backdrop-blur-sm">
                  系统
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {message.isImportant && (
                <span className="text-yellow-400 text-base drop-shadow-lg">⭐</span>
              )}
              {message.isStarred && (
                <span className="text-purple-400 text-base drop-shadow-lg">★</span>
              )}
            </div>
          </div>
          
          {message.title && (
            <p className={`text-sm font-semibold truncate mb-2 ${
              isESoul ? 'text-purple-200' : 'text-slate-300'
            }`}>
              {message.title}
            </p>
          )}
          
          <p className={`text-sm line-clamp-2 leading-relaxed mb-3 ${
            isESoul ? 'text-purple-100/90' : 'text-slate-400'
          }`}>
            {message.content}
          </p>
          
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`text-xs ${
              isESoul ? 'text-purple-400/70' : 'text-slate-500'
            }`}>
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

