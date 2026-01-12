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
        className="relative w-full max-w-md bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200 animate-scale-in"
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
        <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-amber-200 bg-gradient-to-r from-amber-100 to-pink-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="text-2xl" aria-hidden="true">💝</div>
              <div>
                <h2 id="warm-message-modal-title" className="text-lg font-bold text-gray-800">留下暖心留言</h2>
                {ownerName && (
                  <p className="text-xs text-gray-600">给 {ownerName} 的留言</p>
                )}
              </div>
            </div>
            <MobileTouchableButton
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-600"
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
            <label className="block text-gray-700 font-medium mb-1 text-sm" htmlFor="warm-message">
              你的留言
            </label>
            <textarea
              id="warm-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="分享你的体验感受，给主人一些温暖的话语..."
              maxLength={500}
              className="w-full h-24 min-h-[44px] px-3 py-2 bg-white border-2 border-amber-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 resize-none text-sm touch-manipulation"
              aria-label="暖心留言"
              aria-describedby="warm-message-count"
            />
            <div className="text-right text-xs text-gray-500 mt-1" id="warm-message-count" role="status" aria-live="polite">
              {message.length}/500 字
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
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
        <div className="flex items-center justify-end gap-2 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-amber-200 bg-gradient-to-r from-amber-100 to-pink-100">
          <MobileTouchableButton
            onClick={onClose}
            variant="secondary"
            size="md"
            disabled={loading}
            className="bg-white text-gray-700 border border-gray-300"
            aria-label="跳过"
          >
            跳过
          </MobileTouchableButton>
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-pink-400 text-white hover:from-amber-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md text-sm"
          >
            {loading ? '提交中...' : '💝 发送留言'}
          </button>
        </div>
      </div>
    </div>
  );
};
