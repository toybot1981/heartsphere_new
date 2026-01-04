import React, { memo } from 'react';

interface MobileTouchableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Mobile版本触摸按钮组件
 * 确保最小触摸区域44x44px，提供统一的触摸反馈
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileTouchableButton: React.FC<MobileTouchableButtonProps> = memo(({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
    outline: 'border-2 border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white bg-transparent',
    ghost: 'text-slate-400 hover:text-white bg-transparent',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px]',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-xl
        font-semibold
        transition-all
        duration-200
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:active:scale-100
        touch-manipulation
        ${className}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
});

MobileTouchableButton.displayName = 'MobileTouchableButton';
