import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { showAlert, showConfirm } from '../../../utils/dialog';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import type { ConnectionRequestDTO } from '../../../services/api/admin/heartSphereConnection';
import { LoadingState, EmptyState, ErrorState } from './components';

interface ConnectionRequestManagementProps {
  adminToken: string | null;
  onRefresh?: () => void;
}

export const ConnectionRequestManagement: React.FC<ConnectionRequestManagementProps> = ({
  adminToken,
  onRefresh
}) => {
  const [requests, setRequests] = useState<ConnectionRequestDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadRequests = async () => {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.heartSphereConnection.getConnectionRequests(adminToken, {
        status: selectedStatus || undefined,
        page: currentPage,
        size: pageSize,
      });
      setRequests(response.content || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('加载连接请求失败:', error);
      const errorMessage = error.message || '未知错误';
      setError(errorMessage);
      
      if (errorMessage.includes('401') || errorMessage.includes('未授权')) {
        showAlert('登录已过期，请重新登录', '认证失败', 'error');
      } else if (errorMessage.includes('403') || errorMessage.includes('权限')) {
        showAlert('您没有权限执行此操作', '权限不足', 'error');
      } else if (errorMessage.includes('网络') || errorMessage.includes('Network')) {
        showAlert('网络连接失败，请检查网络设置', '网络错误', 'error');
      } else {
        showAlert(`加载连接请求失败: ${errorMessage}`, '加载失败', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [currentPage, selectedStatus, adminToken]);

  const handleApprove = async (request: ConnectionRequestDTO) => {
    if (!adminToken || actionLoading === request.id) return;
    const confirmed = await showConfirm(
      `确定要审核通过连接请求 #${request.id} 吗？`,
      '审核通过',
      'info'
    );
    if (!confirmed) return;

    setActionLoading(request.id);
    try {
      await adminApi.heartSphereConnection.approveConnectionRequest(request.id, '管理员审核通过', adminToken);
      showAlert('连接请求已审核通过', '操作成功', 'success');
      await loadRequests();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';
      showAlert(`审核失败: ${errorMessage}`, '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (request: ConnectionRequestDTO) => {
    if (!adminToken || actionLoading === request.id) return;
    const reason = prompt('请输入拒绝原因:');
    if (!reason) return;

    setActionLoading(request.id);
    try {
      await adminApi.heartSphereConnection.rejectConnectionRequest(request.id, reason, adminToken);
      showAlert('连接请求已拒绝', '操作成功', 'success');
      await loadRequests();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';
      showAlert(`拒绝失败: ${errorMessage}`, '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '待处理', className: 'bg-yellow-500/20 text-yellow-400' },
      APPROVED: { label: '已批准', className: 'bg-green-500/20 text-green-400' },
      REJECTED: { label: '已拒绝', className: 'bg-red-500/20 text-red-400' },
      CANCELLED: { label: '已取消', className: 'bg-slate-500/20 text-slate-400' },
    };
    const statusInfo = statusMap[status] || { label: status, className: 'bg-slate-500/20 text-slate-400' };
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 筛选 */}
      <div className="flex gap-4 items-end">
        <InputGroup label="状态">
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(0);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          >
            <option value="">全部</option>
            <option value="PENDING">待处理</option>
            <option value="APPROVED">已批准</option>
            <option value="REJECTED">已拒绝</option>
            <option value="CANCELLED">已取消</option>
          </select>
        </InputGroup>
        <Button onClick={loadRequests} disabled={loading}>
          {loading ? '加载中...' : '刷新'}
        </Button>
      </div>

      {/* 数据表格 */}
      {loading && !error ? (
        <LoadingState message="正在加载连接请求..." />
      ) : error ? (
        <ErrorState
          title="加载失败"
          message={error}
          onRetry={loadRequests}
          retryLabel="重新加载"
        />
      ) : requests.length === 0 ? (
        <EmptyState
          title="暂无连接请求"
          description={selectedStatus 
            ? "没有找到匹配的连接请求，请尝试调整筛选条件"
            : "还没有任何连接请求，用户申请后将会显示在这里"}
          icon="📨"
        />
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">申请用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">目标用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">共享码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">申请时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {requests.map((request) => (
              <tr key={request.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3 text-sm text-slate-300">{request.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  <div>
                    <div className="font-medium">{request.requesterUsername || request.requesterId}</div>
                    {request.requesterEmail && (
                      <div className="text-xs text-slate-400">{request.requesterEmail}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  <div>
                    <div className="font-medium">{request.targetUsername || request.targetUserId}</div>
                    {request.targetUserEmail && (
                      <div className="text-xs text-slate-400">{request.targetUserEmail}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{request.shareCode || '-'}</td>
                <td className="px-4 py-3">{getStatusBadge(request.status)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {request.requestTime ? new Date(request.requestTime).toLocaleString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleApprove(request)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? '处理中...' : '通过'}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(request)}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? '处理中...' : '拒绝'}
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* 分页 */}
      {total > pageSize && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-400">
            共 {total} 条记录，第 {currentPage + 1} 页，共 {Math.ceil(total / pageSize)} 页
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              上一页
            </Button>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage >= Math.ceil(total / pageSize) - 1}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};


