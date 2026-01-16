/**
 * Mobile版本共享聊天窗口组件
 * 独立的移动端实现，复用PC版本的业务逻辑，但使用移动端优化的UI
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { MobileInputStyles, MobileColors, MobileCardStyles } from '../components/MobileStyleGuide';
import { Character, Message, AppSettings, UserProfile } from '../../types';
import { sharedApi } from '../../services/api/heartconnect/shared';
import { getToken } from '../../services/api/base/tokenStorage';
import { useSharedMode } from '../../hooks/useSharedMode';
import { generateAIResponse } from '../../components/chat/utils/generateAIResponse';
import { createErrorMessage, getErrorMessage } from '../../utils/chat/errorHandling';
import { useUIState } from '../../components/chat/hooks/useUIState';
import { showAlert, showConfirm } from '../../utils/dialog';
import { AIConfigManager } from '../../services/ai/config';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileEmptyState } from '../components/MobileEmptyState';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';
import { MobileSafeAreaView } from '../components/MobileSafeAreaView';
import { MobileLazyImage } from '../components/MobileLazyImage';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { BackgroundLayer } from '../../components/chat/BackgroundLayer';
import { CharacterAvatar } from '../../components/chat/CharacterAvatar';
import { EmojiPicker } from '../../components/emoji/EmojiPicker';
import { TeleportationManager, PortalLayer } from '../../components/portal';
import { usePortal } from '../../hooks/usePortal';
import { logger } from '../../utils/logger';

interface MobileSharedChatWindowScreenProps {
  character: Character;
  history: Message[];
  settings: AppSettings;
  userProfile: UserProfile;
  onUpdateHistory: (msgs: Message[] | ((prev: Message[]) => Message[])) => void;
  onBack: () => void;
}

/**
 * Mobile版本共享聊天窗口页面组件
 * 独立的移动端实现，复用业务逻辑但使用移动端UI
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileSharedChatWindowScreen: React.FC<MobileSharedChatWindowScreenProps> = memo(({
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
      logger.debug(`[MobileSharedChatWindow] 🔮 加载传送门列表: sceneId=${sceneId}`);
      loadPortals(sceneId);
    } else {
      logger.warn('[MobileSharedChatWindow] ⚠️ 场景ID为空，无法加载传送门');
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
  useEffect(() => {
    const loadHistory = async () => {
      if (!isActive || !shareConfig) {
        return;
      }

      try {
        const token = getToken();
        if (!token) {
          console.warn('[MobileSharedChatWindow] 未登录，无法加载消息历史');
          return;
        }

        const result = await sharedApi.getChatMessages(sessionId, token, 100);

        if (result && result.messages) {
          // 转换为前端 Message 格式
          const messages: Message[] = result.messages.map((msg) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            role: msg.role === 'USER' ? 'user' : 'model',
            text: msg.content || '',
            timestamp: msg.timestamp || Date.now(),
          }));

          onUpdateHistory(messages);
        }
      } catch (err) {
        console.error('[MobileSharedChatWindow] 加载消息历史失败:', err);
      }
    };

    loadHistory();
  }, [isActive, shareConfig, sessionId, onUpdateHistory]);

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

      // 检查当前配置模式
      const config = await AIConfigManager.getUserConfig();
      
      // 使用统一的AI响应生成函数
      const tempBotId = `shared_${Date.now()}`;
      const historyWithUserMsg = [...safeHistory, userMessage];
      
      // 共享模式不使用记忆系统
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
        engine: undefined, // 共享模式不使用温度感引擎
        engineReady: false,
        memorySystem: undefined, // 共享模式不使用记忆系统
        relevantMemories: [], // 共享模式不获取记忆
        onComplete: async (fullText) => {
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
            logger.error('[MobileSharedChatWindow] 保存助手消息失败:', saveError);
          }
        },
      });
    } catch (err) {
      console.error('[MobileSharedChatWindow] 发送消息失败:', err);
      const errorMessage = createErrorMessage(`msg_${Date.now()}_error`, err as Error);
      onUpdateHistory((prev: Message[]) => [...prev, errorMessage]);
      showAlert(errorMessage.text, '错误', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isActive, shareConfig, safeHistory, character, settings, userProfile, sessionId, onUpdateHistory]);

  // 清空对话（独立的API调用）
  const handleClear = useCallback(async () => {
    const confirmed = await showConfirm('确定要清空对话历史吗？', '清空对话', 'warning');
    if (!confirmed) {
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
      console.error('[MobileSharedChatWindow] 清空对话失败:', err);
      showAlert('清空对话失败，请稍后重试', '错误', 'error');
    }
  }, [sessionId, onUpdateHistory]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 处理传送完成
  const handleTeleportationComplete = useCallback((targetHeartsphereId: number, targetShareCode?: string) => {
    logger.debug('[MobileSharedChatWindow] 🔮 传送完成', { targetHeartsphereId, targetShareCode });
    if (targetShareCode) {
      // 通过共享码传送到另一个心域
      window.location.href = `/share/${targetShareCode}`;
    }
  }, []);

  // 如果未激活共享模式
  if (!isActive || !shareConfig) {
    return (
      <MobileSafeAreaView className="h-full w-full bg-black">
        <div className="h-full flex flex-col items-center justify-center p-6">
          <MobileEmptyState
            icon="🔒"
            title="未进入共享模式"
            description="请先进入共享心域"
            action={{
              label: "返回",
              onClick: onBack
            }}
          />
        </div>
      </MobileSafeAreaView>
    );
  }

  return (
    <TeleportationManager
      sceneId={sceneId || undefined}
      onTeleportationComplete={handleTeleportationComplete}
    >
      <MobileSafeAreaView className="h-full w-full bg-black relative overflow-hidden">
        {/* 背景层 */}
        <BackgroundLayer
        backgroundImage={character.backgroundUrl || null}
        character={character}
        isStoryMode={false}
        isCinematic={uiState.isCinematic}
      />

      {/* 角色头像（影院模式） */}
      {uiState.isCinematic && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <CharacterAvatar
            character={character}
            size="large"
            isCinematic={true}
          />
        </div>
      )}

      {/* 角色头像（背景显示，非影院模式） */}
      {!uiState.isCinematic && (
        <CharacterAvatar
          character={character}
          size="medium"
          isStoryMode={false}
          isCinematic={false}
        />
      )}

      {/* 头部栏（移动端优化） */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 pt-[calc(1rem+env(safe-area-inset-top))] bg-gradient-to-b from-black/95 via-black/90 to-black/60 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <MobileTouchableButton
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </MobileTouchableButton>
          
          <div className="flex items-center gap-2 flex-1 justify-center">
            <CharacterAvatar
              character={character}
              size="small"
              isCinematic={false}
            />
            <div className="bg-black/40 backdrop-blur-sm rounded-lg px-3 py-1.5">
              <h2 className="text-white font-bold text-base drop-shadow-lg">{character.name}</h2>
              <span className="text-xs text-blue-400 drop-shadow-md">共享模式</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MobileTouchableButton
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="text-white/50 text-xs"
            >
              清空
            </MobileTouchableButton>
            {!uiState.isCinematic && (
              <MobileTouchableButton
                onClick={() => uiState.setIsCinematic(true)}
                variant="ghost"
                size="sm"
                className="text-white/70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              </MobileTouchableButton>
            )}
          </div>
        </div>
      </div>

      {/* 退出影院模式按钮 */}
      {uiState.isCinematic && (
        <MobileTouchableButton
          onClick={() => uiState.setIsCinematic(false)}
          variant="ghost"
          size="md"
          className="absolute top-4 right-4 z-50 p-3 rounded-full bg-black/40 text-white/50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-3.65-3.65m3.65 3.65F5.183 2.16 20.632 17.608M14.25 12a2.25 2.25 0 0 1-2.25 2.25" />
          </svg>
        </MobileTouchableButton>
      )}

      {/* 提示信息（移动端优化） */}
      {!uiState.isCinematic && (
        <div className="absolute left-0 right-0 p-3 bg-blue-900/40 border-b border-blue-500/50 z-10" style={{ top: 'calc(1rem + env(safe-area-inset-top) + 4rem)' }}>
          <div className="flex items-start gap-2">
            <span className="text-sm">💡</span>
            <p className="text-blue-200 text-xs flex-1">
              你正在共享模式下与角色对话。对话记录会临时保存，离开共享心域后会自动清除。
            </p>
          </div>
        </div>
      )}

      {/* 主聊天区域（移动端优化） */}
      <div 
        className={`absolute left-0 right-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black via-black/90 to-black/70 transition-all duration-500 ${uiState.isCinematic ? 'bg-gradient-to-t from-black via-black/70 to-black/50' : ''}`} 
        style={{ 
          bottom: 'calc(4rem + env(safe-area-inset-bottom))',
          top: uiState.isCinematic ? 'calc(1rem + env(safe-area-inset-top) + 4rem)' : 'calc(1rem + env(safe-area-inset-top) + 4rem + 3.5rem)',
        }}
      >
        
        {/* 消息列表（使用MobileSmoothScroll） */}
        <MobileSmoothScroll 
          className="flex-1 px-4 py-4 space-y-4 min-h-0" 
          style={{ maskImage: 'linear-gradient(to bottom, transparent, black 20%)' }}
        >
          {safeHistory.length === 0 && !isLoading && (
            <MobileEmptyState
              icon="💬"
              title="开始对话吧"
              description={`与 ${character.name} 开始一段新的对话`}
            />
          )}
          
          {safeHistory
            .filter(msg => msg && msg.text)
            .map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.role === 'user'}
                isCinematic={uiState.isCinematic}
                colorAccent={character.colorAccent}
                showAudioButton={false}
              />
            ))}
          
          {isLoading && safeHistory.length > 0 && (
            <div className="flex justify-start w-full">
              <div className="rounded-2xl rounded-bl-none px-4 py-3 backdrop-blur-md border border-white/10 flex items-center space-x-2" style={{ backgroundColor: `${character.colorAccent}1A` }}>
                <div className="w-2 h-2 bg-white/70 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-white/70 rounded-full typing-dot" />
                <div className="w-2 h-2 bg-white/70 rounded-full typing-dot" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </MobileSmoothScroll>

        {/* 输入区域（移动端优化）- 使用flex-shrink-0固定在底部 */}
        <div 
          className="px-4 mt-2 w-full min-h-[80px] flex-shrink-0"
          style={{ 
            zIndex: 1000,
            position: 'relative',
            pointerEvents: 'auto',
            paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))'
          }}
        >
          {!uiState.isCinematic && (
            <div className="relative flex items-center bg-black/90 rounded-2xl p-2 border border-white/10 animate-fade-in w-full">
              {/* 表情按钮 */}
              <MobileTouchableButton
                onClick={() => uiState.setShowEmojiPicker(true)}
                disabled={isLoading}
                variant="ghost"
                size="sm"
                className="mr-2 bg-white/10 text-white/70"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </MobileTouchableButton>
              
              {/* 输入框（移动端优化） */}
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`与 ${character.name} 对话...`}
                className="flex-1 bg-transparent border-none text-white placeholder-slate-400 focus:ring-0 focus:outline-none resize-none max-h-24 py-3 px-3 scrollbar-hide text-base min-h-[44px] touch-manipulation"
                rows={1}
                disabled={isLoading || !isActive || !shareConfig}
                inputMode="text"
              />
              
              {/* 发送按钮 */}
              <MobileTouchableButton
                onClick={handleSend}
                disabled={isLoading || !input.trim() || !isActive || !shareConfig}
                variant="primary"
                size="md"
                className="ml-2"
                style={{ backgroundColor: character.colorAccent }}
              >
                发送
              </MobileTouchableButton>
            </div>
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
              logger.debug(`[MobileSharedChatWindow] 🔮 点击传送门: portalId=${portalId}`);
              window.dispatchEvent(new CustomEvent('portal-click', { 
                detail: { portalId, sceneId } 
              }));
            }}
            className="z-30"
          />
        )}

        {/* 传送门调试信息（开发环境） */}
        {process.env.NODE_ENV === 'development' && sceneId && (
          <div className="absolute top-20 right-2 bg-slate-900/90 p-2 rounded-lg text-xs text-white z-50 max-w-[120px]">
            <div className="font-bold mb-1 text-[10px]">🔮 传送门</div>
            <div className="text-[10px]">场景: {sceneId}</div>
            <div className="text-[10px]">数量: {(portals || []).length}</div>
            <div className="text-[10px]">{portalsLoading ? '加载中' : '已就绪'}</div>
          </div>
        )}

        {/* 表情选择器 */}
        {uiState.showEmojiPicker && (
          <EmojiPicker
            userId={typeof userProfile?.id === 'number' ? userProfile.id : 0}
            onSelect={(emoji) => {
              setInput((prev) => prev + emoji.code);
              uiState.setShowEmojiPicker(false);
            }}
            onClose={() => uiState.setShowEmojiPicker(false)}
          />
        )}
      </MobileSafeAreaView>
    </TeleportationManager>
  );
});

MobileSharedChatWindowScreen.displayName = 'MobileSharedChatWindowScreen';
