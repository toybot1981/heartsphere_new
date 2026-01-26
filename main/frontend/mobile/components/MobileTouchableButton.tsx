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
  // 使用内联样式替代硬编码的 Tailwind 类，以支持主题系统
  const getVariantStyles = (variant: string) => {
    const baseStyle: React.CSSProperties = {};
    
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--gradient-primary-button, linear-gradient(to right, var(--color-primary, #6366f1), var(--color-primary, #9333ea)))',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-primary-light, 0 10px 15px -3px rgba(168, 85, 247, 0.3))',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--bg-secondary-button, rgba(30, 41, 59, 0.8))',
          borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
          borderWidth: '1px',
          color: 'var(--text-primary)',
        };
      case 'outline':
        return {
          borderWidth: '2px',
          borderColor: 'var(--border-color-overlay, rgba(100, 116, 139, 0.5))',
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
        };
      case 'ghost':
        return {
          color: 'var(--text-tertiary)',
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-error, rgba(220, 38, 38, 0.9))',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-error-light, 0 10px 15px -3px rgba(239, 68, 68, 0.3))',
        };
      default:
        return {};
    }
  };

  const sizeStyles = {
    sm: 'px-3 py-2 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-4 py-3 text-base min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-4 text-lg min-h-[48px] min-w-[44px]',
  };

  const variantStyle = getVariantStyles(variant);
  
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
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
        backdrop-blur-md
        ${className}
      `}
      style={variantStyle}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.background = 'var(--gradient-primary-button-hover, linear-gradient(to right, var(--color-primary, #4f46e5), var(--color-primary, #7e22ce)))';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary-button-hover, rgba(51, 65, 85, 0.8))';
        } else if (variant === 'outline') {
          e.currentTarget.style.borderColor = 'var(--color-primary, rgba(168, 85, 247, 0.5))';
          e.currentTarget.style.color = 'var(--text-primary)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
        } else if (variant === 'danger') {
          e.currentTarget.style.backgroundColor = 'var(--color-error-hover, #dc2626)';
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, variantStyle);
      }}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.3)',
              borderTopColor: 'var(--text-primary)',
            }}
          />
          <span>加载中...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
});

MobileTouchableButton.displayName = 'MobileTouchableButton';
