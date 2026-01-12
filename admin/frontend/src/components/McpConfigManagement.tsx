import React, { useState, useEffect } from 'react';
import { mentisMcpApi, McpConfigDTO } from '../services/api/admin';
// Button component - simple implementation
const Button: React.FC<{
    onClick?: () => void;
    type?: 'button' | 'submit';
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md';
    children: React.ReactNode;
}> = ({ onClick, type = 'button', variant = 'primary', size = 'md', children }) => {
    const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
    const variantClasses = variant === 'primary' 
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-slate-700 hover:bg-slate-600 text-slate-300';
    const sizeClasses = size === 'sm' ? 'px-2 py-1 text-sm' : '';
    
    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClasses} ${variantClasses} ${sizeClasses}`}
        >
            {children}
        </button>
    );
};

export const McpConfigManagement: React.FC = () => {
    const [configs, setConfigs] = useState<McpConfigDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingConfig, setEditingConfig] = useState<McpConfigDTO | null>(null);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadConfigs();
    }, []);

    const loadConfigs = async () => {
        try {
            setLoading(true);
            const data = await mentisMcpApi.getConfigs();
            setConfigs(data);
        } catch (error) {
            console.error('Failed to load MCP configs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingConfig({
            name: '',
            serverType: '',
            serverUrl: '',
            enabled: true,
        });
        setShowForm(true);
    };

    const handleEdit = (config: McpConfigDTO) => {
        setEditingConfig(config);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('确定要删除这个 MCP 配置吗？')) {
            return;
        }
        try {
            await mentisMcpApi.deleteConfig(id);
            await loadConfigs();
        } catch (error) {
            console.error('Failed to delete config:', error);
            alert('删除失败');
        }
    };

    const handleTest = async (id: number) => {
        try {
            const result = await mentisMcpApi.testConnection(id);
            alert(result.success ? '连接测试成功' : '连接测试失败');
            await loadConfigs();
        } catch (error) {
            console.error('Failed to test connection:', error);
            alert('测试失败');
        }
    };

    const handleSave = async (config: McpConfigDTO) => {
        try {
            if (config.id) {
                await mentisMcpApi.updateConfig(config.id, config);
            } else {
                await mentisMcpApi.createConfig(config);
            }
            setShowForm(false);
            setEditingConfig(null);
            await loadConfigs();
        } catch (error) {
            console.error('Failed to save config:', error);
            alert('保存失败');
        }
    };

    const maskApiKey = (key?: string) => {
        if (!key) return '';
        if (key.length <= 8) return '****';
        return key.substring(0, 4) + '****' + key.substring(key.length - 4);
    };

    if (loading) {
        return <div className="text-white">加载中...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">MCP 服务器配置</h2>
                <Button onClick={handleCreate}>创建配置</Button>
            </div>

            {showForm && editingConfig && (
                <McpConfigForm
                    config={editingConfig}
                    onSave={handleSave}
                    onCancel={() => {
                        setShowForm(false);
                        setEditingConfig(null);
                    }}
                />
            )}

            <div className="bg-slate-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                名称
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                类型
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                状态
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        {configs.map((config) => (
                            <tr key={config.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                    {config.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {config.serverType}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs ${
                                            config.enabled
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-red-500/20 text-red-400'
                                        }`}
                                    >
                                        {config.enabled ? '启用' : '禁用'}
                                    </span>
                                    {config.connectionStatus && (
                                        <span className="ml-2 text-xs text-slate-400">
                                            ({config.connectionStatus})
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => handleTest(config.id!)}
                                        className="text-blue-400 hover:text-blue-300"
                                    >
                                        测试
                                    </button>
                                    <button
                                        onClick={() => handleEdit(config)}
                                        className="text-yellow-400 hover:text-yellow-300"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDelete(config.id!)}
                                        className="text-red-400 hover:text-red-300"
                                    >
                                        删除
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// MCP 配置表单组件
const McpConfigForm: React.FC<{
    config: McpConfigDTO;
    onSave: (config: McpConfigDTO) => void;
    onCancel: () => void;
}> = ({ config, onSave, onCancel }) => {
    const [formData, setFormData] = useState<McpConfigDTO>(config);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="bg-slate-800 rounded-lg p-6 mb-4">
            <h3 className="text-lg font-semibold text-white mb-4">
                {config.id ? '编辑' : '创建'} MCP 配置
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">名称</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">服务器类型</label>
                    <input
                        type="text"
                        value={formData.serverType}
                        onChange={(e) => setFormData({ ...formData, serverType: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">服务器 URL</label>
                    <input
                        type="text"
                        value={formData.serverUrl}
                        onChange={(e) => setFormData({ ...formData, serverUrl: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">API Key</label>
                    <input
                        type="password"
                        value={formData.apiKey || ''}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        placeholder={config.id ? '留空则不更新' : ''}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">描述</label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                        rows={3}
                    />
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        checked={formData.enabled}
                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                        className="mr-2"
                    />
                    <label className="text-sm text-slate-300">启用</label>
                </div>
                <div className="flex space-x-2">
                    <Button type="submit">保存</Button>
                    <Button type="button" onClick={onCancel} variant="secondary">
                        取消
                    </Button>
                </div>
            </form>
        </div>
    );
};
