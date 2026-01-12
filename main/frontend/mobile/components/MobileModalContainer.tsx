import React, { useEffect, memo, useCallback } from 'react';
import { MobileModalStyles } from './MobileStyleGuide';

interface MobileModalContainerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  closeOnBackdrop?: boolean; // 是否点击背景关闭（默认true）
  closeOnEscape?: boolean; // 是否按ESC关闭（默认true）
  showCloseButton?: boolean; // 是否显示关闭按钮（默认true）
  size?: 'sm' | 'md' | 'lg' | 'full'; // 模态框大小
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Mobile版本统一模态框容器组件
 * 提供统一的模态框样式和交互反馈
 * 支持点击背景关闭、ESC关闭、无障碍设计
 * 符合扁平化、简洁、科技感的设计风格
 */
export const MobileModalContainer: React.FC<MobileModalContainerProps> = memo(({
  isOpen,
  onClose,
  children,
  title,
  className = '',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = 'md',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  // ESC键关闭
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  // 点击背景关闭
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    // 只响应背景区域的点击，不响应内容区域的点击
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  // 阻止内容区域的点击冒泡
  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  }, []);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full',
  };

  return (
    <div
      className={`${MobileModalStyles.overlay} ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy || (title ? 'modal-title' : undefined)}
    >
      <div
        className={`${MobileModalStyles.container} ${sizeClasses[size]} animate-scale-in`}
        onClick={handleContentClick}
        style={{
          animationDuration: '200ms',
          animationTimingFunction: 'ease-out',
        }}
      >
        {/* 头部栏 */}
        {(title || showCloseButton) && (
          <div className={MobileModalStyles.header}>
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-bold text-white"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white/70 hover:text-white active:opacity-70 transition-opacity duration-200 touch-manipulation rounded-lg hover:bg-white/5"
                aria-label="关闭"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* 内容区域 */}
        <div className={MobileModalStyles.body}>
          {children}
        </div>
      </div>
    </div>
  );
});

MobileModalContainer.displayName = 'MobileModalContainer';
