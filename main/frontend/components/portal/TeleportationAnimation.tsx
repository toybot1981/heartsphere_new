/**
 * 传送动画系统
 * 处理传送过程中的场景切换动画
 */

import React, { useEffect, useState, useRef } from 'react';
import { PortalAnimationState } from './types';

/**
 * 根据传送门类型获取背景渐变
 */
function getPortalBackground(portalType: 'stargate' | 'wormhole' | 'quantum' | 'garden' | 'sakura' | 'butterfly' | 'rainbow'): string {
  switch (portalType) {
    case 'stargate':
      // 星门：蓝紫色径向渐变，类似星门的光环
      return `
        radial-gradient(circle at center, 
          rgba(76, 95, 217, 0.95) 0%,
          rgba(76, 95, 217, 0.85) 20%,
          rgba(13, 148, 136, 0.7) 40%,
          rgba(76, 95, 217, 0.5) 60%,
          rgba(0, 0, 0, 0.98) 100%
        )
      `;
    case 'wormhole':
      // 虫洞：深紫色扭曲效果，类似时空扭曲 - 增强版
      return `
        radial-gradient(ellipse at center, 
          rgba(186, 85, 211, 0.98) 0%,
          rgba(138, 43, 226, 0.95) 15%,
          rgba(75, 0, 130, 0.9) 30%,
          rgba(0, 0, 139, 0.8) 50%,
          rgba(25, 25, 112, 0.7) 70%,
          rgba(0, 0, 0, 0.95) 100%
        )
      `;
    case 'quantum':
      // 量子传送门：青色科技感，类似量子纠缠
      return `
        radial-gradient(circle at center, 
          rgba(0, 255, 255, 0.9) 0%,
          rgba(0, 191, 255, 0.8) 25%,
          rgba(0, 100, 200, 0.6) 50%,
          rgba(0, 0, 0, 0.98) 100%
        )
      `;
    case 'garden':
      // 花园传送门：绿色自然，典雅轻柔
      return `
        radial-gradient(circle at center, 
          rgba(144, 238, 144, 0.85) 0%,
          rgba(152, 251, 152, 0.75) 20%,
          rgba(124, 252, 0, 0.65) 40%,
          rgba(107, 142, 35, 0.55) 60%,
          rgba(0, 0, 0, 0.95) 100%
        )
      `;
    case 'sakura':
      // 樱花传送门：粉色樱花，典雅轻柔
      return `
        radial-gradient(circle at center, 
          rgba(255, 192, 203, 0.9) 0%,
          rgba(255, 182, 193, 0.8) 20%,
          rgba(255, 160, 122, 0.7) 40%,
          rgba(255, 105, 180, 0.6) 60%,
          rgba(0, 0, 0, 0.95) 100%
        )
      `;
    case 'butterfly':
      // 蝴蝶传送门：多彩轻盈，典雅轻柔
      return `
        radial-gradient(circle at center, 
          rgba(255, 218, 185, 0.85) 0%,
          rgba(255, 182, 193, 0.75) 25%,
          rgba(221, 160, 221, 0.65) 50%,
          rgba(176, 224, 230, 0.55) 75%,
          rgba(0, 0, 0, 0.95) 100%
        )
      `;
    case 'rainbow':
      // 彩虹传送门：七彩渐变，典雅轻柔
      return `
        radial-gradient(circle at center, 
          rgba(255, 0, 0, 0.7) 0%,
          rgba(255, 165, 0, 0.7) 16%,
          rgba(255, 255, 0, 0.7) 33%,
          rgba(0, 255, 0, 0.7) 50%,
          rgba(0, 191, 255, 0.7) 66%,
          rgba(138, 43, 226, 0.7) 83%,
          rgba(0, 0, 0, 0.95) 100%
        )
      `;
    default:
      return `
        radial-gradient(circle at center, 
          rgba(76, 95, 217, 0.9) 0%,
          rgba(0, 0, 0, 0.95) 100%
        )
      `;
  }
}

/**
 * 根据传送门类型获取中心效果元素
 */
