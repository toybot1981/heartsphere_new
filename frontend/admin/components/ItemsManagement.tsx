import React, { useState, useEffect } from 'react';
import { scenarioItemApi, type ScenarioItem, type CreateScenarioItemDTO, type UpdateScenarioItemDTO } from '../../services/api/scenario';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { showAlert, showConfirm } from '../../utils/dialog';

interface ItemsManagementProps {
    eras: any[]; // 场景列表（用户场景）
    systemEras?: any[]; // 系统预置场景列表
    adminToken: string | null;
    onReload?: () => Promise<void>;
}

const ITEM_TYPES = [
    { value: 'weapon', label: '武器' },
    { value: 'tool', label: '工具' },
    { value: 'key', label: '钥匙' },
    { value: 'consumable', label: '消耗品' },
    { value: 'collectible', label: '收藏品' },
    { value: 'other', label: '其他' },
];

export const ItemsManagement: React.FC<ItemsManagementProps> = ({
    eras,
    systemEras = [],
    adminToken,
    onReload,
}) => {
    const [items, setItems] = useState<ScenarioItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<ScenarioItem | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedEraId, setSelectedEraId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        itemId: '',
        description: '',
        eraId: null as number | null,
        iconUrl: '',
        itemType: '',
        tags: '',
        sortOrder: 0,
        isActive: true,
    });

    // 加载物品列表（如果有选中的场景，则加载该场景的物品）
    const loadItems = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            // 加载系统预设物品和用户自定义物品
            const [systemItems, userItems] = await Promise.all([
                scenarioItemApi.getSystemItems(adminToken).catch(() => []),
                scenarioItemApi.getMyItems(adminToken).catch(() => [])
            ]);
            const allItems = [...systemItems, ...userItems];
            // 如果有选中场景，过滤出该场景的物品
            if (selectedEraId) {
                setItems(allItems.filter(i => i.eraId === selectedEraId || i.systemEraId === selectedEraId));
            } else {
                setItems(allItems);
            }
        } catch (error: any) {
            console.error('加载物品列表失败:', error);
            showAlert('加载物品列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, [adminToken, selectedEraId]);

    const resetForm = () => {
        setFormData({
            name: '',
            itemId: '',
            description: '',
            eraId: selectedEraId,
            iconUrl: '',
            itemType: '',
            tags: '',
            sortOrder: 0,
            isActive: true,
        });
        setEditingItem(null);
        setShowCreateForm(false);
    };

    const handleCreate = async () => {
        if (!adminToken) return;
        if (!formData.name || !formData.itemId) {
            showAlert('请填写物品名称和物品ID', '缺少参数', 'warning');
            return;
        }

        try {
            const createData: CreateScenarioItemDTO = {
                name: formData.name,
                itemId: formData.itemId,
                description: formData.description || undefined,
                eraId: formData.eraId || undefined,
                iconUrl: formData.iconUrl || undefined,
                itemType: formData.itemType || undefined,
                tags: formData.tags || undefined,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };
            await scenarioItemApi.createItem(createData, adminToken);
            await loadItems();
            resetForm();
            showAlert('创建成功', '成功', 'success');
            onReload?.();
        } catch (error: any) {
            showAlert('创建失败: ' + (error.message || '未知错误'), '创建失败', 'error');
        }
    };

    const handleEdit = (item: ScenarioItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            itemId: item.itemId,
            description: item.description || '',
            eraId: item.eraId || null,
            iconUrl: item.iconUrl || '',
            itemType: item.itemType || '',
            tags: item.tags || '',
            sortOrder: item.sortOrder,
            isActive: item.isActive,
        });
        setShowCreateForm(true);
    };

    const handleUpdate = async () => {
        if (!adminToken || !editingItem) return;
        if (!formData.name || !formData.itemId) {
            showAlert('请填写物品名称和物品ID', '缺少参数', 'warning');
            return;
        }

        try {
            const updateData: UpdateScenarioItemDTO = {
                name: formData.name,
                itemId: formData.itemId,
                description: formData.description || undefined,
                iconUrl: formData.iconUrl || undefined,
                itemType: formData.itemType || undefined,
                tags: formData.tags || undefined,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };
            await scenarioItemApi.updateItem(editingItem.id, updateData, adminToken);
            await loadItems();
            resetForm();
            showAlert('更新成功', '成功', 'success');
            onReload?.();
        } catch (error: any) {
            showAlert('更新失败: ' + (error.message || '未知错误'), '更新失败', 'error');
        }
    };

    const handleDelete = async (item: ScenarioItem) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(`确定要删除物品"${item.name}"吗？`, '删除物品', 'danger');
        if (!confirmed) return;

        try {
            await scenarioItemApi.deleteItem(item.id, adminToken);
            await loadItems();
            showAlert('删除成功', '成功', 'success');
            onReload?.();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* 标题和创建按钮 */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-slate-100">剧本物品管理</h2>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        + 创建物品
                    </Button>
                </div>

                {/* 场景筛选 */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">筛选场景</label>
                    <select
                        value={selectedEraId || ''}
                        onChange={(e) => setSelectedEraId(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full md:w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">全部物品</option>
                        {eras.map(era => (
                            <option key={era.id} value={era.id}>{era.name}</option>
                        ))}
                    </select>
                </div>

                {/* 创建/编辑表单 */}
                {showCreateForm && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                        <h3 className="text-md font-semibold text-slate-100 mb-4">
                            {editingItem ? '编辑物品' : '创建物品'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="物品名称 *" required>
                                <TextInput
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="例如：神秘钥匙"
                                />
                            </InputGroup>
                            <InputGroup label="物品ID *" required>
                                <TextInput
                                    value={formData.itemId}
                                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                                    placeholder="例如：item_mysterious_key"
                                    disabled={!!editingItem}
                                />
                                {!editingItem && (
                                    <p className="text-xs text-slate-400 mt-1">用于剧本中引用，创建后不可修改</p>
                                )}
                            </InputGroup>
                            <InputGroup label="所属场景">
                                <select
                                    value={formData.eraId || ''}
                                    onChange={(e) => setFormData({ ...formData, eraId: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">不限场景（全局物品）</option>
                                    {eras.map(era => (
                                        <option key={era.id} value={era.id}>{era.name}</option>
                                    ))}
                                </select>
                            </InputGroup>
                            <InputGroup label="物品类型">
                                <select
                                    value={formData.itemType}
                                    onChange={(e) => setFormData({ ...formData, itemType: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">未分类</option>
                                    {ITEM_TYPES.map(type => (
                                        <option key={type.value} value={type.value}>{type.label}</option>
                                    ))}
                                </select>
                            </InputGroup>
                            <InputGroup label="图标URL">
                                <TextInput
                                    value={formData.iconUrl}
                                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </InputGroup>
                            <InputGroup label="标签">
                                <TextInput
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="逗号分隔，例如：key,mystery"
                                />
                            </InputGroup>
                            <InputGroup label="排序顺序">
                                <TextInput
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                                />
                            </InputGroup>
                            <InputGroup label="描述">
                                <TextArea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="物品描述..."
                                    rows={3}
                                />
                            </InputGroup>
                            <div className="flex items-center">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                        className="mr-2"
                                    />
                                    <span className="text-sm text-slate-300">启用</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button
                                onClick={editingItem ? handleUpdate : handleCreate}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {editingItem ? '更新' : '创建'}
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

                {/* 物品列表 */}
                {loading ? (
                    <div className="text-center py-8 text-slate-400">加载中...</div>
                ) : items.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">暂无物品</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">物品名称</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">物品ID</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">类型</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">场景</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">状态</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="py-3 px-4 text-slate-100">{item.name}</td>
                                        <td className="py-3 px-4 text-slate-400 font-mono text-sm">{item.itemId}</td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {item.itemType ? ITEM_TYPES.find(t => t.value === item.itemType)?.label || item.itemType : '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {item.eraName || item.systemEraName || '全局'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${item.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {item.isActive ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                                                >
                                                    编辑
                                                </button>
                                                {!item.isSystem && (
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        删除
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

