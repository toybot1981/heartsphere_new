/**
 * 创建流式响应处理函数
 * 统一处理流式响应的chunk，支持完成后的回调
 */

import { Message } from '../../../types';

interface StreamChunk {
  done: boolean;
  content?: string;
}

interface CreateStreamHandlerOptions {
  requestId: string;
  userMsg: Message;
  onUpdateHistory: (updater: (prev: Message[]) => Message[]) => void;
  onLoadingChange?: (loading: boolean) => void;
  onComplete?: (fullText: string, requestId: string) => void;
}

/**
 * 创建流式响应处理函数
 * 
 * @param options 配置选项
 * @returns 流式响应处理函数
 */
export const createStreamHandler = ({
  requestId,
  userMsg,
  onUpdateHistory,
  onLoadingChange,
  onComplete,
}: CreateStreamHandlerOptions) => {
  let requestFullResponseText = '';
  let hasAddedBotMessage = false;

  return (chunk: StreamChunk) => {
    try {
      if (!chunk.done && chunk.content) {
        requestFullResponseText += chunk.content;
        const msg: Message = {
          id: requestId,
          role: 'model',
          text: requestFullResponseText,
          timestamp: Date.now(),
        };

        // 使用函数式更新，确保获取最新的history状态，避免闭包问题
        onUpdateHistory(prevHistory => {
          try {
            // 防御性检查：确保prevHistory是数组，且不是函数
            if (typeof prevHistory === 'function') {
              console.error('[createStreamHandler] prevHistory是函数，这是错误的:', prevHistory);
              return [];
            }
            if (!Array.isArray(prevHistory)) {
              console.error('[createStreamHandler] prevHistory不是数组:', prevHistory, typeof prevHistory);
              return [];
            }

            // 检查用户消息是否存在（确保用户消息没有被丢失）
            const userMsgExists = prevHistory.some(m => m.id === userMsg.id && m.role === 'user');
            if (!userMsgExists) {
              console.warn('[createStreamHandler] ⚠️ 用户消息不在history中，重新添加:', {
                userMsgId: userMsg.id,
                prevHistoryLength: prevHistory.length,
              });
              // 如果用户消息不在history中，先添加用户消息，然后再添加机器人消息
              prevHistory = [...prevHistory, userMsg];
            }

            // 检查最后一条消息是否是我们刚刚添加的机器人消息
            const lastMsg = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
            const isLastMsgOurs = lastMsg && lastMsg.id === requestId && lastMsg.role === 'model';

            if (!hasAddedBotMessage && !isLastMsgOurs) {
              // 还没有添加机器人消息，且最后一条不是我们的消息，添加新消息
              hasAddedBotMessage = true;
              return [...prevHistory, msg];
            } else if (isLastMsgOurs) {
              // 最后一条是我们的消息，更新它
              hasAddedBotMessage = true;
              return [...prevHistory.slice(0, -1), msg];
            } else {
              // 其他情况，追加新消息
              hasAddedBotMessage = true;
              return [...prevHistory, msg];
            }
          } catch (error) {
            console.error('[createStreamHandler] onUpdateHistory回调中发生错误:', error);
            // 返回安全的默认值，确保不返回函数
            return Array.isArray(prevHistory) && typeof prevHistory !== 'function' ? prevHistory : [];
          }
        });
      } else if (chunk.done) {
        // 完成 - 确保完成信号能够正常处理
        if (onLoadingChange) {
          onLoadingChange(false);
        }

        // 调用完成回调
        if (onComplete && requestFullResponseText) {
          onComplete(requestFullResponseText, requestId);
        }
      }
    } catch (error) {
      console.error('[createStreamHandler] 处理chunk时发生错误:', error);
      // 确保即使出错也能恢复加载状态
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };
};