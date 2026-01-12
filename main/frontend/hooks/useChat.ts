/**
 * 对话相关业务Hook
 * 封装对话历史相关的状态操作和业务逻辑
 */

import { useCallback, useMemo } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { Message } from '../types';

export const useChat = () => {
  const { state, dispatch } = useGameState();

  // 获取场景的对话历史
  const getHistory = useCallback((sceneId: string): Message[] => {
    return state.history[sceneId] || [];
  }, [state.history]);

  // 获取当前场景的对话历史
  const currentHistory = useMemo(() => {
    if (!state.selectedSceneId) return [];
    return getHistory(state.selectedSceneId);
  }, [state.selectedSceneId, getHistory]);

  // 添加消息
  const addMessage = useCallback((sceneId: string, message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { sceneId, message } });
  }, [dispatch]);

  // 清空对话历史
  const clearHistory = useCallback((sceneId: string) => {
    dispatch({ type: 'CLEAR_HISTORY', payload: sceneId });
  }, [dispatch]);

  // 清空当前场景的对话历史
  const clearCurrentHistory = useCallback(() => {
    if (state.selectedSceneId) {
      clearHistory(state.selectedSceneId);
    }
  }, [state.selectedSceneId, clearHistory]);

  return {
    // 数据
    currentHistory,
    
    // 方法
    getHistory,
    addMessage,
    clearHistory,
    clearCurrentHistory
  };
};

