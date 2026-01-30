/**
 * Mobile版本信箱页面组件
 * 与列表页面并列显示，不使用模态框
 */

import React, { useState, useEffect } from 'react';
import { MailboxMessage, Conversation, MessageCategory } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';
import { browserNotificationService } from '../../services/mailbox/BrowserNotificationService';
import { MobileComposeMessageModal } from '../components/modals/MobileComposeMessageModal';
import { logger } from '../../utils/logger';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileInputStyles, MobileColors } from '../components/MobileStyleGuide';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileEmptyState } from '../components/MobileEmptyState';

interface MobileMailboxScreenProps {
  token: string;
  currentUserId: number;
  onBack: () => void; // 保留接口，但不使用（一级页面）
}

type ViewMode = 'inbox' | 'conversations';
type InboxView = 'list' | 'detail';
type ConversationView = 'list' | 'chat';

/**
 * Mobile版本信箱页面组件
 * 与列表页面并列显示，不使用模态框
 */
export const MobileMailboxScreen: React.FC<MobileMailboxScreenProps> = ({
  token,
  currentUserId,
  onBack,
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
      logger.error('[MobileMailboxScreen] 请求浏览器通知权限失败:', error);
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
      logger.error('[MobileMailboxScreen] 加载消息失败:', error);
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
      logger.error('[MobileMailboxScreen] 加载对话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await mailboxApi.getUnreadCount(token);
      setUnreadCount(count);
    } catch (error) {
      logger.error('[MobileMailboxScreen] 加载未读数量失败:', error);
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
    <div
      className="h-full w-full flex flex-col"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* 头部 - 移动端优化 */}
      <div
        className="sticky top-0 z-20 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-md border-b px-4 py-3"
        style={{
          background: 'linear-gradient(to bottom, var(--bg-overlay-alpha), var(--bg-primary))',
          borderColor: 'var(--border-color-overlay)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 
              className="text-xl font-bold text-transparent bg-clip-text"
              style={{ backgroundImage: 'var(--gradient-text)' }}
            >
              📬 跨时空信箱
            </h2>
            {unreadCount > 0 && (
              <span 
                className="text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
                style={{ backgroundColor: 'var(--color-error)' }}
                aria-label={`${unreadCount} 条未读消息`}
                role="status"
                aria-live="polite"
              >
                {unreadCount}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <MobileTouchableButton
              onClick={() => setShowComposeModal(true)}
              variant="primary"
              size="sm"
              aria-label="撰写新消息"
            >
              <span aria-hidden="true">✉️</span>
            </MobileTouchableButton>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <input
            type="text"
            placeholder="搜索消息..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className={`${MobileInputStyles} text-sm`}
            aria-label="搜索消息"
          />
          <svg 
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style={{ color: 'var(--text-tertiary)' }}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 标签栏 - 移动端优化 */}
      <div
        className="sticky top-[88px] z-10 flex border-b backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--bg-overlay-alpha)',
          borderColor: 'var(--border-color-overlay)',
        }}
      >
        <button
          onClick={() => {
            setViewMode('inbox');
            setSelectedMessage(null);
            setInboxView('list');
          }}
          className="flex-1 py-3 font-semibold text-sm transition-all active:opacity-70 touch-manipulation min-h-[44px] border-b-2"
          style={{
            color: viewMode === 'inbox' ? 'var(--color-primary)' : 'var(--text-tertiary)',
            borderBottomColor: viewMode === 'inbox' ? 'var(--color-primary-alpha)' : 'transparent',
          }}
          aria-label="收件箱"
          aria-pressed={viewMode === 'inbox'}
          role="tab"
        >
          收件箱
        </button>
        <button
          onClick={() => {
            setViewMode('conversations');
            setSelectedConversation(null);
            setConversationView('list');
          }}
          className="flex-1 py-3 font-semibold text-sm transition-all active:opacity-70 touch-manipulation min-h-[44px] border-b-2"
          style={{
            color: viewMode === 'conversations' ? 'var(--color-primary)' : 'var(--text-tertiary)',
            borderBottomColor: viewMode === 'conversations' ? 'var(--color-primary-alpha)' : 'transparent',
          }}
          aria-label="对话"
          aria-pressed={viewMode === 'conversations'}
          role="tab"
        >
          对话
        </button>
      </div>

      {/* 内容区域 - 并列布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：列表区域 */}
        <div
          className={`flex-shrink-0 overflow-y-auto border-r ${
            selectedMessage || selectedConversation ? 'w-1/2' : 'w-full'
          }`}
          style={{ borderColor: 'var(--border-color-overlay)' }}
        >
          {viewMode === 'inbox' ? (
            <>
              {/* 分类选择 - 移动端横向滚动 */}
              {inboxView === 'list' && (
                <div
                  className="sticky top-0 z-10 backdrop-blur-sm border-b px-4 py-2 overflow-x-auto"
                  style={{
                    backgroundColor: 'var(--bg-overlay-alpha)',
                    borderColor: 'var(--border-color-overlay)',
                  }}
                >
                  <div className="flex gap-2 min-w-max">
                    <MobileTouchableButton
                      onClick={() => handleCategoryChange(undefined)}
                      variant={currentCategory === undefined ? 'primary' : 'secondary'}
                      size="sm"
                      className="whitespace-nowrap"
                      aria-label="全部消息"
                      aria-pressed={currentCategory === undefined}
                    >
                      全部
                    </MobileTouchableButton>
                    <MobileTouchableButton
                      onClick={() => handleCategoryChange(MessageCategory.ESOUL_LETTER)}
                      variant={currentCategory === MessageCategory.ESOUL_LETTER ? 'primary' : 'secondary'}
                      size="sm"
                      className="whitespace-nowrap"
                      aria-label="E-SOUL消息"
                      aria-pressed={currentCategory === MessageCategory.ESOUL_LETTER}
                    >
                      ✨ E-SOUL
                    </MobileTouchableButton>
                    <MobileTouchableButton
                      onClick={() => handleCategoryChange(MessageCategory.RESONANCE)}
                      variant={currentCategory === MessageCategory.RESONANCE ? 'primary' : 'secondary'}
                      size="sm"
                      className="whitespace-nowrap"
                      aria-label="共鸣消息"
                      aria-pressed={currentCategory === MessageCategory.RESONANCE}
                    >
                      💫 共鸣
                    </MobileTouchableButton>
                    <MobileTouchableButton
                      onClick={() => handleCategoryChange(MessageCategory.SYSTEM)}
                      variant={currentCategory === MessageCategory.SYSTEM ? 'primary' : 'secondary'}
                      size="sm"
                      className="whitespace-nowrap"
                      aria-label="系统消息"
                      aria-pressed={currentCategory === MessageCategory.SYSTEM}
                    >
                      ⚙️ 系统
                    </MobileTouchableButton>
                    <MobileTouchableButton
                      onClick={() => handleCategoryChange(MessageCategory.USER_MESSAGE)}
                      variant={currentCategory === MessageCategory.USER_MESSAGE ? 'primary' : 'secondary'}
                      size="sm"
                      className="whitespace-nowrap"
                      aria-label="用户消息"
                      aria-pressed={currentCategory === MessageCategory.USER_MESSAGE}
                    >
                      👤 用户
                    </MobileTouchableButton>
                  </div>
                </div>
              )}

              {/* 消息列表 */}
              {inboxView === 'list' && (
                <div className="p-4 space-y-3">
                  {loading ? (
                    <div className="flex justify-center py-12">
                      <MobileLoadingSpinner size="lg" text="加载中..." />
                    </div>
                  ) : filteredMessages.length === 0 ? (
                    <MobileEmptyState
                      icon="📭"
                      title="暂无消息"
                      description={searchKeyword ? `未找到"${searchKeyword}"相关消息` : "当前分类下暂无消息"}
                    />
                  ) : (
                    filteredMessages.map((message) => (
                      <div
                        key={message.id}
                        onClick={() => handleMessageClick(message)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleMessageClick(message);
                          }
                        }}
                        className={`backdrop-blur-md border rounded-xl p-4 transition-all cursor-pointer touch-manipulation ${
                          selectedMessage?.id === message.id
                            ? 'border-[var(--color-primary)] bg-[var(--bg-info-alpha)]'
                            : 'active:scale-[0.97]'
                        }`}
                        style={{
                          backgroundColor: selectedMessage?.id === message.id
                            ? 'var(--bg-info-alpha)'
                            : 'var(--bg-card)',
                          borderColor: selectedMessage?.id === message.id
                            ? 'var(--color-primary)'
                            : 'var(--border-color-overlay)',
                        }}
                        onTouchStart={(e) => {
                          if (selectedMessage?.id !== message.id) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (selectedMessage?.id !== message.id) {
                            e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={`打开消息: ${message.subject || '无标题'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3
                            className="font-semibold text-sm flex-1"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            {message.subject || '无标题'}
                          </h3>
                          {!message.isRead && (
                            <span 
                              className="w-2 h-2 rounded-full ml-2"
                              style={{ backgroundColor: 'var(--color-primary)' }}
                            ></span>
                          )}
                        </div>
                        <p
                          className="text-xs line-clamp-2 mb-2"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {message.content || ''}
                        </p>
                        <div
                          className="flex items-center justify-between text-xs"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
                          <span>{message.category}</span>
                          <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          ) : (
            /* 对话列表 */
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="flex justify-center py-12">
                  <MobileLoadingSpinner size="lg" text="加载中..." />
                </div>
              ) : conversations.length === 0 ? (
                <MobileEmptyState
                  icon="💬"
                  title="暂无对话"
                  description="还没有任何对话记录"
                />
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationClick(conversation)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleConversationClick(conversation);
                      }
                    }}
                    className={`backdrop-blur-md border rounded-xl p-4 transition-all cursor-pointer touch-manipulation ${
                      selectedConversation?.id === conversation.id
                        ? 'border-[var(--color-primary)] bg-[var(--bg-info-alpha)]'
                        : 'active:scale-[0.97]'
                    }`}
                    style={{
                      backgroundColor: selectedConversation?.id === conversation.id
                        ? 'var(--bg-info-alpha)'
                        : 'var(--bg-card)',
                      borderColor: selectedConversation?.id === conversation.id
                        ? 'var(--color-primary)'
                        : 'var(--border-color-overlay)',
                    }}
                    onTouchStart={(e) => {
                      if (selectedConversation?.id !== conversation.id) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }
                    }}
                    onTouchEnd={(e) => {
                      if (selectedConversation?.id !== conversation.id) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`打开与${conversation.participantName || '未知用户'}的对话`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className="font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {conversation.participantName || '未知用户'}
                      </h3>
                      {conversation.unreadCount > 0 && (
                        <span 
                          className="text-white text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--color-error)' }}
                        >
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs line-clamp-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {conversation.lastMessage?.content || ''}
                    </p>
                    <div
                      className="text-xs mt-2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {conversation.lastMessage?.createdAt 
                        ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
                        : ''}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 右侧：详情区域 */}
        {(selectedMessage || selectedConversation) && (
          <div 
            className="flex-1 overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 0.5))' }}
          >
            {selectedMessage && (
              <div className="p-4">
                <div 
                  className="backdrop-blur-md border rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.8))',
                    borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                    boxShadow: 'var(--shadow-primary-light, 0 10px 15px -3px rgba(168, 85, 247, 0.1))',
                  }}
                >
                  <h2 
                    className="font-bold text-lg mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedMessage.subject || '无标题'}
                  </h2>
                  <div 
                    className="text-xs mb-4"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                  <div 
                    className="whitespace-pre-wrap"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {selectedMessage.content || ''}
                  </div>
                </div>
              </div>
            )}
            
            {selectedConversation && (
              <div className="p-4">
                <div 
                  className="border rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.5))',
                    borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 0.5))',
                  }}
                >
                  <div 
                    className="font-semibold mb-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedConversation.participantName || '未知用户'}
                  </div>
                  <div className="space-y-3">
                    {selectedConversation.messages?.map((msg) => {
                      const isOwn = msg.senderId === currentUserId;
                      return (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg ${isOwn ? 'ml-auto text-right' : ''}`}
                          style={{
                            backgroundColor: isOwn
                              ? 'var(--color-primary, rgba(168, 85, 247, 0.3))'
                              : 'var(--bg-secondary, rgba(51, 65, 85, 0.5))',
                          }}
                        >
                          <div 
                            className="text-sm"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {msg.content}
                          </div>
                          <div 
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 写信模态框 */}
      {showComposeModal && (
        <MobileComposeMessageModal
          token={token}
          currentUserId={currentUserId}
          onClose={() => setShowComposeModal(false)}
          onSuccess={() => {
            handleMessageUpdate();
            logger.info('[MobileMailboxScreen] 消息发送成功');
          }}
        />
      )}
    </div>
  );
};
