/**
 * 本我镜像（Mirror）相关操作 Hook
 * 封装本我镜像的咨询等业务逻辑
 */

import { useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { geminiService } from '../services/gemini';
import { showAlert } from '../utils/dialog';

/**
 * 本我镜像操作 Hook
 */
export const useMirrorHandlers = (requireAuth: (callback: () => void) => void) => {
  const { state: gameState } = useGameState();

  /**
   * 咨询本我镜像
   */
  const handleConsultMirror = useCallback(async (content: string, recentContext: string[]): Promise<string | null> => {
    if (gameState.userProfile?.isGuest) {
      requireAuth(() => {
        showAlert("登录成功！请再次点击「本我镜像」以开始分析。", '登录成功', 'success');
      });
      return null;
    }
    
    return geminiService.generateMirrorInsight(content, recentContext);
  }, [gameState.userProfile, requireAuth]);

  return {
    handleConsultMirror,
  };
};

