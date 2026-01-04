import React, { useState } from 'react';
import { heartConnectApi } from '../../../services/api/heartconnect';
import type { CreateConnectionRequestRequest } from '../../../services/api/heartconnect/types';

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold text-white">请求连接心域</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-4">
          {error && (
            <div className="mb-3 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-3">
            <label className="block text-white font-medium mb-1 text-sm">请求消息（可选）</label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="向心域主人打个招呼..."
              maxLength={200}
              className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
            />
            <div className="text-right text-xs text-gray-400 mt-1">
              {requestMessage.length}/200 字
            </div>
          </div>
        </div>
        
        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {loading ? '发送中...' : '发送请求'}
          </button>
        </div>
      </div>
    </div>
  );
};
