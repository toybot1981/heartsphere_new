import React, { useState, useEffect } from 'react';

interface PerformancePanelProps {
  adminToken: string | null;
}

interface PerformanceMetrics {
  toolCallMetrics: {
    totalCalls: number;
    successRate: number;
    averageDuration: number;
    callsByTool: Record<string, {
      count: number;
      successRate: number;
      averageDuration: number;
    }>;
  };
  vmMetrics: {
    totalVms: number;
    runningVms: number;
    errorVms: number;
  };
}

export const PerformancePanel: React.FC<PerformancePanelProps> = ({ adminToken }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  // 加载性能指标
  const loadMetrics = async () => {
    if (!adminToken) return;
    
    try {
      setLoading(true);
      // TODO: 实现获取性能指标的 API
      // 目前先使用占位数据
      setMetrics({
        toolCallMetrics: {
          totalCalls: 0,
          successRate: 0,
          averageDuration: 0,
          callsByTool: {},
        },
        vmMetrics: {
          totalVms: 0,
          runningVms: 0,
          errorVms: 0,
        },
      });
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    
    // 定期刷新
    const interval = setInterval(loadMetrics, 30000); // 30秒刷新一次
    return () => clearInterval(interval);
  }, [adminToken, timeRange]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 时间范围选择 */}
      <div className="border-b p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">性能监控</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === '1h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              1小时
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === '24h'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              24小时
            </button>
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1 text-sm rounded ${
                timeRange === '7d'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              7天
            </button>
          </div>
        </div>
      </div>

      {/* 性能指标 */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="p-8 text-center text-gray-500">加载中...</div>
        ) : !metrics ? (
          <div className="p-8 text-center text-gray-500">暂无性能数据</div>
        ) : (
          <div className="space-y-6">
            {/* 工具调用性能指标 */}
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-semibold text-gray-900 mb-4">工具调用性能</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border">
                  <div className="text-xs text-gray-600 mb-1">总调用数</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.toolCallMetrics.totalCalls}
                  </div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-xs text-gray-600 mb-1">成功率</div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.toolCallMetrics.successRate.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-xs text-gray-600 mb-1">平均耗时</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.toolCallMetrics.averageDuration > 0
                      ? `${(metrics.toolCallMetrics.averageDuration / 1000).toFixed(2)}s`
                      : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* 按工具分组的统计 */}
            {Object.keys(metrics.toolCallMetrics.callsByTool).length > 0 && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="text-md font-semibold text-gray-900 mb-4">按工具统计</h3>
                <div className="space-y-2">
                  {Object.entries(metrics.toolCallMetrics.callsByTool).map(([toolName, stats]) => (
                    <div key={toolName} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{toolName}</span>
                        <span className="text-sm text-gray-600">
                          成功率: {stats.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div>调用次数: {stats.count}</div>
                        <div>
                          平均耗时: {stats.averageDuration > 0
                            ? `${(stats.averageDuration / 1000).toFixed(2)}s`
                            : '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 虚拟机性能指标 */}
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-semibold text-gray-900 mb-4">虚拟机状态</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded border">
                  <div className="text-xs text-gray-600 mb-1">总虚拟机数</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {metrics.vmMetrics.totalVms}
                  </div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-xs text-gray-600 mb-1">运行中</div>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics.vmMetrics.runningVms}
                  </div>
                </div>
                <div className="bg-white p-4 rounded border">
                  <div className="text-xs text-gray-600 mb-1">错误</div>
                  <div className="text-2xl font-bold text-red-600">
                    {metrics.vmMetrics.errorVms}
                  </div>
                </div>
              </div>
            </div>

            {/* 图表区域（占位） */}
            <div className="bg-gray-50 p-4 rounded">
              <h3 className="text-md font-semibold text-gray-900 mb-4">性能趋势</h3>
              <div className="bg-white p-8 rounded border text-center text-gray-500">
                <p>性能图表功能待实现</p>
                <p className="text-xs mt-2">可以使用 Chart.js 或 Recharts 实现</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
