import React, { useState, useEffect, useRef } from 'react';
import { useLogStream } from '../../hooks/useLogStream';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';

interface ExecutionMonitorProps {
  executionId: number;
  scriptName?: string;
  onClose: () => void;
  onCancel?: () => void;
}

export const ExecutionMonitor: React.FC<ExecutionMonitorProps> = ({
  executionId,
  scriptName,
  onClose,
  onCancel,
}) => {
  const { logs, status, connected, error, clearLogs } = useLogStream(executionId);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  // 过滤日志
  const filteredLogs = logs.filter(log => 
    searchTerm === '' || log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = async () => {
    if (!window.confirm('确定要取消这个执行吗？')) return;

    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        showAlert('请先登录', '错误', 'error');
        return;
      }

      await adminApi.devops.cancelExecution(token, executionId);
      showAlert('执行已取消', '成功', 'success');
      onCancel?.();
    } catch (error: any) {
      showAlert('取消执行失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  const handleDownloadLog = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      showAlert('请先登录', '错误', 'error');
      return;
    }
    
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/admin';
      // 先尝试流程执行的日志下载端点（pipelines/executions）
      let url = `${baseUrl}/devops/pipelines/executions/${executionId}/log/download`;
      
      let response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      // 如果流程执行端点返回 404，尝试脚本执行端点（executions）
      if (response.status === 404) {
        url = `${baseUrl}/devops/executions/${executionId}/log/download`;
        response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      if (!response.ok) {
        throw new Error(`下载失败: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `execution-${executionId}.log`);
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      showAlert('日志下载成功', '成功', 'success');
    } catch (error: any) {
      console.error('下载日志失败:', error);
      showAlert('下载日志失败: ' + (error.message || '未知错误'), '错误', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'bg-blue-900 text-blue-300';
      case 'SUCCESS':
        return 'bg-green-900 text-green-300';
      case 'FAILED':
        return 'bg-red-900 text-red-300';
      case 'CANCELLED':
        return 'bg-yellow-900 text-yellow-300';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return '🟢 运行中';
      case 'SUCCESS':
        return '✅ 成功';
      case 'FAILED':
        return '❌ 失败';
      case 'CANCELLED':
        return '⏸️ 已取消';
      default:
        return '⏸️ 未知';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* 头部 */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-white">
              执行监控: #{executionId}
              {scriptName && <span className="text-slate-400 text-base ml-2">({scriptName})</span>}
            </h2>
            <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </span>
            {connected ? (
              <span className="px-2 py-1 rounded text-xs bg-green-900 text-green-300">已连接</span>
            ) : (
              <span className="px-2 py-1 rounded text-xs bg-red-900 text-red-300">未连接</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* 控制栏 */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="搜索日志..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-700 rounded px-3 py-1 text-white placeholder-slate-500"
          />
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              autoScroll 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {autoScroll ? '🟢 自动滚动' : '⏸️ 暂停滚动'}
          </button>
          <button
            onClick={clearLogs}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
          >
            清屏
          </button>
          {status === 'RUNNING' && onCancel && (
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
            >
              取消执行
            </button>
          )}
          <button
            onClick={handleDownloadLog}
            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            下载日志
          </button>
        </div>

        {/* 日志显示区域 */}
        <div
          ref={logContainerRef}
          className="flex-1 bg-black p-4 overflow-y-auto font-mono text-sm"
        >
          {filteredLogs.length === 0 && logs.length > 0 ? (
            <div className="text-slate-500 text-center py-8">
              没有匹配的日志（搜索: {searchTerm}）
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-slate-500 text-center py-8">
              {connected ? '等待日志输出...' : '未连接'}
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                className={`mb-1 ${
                  log.level === 'ERROR' ? 'text-red-400' :
                  log.level === 'WARN' ? 'text-yellow-400' :
                  log.level === 'DEBUG' ? 'text-gray-500' :
                  'text-green-400'
                }`}
              >
                <span className="text-gray-600">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                {' '}
                <span className={log.level === 'ERROR' ? 'font-semibold' : ''}>
                  {log.message}
                </span>
              </div>
            ))
          )}
          {error && (
            <div className="text-red-400 mt-4 p-2 bg-red-900 bg-opacity-20 rounded">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* 底部统计 */}
        <div className="p-4 border-t border-slate-800 text-sm text-slate-400 flex items-center justify-between">
          <span>
            共 {logs.length} 条日志
            {searchTerm && ` (过滤后: ${filteredLogs.length})`}
          </span>
          {!connected && error && (
            <span className="text-yellow-400">⚠️ 连接已断开，正在重连...</span>
          )}
        </div>
      </div>
    </div>
  );
};
