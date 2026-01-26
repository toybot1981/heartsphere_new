import React, { useState, useEffect, useCallback } from 'react';
import { MobileTouchableButton } from '../MobileTouchableButton';
import { MobileInputStyles, MobileColors, MobileModalStyles } from '../MobileStyleGuide';
import { MobileErrorToast } from '../MobileErrorToast';

interface MobileWarmMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  ownerName?: string;
}

/**
 * Mobile版本暖心留言模态框组件
 * 访问者离开时可以给主人留下暖心留言，适配移动端
 */
export const MobileWarmMessageModal: React.FC<MobileWarmMessageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ownerName,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    if (!message.trim()) {
      setError('请输入留言内容');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await onSubmit(message.trim());
      setMessage('');
      onClose();
    } catch (err) {
      console.error('提交留言失败:', err);
      setError('提交留言失败，请重试');
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
      aria-labelledby="warm-message-modal-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2 animate-scale-in"
        style={{
          background: 'var(--bg-gradient-modal-light, linear-gradient(to bottom right, var(--bg-primary-light, #fffbeb), var(--bg-primary-light, #fdf2f8)))',
          borderColor: 'var(--border-color-modal-light, #fde68a)',
          animationDuration: '200ms',
          animationTimingFunction: 'ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
          }
        }}
      >
        {/* 头部 */}
        <div 
          className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b"
          style={{
            borderColor: 'var(--border-color-modal-light, #fde68a)',
            background: 'var(--bg-gradient-header-light, linear-gradient(to right, var(--bg-primary-light, #fef3c7), var(--bg-primary-light, #fce7f3)))',
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-2xl" aria-hidden="true">💝</div>
              <div>
                <h2 
                  id="warm-message-modal-title" 
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  留下暖心留言
                </h2>
                {ownerName && (
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    给 {ownerName} 的留言
                  </p>
                )}
              </div>
            </div>
            <MobileTouchableButton
              onClick={onClose}
              variant="ghost"
              size="sm"
              style={{ color: 'var(--text-secondary)' }}
              aria-label="关闭"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </MobileTouchableButton>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-4">
          {error && (
            <div className="mb-3" role="alert" aria-live="assertive">
              <MobileErrorToast message={error} />
            </div>
          )}
          
          <div className="mb-3">
            <label 
              className="block font-medium mb-1 text-sm" 
              htmlFor="warm-message"
              style={{ color: 'var(--text-secondary)' }}
            >
              你的留言
            </label>
            <textarea
              id="warm-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="分享你的体验感受，给主人一些温暖的话语..."
              maxLength={500}
              className="w-full h-24 min-h-[44px] px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 resize-none text-sm touch-manipulation"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-color-overlay)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
              }}
              aria-label="暖心留言"
              aria-describedby="warm-message-count"
            />
            <div 
              className="text-right text-xs mt-1" 
              id="warm-message-count" 
              role="status" 
              aria-live="polite"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {message.length}/500 字
            </div>
          </div>
          
          <div 
            className="border rounded-lg p-2 text-xs"
            style={{
              backgroundColor: 'var(--bg-warning-alpha)',
              borderColor: 'var(--border-warning-alpha)',
              color: 'var(--color-warning)',
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-base" aria-hidden="true">💡</span>
              <div>
                <div className="font-medium mb-0.5">提示</div>
                <div>你的留言会让主人感受到温暖，分享你的体验感受吧！</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div 
          className="flex items-center justify-end gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t"
          style={{
            borderColor: 'var(--border-color-overlay)',
            background: 'var(--bg-secondary)',
          }}
        >
          <MobileTouchableButton
            onClick={onClose}
            variant="secondary"
            size="md"
            disabled={loading}
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color-overlay)',
            }}
            aria-label="跳过"
          >
            跳过
          </MobileTouchableButton>
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="px-4 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md text-sm"
            style={{
              background: 'var(--gradient-button)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {loading ? '提交中...' : '💝 发送留言'}
          </button>
        </div>
      </div>
    </div>
  );
};
