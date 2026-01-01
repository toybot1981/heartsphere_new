/**
 * 访问历史工具函数
 * 用于在对话模块中集成访问历史记录
 */

import { quickConnectApi } from '../services/api/quickconnect';

let sessionId: string | null = null;
let accessStartTime: number | null = null;
let conversationRounds: number = 0;

/**
 * 初始化访问会话
 */
export const initAccessSession = (characterId: number): void => {
  sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  accessStartTime = Date.now();
  conversationRounds = 0;
  
  console.log('[accessHistory] 初始化访问会话', { characterId, sessionId });
};

/**
 * 增加对话轮数
 */
export const incrementConversationRounds = (): void => {
  conversationRounds++;
};

/**
 * 记录访问历史
 */
export const recordAccessHistory = async (characterId: number): Promise<void> => {
  if (!sessionId || !accessStartTime) {
    console.warn('[accessHistory] 会话未初始化，跳过记录');
    return;
  }
  
  const accessDuration = Math.floor((Date.now() - accessStartTime) / 1000); // 转换为秒
  
  try {
    await quickConnectApi.recordAccess({
      characterId,
      accessDuration,
      conversationRounds,
      sessionId,
    });
    
    console.log('[accessHistory] 访问历史记录成功', {
      characterId,
      accessDuration,
      conversationRounds,
    });
  } catch (error) {
    console.error('[accessHistory] 记录访问历史失败:', error);
    // 访问历史记录失败不应该阻塞主流程
  } finally {
    // 重置会话
    sessionId = null;
    accessStartTime = null;
    conversationRounds = 0;
  }
};

/**
 * 获取访问统计
 */
export const getAccessStatistics = async (characterId: number) => {
  try {
    return await quickConnectApi.getAccessStatistics(characterId);
  } catch (error) {
    console.error('[accessHistory] 获取访问统计失败:', error);
    return null;
  }
};




