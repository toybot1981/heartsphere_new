/**
 * UI状态管理 Hook
 * 管理聊天窗口的UI显示状态
 */

import { useState, useCallback } from 'react';

export interface UIState {
  showEmojiPicker: boolean;
  showCardMaker: boolean;
  isCinematic: boolean;
}

export interface UIStateActions {
  setShowEmojiPicker: (show: boolean) => void;
  setShowCardMaker: (show: boolean) => void;
  setIsCinematic: (isCinematic: boolean) => void;
  toggleCinematic: () => void;
}

/**
 * UI状态管理 Hook
 * 统一管理聊天窗口的UI显示状态
 */
export const useUIState = () => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCardMaker, setShowCardMaker] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);

  const toggleCinematic = useCallback(() => {
    setIsCinematic(prev => !prev);
  }, []);

  return {
    // 状态
    showEmojiPicker,
    showCardMaker,
    isCinematic,
    // 操作
    setShowEmojiPicker,
    setShowCardMaker,
    setIsCinematic,
    toggleCinematic,
  };
};


