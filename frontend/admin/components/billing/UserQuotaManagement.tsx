/**
 * 用户配额管理组件
 */
import React, { useState } from 'react';
import { billingApi, UserTokenQuota } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert, showConfirm } from '../../../utils/dialog';

interface UserQuotaManagementProps {
  adminToken: string | null;
}

export const UserQuotaManagement: React.FC<UserQuotaManagementProps> = ({
  adminToken,
}) => {
  const [userId, setUserId] = useState('');
  const [quota, setQuota] = useState<UserTokenQuota | null>(null);
  const [loading, setLoading] = useState(false);
  const [grantForm, setGrantForm] = useState({
    quotaType: 'text_token',
    amount: '0',
    source: 'admin_grant',
    description: '',
  });

  const handleLoadQuota = async () => {
    if (!adminToken || !userId) {
      showAlert('请输入用户ID', '缺少参数', 'warning');
      return;
    }

    setLoading(true);
    try {
      const data = await billingApi.quota.getUserQuota(parseInt(userId), adminToken);
      setQuota(data);
    } catch (error: any) {
      showAlert('加载失败: ' + (error.message || '未知错误'), '错误', 'error');
      setQuota(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantQuota = async () => {
    if (!adminToken || !userId) {
      showAlert('请输入用户ID', '缺少参数', 'warning');
      return;
    }

    const amount = parseFloat(grantForm.amount);
    if (!amount || amount <= 0) {
      showAlert('请输入有效的配额数量', '参数错误', 'warning');
      return;
    }

    const confirmed = await showConfirm(
      `确定要为用户 ${userId} 分配 ${grantForm.quotaType} 配额 ${amount} 吗？`,
      '分配配额',
      'info'
    );
    if (!confirmed) return;

    try {
      await billingApi.quota.grantQuota(parseInt(userId), {
        quotaType: grantForm.quotaType,
        amount: Math.floor(amount),
        source: grantForm.source,
        description: grantForm.description || '管理员手动分配',
      }, adminToken);
      
      showAlert('配额分配成功', '成功', 'success');
      await handleLoadQuota();
      setGrantForm({
        quotaType: 'text_token',
        amount: '0',
        source: 'admin_grant',
        description: '',
      });
    } catch (error: any) {
      showAlert('分配失败: ' + (error.message || '未知错误'), '分配失败', 'error');
    }
  };

  const getQuotaTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'text_token': '文本Token',
      'image': '图片生成',
      'audio': '音频处理',
      'video': '视频生成',
    };
    return labels[type] || type;
  };

  const getAvailableQuota = (type: string) => {
    if (!quota) return 0;
    switch (type) {
      case 'text_token':
        return (quota.textTokenMonthlyQuota - quota.textTokenMonthlyUsed) +
               (quota.textTokenTotal - quota.textTokenUsed);
      case 'image':
        return (quota.imageQuotaMonthly - quota.imageQuotaMonthlyUsed) +
               (quota.imageQuotaTotal - quota.imageQuotaUsed);
      case 'audio':
        return (quota.audioQuotaMonthly - quota.audioQuotaMonthlyUsed) +
               (quota.audioQuotaTotal - quota.audioQuotaUsed);
      case 'video':
        return (quota.videoQuotaMonthly - quota.videoQuotaMonthlyUsed) +
               (quota.videoQuotaTotal - quota.videoQuotaUsed);
      default:
        return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-100">用户配额管理</h2>
        <p className="text-sm text-slate-400 mt-1">查询和管理用户Token配额</p>
      </div>

      {/* 用户查询 */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
        <div className="flex gap-4 items-end">
          <InputGroup label="用户ID">
            <TextInput
              type="number"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="请输入用户ID"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLoadQuota();
                }
              }}
            />
          </InputGroup>
          <Button onClick={handleLoadQuota} disabled={loading || !userId}>
            {loading ? '查询中...' : '查询配额'}
          </Button>
        </div>
      </div>

      {/* 配额显示 */}
      {quota && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-6">
          <h3 className="text-lg font-bold text-slate-100 mb-4">用户 {userId} 的配额详情</h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* 文本Token配额 */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm font-bold text-slate-400 mb-3">文本Token配额</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">月度配额：</span>
                  <span className="text-slate-200">{quota.textTokenMonthlyQuota.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">月度已用：</span>
                  <span className="text-slate-200">{quota.textTokenMonthlyUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久配额：</span>
                  <span className="text-slate-200">{quota.textTokenTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久已用：</span>
                  <span className="text-slate-200">{quota.textTokenUsed.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-300 font-bold">可用：</span>
                  <span className="text-green-400 font-bold">{getAvailableQuota('text_token').toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 图片配额 */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm font-bold text-slate-400 mb-3">图片生成配额</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">月度配额：</span>
                  <span className="text-slate-200">{quota.imageQuotaMonthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">月度已用：</span>
                  <span className="text-slate-200">{quota.imageQuotaMonthlyUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久配额：</span>
                  <span className="text-slate-200">{quota.imageQuotaTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久已用：</span>
                  <span className="text-slate-200">{quota.imageQuotaUsed}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-300 font-bold">可用：</span>
                  <span className="text-green-400 font-bold">{getAvailableQuota('image')}</span>
                </div>
              </div>
            </div>

            {/* 音频配额 */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm font-bold text-slate-400 mb-3">音频处理配额（分钟）</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">月度配额：</span>
                  <span className="text-slate-200">{quota.audioQuotaMonthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">月度已用：</span>
                  <span className="text-slate-200">{quota.audioQuotaMonthlyUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久配额：</span>
                  <span className="text-slate-200">{quota.audioQuotaTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久已用：</span>
                  <span className="text-slate-200">{quota.audioQuotaUsed}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-300 font-bold">可用：</span>
                  <span className="text-green-400 font-bold">{getAvailableQuota('audio')}</span>
                </div>
              </div>
            </div>

            {/* 视频配额 */}
            <div className="bg-slate-800 p-4 rounded-lg">
              <div className="text-sm font-bold text-slate-400 mb-3">视频生成配额（秒）</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">月度配额：</span>
                  <span className="text-slate-200">{quota.videoQuotaMonthly}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">月度已用：</span>
                  <span className="text-slate-200">{quota.videoQuotaMonthlyUsed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久配额：</span>
                  <span className="text-slate-200">{quota.videoQuotaTotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">永久已用：</span>
                  <span className="text-slate-200">{quota.videoQuotaUsed}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-slate-300 font-bold">可用：</span>
                  <span className="text-green-400 font-bold">{getAvailableQuota('video')}</span>
                </div>
              </div>
            </div>
          </div>

          {quota.lastResetDate && (
            <div className="mt-4 text-sm text-slate-400">
              上次重置日期：{new Date(quota.lastResetDate).toLocaleDateString('zh-CN')}
            </div>
          )}
        </div>
      )}

      {/* 配额分配 */}
      {quota && (
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-lg font-bold text-slate-100 mb-4">分配配额</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="配额类型 *">
              <select
                value={grantForm.quotaType}
                onChange={(e) => setGrantForm({ ...grantForm, quotaType: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="text_token">文本Token</option>
                <option value="image">图片生成</option>
                <option value="audio">音频处理</option>
                <option value="video">视频生成</option>
              </select>
            </InputGroup>

            <InputGroup label="分配数量 *">
              <TextInput
                type="number"
                value={grantForm.amount}
                onChange={(e) => setGrantForm({ ...grantForm, amount: e.target.value })}
                placeholder="请输入配额数量"
              />
            </InputGroup>

            <InputGroup label="来源">
              <select
                value={grantForm.source}
                onChange={(e) => setGrantForm({ ...grantForm, source: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="admin_grant">管理员授予</option>
                <option value="membership">会员订阅</option>
                <option value="purchase">Token包购买</option>
              </select>
            </InputGroup>

            <InputGroup label="描述">
              <TextInput
                value={grantForm.description}
                onChange={(e) => setGrantForm({ ...grantForm, description: e.target.value })}
                placeholder="分配说明（可选）"
              />
            </InputGroup>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={handleGrantQuota}>分配配额</Button>
          </div>
        </div>
      )}
    </div>
  );
};

