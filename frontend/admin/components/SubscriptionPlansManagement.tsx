import React, { useState } from 'react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/Button';
import { InputGroup, TextInput } from './AdminUIComponents';
import { useAdminState } from '../contexts/AdminStateContext';
import { useAdminData } from '../hooks/useAdminData';
import { showAlert, showConfirm } from '../../utils/dialog';

interface SubscriptionPlansManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const SubscriptionPlansManagement: React.FC<SubscriptionPlansManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const { editingPlan, setEditingPlan, planFormData, setPlanFormData } = useAdminState();
    const { subscriptionPlans, loadSystemData } = useAdminData(adminToken);

    const handleCreate = () => {
        setPlanFormData({
            name: '',
            type: 'basic',
            billingCycle: 'monthly',
            price: 0,
            originalPrice: null,
            discountPercent: 0,
            pointsPerMonth: 0,
            maxImagesPerMonth: 0,
            maxVideosPerMonth: 0,
            maxTextGenerationsPerMonth: -1,
            maxAudioGenerationsPerMonth: 0,
            allowPriorityQueue: false,
            allowWatermarkRemoval: false,
            allowBatchProcessing: false,
            allowApiAccess: false,
            maxApiCallsPerDay: 0,
            isActive: true,
            sortOrder: (subscriptionPlans?.length || 0) + 1,
        });
        setEditingPlan({ id: null });
    };

    const handleEdit = (plan: any) => {
        setPlanFormData({ ...plan });
        setEditingPlan(plan);
    };

    const handleCancel = () => {
        setEditingPlan(null);
        setPlanFormData({});
    };

    const handleSave = async () => {
        if (!adminToken) return;
        if (!planFormData.name) {
            showAlert('请输入计划名称', '缺少参数', 'warning');
            return;
        }
        try {
            if (editingPlan?.id) {
                await adminApi.subscriptionPlans.update(editingPlan.id, planFormData, adminToken);
            } else {
                await adminApi.subscriptionPlans.create(planFormData, adminToken);
            }
            await loadSystemData(adminToken);
            handleCancel();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(`确定要删除订阅计划"${name}"吗？`, '删除订阅计划', 'danger');
        if (!confirmed) return;
        try {
            await adminApi.subscriptionPlans.delete(id, adminToken);
            await loadSystemData(adminToken);
            showAlert('删除成功', '操作成功', 'success');
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    if (editingPlan) {
        return (
            <div className="max-w-6xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-100">
                        {editingPlan.id ? '编辑订阅计划' : '新建订阅计划'}
                    </h3>
                    <Button variant="ghost" onClick={handleCancel}>取消</Button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputGroup label="计划名称 *">
                            <TextInput
                                value={planFormData.name || ''}
                                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                                placeholder="例如：基础版"
                            />
                        </InputGroup>
                        <InputGroup label="计划类型 *">
                            <select
                                value={planFormData.type || 'basic'}
                                onChange={(e) => setPlanFormData({ ...planFormData, type: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="free">免费版 (free)</option>
                                <option value="basic">基础版 (basic)</option>
                                <option value="standard">标准版 (standard)</option>
                                <option value="premium">高级版 (premium)</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="计费周期 *">
                            <select
                                value={planFormData.billingCycle || 'monthly'}
                                onChange={(e) => setPlanFormData({ ...planFormData, billingCycle: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="monthly">月付 (monthly)</option>
                                <option value="yearly">年付 (yearly)</option>
                                <option value="continuous_monthly">连续包月 (continuous_monthly)</option>
                                <option value="continuous_yearly">连续包年 (continuous_yearly)</option>
                            </select>
                        </InputGroup>
                        <InputGroup label="价格 *">
                            <TextInput
                                type="number"
                                step="0.01"
                                value={planFormData.price || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, price: parseFloat(e.target.value) || 0 })}
                                placeholder="0.00"
                            />
                        </InputGroup>
                        <InputGroup label="原价">
                            <TextInput
                                type="number"
                                step="0.01"
                                value={planFormData.originalPrice || ''}
                                onChange={(e) => setPlanFormData({ ...planFormData, originalPrice: e.target.value ? parseFloat(e.target.value) : null })}
                                placeholder="留空表示无原价"
                            />
                        </InputGroup>
                        <InputGroup label="折扣百分比">
                            <TextInput
                                type="number"
                                value={planFormData.discountPercent || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, discountPercent: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        </InputGroup>
                        <InputGroup label="每月积分">
                            <TextInput
                                type="number"
                                value={planFormData.pointsPerMonth || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, pointsPerMonth: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        </InputGroup>
                        <InputGroup label="每月图片生成数">
                            <TextInput
                                type="number"
                                value={planFormData.maxImagesPerMonth || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, maxImagesPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="0 或留空表示无限制"
                            />
                        </InputGroup>
                        <InputGroup label="每月视频生成数">
                            <TextInput
                                type="number"
                                value={planFormData.maxVideosPerMonth || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, maxVideosPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="0 或留空表示无限制"
                            />
                        </InputGroup>
                        <InputGroup label="每月文本生成数">
                            <TextInput
                                type="number"
                                value={planFormData.maxTextGenerationsPerMonth === -1 ? '' : (planFormData.maxTextGenerationsPerMonth || 0)}
                                onChange={(e) => setPlanFormData({ ...planFormData, maxTextGenerationsPerMonth: e.target.value ? parseInt(e.target.value) : -1 })}
                                placeholder="-1 表示无限制"
                            />
                        </InputGroup>
                        <InputGroup label="每月音频生成数">
                            <TextInput
                                type="number"
                                value={planFormData.maxAudioGenerationsPerMonth || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, maxAudioGenerationsPerMonth: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="0 或留空表示无限制"
                            />
                        </InputGroup>
                        <InputGroup label="每日API调用数">
                            <TextInput
                                type="number"
                                value={planFormData.maxApiCallsPerDay || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, maxApiCallsPerDay: e.target.value ? parseInt(e.target.value) : null })}
                                placeholder="0 或留空表示无限制"
                            />
                        </InputGroup>
                        <InputGroup label="排序顺序">
                            <TextInput
                                type="number"
                                value={planFormData.sortOrder || 0}
                                onChange={(e) => setPlanFormData({ ...planFormData, sortOrder: parseInt(e.target.value) || 0 })}
                                placeholder="0"
                            />
                        </InputGroup>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 flex-wrap">
                            <label className="flex items-center gap-2 text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={planFormData.allowPriorityQueue || false}
                                    onChange={(e) => setPlanFormData({ ...planFormData, allowPriorityQueue: e.target.checked })}
                                    className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                />
                                允许优先队列
                            </label>
                            <label className="flex items-center gap-2 text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={planFormData.allowWatermarkRemoval || false}
                                    onChange={(e) => setPlanFormData({ ...planFormData, allowWatermarkRemoval: e.target.checked })}
                                    className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                />
                                允许去除水印
                            </label>
                            <label className="flex items-center gap-2 text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={planFormData.allowBatchProcessing || false}
                                    onChange={(e) => setPlanFormData({ ...planFormData, allowBatchProcessing: e.target.checked })}
                                    className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                />
                                允许批量处理
                            </label>
                            <label className="flex items-center gap-2 text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={planFormData.allowApiAccess || false}
                                    onChange={(e) => setPlanFormData({ ...planFormData, allowApiAccess: e.target.checked })}
                                    className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                />
                                允许API访问
                            </label>
                            <label className="flex items-center gap-2 text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={planFormData.isActive !== false}
                                    onChange={(e) => setPlanFormData({ ...planFormData, isActive: e.target.checked })}
                                    className="rounded bg-slate-700 h-5 w-5 accent-indigo-500"
                                />
                                启用
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="ghost" onClick={handleCancel}>取消</Button>
                        <Button onClick={handleSave} className="bg-indigo-600">保存</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto bg-slate-900 p-6 rounded-xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-100">会员配置管理</h3>
                    <p className="text-slate-400 text-sm mt-1">
                        当前共有 {subscriptionPlans?.length || 0} 个订阅计划
                    </p>
                </div>
                <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                    + 新建订阅计划
                </Button>
            </div>
            {!subscriptionPlans || subscriptionPlans.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                    <p>暂无订阅计划</p>
                    <p className="text-xs mt-2">点击"新建订阅计划"按钮创建第一个计划</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {subscriptionPlans.map((plan: any) => (
                        <div key={plan.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h4 className="text-white font-bold">{plan.name}</h4>
                                    <p className="text-slate-400 text-sm mt-1">{plan.type} · {plan.billingCycle}</p>
                                    <p className="text-indigo-400 text-lg font-bold mt-2">¥{plan.price}</p>
                                    {plan.originalPrice && plan.originalPrice > plan.price && (
                                        <p className="text-slate-500 text-sm line-through">原价: ¥{plan.originalPrice}</p>
                                    )}
                                    {plan.discountPercent && plan.discountPercent > 0 && (
                                        <p className="text-green-400 text-sm">优惠: {plan.discountPercent}%</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-1 rounded ${plan.isActive ? 'bg-green-600/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                                        {plan.isActive ? '启用' : '禁用'}
                                    </span>
                                    <Button
                                        onClick={() => handleEdit(plan)}
                                        className="bg-blue-600 hover:bg-blue-700 text-sm"
                                    >
                                        编辑
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(plan.id, plan.name)}
                                        className="bg-red-600 hover:bg-red-700 text-sm"
                                    >
                                        删除
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

