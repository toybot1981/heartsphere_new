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
    showApiKeyGuide,
    selectedProvider,
    loadModels,
    handleCreateModel,
    handleEditModel,
    handleSaveModel,
    handleCancelEdit,
    handleDeleteModel,
    handleShowApiKeyGuide,
    handleCloseApiKeyGuide,
  } = useModelsManagement(adminToken, onReload);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">AI模型配置</h3>
        <button
          onClick={handleCreateModel}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          新增模型
        </button>
      </div>

      {editingModel && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <h4 className="font-medium mb-4">
            {editingModel.id ? '编辑模型' : '新增模型'}
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">提供商</label>
              <select
                value={modelFormData.provider || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    provider: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="">选择提供商</option>
                <option value="GEMINI">Gemini</option>
                <option value="OPENAI">OpenAI</option>
                <option value="DASHSCOPE">DashScope</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">模型名称</label>
              <input
                type="text"
                value={modelFormData.modelName || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    modelName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                placeholder="输入模型名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="password"
                value={modelFormData.apiKey || ''}
                onChange={(e) =>
                  handleEditModel({
                    ...modelFormData,
                    apiKey: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border rounded"
                placeholder="输入API Key"
              />
              <button
                onClick={() => handleShowApiKeyGuide(modelFormData.provider)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                如何获取API Key？
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveModel}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                保存
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left border-b">ID</th>
              <th className="px-4 py-2 text-left border-b">提供商</th>
              <th className="px-4 py-2 text-left border-b">模型名称</th>
              <th className="px-4 py-2 text-left border-b">状态</th>
              <th className="px-4 py-2 text-left border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            {modelConfigs.map((model) => (
              <tr key={model.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-b">{model.id}</td>
                <td className="px-4 py-2 border-b">{model.provider}</td>
                <td className="px-4 py-2 border-b">{model.modelName}</td>
                <td className="px-4 py-2 border-b">
                  {model.enabled ? (
                    <span className="text-green-600">启用</span>
                  ) : (
                    <span className="text-gray-500">禁用</span>
                  )}
                </td>
                <td className="px-4 py-2 border-b">
                  <button
                    onClick={() => handleEditModel(model)}
                    className="text-blue-600 hover:text-blue-800 mr-2"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteModel(model.id!)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showApiKeyGuide && selectedProvider && (
        <ApiKeyGuideModal
          provider={selectedProvider}
          onClose={handleCloseApiKeyGuide}
        />
      )}
    </div>
  );
};
