/**
 * AI提供商管理组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, AIProvider } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert, showConfirm } from '../../../utils/dialog';

interface ProvidersManagementProps {
  adminToken: string | null;
  onReload?: () => void;
}

export const ProvidersManagement: React.FC<ProvidersManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    enabled: true,
  });

  useEffect(() => {
    loadProviders();
  }, [adminToken]);

  const loadProviders = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const data = await billingApi.providers.getAll(adminToken);
      setProviders(data);
    } catch (error: any) {
      showAlert('加载失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({ name: '', displayName: '', enabled: true });
    setEditingProvider(null);
  };

  const handleEdit = (provider: AIProvider) => {
    setFormData({
      name: provider.name,
      displayName: provider.displayName,
      enabled: provider.enabled,
    });
    setEditingProvider(provider);
  };

  const handleCancel = () => {
    setEditingProvider(null);
    setFormData({ name: '', displayName: '', enabled: true });
  };

  const handleSave = async () => {
    if (!adminToken) return;
    if (!formData.name || !formData.displayName) {
      showAlert('请填写所有必填项', '缺少参数', 'warning');
      return;
    }

    try {
      if (editingProvider) {
        await billingApi.providers.update(editingProvider.id, formData, adminToken);
      } else {
        await billingApi.providers.create(formData, adminToken);
      }
      await loadProviders();
      handleCancel();
      showAlert('保存成功', '成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
    }
  };

  const handleDelete = async (provider: AIProvider) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      `确定要删除提供商"${provider.displayName}"吗？此操作不可恢复！`,
      '删除提供商',
      'danger'
    );
    if (!confirmed) return;

    try {
      await billingApi.providers.delete(provider.id, adminToken);
      await loadProviders();
      showAlert('删除成功', '操作成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
    }
  };

  if (editingProvider !== null || (!editingProvider && formData.name === '' && formData.displayName === '' && providers.length === 0)) {
    // 编辑模式或新建模式
    const isEdit = editingProvider !== null;
    return (
      <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? '编辑提供商' : '新建提供商'}
          </h3>
          <Button variant="ghost" onClick={handleCancel}>取消</Button>
        </div>

        <div className="space-y-4">
          <InputGroup label="提供商代码 *">
            <TextInput
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：dashscope, openai"
              disabled={isEdit}
            />
            <p className="text-xs text-slate-500 mt-1">唯一标识符，创建后不可修改</p>
          </InputGroup>

          <InputGroup label="显示名称 *">
            <TextInput
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder="例如：阿里云通义千问"
            />
          </InputGroup>

          <InputGroup label="启用状态">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">启用此提供商</span>
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
          <h2 className="text-2xl font-bold text-slate-100">AI提供商管理</h2>
          <p className="text-sm text-slate-400 mt-1">管理AI模型提供商配置</p>
        </div>
        <Button onClick={handleCreate}>+ 新建提供商</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : providers.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400 mb-4">暂无提供商</p>
          <Button onClick={handleCreate}>创建第一个提供商</Button>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">代码</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">显示名称</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">创建时间</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300">{provider.id}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-200">{provider.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">{provider.displayName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                        provider.enabled
                          ? 'bg-green-900/50 text-green-300 border border-green-700'
                          : 'bg-red-900/50 text-red-300 border border-red-700'
                      }`}>
                        {provider.enabled ? '启用' : '禁用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(provider.createdAt).toLocaleString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(provider)}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(provider)}
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
      )}
    </div>
  );
};

