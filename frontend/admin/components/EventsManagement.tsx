import React, { useState, useEffect } from 'react';
import { scenarioEventApi, type ScenarioEvent, type CreateScenarioEventDTO, type UpdateScenarioEventDTO } from '../../services/api/scenario';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { showAlert, showConfirm } from '../../utils/dialog';

interface EventsManagementProps {
    eras: any[]; // 场景列表（用户场景）
    systemEras?: any[]; // 系统预置场景列表
    adminToken: string | null;
    onReload?: () => Promise<void>;
}

export const EventsManagement: React.FC<EventsManagementProps> = ({
    eras,
    systemEras = [],
    adminToken,
    onReload,
}) => {
    const [events, setEvents] = useState<ScenarioEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingEvent, setEditingEvent] = useState<ScenarioEvent | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedEraId, setSelectedEraId] = useState<number | null>(null);
    
    const [formData, setFormData] = useState({
        name: '',
        eventId: '',
        description: '',
        eraId: null as number | null,
        iconUrl: '',
        tags: '',
        sortOrder: 0,
        isActive: true,
    });

    // 加载事件列表（如果有选中的场景，则加载该场景的事件）
    const loadEvents = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            // 加载系统预设事件和用户自定义事件
            const [systemEvents, userEvents] = await Promise.all([
                scenarioEventApi.getSystemEvents(adminToken).catch(() => []),
                scenarioEventApi.getMyEvents(adminToken).catch(() => [])
            ]);
            const allEvents = [...systemEvents, ...userEvents];
            // 如果有选中场景，过滤出该场景的事件
            if (selectedEraId) {
                setEvents(allEvents.filter(e => e.eraId === selectedEraId || e.systemEraId === selectedEraId));
            } else {
                setEvents(allEvents);
            }
        } catch (error: any) {
            console.error('加载事件列表失败:', error);
            showAlert('加载事件列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [adminToken, selectedEraId]);

    const resetForm = () => {
        setFormData({
            name: '',
            eventId: '',
            description: '',
            eraId: selectedEraId,
            iconUrl: '',
            tags: '',
            sortOrder: 0,
            isActive: true,
        });
        setEditingEvent(null);
        setShowCreateForm(false);
    };

    const handleCreate = async () => {
        if (!adminToken) return;
        if (!formData.name || !formData.eventId) {
            showAlert('请填写事件名称和事件ID', '缺少参数', 'warning');
            return;
        }

        try {
            const createData: CreateScenarioEventDTO = {
                name: formData.name,
                eventId: formData.eventId,
                description: formData.description || undefined,
                eraId: formData.eraId || undefined,
                iconUrl: formData.iconUrl || undefined,
                tags: formData.tags || undefined,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };
            await scenarioEventApi.createEvent(createData, adminToken);
            await loadEvents();
            resetForm();
            showAlert('创建成功', '成功', 'success');
            onReload?.();
        } catch (error: any) {
            showAlert('创建失败: ' + (error.message || '未知错误'), '创建失败', 'error');
        }
    };

    const handleEdit = (event: ScenarioEvent) => {
        setEditingEvent(event);
        setFormData({
            name: event.name,
            eventId: event.eventId,
            description: event.description || '',
            eraId: event.eraId || null,
            iconUrl: event.iconUrl || '',
            tags: event.tags || '',
            sortOrder: event.sortOrder,
            isActive: event.isActive,
        });
        setShowCreateForm(true);
    };

    const handleUpdate = async () => {
        if (!adminToken || !editingEvent) return;
        if (!formData.name || !formData.eventId) {
            showAlert('请填写事件名称和事件ID', '缺少参数', 'warning');
            return;
        }

        try {
            const updateData: UpdateScenarioEventDTO = {
                name: formData.name,
                eventId: formData.eventId,
                description: formData.description || undefined,
                iconUrl: formData.iconUrl || undefined,
                tags: formData.tags || undefined,
                sortOrder: formData.sortOrder,
                isActive: formData.isActive,
            };
            await scenarioEventApi.updateEvent(editingEvent.id, updateData, adminToken);
            await loadEvents();
            resetForm();
            showAlert('更新成功', '成功', 'success');
            onReload?.();
        } catch (error: any) {
            showAlert('更新失败: ' + (error.message || '未知错误'), '更新失败', 'error');
        }
    };

    const handleDelete = async (event: ScenarioEvent) => {
        if (!adminToken) return;
        const confirmed = await showConfirm(`确定要删除事件"${event.name}"吗？`, '删除事件', 'danger');
        if (!confirmed) return;

        try {
            await scenarioEventApi.deleteEvent(event.id, adminToken);
            await loadEvents();
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
                    <h2 className="text-lg font-bold text-slate-100">剧本事件管理</h2>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowCreateForm(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700"
                    >
                        + 创建事件
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
                        <option value="">全部事件</option>
                        {eras.map(era => (
                            <option key={era.id} value={era.id}>{era.name}</option>
                        ))}
                    </select>
                </div>

                {/* 创建/编辑表单 */}
                {showCreateForm && (
                    <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 mb-6">
                        <h3 className="text-md font-semibold text-slate-100 mb-4">
                            {editingEvent ? '编辑事件' : '创建事件'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputGroup label="事件名称 *" required>
                                <TextInput
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="例如：发现线索"
                                />
                            </InputGroup>
                            <InputGroup label="事件ID *" required>
                                <TextInput
                                    value={formData.eventId}
                                    onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                                    placeholder="例如：event_find_clue"
                                    disabled={!!editingEvent}
                                />
                                {!editingEvent && (
                                    <p className="text-xs text-slate-400 mt-1">用于剧本中引用，创建后不可修改</p>
                                )}
                            </InputGroup>
                            <InputGroup label="所属场景">
                                <select
                                    value={formData.eraId || ''}
                                    onChange={(e) => setFormData({ ...formData, eraId: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">不限场景（全局事件）</option>
                                    {eras.map(era => (
                                        <option key={era.id} value={era.id}>{era.name}</option>
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
                                    placeholder="逗号分隔，例如：mystery,clue"
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
                                    placeholder="事件描述..."
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
                                onClick={editingEvent ? handleUpdate : handleCreate}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {editingEvent ? '更新' : '创建'}
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

                {/* 事件列表 */}
                {loading ? (
                    <div className="text-center py-8 text-slate-400">加载中...</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">暂无事件</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">事件名称</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">事件ID</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">场景</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">状态</th>
                                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map(event => (
                                    <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="py-3 px-4 text-slate-100">{event.name}</td>
                                        <td className="py-3 px-4 text-slate-400 font-mono text-sm">{event.eventId}</td>
                                        <td className="py-3 px-4 text-slate-400">
                                            {event.eraName || event.systemEraName || '全局'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded text-xs ${event.isActive ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                                {event.isActive ? '启用' : '禁用'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(event)}
                                                    className="text-indigo-400 hover:text-indigo-300 text-sm"
                                                >
                                                    编辑
                                                </button>
                                                {!event.isSystem && (
                                                    <button
                                                        onClick={() => handleDelete(event)}
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

