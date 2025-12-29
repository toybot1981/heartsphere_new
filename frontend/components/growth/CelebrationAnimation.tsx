/**
 * 庆祝动画组件
 * 显示里程碑达成时的庆祝动画
 */

import React, { useEffect, useState } from 'react';
import { CelebrationMessage } from '../../services/growth-system/celebration/CelebrationManager';

interface CelebrationAnimationProps {
  celebration: CelebrationMessage;
  onComplete: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  celebration,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<'entering' | 'showing' | 'exiting'>(
    'entering'
  );

  useEffect(() => {
    // 进入动画
    setTimeout(() => {
      setAnimationPhase('showing');
    }, 300);

    // 退出动画
    setTimeout(() => {
      setAnimationPhase('exiting');
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 500);
    }, celebration.duration - 500);
  }, [celebration.duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none ${
        animationPhase === 'entering'
          ? 'opacity-0 scale-95'
          : animationPhase === 'exiting'
          ? 'opacity-0 scale-105'
          : 'opacity-100 scale-100'
      } transition-all duration-500`}
    >
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* 庆祝内容 */}
      <div className="relative z-10 bg-gradient-to-br from-purple-600/90 to-pink-600/90 rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-white/30 shadow-2xl">
        {/* 标题 */}
        <div className="text-center mb-4">
          <h2 className="text-3xl font-bold text-white mb-2 animate-bounce">
            {celebration.title}
          </h2>
          <p className="text-white/90 text-lg">{celebration.message}</p>
        </div>

        {/* 里程碑信息 */}
        <div className="bg-white/20 rounded-lg p-4 mb-4 backdrop-blur-sm">
          <p className="text-white font-semibold text-center">
            {celebration.milestone.title}
          </p>
          {celebration.milestone.value && (
            <p className="text-white/80 text-sm text-center mt-1">
              达成值: {celebration.milestone.value}
            </p>
          )}
        </div>

        {/* 动画效果 */}
        <AnimationEffect type={celebration.animationType} />
      </div>
    </div>
  );
};

/**
 * 动画效果组件
 */
interface AnimationEffectProps {
  type: CelebrationMessage['animationType'];
}

const AnimationEffect: React.FC<AnimationEffectProps> = ({ type }) => {
  switch (type) {
    case 'confetti':
      return <ConfettiAnimation />;
    case 'fireworks':
      return <FireworksAnimation />;
    case 'sparkles':
      return <SparklesAnimation />;
    case 'stars':
      return <StarsAnimation />;
    default:
      return <StarsAnimation />;
  }
};

/**
 * 彩带动画
 */
const ConfettiAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][
              Math.floor(Math.random() * 5)
            ],
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * 烟花动画
 */
const FireworksAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-firework"
          style={{
            left: '50%',
            top: '50%',
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][
              Math.floor(Math.random() * 5)
            ],
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

/**
 * 闪烁动画
 */
const SparklesAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full animate-sparkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
};

/**
 * 星星动画
 */
const StarsAnimation: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
};

/**
 * 添加CSS动画（通过内联样式或全局CSS）
 */
const celebrationStyles = `
@keyframes confetti {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes firework {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx, 0), var(--ty, 0)) scale(0);
    opacity: 0;
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes star {
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
}

.animate-confetti {
  animation: confetti linear infinite;
}

.animate-firework {
  animation: firework 1s ease-out forwards;
  --tx: ${Math.random() * 200 - 100}px;
  --ty: ${Math.random() * 200 - 100}px;
}

.animate-sparkle {
  animation: sparkle ease-in-out infinite;
}

.animate-star {
  animation: star ease-in-out infinite;
}
`;

// 将样式注入到页面（如果还没有）
if (typeof document !== 'undefined' && !document.getElementById('celebration-styles')) {
  const style = document.createElement('style');
  style.id = 'celebration-styles';
  style.textContent = celebrationStyles;
  document.head.appendChild(style);
}

