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
    error: 'bg-red-500/90 text-white',
    success: 'bg-green-500/90 text-white',
    warning: 'bg-yellow-500/90 text-white',
    info: 'bg-blue-500/90 text-white',
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
      <div
        className={`${typeStyles[type]} rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center justify-between`}
      >
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            onClose?.();
          }}
          className="ml-3 text-white/80 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
