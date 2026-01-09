/**
 * 传送动画系统
 * 处理传送过程中的场景切换动画
 */

import React, { useEffect, useState, useRef } from 'react';
import { PortalAnimationState } from './types';

interface TeleportationAnimationProps {
  isActive: boolean;
  skipAnimation?: boolean;
  duration?: number; // 动画时长（毫秒）
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onFadeOutComplete?: () => void; // 淡出完成回调（用于切换场景）
  children?: React.ReactNode;
}

/**
 * 传送动画组件
 * 实现场景淡入淡出、传送效果
 */
export const TeleportationAnimation: React.FC<TeleportationAnimationProps> = ({
  isActive,
  skipAnimation = false,
  duration = 2000,
  onAnimationStart,
  onAnimationEnd,
  onFadeOutComplete,
  children,
}) => {
  const [phase, setPhase] = useState<'idle' | 'fadeOut' | 'teleporting' | 'fadeIn' | 'complete'>('idle');
  const [opacity, setOpacity] = useState(1);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isActive) {
      // 重置状态
      setPhase('idle');
      setOpacity(1);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    if (skipAnimation) {
      // 跳过动画，直接完成
      onAnimationStart?.();
      onFadeOutComplete?.();
      setTimeout(() => {
        onAnimationEnd?.();
      }, 100);
      return;
    }

    // 开始动画
    onAnimationStart?.();
    setPhase('fadeOut');
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 0.4) {
        // 淡出阶段（0-40%）
        if (phase !== 'fadeOut') {
          setPhase('fadeOut');
        }
        setOpacity(1 - progress / 0.4);
      } else if (progress < 0.6) {
        // 传送中阶段（40-60%）
        if (phase !== 'teleporting') {
          setPhase('teleporting');
          // 淡出完成，触发场景切换
          onFadeOutComplete?.();
        }
        setOpacity(0);
      } else {
        // 淡入阶段（60-100%）
        if (phase !== 'fadeIn') {
          setPhase('fadeIn');
        }
        setOpacity((progress - 0.6) / 0.4);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成
        setPhase('complete');
        setOpacity(1);
        onAnimationEnd?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isActive, skipAnimation, duration, onAnimationStart, onAnimationEnd, onFadeOutComplete]);

  if (!isActive && phase === 'idle') {
    return <>{children}</>;
  }

  return (
    <div
      className="teleportation-animation-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {/* 内容层（带透明度变化） */}
      <div
        style={{
          opacity,
          transition: skipAnimation ? 'none' : 'opacity 0.1s ease-out',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </div>

      {/* 传送效果遮罩层 */}
      {phase === 'teleporting' && (
        <div
          className="teleportation-overlay"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: `
              radial-gradient(circle at center, 
                rgba(76, 95, 217, 0.9) 0%,
                rgba(76, 95, 217, 0.7) 30%,
                rgba(13, 148, 136, 0.5) 60%,
                rgba(0, 0, 0, 0.95) 100%
              )
            `,
            pointerEvents: 'none',
            zIndex: 9999,
            animation: 'portal-teleporting 0.8s ease-in-out',
          }}
        >
          {/* 传送效果粒子/光流 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  rgba(76, 95, 217, 0.8) 90deg,
                  transparent 180deg,
                  rgba(13, 148, 136, 0.8) 270deg,
                  transparent 360deg
                )
              `,
              animation: 'portal-spin 1s linear infinite',
              filter: 'blur(20px)',
            }}
          />
        </div>
      )}

      {/* CSS动画定义 */}
      <style>{`
        @keyframes portal-teleporting {
          0% {
            opacity: 0;
            filter: blur(0px);
          }
          50% {
            opacity: 1;
            filter: blur(10px);
          }
          100% {
            opacity: 0;
            filter: blur(0px);
          }
        }
        
        @keyframes portal-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
            scale: 1;
          }
          50% {
            scale: 1.5;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
            scale: 1;
          }
        }
      `}</style>
    </div>
  );
};
