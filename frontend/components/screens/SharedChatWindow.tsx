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
          console.warn('[SharedChatWindow] 未登录，无法加载消息历史');
          return;
        }

        console.log('[SharedChatWindow] 加载消息历史，sessionId:', sessionId);
        const result = await sharedApi.getChatMessages(sessionId, token, 100);

        if (result && result.messages) {
          // 转换为前端 Message 格式
          const messages: Message[] = result.messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            role: msg.role === 'USER' ? 'user' : 'model',
            text: msg.content || '',
            timestamp: msg.timestamp || Date.now(),
          }));

          console.log('[SharedChatWindow] 加载到消息数量:', messages.length);
          onUpdateHistory(messages);
        }
      } catch (err) {
        console.error('[SharedChatWindow] 加载消息历史失败:', err);
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

      // 检查当前配置模式（参照ChatWindow的方式）
      const config = await AIConfigManager.getUserConfig();
      
      console.log('[SharedChatWindow] 大模型连接模式检测:', {
        mode: config.mode,
        textProvider: config.textProvider,
        textModel: config.textModel,
        hasApiKeys: {
          gemini: !!AIConfigManager.getLocalApiKeys().gemini,
          openai: !!AIConfigManager.getLocalApiKeys().openai,
          qwen: !!AIConfigManager.getLocalApiKeys().qwen,
          doubao: !!AIConfigManager.getLocalApiKeys().doubao,
        }
      });

      // 使用统一的AI响应生成函数（与ChatWindow保持一致）
      // 根据配置模式自动选择统一模式或本地模式
      const tempBotId = `shared_${Date.now()}`;
      const historyWithUserMsg = [...safeHistory, userMessage];
      
      // 统一模式和本地模式都使用相同的AI响应生成逻辑
      // 统一模式：获取相关记忆用于上下文（共享模式不使用）
      let relevantMemories: any[] = [];
      if (config.mode === 'unified') {
        console.log('[SharedChatWindow] 使用统一接入模式调用大模型');
        // 共享模式不使用记忆系统，所以不获取相关记忆
      } else {
        console.log('[SharedChatWindow] 使用本地配置模式调用大模型', {
          provider: config.textProvider || 'gemini',
          model: config.textModel,
          hasProviderConfig: {
            gemini: !!AIConfigManager.getLocalApiKeys().gemini,
            openai: !!AIConfigManager.getLocalApiKeys().openai,
            qwen: !!AIConfigManager.getLocalApiKeys().qwen,
            doubao: !!AIConfigManager.getLocalApiKeys().doubao,
          }
        });
      }
      
      // 使用generateAIResponse函数，根据配置自动选择模式
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
        onComplete: async (fullText, requestId) => {
          // 保存助手消息到后端（共享模式专用）
          try {
            await sharedApi.saveChatMessage(
              sessionId,
              'ASSISTANT',
              fullText,
              token,
              undefined,
              0.5
            );
            console.log('[SharedChatWindow] 助手消息已保存到后端');
          } catch (saveError) {
            console.error('[SharedChatWindow] 保存助手消息失败:', saveError);
            // 不抛出错误，不影响用户体验
          }
        },
      });
    } catch (err: any) {
      console.error('[SharedChatWindow] 发送消息失败:', err);
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
      console.error('[SharedChatWindow] 清空对话失败:', err);
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

  return (
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

      {/* Main Chat Area - 与ChatWindow样式一致，增加底部padding避免被SharedModeBanner遮挡 */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 flex flex-col justify-end pb-24 bg-gradient-to-t from-black via-black/80 to-transparent transition-all duration-500 ${
          uiState.isCinematic ? 'h-[40vh] bg-gradient-to-t from-black via-black/50 to-transparent' : 'h-[65vh]'
        }`}
      >
        {/* Messages - 使用公共组件 */}
        <div
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-4 scrollbar-hide"
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

        {/* Input Area - 使用公共组件 */}
        <div
          className="px-4 sm:px-8 mt-2 max-w-4xl mx-auto w-full pb-6 min-h-[80px]"
          style={{
            zIndex: 1000,
            position: 'relative',
            pointerEvents: 'auto',
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
    </div>
  );
};
