import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { showAlert, showConfirm } from '../../../utils/dialog';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import type { WarmMessageDTO } from '../../../services/api/admin/heartSphereConnection';

interface WarmMessageManagementProps {
  adminToken: string | null;
  onRefresh?: () => void;
}

export const WarmMessageManagement: React.FC<WarmMessageManagementProps> = ({
  adminToken,
  onRefresh
}) => {
  const [messages, setMessages] = useState<WarmMessageDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const loadMessages = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.heartSphereConnection.getWarmMessages(adminToken, {
        search: search || undefined,
        status: selectedStatus || undefined,
        page: currentPage,
        size: pageSize,
      });
      setMessages(response.content);
      setTotal(response.total);
    } catch (error: any) {
      console.error('加载留言失败:', error);
      showAlert('加载留言失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [currentPage, search, selectedStatus, adminToken]);

  const handleReview = async (message: WarmMessageDTO, status: string) => {
    if (!adminToken) return;
    const action = status === 'APPROVED' ? '审核通过' : '拒绝';
    const confirmed = await showConfirm(
      `确定要${action}这条留言吗？`,
      `${action}留言`,
      'warning'
    );
    if (!confirmed) return;

    try {
      await adminApi.heartSphereConnection.reviewWarmMessage(
        message.id,
        status,
        `管理员${action}`,
        adminToken
      );
      showAlert(`留言已${action}`, '操作成功', 'success');
      loadMessages();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      showAlert(`${action}失败: ` + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const handleDelete = async (message: WarmMessageDTO) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      `确定要删除这条留言吗？此操作不可恢复！`,
      '删除留言',
      'error'
    );
    if (!confirmed) return;

    try {
      await adminApi.heartSphereConnection.deleteWarmMessage(message.id, '管理员删除', adminToken);
      showAlert('留言已删除', '操作成功', 'success');
      loadMessages();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '待审核', className: 'bg-yellow-500/20 text-yellow-400' },
      APPROVED: { label: '已审核', className: 'bg-green-500/20 text-green-400' },
      REJECTED: { label: '已拒绝', className: 'bg-red-500/20 text-red-400' },
      DELETED: { label: '已删除', className: 'bg-slate-500/20 text-slate-400' },
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
      {/* 搜索和筛选 */}
      <div className="flex gap-4 items-end">
        <InputGroup label="搜索">
          <TextInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(0);
            }}
            placeholder="搜索留言内容..."
          />
        </InputGroup>
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
            <option value="PENDING">待审核</option>
            <option value="APPROVED">已审核</option>
            <option value="REJECTED">已拒绝</option>
          </select>
        </InputGroup>
        <Button onClick={loadMessages} disabled={loading}>
          {loading ? '加载中...' : '刷新'}
        </Button>
      </div>

      {/* 数据表格 */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">留言者</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">接收者</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">留言内容</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">创建时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {messages.map((message) => (
              <tr key={message.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3 text-sm text-slate-300">{message.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  <div>
                    <div className="font-medium">{message.senderUsername || message.senderId}</div>
                    {message.senderEmail && (
                      <div className="text-xs text-slate-400">{message.senderEmail}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  <div>
                    <div className="font-medium">{message.receiverUsername || message.receiverId}</div>
                    {message.receiverEmail && (
                      <div className="text-xs text-slate-400">{message.receiverEmail}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 max-w-md truncate">
                  {message.content}
                </td>
                <td className="px-4 py-3">{getStatusBadge(message.status)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  {message.createdAt ? new Date(message.createdAt).toLocaleString('zh-CN') : '-'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {message.status === 'PENDING' && (
                      <>
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleReview(message, 'APPROVED')}
                        >
                          通过
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReview(message, 'REJECTED')}
                        >
                          拒绝
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(message)}
                    >
                      删除
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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




