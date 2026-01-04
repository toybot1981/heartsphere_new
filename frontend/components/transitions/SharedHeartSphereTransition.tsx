import React, { useEffect, useState } from 'react';
import { PageTransition, TransitionWrapper } from './PageTransitionSystem';
import { useSharedMode } from '../../hooks/useSharedMode';

/**
 * 共享心域切换特效组件
 * 专门用于进入/离开共享心域时的穿越特效
 */
export interface SharedHeartSphereTransitionProps {
  children: React.ReactNode;
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 进入完成回调 */
  onEnterComplete?: () => void;
  /** 离开完成回调 */
  onLeaveComplete?: () => void;
}

export const SharedHeartSphereTransition: React.FC<SharedHeartSphereTransitionProps> = ({
  children,
  showLoading = false,
  onEnterComplete,
  onLeaveComplete,
}) => {
  const { isActive, shareConfig } = useSharedMode();
  const [transitionKey, setTransitionKey] = useState(0);
  const [isEntering, setIsEntering] = useState(false);
  const [wasActive, setWasActive] = useState(isActive);

  // 监听共享模式状态变化
  useEffect(() => {
    if (isActive && !wasActive) {
      // 进入共享模式
      setIsEntering(true);
      setTransitionKey(prev => prev + 1);
    } else if (!isActive && wasActive) {
      // 离开共享模式
      setIsEntering(false);
      setTransitionKey(prev => prev + 1);
    }
    setWasActive(isActive);
  }, [isActive, wasActive]);

  return (
    <PageTransition
      transitionKey={transitionKey}
      type="starfield"
      duration={1000}
      delay={0}
      showLoading={showLoading}
      isVisible={true}
      onEnterComplete={() => {
        if (isEntering) {
          onEnterComplete?.();
        }
      }}
      onExitComplete={() => {
        if (!isEntering) {
          onLeaveComplete?.();
        }
      }}
    >
      {children}
    </PageTransition>
  );
};

/**
 * 共享心域切换包装器
 * 自动检测共享模式状态并应用特效
 */
export interface SharedHeartSphereWrapperProps {
  children: React.ReactNode;
  /** 自定义切换键（可选） */
  customKey?: string | number;
}

export const SharedHeartSphereWrapper: React.FC<SharedHeartSphereWrapperProps> = ({
  children,
  customKey,
}) => {
  const { isActive } = useSharedMode();
  const transitionKey = customKey || (isActive ? 'shared' : 'own');

  return (
    <TransitionWrapper
      transitionKey={transitionKey}
      type="starfield"
      duration={1000}
    >
      {children}
    </TransitionWrapper>
  );
};
