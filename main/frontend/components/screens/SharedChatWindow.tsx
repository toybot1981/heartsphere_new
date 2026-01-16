/**
 * 共享模式聊天窗口组件
 * 独立页面，专门用于在共享模式下与角色对话
 * 消息会保存到临时存储，不会影响主人的数据
 * 样式与ChatWindow保持一致，复用公共组件
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Character, Message, AppSettings, UserProfile } from '../../types';
import { Button } from '../Button';
import { sharedApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { useSharedMode } from '../../hooks/useSharedMode';
import { generateAIResponse } from '../chat/utils/generateAIResponse';
import { createErrorMessage, getErrorMessage } from '../../utils/chat/errorHandling';
import { MessageList } from '../chat/MessageList';
import { ChatInput } from '../chat/ChatInput';
import { useUIState } from '../chat/hooks/useUIState';
import { showAlert } from '../../utils/dialog';
import { AIConfigManager } from '../../services/ai/config';
import { logger } from '../../utils/logger';
import { TeleportationManager } from '../portal';
import { usePortal } from '../../hooks/usePortal';

interface SharedChatWindowProps {
  character: Character;
  history: Message[];
  settings: AppSettings;
  userProfile: UserProfile;
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onBack: () => void;
}

export const SharedChatWindow: React.FC<SharedChatWindowProps> = ({
  character,
  history,
  settings,
  userProfile,
  onUpdateHistory,
  onBack,
}) => {
  const { shareConfig, isActive } = useSharedMode();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);
  const lastHistoryLengthRef = useRef(0);
  const safeHistory = Array.isArray(history) ? history : [];
  const uiState = useUIState();

  // 会话ID：基于角色ID和共享配置ID
  const sessionId = `shared_${shareConfig?.id || 'unknown'}_${character.id}`;

  // 提取场景ID（eraId）用于传送门
  const sceneId = character.eraId ? parseInt(character.eraId) : null;
  
  // 传送门系统：加载传送门列表用于显示
  // usePortal hook 会在 sceneId 变化时自动加载，不需要手动调用 loadPortals
  const { portals, loadPortals, loading: portalsLoading } = usePortal(sceneId || undefined);

  // 调试：手动触发加载（用于测试 loading 状态）
  // 注意：usePortal 内部已经自动加载，这里只是为了调试
  useEffect(() => {
    if (sceneId) {
    } else {
      logger.warn('[SharedChatWindow] ⚠️ 场景ID为空，无法加载传送门');
    }
  }, [sceneId, portalsLoading, portals.length]);

  // 检查用户是否在底部附近（距离底部小于 100px 视为在底部）
  const isNearBottom = useCallback((): boolean => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    return distanceFromBottom < 100;
  }, []);

  // 滚动到底部（使用 scrollTop 而不是 scrollIntoView，更精确控制）
  const scrollToBottom = useCallback((force: boolean = false) => {
    const container = messagesContainerRef.current;
    if (!container) return;
    
    // 如果用户正在手动滚动，不自动滚动
    if (!force && isUserScrollingRef.current) {
      return;
    }
    
    // 如果不在底部且不是强制滚动，不自动滚动
    if (!force && !isNearBottom()) {
      return;
    }
    
    // 使用 requestAnimationFrame 确保 DOM 已更新
    requestAnimationFrame(() => {
      if (!container) return;
      const { scrollHeight } = container;
      // 直接设置 scrollTop，避免 scrollIntoView 的副作用
      container.scrollTop = scrollHeight;
    });
  }, [isNearBottom]);

  // 监听滚动事件，检测用户是否在查看历史消息
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    let scrollTimeout: NodeJS.Timeout;
    let isScrolling = false;

    const handleScroll = () => {
      // 标记用户正在滚动
      isUserScrollingRef.current = true;
      isScrolling = true;
      
      // 清除之前的定时器
      clearTimeout(scrollTimeout);
      
      // 如果用户停止滚动超过 500ms，才允许自动滚动
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        // 检查是否在底部，如果在底部则允许自动滚动
        if (isNearBottom()) {
          isUserScrollingRef.current = false;
        }
      }, 500);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isNearBottom]);

  // 当消息列表更新时，智能滚动
  useEffect(() => {
    const historyLength = safeHistory.length;
    const prevLength = lastHistoryLengthRef.current;
    
    // 只在消息数量增加时考虑滚动（新消息到达）
    if (historyLength > prevLength) {
      // 延迟检查，确保 DOM 已更新
      setTimeout(() => {
        // 只有在用户在底部附近且没有手动滚动时才滚动
        if (!isUserScrollingRef.current && isNearBottom()) {
          scrollToBottom(false);
        }
      }, 50);
    } else if (historyLength < prevLength) {
      // 消息被清空，重置滚动位置
      scrollToBottom(true);
    }
    
    lastHistoryLengthRef.current = historyLength;
  }, [safeHistory.length, scrollToBottom, isNearBottom]);

  // 加载消息历史（独立的权限控制和数据加载）
  const historyLoadedRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!isActive || !shareConfig) {
      onBack();
    }
  }, [isActive, shareConfig, onBack]);
  
  useEffect(() => {
    const loadHistory = async () => {
      if (!isActive || !shareConfig) {
        historyLoadedRef.current = null;
        return;
      }

      if (historyLoadedRef.current === sessionId) {
        return;
      }

      try {
        const token = getToken();
        if (!token) {
          return;
        }

        const result = await sharedApi.getChatMessages(sessionId, token, 100);

        if (result && result.messages) {
          const messages: Message[] = result.messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            role: msg.role === 'USER' ? 'user' : 'model',
            text: msg.content || '',
            timestamp: msg.timestamp || Date.now(),
          }));

          // 加载历史消息时，标记为用户滚动，避免自动滚动
          isUserScrollingRef.current = true;
          onUpdateHistory(messages);
          historyLoadedRef.current = sessionId;
          
          // 加载完成后，滚动到底部（首次加载）
          setTimeout(() => {
            if (messages.length > 0) {
              scrollToBottom(true);
              // 重置滚动标志，允许后续自动滚动
              setTimeout(() => {
                isUserScrollingRef.current = false;
              }, 500);
            }
          }, 100);
        }
      } catch (err) {
        logger.error('[SharedChatWindow] 加载消息历史失败:', err);
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, shareConfig, sessionId]);

  // 发送消息（独立的API调用逻辑）
  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !isActive || !shareConfig) {
      return;
    }

    const userText = input.trim();
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    // 更新本地历史
    onUpdateHistory((prev: Message[]) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // 发送消息后，强制滚动到底部（用户主动发送，应该滚动）
    // 延迟一点确保 DOM 更新
    setTimeout(() => {
      isUserScrollingRef.current = false; // 重置滚动标志
      scrollToBottom(true);
    }, 150);

    try {
      const token = getToken();
      if (!token) {
        throw new Error('未登录');
      }

      // 保存用户消息到后端（独立的API调用）
      await sharedApi.saveChatMessage(
        sessionId,
        'USER',
        userMessage.text,
        token,
        undefined,
        0.5
      );

      const config = await AIConfigManager.getUserConfig();
      const tempBotId = `shared_${Date.now()}`;
      const historyWithUserMsg = [...safeHistory, userMessage];
      
      await generateAIResponse({
        userText,
        userMsg: userMessage,
        historyWithUserMsg,
        character,
        settings,
        userProfile,
        tempBotId,
        onUpdateHistory,
        setIsLoading,
        engine: undefined,
        engineReady: false,
        memorySystem: undefined,
        relevantMemories: [],
        onComplete: async (fullText, requestId) => {
          try {
            await sharedApi.saveChatMessage(
              sessionId,
              'ASSISTANT',
              fullText,
              token,
              undefined,
              0.5
            );
            // AI 回复完成后，只有在用户在底部时才滚动
            setTimeout(() => {
              if (isNearBottom() && !isUserScrollingRef.current) {
                scrollToBottom(false);
              }
            }, 200);
          } catch (saveError) {
            logger.error('[SharedChatWindow] 保存助手消息失败:', saveError);
          }
        },
      });
    } catch (err: any) {
      logger.error('[SharedChatWindow] 发送消息失败:', err);
      const errorMessage = createErrorMessage(`msg_${Date.now()}_error`, err);
      onUpdateHistory((prev: Message[]) => [...prev, errorMessage]);
      showAlert(errorMessage.text, '错误', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isActive, shareConfig, safeHistory, character, settings, userProfile, sessionId, onUpdateHistory]);

  // 清空对话（独立的API调用）
  const handleClear = useCallback(async () => {
    if (!confirm('确定要清空对话历史吗？')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        showAlert('未登录，无法清空对话', '提示', 'warning');
        return;
      }

      await sharedApi.clearChatSession(sessionId, token);
      onUpdateHistory([]);
      showAlert('对话历史已清空', '成功', 'success');
    } catch (err) {
      logger.error('[SharedChatWindow] 清空对话失败:', err);
      // 清空后重置加载标记
      historyLoadedRef.current = null;
      showAlert('清空对话失败，请稍后重试', '错误', 'error');
    }
  }, [sessionId, onUpdateHistory]);

  // 背景图片
  const backgroundImage = character.backgroundUrl;

  if (!isActive || !shareConfig) {
    return (
      <div className="relative h-screen w-full overflow-hidden bg-black text-white font-sans">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-1000" style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined, filter: 'blur(4px) opacity(0.6)' }} />
        <div className="h-full flex items-center justify-center relative z-10">
          <div className="text-center">
            <p className="text-gray-400 mb-4">未进入共享模式</p>
            <Button onClick={onBack}>返回</Button>
          </div>
        </div>
      </div>
    );
  }

  // 处理传送完成
  const handleTeleportationComplete = useCallback(async (targetHeartsphereId: number, targetShareCode?: string) => {
    
    if (!targetShareCode) {
      logger.warn('[SharedChatWindow] ⚠️ 传送完成但 targetShareCode 为空，无法跳转', { targetHeartsphereId });
      alert('传送完成，但目标共享码不存在，无法跳转到目标心域');
      return;
    }
    
    // 通过共享码传送到另一个心域
    try {
      // 先尝试通过 API 获取共享配置
      const { heartConnectApi } = await import('../../services/api/heartconnect');
      const { getToken } = await import('../../services/api/base/tokenStorage');
      const { authApi } = await import('../../services/api');
      
      const token = getToken();
      if (!token) {
        // 如果没有 token，直接跳转到分享页面
        window.location.href = `/share/${targetShareCode}`;
        return;
      }
      
      try {
        const shareConfig = await heartConnectApi.getShareConfigByCode(targetShareCode);
        const currentUser = await authApi.getCurrentUser(token);
        
        if (currentUser && currentUser.id) {
          // 触发导航事件，让应用内部处理导航（不重新加载页面）
          window.dispatchEvent(new CustomEvent('navigateToShared', { 
            detail: { shareConfigId: shareConfig.id, visitorId: currentUser.id, shareConfig: shareConfig } 
          }));
          // 使用 history API 更新 URL，但不重新加载页面
          window.history.pushState({}, '', `/share/${targetShareCode}`);
        } else {
          // 无法获取用户信息，跳转到分享页面
          window.location.href = `/share/${targetShareCode}`;
        }
      } catch (err) {
        logger.warn('[SharedChatWindow] 获取共享配置失败，跳转到分享页面:', err);
        // 如果获取失败，跳转到分享页面让用户手动进入
        window.location.href = `/share/${targetShareCode}`;
      }
    } catch (error) {
      logger.error('[SharedChatWindow] ❌ 跳转失败:', error);
      // 如果所有方法都失败，直接跳转
      window.location.href = `/share/${targetShareCode}`;
    }
  }, []);

  return (
    <TeleportationManager
      sceneId={sceneId || undefined}
      onTeleportationComplete={handleTeleportationComplete}
    >
      <div className="relative h-screen w-full overflow-hidden bg-black text-white font-sans">
        {/* 背景图片 - 与ChatWindow样式一致 */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            filter: 'blur(4px) opacity(0.6)',
          }}
        />

      {/* 角色头像背景 - 与ChatWindow样式一致 */}
      {!uiState.isCinematic && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <div className="relative h-[85vh] w-[85vh] max-w-full flex items-end justify-center pb-10">
            <div
              className="absolute inset-0 opacity-40 rounded-full blur-3xl"
              style={{ background: `radial-gradient(circle, ${character.colorAccent}66 0%, transparent 70%)` }}
            />
            <img
              src={character.avatarUrl}
              alt={character.name}
              className="h-full w-full object-contain drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-fade-in transition-transform duration-75 will-change-transform"
            />
          </div>
        </div>
      )}

      {/* Header Bar - 与ChatWindow样式一致，返回按钮更明显 */}
      {!uiState.isCinematic && (
        <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center transition-opacity duration-500">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="!p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg backdrop-blur-sm"
              title="返回"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-wider">{character.name}</h2>
              <span className="text-xs uppercase tracking-widest opacity-80" style={{ color: character.colorAccent }}>
                共享模式
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
              title="清空对话"
            >
              清空
            </button>
            <button
              onClick={uiState.toggleCinematic}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all border border-white/10"
              title="进入沉浸模式"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 提示信息 - 调整位置 */}
      {!uiState.isCinematic && (
        <div className="absolute top-16 left-0 right-0 p-3 bg-blue-900/40 border-b border-blue-500/50 z-10">
          <div className="flex items-start gap-2">
            <span className="text-sm">💡</span>
            <p className="text-blue-200 text-xs flex-1">
              你正在共享模式下与角色对话。对话记录会临时保存，离开共享心域后会自动清除。
            </p>
          </div>
        </div>
      )}

      {/* 沉浸模式下的退出按钮和返回按钮 */}
      {uiState.isCinematic && (
        <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
          <Button 
            variant="ghost" 
            onClick={onBack} 
            className="!p-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg backdrop-blur-sm"
            title="返回"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <button 
            onClick={() => uiState.setIsCinematic(false)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white/70 hover:text-white transition-all backdrop-blur-sm"
            title="退出沉浸模式"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-3.65-3.65m3.65 3.65L5.183 2.16 20.632 17.608M14.25 12a2.25 2.25 0 0 1-2.25 2.25" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Chat Area - 与ChatWindow保持一致，确保输入框固定在底部 */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-24 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ${uiState.isCinematic ? 'h-[40vh] bg-gradient-to-t from-black via-black/50 to-transparent' : 'h-[65vh]'}`}>
        
        {/* Messages - 使用公共组件，flex-1 确保占据可用空间 */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 scrollbar-hide min-h-0"
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 15%)' }}
        >
          {safeHistory.length === 0 && !isLoading && (
            <div className="text-white/50 text-center py-4">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-400 text-lg mb-2">开始对话吧</p>
              <p className="text-gray-500 text-sm">与 {character.name} 开始一段新的对话</p>
            </div>
          )}
          <MessageList
            messages={safeHistory}
            character={character}
            isLoading={isLoading}
            isCinematic={uiState.isCinematic}
            showAudioButton={false}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - 固定在底部，使用flex-shrink-0防止被压缩 */}
        <div 
          className="px-4 sm:px-8 mt-2 max-w-4xl mx-auto w-full pb-6 min-h-[80px] flex-shrink-0"
          style={{ 
            zIndex: 1000,
            position: 'relative',
            pointerEvents: 'auto'
          }}
        >
          {!uiState.isCinematic && (
            <ChatInput
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              isLoading={isLoading}
              placeholder={`与 ${character.name} 对话...`}
              showEmojiPicker={uiState.showEmojiPicker}
              onToggleEmojiPicker={() => uiState.setShowEmojiPicker(!uiState.showEmojiPicker)}
              onEmojiSelect={(emoji) => {
                setInput((prev) => prev + emoji.code);
                uiState.setShowEmojiPicker(false);
              }}
              userId={typeof userProfile?.id === 'number' ? userProfile.id : 0}
              disabled={!isActive || !shareConfig}
            />
          )}
        </div>
      </div>

        {/* 传送门不再在场景中显示，改为通过共享心域页面的传送按钮访问 */}
        {/* PortalLayer 已移除，保留传送门数据用于其他用途 */}

      {/* 传送门调试信息（开发环境或手动启用） */}
      {(process.env.NODE_ENV === 'development' || localStorage.getItem('portal_debug') === 'true') && sceneId && (
        <div className="absolute top-20 right-4 bg-slate-900/90 p-3 rounded-lg text-xs text-white z-50 max-w-xs border border-indigo-500/50 shadow-lg">
          <div className="font-bold mb-2 flex items-center gap-2">
            <span>🔮</span>
            <span>传送门调试</span>
          </div>
          <div className="space-y-1">
            <div>场景ID: <span className="text-indigo-400 font-mono">{sceneId}</span></div>
            <div>传送门数: <span className={portalsLoading ? 'text-yellow-400' : 'text-green-400'}>{portals.length}</span></div>
            <div className="flex items-center gap-2">
              <span>加载中:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                portalsLoading 
                  ? 'bg-yellow-500/20 text-yellow-400 animate-pulse' 
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {portalsLoading ? '是' : '否'}
              </span>
            </div>
            {portals.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <div className="text-xs font-semibold mb-1">传送门列表:</div>
                {portals.map(p => (
                  <div key={p.id} className="text-xs text-slate-300 pl-2 mb-1 flex items-center justify-between">
                    <span>• {p.portalName} ({p.portalType})</span>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('portal-click', { 
                          detail: { portalId: p.id, sceneId } 
                        }));
                      }}
                      className="ml-2 px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded transition-colors"
                      title="激活传送门"
                    >
                      传送
                    </button>
                  </div>
                ))}
              </div>
            )}
            {portals.length === 0 && !portalsLoading && (
              <div className="mt-2 pt-2 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-1">该场景暂无传送门</div>
                <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                  传送门需要由心域主人在场景中创建，用于连接到其他心域。
                  <br />
                  创建方式：心域主人可以在场景编辑页面或通过API创建传送门。
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </TeleportationManager>
  );
};
