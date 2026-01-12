import React from 'react';
import { adminApi } from '../services/api';
import { Button } from "../components/Button";
import { InputGroup, TextInput, TextArea } from './AdminUIComponents';
import { ScenarioNodeFlow } from './ScenarioNodeFlow';
import { useAdminState } from '../contexts/AdminStateContext';
import { showAlert, showConfirm } from "../utils/dialog";

// 类型定义
interface StoryOptionEffect {
  type: 'favorability' | 'event' | 'item';
  target: string;
  value?: number;
}

interface StoryOptionCondition {
  type: 'favorability' | 'event' | 'item' | 'time';
  target: string;
  operator: '>=' | '<=' | '==' | '!=' | '>' | '<' | 'has' | 'not_has';
  value?: number | string;
}

interface StoryOption {
  id: string;
  text: string;
  nextNodeId: string;
  effects?: StoryOptionEffect[];
  conditions?: StoryOptionCondition[];
  hidden?: boolean;
}

// StoryNode 类型定义（保留以供将来类型注解使用）
type StoryNode = {
  id: string;
  title: string;
  prompt: string;
  backgroundHint?: string;
  options: StoryOption[];
  characterIds?: string[];
  focusCharacterId?: string;
  nodeType?: 'fixed' | 'ai-dynamic' | 'ending';
  multiCharacterDialogue?: Array<{
    characterId: string;
    content: string;
    order?: number;
  }>;
  randomEvents?: Array<{
    id: string;
    probability: number;
    effect: StoryOptionEffect;
  }>;
  timeLimit?: number;
  timeoutNodeId?: string;
  aiGenerateOptions?: boolean;
  aiOptionPrompt?: string;
};

// CustomScenario 类型定义（保留以供将来使用 ScenarioBuilder 时使用）
// interface CustomScenario {
//   id: string;
//   sceneId: string;
//   title: string;
//   description: string;
//   nodes: Record<string, StoryNode>;
//   startNodeId: string;
//   author: string;
//   participatingCharacters?: string[];
// }

interface ScenariosManagementProps {
    scripts: any[];
    eras: any[];
    characters: any[];
    worlds: any[];
    adminToken: string | null;
    onReload: () => Promise<void>;
}

