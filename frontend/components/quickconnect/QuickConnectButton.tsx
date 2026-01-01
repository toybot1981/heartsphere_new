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
  
  const variantClasses = {
    default: 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:scale-105',
    floating: 'bg-blue-500 text-white shadow-lg hover:bg-blue-600 hover:shadow-xl hover:scale-110',
  };
  
  const positionClasses = {
    'top-right': 'fixed top-5 right-5 z-50',
    'bottom-right': 'fixed bottom-20 right-5 z-50',
    'inline': 'relative',
  };
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${positionClasses[position]}`;
  
  return (
    <div className={classes} onClick={onClick}>
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
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badgeCount > 9 ? '9+' : badgeCount}
        </span>
      )}
    </div>
  );
};




