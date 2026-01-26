import React, { useState, useEffect, useRef, ReactNode } from 'react';

/**
 * 页面切换特效类型
 */
export type TransitionType = 
  | 'fade'           // 淡入淡出
  | 'slide'          // 滑动
  | 'scale'          // 缩放
  | 'portal'          // 穿越（进入）
  | 'portal-out'      // 穿越（离开）
  | 'blur'            // 模糊
  | 'rotate'          // 旋转
  | 'flip'            // 翻转
  | 'zoom'            // 缩放
  | 'slide-fade'      // 滑动+淡入淡出
  | 'starfield';      // 星空穿越

/**
 * 页面切换特效配置
 */
export interface PageTransitionConfig {
  /** 特效类型 */
  type?: TransitionType;
  /** 动画时长（毫秒） */
  duration?: number;
  /** 延迟时间（毫秒） */
  delay?: number;
  /** 方向（用于 slide 类型） */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** 是否显示加载状态 */
  showLoading?: boolean;
  /** 自定义类名 */
  className?: string;
  /** 进入动画完成回调 */
  onEnterComplete?: () => void;
  /** 离开动画完成回调 */
  onExitComplete?: () => void;
}

/**
 * 页面切换特效组件属性
 */
export interface PageTransitionProps extends PageTransitionConfig {
  children: ReactNode;
  /** 是否显示（用于控制切换） */
  isVisible?: boolean;
  /** 切换键（当 key 变化时触发切换） */
  transitionKey?: string | number;
}

