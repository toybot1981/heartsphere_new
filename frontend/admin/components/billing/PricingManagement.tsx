/**
 * 资费配置管理组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, AIModelPricing, AIProvider } from '../../../services/api/billing';
import { adminApi } from '../../../services/api';
import type { AIModelConfig } from '../../../services/api/admin/types';
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
  const [models, setModels] = useState<AIModelConfig[]>([]); // 从 ai_model_config 获取（用于下拉选择和显示）
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingPricing, setEditingPricing] = useState<AIModelPricing | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    modelId: 0,
    pricingType: 'input_token',
    unitPrice: '0',
    unit: 'per_1k_tokens', // per_1k_tokens, per_1m_tokens, per_image, per_10k_chars, per_second
    videoResolution: '', // 720p, 1080p (仅用于视频)
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
        adminApi.aiConfig.models.getAll(adminToken), // 从模型管理获取模型列表（用于下拉选择和显示）
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
    console.log('[PricingManagement] handleCreate 被调用');
    setFormData({
      modelId: models[0]?.id || 0,
      pricingType: 'input_token',
      unitPrice: '0',
      unit: 'per_1k_tokens',
      videoResolution: '',
      minChargeUnit: '0',
      effectiveDate: new Date().toISOString().slice(0, 16),
      expiryDate: '',
      isActive: true,
    });
    setEditingPricing(null);
    setIsCreating(true);
    console.log('[PricingManagement] isCreating 设置为 true');
  };

  const handleEdit = (pricing: AIModelPricing) => {
    // 从unit中提取视频分辨率（如果有）
    let videoResolution = '';
    if (pricing.pricingType === 'video_second' && pricing.unit.includes('_')) {
      const parts = pricing.unit.split('_');
      if (parts.length > 2) {
        videoResolution = parts[parts.length - 1]; // 例如：per_second_720p -> 720p
      }
    }
    
    setFormData({
      modelId: pricing.modelId,
      pricingType: pricing.pricingType,
      unitPrice: pricing.unitPrice.toString(),
      unit: pricing.unit.replace(/_720p|_1080p/g, ''), // 移除分辨率后缀
      videoResolution: videoResolution,
      minChargeUnit: pricing.minChargeUnit?.toString() || '0',
      effectiveDate: new Date(pricing.effectiveDate).toISOString().slice(0, 16),
      expiryDate: pricing.expiryDate ? new Date(pricing.expiryDate).toISOString().slice(0, 16) : '',
      isActive: pricing.isActive,
    });
    setEditingPricing(pricing);
  };

  const handleCancel = () => {
    setEditingPricing(null);
    setIsCreating(false);
    setFormData({
      modelId: models[0]?.id || 0,
      pricingType: 'input_token',
      unitPrice: '0',
      unit: 'per_1k_tokens',
      videoResolution: '',
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
      // 构建unit，如果是视频类型，添加分辨率后缀
      let finalUnit = formData.unit;
      if (formData.pricingType === 'video_second' && formData.videoResolution) {
        finalUnit = `${formData.unit}_${formData.videoResolution}`;
      }
      
      const data = {
        modelId: formData.modelId,
        pricingType: formData.pricingType,
        unitPrice: parseFloat(formData.unitPrice),
        unit: finalUnit,
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
      setIsCreating(false);
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
    // 从模型配置列表中查找（pricing.modelId 现在是 ai_model_config 的ID）
    const configModel = models.find(m => m.id === modelId);
    if (configModel) {
      return `${configModel.modelName} (${configModel.provider.toUpperCase()})`;
    }
    
    return `未知模型 (ID: ${modelId})`;
  };

  const getModel = (modelId: number) => {
    // 从模型配置列表中查找
    return models.find(m => m.id === modelId);
  };

  const getPricingTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'input_token': '输入Token',
      'output_token': '输出Token',
      'image': '图片生成',
      'audio_tts': '语音合成',
      'video_second': '视频生成',
    };
    return labels[type] || type;
  };

  // 获取单位显示名称
  const getUnitDisplayName = (unit: string, pricingType: string) => {
    if (pricingType === 'input_token' || pricingType === 'output_token') {
      if (unit === 'per_1k_tokens' || unit.startsWith('per_1k_tokens')) {
        return '千token';
      } else if (unit === 'per_1m_tokens' || unit.startsWith('per_1m_tokens')) {
        return '百万token';
      }
      return 'token';
    } else if (pricingType === 'image') {
      return '每张';
    } else if (pricingType === 'audio_tts') {
      return '每万字符';
    } else if (pricingType === 'video_second') {
      // 提取分辨率
      if (unit.includes('_720p')) {
        return '每秒（720P）';
      } else if (unit.includes('_1080p')) {
        return '每秒（1080P）';
      }
      return '每秒';
    }
    return unit.replace('per_', '');
  };

  // 按供应商分组资费配置
  const groupPricingsByProvider = () => {
    const grouped: Record<string, { provider: AIProvider | { name: string; displayName: string }; pricings: AIModelPricing[] }> = {};
    
    pricings.forEach(pricing => {
      // 从模型配置中获取provider信息（pricing.modelId 现在是 ai_model_config.id）
      const configModel = models.find(m => m.id === pricing.modelId);
      let providerName: string;
      let providerDisplayName: string;
      let providerId: number | null = null;
      
      if (configModel) {
        providerName = configModel.provider.toLowerCase();
        providerDisplayName = configModel.provider.toUpperCase();
        // 通过provider名称查找provider对象
        const provider = providers.find(p => p.name.toLowerCase() === providerName);
        if (provider) {
          providerId = provider.id;
          providerDisplayName = provider.displayName;
        }
      }
      
      // 如果都找不到，使用默认值
      if (!providerName) {
        providerName = 'unknown';
        providerDisplayName = '未知提供商';
      }
      
      // 查找对应的provider对象
      const provider = providerId 
        ? providers.find(p => p.id === providerId)
        : providers.find(p => p.name.toLowerCase() === providerName);
      
      const providerKey = provider ? provider.id.toString() : providerName;
      const providerDisplay = provider || { 
        name: providerName, 
        displayName: providerDisplayName,
        enabled: true 
      };
      
      if (!grouped[providerKey]) {
        grouped[providerKey] = { provider: providerDisplay, pricings: [] };
      }
      grouped[providerKey].pricings.push(pricing);
    });
    
    // 按提供商排序：doubao 和 dashscope 排在最前面
    const getProviderPriority = (providerName: string): number => {
      const name = providerName.toLowerCase();
      if (name === 'doubao') return 1;
      if (name === 'dashscope') return 2;
      return 999; // 其他提供商排在后面
    };
    
    return Object.values(grouped).sort((a, b) => {
      const nameA = ('name' in a.provider ? a.provider.name : '').toLowerCase();
      const nameB = ('name' in b.provider ? b.provider.name : '').toLowerCase();
      const priorityA = getProviderPriority(nameA);
      const priorityB = getProviderPriority(nameB);
      
      // 如果优先级不同，按优先级排序
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // 如果优先级相同，按显示名称排序
      const displayNameA = 'displayName' in a.provider ? a.provider.displayName : a.provider.name;
      const displayNameB = 'displayName' in b.provider ? b.provider.displayName : b.provider.name;
      return displayNameA.localeCompare(displayNameB);
    });
  };

  if (editingPricing !== null || isCreating) {
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
                  {model.modelName} ({model.provider.toUpperCase()}) - {model.capability}
                </option>
              ))}
            </select>
          </InputGroup>

          <InputGroup label="计费类型 *">
            <select
              value={formData.pricingType}
              onChange={(e) => {
                const type = e.target.value;
                let defaultUnit = 'per_1k_tokens';
                if (type === 'image') {
                  defaultUnit = 'per_image';
                } else if (type === 'audio_tts') {
                  defaultUnit = 'per_10k_chars';
                } else if (type === 'video_second') {
                  defaultUnit = 'per_second';
                }
                setFormData({
                  ...formData,
                  pricingType: type,
                  unit: defaultUnit,
                  videoResolution: type === 'video_second' ? '720p' : '',
                });
              }}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="input_token">输入Token</option>
              <option value="output_token">输出Token</option>
              <option value="image">图片生成</option>
              <option value="audio_tts">语音合成</option>
              <option value="video_second">视频生成</option>
            </select>
          </InputGroup>

          {/* 单位选择（文本Token类型） */}
          {(formData.pricingType === 'input_token' || formData.pricingType === 'output_token') && (
            <InputGroup label="计费单位 *">
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="per_1k_tokens">每千token（元/千token）</option>
                <option value="per_1m_tokens">每百万token（元/百万token）</option>
              </select>
            </InputGroup>
          )}

          {/* 视频分辨率选择（视频类型） */}
          {formData.pricingType === 'video_second' && (
            <InputGroup label="视频分辨率 *">
              <select
                value={formData.videoResolution}
                onChange={(e) => setFormData({ ...formData, videoResolution: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="720p">720P</option>
                <option value="1080p">1080P</option>
              </select>
            </InputGroup>
          )}

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="单价 *">
              <TextInput
                type="number"
                step="0.000001"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="0.002"
              />
              <p className="text-xs text-slate-500 mt-1">
                格式：元/{getUnitDisplayName(formData.unit, formData.pricingType)}
              </p>
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
          {groupPricingsByProvider().map(({ provider, pricings: providerPricings }, index) => {
            const providerKey = 'id' in provider ? provider.id : provider.name;
            const displayName = 'displayName' in provider ? provider.displayName : provider.name;
            const enabled = 'enabled' in provider ? provider.enabled : true;
            
            return (
            <div key={providerKey || index} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-6 py-3 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-100">{displayName}</h3>
                  {enabled !== undefined && (
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${
                      enabled
                        ? 'bg-green-900/50 text-green-300 border border-green-700'
                        : 'bg-red-900/50 text-red-300 border border-red-700'
                    }`}>
                      {enabled ? '启用' : '禁用'}
                    </span>
                  )}
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
                          ¥{pricing.unitPrice.toFixed(6)} / {getUnitDisplayName(pricing.unit, pricing.pricingType)}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

