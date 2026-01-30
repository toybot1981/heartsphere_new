import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import type { RemoteServer } from '../../services/api/admin/devops';
import { showAlert } from '../../utils/dialog';

interface RemoteServerConfigProps {
    onClose?: () => void;
}

export const RemoteServerConfig: React.FC<RemoteServerConfigProps> = ({ onClose }) => {
    const [servers, setServers] = useState<RemoteServer[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingServer, setEditingServer] = useState<RemoteServer | null>(null);
    const [showSshKeyForm, setShowSshKeyForm] = useState<number | null>(null);
    const [sshKey, setSshKey] = useState('');
    const [sshPassphrase, setSshPassphrase] = useState('');

    useEffect(() => {
        loadServers();
    }, []);

    const loadServers = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            setLoading(true);
            const data = await adminApi.devops.getAllRemoteServers(token);
            setServers(data);
        } catch (error: any) {
            console.error('Failed to load remote servers', error);
            showAlert('加载远程服务器列表失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingServer({
            name: '',
            host: '',
            port: 22,
            username: '',
            deployPath: '/opt/deploy',
            enabled: true,
        });
    };

    const handleEdit = (server: RemoteServer) => {
        setEditingServer({ ...server });
    };

    const handleSave = async () => {
        if (!editingServer) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                showAlert('请先登录', '错误', 'error');
                return;
            }

            if (!editingServer.name || !editingServer.host || !editingServer.username) {
                showAlert('请填写必填字段', '错误', 'error');
                return;
            }

            if (editingServer.id) {
                await adminApi.devops.updateRemoteServer(token, editingServer.id, editingServer);
            } else {
                await adminApi.devops.createRemoteServer(token, editingServer);
            }

            showAlert('保存成功', '成功', 'success');
            setEditingServer(null);
            loadServers();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleSetSshKey = async (serverId: number) => {
        if (!sshKey.trim()) {
            showAlert('请输入 SSH 私钥', '错误', 'error');
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.setRemoteServerSshKey(token, serverId, sshKey, sshPassphrase || undefined);
            showAlert('SSH 密钥设置成功', '成功', 'success');
            setShowSshKeyForm(null);
            setSshKey('');
            setSshPassphrase('');
            loadServers();
        } catch (error: any) {
            showAlert('设置 SSH 密钥失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleTestConnection = async (serverId: number) => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const result = await adminApi.devops.testRemoteServerConnection(token, serverId);
            showAlert(result.message, result.success ? '成功' : '失败', result.success ? 'success' : 'error');
            loadServers();
        } catch (error: any) {
            showAlert('连接测试失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleDelete = async (serverId: number) => {
        if (!window.confirm('确定要删除这个远程服务器配置吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.devops.deleteRemoteServer(token, serverId);
            showAlert('删除成功', '成功', 'success');
            loadServers();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">远程服务器配置</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                        + 添加服务器
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                        >
                            关闭
                        </button>
                    )}
                </div>
            </div>

            {/* 编辑表单 */}
            {editingServer && (
                <div className="bg-slate-800 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                        {editingServer.id ? '编辑服务器' : '新建服务器'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">服务器名称 *</label>
                            <input
                                type="text"
                                value={editingServer.name}
                                onChange={(e) => setEditingServer({ ...editingServer, name: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                placeholder="例如：生产服务器"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">主机地址 *</label>
                            <input
                                type="text"
                                value={editingServer.host}
                                onChange={(e) => setEditingServer({ ...editingServer, host: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                placeholder="例如：192.168.1.100"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">SSH 端口</label>
                            <input
                                type="number"
                                value={editingServer.port || 22}
                                onChange={(e) => setEditingServer({ ...editingServer, port: parseInt(e.target.value) || 22 })}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">SSH 用户名 *</label>
                            <input
                                type="text"
                                value={editingServer.username}
                                onChange={(e) => setEditingServer({ ...editingServer, username: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                placeholder="例如：root"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">部署路径</label>
                            <input
                                type="text"
                                value={editingServer.deployPath || '/opt/deploy'}
                                onChange={(e) => setEditingServer({ ...editingServer, deployPath: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-slate-300 mb-1">描述</label>
                            <textarea
                                value={editingServer.description || ''}
                                onChange={(e) => setEditingServer({ ...editingServer, description: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                rows={2}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={editingServer.enabled !== false}
                                    onChange={(e) => setEditingServer({ ...editingServer, enabled: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-slate-300">启用</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                            保存
                        </button>
                        <button
                            onClick={() => setEditingServer(null)}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                        >
                            取消
                        </button>
                    </div>
                </div>
            )}

            {/* 服务器列表 */}
            {loading ? (
                <div className="text-slate-400">加载中...</div>
            ) : servers.length === 0 ? (
                <div className="text-slate-400 text-center py-8">暂无远程服务器配置</div>
            ) : (
                <div className="space-y-4">
                    {servers.map((server) => (
                        <div key={server.id} className="bg-slate-800 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{server.name}</h3>
                                    <p className="text-sm text-slate-400">{server.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        server.enabled ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                                    }`}>
                                        {server.enabled ? '启用' : '禁用'}
                                    </span>
                                    <button
                                        onClick={() => handleTestConnection(server.id!)}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                    >
                                        测试连接
                                    </button>
                                    <button
                                        onClick={() => handleEdit(server)}
                                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm"
                                    >
                                        编辑
                                    </button>
                                    <button
                                        onClick={() => handleDelete(server.id!)}
                                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                    >
                                        删除
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                                <div>
                                    <span className="font-medium">主机:</span> {server.host}:{server.port}
                                </div>
                                <div>
                                    <span className="font-medium">用户:</span> {server.username}
                                </div>
                                <div>
                                    <span className="font-medium">部署路径:</span> {server.deployPath || '/opt/deploy'}
                                </div>
                                {server.lastConnectionTest && (
                                    <div>
                                        <span className="font-medium">最后测试:</span> {new Date(server.lastConnectionTest).toLocaleString()}
                                        {server.lastConnectionResult && (
                                            <span className={`ml-2 ${
                                                server.lastConnectionResult.includes('成功') ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                                ({server.lastConnectionResult})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3">
                                <button
                                    onClick={() => setShowSshKeyForm(showSshKeyForm === server.id ? null : server.id!)}
                                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                                >
                                    {showSshKeyForm === server.id ? '取消' : '设置 SSH 密钥'}
                                </button>
                                {showSshKeyForm === server.id && (
                                    <div className="mt-3 p-3 bg-slate-900 rounded space-y-2">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">SSH 私钥 *</label>
                                            <textarea
                                                value={sshKey}
                                                onChange={(e) => setSshKey(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 text-white rounded font-mono text-xs"
                                                rows={6}
                                                placeholder="-----BEGIN OPENSSH PRIVATE KEY-----&#10;..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-1">密钥密码（可选）</label>
                                            <input
                                                type="password"
                                                value={sshPassphrase}
                                                onChange={(e) => setSshPassphrase(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                                                placeholder="如果密钥有密码保护，请输入密码"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleSetSshKey(server.id!)}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                        >
                                            保存密钥
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
