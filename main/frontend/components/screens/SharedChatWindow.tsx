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
import { TeleportationManager, PortalLayer } from '../portal';
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
  const safeHistory = Array.isArray(history) ? history : [];
  const uiState = useUIState();

  // 会话ID：基于角色ID和共享配置ID
  const sessionId = `shared_${shareConfig?.id || 'unknown'}_${character.id}`;

  // 提取场景ID（eraId）用于传送门
  const sceneId = character.eraId ? parseInt(character.eraId) : null;
  
  // 传送门系统：加载传送门列表用于显示
  const { portals, loadPortals, loading: portalsLoading } = usePortal(sceneId || undefined);

  // 加载传送门列表
  useEffect(() => {
    if (sceneId) {
      logger.debug(`[SharedChatWindow] 🔮 加载传送门列表: sceneId=${sceneId}`);
      loadPortals(sceneId);
    } else {
      logger.warn('[SharedChatWindow] ⚠️ 场景ID为空，无法加载传送门');
    }
  }, [sceneId, loadPortals]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [safeHistory.length, scrollToBottom]);

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

          onUpdateHistory(messages);
          historyLoadedRef.current = sessionId;
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
  const handleTeleportationComplete = useCallback((targetHeartsphereId: number, targetShareCode?: string) => {
    logger.debug('[SharedChatWindow] 🔮 传送完成', { targetHeartsphereId, targetShareCode });
    if (targetShareCode) {
      // 通过共享码传送到另一个心域
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

      {/* Main Chat Area - 与ChatWindow保持一致，确保输入框固定在底部 */}
      <div className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-24 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ${uiState.isCinematic ? 'h-[40vh] bg-gradient-to-t from-black via-black/50 to-transparent' : 'h-[65vh]'}`}>
        
        {/* Messages - 使用公共组件，flex-1 确保占据可用空间 */}
        <div
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

        {/* 传送门渲染层 - TeleportationManager会处理点击事件 */}
        {sceneId && (
          <PortalLayer
            portals={portals || []}
            sceneId={sceneId}
          onPortalClick={(portalId) => {
            // 通过自定义事件触发传送，TeleportationManager会监听
            logger.debug(`[SharedChatWindow] 🔮 点击传送门: portalId=${portalId}`);
            window.dispatchEvent(new CustomEvent('portal-click', { 
              detail: { portalId, sceneId } 
            }));
          }}
          className="z-30"
        />
      )}

      {/* 传送门调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && sceneId && (
        <div className="absolute top-20 right-4 bg-slate-900/80 p-3 rounded-lg text-xs text-white z-50 max-w-xs">
          <div className="font-bold mb-1">🔮 传送门调试</div>
          <div>场景ID: {sceneId}</div>
          <div>传送门数: {(portals || []).length}</div>
          <div>加载中: {portalsLoading ? '是' : '否'}</div>
          {(portals || []).length > 0 && (
            <div className="mt-2">
              {portals.map(p => (
                <div key={p.id} className="text-xs">
                  • {p.portalName} ({p.portalType})
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      </div>
    </TeleportationManager>
  );
};
