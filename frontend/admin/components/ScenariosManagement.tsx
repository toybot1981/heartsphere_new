import React, { useState, useEffect } from 'react';
import { GameState, CustomScenario } from '../../types';
import { adminApi, systemScriptApi } from '../../services/api';
import { showAlert, showConfirm } from '../../utils/dialog';
import { Button } from '../../components/Button';
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { ScenarioNodeFlow } from './ScenarioNodeFlow';
import { ScenarioBuilder } from '../../components/ScenarioBuilder';
import { WORLD_SCENES } from '../../constants';

interface ScenariosManagementProps {
    systemScripts: any[];
    systemEras: any[];
    systemCharacters: any[];
    systemWorlds: any[];
    gameState: GameState;
    adminToken: string | null;
    onRefresh: () => Promise<void>;
    onUpdateGameState: (newState: GameState) => void;
}

export const ScenariosManagement: React.FC<ScenariosManagementProps> = ({
    systemScripts,
    systemEras,
    systemCharacters,
    systemWorlds,
    gameState,
    adminToken,
    onRefresh,
    onUpdateGameState
}) => {
    const [viewMode, setViewMode] = useState<'list' | 'edit' | 'create'>('list');
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [formData, setFormData] = useState<any>({});
    const [scenarioEraFilter, setScenarioEraFilter] = useState<number | 'all'>('all');
    const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);

    const allScenes = [...WORLD_SCENES, ...gameState.customScenes];

    // 加载剧本数据
    useEffect(() => {
        if (adminToken) {
            loadScenariosData();
        }
    }, [adminToken]);

    const loadScenariosData = async () => {
        if (!adminToken) return;
        console.log("========== [ScenariosManagement] 加载预置剧本数据 ==========");
        try {
            const scripts = await systemScriptApi.getAll(adminToken);
            console.log("[ScenariosManagement] 预置剧本数据加载结果:", {
                scripts: Array.isArray(scripts) ? scripts.length : 0
            });
            // 注意：这里不能直接设置 systemScripts，需要通过父组件刷新
            await onRefresh();
        } catch (error) {
            console.error('[ScenariosManagement] 加载预置剧本数据失败:', error);
        }
    };

    const switchToCreate = () => {
        setFormData({
            nodes: JSON.stringify({
                start: {
                    id: 'start',
                    title: '开始',
                    content: '这是故事的开始...',
                    choices: []
                }
            }, null, 2),
            startNodeId: 'start'
        });
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (item: any) => {
        setFormData(JSON.parse(JSON.stringify(item)));
        setEditingId(item.id);
        setViewMode('edit');
    };

    const switchToList = () => {
        setViewMode('list');
        setEditingId(null);
        setFormData({});
        setShowScenarioBuilder(false);
        setSelectedNodeId(undefined);
    };

    const saveScenario = async () => {
        if (!adminToken) return;
        
        try {
            // 解析节点数据
            let nodes = {};
            try {
                nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes) : (formData.nodes || {});
            } catch (e) {
                showAlert('节点 JSON 格式错误，请检查格式', '格式错误', 'error');
                return;
            }

            // 获取第一个世界ID作为默认值（如果没有指定）
            const defaultWorldId = systemWorlds.length > 0 ? systemWorlds[0].id : 1;
            
            // 构建剧本内容，包含参与角色信息
            const contentData: any = {
                startNodeId: formData.startNodeId || 'start',
                nodes: nodes
            };
            
            // 如果有参与角色，添加到内容中
            if (Array.isArray(formData.participatingCharacters) && formData.participatingCharacters.length > 0) {
                contentData.participatingCharacters = formData.participatingCharacters;
            }
            
            const scriptData = {
                title: formData.title || '新剧本',
                description: formData.description || '',
                content: JSON.stringify(contentData),
                worldId: formData.worldId ? parseInt(formData.worldId) : defaultWorldId,
                eraId: formData.eraId ? parseInt(formData.eraId) : undefined
            };

            if (editingId && typeof editingId === 'number') {
                // 更新现有剧本（使用管理员API）
                await adminApi.scripts.update(editingId, scriptData, adminToken);
            } else {
                // 创建新剧本（使用管理员API）
                const userId = formData.userId ? parseInt(formData.userId) : 
                              (systemWorlds.find(w => w.id === scriptData.worldId)?.userId || 1);
                
                await adminApi.scripts.create({
                    ...scriptData,
                    userId: userId
                }, adminToken);
            }
            
            // 重新加载数据
            await onRefresh();
            switchToList();
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
            console.error('保存剧本失败:', error);
        }
    };

    const deleteScenario = async (id: string | number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定删除此剧本吗？', '删除剧本', 'danger');
        if (!confirmed) return;
        
        try {
            if (typeof id === 'number') {
                // 使用管理员API删除
                await adminApi.scripts.delete(id, adminToken);
            } else {
                // 如果是本地创建的剧本（字符串ID），只从本地状态删除
                const updatedScenarios = gameState.customScenarios.filter(s => s.id !== id);
                onUpdateGameState({ ...gameState, customScenarios: updatedScenarios });
                return;
            }
            
            // 重新加载数据
            await onRefresh();
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
            console.error('删除剧本失败:', error);
        }
    };

    const handleCreateDefaultScripts = async () => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要为每个场景创建两个默认剧本吗？', '创建默认剧本', 'info');
        if (!confirmed) return;
        
        try {
            const defaultWorldId = systemWorlds.length > 0 ? systemWorlds[0].id : 1;
            const userId = systemWorlds.find(w => w.id === defaultWorldId)?.userId || 1;
            
            let createdCount = 0;
            for (const era of systemEras) {
                // 获取该场景的角色
                const eraCharacters = systemCharacters.filter(c => c.systemEraId === era.id);
                const characterIds = eraCharacters.length > 0 
                    ? eraCharacters.slice(0, 3).map(c => c.id.toString()) // 最多选择3个角色
                    : [];
                
                // 创建第一个剧本
                const script1 = {
                    title: `${era.name} - 初遇`,
                    description: `在${era.name}的初次相遇，探索角色之间的关系。`,
                    content: JSON.stringify({
                        startNodeId: 'start',
                        nodes: {
                            start: {
                                id: 'start',
                                title: '初遇',
                                prompt: characterIds.length > 0 
                                    ? `你来到了${era.name}，遇到了${characterIds.map(id => {
                                        const char = eraCharacters.find(c => c.id.toString() === id);
                                        return char?.name || '';
                                    }).filter(Boolean).join('、')}。开始你们的对话吧。`
                                    : `你来到了${era.name}，开始探索这个场景的故事。`,
                                options: []
                            }
                        },
                        participatingCharacters: characterIds
                    }),
                    worldId: defaultWorldId,
                    eraId: era.id,
                    userId: userId
                };
                
                // 创建第二个剧本
                const script2 = {
                    title: `${era.name} - 深入`,
                    description: `在${era.name}的深入探索，了解更多角色背后的故事。`,
                    content: JSON.stringify({
                        startNodeId: 'start',
                        nodes: {
                            start: {
                                id: 'start',
                                title: '深入探索',
                                prompt: characterIds.length > 0
                                    ? `在${era.name}中，你与${characterIds.map(id => {
                                        const char = eraCharacters.find(c => c.id.toString() === id);
                                        return char?.name || '';
                                    }).filter(Boolean).join('、')}的关系进一步加深。探索他们背后的故事和秘密。`
                                    : `在${era.name}中，你开始深入了解这个场景的秘密。`,
                                options: []
                            }
                        },
                        participatingCharacters: characterIds
                    }),
                    worldId: defaultWorldId,
                    eraId: era.id,
                    userId: userId
                };
                
                try {
                    await adminApi.scripts.create(script1, adminToken);
                    await adminApi.scripts.create(script2, adminToken);
                    createdCount += 2;
                } catch (err: any) {
                    console.error(`为场景 ${era.name} 创建剧本失败:`, err);
                }
            }
            
            showAlert(`成功为 ${createdCount / 2} 个场景创建了 ${createdCount} 个默认剧本`, '创建成功', 'success');
            await onRefresh();
        } catch (error: any) {
            showAlert('创建默认剧本失败: ' + (error.message || '未知错误'), '创建失败', 'error');
            console.error('创建默认剧本失败:', error);
        }
    };

    return (
        <>
            {viewMode === 'list' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <p className="text-slate-400 text-sm">管理互动分支剧本。</p>
                        <div className="flex gap-2">
                            <Button 
                                onClick={handleCreateDefaultScripts}
                                className="bg-green-600 hover:bg-green-500 text-sm"
                            >
                                为所有场景创建默认剧本
                            </Button>
                            <Button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-500 text-sm">+ 新增剧本</Button>
                        </div>
                    </div>
                    {/* 场景过滤 */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 whitespace-nowrap">筛选场景：</span>
                            <select
                                value={scenarioEraFilter === 'all' ? '' : scenarioEraFilter}
                                onChange={(e) => setScenarioEraFilter(e.target.value === '' ? 'all' : parseInt(e.target.value))}
                                className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">全部场景</option>
                                {systemEras.map(era => (
                                    <option key={era.id} value={era.id}>{era.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">标题</th>
                                    <th className="p-4">对应场景</th>
                                    <th className="p-4">作者</th>
                                    <th className="p-4">节点数</th>
                                    <th className="p-4 text-right">操作</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {/* 显示系统预设的剧本 */}
                                {systemScripts
                                    .filter((script: any) => 
                                        scenarioEraFilter === 'all' || script.systemEraId === scenarioEraFilter
                                    )
                                    .map((script: any) => {
                                    let content: { startNodeId?: string; nodes?: Record<string, any>; participatingCharacters?: string[] } = {};
                                    let nodeCount = 0;
                                    try {
                                        const parsed = typeof script.content === 'string' ? JSON.parse(script.content) : (script.content || {});
                                        content = parsed as { startNodeId?: string; nodes?: Record<string, any>; participatingCharacters?: string[] };
                                        nodeCount = content.nodes ? Object.keys(content.nodes).length : 0;
                                    } catch (e) {
                                        console.error('解析剧本内容失败:', e);
                                    }
                                    
                                    // 系统预设剧本使用 systemEraId 和 eraName
                                    const eraName = script.eraName || systemEras.find(e => e.id === script.systemEraId)?.name || '未指定';
                                    return (
                                        <tr key={script.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-bold text-white">{script.title}</td>
                                            <td className="p-4 text-sm text-slate-400">{eraName}</td>
                                            <td className="p-4 text-sm text-slate-400">系统预设</td>
                                            <td className="p-4 text-sm text-slate-400">{nodeCount}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => {
                                                    const editData = {
                                                        ...script,
                                                        title: script.title,
                                                        description: script.description || '',
                                                        eraId: script.systemEraId?.toString() || '',
                                                        startNodeId: content.startNodeId || 'start',
                                                        nodes: JSON.stringify(content.nodes || {}, null, 2),
                                                        participatingCharacters: content.participatingCharacters || []
                                                    };
                                                    switchToEdit(editData);
                                                }} className="text-indigo-400 hover:text-white text-sm font-medium">编辑</button>
                                                <button onClick={() => deleteScenario(script.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {/* 显示本地自定义剧本 */}
                                {gameState.customScenarios
                                    .filter(scen => {
                                        if (scenarioEraFilter === 'all') return true;
                                        // 查找对应的场景
                                        const era = systemEras.find(e => e.id.toString() === scen.sceneId);
                                        return era && era.id === scenarioEraFilter;
                                    })
                                    .map(scen => {
                                    const sceneName = allScenes.find(s => s.id === scen.sceneId)?.name || '未知';
                                    return (
                                        <tr key={scen.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="p-4 font-bold text-white">{scen.title}</td>
                                            <td className="p-4 text-sm text-slate-400">{sceneName}</td>
                                            <td className="p-4 text-sm text-slate-400">{scen.author}</td>
                                            <td className="p-4 text-sm text-slate-400">{Object.keys(scen.nodes).length}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button onClick={() => {
                                                    // Convert nodes object to formatted JSON string for editing
                                                    const editData = { ...scen, nodes: JSON.stringify(scen.nodes, null, 2) };
                                                    switchToEdit(editData);
                                                }} className="text-indigo-400 hover:text-white text-sm font-medium">编辑</button>
                                                <button onClick={() => deleteScenario(scen.id)} className="text-red-400 hover:text-white text-sm font-medium">删除</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {systemScripts.length === 0 && gameState.customScenarios.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">暂无剧本</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {(viewMode === 'create' || viewMode === 'edit') && (
                <div className="max-w-4xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-6">{viewMode === 'create' ? '新建剧本' : '编辑剧本'}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <InputGroup label="剧本标题">
                            <TextInput value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </InputGroup>
                        <InputGroup label="所属场景">
                            <select 
                                value={formData.eraId || ''} 
                                onChange={e => {
                                    const eraId = e.target.value;
                                    setFormData({...formData, eraId: eraId});
                                    // 当场景改变时，清空已选角色（因为它们可能不属于新场景）
                                    if (eraId) {
                                        setFormData(prev => ({
                                            ...prev,
                                            eraId: eraId,
                                            participatingCharacters: []
                                        }));
                                    }
                                }}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                            >
                                <option value="">未指定</option>
                                {systemEras.map(era => <option key={era.id} value={era.id}>{era.name}</option>)}
                            </select>
                        </InputGroup>
                    </div>
                    <InputGroup label="简介">
                        <TextArea value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} />
                    </InputGroup>
                    
                    {/* 参与角色选择 */}
                    <div className="mt-6">
                        <h4 className="text-sm font-bold text-purple-400 border-b border-purple-900/30 pb-2 mb-4">参与角色</h4>
                        <p className="text-xs text-slate-500 mb-3">选择参与此剧本的角色，故事流程将主要围绕这些角色展开。</p>
                        {formData.eraId ? (
                            <div className="space-y-2">
                                {systemCharacters
                                    .filter(char => char.systemEraId?.toString() === formData.eraId)
                                    .map(char => {
                                        const isSelected = Array.isArray(formData.participatingCharacters) && formData.participatingCharacters.includes(char.id.toString());
                                        return (
                                            <label key={char.id} className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={e => {
                                                        const currentChars = Array.isArray(formData.participatingCharacters) ? formData.participatingCharacters : [];
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                participatingCharacters: [...currentChars, char.id.toString()]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                participatingCharacters: currentChars.filter(id => id !== char.id.toString())
                                                            });
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <img src={char.avatarUrl || 'https://picsum.photos/seed/avatar/400/600'} alt={char.name} className="w-10 h-10 rounded-full object-cover border border-slate-600" />
                                                <div className="flex-1">
                                                    <div className="text-white font-medium">{char.name}</div>
                                                    <div className="text-xs text-slate-400">{char.role || '未定义'}</div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                {systemCharacters.filter(char => char.systemEraId?.toString() === formData.eraId).length === 0 && (
                                    <p className="text-sm text-slate-500 text-center py-4">该场景暂无角色，请先创建角色。</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 text-center py-4">请先选择所属场景，然后选择参与角色。</p>
                        )}
                    </div>

                    {/* 节点内容编辑 */}
                    <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">剧本节点内容</h4>
                            <div className="flex gap-2">
                                <Button 
                                    onClick={() => {
                                        // 初始化空节点结构
                                        const emptyNodes = {
                                            start: {
                                                id: 'start',
                                                title: '开始',
                                                content: '这是故事的开始...',
                                                choices: []
                                            }
                                        };
                                        setFormData({
                                            ...formData,
                                            nodes: JSON.stringify(emptyNodes, null, 2),
                                            startNodeId: 'start'
                                        });
                                    }}
                                    className="bg-slate-600 hover:bg-slate-500 text-sm"
                                >
                                    🆕 初始化节点
                                </Button>
                                <Button 
                                    onClick={() => {
                                        try {
                                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                                            setShowScenarioBuilder(true);
                                        } catch (e) {
                                            showAlert('节点 JSON 格式错误，请先修复格式', '格式错误', 'error');
                                        }
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-sm"
                                >
                                    📝 打开可视化编辑器
                                </Button>
                            </div>
                        </div>
                        <div className="mb-4">
                            <InputGroup label="起始节点ID">
                                <TextInput 
                                    value={formData.startNodeId || 'start'} 
                                    onChange={e => setFormData({...formData, startNodeId: e.target.value})}
                                    placeholder="start"
                                />
                            </InputGroup>
                        </div>
                        <InputGroup label="节点 JSON 数据">
                            <TextArea 
                                value={formData.nodes || ''} 
                                onChange={e => setFormData({...formData, nodes: e.target.value})} 
                                rows={15}
                                placeholder='{"start": {"id": "start", "title": "开始", "content": "这是故事的开始...", "choices": []}}'
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                💡 提示：可以直接编辑 JSON 格式的节点数据，或使用可视化编辑器进行编辑。节点格式示例：<code className="text-slate-400">&#123;"id": "节点ID", "title": "节点标题", "content": "节点内容", "choices": [&#123;"text": "选择文本", "nextNodeId": "下一个节点ID"&#125;]&#125;</code>
                            </p>
                        </InputGroup>
                    </div>

                    {/* 节点流程可视化 */}
                    {(() => {
                        try {
                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                            if (nodes && typeof nodes === 'object' && Object.keys(nodes).length > 0) {
                                return (
                                    <div className="mt-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">节点流程预览</h4>
                                        </div>
                                        <ScenarioNodeFlow
                                            nodes={nodes}
                                            startNodeId={formData.startNodeId || 'start'}
                                            selectedNodeId={selectedNodeId}
                                            onNodeClick={(nodeId) => {
                                                setSelectedNodeId(nodeId);
                                            }}
                                        />
                                    </div>
                                );
                            }
                        } catch (e) {
                            // JSON 解析失败，不显示可视化
                            return (
                                <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                                    <p className="text-sm text-red-400">⚠️ 节点 JSON 格式错误，无法显示预览。请检查 JSON 格式。</p>
                                </div>
                            );
                        }
                        return null;
                    })()}

                    <div className="flex justify-end gap-3 mt-8">
                        <Button variant="ghost" onClick={switchToList}>取消</Button>
                        <Button onClick={saveScenario} className="bg-indigo-600">保存剧本</Button>
                    </div>
                    
                    {/* 可视化编辑器弹窗 */}
                    {showScenarioBuilder && (() => {
                        try {
                            const nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
                            const scenario: CustomScenario = {
                                id: editingId?.toString() || 'temp',
                                sceneId: formData.eraId?.toString() || '',
                                title: formData.title || '新剧本',
                                description: formData.description || '',
                                nodes: nodes,
                                startNodeId: formData.startNodeId || 'start',
                                author: 'Admin',
                                participatingCharacters: formData.participatingCharacters || []
                            };
                            
                            return (
                                <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm">
                                    <ScenarioBuilder
                                        initialScenario={scenario}
                                        onSave={(updatedScenario) => {
                                            // 更新表单数据
                                            setFormData({
                                                ...formData,
                                                title: updatedScenario.title,
                                                description: updatedScenario.description,
                                                nodes: JSON.stringify(updatedScenario.nodes, null, 2),
                                                startNodeId: updatedScenario.startNodeId,
                                                participatingCharacters: updatedScenario.participatingCharacters || formData.participatingCharacters || []
                                            });
                                            setShowScenarioBuilder(false);
                                            setSelectedNodeId(undefined);
                                        }}
                                        onCancel={() => {
                                            setShowScenarioBuilder(false);
                                            setSelectedNodeId(undefined);
                                        }}
                                    />
                                </div>
                            );
                        } catch (e) {
                            return (
                                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                                    <div className="bg-slate-900 border border-red-500/50 rounded-2xl p-6 max-w-md">
                                        <h3 className="text-lg font-bold text-red-400 mb-2">无法打开编辑器</h3>
                                        <p className="text-sm text-slate-400 mb-4">节点数据格式错误，请先修复 JSON 格式。</p>
                                        <Button onClick={() => setShowScenarioBuilder(false)} className="bg-indigo-600 w-full">关闭</Button>
                                    </div>
                                </div>
                            );
                        }
                    })()}
                </div>
            )}
        </>
    );
};

