import { useState, useEffect } from 'react';
import type { ShareConfig } from '../services/api/heartconnect/types';
import { setSharedModeState, clearSharedModeState, getSharedModeState } from '../services/api/base/sharedModeState';
import { heartConnectApi } from '../services/api/heartconnect';

interface SharedModeState {
  isActive: boolean;
  shareConfig: ShareConfig | null;
  visitorId: number | null;
  startTime: number | null;
}

// 全局状态存储（用于跨组件同步）
let globalSharedModeState: SharedModeState = {
  isActive: false,
  shareConfig: null,
  visitorId: null,
  startTime: null,
};

// 监听器列表（用于通知所有使用 useSharedMode 的组件）
const listeners = new Set<(state: SharedModeState) => void>();

/**
 * 通知所有监听器状态已更新
 */
const notifyListeners = () => {
  listeners.forEach(listener => listener(globalSharedModeState));
};

/**
 * 共享模式Hook
 * 管理访问他人心域时的共享模式状态
 * 使用全局状态确保所有组件共享同一状态
 */
export const useSharedMode = () => {
  const [state, setState] = useState<SharedModeState>(globalSharedModeState);
  
  // 监听全局状态变化
  useEffect(() => {
    const listener = (newState: SharedModeState) => {
      setState(newState);
    };
    
    listeners.add(listener);
    
    // 初始化时同步全局状态
    setState(globalSharedModeState);
    
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  /**
   * 进入共享模式
   */
  const enterSharedMode = (shareConfig: ShareConfig, visitorId: number) => {
    globalSharedModeState = {
      isActive: true,
      shareConfig,
      visitorId,
      startTime: Date.now(),
    };
    
    // 更新全局共享模式状态（供 request.ts 使用）
    setSharedModeState(shareConfig.id, visitorId);
    
    // 通知所有监听器
    notifyListeners();
    
    console.log('[useSharedMode] 进入共享模式:', shareConfig.id, visitorId, shareConfig);
  };
  
  /**
   * 离开共享模式
   */
  const leaveSharedMode = () => {
    globalSharedModeState = {
      isActive: false,
      shareConfig: null,
      visitorId: null,
      startTime: null,
    };
    
    // 清除全局共享模式状态
    clearSharedModeState();
    
    // 通知所有监听器
    notifyListeners();
    
    console.log('[useSharedMode] 离开共享模式');
  };
  
  /**
   * 获取共享时长（秒）
   */
  const getSharedDuration = (): number => {
    if (!state.startTime) return 0;
    return Math.floor((Date.now() - state.startTime) / 1000);
  };
  
  return {
    ...state,
    enterSharedMode,
    leaveSharedMode,
    getSharedDuration,
  };
};

