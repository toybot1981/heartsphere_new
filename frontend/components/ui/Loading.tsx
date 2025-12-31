import React, { useEffect, useState } from 'react';

/**
 * 加载状态组件
 * 温暖友好的加载提示
 */

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  message,
  fullScreen = false,
  className = '',
}) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  
  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
    }
  }, [message]);
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };
  
  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/50 backdrop-blur-sm'
    : 'flex flex-col items-center justify-center';
  
  return (
    <div className={`${containerClass} ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        {/* 外圈 */}
        <div className="absolute inset-0 rounded-full border-4 border-warm-pink-light/20 animate-pulse-soft" />
        
        {/* 内圈旋转 */}
        <div className="absolute inset-2 rounded-full border-4 border-warm-pink border-t-transparent animate-spin" />
        
        {/* 中心光点 */}
        <div className="absolute inset-1/2 -m-2 w-4 h-4 bg-warm-pink rounded-full animate-pulse" />
      </div>
      
      {message && (
        <p className="mt-4 text-body text-text-secondary animate-fade-in">
          {displayMessage}
        </p>
      )}
    </div>
  );
};

/**
 * 骨架屏组件
 */
export interface SkeletonProps {
  className?: string;
  count?: number;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  count = 1,
  variant = 'text',
}) => {
  const baseStyles = 'bg-warm-beige-light animate-pulse rounded';
  
  const variantStyles = {
    text: 'h-4 w-full',
    rect: 'h-24 w-full',
    circle: 'h-16 w-16 rounded-full',
  };
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`${baseStyles} ${variantStyles[variant]} ${className}`}
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </>
  );
};

/**
 * 加载提示文案库
 */
export const LoadingMessages = {
  default: [
    '正在为你准备... ✨',
    '稍等一下，马上就好 💙',
    '正在加载中... ⭐',
    '很快就好，请稍候 💛',
  ],
  thinking: [
    '正在思考中... 🤔',
    '让我想想... 💭',
    '等一下，我在想... 🌟',
  ],
  generating: [
    '正在为你生成内容... ✨',
    '创作中，请稍候... 🎨',
    '正在努力生成... 💫',
  ],
  connecting: [
    '正在连接中... 💙',
    '马上就好... ⚡',
    '连接中，请稍候... 🌟',
  ],
} as const;

/**
 * 随机获取加载提示
 */
export const getRandomLoadingMessage = (type: keyof typeof LoadingMessages = 'default'): string => {
  const messages = LoadingMessages[type];
  return messages[Math.floor(Math.random() * messages.length)];
};

export default Loading;



