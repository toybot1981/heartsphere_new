import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import { showAlert, showConfirm } from '../../../utils/dialog';
import { Button } from '../../../components/Button';
import { InputGroup } from '../AdminUIComponents';
import type { ExceptionHandlingRecordDTO, ComplaintDTO } from '../../../services/api/admin/heartSphereConnection';

interface ExceptionHandlingManagementProps {
  adminToken: string | null;
  onRefresh?: () => void;
}

type TabType = 'exceptions' | 'complaints';

export const ExceptionHandlingManagement: React.FC<ExceptionHandlingManagementProps> = ({
  adminToken,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('exceptions');
  const [exceptions, setExceptions] = useState<ExceptionHandlingRecordDTO[]>([]);
  const [complaints, setComplaints] = useState<ComplaintDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const loadExceptions = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.heartSphereConnection.getExceptionRecords(adminToken, {
        page: currentPage,
        size: pageSize,
      });
      setExceptions(response.content);
      setTotal(response.total);
    } catch (error: any) {
      console.error('加载异常记录失败:', error);
      showAlert('加载异常记录失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadComplaints = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const response = await adminApi.heartSphereConnection.getComplaints(adminToken, {
        page: currentPage,
        size: pageSize,
      });
      setComplaints(response.content);
      setTotal(response.total);
    } catch (error: any) {
      console.error('加载投诉失败:', error);
      showAlert('加载投诉失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'exceptions') {
      loadExceptions();
    } else {
      loadComplaints();
    }
  }, [currentPage, activeTab, adminToken]);

  const handleHandleException = async (exception: ExceptionHandlingRecordDTO) => {
    if (!adminToken) return;
    const handleResult = prompt('请输入处理结果:');
    if (!handleResult) return;

    try {
      await adminApi.heartSphereConnection.handleException(
        exception.id,
        handleResult,
        '管理员处理',
        adminToken
      );
      showAlert('异常已处理', '操作成功', 'success');
      loadExceptions();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      showAlert('处理失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const handleHandleComplaint = async (complaint: ComplaintDTO) => {
    if (!adminToken) return;
    const handleResult = prompt('请输入处理结果:');
    if (!handleResult) return;

    try {
      await adminApi.heartSphereConnection.handleComplaint(
        complaint.id,
        handleResult,
        '管理员处理',
        adminToken
      );
      showAlert('投诉已处理', '操作成功', 'success');
      loadComplaints();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      showAlert('处理失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityMap: Record<string, { label: string; className: string }> = {
      HIGH: { label: '高', className: 'bg-red-500/20 text-red-400' },
      MEDIUM: { label: '中', className: 'bg-yellow-500/20 text-yellow-400' },
      LOW: { label: '低', className: 'bg-green-500/20 text-green-400' },
    };
    const severityInfo = severityMap[severity] || { label: severity, className: 'bg-slate-500/20 text-slate-400' };
    return (
      <span className={`px-2 py-1 rounded text-xs ${severityInfo.className}`}>
        {severityInfo.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: '待处理', className: 'bg-yellow-500/20 text-yellow-400' },
      PROCESSING: { label: '处理中', className: 'bg-blue-500/20 text-blue-400' },
      RESOLVED: { label: '已解决', className: 'bg-green-500/20 text-green-400' },
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
      {/* 标签页导航 */}
      <div className="border-b border-slate-700">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => {
              setActiveTab('exceptions');
              setCurrentPage(0);
            }}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'exceptions'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }
            `}
          >
            ⚠️ 异常记录
          </button>
          <button
            onClick={() => {
              setActiveTab('complaints');
              setCurrentPage(0);
            }}
            className={`
              py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${
                activeTab === 'complaints'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
              }
            `}
          >
            📋 投诉记录
          </button>
        </nav>
      </div>

      {/* 异常记录表格 */}
      {activeTab === 'exceptions' && (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">异常类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">异常内容</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">严重程度</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {exceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {loading ? '加载中...' : '暂无异常记录'}
                  </td>
                </tr>
              ) : (
                exceptions.map((exception) => (
                  <tr key={exception.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-300">{exception.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{exception.exceptionType}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-md truncate">
                      {exception.exceptionContent}
                    </td>
                    <td className="px-4 py-3">{getSeverityBadge(exception.severity)}</td>
                    <td className="px-4 py-3">{getStatusBadge(exception.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {exception.createdAt ? new Date(exception.createdAt).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {exception.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleHandleException(exception)}
                        >
                          处理
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 投诉记录表格 */}
      {activeTab === 'complaints' && (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">投诉类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">投诉内容</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">创建时间</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    {loading ? '加载中...' : '暂无投诉记录'}
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-700/50">
                    <td className="px-4 py-3 text-sm text-slate-300">{complaint.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      <div>
                        <div className="font-medium">{complaint.username || complaint.userId}</div>
                        {complaint.userEmail && (
                          <div className="text-xs text-slate-400">{complaint.userEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-300">{complaint.complaintType}</td>
                    <td className="px-4 py-3 text-sm text-slate-300 max-w-md truncate">
                      {complaint.complaintContent}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(complaint.status)}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">
                      {complaint.createdAt ? new Date(complaint.createdAt).toLocaleString('zh-CN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {complaint.status !== 'RESOLVED' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleHandleComplaint(complaint)}
                        >
                          处理
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
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




