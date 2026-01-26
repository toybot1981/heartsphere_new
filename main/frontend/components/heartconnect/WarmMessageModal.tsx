import React, { useState } from 'react';

interface WarmMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
  ownerName?: string;
}

/**
 * 暖心留言模态框组件
 * 访问者离开时可以给主人留下暖心留言
 */
export const WarmMessageModal: React.FC<WarmMessageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  ownerName,
}) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    if (!message.trim()) {
      alert('请输入留言内容');
      return;
    }
    
    setLoading(true);
    try {
      await onSubmit(message.trim());
      setMessage('');
      onClose();
    } catch (err) {
      console.error('提交留言失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.7))' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border-2"
        style={{
          background: 'var(--gradient-warm-message, linear-gradient(to bottom right, var(--bg-card-light, #fef3c7), var(--bg-card-light, #fce7f3)))',
          borderColor: 'var(--color-warning, rgba(251, 191, 36, 0.5))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="p-6 border-b"
          style={{
            borderColor: 'var(--color-warning, rgba(251, 191, 36, 0.5))',
            background: 'var(--gradient-warm-message-header, linear-gradient(to right, var(--bg-card-light, #fef3c7), var(--bg-card-light, #fce7f3)))',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">💝</div>
            <div>
              <h2 
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                留下暖心留言
              </h2>
              {ownerName && (
                <p 
                  className="text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  给 {ownerName} 的留言
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-6">
          <div className="mb-4">
            <label 
              className="block font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              你的留言
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="分享你的体验感受，给主人一些温暖的话语..."
              maxLength={500}
              className="w-full h-32 px-4 py-3 rounded-lg resize-none transition-colors"
              style={{
                backgroundColor: 'var(--bg-primary)',
                borderColor: 'var(--color-warning, rgba(251, 191, 36, 0.5))',
                borderWidth: '2px',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-warning, #fbbf24)';
                e.currentTarget.style.outline = '2px solid var(--color-warning, rgba(251, 191, 36, 0.2))';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-warning, rgba(251, 191, 36, 0.5))';
                e.currentTarget.style.outline = 'none';
              }}
            />
            <div 
              className="text-right text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {message.length}/500 字
            </div>
          </div>
          
          <div 
            className="border rounded-lg p-3 text-sm"
            style={{
              backgroundColor: 'var(--color-warning, rgba(251, 191, 36, 0.1))',
              borderColor: 'var(--color-warning, rgba(251, 191, 36, 0.5))',
              color: 'var(--color-warning, #92400e)',
            }}
          >
            <div className="flex items-start gap-2">
              <span className="text-lg">💡</span>
              <div>
                <div className="font-medium mb-1">提示</div>
                <div>你的留言会让主人感受到温暖，分享你的体验感受吧！</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{
            borderColor: 'var(--color-warning, rgba(251, 191, 36, 0.5))',
            background: 'var(--gradient-warm-message-header, linear-gradient(to right, var(--bg-card-light, #fef3c7), var(--bg-card-light, #fce7f3)))',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors border"
            style={{
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              borderColor: 'var(--border-color-overlay, rgba(107, 114, 128, 0.3))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(243, 244, 246, 1))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
            }}
          >
            跳过
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="px-6 py-2 rounded-lg transition-all font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: loading || !message.trim()
                ? 'var(--bg-disabled, #d1d5db)'
                : 'var(--gradient-warm-message-button, linear-gradient(to right, var(--color-warning, #fbbf24), var(--color-primary, #ec4899)))',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.background = 'var(--gradient-warm-message-button-hover, linear-gradient(to right, var(--color-warning, #f59e0b), var(--color-primary, #db2777)))';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && message.trim()) {
                e.currentTarget.style.background = 'var(--gradient-warm-message-button, linear-gradient(to right, var(--color-warning, #fbbf24), var(--color-primary, #ec4899)))';
              }
            }}
          >
            {loading ? '提交中...' : '💝 发送留言'}
          </button>
        </div>
      </div>
    </div>
  );
};

