import React, { useState } from 'react';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gradient-to-br from-amber-50 to-pink-50 rounded-2xl shadow-2xl overflow-hidden border-2 border-amber-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-amber-100 to-pink-100">
          <div className="flex items-center gap-2">
            <div className="text-2xl">💝</div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">留下暖心留言</h2>
              {ownerName && (
                <p className="text-xs text-gray-600">给 {ownerName} 的留言</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-4">
          <div className="mb-3">
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              你的留言
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="分享你的体验感受，给主人一些温暖的话语..."
              maxLength={500}
              className="w-full h-24 px-3 py-2 bg-white border-2 border-amber-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200 resize-none text-sm"
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {message.length}/500 字
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-xs text-amber-800">
            <div className="flex items-start gap-2">
              <span className="text-base">💡</span>
              <div>
                <div className="font-medium mb-0.5">提示</div>
                <div>你的留言会让主人感受到温暖，分享你的体验感受吧！</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-amber-200 bg-gradient-to-r from-amber-100 to-pink-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors border border-gray-300 text-sm"
          >
            跳过
          </button>
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
