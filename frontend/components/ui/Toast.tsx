import React, { useEffect, useState } from 'react';

/**
 * Toast 通知组件
 * 温暖友好的消息提示
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-success/10 border-success/30 text-success';
      case 'error':
        return 'bg-warm-pink/10 border-warm-pink/30 text-warm-pink';
      case 'warning':
        return 'bg-warning/10 border-warning/30 text-warning';
      case 'info':
      default:
        return 'bg-calm-blue/10 border-calm-blue/30 text-calm-blue';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-md
        ${getTypeStyles()}
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
        transition-all duration-300 ease-out
        ${className}
      `}
    >
      <div className="flex-shrink-0">{getIcon()}</div>
      <span className="text-body font-medium">{message}</span>
    </div>
  );
};

/**
 * Toast 容器组件
 */
export interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
  }>;
  onRemove: (id: string) => void;
  className?: string;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
  className = '',
}) => {
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full ${className}`}
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

/**
 * Toast 管理器 Hook
 */
export const useToast = () => {
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const success = (message: string) => addToast('success', message);
  const error = (message: string) => addToast('error', message);
  const warning = (message: string) => addToast('warning', message);
  const info = (message: string) => addToast('info', message);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};

export default Toast;



