import React, { useState, useEffect } from 'react';
import { multiAgentApi, MultiAgentCollaborationDTO, MultiAgentCollaborationStatisticsDTO } from '../../services/api/admin/multiAgent';
import { showAlert, showConfirm } from '../../utils/dialog';

/**
 * 协作管理组件
 * 提供协作任务的查看、搜索、筛选和取消功能
 */
export const CollaborationManagement: React.FC = () => {
  const [collaborations, setCollaborations] = useState<MultiAgentCollaborationDTO[]>([]);
  const [statistics, setStatistics] = useState<MultiAgentCollaborationStatisticsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  // 筛选条件
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [userIdFilter, setUserIdFilter] = useState<string>('');
  const [startTimeFilter, setStartTimeFilter] = useState<string>('');
  const [endTimeFilter, setEndTimeFilter] = useState<string>('');
  
  // 详情弹窗
  const [selectedCollaboration, setSelectedCollaboration] = useState<MultiAgentCollaborationDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 加载协作列表
  const loadCollaborations = async () => {
    setLoading(true);
    try {
      const response = await multiAgentApi.getCollaborations(
        page,
        size,
        statusFilter || undefined,
        userIdFilter || undefined,
        startTimeFilter || undefined,
        endTimeFilter || undefined
      );
      if (response) {
        setCollaborations(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      }
    } catch (error: any) {
      console.error('加载协作列表失败:', error);
      showAlert('加载协作列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计信息
  const loadStatistics = async () => {
    try {
      const stats = await multiAgentApi.getCollaborationStatistics(
        startTimeFilter || undefined,
        endTimeFilter || undefined
      );
      if (stats) {
        setStatistics(stats);
      }
    } catch (error: any) {
      console.error('加载统计信息失败:', error);
    }
  };

  useEffect(() => {
    loadCollaborations();
    loadStatistics();
  }, [page, statusFilter, userIdFilter, startTimeFilter, endTimeFilter]);

  // 查看详情
  const handleViewDetail = async (collaborationId: string) => {
    try {
      const detail = await multiAgentApi.getCollaborationById(collaborationId);
      if (detail) {
        setSelectedCollaboration(detail);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      console.error('加载协作详情失败:', error);
      showAlert('加载协作详情失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    }
  };

  // 取消协作
  const handleCancel = async (collaborationId: string) => {
    const confirmed = await showConfirm(
      '确定要取消这个协作任务吗？',
      '取消协作',
      'warning'
    );
    if (!confirmed) return;

    try {
      await multiAgentApi.cancelCollaboration(collaborationId);
      showAlert('协作任务已取消', '操作成功', 'success');
      loadCollaborations();
      loadStatistics();
    } catch (error: any) {
      console.error('取消协作失败:', error);
      showAlert('取消协作失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  // 格式化时间
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return new Date(time).toLocaleString('zh-CN');
  };

  // 格式化执行时间
  const formatExecutionTime = (ms?: number) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  };

  // 状态颜色
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'FAILED':
        return 'text-red-400';
      case 'RUNNING':
        return 'text-blue-400';
      case 'CANCELLED':
        return 'text-gray-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">总协作数</div>
            <div className="text-2xl font-bold text-white mt-2">{statistics.totalCollaborations || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">成功数</div>
            <div className="text-2xl font-bold text-green-400 mt-2">{statistics.successfulCollaborations || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">失败数</div>
            <div className="text-2xl font-bold text-red-400 mt-2">{statistics.failedCollaborations || 0}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <div className="text-slate-400 text-sm">成功率</div>
            <div className="text-2xl font-bold text-blue-400 mt-2">
              {statistics.successRate ? `${(statistics.successRate * 100).toFixed(1)}%` : '0%'}
            </div>
          </div>
        </div>
      )}

      {/* 筛选栏 */}
      <div className="bg-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">状态</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="">全部</option>
              <option value="PENDING">待执行</option>
              <option value="RUNNING">运行中</option>
              <option value="COMPLETED">已完成</option>
              <option value="FAILED">失败</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">用户ID</label>
            <input
              type="text"
              value={userIdFilter}
              onChange={(e) => {
                setUserIdFilter(e.target.value);
                setPage(0);
              }}
              placeholder="输入用户ID"
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">开始时间</label>
            <input
              type="datetime-local"
              value={startTimeFilter}
              onChange={(e) => {
                setStartTimeFilter(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">结束时间</label>
            <input
              type="datetime-local"
              value={endTimeFilter}
              onChange={(e) => {
                setEndTimeFilter(e.target.value);
                setPage(0);
              }}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
        </div>
      </div>

      {/* 协作列表 */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  协作ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  任务描述
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  用户ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  智能体
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  执行时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-800 divide-y divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-slate-400">
                    加载中...
                  </td>
                </tr>
              ) : collaborations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-slate-400">
                    暂无数据
                  </td>
                </tr>
              ) : (
                collaborations.map((collab) => (
                  <tr key={collab.collaborationId} className="hover:bg-slate-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {collab.collaborationId?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                      {collab.taskDescription || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {collab.userId || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {collab.agentIds?.length || 0} 个
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(collab.status)}`}>
                      {collab.status || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatExecutionTime(collab.executionTimeMs)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {formatTime(collab.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetail(collab.collaborationId!)}
                        className="text-blue-400 hover:text-blue-300 mr-3"
                      >
                        详情
                      </button>
                      {collab.status === 'RUNNING' && (
                        <button
                          onClick={() => handleCancel(collab.collaborationId!)}
                          className="text-red-400 hover:text-red-300"
                        >
                          取消
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="bg-slate-700 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              共 {totalElements} 条，第 {page + 1} / {totalPages} 页
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-slate-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      {showDetailModal && selectedCollaboration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">协作详情</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">协作ID</label>
                <div className="text-white mt-1">{selectedCollaboration.collaborationId}</div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">任务描述</label>
                <div className="text-white mt-1">{selectedCollaboration.taskDescription || '-'}</div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">用户ID</label>
                <div className="text-white mt-1">{selectedCollaboration.userId || '-'}</div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">参与的智能体</label>
                <div className="text-white mt-1">
                  {selectedCollaboration.agentIds?.join(', ') || '-'}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">状态</label>
                <div className={`mt-1 ${getStatusColor(selectedCollaboration.status)}`}>
                  {selectedCollaboration.status || '-'}
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">执行时间</label>
                <div className="text-white mt-1">
                  {formatExecutionTime(selectedCollaboration.executionTimeMs)}
                </div>
              </div>
              {selectedCollaboration.result && (
                <div>
                  <label className="text-slate-400 text-sm">执行结果</label>
                  <div className="text-white mt-1 bg-slate-700 p-3 rounded">
                    {selectedCollaboration.result}
                  </div>
                </div>
              )}
              {selectedCollaboration.errors && selectedCollaboration.errors.length > 0 && (
                <div>
                  <label className="text-slate-400 text-sm">错误信息</label>
                  <div className="text-red-400 mt-1 bg-slate-700 p-3 rounded">
                    {selectedCollaboration.errors.join('\n')}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
