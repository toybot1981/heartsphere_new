/**
 * 共享模式聊天窗口组件
 * 独立页面，专门用于在共享模式下与角色对话
 * 消息会保存到临时存储，不会影响主人的数据
 * 参考 ChatWindow.tsx 的样式和功能
 */

import React, { useState, useEffect, useRef } from 'react';
import { Character, Message, AppSettings, UserProfile, DialogueStyle } from '../../types';
import { Button } from '../Button';
import { sharedApi } from '../../services/api/heartconnect';
import { getToken } from '../../services/api/base/tokenStorage';
import { useSharedMode } from '../../hooks/useSharedMode';
import { aiService } from '../../services/ai';
import { AIConfigManager } from '../../services/ai/config';
import { createScenarioContext } from '../../constants';
import { EmojiPicker } from '../emoji/EmojiPicker';

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

  // 会话ID：基于角色ID和共享配置ID
  const sessionId = `shared_${shareConfig?.id || 'unknown'}_${character.id}`;

  // 加载消息历史
  useEffect(() => {
    const loadHistory = async () => {
      if (!isActive || !shareConfig) {
        return;
      }

      try {
        const token = getToken();
        if (!token) {
          return;
        }

        console.log('[SharedChatWindow] 加载消息历史，sessionId:', sessionId);
        const result = await sharedApi.getChatMessages(sessionId, token, 100);
        
        if (result && result.messages) {
          // 转换为前端 Message 格式
          const messages: Message[] = result.messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            role: msg.role === 'USER' ? 'user' : 'assistant',
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
  }, [isActive, shareConfig, sessionId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeHistory]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading || !isActive || !shareConfig) {
      return;
    }

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      text: input.trim(),
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

      // 保存用户消息到后端
      await sharedApi.saveChatMessage(
        sessionId,
        'USER',
        userMessage.text,
        token,
        undefined,
        0.5
      );

      // 调用AI生成回复
      const conversationHistory = [...safeHistory, userMessage].map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

      const response = await aiService.generateResponse(
        character,
        conversationHistory,
        userProfile,
        settings
      );

      const assistantMessage: Message = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        text: response,
        timestamp: Date.now(),
      };

      // 更新本地历史
      onUpdateHistory((prev: Message[]) => [...prev, assistantMessage]);

      // 保存助手消息到后端
      await sharedApi.saveChatMessage(
        sessionId,
        'ASSISTANT',
        assistantMessage.text,
        token,
        undefined,
        0.5
      );
    } catch (err: any) {
      console.error('[SharedChatWindow] 发送消息失败:', err);
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        role: 'assistant',
        text: '抱歉，发送消息时出现了错误，请稍后重试。',
        timestamp: Date.now(),
      };
      onUpdateHistory((prev: Message[]) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 清空对话
  const handleClear = async () => {
    if (!confirm('确定要清空对话历史吗？')) {
      return;
    }

    try {
      const token = getToken();
      if (!token) {
        return;
      }

      await sharedApi.clearChatSession(sessionId, token);
      onUpdateHistory([]);
    } catch (err) {
      console.error('[SharedChatWindow] 清空对话失败:', err);
      alert('清空对话失败，请稍后重试');
    }
  };

  if (!isActive || !shareConfig) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-center">
          <p className="text-gray-400 mb-4">未进入共享模式</p>
          <Button onClick={onBack}>返回</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 to-black">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="!p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div className="flex items-center gap-3">
            {character.avatarUrl && (
              <img
                src={character.avatarUrl}
                alt={character.name}
                className="w-10 h-10 rounded-full border-2 border-white/30"
              />
            )}
            <div>
              <h2 className="text-lg font-bold text-white">{character.name}</h2>
              <p className="text-xs text-gray-400">共享模式 · 临时对话</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            title="清空对话"
          >
            清空
          </button>
        </div>
      </div>

      {/* 提示信息 */}
      <div className="p-3 bg-blue-900/40 border-b border-blue-500/50">
        <div className="flex items-start gap-2">
          <span className="text-sm">💡</span>
          <p className="text-blue-200 text-xs flex-1">
            你正在共享模式下与角色对话。对话记录会临时保存，离开共享心域后会自动清除。
          </p>
        </div>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {safeHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <p className="text-gray-400 text-lg mb-2">开始对话吧</p>
              <p className="text-gray-500 text-sm">与 {character.name} 开始一段新的对话</p>
            </div>
          </div>
        ) : (
          safeHistory.map((msg, index) => {
            const isUserMsg = msg.role === 'user';
            return (
              <div
                key={msg.id || `msg_${index}`}
                className={`flex w-full ${isUserMsg ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 overflow-hidden backdrop-blur-md shadow-lg ${
                    isUserMsg
                      ? 'bg-white/10 text-white border border-white/20 rounded-br-none'
                      : 'bg-white/5 text-white rounded-bl-none'
                  }`}
                  style={
                    !isUserMsg
                      ? {
                          backgroundColor: `${character.colorAccent || '#6366f1'}33`,
                          borderColor: `${character.colorAccent || '#6366f1'}4D`,
                          borderWidth: '1px',
                        }
                      : {}
                  }
                >
                  <p className="whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
                    {msg.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 bg-white/5 text-white rounded-bl-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-4 border-t border-white/10 bg-gray-900/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`与 ${character.name} 对话...`}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3"
          >
            {isLoading ? '发送中...' : '发送'}
          </Button>
        </div>
      </div>
    </div>
  );
};

