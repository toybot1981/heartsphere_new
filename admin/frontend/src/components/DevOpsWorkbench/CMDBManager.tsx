import React, { useState, useEffect } from 'react';
import { adminApi } from '../../services/api';
import { showAlert } from '../../utils/dialog';
import type { Asset, AssetType, AssetRelationship, AssetHistory, AssetSearchRequest, PageResponse } from '../../services/api/admin/cmdb';

export const CMDBManager: React.FC = () => {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [searchParams, setSearchParams] = useState<AssetSearchRequest>({
        page: 0,
        size: 20,
    });
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        loadAssetTypes();
        loadAssets();
    }, []);

    useEffect(() => {
        loadAssets();
    }, [searchParams]);

    const loadAssetTypes = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const types = await adminApi.cmdb.getAssetTypes(token);
            setAssetTypes(types);
        } catch (error: any) {
            showAlert('加载资产类型失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const loadAssets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const response = await adminApi.cmdb.getAssets(token, {
                name: searchParams.name,
                typeId: searchParams.typeId,
                status: searchParams.status,
                page: searchParams.page,
                size: searchParams.size,
            });
            
            setAssets(response.content || []);
            setTotalElements(response.totalElements || 0);
            setTotalPages(response.totalPages || 0);
        } catch (error: any) {
            showAlert('加载资产列表失败: ' + (error.message || '未知错误'), '错误', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAsset = async (asset: Partial<Asset>) => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.cmdb.createAsset(token, asset);
            showAlert('资产创建成功', '成功', 'success');
            setShowAssetForm(false);
            loadAssets();
        } catch (error: any) {
            showAlert('创建资产失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const handleDeleteAsset = async (id: number) => {
        if (!window.confirm('确定要删除这个资产吗？')) return;

        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            await adminApi.cmdb.deleteAsset(token, id);
            showAlert('资产删除成功', '成功', 'success');
            loadAssets();
            if (selectedAsset?.id === id) {
                setSelectedAsset(null);
            }
        } catch (error: any) {
            showAlert('删除资产失败: ' + (error.message || '未知错误'), '错误', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-900 text-green-300';
            case 'INACTIVE':
                return 'bg-yellow-900 text-yellow-300';
            case 'DEPRECATED':
                return 'bg-orange-900 text-orange-300';
            case 'DELETED':
                return 'bg-red-900 text-red-300';
            default:
                return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* 标题和操作栏 */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">CMDB 资产管理</h2>
                <button
                    onClick={() => setShowAssetForm(true)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                    + 新建资产
                </button>
            </div>

            {/* 搜索和过滤 */}
            <div className="bg-slate-800 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="搜索资产名称..."
                        value={searchParams.name || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value, page: 0 })}
                        className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                    />
                    <select
                        value={searchParams.typeId || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, typeId: e.target.value ? Number(e.target.value) : undefined, page: 0 })}
                        className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                    >
                        <option value="">所有类型</option>
                        {assetTypes.map(type => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                    <select
                        value={searchParams.status || ''}
                        onChange={(e) => setSearchParams({ ...searchParams, status: e.target.value || undefined, page: 0 })}
                        className="px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                    >
                        <option value="">所有状态</option>
                        <option value="ACTIVE">活跃</option>
                        <option value="INACTIVE">非活跃</option>
                        <option value="DEPRECATED">已弃用</option>
                    </select>
                    <button
                        onClick={loadAssets}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                        搜索
                    </button>
                </div>
            </div>

            {/* 资产列表 */}
            <div className="bg-slate-800 rounded-lg p-4">
                {loading ? (
                    <div className="text-center py-8 text-slate-400">加载中...</div>
                ) : assets.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">暂无资产数据</div>
                ) : (
                    <div className="space-y-2">
                        {assets.map(asset => (
                            <div
                                key={asset.id}
                                className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 cursor-pointer"
                                onClick={() => setSelectedAsset(asset)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-semibold text-white">{asset.name}</h3>
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(asset.status)}`}>
                                                {asset.status}
                                            </span>
                                            <span className="text-slate-400 text-sm">{asset.type?.name}</span>
                                        </div>
                                        {asset.description && (
                                            <p className="text-slate-400 text-sm mt-1">{asset.description}</p>
                                        )}
                                        <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                            {asset.version && <span>版本: {asset.version}</span>}
                                            {asset.location && <span>位置: {asset.location}</span>}
                                            {asset.ownerName && <span>负责人: {asset.ownerName}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedAsset(asset);
                                            }}
                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                                        >
                                            查看
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteAsset(asset.id);
                                            }}
                                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                                        >
                                            删除
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 分页 */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-slate-400 text-sm">
                            共 {totalElements} 条记录，第 {searchParams.page! + 1} / {totalPages} 页
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSearchParams({ ...searchParams, page: Math.max(0, searchParams.page! - 1) })}
                                disabled={searchParams.page === 0}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                上一页
                            </button>
                            <button
                                onClick={() => setSearchParams({ ...searchParams, page: Math.min(totalPages - 1, searchParams.page! + 1) })}
                                disabled={searchParams.page! >= totalPages - 1}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                下一页
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 资产详情模态框 */}
            {selectedAsset && (
                <AssetDetailModal
                    asset={selectedAsset}
                    onClose={() => setSelectedAsset(null)}
                    onUpdate={loadAssets}
                />
            )}

            {/* 创建资产表单模态框 */}
            {showAssetForm && (
                <AssetFormModal
                    assetTypes={assetTypes}
                    onSave={handleCreateAsset}
                    onClose={() => setShowAssetForm(false)}
                />
            )}
        </div>
    );
};

/**
 * 资产详情模态框
 */
const AssetDetailModal: React.FC<{
    asset: Asset;
    onClose: () => void;
    onUpdate: () => void;
}> = ({ asset, onClose, onUpdate }) => {
    const [relationships, setRelationships] = useState<AssetRelationship[]>([]);
    const [history, setHistory] = useState<AssetHistory[]>([]);
    const [activeTab, setActiveTab] = useState<'details' | 'relationships' | 'history'>('details');

    useEffect(() => {
        loadRelationships();
        loadHistory();
    }, [asset.id]);

    const loadRelationships = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const rels = await adminApi.cmdb.getAssetRelationships(token, asset.id);
            setRelationships(rels);
        } catch (error: any) {
            console.error('加载资产关系失败', error);
        }
    };

    const loadHistory = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) return;

            const hist = await adminApi.cmdb.getAssetHistory(token, asset.id);
            setHistory(hist);
        } catch (error: any) {
            console.error('加载资产历史失败', error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">{asset.name}</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* 标签页 */}
                <div className="flex gap-2 mb-4 border-b border-slate-700">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-4 py-2 ${activeTab === 'details' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                    >
                        详情
                    </button>
                    <button
                        onClick={() => setActiveTab('relationships')}
                        className={`px-4 py-2 ${activeTab === 'relationships' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                    >
                        关系 ({relationships.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 ${activeTab === 'history' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-slate-400'}`}
                    >
                        历史 ({history.length})
                    </button>
                </div>

                {/* 内容 */}
                {activeTab === 'details' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-slate-400 text-sm">资产类型</label>
                                <p className="text-white">{asset.type?.name}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">状态</label>
                                <p className="text-white">{asset.status}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">版本</label>
                                <p className="text-white">{asset.version || '-'}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">位置</label>
                                <p className="text-white">{asset.location || '-'}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">负责人</label>
                                <p className="text-white">{asset.ownerName || '-'}</p>
                            </div>
                            <div>
                                <label className="text-slate-400 text-sm">创建时间</label>
                                <p className="text-white">{new Date(asset.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        {asset.description && (
                            <div>
                                <label className="text-slate-400 text-sm">描述</label>
                                <p className="text-white mt-1">{asset.description}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'relationships' && (
                    <div className="space-y-2">
                        {relationships.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">暂无关系数据</p>
                        ) : (
                            relationships.map(rel => (
                                <div key={rel.id} className="bg-slate-700 rounded p-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-400">{rel.sourceAssetName}</span>
                                        <span className="text-blue-400">→ {rel.relationshipType.name} →</span>
                                        <span className="text-slate-400">{rel.targetAssetName}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="space-y-2">
                        {history.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">暂无历史记录</p>
                        ) : (
                            history.map(h => (
                                <div key={h.id} className="bg-slate-700 rounded p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-white font-semibold">{h.action}</span>
                                            <span className="text-slate-400 text-sm ml-2">
                                                {h.changedByName || '系统'} - {new Date(h.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {h.changeSummary && (
                                        <p className="text-slate-400 text-sm mt-1">{h.changeSummary}</p>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/**
 * 资产表单模态框
 */
const AssetFormModal: React.FC<{
    assetTypes: AssetType[];
    onSave: (asset: Partial<Asset>) => void;
    onClose: () => void;
}> = ({ assetTypes, onSave, onClose }) => {
    const [formData, setFormData] = useState<Partial<Asset>>({
        status: 'ACTIVE',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.type) {
            showAlert('请填写必填字段', '错误', 'error');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">新建资产</h3>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white text-2xl"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">资产名称 *</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">资产类型 *</label>
                        <select
                            value={formData.type?.id || ''}
                            onChange={(e) => {
                                const type = assetTypes.find(t => t.id === Number(e.target.value));
                                setFormData({ ...formData, type: type || undefined });
                            }}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                            required
                        >
                            <option value="">请选择</option>
                            {assetTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">状态</label>
                        <select
                            value={formData.status || 'ACTIVE'}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                        >
                            <option value="ACTIVE">活跃</option>
                            <option value="INACTIVE">非活跃</option>
                            <option value="DEPRECATED">已弃用</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">版本</label>
                        <input
                            type="text"
                            value={formData.version || ''}
                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">位置</label>
                        <input
                            type="text"
                            value={formData.location || ''}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-1">描述</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded"
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                            保存
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
