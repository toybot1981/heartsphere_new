/**
 * 语音输入状态管理 Hook
 * 管理语音输入相关的状态和操作
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// 语音识别接口类型定义
interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

export interface VoiceInputState {
  isVoiceMode: boolean;
  isListening: boolean;
  isWaitingForResponse: boolean;
  error: string | null;
}

export interface VoiceInputActions {
  setIsVoiceMode: (mode: boolean) => void;
  setIsListening: (listening: boolean) => void;
  setIsWaitingForResponse: (waiting: boolean) => void;
  setError: (error: string | null) => void;
  toggleVoiceMode: () => void;
  startListening: () => void;
  stopListening: () => void;
  getRecognition: () => SpeechRecognition | null;
  setRecognition: (recognition: SpeechRecognition | null) => void;
}

/**
 * 语音输入状态管理 Hook
 * 统一管理语音输入状态，使用类型安全的ref
 */
export const useVoiceInput = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const lastBotMessageIdRef = useRef<string | null>(null);

  const toggleVoiceMode = useCallback(() => {
    setIsVoiceMode(prev => !prev);
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    setError(null);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  const getRecognition = useCallback(() => {
    return recognitionRef.current;
  }, []);

  const setRecognition = useCallback((recognition: SpeechRecognition | null) => {
    recognitionRef.current = recognition;
  }, []);

  // 清理：组件卸载时停止语音识别
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  return {
    // 状态
    isVoiceMode,
    isListening,
    isWaitingForResponse,
    error,
    // Refs
    lastBotMessageIdRef,
    // 操作
    setIsVoiceMode,
    setIsListening,
    setIsWaitingForResponse,
    setError,
    toggleVoiceMode,
    startListening,
    stopListening,
    getRecognition,
    setRecognition,
  };
};


