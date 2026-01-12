import React, { useState, useEffect } from 'react';
import { Button } from "../components/Button";
import { adminApi } from '../services/api';
import { showAlert, showConfirm } from "../utils/dialog";
import type { Plugin, PluginListRequest, PluginPreview } from '../services/api/admin/pluginTypes';

interface PluginManagementProps {
    adminToken: string | null;
    onReload?: () => Promise<void>;
}

export const PluginManagement: React.FC<PluginManagementProps> = ({ adminToken, onReload }) => {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);
    const [previewPlugin, setPreviewPlugin] = useState<Plugin | null>(null);
    const [keyword, setKeyword] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | 'ALL'>('ALL');
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const pageSize = 20;

    // 加载插件列表
    const loadPlugins = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const request: PluginListRequest = {
                keyword: keyword || undefined,
                category: category || undefined,
                status: status,
                page: page,
                size: pageSize,
            };
            const response = await adminApi.plugin.getList(request, adminToken);
            setPlugins(response.plugins);
            setTotal(response.total);
        } catch (error: any) {
            showAlert('加载插件列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlugins();
    }, [adminToken, keyword, category, status, page]);

    // 启用插件
    const handleEnable = async (pluginId: string) => {
        if (!adminToken) return;
        try {
            await adminApi.plugin.enable(pluginId, adminToken);
            showAlert('插件已启用', '成功', 'success');
            await loadPlugins();
        } catch (error: any) {
            showAlert('启用失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    // 禁用插件
    const handleDisable = async (pluginId: string) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(
            '确定要禁用此插件吗？禁用后用户将无法使用此插件。',
            '禁用插件',
            'warning'
        );
        if (!confirmed) return;

        try {
            await adminApi.plugin.disable(pluginId, false, adminToken);
            showAlert('插件已禁用', '成功', 'success');
            await loadPlugins();
        } catch (error: any) {
            if (error.message?.includes('正在被')) {
                const forceConfirmed = await showConfirm(
                    error.message + ' 是否强制禁用？',
                    '强制禁用',
                    'danger'
                );
                if (forceConfirmed) {
                    try {
                        await adminApi.plugin.disable(pluginId, true, adminToken);
                        showAlert('插件已强制禁用', '成功', 'success');
                        await loadPlugins();
                    } catch (e: any) {
                        showAlert('禁用失败: ' + (e.message || '未知错误'), '错误', 'error');
                    }
                }
            } else {
                showAlert('禁用失败: ' + (error.message || '未知错误'), '错误', 'error');
            }
        }
    };

    // 查看详情
    const handleViewDetail = async (pluginId: string) => {
        if (!adminToken) return;
        try {
            const plugin = await adminApi.plugin.getById(pluginId, adminToken);
            setSelectedPlugin(plugin);
        } catch (error: any) {
            showAlert('加载插件详情失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    // 预览插件
    const handlePreview = async (pluginId: string) => {
        if (!adminToken) return;
        try {
            const preview = await adminApi.plugin.getPreview(pluginId, adminToken);
            setPreviewPlugin(preview.plugin);
        } catch (error: any) {
            showAlert('加载插件预览失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    // 发布插件
    const handlePublish = async (pluginId: string) => {
        if (!adminToken) return;
        const publishNote = prompt('请输入发布说明（可选）：');
        if (publishNote === null) return; // 用户取消

        const confirmed = await showConfirm(
            '确定要发布此插件吗？发布后用户将可以使用此插件。',
            '发布插件',
            'info'
        );
        if (!confirmed) return;

        try {
            await adminApi.plugin.publish(pluginId, publishNote || undefined, adminToken);
            showAlert('插件已发布', '成功', 'success');
            await loadPlugins();
            if (previewPlugin && previewPlugin.pluginId === pluginId) {
                setPreviewPlugin(null);
            }
        } catch (error: any) {
            showAlert('发布失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    // 取消发布插件
    const handleUnpublish = async (pluginId: string) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(
            '确定要取消发布此插件吗？取消发布后用户将无法使用此插件。',
            '取消发布插件',
            'warning'
        );
        if (!confirmed) return;

        try {
            await adminApi.plugin.unpublish(pluginId, adminToken);
            showAlert('插件已取消发布', '成功', 'success');
            await loadPlugins();
            if (previewPlugin && previewPlugin.pluginId === pluginId) {
                setPreviewPlugin(null);
            }
        } catch (error: any) {
            showAlert('取消发布失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    return (
        <div className="space-y-4">
            {/* 搜索和筛选 */}
            <div className="flex items-center gap-4 mb-4">
                <input
                    type="text"
                    placeholder="搜索插件..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white flex-1"
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                >
                    <option value="">全部分类</option>
                    <option value="lifestyle">生活方式</option>
                    <option value="education">教育</option>
                    <option value="entertainment">娱乐</option>
                    <option value="social">社交</option>
                </select>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE' | 'ALL')}
                    className="px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white"
                >
                    <option value="ALL">全部状态</option>
                    <option value="ACTIVE">已启用</option>
                    <option value="INACTIVE">已禁用</option>
                </select>
                <Button onClick={loadPlugins} className="bg-indigo-600 hover:bg-indigo-500">
                    刷新
                </Button>
            </div>

            {/* 插件列表 */}
            {loading ? (
                <div className="text-center py-8 text-slate-400">加载中...</div>
            ) : plugins.length === 0 ? (
                <div className="text-center py-8 text-slate-400">暂无插件</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plugins.map((plugin) => (
                        <div
                            key={plugin.id}
                            className="bg-slate-800 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {plugin.iconUrl && (
                                        <img src={plugin.iconUrl} alt={plugin.name} className="w-8 h-8 rounded" />
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-white">{plugin.name}</h3>
                                        <p className="text-xs text-slate-400">v{plugin.version}</p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded text-xs ${
                                        plugin.status === 'ACTIVE'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-slate-600 text-slate-300'
                                    }`}
                                >
                                    {plugin.status === 'ACTIVE' ? '已启用' : '已禁用'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-3 line-clamp-2">
                                {plugin.description || '暂无描述'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                                <span>📊 使用: {plugin.usageCount || 0}次</span>
                                {plugin.userCount !== undefined && (
                                    <span>👥 用户: {plugin.userCount}人</span>
                                )}
                                {plugin.rating && <span>⭐ 评分: {plugin.rating}</span>}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handlePreview(plugin.pluginId)}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-sm"
                                >
                                    预览
                                </Button>
                                <Button
                                    onClick={() => handleViewDetail(plugin.pluginId)}
                                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-sm"
                                >
                                    详情
                                </Button>
                                {plugin.status === 'ACTIVE' ? (
                                    <Button
                                        onClick={() => handleDisable(plugin.pluginId)}
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-sm"
                                    >
                                        禁用
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleEnable(plugin.pluginId)}
                                        className="flex-1 bg-green-600 hover:bg-green-500 text-sm"
                                    >
                                        启用
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 分页 */}
            {total > pageSize && (
                <div className="flex items-center justify-center gap-4 mt-4">
                    <Button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="bg-slate-600 hover:bg-slate-500"
                    >
                        上一页
                    </Button>
                    <span className="text-slate-400">
                        第 {page + 1} 页，共 {Math.ceil(total / pageSize)} 页
                    </span>
                    <Button
                        onClick={() => setPage(Math.min(Math.ceil(total / pageSize) - 1, page + 1))}
                        disabled={page >= Math.ceil(total / pageSize) - 1}
                        className="bg-slate-600 hover:bg-slate-500"
                    >
                        下一页
                    </Button>
                </div>
            )}

            {/* 预览弹窗 */}
            {previewPlugin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-white">{previewPlugin.name}</h2>
                                <p className="text-sm text-slate-400 mt-1">插件预览</p>
                            </div>
                            <button
                                onClick={() => setPreviewPlugin(null)}
                                className="text-slate-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* 左侧：基本信息 */}
                            <div className="space-y-4">
                                <div className="bg-slate-900 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">基本信息</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm text-slate-400">插件ID</label>
                                            <p className="text-white font-mono text-sm">{previewPlugin.pluginId}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">版本</label>
                                            <p className="text-white">v{previewPlugin.version}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">作者</label>
                                            <p className="text-white">{previewPlugin.author || '未知'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">分类</label>
                                            <p className="text-white">{previewPlugin.category || '未分类'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-slate-400">状态</label>
                                            <p className="text-white">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    previewPlugin.status === 'ACTIVE'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-slate-600 text-slate-300'
                                                }`}>
                                                    {previewPlugin.status === 'ACTIVE' ? '已启用' : '已禁用'}
                                                </span>
                                            </p>
                                        </div>
                                        {previewPlugin.publishStatus && (
                                            <div>
                                                <label className="text-sm text-slate-400">发布状态</label>
                                                <p className="text-white">
                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                        previewPlugin.publishStatus === 'PUBLISHED'
                                                            ? 'bg-blue-600 text-white'
                                                            : previewPlugin.publishStatus === 'PENDING'
                                                            ? 'bg-yellow-600 text-white'
                                                            : 'bg-slate-600 text-slate-300'
                                                    }`}>
                                                        {previewPlugin.publishStatus === 'PUBLISHED' ? '已发布' :
                                                         previewPlugin.publishStatus === 'PENDING' ? '待审核' : '草稿'}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 权限信息 */}
                                {previewPlugin.permissions && previewPlugin.permissions.length > 0 && (
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-4">所需权限</h3>
                                        <ul className="space-y-2">
                                            {previewPlugin.permissions.map((perm, idx) => (
                                                <li key={idx} className="text-white text-sm flex items-center gap-2">
                                                    <span className="text-green-400">✓</span>
                                                    {perm}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* 右侧：详细信息和配置 */}
                            <div className="space-y-4">
                                {/* 描述 */}
                                <div className="bg-slate-900 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">功能描述</h3>
                                    <p className="text-slate-300 text-sm leading-relaxed">
                                        {previewPlugin.description || '暂无描述'}
                                    </p>
                                </div>

                                {/* 配置信息 */}
                                {previewPlugin.defaultConfig && (
                                    <div className="bg-slate-900 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold text-white mb-4">默认配置</h3>
                                        <pre className="bg-slate-950 rounded p-3 text-xs text-slate-300 overflow-x-auto">
                                            {JSON.stringify(previewPlugin.defaultConfig, null, 2)}
                                        </pre>
                                    </div>
                                )}

                                {/* 统计信息 */}
                                <div className="bg-slate-900 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-white mb-4">使用统计</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-slate-400">使用次数</label>
                                            <p className="text-white text-lg font-semibold">{previewPlugin.usageCount || 0}</p>
                                        </div>
                                        {previewPlugin.userCount !== undefined && (
                                            <div>
                                                <label className="text-sm text-slate-400">用户数</label>
                                                <p className="text-white text-lg font-semibold">{previewPlugin.userCount}</p>
                                            </div>
                                        )}
                                        {previewPlugin.rating && (
                                            <div>
                                                <label className="text-sm text-slate-400">评分</label>
                                                <p className="text-white text-lg font-semibold">⭐ {previewPlugin.rating}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 操作按钮 */}
                        <div className="flex gap-3 mt-6 pt-6 border-t border-slate-700">
                            {previewPlugin.status === 'ACTIVE' && previewPlugin.publishStatus !== 'PUBLISHED' && (
                                <Button
                                    onClick={() => handlePublish(previewPlugin.pluginId)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500"
                                >
                                    发布插件
                                </Button>
                            )}
                            {previewPlugin.publishStatus === 'PUBLISHED' && (
                                <Button
                                    onClick={() => handleUnpublish(previewPlugin.pluginId)}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500"
                                >
                                    取消发布
                                </Button>
                            )}
                            <Button
                                onClick={() => setPreviewPlugin(null)}
                                className="flex-1 bg-slate-600 hover:bg-slate-500"
                            >
                                关闭
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* 详情弹窗 */}
            {selectedPlugin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white">{selectedPlugin.name}</h2>
                            <button
                                onClick={() => setSelectedPlugin(null)}
                                className="text-slate-400 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400">插件ID</label>
                                <p className="text-white">{selectedPlugin.pluginId}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">版本</label>
                                <p className="text-white">{selectedPlugin.version}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">描述</label>
                                <p className="text-white">{selectedPlugin.description || '暂无描述'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">作者</label>
                                <p className="text-white">{selectedPlugin.author || '未知'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">分类</label>
                                <p className="text-white">{selectedPlugin.category || '未分类'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-slate-400">状态</label>
                                <p className="text-white">{selectedPlugin.status === 'ACTIVE' ? '已启用' : '已禁用'}</p>
                            </div>
                            {selectedPlugin.permissions && selectedPlugin.permissions.length > 0 && (
                                <div>
                                    <label className="text-sm text-slate-400">所需权限</label>
                                    <ul className="list-disc list-inside text-white">
                                        {selectedPlugin.permissions.map((perm, idx) => (
                                            <li key={idx}>{perm}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex gap-2 pt-4">
                                {selectedPlugin.status === 'ACTIVE' ? (
                                    <Button
                                        onClick={() => {
                                            handleDisable(selectedPlugin.pluginId);
                                            setSelectedPlugin(null);
                                        }}
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-500"
                                    >
                                        禁用插件
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => {
                                            handleEnable(selectedPlugin.pluginId);
                                            setSelectedPlugin(null);
                                        }}
                                        className="flex-1 bg-green-600 hover:bg-green-500"
                                    >
                                        启用插件
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
