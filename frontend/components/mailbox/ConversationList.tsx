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
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* 对话列表 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent">
        {loading && conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">加载中...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="text-6xl mb-6 animate-bounce">💬</div>
            <p className="text-lg font-medium mb-2">暂无对话</p>
            <p className="text-sm text-slate-600">开始一个新的对话吧！</p>
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
      className={`group p-4 rounded-2xl cursor-pointer transition-all duration-300 border relative overflow-hidden hover:scale-[1.02] active:scale-[0.98] ${
        unreadCount > 0
          ? 'bg-gradient-to-r from-blue-900/70 via-cyan-900/50 to-blue-900/70 border-cyan-500/40 hover:border-cyan-400/60 shadow-lg shadow-cyan-900/20 ring-2 ring-cyan-500/10'
          : 'bg-slate-800/50 border-slate-700/40 hover:bg-slate-800/80 hover:border-slate-600/60'
      }`}
    >
      {/* 背景光效 */}
      {unreadCount > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      )}
      
      {isPinned && (
        <div className="absolute top-3 right-3 text-yellow-400 text-base drop-shadow-lg z-10">📌</div>
      )}
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative flex-shrink-0">
          {participantAvatar ? (
            <img
              src={participantAvatar}
              alt={participantName}
              className="w-14 h-14 rounded-full object-cover border-2 border-slate-700/50 shadow-lg transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform group-hover:scale-110 border-2 border-white/20">
              {participantName.charAt(0).toUpperCase()}
            </div>
          )}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          {unreadCount === 0 && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-bold text-base truncate ${
              unreadCount > 0 ? 'text-white' : 'text-slate-300'
            }`}>
              {participantName}
            </h4>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isMuted && (
                <span className="text-slate-500 text-base">🔇</span>
              )}
              {conversation.lastMessageAt && (
                <p className={`text-xs whitespace-nowrap ml-2 ${
                  unreadCount > 0 ? 'text-cyan-300/70' : 'text-slate-500'
                }`}>
                  {new Date(conversation.lastMessageAt).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
          
          {conversation.lastMessageContent && (
            <p className={`text-sm truncate leading-relaxed ${
              unreadCount > 0 ? 'text-slate-200 font-medium' : 'text-slate-400'
            }`}>
              {conversation.lastMessageContent}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

