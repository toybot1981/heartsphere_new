/**
 * AI模型管理组件（计费管理）
 * 基于AI模型配置，增强计费相关功能
 */
import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../services/api';
import type { AIModelConfig } from '../../../services/api/admin/types';
import { billingApi, AIProvider } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput, TextArea } from '../AdminUIComponents';
import { showAlert, showConfirm } from '../../../utils/dialog';
import { ApiKeyGuideModal } from '../settings/ApiKeyGuideModal';

interface ModelsManagementProps {
  adminToken: string | null;
  onReload?: () => void;
}

export const ModelsManagement: React.FC<ModelsManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]); // 从提供商管理获取
  const [loading, setLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModelConfig | null>(null);
  const [modelFormData, setModelFormData] = useState<Partial<AIModelConfig>>({});
  const [showApiKeyGuide, setShowApiKeyGuide] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | undefined>();
  
  // 定价信息（从计费系统获取）
  const [pricingInfo, setPricingInfo] = useState<Record<number, any>>({});

  useEffect(() => {
    if (adminToken) {
      loadProviders();
      loadModelConfigs();
    }
  }, [adminToken]);

  // 加载提供商列表（从提供商管理）
  const loadProviders = async () => {
    if (!adminToken) return;
    try {
      const data = await billingApi.providers.getAll(adminToken);
      setProviders(data);
    } catch (error: any) {
      console.error('加载提供商列表失败:', error);
      // 如果加载失败，使用默认列表
      setProviders([
        { id: 1, name: 'openai', displayName: 'OpenAI' },
        { id: 2, name: 'dashscope', displayName: 'DashScope (通义千问)' },
        { id: 3, name: 'gemini', displayName: 'Google Gemini' },
        { id: 4, name: 'doubao', displayName: 'Doubao (豆包)' },
      ]);
    }
  };

  const loadModelConfigs = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const data = await adminApi.aiConfig.models.getAll(adminToken);
      setModelConfigs(data);
      
      // 加载定价信息（如果模型有对应的计费模型ID）
      // 这里需要根据实际情况调整，可能需要从后端获取模型ID映射
    } catch (error: any) {
      showAlert('加载模型配置失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 将提供商管理的name（小写）转换为模型配置的provider（大写）
  const convertProviderNameToModelProvider = (providerName: string): string => {
    return providerName.toUpperCase();
  };

  // 将模型配置的provider（大写）转换为提供商管理的name（小写）
  const convertModelProviderToProviderName = (modelProvider: string): string => {
    return modelProvider.toLowerCase();
  };

  // 根据提供商name获取显示名称
  const getProviderDisplayName = (providerName: string): string => {
    const provider = providers.find(p => p.name === providerName.toLowerCase());
    return provider ? provider.displayName : providerName;
  };

  const handleCreateModel = () => {
    // 默认选择第一个启用的提供商
    const defaultProvider = providers.find(p => p.enabled) || providers[0];
    setModelFormData({
      provider: defaultProvider ? convertProviderNameToModelProvider(defaultProvider.name) : 'GEMINI',
      modelName: '',
      capability: 'text',
      apiKey: '',
      baseUrl: '',
      modelParams: '',
      isDefault: false,
      priority: 0,
      isActive: true,
    });
    setEditingModel({ id: undefined } as AIModelConfig);
  };

  const handleEditModel = (model: AIModelConfig) => {
    setModelFormData({ ...model });
    setEditingModel(model);
  };

  const handleCancelModel = () => {
    setEditingModel(null);
    setModelFormData({});
  };

  const handleSaveModel = async () => {
    if (!adminToken) return;
    if (!modelFormData.provider || !modelFormData.modelName || !modelFormData.capability) {
      showAlert('请填写提供商、模型名称和能力类型', '缺少参数', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (editingModel?.id) {
        await adminApi.aiConfig.models.update(editingModel.id, modelFormData, adminToken);
      } else {
        await adminApi.aiConfig.models.create(modelFormData as any, adminToken);
      }
      await loadModelConfigs();
      handleCancelModel();
      showAlert('保存成功', '成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (id: number) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      '确定要删除这个模型配置吗？删除后相关的计费配置也会受影响。',
      '删除模型配置',
      'danger'
    );
    if (!confirmed) return;

    try {
      await adminApi.aiConfig.models.delete(id, adminToken);
      await loadModelConfigs();
      showAlert('删除成功', '成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
    }
  };

  const handleSetDefaultModel = async (id: number) => {
    if (!adminToken) return;
    try {
      await adminApi.aiConfig.models.setDefault(id, adminToken);
      await loadModelConfigs();
      showAlert('已设置为默认模型', '成功', 'success');
    } catch (error: any) {
      showAlert('设置失败: ' + (error.message || '未知错误'), '设置失败', 'error');
    }
  };

  // 按供应商分组模型
  const groupModelsByProvider = () => {
    const grouped: Record<string, { provider: any; models: AIModelConfig[] }> = {};
    
    modelConfigs.forEach(model => {
      const providerName = convertModelProviderToProviderName(model.provider);
      const provider = providers.find(p => p.name === providerName);
      
      if (provider) {
        if (!grouped[provider.name]) {
          grouped[provider.name] = { provider, models: [] };
        }
        grouped[provider.name].models.push(model);
      } else {
        // 如果找不到对应的提供商，使用模型配置中的provider作为key
        const key = model.provider.toUpperCase();
        if (!grouped[key]) {
          grouped[key] = { 
            provider: { name: providerName, displayName: model.provider, enabled: true }, 
            models: [] 
          };
        }
        grouped[key].models.push(model);
      }
    });
    
    // 按提供商排序：doubao 第一位，dashscope 第二位
    const getProviderPriority = (providerName: string): number => {
      const name = providerName.toLowerCase();
      if (name === 'doubao') return 1;
      if (name === 'dashscope') return 2;
      return 999; // 其他提供商排在后面
    };
    
    return Object.values(grouped).sort((a, b) => {
      const nameA = a.provider.name || '';
      const nameB = b.provider.name || '';
      const priorityA = getProviderPriority(nameA);
      const priorityB = getProviderPriority(nameB);
      
      // 如果优先级不同，按优先级排序
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 如果优先级相同，按显示名称排序
      return a.provider.displayName.localeCompare(b.provider.displayName);
    });
  };

  const getCapabilityDisplayName = (capability: string) => {
    const capabilityMap: Record<string, string> = {
      'text': '文本',
      'image': '图片',
      'audio': '音频',
      'video': '视频',
    };
    return capabilityMap[capability] || capability;
  };

  // 编辑表单
  if (editingModel !== null) {
    const isEdit = editingModel.id !== undefined;
    return (
      <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? '编辑模型配置' : '新建模型配置'}
          </h3>
          <Button variant="ghost" onClick={handleCancelModel}>取消</Button>
        </div>

        <div className="space-y-4">
          <InputGroup label="提供商 *">
            <select
              value={modelFormData.provider || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, provider: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              disabled={isEdit}
            >
              <option value="">选择提供商</option>
              {providers
                .filter(p => p.enabled) // 只显示启用的提供商
                .map(provider => (
                  <option 
                    key={provider.id} 
                    value={convertProviderNameToModelProvider(provider.name)}
                  >
                    {provider.displayName} ({provider.name})
                  </option>
                ))}
            </select>
            {isEdit && <p className="text-xs text-slate-500 mt-1">提供商创建后不可修改</p>}
            {providers.length === 0 && (
              <p className="text-xs text-yellow-500 mt-1">
                提示：请先在"提供商管理"中创建提供商
              </p>
            )}
          </InputGroup>

          <InputGroup label="能力类型 *">
            <select
              value={modelFormData.capability || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, capability: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="">选择能力类型</option>
              <option value="text">文本</option>
              <option value="image">图片</option>
              <option value="audio">音频</option>
              <option value="video">视频</option>
            </select>
          </InputGroup>

          <InputGroup label="模型名称 *">
            <TextInput
              value={modelFormData.modelName || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, modelName: e.target.value })}
              placeholder="例如：gpt-4, qwen-max (dashscope), doubao-1-5-pro-32k-250115"
            />
          </InputGroup>

          <InputGroup label="API Key *">
            <TextInput
              type="password"
              value={modelFormData.apiKey || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, apiKey: e.target.value })}
              placeholder="输入API Key"
            />
            <button
              onClick={() => {
                setSelectedProvider(modelFormData.provider);
                setShowApiKeyGuide(true);
              }}
              className="mt-1 text-sm text-indigo-400 hover:text-indigo-300"
            >
              如何获取API Key？
            </button>
          </InputGroup>

          <InputGroup label="Base URL (可选)">
            <TextInput
              value={modelFormData.baseUrl || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, baseUrl: e.target.value })}
              placeholder="例如：https://api.openai.com/v1"
            />
            <p className="text-xs text-slate-500 mt-1">留空则使用默认URL</p>
          </InputGroup>

          <InputGroup label="模型参数 (JSON格式，可选)">
            <TextArea
              value={modelFormData.modelParams || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, modelParams: e.target.value })}
              placeholder='{"temperature": 0.7, "max_tokens": 2000}'
              rows={3}
            />
          </InputGroup>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="优先级">
              <TextInput
                type="number"
                value={modelFormData.priority || 0}
                onChange={(e) => setModelFormData({ ...modelFormData, priority: parseInt(e.target.value) || 0 })}
                placeholder="数字越小优先级越高"
              />
            </InputGroup>

          </div>

          <InputGroup label="描述 (可选)">
            <TextArea
              value={modelFormData.description || ''}
              onChange={(e) => setModelFormData({ ...modelFormData, description: e.target.value })}
              placeholder="模型描述信息"
              rows={2}
            />
          </InputGroup>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modelFormData.isDefault || false}
                onChange={(e) => setModelFormData({ ...modelFormData, isDefault: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">设为默认模型</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={modelFormData.isActive !== false}
                onChange={(e) => setModelFormData({ ...modelFormData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">启用此模型</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSaveModel} disabled={loading}>
              {loading ? '保存中...' : '保存'}
            </Button>
            <Button variant="ghost" onClick={handleCancelModel}>取消</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">AI模型管理</h2>
          <p className="text-sm text-slate-400 mt-1">管理AI模型配置，计费系统将基于这些模型进行计费</p>
        </div>
        <Button onClick={handleCreateModel}>+ 新建模型</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : modelConfigs.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400 mb-4">暂无模型配置</p>
          <Button onClick={handleCreateModel}>创建第一个模型配置</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupModelsByProvider().map(({ provider, models }) => (
            <div key={provider.name || provider.displayName} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {provider.displayName}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">共 {models.length} 个模型配置</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded ${
                    provider.enabled
                      ? 'bg-green-900/50 text-green-300 border border-green-700'
                      : 'bg-red-900/50 text-red-300 border border-red-700'
                  }`}>
                    {provider.enabled ? '启用' : '禁用'}
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">能力类型</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型名称</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">优先级</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">默认</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-300">{model.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-slate-700 text-slate-200">
                            {getCapabilityDisplayName(model.capability)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-200 font-mono">{model.modelName}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">{model.priority}</td>
                        <td className="px-6 py-4 text-sm">
                          {model.isDefault ? (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-indigo-900/50 text-indigo-300 border border-indigo-700">
                              默认
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetDefaultModel(model.id!)}
                              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              设为默认
                            </button>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            model.isActive
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-red-900/50 text-red-300 border border-red-700'
                          }`}>
                            {model.isActive ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditModel(model)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDeleteModel(model.id!)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              删除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {showApiKeyGuide && selectedProvider && (
        <ApiKeyGuideModal
          show={showApiKeyGuide}
          provider={selectedProvider}
          onClose={() => setShowApiKeyGuide(false)}
        />
      )}
    </div>
  );
};

