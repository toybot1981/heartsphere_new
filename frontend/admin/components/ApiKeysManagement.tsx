import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { apiKeysApi, type ApiKey, type CreateApiKeyRequest } from '../../services/api/admin/apiKeys';
import { Button } from '../../components/Button';
import { InputGroup, TextInput } from './AdminUIComponents';
import { showAlert } from '../../utils/dialog';

interface ApiKeysManagementProps {
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const ApiKeysManagement: React.FC<ApiKeysManagementProps> = ({
    adminToken,
    onReload,
}) => {
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createdApiKey, setCreatedApiKey] = useState<ApiKey | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
    
    // 表单数据
    const [formData, setFormData] = useState<CreateApiKeyRequest>({
        keyName: '',
        userId: undefined,
        expiresAt: '',
        rateLimit: undefined,
        description: '',
    });

    // 加载API Key列表
    const loadApiKeys = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const data = await apiKeysApi.getAll(adminToken);
            setApiKeys(data);
        } catch (error: any) {
            console.error('加载API Key列表失败:', error);
            showAlert('加载API Key列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApiKeys();
    }, [adminToken]);

    // 重置表单
    const resetForm = () => {
        setFormData({
            keyName: '',
            userId: undefined,
            expiresAt: '',
            rateLimit: undefined,
            description: '',
        });
        setShowCreateForm(false);
        setCreatedApiKey(null);
    };

    // 创建API Key
    const handleCreate = async () => {
        if (!adminToken) return;
        if (!formData.keyName.trim()) {
            showAlert('请输入API Key名称', '缺少参数', 'warning');
            return;
        }

        try {
            const data: CreateApiKeyRequest = {
                keyName: formData.keyName.trim(),
                userId: formData.userId || undefined,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
                rateLimit: formData.rateLimit || undefined,
                description: formData.description || undefined,
            };
            const created = await apiKeysApi.create(data, adminToken);
            setCreatedApiKey(created);
            showAlert('API Key创建成功！请务必保存完整的Key，创建后只显示一次。', '创建成功', 'success');
            await loadApiKeys();
            resetForm();
        } catch (error: any) {
            showAlert('创建失败: ' + (error.message || '未知错误'), '创建失败', 'error');
        }
    };

    // 启用/禁用API Key
    const handleToggle = async (id: number, currentStatus: boolean) => {
        if (!adminToken) return;
        try {
            await apiKeysApi.toggle(id, !currentStatus, adminToken);
            showAlert(`API Key已${!currentStatus ? '启用' : '禁用'}`, '操作成功', 'success');
            await loadApiKeys();
        } catch (error: any) {
            showAlert('操作失败: ' + (error.message || '未知错误'), '操作失败', 'error');
        }
    };

    // 删除API Key
    const handleDelete = async (id: number, keyName: string) => {
        if (!adminToken) return;
        if (!confirm(`确定要删除API Key "${keyName}" 吗？此操作不可恢复。`)) {
            return;
        }
        try {
            await apiKeysApi.delete(id, adminToken);
            showAlert('API Key已删除', '删除成功', 'success');
            await loadApiKeys();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    // 复制API Key
    const copyApiKey = (apiKey: string) => {
        navigator.clipboard.writeText(apiKey).then(() => {
            showAlert('已复制到剪贴板', '复制成功', 'success');
        }).catch(() => {
            showAlert('复制失败，请手动复制: ' + apiKey, '复制失败', 'error');
        });
    };

    // 筛选API Key
    const filteredKeys = apiKeys.filter((key) => {
        if (filter === 'all') return true;
        if (filter === 'active') return key.isActive && (!key.expiresAt || new Date(key.expiresAt) >= new Date());
        if (filter === 'inactive') return !key.isActive;
        if (filter === 'expired') return key.expiresAt && new Date(key.expiresAt) < new Date();
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* 创建API Key表单 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-100">创建API Key</h3>
                    {!showCreateForm && (
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            新建API Key
                        </Button>
                    )}
                </div>

                {showCreateForm && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="Key名称 *" required>
                                <TextInput
                                    value={formData.keyName}
                                    onChange={(e) => setFormData({ ...formData, keyName: e.target.value })}
                                    placeholder="例如：外部系统A"
                                />
                            </InputGroup>
                            <InputGroup label="关联用户ID（可选）">
                                <TextInput
                                    type="number"
                                    value={formData.userId || ''}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value ? parseInt(e.target.value) : undefined })}
                                    placeholder="留空则不关联用户"
                                />
                            </InputGroup>
                            <InputGroup label="过期时间（可选）">
                                <TextInput
                                    type="datetime-local"
                                    value={formData.expiresAt}
                                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                />
                            </InputGroup>
                            <InputGroup label="速率限制（可选，每分钟请求数）">
                                <TextInput
                                    type="number"
                                    value={formData.rateLimit || ''}
                                    onChange={(e) => setFormData({ ...formData, rateLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                                    placeholder="留空则不限制"
                                />
                            </InputGroup>
                        </div>
                        <InputGroup label="描述（可选）">
                            <TextInput
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="API Key的用途说明"
                            />
                        </InputGroup>
                        <div className="flex gap-2">
                            <Button
                                onClick={handleCreate}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                创建
                            </Button>
                            <Button
                                onClick={resetForm}
                                className="bg-slate-700 hover:bg-slate-600"
                            >
                                取消
                            </Button>
                        </div>
                    </div>
                )}

                {/* 显示刚创建的API Key */}
                {createdApiKey && createdApiKey.apiKey && (
                    <div className="mt-4 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <p className="text-yellow-400 font-bold mb-2">⚠️ 请务必保存此API Key，创建后只显示一次！</p>
                        <div className="flex items-center gap-2">
                            <code className="flex-1 p-2 bg-slate-800 text-slate-100 font-mono text-sm rounded break-all">
                                {createdApiKey.apiKey}
                            </code>
                            <Button
                                onClick={() => copyApiKey(createdApiKey.apiKey)}
                                className="bg-yellow-600 hover:bg-yellow-700"
                            >
                                复制
                            </Button>
                        </div>
                        <p className="text-slate-400 text-sm mt-2">Key名称: {createdApiKey.keyName}</p>
                    </div>
                )}
            </div>

            {/* API Key列表 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-100">API Key列表</h3>
                    <div className="flex gap-2">
                        {/* 筛选按钮 */}
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                filter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            全部
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                filter === 'active'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            启用
                        </button>
                        <button
                            onClick={() => setFilter('inactive')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                filter === 'inactive'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            禁用
                        </button>
                        <button
                            onClick={() => setFilter('expired')}
                            className={`px-3 py-1 text-sm rounded transition-colors ${
                                filter === 'expired'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                        >
                            已过期
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center text-slate-500 py-8">加载中...</div>
                    ) : filteredKeys.length === 0 ? (
                        <div className="text-center text-slate-500 py-8">
                            {apiKeys.length === 0
                                ? '暂无API Key，请先创建'
                                : `没有${filter === 'all' ? '' : filter === 'active' ? '启用' : filter === 'inactive' ? '禁用' : '已过期'}的API Key`}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">Key名称</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">API Key</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">状态</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">关联用户</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">使用次数</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">最后使用</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">过期时间</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-bold uppercase">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredKeys.map((key) => {
                                    const isExpired = key.expiresAt && new Date(key.expiresAt) < new Date();
                                    const status = !key.isActive ? '已禁用' : isExpired ? '已过期' : '启用中';
                                    const statusColor = !key.isActive ? 'text-red-400' : isExpired ? 'text-yellow-400' : 'text-green-400';
                                    return (
                                        <tr key={key.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                            <td className="py-3 px-4 text-slate-200 font-medium">{key.keyName}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-slate-400 font-mono text-xs flex-1 break-all">
                                                        {key.apiKey && key.apiKey.length > 30 
                                                            ? `${key.apiKey.substring(0, 12)}...${key.apiKey.substring(key.apiKey.length - 8)}`
                                                            : key.apiKey || 'hs_...'}
                                                    </code>
                                                    <button
                                                        onClick={() => {
                                                            if (key.apiKey) {
                                                                copyApiKey(key.apiKey);
                                                            }
                                                        }}
                                                        className="text-slate-400 hover:text-indigo-400 text-xs px-2 py-1 rounded hover:bg-slate-800 transition-colors whitespace-nowrap"
                                                        title="复制完整API Key"
                                                    >
                                                        📋 复制
                                                    </button>
                                                </div>
                                            </td>
                                            <td className={`py-3 px-4 ${statusColor} font-bold`}>{status}</td>
                                            <td className="py-3 px-4 text-slate-400">
                                                {key.userId ? `用户 #${key.userId}` : '-'}
                                            </td>
                                            <td className="py-3 px-4 text-slate-400">{key.usageCount}</td>
                                            <td className="py-3 px-4 text-slate-400">
                                                {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString('zh-CN') : '-'}
                                            </td>
                                            <td className={`py-3 px-4 ${isExpired ? 'text-red-400' : 'text-slate-400'}`}>
                                                {key.expiresAt ? new Date(key.expiresAt).toLocaleString('zh-CN') : '永不过期'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleToggle(key.id, key.isActive)}
                                                        className={`px-2 py-1 text-xs rounded transition-colors ${
                                                            key.isActive
                                                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                                                : 'bg-green-600 hover:bg-green-700 text-white'
                                                        }`}
                                                    >
                                                        {key.isActive ? '禁用' : '启用'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(key.id, key.keyName)}
                                                        className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded transition-colors"
                                                    >
                                                        删除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

