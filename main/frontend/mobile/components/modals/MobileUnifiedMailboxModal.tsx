import React, { useState, useEffect, useCallback } from 'react';
import { MailboxMessage, Conversation, MessageCategory } from '../../../types/mailbox';
import { mailboxApi } from '../../../services/api/mailbox';
import { browserNotificationService } from '../../../services/mailbox/BrowserNotificationService';
import { MobileComposeMessageModal } from './MobileComposeMessageModal';
import { logger } from '../../../utils/logger';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileInputStyles, MobileColors } from '../MobileStyleGuide';
import { MobileBackButton } from '../MobileBackButton';
import { MobileLoadingSpinner } from '../MobileLoadingSpinner';
import { MobileEmptyState } from '../MobileEmptyState';

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

  // ESC键关闭
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 点击背景关闭
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

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
      className="fixed inset-0 z-50 backdrop-blur-sm flex flex-col"
      style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.6))' }}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mailbox-modal-title"
    >
      <div
        className="flex-1 flex flex-col backdrop-blur-xl animate-scale-in"
        style={{
          backgroundColor: 'var(--bg-modal, rgba(15, 23, 42, 0.95))',
          animationDuration: '200ms',
          animationTimingFunction: 'ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          }
        }}
      >
        {/* 头部 - 移动端优化 */}
        <div 
          className="sticky top-0 z-20 pt-[calc(1rem+env(safe-area-inset-top))] backdrop-blur-md border-b px-4 py-3"
          style={{
            background: 'linear-gradient(to bottom, var(--bg-modal, rgba(15, 23, 42, 0.95)), var(--bg-primary, rgba(2, 6, 23, 0.95)))',
            borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 
                id="mailbox-modal-title" 
                className="text-xl font-bold"
                style={{
                  background: 'var(--gradient-text-primary, linear-gradient(to right, var(--color-primary, #818cf8), var(--color-primary, #c084fc)))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                📬 跨时空信箱
              </h2>
              {unreadCount > 0 && (
                <span 
                  className="text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center"
                  style={{
                    backgroundColor: 'var(--color-error, #ef4444)',
                    color: 'var(--text-primary)',
                  }}
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
              <MobileTouchableButton
                onClick={onClose}
                variant="ghost"
                size="sm"
                style={{ color: 'var(--text-tertiary)' }}
                aria-label="关闭"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
            borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
            backgroundColor: 'var(--bg-modal, rgba(15, 23, 42, 0.8))',
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
              color: viewMode === 'inbox'
                ? 'var(--color-primary, #c084fc)'
                : 'var(--text-tertiary)',
              borderBottomColor: viewMode === 'inbox'
                ? 'var(--color-primary, rgba(168, 85, 247, 0.5))'
                : 'transparent',
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
              color: viewMode === 'conversations'
                ? 'var(--color-primary, #c084fc)'
                : 'var(--text-tertiary)',
              borderBottomColor: viewMode === 'conversations'
                ? 'var(--color-primary, rgba(168, 85, 247, 0.5))'
                : 'transparent',
            }}
            aria-label="对话"
            aria-pressed={viewMode === 'conversations'}
            role="tab"
          >
            对话
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto pb-[calc(4rem+env(safe-area-inset-bottom))]">
        {viewMode === 'inbox' ? (
          <>
            {/* 分类选择 - 移动端横向滚动 */}
            {inboxView === 'list' && (
              <div 
                className="sticky top-0 z-10 backdrop-blur-sm border-b px-4 py-2 overflow-x-auto"
                style={{
                  backgroundColor: 'var(--bg-modal, rgba(15, 23, 42, 0.9))',
                  borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 0.5))',
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

            {/* 消息列表/详情 */}
            {inboxView === 'list' ? (
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
                      className="backdrop-blur-md border rounded-xl p-4 active:scale-[0.97] transition-all cursor-pointer touch-manipulation"
                      style={{
                        backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 0.8))',
                        borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card-hover, rgba(51, 65, 85, 0.8))';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card, rgba(30, 41, 59, 0.8))';
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
                            style={{ backgroundColor: 'var(--color-primary, #a855f7)' }}
                          />
                        )}
                      </div>
                      <p 
                        className="text-xs line-clamp-2 mb-2"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        {message.content || ''}
                      </p>
                      <div 
                        className="flex items-center justify-between text-xs"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        <span>{message.category}</span>
                        <span>{new Date(message.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : selectedMessage ? (
              <div className="p-4">
                <MobileBackButton
                  onClick={handleBackToInboxList}
                  className="mb-4"
                  aria-label="返回消息列表"
                />
                <div 
                  className="backdrop-blur-md border rounded-xl p-4 shadow-lg"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color-overlay)',
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
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {new Date(selectedMessage.createdAt).toLocaleString()}
                  </div>
                  <div 
                    className="whitespace-pre-wrap"
                    style={{ color: 'var(--text-primary)' }}
                  >
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
                      className="backdrop-blur-md border rounded-xl p-4 active:scale-[0.97] transition-all cursor-pointer touch-manipulation"
                      style={{
                        backgroundColor: 'var(--bg-card)',
                        borderColor: 'var(--border-color-overlay)',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-card)';
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
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--color-error)',
                              color: 'var(--text-primary)',
                            }}
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
            ) : selectedConversation ? (
              <div>
                <button
                  onClick={handleBackToConversationList}
                  className="mb-4 text-sm flex items-center gap-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  ← 返回
                </button>
                <div 
                  className="border rounded-xl p-4"
                  style={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-color-overlay)',
                  }}
                >
                  <div 
                    className="font-semibold mb-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {selectedConversation.participantName || '未知用户'}
                  </div>
                  <div className="space-y-3">
                    {selectedConversation.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.senderId === currentUserId
                            ? 'ml-auto text-right'
                            : ''
                        }`}
                        style={{
                          backgroundColor: msg.senderId === currentUserId
                            ? 'var(--bg-secondary-alpha)'
                            : 'var(--bg-overlay-alpha)',
                        }}
                      >
                        <div 
                          className="text-sm"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {msg.content}
                        </div>
                        <div 
                          className="text-xs mt-1"
                          style={{ color: 'var(--text-tertiary)' }}
                        >
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
          <MobileComposeMessageModal
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
    </div>
  );
};