function getPortalCenterEffect(portalType: 'stargate' | 'wormhole' | 'quantum' | 'garden' | 'sakura' | 'butterfly' | 'rainbow'): React.ReactNode {
  switch (portalType) {
    case 'stargate':
      // 星门：圆形旋转光环
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 0deg,
                  transparent 0deg,
                  rgba(76, 95, 217, 0.9) 60deg,
                  rgba(13, 148, 136, 0.9) 120deg,
                  transparent 180deg,
                  rgba(76, 95, 217, 0.9) 240deg,
                  rgba(13, 148, 136, 0.9) 300deg,
                  transparent 360deg
                )
              `,
              animation: 'portal-stargate-spin 3s linear infinite', // 旋转速度减慢一倍
              filter: 'blur(15px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '4px solid rgba(76, 95, 217, 0.8)',
              boxShadow: '0 0 40px rgba(76, 95, 217, 0.6), inset 0 0 40px rgba(76, 95, 217, 0.4)',
              animation: 'portal-stargate-pulse 2s ease-in-out infinite', // 脉冲速度减慢一倍
            }}
          />
        </>
      );
    case 'wormhole':
      // 虫洞：椭圆形扭曲漩涡 - 增强版
      return (
        <>
          {/* 外层扭曲光晕 - 大范围 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '600px',
              height: '400px',
              borderRadius: '50%',
              background: `
                radial-gradient(ellipse at center,
                  rgba(138, 43, 226, 0.9) 0%,
                  rgba(75, 0, 130, 0.8) 20%,
                  rgba(0, 0, 139, 0.6) 40%,
                  transparent 70%
                )
              `,
              animation: 'portal-wormhole-warp-outer 3s ease-in-out infinite',
              filter: 'blur(30px)',
              opacity: 0.8,
            }}
          />
          {/* 中层扭曲漩涡 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              height: '300px',
              borderRadius: '50%',
              background: `
                radial-gradient(ellipse at center,
                  rgba(186, 85, 211, 0.9) 0%,
                  rgba(138, 43, 226, 0.7) 30%,
                  rgba(75, 0, 130, 0.5) 60%,
                  transparent 80%
                )
              `,
              animation: 'portal-wormhole-warp 2.4s ease-in-out infinite',
              filter: 'blur(25px)',
            }}
          />
          {/* 内层核心漩涡 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              height: '250px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 0deg,
                  rgba(138, 43, 226, 0.9) 0deg,
                  rgba(186, 85, 211, 0.9) 60deg,
                  rgba(75, 0, 130, 0.9) 120deg,
                  rgba(138, 43, 226, 0.9) 180deg,
                  rgba(186, 85, 211, 0.9) 240deg,
                  rgba(75, 0, 130, 0.9) 300deg,
                  rgba(138, 43, 226, 0.9) 360deg
                )
              `,
              animation: 'portal-wormhole-core 1.5s linear infinite',
              filter: 'blur(15px)',
            }}
          />
          {/* 旋转边框 - 外层 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(0deg)',
              width: '450px',
              height: '280px',
              borderRadius: '50%',
              border: '4px solid rgba(138, 43, 226, 0.9)',
              boxShadow: '0 0 80px rgba(138, 43, 226, 0.8), inset 0 0 60px rgba(186, 85, 211, 0.4)',
              animation: 'portal-wormhole-rotate 3s linear infinite',
            }}
          />
          {/* 旋转边框 - 内层 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(45deg)',
              width: '350px',
              height: '200px',
              borderRadius: '50%',
              border: '3px solid rgba(186, 85, 211, 0.8)',
              boxShadow: '0 0 60px rgba(186, 85, 211, 0.6)',
              animation: 'portal-wormhole-rotate-reverse 4s linear infinite',
            }}
          />
          {/* 中心亮点 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150px',
              height: '100px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(186, 85, 211, 0.8) 50%, transparent 100%)',
              animation: 'portal-wormhole-pulse 1.2s ease-in-out infinite',
              filter: 'blur(10px)',
            }}
          />
        </>
      );
    case 'quantum':
      // 量子传送门：六边形科技感
      return (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: `
                conic-gradient(
                  from 0deg,
                  rgba(0, 255, 255, 0.8) 0deg,
                  rgba(0, 191, 255, 0.8) 60deg,
                  rgba(0, 255, 255, 0.8) 120deg,
                  rgba(0, 191, 255, 0.8) 180deg,
                  rgba(0, 255, 255, 0.8) 240deg,
                  rgba(0, 191, 255, 0.8) 300deg,
                  rgba(0, 255, 255, 0.8) 360deg
                )
              `,
              animation: 'portal-quantum-spin 4s linear infinite', // 旋转速度减慢一倍
              filter: 'blur(10px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              border: '3px solid rgba(0, 255, 255, 0.9)',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.3)',
              animation: 'portal-quantum-pulse 3s ease-in-out infinite', // 脉冲速度减慢一倍
            }}
          />
        </>
      );
    case 'garden':
      // 花园传送门：绿色自然，典雅轻柔
      return (
        <>
          {/* 外层光晕 - 绿色自然 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle,
                  rgba(144, 238, 144, 0.6) 0%,
                  rgba(152, 251, 152, 0.5) 30%,
                  rgba(124, 252, 0, 0.4) 60%,
                  transparent 100%
                )
              `,
              animation: 'portal-garden-bloom 4s ease-in-out infinite',
              filter: 'blur(30px)',
            }}
          />
          {/* 花瓣旋转 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 0deg,
                  rgba(144, 238, 144, 0.8) 0deg,
                  rgba(152, 251, 152, 0.8) 72deg,
                  rgba(124, 252, 0, 0.8) 144deg,
                  rgba(107, 142, 35, 0.8) 216deg,
                  rgba(144, 238, 144, 0.8) 288deg,
                  rgba(144, 238, 144, 0.8) 360deg
                )
              `,
              animation: 'portal-garden-rotate 6s linear infinite',
              filter: 'blur(20px)',
            }}
          />
          {/* 中心花朵 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(144, 238, 144, 0.8) 50%, transparent 100%)',
              animation: 'portal-garden-pulse 3s ease-in-out infinite',
              filter: 'blur(10px)',
            }}
          />
        </>
      );
    case 'sakura':
      // 樱花传送门：粉色樱花，典雅轻柔
      return (
        <>
          {/* 樱花花瓣飘落效果 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: `
                radial-gradient(circle,
                  rgba(255, 192, 203, 0.7) 0%,
                  rgba(255, 182, 193, 0.6) 25%,
                  rgba(255, 160, 122, 0.5) 50%,
                  rgba(255, 105, 180, 0.4) 75%,
                  transparent 100%
                )
              `,
              animation: 'portal-sakura-fall 5s ease-in-out infinite',
              filter: 'blur(25px)',
            }}
          />
          {/* 樱花旋转 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 0deg,
                  rgba(255, 192, 203, 0.8) 0deg,
                  rgba(255, 182, 193, 0.8) 60deg,
                  rgba(255, 160, 122, 0.8) 120deg,
                  rgba(255, 105, 180, 0.8) 180deg,
                  rgba(255, 192, 203, 0.8) 240deg,
                  rgba(255, 182, 193, 0.8) 300deg,
                  rgba(255, 192, 203, 0.8) 360deg
                )
              `,
              animation: 'portal-sakura-rotate 8s linear infinite',
              filter: 'blur(15px)',
            }}
          />
          {/* 中心樱花 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 192, 203, 0.9) 40%, rgba(255, 182, 193, 0.7) 70%, transparent 100%)',
              animation: 'portal-sakura-bloom 4s ease-in-out infinite',
              filter: 'blur(8px)',
            }}
          />
        </>
      );
    case 'butterfly':
      // 蝴蝶传送门：多彩轻盈，典雅轻柔
      return (
        <>
          {/* 蝴蝶翅膀效果 - 左翼 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-60%, -50%) rotate(-20deg)',
              width: '200px',
              height: '300px',
              borderRadius: '50% 0 50% 0',
              background: `
                radial-gradient(ellipse at 30% 50%,
                  rgba(255, 218, 185, 0.8) 0%,
                  rgba(255, 182, 193, 0.7) 30%,
                  rgba(221, 160, 221, 0.6) 60%,
                  transparent 100%
                )
              `,
              animation: 'portal-butterfly-flutter-left 2s ease-in-out infinite',
              filter: 'blur(15px)',
            }}
          />
          {/* 蝴蝶翅膀效果 - 右翼 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-40%, -50%) rotate(20deg)',
              width: '200px',
              height: '300px',
              borderRadius: '0 50% 0 50%',
              background: `
                radial-gradient(ellipse at 70% 50%,
                  rgba(176, 224, 230, 0.8) 0%,
                  rgba(221, 160, 221, 0.7) 30%,
                  rgba(255, 182, 193, 0.6) 60%,
                  transparent 100%
                )
              `,
              animation: 'portal-butterfly-flutter-right 2s ease-in-out infinite',
              filter: 'blur(15px)',
            }}
          />
          {/* 中心光点 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 218, 185, 0.8) 50%, transparent 100%)',
              animation: 'portal-butterfly-glow 2.5s ease-in-out infinite',
              filter: 'blur(10px)',
            }}
          />
        </>
      );
    case 'rainbow':
      // 彩虹传送门：七彩渐变，典雅轻柔
      return (
        <>
          {/* 外层彩虹光环 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 0deg,
                  rgba(255, 0, 0, 0.6) 0deg,
                  rgba(255, 165, 0, 0.6) 51deg,
                  rgba(255, 255, 0, 0.6) 103deg,
                  rgba(0, 255, 0, 0.6) 154deg,
                  rgba(0, 191, 255, 0.6) 206deg,
                  rgba(138, 43, 226, 0.6) 257deg,
                  rgba(255, 0, 0, 0.6) 309deg,
                  rgba(255, 0, 0, 0.6) 360deg
                )
              `,
              animation: 'portal-rainbow-rotate 4s linear infinite',
              filter: 'blur(30px)',
            }}
          />
          {/* 中层彩虹 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '350px',
              height: '350px',
              borderRadius: '50%',
              background: `
                conic-gradient(
                  from 180deg,
                  rgba(255, 0, 0, 0.7) 0deg,
                  rgba(255, 165, 0, 0.7) 51deg,
                  rgba(255, 255, 0, 0.7) 103deg,
                  rgba(0, 255, 0, 0.7) 154deg,
                  rgba(0, 191, 255, 0.7) 206deg,
                  rgba(138, 43, 226, 0.7) 257deg,
                  rgba(255, 0, 0, 0.7) 309deg,
                  rgba(255, 0, 0, 0.7) 360deg
                )
              `,
              animation: 'portal-rainbow-rotate-reverse 5s linear infinite',
              filter: 'blur(20px)',
            }}
          />
          {/* 中心白光 */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 50%, transparent 100%)',
              animation: 'portal-rainbow-pulse 3s ease-in-out infinite',
              filter: 'blur(12px)',
            }}
          />
        </>
      );
    default:
      return null;
  }
}