export const ScenariosManagement: React.FC<ScenariosManagementProps> = ({
    scripts,
    eras,
    characters,
    // worlds, // 暂时未使用，保留参数以保持接口一致性
    adminToken,
    onReload,
}) => {
    const {
        viewMode,
        setViewMode,
        editingId,
        setEditingId,
        formData,
        setFormData,
        scenarioEraFilter,
        setScenarioEraFilter,
        showScenarioBuilder,
        setShowScenarioBuilder,
        selectedNodeId,
        setSelectedNodeId,
    } = useAdminState();

    const switchToCreate = () => {
        setFormData({
            nodes: JSON.stringify({
                start: {
                    id: 'start',
                    title: '开始',
                    content: '这是故事的开始...',
                    choices: [],
                },
            }, null, 2),
            startNodeId: 'start',
        });
        setEditingId(null);
        setViewMode('create');
    };

    const switchToEdit = (script: any) => {
        let content: any = {};
        try {
            content = typeof script.content === 'string' ? JSON.parse(script.content || '{}') : (script.content || {});
        } catch (e) {
            console.error('解析剧本内容失败:', e);
        }

        const editData = {
            ...script,
            title: script.title,
            description: script.description || '',
            eraId: script.systemEraId?.toString() || '',
            startNodeId: content.startNodeId || 'start',
            nodes: JSON.stringify(content.nodes || {}, null, 2),
            participatingCharacters: content.participatingCharacters || [],
        };
        setFormData(editData);
        setEditingId(script.id.toString());
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
            let nodes: any = {};
            try {
                nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
            } catch (e) {
                throw new Error('节点 JSON 格式错误');
            }

            const content = {
                startNodeId: formData.startNodeId || 'start',
                nodes: nodes,
                participatingCharacters: formData.participatingCharacters || [],
            };

            // 系统剧本DTO格式
            const dto: any = {
                title: formData.title || '新剧本',
                description: formData.description || '',
                content: JSON.stringify(content),
                sceneCount: Object.keys(nodes).length || 1,
                systemEraId: formData.eraId ? parseInt(formData.eraId) : null,
                characterIds: formData.participatingCharacters ? JSON.stringify(formData.participatingCharacters) : null,
                tags: formData.tags || null,
                isActive: formData.isActive !== undefined ? formData.isActive : true,
                sortOrder: formData.sortOrder || 0,
            };

            if (editingId && typeof editingId === 'string') {
                await adminApi.scripts.update(parseInt(editingId), dto, adminToken);
            } else {
                await adminApi.scripts.create(dto, adminToken);
            }

            await onReload();
            switchToList();
            showAlert('保存成功', '成功', 'success');
        } catch (error: any) {
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        }
    };

    const deleteScenario = async (id: number) => {
        if (!adminToken) return;
        const confirmed = await showConfirm('确定要删除这个剧本吗？', '删除剧本', 'danger');
        if (!confirmed) return;

        try {
            await adminApi.scripts.delete(id, adminToken);
            await onReload();
            showAlert('删除成功', '成功', 'success');
        } catch (error: any) {
            showAlert('删除失败: ' + (error.message || '未知错误'), '删除失败', 'error');
        }
    };


    const filteredScripts = scripts.filter((script: any) =>
        scenarioEraFilter === 'all' || script.systemEraId === scenarioEraFilter
    );

    if (viewMode === 'list') {
        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-slate-400 text-sm">管理互动分支剧本。</p>
                    <div className="flex gap-2">
                        <Button onClick={switchToCreate} className="bg-indigo-600 hover:bg-indigo-500 text-sm">
                            + 新增剧本
                        </Button>
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
                            {eras.map((era: any) => (
                                <option key={era.id} value={era.id}>{era.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 剧本列表 */}
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
                            {filteredScripts.map((script: any) => {
                                let nodeCount = 0;
                                try {
                                    const content = typeof script.content === 'string' ? JSON.parse(script.content || '{}') : (script.content || {});
                                    nodeCount = content.nodes ? Object.keys(content.nodes).length : 0;
                                } catch (e) {
                                    // 忽略解析错误
                                }

                                const eraName = script.eraName || eras.find((e: any) => e.id === script.systemEraId)?.name || '未指定';
                                return (
                                    <tr key={script.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="p-4 font-bold text-white">{script.title}</td>
                                        <td className="p-4 text-sm text-slate-400">{eraName}</td>
                                        <td className="p-4 text-sm text-slate-400">系统预设</td>
                                        <td className="p-4 text-sm text-slate-400">{nodeCount}</td>
                                        <td className="p-4 text-right space-x-2">
                                            <button
                                                onClick={() => switchToEdit(script)}
                                                className="text-indigo-400 hover:text-white text-sm font-medium"
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => deleteScenario(script.id)}
                                                className="text-red-400 hover:text-white text-sm font-medium"
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredScripts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">暂无剧本</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // 创建/编辑表单
    let parsedNodes: Record<string, StoryNode> | null = null;
    try {
        parsedNodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes || '{}') : (formData.nodes || {});
    } catch (e) {
        // 忽略解析错误
    }

    return (
        <div className="max-w-4xl mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
            <h3 className="text-xl font-bold text-white mb-6">
                {viewMode === 'create' ? '新建剧本' : '编辑剧本'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <InputGroup label="剧本标题">
                    <TextInput
                        value={formData.title || ''}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                </InputGroup>
                <InputGroup label="所属场景">
                    <select
                        value={formData.eraId || ''}
                        onChange={e => {
                            const eraId = e.target.value;
                            setFormData({
                                ...formData,
                                eraId: eraId,
                                participatingCharacters: [],
                            });
                        }}
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                    >
                        <option value="">未指定</option>
                        {eras.map((era: any) => (
                            <option key={era.id} value={era.id}>{era.name}</option>
                        ))}
                    </select>
                </InputGroup>
            </div>

            <InputGroup label="简介">
                <TextArea
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                />
            </InputGroup>

            {/* 参与角色选择 */}
            <div className="mt-6">
                <h4 className="text-sm font-bold text-purple-400 border-b border-purple-900/30 pb-2 mb-4">参与角色</h4>
                <p className="text-xs text-slate-500 mb-3">选择参与此剧本的角色，故事流程将主要围绕这些角色展开。</p>
                {formData.eraId ? (
                    <div className="space-y-2">
                        {characters
                            .filter((char: any) => char.systemEraId?.toString() === formData.eraId)
                            .map((char: any) => {
                                const isSelected = Array.isArray(formData.participatingCharacters) &&
                                    formData.participatingCharacters.includes(char.id.toString());
                                return (
                                    <label
                                        key={char.id}
                                        className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-700 cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={e => {
                                                const currentChars = Array.isArray(formData.participatingCharacters)
                                                    ? formData.participatingCharacters
                                                    : [];
                                                if (e.target.checked) {
                                                    setFormData({
                                                        ...formData,
                                                        participatingCharacters: [...currentChars, char.id.toString()],
                                                    });
                                                } else {
                                                    setFormData({
                                                        ...formData,
                                                        participatingCharacters: currentChars.filter((id: string) => id !== char.id.toString()),
                                                    });
                                                }
                                            }}
                                            className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <img
                                            src={char.avatarUrl || 'https://picsum.photos/seed/avatar/400/600'}
                                            alt={char.name}
                                            className="w-10 h-10 rounded-full object-cover border border-slate-600"
                                        />
                                        <div className="flex-1">
                                            <div className="text-white font-medium">{char.name}</div>
                                            <div className="text-xs text-slate-400">{char.role || '未定义'}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        {characters.filter((char: any) => char.systemEraId?.toString() === formData.eraId).length === 0 && (
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
                    <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">
                        剧本节点内容
                    </h4>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => {
                                const emptyNodes = {
                                    start: {
                                        id: 'start',
                                        title: '开始',
                                        content: '这是故事的开始...',
                                        choices: [],
                                    },
                                };
                                setFormData({
                                    ...formData,
                                    nodes: JSON.stringify(emptyNodes, null, 2),
                                    startNodeId: 'start',
                                });
                            }}
                            className="bg-slate-600 hover:bg-slate-500 text-sm"
                        >
                            🆕 初始化节点
                        </Button>
                        <Button
                            onClick={() => {
                                try {
                                    // 验证 JSON 格式
                                    typeof formData.nodes === 'string'
                                        ? JSON.parse(formData.nodes || '{}')
                                        : (formData.nodes || {});
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
                            onChange={e => setFormData({ ...formData, startNodeId: e.target.value })}
                            placeholder="start"
                        />
                    </InputGroup>
                </div>
                <InputGroup label="节点 JSON 数据">
                    <TextArea
                        value={formData.nodes || ''}
                        onChange={e => setFormData({ ...formData, nodes: e.target.value })}
                        rows={15}
                        placeholder='{"start": {"id": "start", "title": "开始", "content": "这是故事的开始...", "choices": []}}'
                        className="font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-2">
                        💡 提示：可以直接编辑 JSON 格式的节点数据，或使用可视化编辑器进行编辑。
                    </p>
                </InputGroup>
            </div>

            {/* 节点流程预览 */}
            {parsedNodes && typeof parsedNodes === 'object' && Object.keys(parsedNodes).length > 0 && (
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 mb-4">
                        节点流程预览
                    </h4>
                    <ScenarioNodeFlow
                        nodes={parsedNodes}
                        startNodeId={formData.startNodeId || 'start'}
                        selectedNodeId={selectedNodeId}
                        onNodeClick={(nodeId) => setSelectedNodeId(nodeId)}
                    />
                </div>
            )}

            <div className="flex justify-end gap-3 mt-8">
                <Button variant="ghost" onClick={switchToList}>取消</Button>
                <Button onClick={saveScenario} className="bg-indigo-600">保存剧本</Button>
            </div>

            {/* 可视化编辑器弹窗 */}
            {showScenarioBuilder && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl p-6 max-w-md">
                        <h3 className="text-lg font-bold text-indigo-400 mb-2">可视化编辑器</h3>
                        <p className="text-sm text-slate-400 mb-4">
                            可视化编辑器功能正在开发中，请暂时使用 JSON 编辑器进行编辑。
                        </p>
                        <Button onClick={() => setShowScenarioBuilder(false)} className="bg-indigo-600 w-full">
                            关闭
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

