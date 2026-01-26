/**
 * 关怀消息通知组件
 * 显示陪伴系统的主动关怀消息
 */

import React, { useState, useEffect } from 'react';
import { CareMessage } from '../../services/companion-system/types/CompanionTypes';

interface CareMessageNotificationProps {
  message: CareMessage;
  onDismiss: (messageId: string) => void;
}

export const CareMessageNotification: React.FC<CareMessageNotificationProps> = ({
  message,
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // 5秒后自动关闭
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onDismiss(message.id), 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  if (!isVisible) {
    return null;
  }

  const priorityStyles = {
    low: {
      bg: 'var(--color-info, rgba(59, 130, 246, 0.2))',
      border: 'var(--color-info, rgba(59, 130, 246, 0.5))',
    },
    medium: {
      bg: 'var(--color-primary, rgba(168, 85, 247, 0.2))',
      border: 'var(--color-primary, rgba(168, 85, 247, 0.5))',
    },
    high: {
      bg: 'var(--color-primary, rgba(236, 72, 153, 0.2))',
      border: 'var(--color-primary, rgba(236, 72, 153, 0.5))',
    },
  };

  const style = priorityStyles[message.priority];

  return (
    <div
      className="fixed top-20 right-4 z-50 max-w-sm rounded-lg p-4 border backdrop-blur-md transition-all animate-slide-in-right"
      style={{
        backgroundColor: style.bg,
        borderColor: style.border,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">💝</span>
            <span 
              className="text-sm font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              关怀消息
            </span>
          </div>
          <p 
            className="text-sm"
            style={{ color: 'var(--text-primary, rgba(255, 255, 255, 0.9))' }}
          >
            {message.content}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(message.id), 300);
          }}
          className="ml-2 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};




