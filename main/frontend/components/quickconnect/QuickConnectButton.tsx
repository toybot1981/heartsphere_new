import React from 'react';

interface QuickConnectButtonProps {
  onClick: () => void;
  badgeCount?: number;  // 未读消息数量（可选）
  variant?: 'default' | 'floating';  // 按钮变体
  position?: 'top-right' | 'bottom-right' | 'inline';  // 位置
}

/**
 * 快速连接入口按钮
 */
export const QuickConnectButton: React.FC<QuickConnectButtonProps> = ({
  onClick,
  badgeCount = 0,
  variant = 'default',
  position = 'top-right',
}) => {
  const baseClasses = 'flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer';
  
  // 使用主题变量的样式
  const getVariantStyle = (variant: 'default' | 'floating'): React.CSSProperties => {
    if (variant === 'floating') {
      return {
        backgroundColor: 'var(--color-primary, #3b82f6)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-lg, 0 8px 24px rgba(0, 0, 0, 0.5))',
      };
    }
    return {
      backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
      borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
      color: 'var(--text-primary)',
    };
  };
  
  const variantClasses = {
    default: 'backdrop-blur-md border hover:scale-105',
    floating: 'shadow-lg hover:shadow-xl hover:scale-110',
  };
  
  const positionClasses = {
    'top-right': 'fixed top-5 right-5 z-50',
    'bottom-right': 'fixed bottom-20 right-5 z-50',
    'inline': 'relative',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${positionClasses[position]}`;
  
  const buttonStyle = getVariantStyle(variant);
  
  return (
    <div 
      className={classes} 
      style={buttonStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (variant === 'floating') {
          e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
        } else {
          e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
        }
      }}
      onMouseLeave={(e) => {
        Object.assign(e.currentTarget.style, buttonStyle);
      }}
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
        />
      </svg>
      <span className="text-sm font-medium">快速连接</span>
      {badgeCount > 0 && (
        <span 
          className="absolute -top-2 -right-2 text-xs rounded-full w-5 h-5 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--color-error, #ef4444)',
            color: 'var(--text-primary)',
          }}
        >
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </div>
  );
};




