import React, { useEffect, useState } from 'react';

interface MobileErrorToastProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

/**
 * Mobile版本错误提示Toast组件
 * 用于显示临时提示信息
 */
export const MobileErrorToast: React.FC<MobileErrorToastProps> = ({
  message,
  type = 'error',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getTypeStyles = (type: string): React.CSSProperties => {
    switch (type) {
      case 'error':
        return {
          backgroundColor: 'var(--bg-error-alpha, rgba(239, 68, 68, 0.9))',
          borderColor: 'var(--border-error-alpha, rgba(239, 68, 68, 0.5))',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-error-light, 0 10px 15px -3px rgba(239, 68, 68, 0.3))',
        };
      case 'success':
        return {
          backgroundColor: 'var(--bg-success-alpha, rgba(34, 197, 94, 0.9))',
          borderColor: 'var(--border-success-alpha, rgba(34, 197, 94, 0.5))',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-success-light, 0 10px 15px -3px rgba(34, 197, 94, 0.3))',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--bg-warning-alpha, rgba(234, 179, 8, 0.9))',
          borderColor: 'var(--border-warning-alpha, rgba(234, 179, 8, 0.5))',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-warning-light, 0 10px 15px -3px rgba(234, 179, 8, 0.3))',
        };
      case 'info':
        return {
          backgroundColor: 'var(--bg-info-alpha, rgba(59, 130, 246, 0.9))',
          borderColor: 'var(--border-info-alpha, rgba(59, 130, 246, 0.5))',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-info-light, 0 10px 15px -3px rgba(59, 130, 246, 0.3))',
        };
      default:
        return {};
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] pt-[calc(1rem+env(safe-area-inset-top))] animate-slide-down">
      <div
        className="rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm flex items-center justify-between min-h-[44px] touch-manipulation border"
        style={getTypeStyles(type)}
        role="alert"
        aria-live="assertive"
      >
        <p 
          className="text-sm font-medium flex-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {message}
        </p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center transition-opacity duration-200 touch-manipulation"
          style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
            e.currentTarget.style.opacity = '1';
          }}
          aria-label="关闭提示"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
