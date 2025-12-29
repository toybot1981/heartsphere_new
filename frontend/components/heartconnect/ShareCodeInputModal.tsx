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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">输入共享码</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-white font-medium mb-2">共享码</label>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => {
                setShareCode(e.target.value.toUpperCase());
                setError(null);
              }}
              placeholder="HS-XXXXXX"
              maxLength={9}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono text-lg tracking-wider"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
            <p className="text-gray-400 text-sm mt-2">格式：HS-XXXXXX（6位字母或数字）</p>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors font-medium"
          >
            连接
          </button>
        </div>
      </div>
    </div>
  );
};