/**
 * 页面切换特效系统
 * 提供多种特效，特别支持穿越感效果
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 600,
  delay = 0,
  direction = 'right',
  showLoading = false,
  className = '',
  isVisible = true,
  transitionKey,
  onEnterComplete,
  onExitComplete,
}) => {
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 当 children 或 transitionKey 变化时触发切换
  useEffect(() => {
    if (!isVisible) {
      setIsEntering(false);
      setIsTransitioning(true);
      
      // 离开动画
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setIsTransitioning(false);
        onExitComplete?.();
      }, duration);
      
      return;
    }

    // 进入动画
    setIsTransitioning(true);
    setIsEntering(true);
    
    // 延迟更新内容（用于离开动画）
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setDisplayChildren(children);
      setIsEntering(true);
      
      // 进入动画完成
      setTimeout(() => {
        setIsTransitioning(false);
        onEnterComplete?.();
      }, duration);
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [children, transitionKey, isVisible, duration, delay, onEnterComplete, onExitComplete]);

  // 获取特效类名
  const getTransitionClasses = () => {
    const baseClasses = 'transition-all ease-in-out';
    const stateClasses = isTransitioning
      ? isEntering
        ? 'opacity-100 scale-100'
        : 'opacity-0 scale-95'
      : 'opacity-100 scale-100';

    switch (type) {
      case 'fade':
        return `${baseClasses} ${stateClasses}`;
      
      case 'slide':
        const slideClasses = {
          left: isEntering ? 'translate-x-0' : '-translate-x-full',
          right: isEntering ? 'translate-x-0' : 'translate-x-full',
          up: isEntering ? 'translate-y-0' : '-translate-y-full',
          down: isEntering ? 'translate-y-0' : 'translate-y-full',
        };
        return `${baseClasses} ${slideClasses[direction]} ${isEntering ? 'opacity-100' : 'opacity-0'}`;
      
      case 'scale':
        return `${baseClasses} ${isEntering ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`;
      
      case 'portal':
        return `${baseClasses} ${isEntering ? 'portal-enter' : 'portal-exit'}`;
      
      case 'portal-out':
        return `${baseClasses} ${isEntering ? 'portal-out-enter' : 'portal-out-exit'}`;
      
      case 'blur':
        return `${baseClasses} ${isEntering ? 'blur-0 opacity-100' : 'blur-md opacity-0'}`;
      
      case 'rotate':
        return `${baseClasses} ${isEntering ? 'rotate-0 opacity-100' : 'rotate-180 opacity-0'}`;
      
      case 'flip':
        return `${baseClasses} ${isEntering ? 'flip-enter' : 'flip-exit'}`;
      
      case 'zoom':
        return `${baseClasses} ${isEntering ? 'scale-100 opacity-100' : 'scale-150 opacity-0'}`;
      
      case 'slide-fade':
        const slideFadeClasses = {
          left: isEntering ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0',
          right: isEntering ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
          up: isEntering ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
          down: isEntering ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
        };
        return `${baseClasses} ${slideFadeClasses[direction]}`;
      
      case 'starfield':
        return `${baseClasses} ${isEntering ? 'starfield-enter' : 'starfield-exit'}`;
      
      default:
        return `${baseClasses} ${stateClasses}`;
    }
  };

  // 获取内联样式
  const getTransitionStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transitionDuration: `${duration}ms`,
      transitionDelay: `${delay}ms`,
      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    };

    // 特殊特效需要额外的样式
    if (type === 'portal' || type === 'portal-out' || type === 'starfield') {
      return {
        ...baseStyle,
        transformOrigin: 'center center',
      };
    }

    return baseStyle;
  };

  return (
    <>
      <style>{`
        /* 穿越特效 - 进入 */
        .portal-enter {
          animation: portalEnter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .portal-exit {
          animation: portalExit ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes portalEnter {
          0% {
            transform: scale(0.3) rotateY(90deg) translateZ(-800px);
            opacity: 0;
            filter: blur(30px) brightness(0.3) contrast(1.5) saturate(1.5);
          }
          20% {
            transform: scale(0.6) rotateY(60deg) translateZ(-500px);
            opacity: 0.4;
            filter: blur(25px) brightness(0.6) contrast(1.4) saturate(1.4);
          }
          40% {
            transform: scale(1.0) rotateY(30deg) translateZ(-200px);
            opacity: 0.7;
            filter: blur(15px) brightness(1.0) contrast(1.3) saturate(1.3);
          }
          60% {
            transform: scale(1.15) rotateY(10deg) translateZ(50px);
            opacity: 0.9;
            filter: blur(8px) brightness(1.3) contrast(1.2) saturate(1.2);
          }
          80% {
            transform: scale(1.05) rotateY(2deg) translateZ(0);
            opacity: 1;
            filter: blur(3px) brightness(1.1) contrast(1.1) saturate(1.1);
          }
          100% {
            transform: scale(1) rotateY(0deg) translateZ(0);
            opacity: 1;
            filter: blur(0) brightness(1) contrast(1) saturate(1);
          }
        }
        
        @keyframes portalExit {
          0% {
            transform: scale(1) rotateY(0deg) translateZ(0);
            opacity: 1;
            filter: blur(0) brightness(1) contrast(1) saturate(1);
          }
          20% {
            transform: scale(0.95) rotateY(-10deg) translateZ(50px);
            opacity: 0.9;
            filter: blur(3px) brightness(0.9) contrast(1.1) saturate(1.1);
          }
          40% {
            transform: scale(0.8) rotateY(-30deg) translateZ(-200px);
            opacity: 0.7;
            filter: blur(15px) brightness(0.7) contrast(1.2) saturate(1.2);
          }
          60% {
            transform: scale(0.5) rotateY(-60deg) translateZ(-500px);
            opacity: 0.4;
            filter: blur(25px) brightness(0.4) contrast(1.3) saturate(1.3);
          }
          80% {
            transform: scale(0.3) rotateY(-80deg) translateZ(-700px);
            opacity: 0.2;
            filter: blur(30px) brightness(0.2) contrast(1.4) saturate(1.4);
          }
          100% {
            transform: scale(0.1) rotateY(-90deg) translateZ(-800px);
            opacity: 0;
            filter: blur(35px) brightness(0.1) contrast(1.5) saturate(1.5);
          }
        }
        
        /* 穿越特效 - 离开 */
        .portal-out-enter {
          animation: portalOutEnter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .portal-out-exit {
          animation: portalOutExit ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes portalOutEnter {
          0% {
            transform: scale(1.2) rotateY(-90deg);
            opacity: 0;
            filter: blur(20px) brightness(0.5);
          }
          50% {
            transform: scale(0.95) rotateY(-45deg);
            opacity: 0.7;
            filter: blur(10px) brightness(1.2);
          }
          100% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
            filter: blur(0) brightness(1);
          }
        }
        
        @keyframes portalOutExit {
          0% {
            transform: scale(1) rotateY(0deg);
            opacity: 1;
            filter: blur(0) brightness(1);
          }
          50% {
            transform: scale(1.1) rotateY(45deg);
            opacity: 0.7;
            filter: blur(10px) brightness(0.8);
          }
          100% {
            transform: scale(0.8) rotateY(90deg);
            opacity: 0;
            filter: blur(20px) brightness(0.3);
          }
        }
        
        /* 翻转特效 */
        .flip-enter {
          animation: flipEnter ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .flip-exit {
          animation: flipExit ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        
        @keyframes flipEnter {
          0% {
            transform: perspective(1000px) rotateY(90deg);
            opacity: 0;
          }
          100% {
            transform: perspective(1000px) rotateY(0deg);
            opacity: 1;
          }
        }
        
        @keyframes flipExit {
          0% {
            transform: perspective(1000px) rotateY(0deg);
            opacity: 1;
          }
          100% {
            transform: perspective(1000px) rotateY(-90deg);
            opacity: 0;
          }
        }
        
        /* 星空穿越特效 - 增强版 */
        .starfield-enter {
          animation: starfieldEnter ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          position: relative;
          overflow: hidden;
        }
        .starfield-exit {
          animation: starfieldExit ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          position: relative;
          overflow: hidden;
        }
        
        /* 星星粒子背景层 */
        .starfield-enter::before,
        .starfield-exit::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 90% 80%, white, transparent),
            radial-gradient(1px 1px at 33% 90%, rgba(255,255,255,0.7), transparent),
            radial-gradient(2px 2px at 10% 50%, white, transparent),
            radial-gradient(1px 1px at 70% 20%, rgba(255,255,255,0.8), transparent);
          background-size: 200% 200%;
          background-position: 0% 0%;
          animation: starfieldMove ${duration * 2}ms linear infinite;
          pointer-events: none;
          z-index: 1;
          opacity: 0;
        }
        
        .starfield-enter::before {
          animation: starfieldMove ${duration * 2}ms linear infinite, starfieldFadeIn ${duration}ms ease-out forwards;
        }
        
        .starfield-exit::before {
          animation: starfieldMove ${duration * 2}ms linear infinite, starfieldFadeOut ${duration}ms ease-in forwards;
        }
        
        /* 光流效果 */
        .starfield-enter::after,
        .starfield-exit::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: 
            radial-gradient(ellipse at center, 
              rgba(255,255,255,0.4) 0%,
              rgba(173,216,230,0.3) 20%,
              rgba(138,43,226,0.2) 40%,
              transparent 70%);
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
          opacity: 0;
        }
        
        .starfield-enter::after {
          animation: starfieldLightIn ${duration}ms ease-out forwards;
        }
        
        .starfield-exit::after {
          animation: starfieldLightOut ${duration}ms ease-in forwards;
        }
        
        @keyframes starfieldMove {
          0% {
            background-position: 0% 0%;
            transform: translate(0, 0) scale(1);
          }
          100% {
            background-position: 100% 100%;
            transform: translate(50px, 50px) scale(1.5);
          }
        }
        
        @keyframes starfieldFadeIn {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes starfieldFadeOut {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        
        @keyframes starfieldLightIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
          30% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.2);
          }
          60% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
        }
        
        @keyframes starfieldLightOut {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
          }
          40% {
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          70% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.3);
          }
        }
        
        @keyframes starfieldEnter {
          0% {
            transform: scale(0.3) translateZ(-1000px) rotateX(15deg);
            opacity: 0;
            filter: blur(40px) brightness(0.2) contrast(1.5);
          }
          15% {
            transform: scale(0.5) translateZ(-700px) rotateX(10deg);
            opacity: 0.3;
            filter: blur(30px) brightness(0.4) contrast(1.4);
          }
          35% {
            transform: scale(0.8) translateZ(-400px) rotateX(5deg);
            opacity: 0.6;
            filter: blur(20px) brightness(0.7) contrast(1.3);
          }
          55% {
            transform: scale(1.1) translateZ(-100px) rotateX(2deg);
            opacity: 0.9;
            filter: blur(10px) brightness(1.1) contrast(1.2);
          }
          75% {
            transform: scale(1.05) translateZ(50px) rotateX(0deg);
            opacity: 1;
            filter: blur(5px) brightness(1.2) contrast(1.1);
          }
          100% {
            transform: scale(1) translateZ(0) rotateX(0deg);
            opacity: 1;
            filter: blur(0) brightness(1) contrast(1);
          }
        }
        
        @keyframes starfieldExit {
          0% {
            transform: scale(1) translateZ(0) rotateX(0deg);
            opacity: 1;
            filter: blur(0) brightness(1) contrast(1);
          }
          25% {
            transform: scale(0.95) translateZ(50px) rotateX(-2deg);
            opacity: 0.9;
            filter: blur(5px) brightness(0.9) contrast(1.1);
          }
          45% {
            transform: scale(0.8) translateZ(-100px) rotateX(-5deg);
            opacity: 0.6;
            filter: blur(10px) brightness(0.7) contrast(1.2);
          }
          65% {
            transform: scale(0.5) translateZ(-400px) rotateX(-10deg);
            opacity: 0.3;
            filter: blur(20px) brightness(0.4) contrast(1.3);
          }
          85% {
            transform: scale(0.3) translateZ(-700px) rotateX(-15deg);
            opacity: 0.1;
            filter: blur(30px) brightness(0.2) contrast(1.4);
          }
          100% {
            transform: scale(0.1) translateZ(-1000px) rotateX(-20deg);
            opacity: 0;
            filter: blur(40px) brightness(0.1) contrast(1.5);
          }
        }
      `}</style>
      
      <div
        ref={containerRef}
        className={`page-transition-container ${getTransitionClasses()} ${className}`}
        style={getTransitionStyles()}
      >
        {displayChildren}
        {showLoading && isTransitioning && (
          <div 
            className="absolute inset-0 flex items-center justify-center backdrop-blur-sm z-50"
            style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.2))' }}
          >
            <div 
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
              style={{ borderColor: 'var(--color-primary, #3b82f6)' }}
            />
          </div>
        )}
      </div>
    </>
  );
};

/**
 * 页面切换包装器
 * 用于包装整个页面内容
 */
export interface TransitionWrapperProps {
  children: ReactNode;
  transitionKey?: string | number;
  type?: TransitionType;
  duration?: number;
  className?: string;
}

export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  transitionKey,
  type = 'fade',
  duration = 600,
  className = '',
}) => {
  return (
    <PageTransition
      transitionKey={transitionKey}
      type={type}
      duration={duration}
      className={className}
    >
      {children}
    </PageTransition>
  );
};
