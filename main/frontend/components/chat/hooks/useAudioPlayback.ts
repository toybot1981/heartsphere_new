/**
 * 音频播放状态管理 Hook
 * 管理音频播放相关的状态和操作
 */

import { useState, useRef, useCallback } from 'react';

export interface AudioPlaybackState {
  playingMessageId: string | null;
  loadingMessageId: string | null;
  isPlaying: boolean;
  isLoading: boolean;
}

export interface AudioPlaybackActions {
  setPlayingMessageId: (id: string | null) => void;
  setLoadingMessageId: (id: string | null) => void;
  stopAudio: () => void;
}

/**
 * 音频播放状态管理 Hook
 * 统一管理音频播放状态，消除状态冗余
 */
export const useAudioPlayback = () => {
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [loadingMessageId, setLoadingMessageId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // 派生状态
  const isPlaying = playingMessageId !== null;
  const isLoading = loadingMessageId !== null;

  const stopAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
      } catch (e) {
        // already stopped
      }
      sourceNodeRef.current = null;
    }
    setPlayingMessageId(null);
    setLoadingMessageId(null);
  }, []);

  return {
    // 状态
    playingMessageId,
    loadingMessageId,
    isPlaying,
    isLoading,
    // Refs
    audioContextRef,
    sourceNodeRef,
    // 操作
    setPlayingMessageId,
    setLoadingMessageId,
    stopAudio,
  };
};


