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
  skillId?: string;      // 技能ID（当角色触发技能时）
  skillName?: string;    // 技能名称（当角色触发技能时）
  getSkillInfo?: () => { skillId?: string; skillName?: string }; // 动态获取技能信息的函数
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
  skillId: initialSkillId,
  skillName: initialSkillName,
  getSkillInfo,
  onComplete,
}: CreateStreamHandlerOptions) => {
  let requestFullResponseText = '';
  let hasAddedBotMessage = false;
  let currentSkillId = initialSkillId;
  let currentSkillName = initialSkillName;

  return async (chunk: StreamChunk) => {
    try {
      // 如果有 getSkillInfo 函数，动态获取最新的技能信息
      if (getSkillInfo) {
        const skillInfo = getSkillInfo();
        if (skillInfo.skillId) currentSkillId = skillInfo.skillId;
        if (skillInfo.skillName) currentSkillName = skillInfo.skillName;
      }

      if (!chunk.done && chunk.content) {
        requestFullResponseText += chunk.content;
        const msg: Message = {
          id: requestId,
          role: 'model',
          text: requestFullResponseText,
          timestamp: Date.now(),
          // 如果触发了技能，添加技能信息
          ...(currentSkillId && currentSkillName ? { skillId: currentSkillId, skillName: currentSkillName } : {}),
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
        // 最后一次更新，确保技能信息被正确设置
        if (getSkillInfo) {
          const skillInfo = getSkillInfo();
          if (skillInfo.skillId) currentSkillId = skillInfo.skillId;
          if (skillInfo.skillName) currentSkillName = skillInfo.skillName;
        }

        // 如果有技能信息，更新最后一条消息以包含技能信息
        if (currentSkillId && currentSkillName && requestFullResponseText) {
          onUpdateHistory(prevHistory => {
            if (typeof prevHistory === 'function' || !Array.isArray(prevHistory)) {
              return prevHistory;
            }
            const lastMsg = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1] : null;
            if (lastMsg && lastMsg.id === requestId && lastMsg.role === 'model') {
              return [...prevHistory.slice(0, -1), {
                ...lastMsg,
                skillId: currentSkillId,
                skillName: currentSkillName,
              }];
            }
            return prevHistory;
          });
        }

        if (onLoadingChange) {
          onLoadingChange(false);
        }

        // 调用完成回调
        if (onComplete) {
          // 即使 fullText 为空，也调用 onComplete，让调用方决定如何处理
          // 这样可以确保保存消息的逻辑能够执行（即使内容为空）
          try {
            await onComplete(requestFullResponseText || '', requestId);
          } catch (error) {
            console.error('[createStreamHandler] onComplete 回调执行失败:', error);
          }
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