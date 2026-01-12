import React, { useState, useEffect, useCallback } from 'react';
import { heartConnectApi } from '../../../services/api/heartconnect';
import type { CreateConnectionRequestRequest } from '../../../services/api/heartconnect/types';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileInputStyles, MobileColors, MobileModalStyles } from '../MobileStyleGuide';
import { MobileErrorToast } from '../MobileErrorToast';

interface MobileConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareCode: string;
  onSuccess?: () => void;
}

/**
 * Mobile版本连接请求模态框组件
 * 适配移动端UI/UX
 */
export const MobileConnectionRequestModal: React.FC<MobileConnectionRequestModalProps> = ({
  isOpen,
  onClose,
  shareCode,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  
  // ESC键关闭
  useEffect(() => {
    if (!isOpen) return;
    
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
  }, [isOpen, onClose]);
  
  // 点击背景关闭
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const request: CreateConnectionRequestRequest = {
        shareCode,
        requestMessage: requestMessage.trim() || undefined,
      };
      
      await heartConnectApi.createConnectionRequest(request);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || '发送请求失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className={MobileModalStyles.overlay}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="connection-request-modal-title"
    >
      <div
        className={`${MobileModalStyles.container} animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          }
        }}
        style={{
          animationDuration: '200ms',
          animationTimingFunction: 'ease-out',
        }}
      >
        {/* 头部 */}
        <div className={MobileModalStyles.header}>
          <h2 id="connection-request-modal-title" className={`${MobileColors.text.primary} text-lg font-bold`}>请求连接心域</h2>
          <MobileTouchableButton
            onClick={onClose}
            variant="ghost"
            size="sm"
            className={MobileColors.text.muted}
            aria-label="关闭"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </MobileTouchableButton>
        </div>
        
        {/* 内容 */}
        <div className={MobileModalStyles.body}>
          {error && (
            <div className="mb-3" role="alert" aria-live="assertive">
              <MobileErrorToast message={error} />
            </div>
          )}
          
          <div className="mb-3">
            <label className={`block ${MobileColors.text.secondary} font-medium mb-1 text-sm`} htmlFor="request-message">
              请求消息（可选）
            </label>
            <textarea
              id="request-message"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="向心域主人打个招呼..."
              maxLength={200}
              className={`${MobileInputStyles} h-20 resize-none text-sm`}
              aria-label="请求消息"
              aria-describedby="request-message-count"
            />
            <div className={`text-right text-xs ${MobileColors.text.muted} mt-1`} id="request-message-count" role="status" aria-live="polite">
              {requestMessage.length}/200 字
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className={MobileModalStyles.footer}>
          <MobileTouchableButton
            onClick={onClose}
            variant="secondary"
            size="md"
            disabled={loading}
            aria-label="取消"
          >
            取消
          </MobileTouchableButton>
          <MobileTouchableButton
            onClick={handleSubmit}
            variant="primary"
            size="md"
            disabled={loading}
            aria-label={loading ? '发送中' : '发送请求'}
          >
            {loading ? '发送中...' : '发送请求'}
          </MobileTouchableButton>
        </div>
      </div>
    </div>
  );
};
