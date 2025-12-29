import React, { useState, useEffect } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { ConnectionRequest, CreateConnectionRequestRequest } from '../../services/api/heartconnect/types';

interface ConnectionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareCode: string;
  onSuccess?: () => void;
}

/**
 * 连接请求模态框组件
 */
export const ConnectionRequestModal: React.FC<ConnectionRequestModalProps> = ({
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">请求连接心域</h2>
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
            <label className="block text-white font-medium mb-2">请求消息（可选）</label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="向心域主人打个招呼..."
              maxLength={200}
              className="w-full h-24 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <div className="text-right text-sm text-gray-400 mt-1">
              {requestMessage.length}/200 字
            </div>
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
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '发送中...' : '发送请求'}
          </button>
        </div>
      </div>
    </div>
  );
};

