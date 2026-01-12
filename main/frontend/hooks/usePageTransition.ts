import { useState, useCallback, useEffect } from 'react';
import type { TransitionType, PageTransitionConfig } from '../components/transitions/PageTransitionSystem';

/**
 * 页面切换状态
 */
export interface TransitionState {
  /** 是否正在切换 */
  isTransitioning: boolean;
  /** 当前页面是否可见 */
  isVisible: boolean;
  /** 切换键（用于触发切换） */
  transitionKey: string | number;
}

/**
 * 页面切换 Hook
 * 提供便捷的页面切换控制
 */
export const usePageTransition = (
  initialConfig?: Partial<PageTransitionConfig>
) => {
  const [state, setState] = useState<TransitionState>({
    isTransitioning: false,
    isVisible: true,
    transitionKey: 0,
  });

  const [config, setConfig] = useState<PageTransitionConfig>({
    type: 'fade',
    duration: 600,
    delay: 0,
    direction: 'right',
    showLoading: false,
    ...initialConfig,
  });

  /**
   * 触发页面切换
   */
  const transition = useCallback((
    newType?: TransitionType,
    newDuration?: number
  ) => {
    setState(prev => ({
      isTransitioning: true,
      isVisible: false,
      transitionKey: prev.transitionKey + 1,
    }));

    if (newType) {
      setConfig(prev => ({ ...prev, type: newType }));
    }
    if (newDuration !== undefined) {
      setConfig(prev => ({ ...prev, duration: newDuration }));
    }

    // 延迟后显示新页面
    setTimeout(() => {
      setState(prev => ({
        isTransitioning: false,
        isVisible: true,
        transitionKey: prev.transitionKey,
      }));
    }, (newDuration || config.duration || 600) + (config.delay || 0));
  }, [config.duration, config.delay]);

  /**
   * 进入共享心域（星际穿越特效）
   */
  const enterSharedHeartSphere = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      type: 'starfield',
      duration: 1000,
    }));
    transition('starfield', 1000);
  }, [transition]);

  /**
   * 离开共享心域（星际穿越特效）
   */
  const leaveSharedHeartSphere = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      type: 'starfield',
      duration: 1000,
    }));
    transition('starfield', 1000);
  }, [transition]);

  /**
   * 星空穿越特效
   */
  const starfieldTransition = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      type: 'starfield',
      duration: 1000,
    }));
    transition('starfield', 1000);
  }, [transition]);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState({
      isTransitioning: false,
      isVisible: true,
      transitionKey: 0,
    });
  }, []);

  return {
    state,
    config,
    transition,
    enterSharedHeartSphere,
    leaveSharedHeartSphere,
    starfieldTransition,
    reset,
    setConfig,
  };
};

/**
 * 页面切换管理器
 * 全局管理页面切换状态
 */
class PageTransitionManager {
  private listeners = new Set<(state: TransitionState) => void>();
  private currentState: TransitionState = {
    isTransitioning: false,
    isVisible: true,
    transitionKey: 0,
  };

  /**
   * 订阅状态变化
   */
  subscribe(listener: (state: TransitionState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * 触发切换
   */
  transition(type?: TransitionType, duration?: number) {
    this.currentState = {
      isTransitioning: true,
      isVisible: false,
      transitionKey: this.currentState.transitionKey + 1,
    };
    this.notify();

    setTimeout(() => {
      this.currentState = {
        isTransitioning: false,
        isVisible: true,
        transitionKey: this.currentState.transitionKey,
      };
      this.notify();
    }, duration || 600);
  }

  /**
   * 进入共享心域（星际穿越）
   */
  enterSharedHeartSphere() {
    this.transition('starfield', 1000);
  }

  /**
   * 离开共享心域（星际穿越）
   */
  leaveSharedHeartSphere() {
    this.transition('starfield', 1000);
  }

  /**
   * 获取当前状态
   */
  getState(): TransitionState {
    return { ...this.currentState };
  }

  /**
   * 通知所有监听器
   */
  private notify() {
    this.listeners.forEach(listener => listener(this.currentState));
  }
}

// 全局实例
export const pageTransitionManager = new PageTransitionManager();

/**
 * 使用全局页面切换管理器
 */
export const useGlobalPageTransition = () => {
  const [state, setState] = useState<TransitionState>(
    pageTransitionManager.getState()
  );

  useEffect(() => {
    const unsubscribe = pageTransitionManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    transition: (type?: TransitionType, duration?: number) => {
      pageTransitionManager.transition(type, duration);
    },
    enterSharedHeartSphere: () => {
      pageTransitionManager.enterSharedHeartSphere();
    },
    leaveSharedHeartSphere: () => {
      pageTransitionManager.leaveSharedHeartSphere();
    },
  };
};
