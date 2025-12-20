/**
 * 邮件（Mail）相关操作 Hook
 * 封装邮件的标记已读等业务逻辑
 */

import { useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';

/**
 * 邮件操作 Hook
 */
export const useMailHandlers = () => {
  const { state: gameState, dispatch } = useGameState();

  /**
   * 标记邮件为已读
   */
  const handleMarkMailRead = useCallback((mailId: string): void => {
    const updatedMailbox = gameState.mailbox.map(m => m.id === mailId ? { ...m, isRead: true } : m);
    dispatch({ type: 'SET_MAILBOX', payload: updatedMailbox });
  }, [gameState.mailbox, dispatch]);

  return {
    handleMarkMailRead,
  };
};

