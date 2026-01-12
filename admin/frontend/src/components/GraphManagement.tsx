import React, { useState, useEffect } from 'react';
import { Button } from "../components/Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { adminApi } from '../services/api';
import { showAlert, showConfirm } from "../utils/dialog";
import type { GraphDefinition } from '../services/api';
import { X6GraphFlowEditor } from './X6GraphFlowEditor';
import { ErrorBoundary } from './ErrorBoundary';

interface GraphManagementProps {
    adminToken: string | null;
    onReload?: () => Promise<void>;
}

export const GraphManagement: React.FC<GraphManagementProps> = ({ adminToken, onReload }) => {
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [graphs, setGraphs] = useState<GraphDefinition[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any>({
        name: '',
        description: '',
        graphType: 'SCRIPT',
        startNodeId: '',
        isActive: true,
    });
    const [editingId, setEditingId] = useState<number | null>(null);

    // 加载Graph列表
    const loadGraphs = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            const data = await adminApi.graph.getAll(adminToken);
            setGraphs(data);
        } catch (error: any) {
            showAlert('加载Graph列表失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGraphs();
    }, [adminToken]);

    const switchToCreate = () => {
        setFormData({
            name: '',
            description: '',
            graphType: 'SCRIPT',
            startNodeId: '',
            isActive: true,
            nodes: [],
            edges: [],
        });
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (graph: GraphDefinition) => {
        setFormData({
            name: graph.name || '',
            description: graph.description || '',
            graphType: graph.graphType || 'SCRIPT',
            startNodeId: graph.startNodeId || '',
            isActive: graph.isActive !== undefined ? graph.isActive : true,
            nodes: graph.nodes || [],
            edges: graph.edges || [],
        });
        setEditingId(graph.id || null);
        setViewMode('edit');
    };

    const switchToList = () => {
        setViewMode('list');
        setEditingId(null);
        setFormData({
            name: '',
            description: '',
            graphType: 'SCRIPT',
            startNodeId: '',
            isActive: true,
        });
    };

    const handleSave = async () => {
        if (!adminToken) return;

        if (!formData.name || formData.name.trim() === '') {
            showAlert('Graph名称不能为空', '验证失败', 'error');
            return;
        }

        try {
            const requestData = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                graphType: formData.graphType || 'SCRIPT',
                startNodeId: formData.startNodeId?.trim() || '',
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                nodes: formData.nodes || [],
                edges: formData.edges || [],
            };

            if (editingId) {
                await adminApi.graph.update(editingId, requestData, adminToken);
                showAlert('更新成功', '成功', 'success');
            } else {
                await adminApi.graph.create(requestData, adminToken);
                showAlert('创建成功', '成功', 'success');
            }

            await loadGraphs();
            if (onReload) {
                await onReload();
            }
            switchToList();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    const handleDelete = async (id: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要删除这个Graph定义吗？删除后无法恢复。', '删除Graph', 'danger');
        if (!confirmed) return;

        try {
            await adminApi.graph.delete(id, adminToken);
            showAlert('删除成功', '成功', 'success');
            await loadGraphs();
            if (onReload) {
                await onReload();
            }
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };

    const [editingGraphId, setEditingGraphId] = useState<number | null>(null);
    const [editingGraphData, setEditingGraphData] = useState<GraphDefinition | null>(null);
    const [showEditor, setShowEditor] = useState(false);

    const handleOpenEditor = async (graph: GraphDefinition) => {
        if (!adminToken || !graph.id) return;
        
        try {
            const graphData = await adminApi.graph.getById(graph.id, adminToken);
            setEditingGraphData(graphData);
            setEditingGraphId(graph.id);
            setShowEditor(true);
        } catch (error: any) {
            showAlert('加载Graph数据失败: ' + (error.message || '未知错误'), '加载失败', 'error');
        }
    };

    const handleEditorSave = async (data: GraphDefinition) => {
        setShowEditor(false);
        setEditingGraphId(null);
        setEditingGraphData(null);
        await loadGraphs();
        if (onReload) {
            await onReload();
        }
    };

    const handleEditorCancel = () => {
        setShowEditor(false);
        setEditingGraphId(null);
        setEditingGraphData(null);
    };

    const handleCreateNewEditor = () => {
        setEditingGraphData(null);
        setEditingGraphId(null);
        setShowEditor(true);
    };

    // 如果显示编辑器，渲染编辑器组件
    if (showEditor) {
        return (
            <div className="h-full">
                <ErrorBoundary>
                    <X6GraphFlowEditor
                        graphId={editingGraphId}
                        graphData={editingGraphData}
                        adminToken={adminToken}
                        onSave={handleEditorSave}
                        onCancel={handleEditorCancel}
                    />
                </ErrorBoundary>
            </div>
        );
    }

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-sm">管理Graph流程定义。Graph用于定义复杂的剧本流程逻辑。</p>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleCreateNewEditor} className="bg-indigo-600 hover:bg-indigo-500 text-sm">
                            + 新增Graph（流程编辑器）
                        </Button>
                        <Button onClick={switchToCreate} className="bg-slate-600 hover:bg-slate-500 text-sm ml-2">
                            + 新增Graph（快速创建）
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-slate-400">加载中...</div>
                ) : (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">ID</th>
                                    <th className="p-4">名称</th>
                                    <th className="p-4">类型</th>
                                    <th className="p-4">描述</th>
                                    <th className="p-4">版本</th>
                                    <th className="p-4">状态</th>
                                    <th className="p-4 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {graphs.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-slate-400">
                                            暂无Graph定义，点击上方按钮创建
                                        </td>
                                    </tr>
                                ) : (
                                    graphs.map(graph => (
                                        <tr key={graph.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 text-sm text-slate-400">#{graph.id}</td>
                                            <td className="p-4 font-bold text-white">{graph.name}</td>
                                            <td className="p-4 text-sm text-slate-400">
                                                <span className="bg-indigo-800 text-indigo-300 px-2 py-1 rounded text-xs">
                                                    {graph.graphType || 'SCRIPT'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-slate-400 max-w-xs truncate">
                                                {graph.description || '-'}
                                            </td>
                                            <td className="p-4 text-sm text-slate-400">v{graph.version || 1}</td>
                                            <td className="p-4">
                                                {graph.isActive ? (
                                                    <span className="text-xs bg-green-800 text-green-300 px-2 py-1 rounded">启用</span>
                                                ) : (
                                                    <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded">禁用</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleOpenEditor(graph)}
                                                    className="text-indigo-400 hover:text-white text-sm font-medium"
                                                >
                                                    编辑流程
                                                </button>
                                                <button
                                                    onClick={() => switchToEdit(graph)}
                                                    className="text-indigo-400 hover:text-white text-sm font-medium"
                                                >
                                                    编辑
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(graph.id!)}
                                                    className="text-red-400 hover:text-white text-sm font-medium"
                                                >
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6">
                {viewMode === 'create' ? '新建Graph定义' : '编辑Graph定义'}
            </h3>

            <InputGroup label="Graph名称 *">
                <TextInput
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="请输入Graph名称"
                />
            </InputGroup>

            <InputGroup label="描述">
                <TextArea
                    value={formData.description || ''}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    placeholder="请输入Graph描述"
                />
            </InputGroup>

            <InputGroup label="Graph类型">
                <select
                    value={formData.graphType || 'SCRIPT'}
                    onChange={e => setFormData({...formData, graphType: e.target.value})}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                >
                    <option value="SCRIPT">剧本流程</option>
                    <option value="SKILL_CHECK">技能检查</option>
                </select>
            </InputGroup>

            <InputGroup label="开始节点ID">
                <TextInput
                    value={formData.startNodeId || ''}
                    onChange={e => setFormData({...formData, startNodeId: e.target.value})}
                    placeholder="开始节点的ID（如：start）"
                />
            </InputGroup>

            <InputGroup label="状态">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.isActive !== undefined ? formData.isActive : true}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-indigo-600 bg-slate-800 border-slate-600 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-300">启用</span>
                </label>
            </InputGroup>

            <div className="mt-6 flex gap-3">
                <Button
                    onClick={handleSave}
                    className="bg-indigo-600 hover:bg-indigo-500 flex-1"
                >
                    {editingId ? '更新' : '创建'}
                </Button>
                <Button
                    onClick={switchToList}
                    className="bg-slate-700 hover:bg-slate-600 flex-1"
                >
                    取消
                </Button>
            </div>

            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-xs text-slate-400">
                    <strong>提示：</strong>节点和边的配置需要通过"编辑流程"功能进行可视化编辑。
                    创建后点击列表中的"编辑流程"按钮进入流程编辑器。
                </p>
            </div>
        </div>
    );
};
