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
            请求连接心域
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
              请求消息（可选）
            </label>
            <textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="向心域主人打个招呼..."
              maxLength={200}
              className="w-full h-24 px-4 py-2 border rounded-lg focus:outline-none"
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
            />
            <div 
              className="text-right text-sm mt-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {requestMessage.length}/200 字
            </div>
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
            disabled={loading}
            className="px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--color-primary, #3b82f6)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #2563eb)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, #3b82f6)';
            }}
          >
            {loading ? '发送中...' : '发送请求'}
          </button>
        </div>
      </div>
    </div>
  );
};

