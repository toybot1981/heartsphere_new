/**
 * 流式响应处理 Hook
 * 统一管理AI流式响应的处理逻辑，避免闭包问题和竞态条件
 */

import { useRef, useCallback } from 'react';
import { Message } from '../../../types';

interface StreamChunk {
  done: boolean;
  content?: string;
}

interface UseStreamResponseProps {
  onUpdateHistory: (updater: (prev: Message[]) => Message[]) => void;
  onLoadingChange?: (loading: boolean) => void;
}

/**
 * 流式响应处理 Hook
 * 使用ref管理流状态，避免闭包问题
 */
export const useStreamResponse = ({
  onUpdateHistory,
  onLoadingChange,
}: UseStreamResponseProps) => {
  // 使用Map管理多个并发的流
  const activeStreamsRef = useRef<Map<string, {
    text: string;
    messageId: string;
    userMsgId: string;
  }>>(new Map());

  /**
   * 处理流式chunk
   */
  const handleStreamChunk = useCallback((
    requestId: string,
    userMsgId: string,
    chunk: StreamChunk
  ) => {
    if (chunk.done) {
      activeStreamsRef.current.delete(requestId);
      if (onLoadingChange) {
        onLoadingChange(false);
      }
      return;
    }

    if (!chunk.content) return;

    // 获取或创建流状态
    const stream = activeStreamsRef.current.get(requestId) || {
      text: '',
      messageId: requestId,
      userMsgId,
    };

    stream.text += chunk.content;
    activeStreamsRef.current.set(requestId, stream);

    // 创建机器人消息
    const botMsg: Message = {
      id: stream.messageId,
      role: 'model',
      text: stream.text,
      timestamp: Date.now(),
    };

    // 更新历史记录
    onUpdateHistory(prev => {
      // 防御性检查
      if (typeof prev === 'function' || !Array.isArray(prev)) {
        console.error('[useStreamResponse] prevHistory不是数组:', prev);
        return [];
      }

      // 确保用户消息存在
      const userMsgExists = prev.some(m => m.id === userMsgId && m.role === 'user');
      const historyWithUser = userMsgExists ? prev : [...prev, { 
        id: userMsgId, 
        role: 'user' as const, 
        text: '', 
        timestamp: Date.now() 
      }];

      // 更新或添加机器人消息
      const lastIndex = historyWithUser.length - 1;
      const lastMsg = historyWithUser[lastIndex];

      if (lastMsg?.id === requestId && lastMsg?.role === 'model') {
        // 更新现有消息
        return [...historyWithUser.slice(0, lastIndex), botMsg];
      }

      // 添加新消息
      return [...historyWithUser, botMsg];
    });
  }, [onUpdateHistory, onLoadingChange]);

  /**
   * 取消流
   */
  const cancelStream = useCallback((requestId: string) => {
    activeStreamsRef.current.delete(requestId);
    if (onLoadingChange) {
      onLoadingChange(false);
    }
  }, [onLoadingChange]);

  /**
   * 重置所有流
   */
  const resetAllStreams = useCallback(() => {
    activeStreamsRef.current.clear();
    if (onLoadingChange) {
      onLoadingChange(false);
    }
  }, [onLoadingChange]);

  return {
    handleStreamChunk,
    cancelStream,
    resetAllStreams,
  };
};
