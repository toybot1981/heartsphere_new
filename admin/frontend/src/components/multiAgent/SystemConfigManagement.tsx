import React, { useState, useEffect } from 'react';
import { multiAgentApi, MultiAgentSystemConfigDTO } from '../../services/api/admin/multiAgent';
import { showAlert, showConfirm } from '../../utils/dialog';

/**
 * 系统配置管理组件
 * 提供系统参数的查看和编辑功能
 */
export const SystemConfigManagement: React.FC = () => {
  const [config, setConfig] = useState<MultiAgentSystemConfigDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载配置
  const loadConfig = async () => {
    setLoading(true);
    try {
      const systemConfig = await multiAgentApi.getSystemConfig();
      if (systemConfig) {
        setConfig(systemConfig);
      }
    } catch (error: any) {
      console.error('加载系统配置失败:', error);
      showAlert('加载系统配置失败: ' + (error.message || '未知错误'), '加载失败', 'error');
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
      '确定要保存系统配置吗？',
      '保存配置',
      'warning'
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      await multiAgentApi.updateSystemConfig(config);
      showAlert('系统配置已保存', '操作成功', 'success');
      loadConfig();
    } catch (error: any) {
      console.error('保存系统配置失败:', error);
      showAlert('保存系统配置失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 更新配置字段
  const updateConfig = (field: keyof MultiAgentSystemConfigDTO, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      [field]: value,
    });
  };

  // 更新 AgentScope 配置
  const updateAgentScopeConfig = (field: string, value: any) => {
    if (!config) return;
    setConfig({
      ...config,
      agentScopeConfig: {
        ...config.agentScopeConfig,
        [field]: value,
      },
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
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-6">协作系统配置</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              协作超时时间（秒）
            </label>
            <input
              type="number"
              value={config.collaborationTimeoutSeconds || ''}
              onChange={(e) => updateConfig('collaborationTimeoutSeconds', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              最大重试次数
            </label>
            <input
              type="number"
              value={config.maxRetryCount || ''}
              onChange={(e) => updateConfig('maxRetryCount', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              最大并发协作数
            </label>
            <input
              type="number"
              value={config.maxConcurrentCollaborations || ''}
              onChange={(e) => updateConfig('maxConcurrentCollaborations', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              日志级别
            </label>
            <select
              value={config.logLevel || 'INFO'}
              onChange={(e) => updateConfig('logLevel', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            >
              <option value="DEBUG">DEBUG</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
            </select>
          </div>
        </div>
      </div>

      {/* AgentScope 配置 */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-6">AgentScope 配置</h3>
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agentScopeEnabled"
              checked={config.agentScopeConfig?.enabled || false}
              onChange={(e) => updateAgentScopeConfig('enabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
            />
            <label htmlFor="agentScopeEnabled" className="ml-2 text-sm font-medium text-slate-300">
              启用 AgentScope
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              模型名称
            </label>
            <input
              type="text"
              value={config.agentScopeConfig?.modelName || ''}
              onChange={(e) => updateAgentScopeConfig('modelName', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              最大迭代次数
            </label>
            <input
              type="number"
              value={config.agentScopeConfig?.maxIters || ''}
              onChange={(e) => updateAgentScopeConfig('maxIters', parseInt(e.target.value) || 0)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agentScopeStream"
              checked={config.agentScopeConfig?.stream || false}
              onChange={(e) => updateAgentScopeConfig('stream', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded"
            />
            <label htmlFor="agentScopeStream" className="ml-2 text-sm font-medium text-slate-300">
              启用流式输出
            </label>
          </div>
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
    </div>
  );
};
