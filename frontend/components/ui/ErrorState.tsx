import React from 'react';
import { Button } from './Button';

/**
 * 错误状态组件
 * 温暖友好的错误提示
 */

export interface ErrorStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  icon,
  title = '出错了',
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  const defaultIcon = (
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-warm-pink-lightest/50">
      <svg
        className="w-8 h-8 text-warm-pink"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </div>
  );

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 ${className}`}>
      <div className="mb-4">
        {icon || defaultIcon}
      </div>
      
      <h3 className="text-h4 font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-body text-text-secondary mb-6 max-w-sm">
        {message}
      </p>
      
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

/**
 * 错误提示消息模板库
 */
export const ErrorMessages = {
  network: {
    title: '网络连接出了问题',
    message: '检查一下网络，然后点击重试吧',
    action: '重试',
  },
  server: {
    title: '服务器暂时有点忙',
    message: '稍等一下再试试，或者刷新页面',
    action: '刷新',
  },
  permission: {
    title: '需要登录',
    message: '点击登录继续使用这个功能',
    action: '登录',
  },
  data: {
    title: '数据加载出错了',
    message: '不用担心，点击重试就能恢复',
    action: '重试',
  },
} as const;

export default ErrorState;

