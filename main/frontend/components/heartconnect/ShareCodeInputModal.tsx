import React, { useState } from 'react';

interface ShareCodeInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shareCode: string) => void;
}

/**
 * 共享码输入模态框
 */
export const ShareCodeInputModal: React.FC<ShareCodeInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [shareCode, setShareCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = () => {
    if (!shareCode.trim()) {
      setError('请输入共享码');
      return;
    }
    
    // 验证共享码格式（HS-XXXXXX）
    const codePattern = /^HS-[A-Z0-9]{6}$/;
    if (!codePattern.test(shareCode.trim().toUpperCase())) {
      setError('共享码格式不正确，应为 HS-XXXXXX');
      return;
    }
    
    onSubmit(shareCode.trim().toUpperCase());
    setShareCode('');
    setError(null);
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.7))' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-card, #111827)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            输入共享码
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-6">
          {error && (
            <div 
              className="mb-4 p-4 border rounded-lg"
              style={{
                backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
                borderColor: 'var(--color-error, rgba(239, 68, 68, 0.5))',
                color: 'var(--color-error, #fca5a5)',
              }}
            >
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label 
              className="block font-medium mb-2"
              style={{ color: 'var(--text-primary)' }}
            >
              共享码
            </label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => {
                setShareCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="HS-XXXXXX"
              maxLength={9}
              className="w-full px-4 py-3 border rounded-lg focus:outline-none font-mono text-lg tracking-wider"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary, #3b82f6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <p 
              className="text-sm mt-2"
              style={{ color: 'var(--text-tertiary)' }}
            >
              格式：HS-XXXXXX（6位字母或数字）
            </p>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'var(--bg-secondary, #374151)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-hover, #4b5563)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #374151)';
            }}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg transition-colors font-medium"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
            }}
          >
            连接
          </button>
        </div>
      </div>
    </div>
  );
};

