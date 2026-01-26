import React, { useState, useEffect } from 'react';
import { MailboxMessage, Conversation, MessageCategory } from '../../types/mailbox';
import { mailboxApi } from '../../services/api/mailbox';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { ConversationList } from './ConversationList';
import { ConversationView } from './ConversationView';
import { UnreadBadge } from './UnreadBadge';
import { browserNotificationService } from '../../services/mailbox/BrowserNotificationService';
import { ComposeMessageModal } from './ComposeMessageModal';
import { logger } from '../../utils/logger';

interface UnifiedMailboxModalProps {
  token: string;
  currentUserId: number;
  onClose: () => void;
}

type ViewMode = 'inbox' | 'conversations';
type InboxView = 'list' | 'detail';
type ConversationView = 'list' | 'chat';

/**
 * 统一收件箱Modal组件
 * 整合所有消息类型和对话功能
 */
export const UnifiedMailboxModal: React.FC<UnifiedMailboxModalProps> = ({
  token,
  currentUserId,
  onClose,
  // 迁移功能已禁用
  // oldMails,
  // onMigrationComplete,
}) => {
  // const { state: gameState } = useGameState(); // 暂时保留，可能有其他用途
  const [viewMode, setViewMode] = useState<ViewMode>('inbox');
  const [inboxView, setInboxView] = useState<InboxView>('list');
  const [conversationView, setConversationView] = useState<ConversationView>('list');
  const [selectedMessage, setSelectedMessage] = useState<MailboxMessage | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentCategory, setCurrentCategory] = useState<MessageCategory | undefined>(undefined);
  const [searchKeyword, setSearchKeyword] = useState('');
  // 禁用迁移功能，直接使用新系统
  // const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);

  // 请求浏览器通知权限
  useEffect(() => {
    browserNotificationService.requestPermission().catch((error) => {
      logger.error('[UnifiedMailboxModal] 请求浏览器通知权限失败:', error);
    });
  }, []);

  // 不再自动检查和提示迁移，直接使用新系统

  // 消息列表刷新key，用于强制刷新
  const [messageListKey, setMessageListKey] = useState(0);

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

  // 处理消息更新（删除、标记已读等）
  const handleMessageUpdate = () => {
    // 刷新消息列表
    setMessageListKey(prev => prev + 1);
    // 刷新未读数量
    window.dispatchEvent(new CustomEvent('mailbox:unread-updated'));
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xl p-4 animate-fade-in"
      style={{
        background: 'var(--gradient-bg, linear-gradient(to bottom right, rgba(0, 0, 0, 0.95), rgba(88, 28, 135, 0.2), rgba(0, 0, 0, 0.95)))',
      }}
    >
      {/* 迁移功能已禁用，直接使用新系统 */}

      <div 
        className="border rounded-3xl w-full max-w-6xl h-[88vh] shadow-2xl overflow-hidden flex flex-col relative"
        style={{
          background: 'var(--gradient-bg, linear-gradient(to bottom right, #0f172a, #0f172a, #020617))',
          borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
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
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="absolute inset-0 blur-xl rounded-full"
                style={{
                  background: 'var(--bg-secondary-alpha)',
                }}
              ></div>
              <h2 
                className="relative text-2xl font-bold text-transparent bg-clip-text flex items-center gap-3"
                style={{ backgroundImage: 'var(--gradient-text)' }}
              >
                <span className="text-3xl animate-pulse">📬</span> 
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'var(--gradient-text)' }}
                >
                  跨时空信箱
                </span>
              </h2>
            </div>
            <UnreadBadge token={token} showNumber={true} />
          </div>
          
          <div className="flex items-center gap-3">
            {/* 写信按钮 */}
            <button
              onClick={() => setShowComposeModal(true)}
              className="px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-lg"
              style={{
                background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8)))',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, #a855f7, #f472b6))';
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl, 0 20px 25px -5px rgba(0, 0, 0, 0.1))';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8)))';
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              title="写信给管理员"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              写信
            </button>
            
            {/* 搜索框 */}
            <div className="relative group">
              <div 
                className="absolute inset-0 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'var(--bg-secondary-alpha)',
                }}
              ></div>
              <input
                type="text"
                placeholder="搜索消息..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="relative px-4 py-2.5 border rounded-xl text-sm outline-none transition-all backdrop-blur-sm w-64"
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
              />
              <svg 
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: 'var(--text-tertiary)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={onClose}
              className="rounded-xl p-2.5 backdrop-blur-sm transition-all active:scale-95 border"
              style={{
                color: 'var(--text-tertiary)',
                backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.5))';
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(71, 85, 105, 0.6))';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(71, 85, 105, 0.5))';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 标签栏 */}
        <div 
          className="flex border-b backdrop-blur-sm relative"
          style={{
            borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
            backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.3))',
          }}
        >
          <div 
            className="absolute bottom-0 left-0 right-0 h-[1px]"
            style={{
              background: 'var(--gradient-primary, linear-gradient(to right, transparent, rgba(147, 51, 234, 0.3), transparent))',
            }}
          />
          <button
            onClick={() => {
              setViewMode('inbox');
              setSelectedMessage(null);
              setInboxView('list');
            }}
            className="relative px-8 py-4 font-semibold transition-all duration-300"
            style={{
              color: viewMode === 'inbox'
                ? 'var(--color-primary, #c7d2fe)'
                : 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'inbox') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'inbox') {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              收件箱
            </span>
            {viewMode === 'inbox' && (
              <>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{
                    background: 'var(--gradient-primary, linear-gradient(to right, #ec4899, #9333ea))',
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'var(--gradient-bg, linear-gradient(to bottom, rgba(147, 51, 234, 0.1), transparent))',
                  }}
                />
              </>
            )}
            {viewMode === 'inbox' && (
              <UnreadBadge token={token} className="absolute -top-1 -right-1" />
            )}
          </button>
          
          <button
            onClick={() => {
              setViewMode('conversations');
              setSelectedConversation(null);
              setConversationView('list');
            }}
            className="relative px-8 py-4 font-semibold transition-all duration-300"
            style={{
              color: viewMode === 'conversations'
                ? 'var(--color-primary, #c7d2fe)'
                : 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'conversations') {
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'conversations') {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              对话
            </span>
            {viewMode === 'conversations' && (
              <>
                <div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full"
                  style={{
                    background: 'var(--gradient-primary, linear-gradient(to right, #ec4899, #9333ea))',
                  }}
                />
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'var(--gradient-bg, linear-gradient(to bottom, rgba(147, 51, 234, 0.1), transparent))',
                  }}
                />
              </>
            )}
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex">
          {viewMode === 'inbox' ? (
            <>
              {/* 分类侧边栏 */}
              <div 
                className="w-56 border-r backdrop-blur-sm p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
                style={{
                  borderColor: 'var(--bg-overlay, rgba(71, 85, 105, 0.5))',
                  background: 'var(--gradient-bg, linear-gradient(to bottom, rgba(15, 23, 42, 0.4), rgba(2, 6, 23, 0.4)))',
                }}
              >
                <div className="space-y-2">
                  <div 
                    className="text-xs font-semibold uppercase tracking-wider mb-4 px-3"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    消息分类
                  </div>
                  
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className="group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden border"
                    style={{
                      background: currentCategory === undefined
                        ? 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8)))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      color: currentCategory === undefined
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      borderColor: currentCategory === undefined
                        ? 'transparent'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                      transform: currentCategory === undefined ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentCategory === undefined
                        ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentCategory !== undefined) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory !== undefined) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {currentCategory === undefined && (
                      <div 
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
                        }}
                      />
                    )}
                    <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="relative z-10 font-medium">全部消息</span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.ESOUL_LETTER)}
                    className="group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between relative overflow-hidden border"
                    style={{
                      background: currentCategory === MessageCategory.ESOUL_LETTER
                        ? 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.8), rgba(236, 72, 153, 0.8)))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      color: currentCategory === MessageCategory.ESOUL_LETTER
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      borderColor: currentCategory === MessageCategory.ESOUL_LETTER
                        ? 'transparent'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                      transform: currentCategory === MessageCategory.ESOUL_LETTER ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentCategory === MessageCategory.ESOUL_LETTER
                        ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentCategory !== MessageCategory.ESOUL_LETTER) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory !== MessageCategory.ESOUL_LETTER) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {currentCategory === MessageCategory.ESOUL_LETTER && (
                      <div 
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: 'var(--gradient-primary, linear-gradient(to right, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2)))',
                        }}
                      />
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      E-SOUL来信
                    </span>
                    <UnreadBadge token={token} className="relative z-10" showNumber={false} />
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.RESONANCE)}
                    className="group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden border"
                    style={{
                      background: currentCategory === MessageCategory.RESONANCE
                        ? 'var(--gradient-primary, linear-gradient(to right, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8)))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      color: currentCategory === MessageCategory.RESONANCE
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      borderColor: currentCategory === MessageCategory.RESONANCE
                        ? 'transparent'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                      transform: currentCategory === MessageCategory.RESONANCE ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentCategory === MessageCategory.RESONANCE
                        ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentCategory !== MessageCategory.RESONANCE) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory !== MessageCategory.RESONANCE) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {currentCategory === MessageCategory.RESONANCE && (
                      <div 
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: 'var(--gradient-primary, linear-gradient(to right, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2)))',
                        }}
                      />
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">💫</span>
                      共鸣消息
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.SYSTEM)}
                    className="group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden border"
                    style={{
                      background: currentCategory === MessageCategory.SYSTEM
                        ? 'var(--gradient-primary, linear-gradient(to right, rgba(234, 179, 8, 0.8), rgba(245, 158, 11, 0.8)))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      color: currentCategory === MessageCategory.SYSTEM
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      borderColor: currentCategory === MessageCategory.SYSTEM
                        ? 'transparent'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                      transform: currentCategory === MessageCategory.SYSTEM ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentCategory === MessageCategory.SYSTEM
                        ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentCategory !== MessageCategory.SYSTEM) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory !== MessageCategory.SYSTEM) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {currentCategory === MessageCategory.SYSTEM && (
                      <div 
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: 'var(--gradient-primary, linear-gradient(to right, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.2)))',
                        }}
                      />
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      系统消息
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.USER_MESSAGE)}
                    className="group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden border"
                    style={{
                      background: currentCategory === MessageCategory.USER_MESSAGE
                        ? 'var(--gradient-primary, linear-gradient(to right, rgba(99, 102, 241, 0.8), rgba(147, 51, 234, 0.8)))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      color: currentCategory === MessageCategory.USER_MESSAGE
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      borderColor: currentCategory === MessageCategory.USER_MESSAGE
                        ? 'transparent'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                      transform: currentCategory === MessageCategory.USER_MESSAGE ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentCategory === MessageCategory.USER_MESSAGE
                        ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentCategory !== MessageCategory.USER_MESSAGE) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory !== MessageCategory.USER_MESSAGE) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {currentCategory === MessageCategory.USER_MESSAGE && (
                      <div 
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: 'var(--gradient-primary, linear-gradient(to right, rgba(99, 102, 241, 0.2), rgba(147, 51, 234, 0.2)))',
                        }}
                      />
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      用户消息
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.WARM_MESSAGE)}
                    className="group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden border"
                    style={{
                      background: currentCategory === MessageCategory.WARM_MESSAGE
                        ? 'var(--gradient-primary, linear-gradient(to right, rgba(236, 72, 153, 0.8), rgba(244, 63, 94, 0.8)))'
                        : 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
                      color: currentCategory === MessageCategory.WARM_MESSAGE
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                      borderColor: currentCategory === MessageCategory.WARM_MESSAGE
                        ? 'transparent'
                        : 'var(--bg-overlay, rgba(71, 85, 105, 0.3))',
                      transform: currentCategory === MessageCategory.WARM_MESSAGE ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: currentCategory === MessageCategory.WARM_MESSAGE
                        ? 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))'
                        : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (currentCategory !== MessageCategory.WARM_MESSAGE) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(51, 65, 85, 0.7))';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentCategory !== MessageCategory.WARM_MESSAGE) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(30, 41, 59, 0.5))';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    {currentCategory === MessageCategory.WARM_MESSAGE && (
                      <div 
                        className="absolute inset-0 animate-pulse"
                        style={{
                          background: 'var(--gradient-primary, linear-gradient(to right, rgba(236, 72, 153, 0.2), rgba(244, 63, 94, 0.2)))',
                        }}
                      />
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">💌</span>
                      暖心留言
                    </span>
                  </button>
                </div>
              </div>

              {/* 消息列表/详情 */}
              <div className="flex-1 overflow-hidden">
                {inboxView === 'list' ? (
                  <MessageList
                    key={messageListKey}
                    token={token}
                    category={currentCategory}
                    onMessageClick={handleMessageClick}
                  />
                ) : selectedMessage ? (
                  <MessageDetail
                    message={selectedMessage}
                    token={token}
                    onBack={handleBackToInboxList}
                    onUpdate={(updatedMessage) => {
                      setSelectedMessage(updatedMessage);
                      handleMessageUpdate();
                    }}
                  />
                ) : null}
              </div>
            </>
          ) : (
            /* 对话视图 */
            <div className="flex-1 overflow-hidden">
              {conversationView === 'list' ? (
                <ConversationList
                  token={token}
                  onConversationClick={handleConversationClick}
                />
              ) : selectedConversation ? (
                <ConversationView
                  conversation={selectedConversation}
                  token={token}
                  currentUserId={currentUserId}
                  onBack={handleBackToConversationList}
                />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* 写信模态框 */}
      {showComposeModal && (
        <ComposeMessageModal
          token={token}
          currentUserId={currentUserId}
          onClose={() => setShowComposeModal(false)}
          onSuccess={() => {
            // 可以在这里刷新消息列表
            logger.info('[UnifiedMailboxModal] 消息发送成功');
          }}
        />
      )}
    </div>
  );
};

