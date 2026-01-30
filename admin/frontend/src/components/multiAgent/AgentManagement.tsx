import React, { useState, useEffect } from 'react';
import { multiAgentApi, MultiAgentAgentDTO, MultiAgentAgentMetricsDTO } from '../../services/api/admin/multiAgent';
import { showAlert } from '../../utils/dialog';

/**
 * 智能体管理组件
 * 提供智能体的查看、状态监控和性能指标查看功能
 */
export const AgentManagement: React.FC = () => {
  const [agents, setAgents] = useState<MultiAgentAgentDTO[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<MultiAgentAgentDTO | null>(null);
  const [metrics, setMetrics] = useState<MultiAgentAgentMetricsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 加载智能体列表
  const loadAgents = async () => {
    setLoading(true);
    try {
      const agentList = await multiAgentApi.getAllAgents();
      if (agentList) {
        setAgents(agentList);
      }
    } catch (error: any) {
      console.error('加载智能体列表失败:', error);
      showAlert('加载智能体列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // 查看详情
  const handleViewDetail = async (agentId: string) => {
    try {
      const [detail, agentMetrics] = await Promise.all([
        multiAgentApi.getAgentById(agentId),
        multiAgentApi.getAgentMetrics(agentId)
      ]);
      if (detail) {
        setSelectedAgent(detail);
        setMetrics(agentMetrics || null);
        setShowDetailModal(true);
      }
    } catch (error: any) {
      console.error('加载智能体详情失败:', error);
      showAlert('加载智能体详情失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    }
  };

  // 状态颜色
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'IDLE':
        return 'text-green-400';
      case 'BUSY':
        return 'text-blue-400';
      case 'ERROR':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  // 格式化时间
  const formatTime = (time?: string) => {
    if (!time) return '-';
    return new Date(time).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* 智能体卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-slate-400 py-8">加载中...</div>
        ) : agents.length === 0 ? (
          <div className="col-span-full text-center text-slate-400 py-8">暂无智能体</div>
        ) : (
          agents.map((agent) => (
            <div
              key={agent.agentId}
              className="bg-slate-800 rounded-lg p-6 hover:bg-slate-700 transition-colors cursor-pointer"
              onClick={() => handleViewDetail(agent.agentId)}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{agent.name || agent.agentId}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(agent.status)}`}>
                  {agent.status || 'UNKNOWN'}
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                {agent.description || '无描述'}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">总执行次数</span>
                  <span className="text-white">{agent.totalExecutions || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">成功率</span>
                  <span className="text-green-400">
                    {agent.successRate ? `${(agent.successRate * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">平均响应时间</span>
                  <span className="text-white">
                    {agent.averageResponseTimeMs ? `${(agent.averageResponseTimeMs / 1000).toFixed(2)}s` : '-'}
                  </span>
                </div>
                {agent.capabilities && agent.capabilities.length > 0 && (
                  <div className="mt-3">
                    <div className="text-slate-400 text-xs mb-1">能力</div>
                    <div className="flex flex-wrap gap-1">
                      {agent.capabilities.slice(0, 3).map((cap, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded"
                        >
                          {cap}
                        </span>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                          +{agent.capabilities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 详情弹窗 */}
      {showDetailModal && selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedAgent.name || selectedAgent.agentId}</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">智能体ID</label>
                <div className="text-white mt-1">{selectedAgent.agentId}</div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">描述</label>
                <div className="text-white mt-1">{selectedAgent.description || '-'}</div>
              </div>
              <div>
                <label className="text-slate-400 text-sm">状态</label>
                <div className={`mt-1 ${getStatusColor(selectedAgent.status)}`}>
                  {selectedAgent.status || '-'}
                </div>
              </div>
              {selectedAgent.capabilities && selectedAgent.capabilities.length > 0 && (
                <div>
                  <label className="text-slate-400 text-sm">能力</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedAgent.capabilities.map((cap, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-slate-700 text-slate-300 text-sm rounded"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {metrics && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold text-white mb-4">性能指标</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700 rounded p-4">
                      <div className="text-slate-400 text-sm">总调用次数</div>
                      <div className="text-2xl font-bold text-white mt-2">{metrics.totalCalls || 0}</div>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <div className="text-slate-400 text-sm">成功次数</div>
                      <div className="text-2xl font-bold text-green-400 mt-2">{metrics.successfulCalls || 0}</div>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <div className="text-slate-400 text-sm">失败次数</div>
                      <div className="text-2xl font-bold text-red-400 mt-2">{metrics.failedCalls || 0}</div>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <div className="text-slate-400 text-sm">成功率</div>
                      <div className="text-2xl font-bold text-blue-400 mt-2">
                        {metrics.successRate ? `${(metrics.successRate * 100).toFixed(1)}%` : '0%'}
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <div className="text-slate-400 text-sm">平均响应时间</div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {metrics.averageResponseTimeMs ? `${(metrics.averageResponseTimeMs / 1000).toFixed(2)}s` : '-'}
                      </div>
                    </div>
                    <div className="bg-slate-700 rounded p-4">
                      <div className="text-slate-400 text-sm">最小响应时间</div>
                      <div className="text-2xl font-bold text-white mt-2">
                        {metrics.minResponseTimeMs ? `${(metrics.minResponseTimeMs / 1000).toFixed(2)}s` : '-'}
                      </div>
                    </div>
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
