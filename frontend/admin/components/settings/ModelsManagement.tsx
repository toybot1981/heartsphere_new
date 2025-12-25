import React from 'react';
import { useModelsManagement } from './hooks/useModelsManagement';
import { ApiKeyGuideModal } from './ApiKeyGuideModal';
import { AIModelConfig } from '../../../../services/api';

interface ModelsManagementProps {
  adminToken: string;
  onReload: () => void;
}

export const ModelsManagement: React.FC<ModelsManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const {
    modelConfigs,
    editingModel,
    modelFormData,
    loading,
    handleCreateModel,
    handleEditModel,
    handleSaveModel,
    handleCancelModel,
    handleDeleteModel,
    handleSetDefaultModel,
  } = useModelsManagement(adminToken, onReload);
  
  const [showApiKeyGuide, setShowApiKeyGuide] = React.useState(false);
  const [selectedProvider, setSelectedProvider] = React.useState<string | undefined>();

  // 按供应商分组模型
  const groupModelsByProvider = () => {
    const grouped: Record<string, AIModelConfig[]> = {};
    
    modelConfigs.forEach(model => {
      const provider = model.provider.toUpperCase();
      if (!grouped[provider]) {
        grouped[provider] = [];
      }
      grouped[provider].push(model);
    });
    
    // 按供应商名称排序
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const getProviderDisplayName = (provider: string) => {
    const providerMap: Record<string, string> = {
      'GEMINI': 'Gemini',
      'OPENAI': 'OpenAI',
      'DASHSCOPE': 'DashScope',
      'DOUBAO': 'Doubao',
    };
    return providerMap[provider.toUpperCase()] || provider;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-100">AI模型配置</h3>
        <button
          onClick={handleCreateModel}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          新增模型
        </button>
      </div>

      {editingModel && (
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <h4 className="font-medium mb-4 text-slate-100">
            {editingModel.id ? '编辑模型' : '新增模型'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">提供商</label>
              <select
                value={modelFormData.provider || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    provider: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none"
              >
                <option value="">选择提供商</option>
                <option value="GEMINI">Gemini</option>
                <option value="OPENAI">OpenAI</option>
                <option value="DASHSCOPE">DashScope</option>
                <option value="DOUBAO">Doubao</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">能力类型</label>
              <select
                value={modelFormData.capability || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    capability: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none"
              >
                <option value="">选择能力类型</option>
                <option value="text">文本</option>
                <option value="image">图片</option>
                <option value="audio">音频</option>
                <option value="video">视频</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">模型名称</label>
              <input
                type="text"
                value={modelFormData.modelName || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    modelName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none placeholder-slate-400"
                placeholder="输入模型名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">API Key</label>
              <input
                type="password"
                value={modelFormData.apiKey || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    apiKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none placeholder-slate-400"
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Base URL (可选)</label>
              <input
                type="text"
                value={modelFormData.baseUrl || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    baseUrl: e.target.value,
                  })
                }
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:border-indigo-500 outline-none placeholder-slate-400"
                placeholder="输入Base URL"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelFormData.isDefault || false}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    isDefault: e.target.checked,
                  })
                }
                className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-slate-300">设为默认模型</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={modelFormData.isActive !== false}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    isActive: e.target.checked,
                  })
                }
                className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-slate-300">启用</label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveModel}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                保存
              </button>
              <button
                onClick={handleCancelModel}
                className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-12 text-slate-400">加载中...</div>
        ) : modelConfigs.length === 0 ? (
          <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
            <p className="text-slate-400 mb-4">暂无模型配置</p>
            <button
              onClick={handleCreateModel}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              创建第一个模型配置
            </button>
          </div>
        ) : (
          groupModelsByProvider().map(([provider, models]) => (
            <div key={provider} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
                <h3 className="text-lg font-bold text-slate-100">
                  {getProviderDisplayName(provider)}
                </h3>
                <p className="text-sm text-slate-400 mt-1">共 {models.length} 个模型配置</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">能力类型</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型名称</th>
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
                        <td className="px-6 py-4 text-sm text-slate-200">{model.modelName}</td>
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
          ))
        )}
      </div>

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
