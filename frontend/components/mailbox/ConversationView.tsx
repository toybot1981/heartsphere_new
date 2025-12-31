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
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950">
      {/* 头部 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-950/80 to-slate-900/80 backdrop-blur-sm relative z-10">
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-all duration-200 mr-4 p-2 rounded-lg hover:bg-slate-800/50 active:scale-95"
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
              className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30 shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/20">
              {(conversation as any).participant2Name?.charAt(0) || '?'}
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold text-white">
              {(conversation as any).participant2Name || '未知用户'}
            </h2>
            <p className="text-xs text-slate-400">在线</p>
          </div>
        </div>
      </div>

      {/* 消息列表 */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 scrollbar-thin scrollbar-thumb-slate-700/50 scrollbar-track-transparent"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.03) 0%, transparent 50%)`
        }}
      >
        {hasMore && (
          <div className="text-center pb-4">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="text-slate-400 hover:text-white text-sm px-5 py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/70 transition-all duration-200 disabled:opacity-50 border border-slate-700/30 font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
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
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400">加载中...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="text-6xl mb-6 animate-bounce">💬</div>
            <p className="text-lg font-medium mb-2">暂无消息</p>
            <p className="text-sm text-slate-600">开始对话吧！</p>
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
      <div className="px-6 py-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-950/80 to-slate-900/80 backdrop-blur-sm">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Enter发送，Shift+Enter换行)"
              className="w-full px-5 py-3 bg-slate-800/80 text-white rounded-2xl border border-slate-700/50 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none resize-none transition-all placeholder-slate-500"
              rows={1}
              disabled={sending}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-500 hover:to-pink-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
          <div className="text-xs text-slate-500 mb-1.5 ml-2 font-medium">
            {message.senderType === 'system' ? '系统' : '用户'}
          </div>
        )}
        <div
          className={`px-5 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:scale-[1.02] ${
            isOwn
              ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-br-sm'
              : 'bg-slate-800/80 text-slate-200 border border-slate-700/50 rounded-bl-sm backdrop-blur-sm'
          }`}
        >
          <div className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</div>
          {message.isEdited && (
            <div className="text-xs opacity-70 mt-1.5 italic">(已编辑)</div>
          )}
        </div>
        <div className={`text-xs text-slate-500 mt-1.5 ${isOwn ? 'mr-2' : 'ml-2'} flex items-center gap-1`}>
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

