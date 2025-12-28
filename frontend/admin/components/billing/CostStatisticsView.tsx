/**
 * 成本统计查看组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, AICostDaily, AIProvider } from '../../../services/api/billing';
import { adminApi } from '../../../services/api/admin';
import type { AIModelConfig } from '../../../services/api/admin/types';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert } from '../../../utils/dialog';

interface CostStatisticsViewProps {
  adminToken: string | null;
}

export const CostStatisticsView: React.FC<CostStatisticsViewProps> = ({
  adminToken,
}) => {
  const [stats, setStats] = useState<AICostDaily[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    providerId: '',
    modelId: '',
  });

  useEffect(() => {
    loadProvidersAndModels();
    loadStats();
  }, [adminToken]);

  const loadProvidersAndModels = async () => {
    if (!adminToken) return;
    try {
      const [providersData, modelsData] = await Promise.all([
        billingApi.providers.getAll(adminToken),
        adminApi.aiConfig.models.getAll(adminToken), // 从 ai_model_config 获取模型列表
      ]);
      setProviders(providersData);
      setModels(modelsData);
    } catch (error: any) {
      console.error('加载数据失败:', error);
    }
  };

  const loadStats = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const params: any = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.providerId) params.providerId = parseInt(filters.providerId);
      if (filters.modelId) params.modelId = parseInt(filters.modelId);

      const data = await billingApi.cost.getDailyStats(adminToken, params);
      setStats(data);
    } catch (error: any) {
      showAlert('加载失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleSearch = () => {
    loadStats();
  };

  const handleReset = () => {
    setFilters({
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      providerId: '',
      modelId: '',
    });
    setTimeout(loadStats, 100);
  };

  const handleAggregate = async () => {
    if (!adminToken) return;
    if (!confirm('确定要汇总最近30天的成本数据吗？这可能需要一些时间。')) {
      return;
    }
    try {
      setLoading(true);
      const result = await billingApi.cost.aggregate(adminToken, { days: 30 });
      if (result.success) {
        showAlert(result.message, '成功', 'success');
        // 汇总完成后重新加载统计数据
        setTimeout(loadStats, 1000);
      } else {
        showAlert(result.message || '汇总失败', '错误', 'error');
      }
    } catch (error: any) {
      showAlert('汇总失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProviderName = (providerId: number) => {
    return providers.find(p => p.id === providerId)?.displayName || `ID:${providerId}`;
  };

  const getModelName = (modelId: number) => {
    return models.find(m => m.id === modelId)?.modelName || `ID:${modelId}`;
  };

  const getUsageTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'text_generation': '文本生成',
      'image_generation': '图片生成',
      'audio_tts': '文本转语音',
      'audio_stt': '语音转文本',
      'video_generation': '视频生成',
    };
    return labels[type] || type;
  };

  // 计算汇总数据
  const totalCost = stats.reduce((sum, stat) => sum + stat.totalCost, 0);
  const totalUsage = stats.reduce((sum, stat) => sum + stat.totalUsage, 0);
  const totalCalls = stats.reduce((sum, stat) => sum + stat.callCount, 0);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">成本统计</h2>
        <p className="text-sm text-slate-400 mt-1">查看AI服务成本统计和分析</p>
      </div>

      {/* 筛选条件 */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
        <div className="grid grid-cols-4 gap-4 mb-4">
          <InputGroup label="开始日期">
            <TextInput
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </InputGroup>

          <InputGroup label="结束日期">
            <TextInput
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </InputGroup>

          <InputGroup label="提供商">
            <select
              value={filters.providerId}
              onChange={(e) => handleFilterChange('providerId', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="">全部</option>
              {providers.map(p => (
                <option key={p.id} value={p.id}>{p.displayName}</option>
              ))}
            </select>
          </InputGroup>

          <InputGroup label="模型">
            <select
              value={filters.modelId}
              onChange={(e) => handleFilterChange('modelId', e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            >
              <option value="">全部</option>
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.modelName}</option>
              ))}
            </select>
          </InputGroup>
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSearch}>查询</Button>
          <Button variant="ghost" onClick={handleReset}>重置</Button>
          <Button 
            variant="ghost" 
            onClick={handleAggregate}
            className="ml-auto"
            title="汇总最近30天的成本数据"
          >
            汇总数据
          </Button>
        </div>
      </div>

      {/* 汇总统计 */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">总成本</div>
          <div className="text-2xl font-bold text-red-400">¥{totalCost.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">总使用量</div>
          <div className="text-2xl font-bold text-blue-400">{totalUsage.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <div className="text-sm text-slate-400 mb-2">总调用次数</div>
          <div className="text-2xl font-bold text-green-400">{totalCalls.toLocaleString()}</div>
        </div>
      </div>

      {/* 统计列表 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : stats.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400">暂无统计数据</p>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">日期</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">提供商</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">使用类型</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">使用量</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">调用次数</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">成本</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {stats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-200">
                      {new Date(stat.statDate).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-200">{getProviderName(stat.providerId)}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">{getModelName(stat.modelId)}</td>
                    <td className="px-6 py-4 text-sm text-slate-200">{getUsageTypeLabel(stat.usageType)}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{stat.totalUsage.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{stat.callCount.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-slate-200 font-mono text-red-400">
                      ¥{stat.totalCost.toFixed(2)}
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

