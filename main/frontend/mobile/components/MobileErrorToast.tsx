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

  const typeStyles = {
    error: 'bg-red-500/90 backdrop-blur-md border border-red-400/50 text-white shadow-lg shadow-red-500/30',
    success: 'bg-green-500/90 backdrop-blur-md border border-green-400/50 text-white shadow-lg shadow-green-500/30',
    warning: 'bg-yellow-500/90 backdrop-blur-md border border-yellow-400/50 text-white shadow-lg shadow-yellow-500/30',
    info: 'bg-blue-500/90 backdrop-blur-md border border-blue-400/50 text-white shadow-lg shadow-blue-500/30',
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] pt-[calc(1rem+env(safe-area-inset-top))] animate-slide-down">
      <div
        className={`${typeStyles[type]} rounded-lg px-4 py-3 shadow-lg backdrop-blur-sm flex items-center justify-between min-h-[44px] touch-manipulation`}
        role="alert"
        aria-live="assertive"
      >
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-3 min-w-[44px] min-h-[44px] flex items-center justify-center text-white/80 active:text-white active:opacity-70 transition-opacity duration-200 touch-manipulation"
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
