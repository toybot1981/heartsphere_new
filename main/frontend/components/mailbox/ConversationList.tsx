import React, { useState, useEffect } from 'react';
import { Conversation } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';

interface ConversationListProps {
  token: string;
  onConversationClick?: (conversation: Conversation) => void;
}

/**
 * 对话列表组件
 */
export const ConversationList: React.FC<ConversationListProps> = ({ 
  token, 
  onConversationClick 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadConversations();
  }, [page]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const result = await mailboxApi.getConversations({
        page: page,
        size: 20,
      }, token);

      // 后端返回Page格式
      const conversationsList = result.content || (result as any).content || [];
      
      if (page === 0) {
        setConversations(conversationsList);
      } else {
        setConversations(prev => [...prev, ...conversationsList]);
      }

      setHasMore(!result.last);
    } catch (error) {
      console.error('加载对话列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (conversation: Conversation) => {
    // 标记为已读
    if (conversation.unreadCount > 0) {
      try {
        await mailboxApi.markConversationAsRead(conversation.id, token);
        setConversations(prev => prev.map(conv => 
          conv.id === conversation.id ? { ...conv, unreadCount: 0 } : conv
        ));
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }
    onConversationClick?.(conversation);
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
      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
        {loading && conversations.length === 0 ? (
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
        ) : conversations.length === 0 ? (
          <div 
            className="flex flex-col items-center justify-center h-full"
            style={{ color: 'var(--text-disabled)' }}
          >
            <div className="text-6xl mb-6 animate-bounce">💬</div>
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              暂无对话
            </p>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-disabled)' }}
            >
              开始一个新的对话吧！
            </p>
          </div>
        ) : (
          <>
            {conversations.map((conversation, index) => (
              <div
                key={conversation.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ConversationItem
                  conversation={conversation}
                  onClick={() => handleConversationClick(conversation)}
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
 * 对话项组件
 */
interface ConversationItemProps {
  conversation: Conversation;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
  // 根据当前用户ID确定未读数量和状态
  // 这里需要传入当前用户ID来判断是participant1还是participant2
  // 暂时使用participant2的数据作为示例
  const unreadCount = conversation.unreadCount2 || 0;
  const isPinned = conversation.isPinned2 || false;
  const isMuted = conversation.isMuted2 || false;
  const participantName = (conversation as any).participant2Name || '未知用户';
  const participantAvatar = (conversation as any).participant2Avatar;

  return (
    <div
      onClick={onClick}
      className="group p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden active:scale-[0.98]"
      style={{
        background: unreadCount > 0
          ? 'var(--gradient-primary, linear-gradient(to right, rgba(30, 58, 138, 0.7), rgba(14, 116, 144, 0.5), rgba(30, 58, 138, 0.7)))'
          : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
        borderColor: unreadCount > 0
          ? 'var(--color-info, rgba(6, 182, 212, 0.4))'
          : 'var(--bg-overlay, rgba(71, 85, 105, 0.4))',
        boxShadow: unreadCount > 0
          ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
          : 'none',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        if (unreadCount > 0) {
          e.currentTarget.style.borderColor = 'var(--color-info, rgba(34, 211, 238, 0.6))';
        } else {
          e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(71, 85, 105, 0.6))';
          e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.8))';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = unreadCount > 0
          ? 'var(--color-info, rgba(6, 182, 212, 0.4))'
          : 'var(--bg-overlay, rgba(71, 85, 105, 0.4))';
        e.currentTarget.style.backgroundColor = unreadCount > 0
          ? 'var(--gradient-primary, linear-gradient(to right, rgba(30, 58, 138, 0.7), rgba(14, 116, 144, 0.5), rgba(30, 58, 138, 0.7)))'
          : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
      }}
    >
      {/* 背景光效 */}
      {unreadCount > 0 && (
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'var(--gradient-bg, linear-gradient(to right, transparent, rgba(6, 182, 212, 0.05), transparent))',
          }}
        />
      )}
      
      {isPinned && (
        <div 
          className="absolute top-3 right-3 text-base drop-shadow-lg z-10"
          style={{ color: 'var(--color-warning, #fbbf24)' }}
        >
          📌
        </div>
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative flex-shrink-0">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={participantName}
              className="w-14 h-14 rounded-full object-cover border-2 shadow-lg transition-transform group-hover:scale-110"
              style={{
                borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
              }}
            />
          ) : (
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg shadow-lg transition-transform group-hover:scale-110 border-2"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to bottom right, #9333ea, #ec4899, #6366f1))',
                color: 'var(--text-primary)',
                borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
              }}
            >
              {participantName.charAt(0).toUpperCase()}
            </div>
          )}
          {unreadCount > 0 && (
            <div 
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg animate-pulse"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to bottom right, #ef4444, #ec4899))',
                color: 'var(--text-primary)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          {unreadCount === 0 && (
            <div 
              className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2"
              style={{
                backgroundColor: 'var(--color-success, #4ade80)',
                borderColor: 'var(--bg-overlay, #0f172a)',
              }}
            />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 
              className="font-bold text-base truncate"
              style={{
                color: unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              {participantName}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isMuted && (
                <span 
                  className="text-base"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  🔇
                </span>
              )}
              {conversation.lastMessageAt && (
                <p 
                  className="text-xs whitespace-nowrap ml-2"
                  style={{
                    color: unreadCount > 0 ? 'var(--color-info, rgba(34, 211, 238, 0.7))' : 'var(--text-disabled)',
                  }}
                >
                  {new Date(conversation.lastMessageAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          
          {conversation.lastMessageContent && (
            <p 
              className="text-sm truncate leading-relaxed"
              style={{
                color: unreadCount > 0 ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                fontWeight: unreadCount > 0 ? 500 : 400,
              }}
            >
              {conversation.lastMessageContent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

