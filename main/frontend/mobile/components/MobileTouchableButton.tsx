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
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-purple-500/30',
    secondary: 'bg-slate-800/80 backdrop-blur-md border border-white/10 hover:bg-slate-700/80 text-white',
    outline: 'border-2 border-slate-600/50 hover:border-purple-500/50 text-slate-300 hover:text-white bg-transparent backdrop-blur-sm',
    ghost: 'text-slate-400 hover:text-white bg-transparent hover:bg-white/5',
    danger: 'bg-red-600/90 backdrop-blur-md hover:bg-red-500 text-white shadow-lg shadow-red-500/30',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-4 py-3 text-base min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px] min-w-[44px]',
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg
        font-semibold
        transition-all
        duration-200
        active:scale-95
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:active:scale-100
        touch-manipulation
        flex
        items-center
        justify-center
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
