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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/95 via-purple-900/20 to-black/95 backdrop-blur-xl p-4 animate-fade-in">
      {/* 迁移功能已禁用，直接使用新系统 */}

      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-700/50 rounded-3xl w-full max-w-6xl h-[88vh] shadow-2xl shadow-purple-900/20 overflow-hidden flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-900/10 before:to-transparent before:pointer-events-none">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-slate-950/80 to-slate-900/80 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl rounded-full"></div>
              <h2 className="relative text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 flex items-center gap-3">
                <span className="text-3xl animate-pulse">📬</span> 
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
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
              className="px-4 py-2 bg-gradient-to-r from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all duration-200 font-medium text-sm flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95"
              title="写信给管理员"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              写信
            </button>
            
            {/* 搜索框 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <input
                type="text"
                placeholder="搜索消息..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="relative px-4 py-2.5 bg-slate-800/80 border border-slate-600/50 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all backdrop-blur-sm w-64"
              />
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-xl p-2.5 backdrop-blur-sm transition-all hover:scale-110 active:scale-95 border border-slate-700/50 hover:border-slate-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 标签栏 */}
        <div className="flex border-b border-slate-700/50 bg-slate-900/30 backdrop-blur-sm relative">
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"></div>
          <button
            onClick={() => {
              setViewMode('inbox');
              setSelectedMessage(null);
              setInboxView('list');
            }}
            className={`relative px-8 py-4 font-semibold transition-all duration-300 ${
              viewMode === 'inbox'
                ? 'text-purple-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              收件箱
            </span>
            {viewMode === 'inbox' && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-full"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
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
            className={`relative px-8 py-4 font-semibold transition-all duration-300 ${
              viewMode === 'conversations'
                ? 'text-purple-300'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              对话
            </span>
            {viewMode === 'conversations' && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-t-full"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 to-transparent"></div>
              </>
            )}
          </button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex">
          {viewMode === 'inbox' ? (
            <>
              {/* 分类侧边栏 */}
              <div className="w-56 border-r border-slate-700/50 bg-gradient-to-b from-slate-900/40 to-slate-950/40 backdrop-blur-sm p-5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                    消息分类
                  </div>
                  
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden ${
                      currentCategory === undefined
                        ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow-lg shadow-purple-500/20 scale-105'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
                    }`}
                  >
                    {currentCategory === undefined && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                    )}
                    <svg className="relative z-10 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                    <span className="relative z-10 font-medium">全部消息</span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.ESOUL_LETTER)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between relative overflow-hidden ${
                      currentCategory === MessageCategory.ESOUL_LETTER
                        ? 'bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow-lg shadow-purple-500/20 scale-105'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
                    }`}
                  >
                    {currentCategory === MessageCategory.ESOUL_LETTER && (
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">✨</span>
                      E-SOUL来信
                    </span>
                    <UnreadBadge token={token} className="relative z-10" showNumber={false} />
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.RESONANCE)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden ${
                      currentCategory === MessageCategory.RESONANCE
                        ? 'bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-lg shadow-cyan-500/20 scale-105'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
                    }`}
                  >
                    {currentCategory === MessageCategory.RESONANCE && (
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">💫</span>
                      共鸣消息
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.SYSTEM)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden ${
                      currentCategory === MessageCategory.SYSTEM
                        ? 'bg-gradient-to-r from-yellow-600/80 to-amber-600/80 text-white shadow-lg shadow-yellow-500/20 scale-105'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
                    }`}
                  >
                    {currentCategory === MessageCategory.SYSTEM && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 animate-pulse"></div>
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">⚙️</span>
                      系统消息
                    </span>
                  </button>
                  
                  <button
                    onClick={() => handleCategoryChange(MessageCategory.USER_MESSAGE)}
                    className={`group w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 relative overflow-hidden ${
                      currentCategory === MessageCategory.USER_MESSAGE
                        ? 'bg-gradient-to-r from-indigo-600/80 to-purple-600/80 text-white shadow-lg shadow-indigo-500/20 scale-105'
                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/70 hover:scale-102 border border-slate-700/30'
                    }`}
                  >
                    {currentCategory === MessageCategory.USER_MESSAGE && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-pulse"></div>
                    )}
                    <span className="relative z-10 font-medium flex items-center gap-2">
                      <span className="text-lg">👤</span>
                      用户消息
                    </span>
                  </button>
                </div>
              </div>

              {/* 消息列表/详情 */}
              <div className="flex-1 overflow-hidden">
                {inboxView === 'list' ? (
                  <MessageList
                    token={token}
                    category={currentCategory}
                    onMessageClick={handleMessageClick}
                  />
                ) : selectedMessage ? (
                  <MessageDetail
                    message={selectedMessage}
                    token={token}
                    onBack={handleBackToInboxList}
                    onUpdate={(updated) => setSelectedMessage(updated)}
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

