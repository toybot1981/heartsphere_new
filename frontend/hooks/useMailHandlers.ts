/**
 * 邮件（Mail）相关操作 Hook
 * 封装邮件的标记已读等业务逻辑
 */

import { useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { chronosLetterApi } from '../services/api';

/**
 * 邮件操作 Hook
 */
export const useMailHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 标记邮件为已读
   */
  const handleMarkMailRead = useCallback(async (mailId: string): Promise<void> => {
    // 先更新本地状态
    const updatedMailbox = gameState.mailbox.map(m => m.id === mailId ? { ...m, isRead: true } : m);
    dispatch({ type: 'SET_MAILBOX', payload: updatedMailbox });
    
    // 如果是数据库中的信件（不是AI生成的），调用API标记已读
    if (!mailId.startsWith('mail_ai_')) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await chronosLetterApi.markAsRead(mailId, token);
          console.log('[useMailHandlers] 信件已标记为已读:', mailId);
        } catch (error) {
          console.error('[useMailHandlers] 标记信件已读失败:', error);
          // 如果API调用失败，回滚本地状态
          const originalMailbox = gameState.mailbox.map(m => m.id === mailId ? { ...m, isRead: false } : m);
          dispatch({ type: 'SET_MAILBOX', payload: originalMailbox });
        }
      }
    }
  }, [gameState.mailbox, dispatch]);

  return {
    handleMarkMailRead,
  };
};

