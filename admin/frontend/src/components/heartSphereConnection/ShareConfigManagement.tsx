import React, { useState, useEffect } from 'react';
import { adminApi } from "../../services/api";
import { showAlert, showConfirm } from "../../utils/dialog";
import { Button } from "../../components/Button";
import { InputGroup, TextInput } from '../AdminUIComponents';
import type { HeartSphereShareConfigDTO } from "../../services/api";
import { LoadingState, EmptyState, ErrorState } from './components';

interface ShareConfigManagementProps {
  adminToken: string | null;
  onRefresh?: () => void;
}

export const ShareConfigManagement: React.FC<ShareConfigManagementProps> = ({
  adminToken,
  onRefresh
}) => {
  const [configs, setConfigs] = useState<HeartSphereShareConfigDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // 记录正在操作的项目ID
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedShareType, setSelectedShareType] = useState<string>('');

  const loadConfigs = async () => {
    if (!adminToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.heartSphereConnection.getShareConfigs(adminToken, {
        search: search || undefined,
        status: selectedStatus || undefined,
        shareType: selectedShareType || undefined,
        page: currentPage,
        size: pageSize,
      });
      setConfigs(response.content || []);
      setTotal(response.total || 0);
    } catch (error: any) {
      console.error('加载共享配置失败:', error);
      const errorMessage = error.message || '未知错误';
      setError(errorMessage);
      
      // 根据错误类型提供更详细的提示
      if (errorMessage.includes('401') || errorMessage.includes('未授权') || errorMessage.includes('登录已过期')) {
        // 不在这里显示弹框，由 AdminAuthContext 统一处理
        // showAlert('登录已过期，请重新登录', '认证失败', 'error');
      } else if (errorMessage.includes('403') || errorMessage.includes('权限')) {
        showAlert('您没有权限执行此操作', '权限不足', 'error');
      } else if (errorMessage.includes('网络') || errorMessage.includes('Network')) {
        showAlert('网络连接失败，请检查网络设置', '网络错误', 'error');
      } else {
        showAlert(`加载共享配置失败: ${errorMessage}`, '加载失败', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, [currentPage, search, selectedStatus, selectedShareType, adminToken]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDisable = async (config: HeartSphereShareConfigDTO) => {
    if (!adminToken || actionLoading === config.id) return;
    const confirmed = await showConfirm(
      `确定要禁用共享配置 "${config.shareCode}" 吗？`,
      '禁用共享配置',
      'warning'
    );
    if (!confirmed) return;

    setActionLoading(config.id);
    try {
      await adminApi.heartSphereConnection.disableShareConfig(config.id, '管理员禁用', adminToken);
      showAlert('共享配置已禁用', '操作成功', 'success');
      await loadConfigs();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';
      showAlert(`禁用失败: ${errorMessage}`, '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEnable = async (config: HeartSphereShareConfigDTO) => {
    if (!adminToken || actionLoading === config.id) return;
    setActionLoading(config.id);
    try {
      await adminApi.heartSphereConnection.enableShareConfig(config.id, adminToken);
      showAlert('共享配置已启用', '操作成功', 'success');
      await loadConfigs();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';
      showAlert(`启用失败: ${errorMessage}`, '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (config: HeartSphereShareConfigDTO) => {
    if (!adminToken || actionLoading === config.id) return;
    const confirmed = await showConfirm(
      `确定要暂停共享配置 "${config.shareCode}" 吗？`,
      '暂停共享配置',
      'warning'
    );
    if (!confirmed) return;

    setActionLoading(config.id);
    try {
      await adminApi.heartSphereConnection.pauseShareConfig(config.id, '管理员暂停', adminToken);
      showAlert('共享配置已暂停', '操作成功', 'success');
      await loadConfigs();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';
      showAlert(`暂停失败: ${errorMessage}`, '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (config: HeartSphereShareConfigDTO) => {
    if (!adminToken || actionLoading === config.id) return;
    const confirmed = await showConfirm(
      `确定要删除共享配置 "${config.shareCode}" 吗？此操作不可恢复！`,
      '删除共享配置',
      'danger'
    );
    if (!confirmed) return;

    setActionLoading(config.id);
    try {
      await adminApi.heartSphereConnection.deleteShareConfig(config.id, '管理员删除', adminToken);
      showAlert('共享配置已删除', '操作成功', 'success');
      await loadConfigs();
      if (onRefresh) onRefresh();
    } catch (error: any) {
      const errorMessage = error.message || '未知错误';
      showAlert(`删除失败: ${errorMessage}`, '操作失败', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: '已启用', className: 'bg-green-500/20 text-green-400' },
      DISABLED: { label: '已禁用', className: 'bg-red-500/20 text-red-400' },
      PAUSED: { label: '已暂停', className: 'bg-yellow-500/20 text-yellow-400' },
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
            placeholder="搜索用户名称、共享码..."
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
            <option value="ACTIVE">已启用</option>
            <option value="DISABLED">已禁用</option>
            <option value="PAUSED">已暂停</option>
          </select>
        </InputGroup>
        <InputGroup label="共享类型">
          <select
            value={selectedShareType}
            onChange={(e) => {
              setSelectedShareType(e.target.value);
              setCurrentPage(0);
            }}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white"
          >
            <option value="">全部</option>
            <option value="ALL">全部</option>
            <option value="WORLD">世界</option>
            <option value="ERA">场景</option>
          </select>
        </InputGroup>
        <Button onClick={loadConfigs} disabled={loading}>
          {loading ? '加载中...' : '刷新'}
        </Button>
      </div>

      {/* 数据表格 */}
      {loading && !error ? (
        <LoadingState message="正在加载共享配置..." />
      ) : error ? (
        <ErrorState
          title="加载失败"
          message={error}
          onRetry={loadConfigs}
          retryLabel="重新加载"
        />
      ) : configs.length === 0 ? (
        <EmptyState
          title="暂无共享配置"
          description={search || selectedStatus || selectedShareType 
            ? "没有找到匹配的共享配置，请尝试调整筛选条件"
            : "还没有任何共享配置，用户创建后将会显示在这里"}
          icon="🔗"
        />
      ) : (
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">ID</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">用户</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">共享码</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">共享类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">访问类型</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">访问次数</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {configs.map((config) => (
              <tr key={config.id} className="hover:bg-slate-700/50">
                <td className="px-4 py-3 text-sm text-slate-300">{config.id}</td>
                <td className="px-4 py-3 text-sm text-slate-300">
                  <div>
                    <div className="font-medium">{config.username || config.userId}</div>
                    {config.userEmail && (
                      <div className="text-xs text-slate-400">{config.userEmail}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-300 font-mono">{config.shareCode}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{config.shareType}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{config.accessType}</td>
                <td className="px-4 py-3">{getStatusBadge(config.status)}</td>
                <td className="px-4 py-3 text-sm text-slate-300">{config.accessCount || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {config.status === 'ACTIVE' && (
                      <>
                        <Button
                          variant="warning"
                          onClick={() => handlePause(config)}
                          disabled={actionLoading === config.id}
                          className="text-sm"
                        >
                          {actionLoading === config.id ? '处理中...' : '暂停'}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDisable(config)}
                          disabled={actionLoading === config.id}
                          className="text-sm"
                        >
                          {actionLoading === config.id ? '处理中...' : '禁用'}
                        </Button>
                      </>
                    )}
                    {config.status === 'DISABLED' && (
                      <Button
                        variant="success"
                        onClick={() => handleEnable(config)}
                        disabled={actionLoading === config.id}
                        className="text-sm"
                      >
                        {actionLoading === config.id ? '处理中...' : '启用'}
                      </Button>
                    )}
                    {config.status === 'PAUSED' && (
                      <>
                        <Button
                          variant="success"
                          onClick={() => handleEnable(config)}
                          disabled={actionLoading === config.id}
                          className="text-sm"
                        >
                          {actionLoading === config.id ? '处理中...' : '启用'}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDisable(config)}
                          disabled={actionLoading === config.id}
                          className="text-sm"
                        >
                          {actionLoading === config.id ? '处理中...' : '禁用'}
                        </Button>
                      </>
                    )}
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(config)}
                      disabled={actionLoading === config.id}
                      className="text-sm"
                    >
                      {actionLoading === config.id ? '处理中...' : '删除'}
                    </Button>
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              上一页
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
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


