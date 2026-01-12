import React, { memo } from 'react';
import { MobileTouchableButton } from './MobileTouchableButton';

interface MobileBackButtonProps {
  onClick: () => void;
  className?: string;
  'aria-label'?: string;
}

/**
 * Mobile版本统一的返回键组件
 * 提供一致的返回键样式和交互反馈
 * 符合扁平化、简洁、科技感的设计风格
 */
export const MobileBackButton: React.FC<MobileBackButtonProps> = memo(({
  onClick,
  className = '',
  'aria-label': ariaLabel = '返回',
}) => {
  return (
    <MobileTouchableButton
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={`text-white bg-black/50 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 ${className}`}
      aria-label={ariaLabel}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 19l-7-7 7-7" 
        />
      </svg>
    </MobileTouchableButton>
  );
});

MobileBackButton.displayName = 'MobileBackButton';
