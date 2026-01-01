/**
 * AI响应生成工具函数
 * 统一处理AI调用逻辑，消除统一模式和本地模式的重复代码
 */

import { Message, Character, AppSettings, UserProfile } from '../../../types';
import { aiService } from '../../../services/ai';
import { createStreamHandler } from './createStreamHandler';
import { buildSystemInstruction } from '../../../utils/chat/systemInstruction';
import { MemorySource } from '../../../services/memory-system/types/MemoryTypes';

interface GenerateAIResponseOptions {
  userText: string;
  userMsg: Message;
  historyWithUserMsg: Message[];
  character: Character;
  settings: AppSettings;
  userProfile: UserProfile | null;
  tempBotId: string;
  onUpdateHistory: (updater: (prev: Message[]) => Message[]) => void;
  setIsLoading: (loading: boolean) => void;
  engine?: any;
  engineReady?: boolean;
  memorySystem?: any;
  relevantMemories?: any[];
  onComplete?: (fullText: string, requestId: string) => void | Promise<void>;
}

/**
 * 生成AI响应
 * 统一处理统一模式和本地模式的AI调用逻辑
 */
export const generateAIResponse = async ({
  userText,
  userMsg,
  historyWithUserMsg,
  character,
  settings,
  userProfile,
  tempBotId,
  onUpdateHistory,
  setIsLoading,
  engine,
  engineReady,
  memorySystem,
  relevantMemories = [],
  onComplete,
}: GenerateAIResponseOptions): Promise<void> => {
  // 构建系统指令（使用统一的工具函数）
  let systemInstruction = buildSystemInstruction(character, settings, userProfile);
  
  // 将记忆添加到系统指令中（如果有）
  if (relevantMemories.length > 0) {
    const memoryContext = relevantMemories
      .map(m => `- ${m.content}`)
      .join('\n');
    systemInstruction += `\n\n[用户记忆]\n${memoryContext}`;
  }
  
  // 转换消息历史：使用包含用户消息的完整历史
  const historyMessages = historyWithUserMsg.map(msg => ({
    role: msg.role === 'model' ? 'assistant' : 'user' as 'user' | 'assistant' | 'system',
    content: msg.text,
  }));
  
  // 创建流式响应处理函数
  const streamHandler = createStreamHandler({
    requestId: tempBotId,
    userMsg,
    onUpdateHistory,
    onLoadingChange: setIsLoading,
    onComplete: async (fullText, requestId) => {
      // 温度感引擎：通知消息接收（异步处理，不阻塞）
      if (engine && engineReady) {
        engine.getPluginManager()?.dispatchEvent('messageReceived', {
          message: fullText,
          context: { character: character.name },
        }).catch((error) => {
          console.error('[generateAIResponse] 通知消息接收失败:', error);
        });
      }

      // 记忆系统：从AI回复中提取记忆
      if (memorySystem?.isReady) {
        memorySystem.extractAndSave(
          fullText,
          MemorySource.CONVERSATION,
          requestId
        ).catch((error) => {
          console.error('[generateAIResponse] 从AI回复提取记忆失败:', error);
        });
      }

      // 调用外部onComplete回调（如果提供）
      if (onComplete) {
        try {
          await onComplete(fullText, requestId);
        } catch (error) {
          console.error('[generateAIResponse] 外部onComplete回调失败:', error);
        }
      }
    },
  });
  
  // 调用AI服务（根据配置自动选择统一模式或本地模式）
  await aiService.generateTextStream(
    {
      prompt: userText,
      systemInstruction: systemInstruction,
      messages: historyMessages,
      temperature: 0.7,
      maxTokens: 2048,
    },
    streamHandler
  );
};