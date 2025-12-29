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
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p>暂无连接请求</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* 筛选标签 */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              filter === f
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
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
            className="p-4 bg-gray-800 rounded-lg border border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold">
                    {request.requesterName?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="text-white font-medium">{request.requesterName || '未知用户'}</div>
                    <div className="text-gray-400 text-sm">
                      {new Date(request.requestedAt).toLocaleString('zh-CN')}
                    </div>
                  </div>
                </div>
                
                {request.requestMessage && (
                  <div className="mt-2 p-3 bg-gray-900 rounded text-gray-300 text-sm">
                    {request.requestMessage}
                  </div>
                )}
                
                {request.responseMessage && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-300 text-sm">
                    <div className="font-medium mb-1">我的回复：</div>
                    {request.responseMessage}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 ml-4">
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    request.requestStatus === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-300'
                      : request.requestStatus === 'approved'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  {request.requestStatus === 'pending' ? '待审批' : request.requestStatus === 'approved' ? '已批准' : '已拒绝'}
                </span>
                
                {request.requestStatus === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResponse(request.id, 'approve')}
                      className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                    >
                      批准
                    </button>
                    <button
                      onClick={() => handleResponse(request.id, 'reject')}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
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

