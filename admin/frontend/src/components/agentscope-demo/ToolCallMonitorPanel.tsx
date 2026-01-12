import React, { useState, useEffect, useRef } from 'react';
import type { ToolCall } from '../demo/components/ToolCallMonitor';

interface ToolCallMonitorPanelProps {
  adminToken: string | null;
}

export const ToolCallMonitorPanel: React.FC<ToolCallMonitorPanelProps> = ({ adminToken }) => {
  const [toolCalls, setToolCalls] = useState<ToolCall[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<ToolCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<ToolCall | null>(null);
  const [filters, setFilters] = useState({
    sessionId: '',
    toolName: '',
    startTime: '',
    endTime: '',
  });
  const [statistics, setStatistics] = useState({
    total: 0,
    success: 0,
    error: 0,
    averageDuration: 0,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  // 订阅全局事件流
  useEffect(() => {
    if (!adminToken) return;

    const eventSource = new EventSource('/api/demo/events/global');
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.sessionId || data.toolName) {
          // 工具调用事件，刷新列表
          loadToolCalls();
        }
      } catch (e) {
        console.error('Failed to parse SSE event:', e);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [adminToken]);

  // 加载工具调用列表
  const loadToolCalls = async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.sessionId) params.append('sessionId', filters.sessionId);
      if (filters.toolName) params.append('toolName', filters.toolName);
      if (filters.startTime) params.append('startTime', filters.startTime);
      if (filters.endTime) params.append('endTime', filters.endTime);

      const response = await fetch(`/api/demo/tool-calls?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to load tool calls');
      
      const result = await response.json();
      if (result.success && result.data) {
        setToolCalls(result.data);
        calculateStatistics(result.data);
      }
    } catch (error) {
      console.error('Failed to load tool calls:', error);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计信息
  const calculateStatistics = (calls: ToolCall[]) => {
    const total = calls.length;
    const success = calls.filter(c => c.status === 'SUCCESS').length;
    const error = calls.filter(c => c.status === 'ERROR').length;
    const durations = calls
      .filter(c => c.duration != null)
      .map(c => c.duration!);
    const averageDuration = durations.length > 0
      ? durations.reduce((a, b) => a + b, 0) / durations.length
      : 0;

    setStatistics({ total, success, error, averageDuration });
  };

  // 应用筛选
  useEffect(() => {
    let filtered = [...toolCalls];
    
    if (filters.sessionId) {
      filtered = filtered.filter(c => c.sessionId.includes(filters.sessionId));
    }
    if (filters.toolName) {
      filtered = filtered.filter(c => c.toolName.includes(filters.toolName));
    }
    
    setFilteredCalls(filtered);
  }, [toolCalls, filters]);

  // 初始加载
  useEffect(() => {
    loadToolCalls();
  }, [adminToken]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 统计信息栏 */}
      <div className="border-b bg-gray-50 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">总调用数</div>
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">成功数</div>
            <div className="text-2xl font-bold text-green-600">{statistics.success}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">失败数</div>
            <div className="text-2xl font-bold text-red-600">{statistics.error}</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-xs text-gray-600 mb-1">平均耗时</div>
            <div className="text-2xl font-bold text-gray-900">
              {statistics.averageDuration > 0
                ? `${(statistics.averageDuration / 1000).toFixed(2)}s`
                : '-'}
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="border-b p-4 bg-white">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">会话ID</label>
            <input
              type="text"
              value={filters.sessionId}
              onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
              placeholder="筛选会话ID"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">工具名称</label>
            <input
              type="text"
              value={filters.toolName}
              onChange={(e) => setFilters({ ...filters, toolName: e.target.value })}
              placeholder="筛选工具名称"
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">开始时间</label>
            <input
              type="datetime-local"
              value={filters.startTime}
              onChange={(e) => setFilters({ ...filters, startTime: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">结束时间</label>
            <input
              type="datetime-local"
              value={filters.endTime}
              onChange={(e) => setFilters({ ...filters, endTime: e.target.value })}
              className="w-full px-3 py-2 border rounded text-sm"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button
            onClick={loadToolCalls}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            刷新
          </button>
          <button
            onClick={() => setFilters({ sessionId: '', toolName: '', startTime: '', endTime: '' })}
            className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
          >
            清除筛选
          </button>
        </div>
      </div>

      {/* 工具调用列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : filteredCalls.length === 0 ? (
          <div className="p-8 text-center text-gray-500">暂无工具调用记录</div>
        ) : (
          <div className="divide-y">
            {filteredCalls.map((call) => (
              <div
                key={call.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedCall?.id === call.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedCall(call)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{call.toolName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          call.status === 'SUCCESS'
                            ? 'bg-green-100 text-green-800'
                            : call.status === 'ERROR'
                            ? 'bg-red-100 text-red-800'
                            : call.status === 'RUNNING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {call.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {call.sessionId} · {new Date(call.startTime).toLocaleString()}
                      {call.duration && ` · ${(call.duration / 1000).toFixed(2)}s`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 详情面板（侧边栏） */}
      {selectedCall && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50 overflow-y-auto">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">工具调用详情</h3>
            <button
              onClick={() => setSelectedCall(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">工具名称</div>
              <div className="text-sm text-gray-900">{selectedCall.toolName}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">会话ID</div>
              <div className="text-sm text-gray-900 font-mono">{selectedCall.sessionId}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">状态</div>
              <span
                className={`px-2 py-1 rounded text-xs ${
                  selectedCall.status === 'SUCCESS'
                    ? 'bg-green-100 text-green-800'
                    : selectedCall.status === 'ERROR'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {selectedCall.status}
              </span>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">执行时间</div>
              <div className="text-sm text-gray-900">
                {new Date(selectedCall.startTime).toLocaleString()}
                {selectedCall.endTime && ` - ${new Date(selectedCall.endTime).toLocaleString()}`}
              </div>
            </div>
            {selectedCall.duration && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">耗时</div>
                <div className="text-sm text-gray-900">
                  {(selectedCall.duration / 1000).toFixed(2)} 秒
                </div>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">参数</div>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {selectedCall.parameters || '无'}
              </pre>
            </div>
            {selectedCall.result && (
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">结果</div>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {selectedCall.result}
                </pre>
              </div>
            )}
            {selectedCall.errorMessage && (
              <div>
                <div className="text-xs font-medium text-red-600 mb-1">错误信息</div>
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  {selectedCall.errorMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
