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
    const [testingConfigId, setTestingConfigId] = useState<number | null>(null);

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

    const handleTestTools = (id: number) => {
        setTestingConfigId(id);
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

            {testingConfigId && (
                <McpToolTestDialog
                    configId={testingConfigId}
                    onClose={() => setTestingConfigId(null)}
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
                                        连接测试
                                    </button>
                                    <button
                                        onClick={() => handleTestTools(config.id!)}
                                        className="text-green-400 hover:text-green-300"
                                    >
                                        工具测试
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
    const [jsonError, setJsonError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (jsonError) {
            alert('JSON 配置格式错误，请修正后再保存');
            return;
        }
        onSave(formData);
    };

    const handleExtraConfigChange = (value: string) => {
        setFormData({ ...formData, extraConfig: value });
        // 验证 JSON 格式
        if (value.trim()) {
            try {
                JSON.parse(value);
                setJsonError(null);
            } catch (e) {
                setJsonError('JSON 格式错误');
            }
        } else {
            setJsonError(null);
        }
    };

    const formatJson = () => {
        if (!formData.extraConfig) return;
        try {
            const parsed = JSON.parse(formData.extraConfig);
            setFormData({ ...formData, extraConfig: JSON.stringify(parsed, null, 2) });
            setJsonError(null);
        } catch (e) {
            setJsonError('无法格式化：JSON 格式错误');
        }
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
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-300">JSON 配置</label>
                        <button
                            type="button"
                            onClick={formatJson}
                            className="text-xs text-blue-400 hover:text-blue-300"
                        >
                            格式化
                        </button>
                    </div>
                    <textarea
                        value={formData.extraConfig || ''}
                        onChange={(e) => handleExtraConfigChange(e.target.value)}
                        className={`w-full px-3 py-2 bg-slate-700 border rounded text-white font-mono text-sm ${
                            jsonError ? 'border-red-500' : 'border-slate-600'
                        }`}
                        rows={8}
                        placeholder='{"key": "value"}'
                    />
                    {jsonError && (
                        <p className="mt-1 text-xs text-red-400">{jsonError}</p>
                    )}
                    {formData.extraConfig && !jsonError && (
                        <p className="mt-1 text-xs text-green-400">✓ JSON 格式正确</p>
                    )}
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

// MCP 工具测试对话框
const McpToolTestDialog: React.FC<{
    configId: number;
    onClose: () => void;
}> = ({ configId, onClose }) => {
    const [tools, setTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTool, setSelectedTool] = useState<any | null>(null);
    const [toolArguments, setToolArguments] = useState<string>('{}');
    const [testResult, setTestResult] = useState<any | null>(null);
    const [testing, setTesting] = useState(false);
    const [jsonError, setJsonError] = useState<string | null>(null);

    useEffect(() => {
        loadTools();
    }, [configId]);

    const loadTools = async () => {
        try {
            setLoading(true);
            const data = await mentisMcpApi.getTools(configId);
            setTools(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to load tools:', error);
            alert('加载工具列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleToolSelect = (tool: any) => {
        setSelectedTool(tool);
        setToolArguments('{}');
        setTestResult(null);
        setJsonError(null);
    };

    const handleArgumentsChange = (value: string) => {
        setToolArguments(value);
        try {
            JSON.parse(value);
            setJsonError(null);
        } catch (e) {
            setJsonError('JSON 格式错误');
        }
    };

    const handleTestTool = async () => {
        if (!selectedTool) {
            alert('请先选择一个工具');
            return;
        }
        if (jsonError) {
            alert('参数 JSON 格式错误，请修正后再测试');
            return;
        }

        try {
            setTesting(true);
            const args = JSON.parse(toolArguments);
            const toolName = selectedTool.name || selectedTool.toolName || selectedTool.tool;
            const result = await mentisMcpApi.callTool(configId, toolName, args);
            setTestResult(result);
        } catch (error: any) {
            setTestResult({
                success: false,
                error: error.message || '测试失败'
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">MCP 工具测试</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white"
                    >
                        ✕
                    </button>
                </div>

                {loading ? (
                    <div className="text-white">加载工具列表...</div>
                ) : (
                    <div className="space-y-4">
                        {/* 工具列表 */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                可用工具 ({tools.length})
                            </label>
                            <div className="bg-slate-700 rounded p-4 max-h-48 overflow-y-auto">
                                {tools.length === 0 ? (
                                    <p className="text-slate-400 text-sm">没有可用的工具</p>
                                ) : (
                                    <div className="space-y-2">
                                        {tools.map((tool, index) => {
                                            const toolName = tool.name || tool.toolName || tool.tool || `tool_${index}`;
                                            const description = tool.description || tool.desc || '无描述';
                                            return (
                                                <button
                                                    key={index}
                                                    onClick={() => handleToolSelect(tool)}
                                                    className={`w-full text-left p-3 rounded transition-colors ${
                                                        selectedTool === tool
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                                                    }`}
                                                >
                                                    <div className="font-medium">{toolName}</div>
                                                    <div className="text-xs mt-1 opacity-75">{description}</div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 工具参数输入 */}
                        {selectedTool && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    工具参数 (JSON)
                                </label>
                                <textarea
                                    value={toolArguments}
                                    onChange={(e) => handleArgumentsChange(e.target.value)}
                                    className={`w-full px-3 py-2 bg-slate-700 border rounded text-white font-mono text-sm ${
                                        jsonError ? 'border-red-500' : 'border-slate-600'
                                    }`}
                                    rows={6}
                                    placeholder='{"key": "value"}'
                                />
                                {jsonError && (
                                    <p className="mt-1 text-xs text-red-400">{jsonError}</p>
                                )}
                                {!jsonError && toolArguments !== '{}' && (
                                    <p className="mt-1 text-xs text-green-400">✓ JSON 格式正确</p>
                                )}
                            </div>
                        )}

                        {/* 测试按钮 */}
                        {selectedTool && (
                            <div>
                                <Button
                                    onClick={handleTestTool}
                                    disabled={testing || !!jsonError}
                                >
                                    {testing ? '测试中...' : '执行测试'}
                                </Button>
                            </div>
                        )}

                        {/* 测试结果 */}
                        {testResult && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    测试结果
                                </label>
                                <div className={`bg-slate-700 rounded p-4 ${
                                    testResult.success !== false ? 'border border-green-500' : 'border border-red-500'
                                }`}>
                                    <pre className="text-sm text-white whitespace-pre-wrap font-mono">
                                        {JSON.stringify(testResult, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
