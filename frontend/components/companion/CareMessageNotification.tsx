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

  const priorityColors = {
    low: 'bg-blue-500/20 border-blue-400/50',
    medium: 'bg-purple-500/20 border-purple-400/50',
    high: 'bg-pink-500/20 border-pink-400/50',
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 max-w-sm rounded-lg p-4 border backdrop-blur-md ${priorityColors[message.priority]} transition-all animate-slide-in-right`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">💝</span>
            <span className="text-sm font-semibold text-white">关怀消息</span>
          </div>
          <p className="text-sm text-white/90">{message.content}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onDismiss(message.id), 300);
          }}
          className="ml-2 text-white/50 hover:text-white transition-colors"
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

