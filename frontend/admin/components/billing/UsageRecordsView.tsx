/**
 * 使用记录查看组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, AIUsageRecord, AIProvider, AIModel } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert } from '../../../utils/dialog';

interface UsageRecordsViewProps {
  adminToken: string | null;
}

export const UsageRecordsView: React.FC<UsageRecordsViewProps> = ({
  adminToken,
}) => {
  const [records, setRecords] = useState<AIUsageRecord[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({
    userId: '',
    providerId: '',
    modelId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadProvidersAndModels();
    loadRecords();
  }, [adminToken, page]);

  const loadProvidersAndModels = async () => {
    if (!adminToken) return;
    try {
      const [providersData, modelsData] = await Promise.all([
        billingApi.providers.getAll(adminToken),
        billingApi.models.getAll(adminToken),
      ]);
      setProviders(providersData);
      setModels(modelsData);
    } catch (error: any) {
      console.error('加载数据失败:', error);
    }
  };

  const loadRecords = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const params: any = {
        page,
        size: 20,
      };
      if (filters.userId) params.userId = parseInt(filters.userId);
      if (filters.providerId) params.providerId = parseInt(filters.providerId);
      if (filters.modelId) params.modelId = parseInt(filters.modelId);
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const data = await billingApi.usage.getRecords(adminToken, params);
      setRecords(data.records);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
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
    setPage(0);
    loadRecords();
  };

  const handleReset = () => {
    setFilters({
      userId: '',
      providerId: '',
      modelId: '',
      startDate: '',
      endDate: '',
    });
    setPage(0);
    setTimeout(loadRecords, 100);
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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">使用记录查询</h2>
        <p className="text-sm text-slate-400 mt-1">查看AI服务使用记录和计费情况</p>
      </div>

      {/* 筛选条件 */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
        <div className="grid grid-cols-5 gap-4 mb-4">
          <InputGroup label="用户ID">
            <TextInput
              type="number"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              placeholder="用户ID"
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
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSearch}>查询</Button>
          <Button variant="ghost" onClick={handleReset}>重置</Button>
        </div>
      </div>

      {/* 统计信息 */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6">
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-slate-400">总记录数：</span>
            <span className="text-slate-200 font-bold">{totalElements}</span>
          </div>
          <div>
            <span className="text-slate-400">总页数：</span>
            <span className="text-slate-200 font-bold">{totalPages}</span>
          </div>
          <div>
            <span className="text-slate-400">当前页：</span>
            <span className="text-slate-200 font-bold">{page + 1}</span>
          </div>
        </div>
      </div>

      {/* 记录列表 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">加载中...</div>
      ) : records.length === 0 ? (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400">暂无使用记录</p>
        </div>
      ) : (
        <>
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800 border-b border-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">用户ID</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">提供商</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">模型</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">使用类型</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Token使用</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">费用</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-300">{record.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">{record.userId}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{getProviderName(record.providerId)}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{getModelName(record.modelId)}</td>
                      <td className="px-6 py-4 text-sm text-slate-200">{getUsageTypeLabel(record.usageType)}</td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {record.totalTokens > 0 && (
                          <span>输入:{record.inputTokens} 输出:{record.outputTokens} 总计:{record.totalTokens}</span>
                        )}
                        {record.imageCount > 0 && <span>图片:{record.imageCount}</span>}
                        {record.audioDuration > 0 && <span>音频:{record.audioDuration}秒</span>}
                        {record.videoDuration > 0 && <span>视频:{record.videoDuration}秒</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200 font-mono">
                        ¥{record.costAmount.toFixed(6)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${
                          record.status === 'success'
                            ? 'bg-green-900/50 text-green-300 border border-green-700'
                            : 'bg-red-900/50 text-red-300 border border-red-700'
                        }`}>
                          {record.status === 'success' ? '成功' : '失败'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(record.createdAt).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="ghost"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                上一页
              </Button>
              <span className="text-sm text-slate-400">
                第 {page + 1} / {totalPages} 页
              </span>
              <Button
                variant="ghost"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

