import React, { useState, useEffect } from 'react';
import { mentisAgentApi, AgentRoleDTO, MentisAgentConfigDTO } from '../services/api/admin';
// Button component - simple implementation
const Button: React.FC<{
    onClick?: () => void;
    size?: 'sm' | 'md';
    children: React.ReactNode;
}> = ({ onClick, size = 'md', children }) => {
    const baseClasses = 'px-4 py-2 rounded font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white';
    const sizeClasses = size === 'sm' ? 'px-2 py-1 text-sm' : '';
    
    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${sizeClasses}`}
        >
            {children}
        </button>
    );
};

export const AgentRoleManagement: React.FC = () => {
    const [availableAgents, setAvailableAgents] = useState<AgentRoleDTO[]>([]);
    const [configuredAgents, setConfiguredAgents] = useState<MentisAgentConfigDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [available, configured] = await Promise.all([
                mentisAgentApi.getAvailableAgents(),
                mentisAgentApi.getConfiguredAgents(),
            ]);
            setAvailableAgents(available);
            setConfiguredAgents(configured);
        } catch (error) {
            console.error('Failed to load agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfigure = async (agentId: number) => {
        try {
            await mentisAgentApi.configureAgent(agentId, {});
            await loadData();
        } catch (error) {
            console.error('Failed to configure agent:', error);
            alert('配置失败');
        }
    };

    const handleRemove = async (id: number) => {
        if (!confirm('确定要移除这个 Agent 配置吗？')) {
            return;
        }
        try {
            await mentisAgentApi.removeAgentConfig(id);
            await loadData();
        } catch (error) {
            console.error('Failed to remove agent:', error);
            alert('移除失败');
        }
    };

    const handleToggle = async (id: number, enabled: boolean) => {
        try {
            await mentisAgentApi.toggleAgent(id, enabled);
            await loadData();
        } catch (error) {
            console.error('Failed to toggle agent:', error);
            alert('操作失败');
        }
    };

    const filteredAgents = availableAgents.filter(
        (agent) =>
            agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            agent.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const isConfigured = (agentId: number) => {
        return configuredAgents.some((config) => config.agentId === agentId);
    };

    if (loading) {
        return <div className="text-white">加载中...</div>;
    }

    return (
        <div className="space-y-6">
            {/* 已配置的 Agents */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">已配置的 Agents</h2>
                <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    名称
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    状态
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800 divide-y divide-slate-700">
                            {configuredAgents.map((config) => (
                                <tr key={config.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                        {config.agentName || `Agent #${config.agentId}`}
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
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleToggle(config.id!, !config.enabled)}
                                            className="text-blue-400 hover:text-blue-300"
                                        >
                                            {config.enabled ? '禁用' : '启用'}
                                        </button>
                                        <button
                                            onClick={() => handleRemove(config.id!)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            移除
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 可用的 Agents */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">可用的 Agents</h2>
                    <input
                        type="text"
                        placeholder="搜索 Agent..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredAgents.map((agent) => (
                        <div
                            key={agent.id}
                            className="bg-slate-800 rounded-lg p-4 border border-slate-700"
                        >
                            <h3 className="text-lg font-semibold text-white mb-2">{agent.name}</h3>
                            <p className="text-sm text-slate-400 mb-4 line-clamp-2">
                                {agent.description || '无描述'}
                            </p>
                            {agent.skills && (
                                <div className="mb-4">
                                    <span className="text-xs text-slate-500">技能: </span>
                                    <span className="text-xs text-slate-300">{agent.skills}</span>
                                </div>
                            )}
                            <div className="flex justify-end">
                                {isConfigured(agent.id) ? (
                                    <span className="text-sm text-green-400">已配置</span>
                                ) : (
                                    <Button
                                        onClick={() => handleConfigure(agent.id)}
                                        size="sm"
                                    >
                                        配置
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
