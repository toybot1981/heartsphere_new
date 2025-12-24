/**
 * 资源池管理组件
 */
import React, { useState, useEffect } from 'react';
import { billingApi, ProviderResourcePool, ResourcePoolRecharge, BillingAlert, AIProvider } from '../../../services/api/billing';
import { Button } from '../../../components/Button';
import { InputGroup, TextInput } from '../AdminUIComponents';
import { showAlert, showConfirm } from '../../../utils/dialog';

interface ResourcePoolManagementProps {
  adminToken: string | null;
  onReload?: () => void;
}

export const ResourcePoolManagement: React.FC<ResourcePoolManagementProps> = ({
  adminToken,
  onReload,
}) => {
  const [pools, setPools] = useState<ProviderResourcePool[]>([]);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [alerts, setAlerts] = useState<BillingAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargeRemark, setRechargeRemark] = useState('');

  useEffect(() => {
    loadData();
  }, [adminToken]);

  const loadData = async () => {
    if (!adminToken) return;
    setLoading(true);
    try {
      const [poolsData, providersData, alertsData] = await Promise.all([
        billingApi.resourcePool.getAll(adminToken),
        billingApi.providers.getAll(adminToken),
        billingApi.resourcePool.getAlerts(adminToken, { isResolved: false }),
      ]);
      setPools(poolsData);
      setProviders(providersData);
      setAlerts(alertsData);
    } catch (error: any) {
      showAlert('加载失败: ' + (error.message || '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (providerId: number) => {
    if (!adminToken) return;
    if (!rechargeAmount || parseFloat(rechargeAmount) <= 0) {
      showAlert('请输入有效的充值金额', '参数错误', 'warning');
      return;
    }

    try {
      await billingApi.resourcePool.recharge(providerId, {
        amount: parseFloat(rechargeAmount),
        remark: rechargeRemark,
      }, adminToken);
      await loadData();
      setRechargeAmount('');
      setRechargeRemark('');
      setSelectedProviderId(null);
      showAlert('充值成功', '操作成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('充值失败: ' + (error.message || '未知错误'), '充值失败', 'error');
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    if (!adminToken) return;
    try {
      await billingApi.resourcePool.resolveAlert(alertId, {}, adminToken);
      await loadData();
      showAlert('提醒已标记为已解决', '操作成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('操作失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const handleManualCheck = async () => {
    if (!adminToken) return;
    try {
      await billingApi.resourcePool.check(adminToken);
      await loadData();
      showAlert('资源池检查已完成', '操作成功', 'success');
      onReload?.();
    } catch (error: any) {
      showAlert('检查失败: ' + (error.message || '未知错误'), '操作失败', 'error');
    }
  };

  const getProviderName = (providerId: number) => {
    return providers.find(p => p.id === providerId)?.displayName || '未知';
  };

  const calculatePercentage = (pool: ProviderResourcePool) => {
    if (pool.totalBalance === 0) return 0;
    return (pool.availableBalance / pool.totalBalance) * 100;
  };

  const getBalanceStatus = (pool: ProviderResourcePool) => {
    const percentage = calculatePercentage(pool);
    if (percentage <= 0) return { label: '余额不足', color: 'text-red-400', bg: 'bg-red-900/50', border: 'border-red-700' };
    if (percentage < pool.warningThreshold) return { label: '余额不足', color: 'text-yellow-400', bg: 'bg-yellow-900/50', border: 'border-yellow-700' };
    return { label: '余额充足', color: 'text-green-400', bg: 'bg-green-900/50', border: 'border-green-700' };
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-400">加载中...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">资源池管理</h2>
          <p className="text-sm text-slate-400 mt-1">监控和管理各供应商的资源池余额</p>
        </div>
        <Button onClick={handleManualCheck}>手动检查</Button>
      </div>

      {/* 资费提醒 */}
      {alerts.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-xl p-4">
          <h3 className="text-lg font-bold text-yellow-300 mb-3">⚠️ 资费提醒</h3>
          <div className="space-y-2">
            {alerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                <div className="flex-1">
                  <p className="text-sm text-slate-200">
                    <span className="font-semibold">{getProviderName(alert.providerId)}</span>
                    {' - '}
                    {alert.message || `余额仅剩 ${alert.balancePercentage.toFixed(2)}%`}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(alert.createdAt).toLocaleString('zh-CN')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => handleResolveAlert(alert.id)}
                  className="text-sm"
                >
                  标记已解决
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 资源池列表 */}
      <div className="space-y-4">
        {pools.map(pool => {
          const percentage = calculatePercentage(pool);
          const status = getBalanceStatus(pool);
          const provider = providers.find(p => p.id === pool.providerId);

          return (
            <div key={pool.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
              <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">
                      {provider?.displayName || '未知提供商'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      余额百分比: {percentage.toFixed(2)}% | 
                      可用余额: ¥{pool.availableBalance.toFixed(2)} | 
                      已使用: ¥{pool.usedAmount.toFixed(2)} | 
                      总余额: ¥{pool.totalBalance.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${status.bg} ${status.color} ${status.border} border`}>
                      {status.label}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedProviderId(selectedProviderId === pool.providerId ? null : pool.providerId)}
                    >
                      {selectedProviderId === pool.providerId ? '取消充值' : '充值'}
                    </Button>
                  </div>
                </div>

                {/* 余额进度条 */}
                <div className="mt-3">
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        percentage <= 0 ? 'bg-red-500' :
                        percentage < pool.warningThreshold ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* 充值表单 */}
              {selectedProviderId === pool.providerId && (
                <div className="p-6 bg-slate-800/50 border-t border-slate-700">
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="充值金额（元）*">
                      <TextInput
                        type="number"
                        step="0.01"
                        value={rechargeAmount}
                        onChange={(e) => setRechargeAmount(e.target.value)}
                        placeholder="1000.00"
                      />
                    </InputGroup>
                    <InputGroup label="备注">
                      <TextInput
                        value={rechargeRemark}
                        onChange={(e) => setRechargeRemark(e.target.value)}
                        placeholder="充值备注（可选）"
                      />
                    </InputGroup>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={() => handleRecharge(pool.providerId)}>确认充值</Button>
                    <Button variant="ghost" onClick={() => {
                      setSelectedProviderId(null);
                      setRechargeAmount('');
                      setRechargeRemark('');
                    }}>取消</Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {pools.length === 0 && (
        <div className="bg-slate-900 p-12 rounded-xl border border-slate-800 text-center">
          <p className="text-slate-400">暂无资源池数据</p>
        </div>
      )}
    </div>
  );
};

