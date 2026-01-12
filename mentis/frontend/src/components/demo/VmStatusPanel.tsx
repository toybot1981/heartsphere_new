import React from 'react';

export interface VmStatusInfo {
  sessionId: string;
  vmId?: string;
  vmExists: boolean;
  status?: string;
  createdAt?: string;
  errorMessage?: string;
}

interface VmStatusPanelProps {
  sessionId: string | null;
  vmStatus?: VmStatusInfo | null;
  onRefresh?: () => void;
  onCreateVm?: () => void;
  onDeleteVm?: () => void;
}

export const VmStatusPanel: React.FC<VmStatusPanelProps> = ({
  sessionId,
  vmStatus,
  onRefresh,
  onCreateVm,
  onDeleteVm,
}) => {
  const getStatusColor = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-800';
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

  if (!sessionId) {
    return (
      <div className="p-4 text-gray-500 text-center">
        请先创建会话以查看虚拟机状态
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b bg-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">虚拟机状态</h3>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            刷新
          </button>
        )}
      </div>

      <div className="flex-1 p-4 space-y-3">
        {!vmStatus || !vmStatus.vmExists ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm mb-4">
              {vmStatus?.status === 'ERROR' ? (
                <div>
                  <div className="text-red-600 mb-2">虚拟机状态错误</div>
                  {vmStatus.errorMessage && (
                    <div className="text-xs text-red-500">{vmStatus.errorMessage}</div>
                  )}
                </div>
              ) : (
                '当前会话没有关联的虚拟机'
              )}
            </div>
            {onCreateVm && (
              <button
                onClick={onCreateVm}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                创建虚拟机
              </button>
            )}
          </div>
        ) : (
          <>
            <div>
              <div className="text-xs text-gray-600 mb-1">虚拟机 ID</div>
              <div className="text-sm font-mono text-gray-900 break-all">
                {vmStatus.vmId || '-'}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">状态</div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                  vmStatus.status
                )}`}
              >
                {vmStatus.status || '未知'}
              </span>
            </div>

            {vmStatus.createdAt && (
              <div>
                <div className="text-xs text-gray-600 mb-1">创建时间</div>
                <div className="text-sm text-gray-900">
                  {new Date(vmStatus.createdAt).toLocaleString()}
                </div>
              </div>
            )}

            {onDeleteVm && (
              <div className="pt-3 border-t">
                <button
                  onClick={onDeleteVm}
                  className="w-full px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  删除虚拟机
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
