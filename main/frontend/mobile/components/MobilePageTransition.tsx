import React, { memo } from 'react';

interface MobilePageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Mobile版本页面过渡动画组件
 * 提供页面切换时的过渡效果（300ms ease-in-out）
 * 符合扁平化、简洁、科技感的设计风格
 * 
 * 使用方式：
 * <MobilePageTransition>
 *   <YourScreenComponent />
 * </MobilePageTransition>
 */
export const MobilePageTransition: React.FC<MobilePageTransitionProps> = memo(({
  children,
  className = '',
}) => {
  return (
    <div
      className={`
        w-full h-full
        animate-fade-in
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      {children}
    </div>
  );
});

MobilePageTransition.displayName = 'MobilePageTransition';
