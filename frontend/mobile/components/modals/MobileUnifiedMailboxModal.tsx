import React, { useState, useEffect } from 'react';
import { MailboxMessage, Conversation, MessageCategory } from '../../../types/mailbox';
import { mailboxApi } from '../../../services/api/mailbox';
import { browserNotificationService } from '../../../services/mailbox/BrowserNotificationService';
import { ComposeMessageModal } from '../../../components/mailbox/ComposeMessageModal';
import { logger } from '../../../utils/logger';

interface MobileUnifiedMailboxModalProps {
  token: string;
  currentUserId: number;
  onClose: () => void;
}

type ViewMode = 'inbox' | 'conversations';
type InboxView = 'list' | 'detail';
type ConversationView = 'list' | 'chat';

/**
 * Mobile版本统一收件箱Modal组件
 * 适配移动端UI/UX，复用PC版本的业务逻辑
 */
export const MobileUnifiedMailboxModal: React.FC<MobileUnifiedMailboxModalProps> = ({
  token,
  currentUserId,
  onClose,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const [inboxView, setInboxView] = useState<InboxView>('list');
  const [conversationView, setConversationView] = useState<ConversationView>('list');
  const [selectedMessage, setSelectedMessage] = useState<MailboxMessage | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentCategory, setCurrentCategory] = useState<MessageCategory | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 请求浏览器通知权限
  useEffect(() => {
    browserNotificationService.requestPermission().catch((error) => {
      logger.error('[MobileUnifiedMailboxModal] 请求浏览器通知权限失败:', error);
    });
  }, []);

  // 加载消息列表
  useEffect(() => {
    if (viewMode === 'inbox') {
      loadMessages();
    } else {
      loadConversations();
    }
  }, [viewMode, currentCategory, token]);

  // 加载未读数量
  useEffect(() => {
    loadUnreadCount();
  }, [token]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await mailboxApi.getMessages(token, {
        category: currentCategory,
        page: 1,
        pageSize: 50,
      });
      setMessages(data.items || []);
    } catch (error) {
      logger.error('[MobileUnifiedMailboxModal] 加载消息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await mailboxApi.getConversations(token, {
        page: 1,
        pageSize: 50,
      });
      setConversations(data.items || []);
    } catch (error) {
      logger.error('[MobileUnifiedMailboxModal] 加载对话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await mailboxApi.getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      logger.error('[MobileUnifiedMailboxModal] 加载未读数量失败:', error);
    }
  };

  const handleMessageClick = (message: MailboxMessage) => {
    setSelectedMessage(message);
    setInboxView('detail');
  };

  const handleConversationClick = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setConversationView('chat');
  };

  const handleBackToInboxList = () => {
    setSelectedMessage(null);
    setInboxView('list');
  };

  const handleBackToConversationList = () => {
    setSelectedConversation(null);
    setConversationView('list');
  };

  const handleCategoryChange = (category: MessageCategory | undefined) => {
    setCurrentCategory(category);
    setSelectedMessage(null);
    setInboxView('list');
  };

  const handleMessageUpdate = () => {
    loadMessages();
    loadUnreadCount();
    window.dispatchEvent(new CustomEvent('mailbox:unread-updated'));
  };

  // 过滤消息
  const filteredMessages = messages.filter(msg => {
    if (searchKeyword) {
      return msg.subject?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
             msg.content?.toLowerCase().includes(searchKeyword.toLowerCase());
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl">
      {/* 头部 - 移动端优化 */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              📬 跨时空信箱
            </h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComposeModal(true)}
              className="p-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white rounded-lg text-sm"
            >
              ✉️
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索消息..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
          />
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 标签栏 - 移动端优化 */}
      <div className="sticky top-[88px] z-10 flex border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm">
        <button
          onClick={() => {
            setViewMode('inbox');
            setSelectedMessage(null);
            setInboxView('list');
          }}
          className={`flex-1 py-3 font-semibold text-sm transition-all ${
            viewMode === 'inbox'
              ? 'text-purple-300 border-b-2 border-purple-500'
              : 'text-slate-400'
          }`}
        >
          收件箱
        </button>
        <button
          onClick={() => {
            setViewMode('conversations');
            setSelectedConversation(null);
            setConversationView('list');
          }}
          className={`flex-1 py-3 font-semibold text-sm transition-all ${
            viewMode === 'conversations'
              ? 'text-purple-300 border-b-2 border-purple-500'
              : 'text-slate-400'
          }`}
        >
          对话
        </button>
      </div>

      {/* 内容区域 */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto">
        {viewMode === 'inbox' ? (
          <>
            {/* 分类选择 - 移动端横向滚动 */}
            {inboxView === 'list' && (
              <div className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2 overflow-x-auto">
                <div className="flex gap-2 min-w-max">
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      currentCategory === undefined
                        ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.ESOUL_LETTER)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      currentCategory === MessageCategory.ESOUL_LETTER
                        ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    ✨ E-SOUL
                  </button>
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.RESONANCE)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      currentCategory === MessageCategory.RESONANCE
                        ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    💫 共鸣
                  </button>
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.SYSTEM)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      currentCategory === MessageCategory.SYSTEM
                        ? 'bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    ⚙️ 系统
                  </button>
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.USER_MESSAGE)}
                    className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                      currentCategory === MessageCategory.USER_MESSAGE
                        ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white'
                        : 'bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    👤 用户
                  </button>
                </div>
              </div>
            )}

            {/* 消息列表/详情 */}
            {inboxView === 'list' ? (
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="text-center text-slate-400 py-8">加载中...</div>
                ) : filteredMessages.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">暂无消息</div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 active:bg-slate-700/70 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-white font-semibold text-sm flex-1">{message.subject || '无标题'}</h3>
                        {!message.isRead && (
                          <span className="w-2 h-2 bg-purple-500 rounded-full ml-2"></span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2 mb-2">
                        {message.content || ''}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{message.category}</span>
                        <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : selectedMessage ? (
              <div className="p-4">
                <button
                  onClick={handleBackToInboxList}
                  className="mb-4 text-purple-400 text-sm flex items-center gap-2"
                >
                  ← 返回
                </button>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <h2 className="text-white font-bold text-lg mb-2">{selectedMessage.subject || '无标题'}</h2>
                  <div className="text-slate-400 text-xs mb-4">
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                  <div className="text-slate-300 whitespace-pre-wrap">
                    {selectedMessage.content || ''}
                  </div>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          /* 对话视图 */
          <div className="p-4">
            {conversationView === 'list' ? (
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center text-slate-400 py-8">加载中...</div>
                ) : conversations.length === 0 ? (
                  <div className="text-center text-slate-400 py-8">暂无对话</div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 active:bg-slate-700/70 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{conversation.participantName || '未知用户'}</h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-2">
                        {conversation.lastMessage?.content || ''}
                      </p>
                      <div className="text-slate-500 text-xs mt-2">
                        {conversation.lastMessage?.createdAt 
                          ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                          : ''}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : selectedConversation ? (
              <div>
                <button
                  onClick={handleBackToConversationList}
                  className="mb-4 text-purple-400 text-sm flex items-center gap-2"
                >
                  ← 返回
                </button>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                  <div className="text-white font-semibold mb-4">
                    {selectedConversation.participantName || '未知用户'}
                  </div>
                  <div className="space-y-3">
                    {selectedConversation.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.senderId === currentUserId
                            ? 'bg-purple-600/30 ml-auto text-right'
                            : 'bg-slate-700/50'
                        }`}
                      >
                        <div className="text-slate-300 text-sm">{msg.content}</div>
                        <div className="text-slate-500 text-xs mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* 写信模态框 */}
      {showComposeModal && (
        <ComposeMessageModal
          token={token}
          currentUserId={currentUserId}
          onClose={() => setShowComposeModal(false)}
          onSuccess={() => {
            handleMessageUpdate();
            logger.info('[MobileUnifiedMailboxModal] 消息发送成功');
          }}
        />
      )}
    </div>
  );
};
