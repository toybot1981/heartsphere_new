import React, { useState, useEffect } from 'react';
import { heartConnectApi } from '../../services/api/heartconnect';
import type { ConnectionRequest, ResponseConnectionRequestRequest } from '../../services/api/heartconnect/types';

interface ConnectionRequestListProps {
  shareConfigId: number;
  onUpdate?: () => void;
}

/**
 * 连接请求列表组件
 */
export const ConnectionRequestList: React.FC<ConnectionRequestListProps> = ({
  shareConfigId,
  onUpdate,
}) => {
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  
  useEffect(() => {
    loadRequests();
  }, [shareConfigId, filter]);
  
  const loadRequests = async () => {
    setLoading(true);
    try {
      const status = filter === 'all' ? undefined : filter;
      const data = await heartConnectApi.getConnectionRequests(shareConfigId, status);
      setRequests(data);
    } catch (err) {
      console.error('加载连接请求失败:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResponse = async (requestId: number, action: 'approve' | 'reject', message?: string) => {
    try {
      const request: ResponseConnectionRequestRequest = {
        action,
        responseMessage: message,
      };
      await heartConnectApi.responseConnectionRequest(requestId, request);
      loadRequests();
      onUpdate?.();
    } catch (err) {
      console.error('处理连接请求失败:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div 
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{
            borderColor: 'var(--color-info, #3b82f6)',
            borderTopColor: 'transparent',
          }}
        />
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div 
        className="text-center py-20"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <p>暂无连接请求</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 筛选标签 */}
      <div 
        className="flex gap-2 border-b pb-2"
        style={{ borderColor: 'var(--border-color-overlay, #374151)' }}
      >
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: filter === f
                ? 'var(--color-primary, #3b82f6)'
                : 'var(--bg-card, #1f2937)',
              color: filter === f
                ? 'var(--text-primary)'
                : 'var(--text-tertiary)',
            }}
            onMouseEnter={(e) => {
              if (filter !== f) {
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (filter !== f) {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }
            }}
          >
            {f === 'all' ? '全部' : f === 'pending' ? '待审批' : f === 'approved' ? '已批准' : '已拒绝'}
          </button>
        ))}
      </div>
      
      {/* 请求列表 */}
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: 'var(--bg-card, #1f2937)',
              borderColor: 'var(--border-color-overlay, #374151)',
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center font-semibold"
                    style={{
                      backgroundColor: 'var(--bg-secondary, #374151)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {request.requesterName?.[0] || 'U'}
                  </div>
                  <div>
                    <div 
                      className="font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {request.requesterName || '未知用户'}
                    </div>
                    <div 
                      className="text-sm"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {new Date(request.requestedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                
                {request.requestMessage && (
                  <div 
                    className="mt-2 p-3 rounded text-sm"
                    style={{
                      backgroundColor: 'var(--bg-secondary, #111827)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {request.requestMessage}
                  </div>
                )}
                
                {request.responseMessage && (
                  <div 
                    className="mt-2 p-3 border rounded text-sm"
                    style={{
                      backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.1))',
                      borderColor: 'var(--color-info, rgba(59, 130, 246, 0.3))',
                      color: 'var(--color-info, #93c5fd)',
                    }}
                  >
                    <div className="font-medium mb-1">我的回复：</div>
                    {request.responseMessage}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <span
                  className="px-3 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: request.requestStatus === 'pending'
                      ? 'var(--color-warning, rgba(234, 179, 8, 0.2))'
                      : request.requestStatus === 'approved'
                      ? 'var(--color-success, rgba(34, 197, 94, 0.2))'
                      : 'var(--color-error, rgba(239, 68, 68, 0.2))',
                    color: request.requestStatus === 'pending'
                      ? 'var(--color-warning, #fbbf24)'
                      : request.requestStatus === 'approved'
                      ? 'var(--color-success, #4ade80)'
                      : 'var(--color-error, #f87171)',
                  }}
                >
                  {request.requestStatus === 'pending' ? '待审批' : request.requestStatus === 'approved' ? '已批准' : '已拒绝'}
                </span>
                
                {request.requestStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponse(request.id, 'approve')}
                      className="px-3 py-1 rounded text-sm transition-colors"
                      style={{
                        backgroundColor: 'var(--color-success, #22c55e)',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-success, #16a34a)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-success, #22c55e)';
                      }}
                    >
                      批准
                    </button>
                    <button
                      onClick={() => handleResponse(request.id, 'reject')}
                      className="px-3 py-1 rounded text-sm transition-colors"
                      style={{
                        backgroundColor: 'var(--color-error, #ef4444)',
                        color: 'var(--text-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-error, #dc2626)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-error, #ef4444)';
                      }}
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

