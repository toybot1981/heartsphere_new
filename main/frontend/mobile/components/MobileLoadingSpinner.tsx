import React, { memo } from 'react';

interface MobileLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

/**
 * Mobile版本统一加载指示器组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileLoadingSpinner: React.FC<MobileLoadingSpinnerProps> = memo(({
  size = 'md',
  text,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-2 border-t-transparent rounded-full animate-spin`}
        style={{
          borderColor: 'var(--color-primary, #a855f7)',
          borderTopColor: 'transparent',
        }}
        role="status"
        aria-label={text || "加载中"}
      />
      {text && (
        <p 
          className="text-sm font-medium"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {text}
        </p>
      )}
    </div>
  );
});

MobileLoadingSpinner.displayName = 'MobileLoadingSpinner';
