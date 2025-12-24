/**
 * AI模型管理组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, AIModel, AIProvider } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert, showConfirm } from '../../../utils/dialog';

interface ModelsManagementProps {
  adminToken: string | null;
  onReload?: () => void;
}

export const ModelsManagement: React.FC<ModelsManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const [models, setModels] = useState<AIModel[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingModel, setEditingModel] = useState<AIModel | null>(null);
  const [formData, setFormData] = useState({
    providerId: 0,
    modelCode: '',
    modelName: '',
    modelType: 'text',
    enabled: true,
  });

  useEffect(() => {
    loadData();
  }, [adminToken]);

  const loadData = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const [modelsData, providersData] = await Promise.all([
        billingApi.models.getAll(adminToken),
        billingApi.providers.getAll(adminToken),
      ]);
      setModels(modelsData);
      setProviders(providersData);
    } catch (error: any) {
      showAlert('加载失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      providerId: providers[0]?.id || 0,
      modelCode: '',
      modelName: '',
      modelType: 'text',
      enabled: true,
    });
    setEditingModel(null);
  };

  const handleEdit = (model: AIModel) => {
    setFormData({
      providerId: model.providerId,
      modelCode: model.modelCode,
      modelName: model.modelName,
      modelType: model.modelType,
      enabled: model.enabled,
    });
    setEditingModel(model);
  };

  const handleCancel = () => {
    setEditingModel(null);
    setFormData({
      providerId: providers[0]?.id || 0,
      modelCode: '',
      modelName: '',
      modelType: 'text',
      enabled: true,
    });
  };

  const handleSave = async () => {
    if (!adminToken) return;
    if (!formData.providerId || !formData.modelCode || !formData.modelName) {
      showAlert('请填写所有必填项', '缺少参数', 'warning');
      return;
    }

    try {
      if (editingModel) {
        await billingApi.models.update(editingModel.id, formData, adminToken);
      } else {
        await billingApi.models.create(formData, adminToken);
      }
      await loadData();
      handleCancel();
      showAlert('保存成功', '成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
    }
  };

  const handleDelete = async (model: AIModel) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      `确定要删除模型"${model.modelName}"吗？此操作不可恢复！`,
      '删除模型',
      'danger'
    );
    if (!confirmed) return;

    try {
      await billingApi.models.delete(model.id, adminToken);
      await loadData();
      showAlert('删除成功', '操作成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
    }
  };

  const getProviderName = (providerId: number) => {
    return providers.find(p => p.id === providerId)?.displayName || '未知';
  };

  // 按供应商分组模型
  const groupModelsByProvider = () => {
    const grouped: Record<number, { provider: AIProvider; models: AIModel[] }> = {};
    
    models.forEach(model => {
      const provider = providers.find(p => p.id === model.providerId);
      if (provider) {
        if (!grouped[provider.id]) {
          grouped[provider.id] = { provider, models: [] };
        }
        grouped[provider.id].models.push(model);
      }
    });
    
    // 按提供商ID排序
    return Object.values(grouped).sort((a, b) => a.provider.id - b.provider.id);
  };

  if (editingModel !== null || (!editingModel && formData.modelCode === '' && models.length === 0)) {
    const isEdit = editingModel !== null;
    return (
      <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? '编辑模型' : '新建模型'}
          </h3>
          <Button variant="ghost" onClick={handleCancel}>取消</Button>
        </div>

        <div className="space-y-4">
          <InputGroup label="提供商 *">
            <select
              value={formData.providerId}
              onChange={(e) => setFormData({ ...formData, providerId: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              disabled={isEdit}
            >
              <option value={0}>请选择提供商</option>
              {providers.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.displayName} ({provider.name})
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup label="模型代码 *">
            <TextInput
              value={formData.modelCode}
              onChange={(e) => setFormData({ ...formData, modelCode: e.target.value })}
              placeholder="例如：qwen-max, gpt-4"
              disabled={isEdit}
            />
            <p className="text-xs text-slate-500 mt-1">唯一标识符，创建后不可修改</p>
          </InputGroup>

          <InputGroup label="模型名称 *">
            <TextInput
              value={formData.modelName}
              onChange={(e) => setFormData({ ...formData, modelName: e.target.value })}
              placeholder="例如：通义千问-Max"
            />
          </InputGroup>

          <InputGroup label="模型类型 *">
            <select
              value={formData.modelType}
              onChange={(e) => setFormData({ ...formData, modelType: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="text">文本 (text)</option>
              <option value="image">图片 (image)</option>
              <option value="audio">音频 (audio)</option>
              <option value="video">视频 (video)</option>
            </select>
          </InputGroup>

          <InputGroup label="启用状态">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">启用此模型</span>
            </label>
          </InputGroup>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave}>保存</Button>
            <Button variant="ghost" onClick={handleCancel}>取消</Button>
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
          <p className="text-sm text-slate-400 mt-1">管理AI模型配置</p>
        </div>
        <Button onClick={handleCreate}>+ 新建模型</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : models.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400 mb-4">暂无模型</p>
          <Button onClick={handleCreate}>创建第一个模型</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupModelsByProvider().map(({ provider, models: providerModels }) => (
            <div key={provider.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-100">{provider.displayName}</h3>
                  <span className={`px-3 py-1 text-xs font-semibold rounded ${
                    provider.enabled
                      ? 'bg-green-900/50 text-green-300 border border-green-700'
                      : 'bg-red-900/50 text-red-300 border border-red-700'
                  }`}>
                    {provider.enabled ? '启用' : '禁用'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mt-1">共 {providerModels.length} 个模型</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型代码</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型名称</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">类型</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {providerModels.map((model) => (
                      <tr key={model.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-300">{model.id}</td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-200">{model.modelCode}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{model.modelName}</td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded bg-slate-700 text-slate-200">
                            {model.modelType}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            model.enabled
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-red-900/50 text-red-300 border border-red-700'
                          }`}>
                            {model.enabled ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(model)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(model)}
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
    </div>
  );
};