interface TeleportationAnimationProps {
  isActive: boolean;
  skipAnimation?: boolean;
  duration?: number; // 动画时长（毫秒）
  portalType?: 'stargate' | 'wormhole' | 'quantum' | 'garden' | 'sakura' | 'butterfly' | 'rainbow'; // 传送门类型
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
  duration = 4000, // 默认4秒，比原来长一倍
  portalType = 'stargate',
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

  // 如果不在激活状态且处于空闲状态，只渲染 children（如果有）
  if (!isActive && phase === 'idle') {
    return children ? <>{children}</> : null;
  }

  return (
    <>
      {/* 内容层（带透明度变化）- 只在有 children 时渲染 */}
      {children && (
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
      )}

      {/* 传送效果遮罩层 - 覆盖整个屏幕，在 fadeOut、teleporting 和 fadeIn 阶段都显示 */}
      {isActive && (phase === 'fadeOut' || phase === 'teleporting' || phase === 'fadeIn') && (
        <div
          className="teleportation-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: getPortalBackground(portalType),
            pointerEvents: 'none',
            zIndex: 99999, // 非常高的 z-index，确保覆盖所有内容
            animation: phase === 'teleporting' ? `portal-teleporting-${portalType} 2.4s ease-in-out` : 'none', // 只在传送中阶段播放动画
            opacity: phase === 'fadeOut' ? 1 - opacity : phase === 'fadeIn' ? opacity : 1, // 根据阶段调整透明度
          }}
        >
          {/* 传送效果中心 - 根据类型显示不同形状 */}
          {getPortalCenterEffect(portalType)}
        </div>
      )}

      {/* CSS动画定义 - 根据传送门类型 */}
      <style>{`
        /* 星门动画 */
        @keyframes portal-teleporting-stargate {
          0% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
          30% {
            opacity: 1;
            filter: blur(5px) brightness(1.5);
          }
          70% {
            opacity: 1;
            filter: blur(10px) brightness(2);
          }
          100% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
        }
        
        @keyframes portal-stargate-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.2);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
          }
        }
        
        @keyframes portal-stargate-pulse {
          0%, 100% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }
        
        /* 虫洞动画 - 增强版 */
        @keyframes portal-teleporting-wormhole {
          0% {
            opacity: 0;
            filter: blur(0px) hue-rotate(0deg) brightness(1);
          }
          15% {
            opacity: 0.9;
            filter: blur(5px) hue-rotate(45deg) brightness(1.3);
          }
          30% {
            opacity: 1;
            filter: blur(10px) hue-rotate(90deg) brightness(1.5);
          }
          50% {
            opacity: 1;
            filter: blur(15px) hue-rotate(180deg) brightness(1.8);
          }
          70% {
            opacity: 1;
            filter: blur(10px) hue-rotate(270deg) brightness(1.5);
          }
          85% {
            opacity: 0.9;
            filter: blur(5px) hue-rotate(315deg) brightness(1.3);
          }
          100% {
            opacity: 0;
            filter: blur(0px) hue-rotate(360deg) brightness(1);
          }
        }
        
        /* 外层扭曲动画 */
        @keyframes portal-wormhole-warp-outer {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            border-radius: 50%;
            opacity: 0.8;
          }
          33% {
            transform: translate(-50%, -50%) scale(1.2) rotate(120deg);
            border-radius: 45% 55% 45% 55%;
            opacity: 0.9;
          }
          66% {
            transform: translate(-50%, -50%) scale(1.1) rotate(240deg);
            border-radius: 55% 45% 55% 45%;
            opacity: 0.85;
          }
        }
        
        /* 中层扭曲动画 */
        @keyframes portal-wormhole-warp {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            border-radius: 50%;
          }
          25% {
            transform: translate(-50%, -50%) scale(1.15) rotate(90deg);
            border-radius: 40% 60% 40% 60%;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3) rotate(180deg);
            border-radius: 60% 40% 60% 40%;
          }
          75% {
            transform: translate(-50%, -50%) scale(1.15) rotate(270deg);
            border-radius: 40% 60% 40% 60%;
          }
        }
        
        /* 核心旋转动画 */
        @keyframes portal-wormhole-core {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.1);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
          }
        }
        
        /* 外层边框旋转 */
        @keyframes portal-wormhole-rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
            opacity: 0.9;
          }
        }
        
        /* 内层边框反向旋转 */
        @keyframes portal-wormhole-rotate-reverse {
          0% {
            transform: translate(-50%, -50%) rotate(45deg) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(-50%, -50%) rotate(225deg) scale(1.05);
            opacity: 0.9;
          }
          100% {
            transform: translate(-50%, -50%) rotate(405deg) scale(1);
            opacity: 0.8;
          }
        }
        
        /* 中心脉冲动画 */
        @keyframes portal-wormhole-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 1;
          }
        }
        
        /* 量子传送门动画 */
        @keyframes portal-teleporting-quantum {
          0% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
          20% {
            opacity: 0.9;
            filter: blur(3px) brightness(1.8);
          }
          50% {
            opacity: 1;
            filter: blur(8px) brightness(2.5);
          }
          80% {
            opacity: 0.9;
            filter: blur(3px) brightness(1.8);
          }
          100% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
        }
        
        @keyframes portal-quantum-spin {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) rotate(180deg) scale(1.15);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg) scale(1);
          }
        }
        
        @keyframes portal-quantum-pulse {
          0%, 100% {
            opacity: 0.9;
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 30px rgba(0, 255, 255, 0.6), inset 0 0 30px rgba(0, 255, 255, 0.3);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
            box-shadow: 0 0 50px rgba(0, 255, 255, 0.9), inset 0 0 50px rgba(0, 255, 255, 0.5);
          }
        }
        
        /* 花园传送门动画 */
        @keyframes portal-teleporting-garden {
          0% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
          20% {
            opacity: 0.85;
            filter: blur(3px) brightness(1.3);
          }
          50% {
            opacity: 1;
            filter: blur(8px) brightness(1.6);
          }
          80% {
            opacity: 0.85;
            filter: blur(3px) brightness(1.3);
          }
          100% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
        }
        
        @keyframes portal-garden-bloom {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.8;
          }
        }
        
        @keyframes portal-garden-rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes portal-garden-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
        }
        
        /* 樱花传送门动画 */
        @keyframes portal-teleporting-sakura {
          0% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
          15% {
            opacity: 0.9;
            filter: blur(4px) brightness(1.4);
          }
          50% {
            opacity: 1;
            filter: blur(10px) brightness(1.7);
          }
          85% {
            opacity: 0.9;
            filter: blur(4px) brightness(1.4);
          }
          100% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
        }
        
        @keyframes portal-sakura-fall {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
            opacity: 0.7;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15) rotate(180deg);
            opacity: 0.9;
          }
        }
        
        @keyframes portal-sakura-rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes portal-sakura-bloom {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.95;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.15);
            opacity: 1;
          }
        }
        
        /* 蝴蝶传送门动画 */
        @keyframes portal-teleporting-butterfly {
          0% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
          20% {
            opacity: 0.85;
            filter: blur(3px) brightness(1.3);
          }
          50% {
            opacity: 1;
            filter: blur(8px) brightness(1.6);
          }
          80% {
            opacity: 0.85;
            filter: blur(3px) brightness(1.3);
          }
          100% {
            opacity: 0;
            filter: blur(0px) brightness(1);
          }
        }
        
        @keyframes portal-butterfly-flutter-left {
          0%, 100% {
            transform: translate(-60%, -50%) rotate(-20deg) scaleY(1);
          }
          50% {
            transform: translate(-60%, -50%) rotate(-10deg) scaleY(0.9);
          }
        }
        
        @keyframes portal-butterfly-flutter-right {
          0%, 100% {
            transform: translate(-40%, -50%) rotate(20deg) scaleY(1);
          }
          50% {
            transform: translate(-40%, -50%) rotate(10deg) scaleY(0.9);
          }
        }
        
        @keyframes portal-butterfly-glow {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 1;
          }
        }
        
        /* 彩虹传送门动画 */
        @keyframes portal-teleporting-rainbow {
          0% {
            opacity: 0;
            filter: blur(0px) brightness(1) hue-rotate(0deg);
          }
          20% {
            opacity: 0.9;
            filter: blur(4px) brightness(1.4) hue-rotate(60deg);
          }
          50% {
            opacity: 1;
            filter: blur(10px) brightness(1.8) hue-rotate(180deg);
          }
          80% {
            opacity: 0.9;
            filter: blur(4px) brightness(1.4) hue-rotate(300deg);
          }
          100% {
            opacity: 0;
            filter: blur(0px) brightness(1) hue-rotate(360deg);
          }
        }
        
        @keyframes portal-rainbow-rotate {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        @keyframes portal-rainbow-rotate-reverse {
          0% {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          100% {
            transform: translate(-50%, -50%) rotate(-360deg);
          }
        }
        
        @keyframes portal-rainbow-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.95;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};
