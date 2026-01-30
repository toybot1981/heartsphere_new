import React, { useState, useEffect } from 'react';
import { multiAgentApi, MultiAgentRoutingConfigDTO } from '../../services/api/admin/multiAgent';
import { showAlert, showConfirm } from '../../utils/dialog';

/**
 * 路由配置管理组件
 * 提供路由规则的查看、编辑和测试功能
 */
export const RoutingConfigManagement: React.FC = () => {
  const [config, setConfig] = useState<MultiAgentRoutingConfigDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testTask, setTestTask] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  // 加载配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      const routingConfig = await multiAgentApi.getRoutingConfig();
      if (routingConfig) {
        setConfig(routingConfig);
      }
    } catch (error: any) {
      console.error('加载路由配置失败:', error);
      showAlert('加载路由配置失败: ' + (error.message || '未知错误'), '加载失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  // 保存配置
  const handleSave = async () => {
    if (!config) return;
    
    const confirmed = await showConfirm(
      '确定要保存路由配置吗？',
      '保存配置',
      'warning'
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await multiAgentApi.updateRoutingConfig(config);
      showAlert('路由配置已保存', '操作成功', 'success');
      loadConfig();
    } catch (error: any) {
      console.error('保存路由配置失败:', error);
      showAlert('保存路由配置失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 测试路由策略
  const handleTest = async () => {
    if (!testTask.trim()) {
      showAlert('请输入测试任务', '输入错误', 'error');
      return;
    }

    try {
      const result = await multiAgentApi.testRoutingStrategy(testTask);
      setTestResult(result);
      setShowTestModal(true);
    } catch (error: any) {
      console.error('测试路由策略失败:', error);
      showAlert('测试路由策略失败: ' + (error.message || '未知错误'), '测试失败', 'error');
    }
  };

  // 更新关键词映射
  const updateKeywordMapping = (keyword: string, capabilities: string[]) => {
    if (!config) return;
    setConfig({
      ...config,
      keywordToCapabilities: {
        ...config.keywordToCapabilities,
        [keyword]: capabilities,
      },
    });
  };

  // 添加关键词
  const addKeyword = () => {
    const keyword = prompt('请输入关键词:');
    if (keyword && config) {
      updateKeywordMapping(keyword, []);
    }
  };

  // 删除关键词
  const removeKeyword = (keyword: string) => {
    if (!config || !config.keywordToCapabilities) return;
    const newMapping = { ...config.keywordToCapabilities };
    delete newMapping[keyword];
    setConfig({
      ...config,
      keywordToCapabilities: newMapping,
    });
  };

  if (loading) {
    return <div className="text-center text-slate-400 py-8">加载中...</div>;
  }

  if (!config) {
    return <div className="text-center text-slate-400 py-8">暂无配置</div>;
  }

  return (
    <div className="space-y-6">
      {/* 关键词到能力映射 */}
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">关键词到能力映射</h3>
          <button
            onClick={addKeyword}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            添加关键词
          </button>
        </div>
        <div className="space-y-3">
          {config.keywordToCapabilities && Object.entries(config.keywordToCapabilities).map(([keyword, capabilities]) => (
            <div key={keyword} className="flex items-center justify-between bg-slate-700 p-3 rounded">
              <div className="flex-1">
                <div className="text-white font-medium mb-2">{keyword}</div>
                <div className="flex flex-wrap gap-2">
                  {capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-slate-600 text-slate-300 text-sm rounded"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => removeKeyword(keyword)}
                className="ml-4 text-red-400 hover:text-red-300"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 智能体优先级 */}
      {config.agentPriorities && Object.keys(config.agentPriorities).length > 0 && (
        <div className="bg-slate-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">智能体优先级</h3>
          <div className="space-y-2">
            {Object.entries(config.agentPriorities).map(([agentId, priority]) => (
              <div key={agentId} className="flex items-center justify-between bg-slate-700 p-3 rounded">
                <span className="text-white">{agentId}</span>
                <span className="text-slate-300">优先级: {priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 路由测试工具 */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">路由测试工具</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">测试任务</label>
            <textarea
              value={testTask}
              onChange={(e) => setTestTask(e.target.value)}
              placeholder="输入一个任务描述，测试路由策略..."
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white min-h-[100px]"
            />
          </div>
          <button
            onClick={handleTest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
          >
            测试路由
          </button>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '保存配置'}
        </button>
      </div>

      {/* 测试结果弹窗 */}
      {showTestModal && testResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">路由测试结果</h2>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-sm">选中的智能体</label>
                <div className="text-white mt-1">
                  {testResult.selectedAgents?.join(', ') || '无'}
                </div>
              </div>
              {testResult.decompositionResult && testResult.decompositionResult.length > 0 && (
                <div>
                  <label className="text-slate-400 text-sm">任务分解结果</label>
                  <div className="mt-1 space-y-2">
                    {testResult.decompositionResult.map((subtask: any, idx: number) => (
                      <div key={idx} className="bg-slate-700 p-3 rounded">
                        <div className="text-white font-medium">{subtask.description}</div>
                        {subtask.assignedAgentId && (
                          <div className="text-slate-400 text-sm mt-1">
                            分配给: {subtask.assignedAgentId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTestModal(false)}
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
