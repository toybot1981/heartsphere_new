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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-6 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-pink-100">
          <div className="flex items-center gap-3">
            <div className="text-3xl">💝</div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">留下暖心留言</h2>
              {ownerName && (
                <p className="text-sm text-gray-600">给 {ownerName} 的留言</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              你的留言
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="分享你的体验感受，给主人一些温暖的话语..."
              maxLength={500}
              className="w-full h-32 px-4 py-3 bg-white border-2 border-amber-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 resize-none"
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {message.length}/500 字
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
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
        <div className="flex items-center justify-end gap-3 p-6 border-t border-amber-200 bg-gradient-to-r from-amber-100 to-pink-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300"
          >
            跳过
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !message.trim()}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-400 to-pink-400 text-white hover:from-amber-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
          >
            {loading ? '提交中...' : '💝 发送留言'}
          </button>
        </div>
      </div>
    </div>
  );
};

