import React, { useState, useEffect } from 'react';
import type { VmStatusInfo } from '../demo/components/VmStatusPanel';

interface VmManagementPanelProps {
  adminToken: string | null;
}

interface VmListItem {
  sessionId: string;
  vmId: string;
  status: string;
  createdAt?: string;
}

export const VmManagementPanel: React.FC<VmManagementPanelProps> = ({ adminToken }) => {
  const [vms, setVms] = useState<VmListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 加载虚拟机列表
  const loadVms = async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      // TODO: 实现获取所有虚拟机的 API
      // 目前先使用占位数据
      setVms([]);
    } catch (error) {
      console.error('Failed to load VMs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVms();
  }, [adminToken]);

  const filteredVms = vms.filter(vm => {
    const matchesStatus = filterStatus === 'all' || vm.status === filterStatus;
    const matchesSearch = !searchTerm || 
      vm.sessionId.includes(searchTerm) || 
      vm.vmId.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'RUNNING':
        return 'bg-green-100 text-green-800';
      case 'IDLE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ERROR':
      case 'NOT_FOUND':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 操作栏 */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">虚拟机管理</h2>
          <button
            onClick={loadVms}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            刷新
          </button>
        </div>
        
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索会话ID或虚拟机ID..."
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border rounded text-sm"
          >
            <option value="all">全部状态</option>
            <option value="RUNNING">运行中</option>
            <option value="IDLE">空闲</option>
            <option value="ERROR">错误</option>
          </select>
        </div>
      </div>

      {/* 虚拟机列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : filteredVms.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {vms.length === 0 ? '暂无虚拟机' : '没有匹配的虚拟机'}
          </div>
        ) : (
          <div className="divide-y">
            {filteredVms.map((vm) => (
              <div key={vm.vmId} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{vm.vmId}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                          vm.status
                        )}`}
                      >
                        {vm.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      会话ID: {vm.sessionId}
                      {vm.createdAt && ` · 创建时间: ${new Date(vm.createdAt).toLocaleString()}`}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
                      onClick={() => {
                        // TODO: 查看虚拟机详情
                      }}
                    >
                      详情
                    </button>
                    <button
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                      onClick={() => {
                        // TODO: 删除虚拟机
                      }}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
