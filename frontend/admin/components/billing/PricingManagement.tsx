/**
 * 资费配置管理组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, AIModelPricing, AIModel, AIProvider } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert, showConfirm } from '../../../utils/dialog';

interface PricingManagementProps {
  adminToken: string | null;
  onReload?: () => void;
}

export const PricingManagement: React.FC<PricingManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const [pricings, setPricings] = useState<AIModelPricing[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPricing, setEditingPricing] = useState<AIModelPricing | null>(null);
  const [formData, setFormData] = useState({
    modelId: 0,
    pricingType: 'input_token',
    unitPrice: '0',
    unit: 'per_1k_tokens',
    minChargeUnit: '0',
    effectiveDate: new Date().toISOString().slice(0, 16),
    expiryDate: '',
    isActive: true,
  });

  useEffect(() => {
    loadData();
  }, [adminToken]);

  const loadData = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const [pricingsData, modelsData, providersData] = await Promise.all([
        billingApi.pricing.getAll(adminToken),
        billingApi.models.getAll(adminToken),
        billingApi.providers.getAll(adminToken),
      ]);
      setPricings(pricingsData);
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
      modelId: models[0]?.id || 0,
      pricingType: 'input_token',
      unitPrice: '0',
      unit: 'per_1k_tokens',
      minChargeUnit: '0',
      effectiveDate: new Date().toISOString().slice(0, 16),
      expiryDate: '',
      isActive: true,
    });
    setEditingPricing(null);
  };

  const handleEdit = (pricing: AIModelPricing) => {
    setFormData({
      modelId: pricing.modelId,
      pricingType: pricing.pricingType,
      unitPrice: pricing.unitPrice.toString(),
      unit: pricing.unit,
      minChargeUnit: pricing.minChargeUnit?.toString() || '0',
      effectiveDate: new Date(pricing.effectiveDate).toISOString().slice(0, 16),
      expiryDate: pricing.expiryDate ? new Date(pricing.expiryDate).toISOString().slice(0, 16) : '',
      isActive: pricing.isActive,
    });
    setEditingPricing(pricing);
  };

  const handleCancel = () => {
    setEditingPricing(null);
    setFormData({
      modelId: models[0]?.id || 0,
      pricingType: 'input_token',
      unitPrice: '0',
      unit: 'per_1k_tokens',
      minChargeUnit: '0',
      effectiveDate: new Date().toISOString().slice(0, 16),
      expiryDate: '',
      isActive: true,
    });
  };

  const handleSave = async () => {
    if (!adminToken) return;
    if (!formData.modelId || !formData.pricingType || !formData.unitPrice) {
      showAlert('请填写所有必填项', '缺少参数', 'warning');
      return;
    }

    try {
      const data = {
        modelId: formData.modelId,
        pricingType: formData.pricingType,
        unitPrice: parseFloat(formData.unitPrice),
        unit: formData.unit,
        minChargeUnit: parseFloat(formData.minChargeUnit) || 0,
        effectiveDate: new Date(formData.effectiveDate).toISOString(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : null,
        isActive: formData.isActive,
      };

      if (editingPricing) {
        await billingApi.pricing.update(editingPricing.id, data, adminToken);
      } else {
        await billingApi.pricing.create(data, adminToken);
      }
      await loadData();
      handleCancel();
      showAlert('保存成功', '成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
    }
  };

  const handleDelete = async (pricing: AIModelPricing) => {
    if (!adminToken) return;
    const confirmed = await showConfirm(
      `确定要删除此资费配置吗？此操作不可恢复！`,
      '删除资费配置',
      'danger'
    );
    if (!confirmed) return;

    try {
      await billingApi.pricing.delete(pricing.id, adminToken);
      await loadData();
      showAlert('删除成功', '操作成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
    }
  };

  const getModelName = (modelId: number) => {
    return models.find(m => m.id === modelId)?.modelName || '未知';
  };

  const getModel = (modelId: number) => {
    return models.find(m => m.id === modelId);
  };

  const getPricingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'input_token': '输入Token',
      'output_token': '输出Token',
      'image': '图片生成',
      'audio_minute': '音频处理（分钟）',
      'video_second': '视频生成（秒）',
    };
    return labels[type] || type;
  };

  // 按供应商分组资费配置
  const groupPricingsByProvider = () => {
    const grouped: Record<number, { provider: AIProvider; pricings: AIModelPricing[] }> = {};
    
    pricings.forEach(pricing => {
      const model = getModel(pricing.modelId);
      if (model) {
        const provider = providers.find(p => p.id === model.providerId);
        if (provider) {
          if (!grouped[provider.id]) {
            grouped[provider.id] = { provider, pricings: [] };
          }
          grouped[provider.id].pricings.push(pricing);
        }
      }
    });
    
    // 按提供商ID排序
    return Object.values(grouped).sort((a, b) => a.provider.id - b.provider.id);
  };

  if (editingPricing !== null || (!editingPricing && formData.modelId === 0 && pricings.length === 0)) {
    const isEdit = editingPricing !== null;
    return (
      <div className="max-w-4xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-100">
            {isEdit ? '编辑资费配置' : '新建资费配置'}
          </h3>
          <Button variant="ghost" onClick={handleCancel}>取消</Button>
        </div>

        <div className="space-y-4">
          <InputGroup label="模型 *">
            <select
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: Number(e.target.value) })}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value={0}>请选择模型</option>
              {models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.modelName} ({model.modelCode})
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup label="计费类型 *">
            <select
              value={formData.pricingType}
              onChange={(e) => {
                const type = e.target.value;
                setFormData({
                  ...formData,
                  pricingType: type,
                  unit: type === 'image' ? 'per_image' : type === 'audio_minute' ? 'per_minute' : type === 'video_second' ? 'per_second' : 'per_1k_tokens',
                });
              }}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="input_token">输入Token</option>
              <option value="output_token">输出Token</option>
              <option value="image">图片生成</option>
              <option value="audio_minute">音频处理（分钟）</option>
              <option value="video_second">视频生成（秒）</option>
            </select>
          </InputGroup>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="单价 *">
              <TextInput
                type="number"
                step="0.000001"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="0.002"
              />
              <p className="text-xs text-slate-500 mt-1">单位：元/{formData.unit.replace('per_', '每')}</p>
            </InputGroup>

            <InputGroup label="最低计费单位">
              <TextInput
                type="number"
                step="0.000001"
                value={formData.minChargeUnit}
                onChange={(e) => setFormData({ ...formData, minChargeUnit: e.target.value })}
                placeholder="0"
              />
            </InputGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="生效日期 *">
              <TextInput
                type="datetime-local"
                value={formData.effectiveDate}
                onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
              />
            </InputGroup>

            <InputGroup label="失效日期">
              <TextInput
                type="datetime-local"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                placeholder="留空表示永久有效"
              />
            </InputGroup>
          </div>

          <InputGroup label="启用状态">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-300">启用此资费配置</span>
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
          <h2 className="text-2xl font-bold text-slate-100">资费配置管理</h2>
          <p className="text-sm text-slate-400 mt-1">管理AI模型的资费标准</p>
        </div>
        <Button onClick={handleCreate}>+ 新建资费配置</Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : pricings.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400 mb-4">暂无资费配置</p>
          <Button onClick={handleCreate}>创建第一个资费配置</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupPricingsByProvider().map(({ provider, pricings: providerPricings }) => (
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
                <p className="text-sm text-slate-400 mt-1">共 {providerPricings.length} 条资费配置</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">计费类型</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">单价</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">生效日期</th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {providerPricings.map((pricing) => (
                      <tr key={pricing.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-300">{pricing.id}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{getModelName(pricing.modelId)}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">{getPricingTypeLabel(pricing.pricingType)}</td>
                        <td className="px-6 py-4 text-sm text-slate-200">
                          ¥{pricing.unitPrice.toFixed(6)} / {pricing.unit.replace('per_', '')}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {new Date(pricing.effectiveDate).toLocaleString('zh-CN')}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                            pricing.isActive
                              ? 'bg-green-900/50 text-green-300 border border-green-700'
                              : 'bg-red-900/50 text-red-300 border border-red-700'
                          }`}>
                            {pricing.isActive ? '生效' : '失效'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEdit(pricing)}
                              className="text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => handleDelete(pricing)}
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

