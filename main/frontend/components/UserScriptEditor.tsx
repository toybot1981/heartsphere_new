import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { ScenarioBuilder } from './ScenarioBuilder';
import { CustomScenario, StoryNode, Character, WorldScene } from '../types';
import { scriptApi, characterApi } from '../services/api';
import { showAlert, showConfirm } from '../utils/dialog';
import { aiService } from '../services/ai';

interface UserScriptEditorProps {
    script: any; // 后端返回的script对象
    scenes: WorldScene[]; // 用户场景列表
    onSave: () => void; // 保存成功后的回调
    onCancel: () => void; // 取消编辑
    token: string; // 用户token
}

export const UserScriptEditor: React.FC<UserScriptEditorProps> = ({
    script,
    scenes,
    onSave,
    onCancel,
    token
}) => {
    const [formData, setFormData] = useState<any>({});
    const [showScenarioBuilder, setShowScenarioBuilder] = useState(false);
    const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>(undefined);
    const [characters, setCharacters] = useState<Character[]>([]);
    const [loading, setLoading] = useState(false);
    const [aiGenerating, setAiGenerating] = useState(false);

    // 初始化表单数据
    useEffect(() => {
        if (script) {
            console.log('[UserScriptEditor] 初始化表单数据，接收到的script对象:', {
                id: script.id,
                title: script.title,
                description: script.description,
                eraId: script.eraId,
                worldId: script.worldId,
                tags: script.tags,
                characterIds: script.characterIds,
                hasContent: !!script.content
            });
            
            try {
                const content = JSON.parse(script.content || '{}');
                
                // 解析characterIds（JSON数组格式）
                let participatingCharacters = content.participatingCharacters || [];
                if (script.characterIds) {
                    try {
                        const charIds = JSON.parse(script.characterIds);
                        if (Array.isArray(charIds)) {
                            // 转换为字符串数组以匹配Character.id的类型
                            participatingCharacters = charIds.map(id => id.toString());
                        }
                    } catch (e) {
                        console.warn('解析characterIds失败:', e);
                    }
                }
                
                const initialFormData = {
                    title: script.title || '',
                    description: script.description || '',
                    eraId: script.eraId?.toString() || '',
                    worldId: script.worldId?.toString() || '',
                    nodes: JSON.stringify(content.nodes || {}, null, 2),
                    startNodeId: content.startNodeId || 'start',
                    participatingCharacters: participatingCharacters,
                    characterIds: script.characterIds || null,
                    tags: script.tags || null
                };
                
                console.log('[UserScriptEditor] 设置表单数据:', {
                    title: initialFormData.title,
                    description: initialFormData.description,
                    eraId: initialFormData.eraId,
                    tags: initialFormData.tags,
                    characterIds: initialFormData.characterIds
                });
                
                setFormData(initialFormData);
            } catch (e) {
                console.error('解析剧本内容失败:', e);
                
                // 解析characterIds（即使content解析失败）
                let participatingCharacters: string[] = [];
                if (script.characterIds) {
                    try {
                        const charIds = JSON.parse(script.characterIds);
                        if (Array.isArray(charIds)) {
                            participatingCharacters = charIds.map(id => id.toString());
                        }
                    } catch (e) {
                        console.warn('解析characterIds失败:', e);
                    }
                }
                
                setFormData({
                    title: script.title || '',
                    description: script.description || '',
                    eraId: script.eraId?.toString() || '',
                    worldId: script.worldId?.toString() || '',
                    nodes: '{}',
                    startNodeId: 'start',
                    participatingCharacters: participatingCharacters,
                    characterIds: script.characterIds || null,
                    tags: script.tags || null
                });
            }
        }
    }, [script]);

    // 加载场景的角色列表
    useEffect(() => {
        const loadCharacters = async () => {
            if (formData.eraId) {
                try {
                    const eraId = parseInt(formData.eraId);
                    const chars = await characterApi.getCharactersByEraId(eraId, token);
                    // 转换为Character格式
                    const formattedChars: Character[] = chars.map(char => ({
                        id: char.id.toString(),
                        name: char.name,
                        age: char.age || 0,
                        role: '未定义',
                        bio: char.description || '',
                        avatarUrl: '',
                        backgroundUrl: '',
                        themeColor: 'indigo-500',
                        colorAccent: '#6366f1',
                        firstMessage: '',
                        systemInstruction: '',
                        voiceName: 'Aoede',
                        tags: [],
                        speechStyle: '',
                        catchphrases: [],
                        secrets: '',
                        motivations: ''
                    }));
                    setCharacters(formattedChars);
                } catch (error) {
                    console.error('加载角色失败:', error);
                    setCharacters([]);
                }
            } else {
                setCharacters([]);
            }
        };
        loadCharacters();
    }, [formData.eraId, token]);

    // 获取当前场景的角色（包括本地场景中的角色）
    const getCurrentSceneCharacters = (): Character[] => {
        if (!formData.eraId) return [];
        const scene = scenes.find(s => s.id === formData.eraId);
        if (scene) {
            return scene.characters || [];
        }
        return characters;
    };

    const handleSave = async () => {
        if (!formData.title) {
            showAlert('请输入剧本标题', '缺少标题', 'warning');
            return;
        }

        setLoading(true);
        try {
            // 解析节点数据
            let nodes = {};
            try {
                nodes = typeof formData.nodes === 'string' ? JSON.parse(formData.nodes) : (formData.nodes || {});
            } catch (e) {
                showAlert('节点 JSON 格式错误，请检查格式', '格式错误', 'error');
                setLoading(false);
                return;
            }

            // 构建剧本内容，包含参与角色信息
            const contentData: any = {
                startNodeId: formData.startNodeId || 'start',
                nodes: nodes
            };
            
            // 如果有参与角色，添加到内容中
            if (Array.isArray(formData.participatingCharacters) && formData.participatingCharacters.length > 0) {
                contentData.participatingCharacters = formData.participatingCharacters;
            }

            // 构建characterIds（JSON数组格式）
            let characterIds = null;
            if (Array.isArray(formData.participatingCharacters) && formData.participatingCharacters.length > 0) {
                // 将角色ID转换为数字数组，然后转为JSON字符串
                const charIds = formData.participatingCharacters
                    .map(id => {
                        // 如果id是字符串，尝试解析；如果是数字，直接使用
                        const numId = typeof id === 'string' ? parseInt(id) : id;
                        return isNaN(numId) ? null : numId;
                    })
                    .filter(id => id !== null);
                if (charIds.length > 0) {
                    characterIds = JSON.stringify(charIds);
                }
            }

            // 获取 worldId：优先使用 formData，其次使用 script，最后从场景中获取
            let worldId = null;
            if (formData.worldId) {
                worldId = parseInt(formData.worldId);
            } else if (script.worldId) {
                worldId = parseInt(script.worldId.toString());
            } else if (formData.eraId) {
                // 从场景中获取 worldId
                const scene = scenes.find(s => s.id === formData.eraId || s.id === `era_${formData.eraId}`);
                if (scene && scene.worldId) {
                    worldId = typeof scene.worldId === 'number' ? scene.worldId : parseInt(scene.worldId.toString());
                }
            }
            
            // 如果 worldId 仍然为空，提示用户
            if (!worldId || isNaN(worldId)) {
                showAlert('无法确定世界ID，请先选择场景', '缺少必要信息', 'warning');
                setLoading(false);
                return;
            }

            const scriptData = {
                title: formData.title,
                description: formData.description || '',
                content: JSON.stringify(contentData),
                sceneCount: Object.keys(nodes).length || 1,
                characterIds: characterIds,
                tags: formData.tags || null,
                worldId: worldId,
                eraId: formData.eraId ? parseInt(formData.eraId) : undefined
            };

            if (script.id) {
                // 更新现有剧本
                await scriptApi.updateScript(script.id, scriptData, token);
                showAlert('剧本保存成功', '保存成功', 'success');
            } else {
                // 创建新剧本
                await scriptApi.createScript(scriptData, token);
                showAlert('剧本创建成功', '创建成功', 'success');
            }
            
            onSave();
        } catch (error: any) {
            console.error('保存剧本失败:', error);
            showAlert('保存失败: ' + (error.message || '未知错误'), '保存失败', 'error');
        } finally {
            setLoading(false);
        }
    };

    // AI一键创建剧本
    const handleAiGenerate = async () => {
        if (!formData.title) {
            showAlert('请先输入剧本标题', '缺少标题', 'warning');
            return;
        }
        if (!formData.eraId) {
            showAlert('请先选择所属场景', '缺少场景', 'warning');
            return;
        }

        const currentSceneCharacters = getCurrentSceneCharacters();
        // 检查场景是否有角色
        if (currentSceneCharacters.length === 0) {
            showAlert('该场景暂无角色，请先创建角色', '缺少角色', 'warning');
            return;
        }

        setAiGenerating(true);
        try {
            // 随机选择2-4个角色参与剧本
            const numCharacters = Math.min(
                Math.max(2, Math.floor(currentSceneCharacters.length * 0.6)), // 选择60%的角色，最少2个
                Math.min(4, currentSceneCharacters.length) // 最多4个
            );
            
            // 随机打乱角色数组并选择前numCharacters个
            const shuffled = [...currentSceneCharacters].sort(() => Math.random() - 0.5);
            const selectedCharacters = shuffled.slice(0, numCharacters);

            // 获取场景信息
            const selectedScene = scenes.find(s => s.id === formData.eraId);
            
            // 调用AI生成剧本
            const result = await aiService.generateScriptWithCharacters({
                title: formData.title,
                sceneName: selectedScene?.name || '未知场景',
                sceneDescription: selectedScene?.description,
                description: formData.description || '',
                tags: formData.tags || '',
                characters: selectedCharacters.map(char => ({
                    id: char.id,
                    name: char.name,
                    role: char.role,
                    bio: char.bio
                }))
            });

            // 更新表单数据
            setFormData({
                ...formData,
                nodes: JSON.stringify(result.nodes, null, 2),
                startNodeId: result.startNodeId,
                participatingCharacters: selectedCharacters.map(char => char.id) // 设置参与角色
            });

            showAlert('AI剧本生成成功！', '生成成功', 'success');
        } catch (error: any) {
            console.error('AI生成剧本失败:', error);
            let errorMsg = '生成失败，请稍后重试';
            if (error?.message?.includes('API config missing') || error?.message?.includes('API Key')) {
                errorMsg = '未配置 API Key，请前往设置配置 AI 模型的 API Key';
            } else if (error?.message?.includes('429') || error?.message?.includes('quota')) {
                errorMsg = 'API 配额已耗尽或请求过于频繁，请稍后再试';
            }
            showAlert(errorMsg, '生成失败', 'error');
        } finally {
            setAiGenerating(false);
        }
    };

    const currentSceneCharacters = getCurrentSceneCharacters();

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-4xl w-full bg-slate-900 p-8 rounded-xl border border-slate-800 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">{script.id ? '编辑剧本' : '创建剧本'}</h3>
                    {!script.id && (
                        <Button 
                            onClick={handleAiGenerate}
                            disabled={aiGenerating || !formData.title || !formData.eraId}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white"
                        >
                            {aiGenerating ? '✨ AI生成中...' : '✨ AI一键创建'}
                        </Button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">剧本标题</label>
                        <input 
                            type="text"
                            value={formData.title || ''} 
                            onChange={e => setFormData({...formData, title: e.target.value})} 
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">所属场景</label>
                        <select 
                            value={formData.eraId || ''} 
                            onChange={e => {
                                const eraId = e.target.value;
                                setFormData({
                                    ...formData, 
                                    eraId: eraId,
                                    participatingCharacters: [] // 清空已选角色
                                });
                            }}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        >
                            <option value="">未指定</option>
                            {scenes.map(scene => (
                                <option key={scene.id} value={scene.id}>{scene.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">简介</label>
                    <textarea 
                        value={formData.description || ''} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        rows={2} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                    />
                </div>

                {/* 标签 */}
                <div className="mt-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">标签（逗号分隔）</label>
                        <input 
                            type="text"
                            value={formData.tags || ''} 
                            onChange={e => setFormData({...formData, tags: e.target.value})} 
                            placeholder="例如: 冒险,浪漫,校园"
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                        />
                    </div>
                </div>
                
                {/* 参与角色显示（AI自动选择） */}
                <div className="mt-6">
                    <h4 className="text-sm font-bold text-purple-400 border-b border-purple-900/30 pb-2 mb-4">参与角色</h4>
                    <p className="text-xs text-slate-500 mb-3">
                        {script.id 
                            ? '编辑模式下显示已选择的参与角色' 
                            : '点击"AI一键创建"按钮，AI将根据场景中的角色自动选择2-4个角色参与剧本'}
                    </p>
                    {formData.eraId ? (
                        <div className="space-y-2">
                            {(() => {
                                const participatingIds = Array.isArray(formData.participatingCharacters) 
                                    ? formData.participatingCharacters 
                                    : [];
                                const participatingChars = currentSceneCharacters.filter(char => 
                                    participatingIds.includes(char.id)
                                );
                                
                                if (participatingChars.length > 0) {
                                    return participatingChars.map(char => (
                                        <div
                                            key={char.id} 
                                            className="flex items-center gap-3 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg"
                                        >
                                            <img 
                                                src={char.avatarUrl || 'https://picsum.photos/seed/avatar/400/600'} 
                                                alt={char.name} 
                                                className="w-10 h-10 rounded-full object-cover border border-purple-500/50" 
                                            />
                                            <div className="flex-1">
                                                <div className="text-white font-medium">{char.name}</div>
                                                <div className="text-xs text-slate-400">{char.role || '未定义'}</div>
                                            </div>
                                            {char.bio && (
                                                <div className="text-xs text-slate-500 max-w-xs truncate">{char.bio}</div>
                                            )}
                                        </div>
                                    ));
                                } else {
                                    return (
                                        <div className="text-center py-4 text-slate-500">
                                            <p className="text-sm mb-2">暂未选择参与角色</p>
                                            <p className="text-xs">点击"AI一键创建"按钮自动生成剧本并选择角色</p>
                                        </div>
                                    );
                                }
                            })()}
                            {currentSceneCharacters.length === 0 && (
                                <p className="text-sm text-slate-500 text-center py-4">该场景暂无角色，请先创建角色。</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 text-center py-4">请先选择所属场景。</p>
                    )}
                </div>

                {/* 节点流程可视化 */}
                {(() => {
                    try {
                        const nodes = typeof formData.nodes === 'string' 
                            ? JSON.parse(formData.nodes || '{}') 
                            : (formData.nodes || {});
                        if (nodes && typeof nodes === 'object' && Object.keys(nodes).length > 0) {
                            return (
                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-emerald-400 border-b border-emerald-900/30 pb-2 flex-1">节点流程</h4>
                                        <Button 
                                            onClick={() => setShowScenarioBuilder(true)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-sm"
                                        >
                                            📝 打开可视化编辑器
                                        </Button>
                                    </div>
                                    {/* ScenarioNodeFlow 组件已移除，使用 ScenarioBuilder 替代 */}
                                    <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <p className="text-sm text-slate-400 mb-2">节点可视化编辑器（请使用上方的"打开可视化编辑器"按钮）</p>
                                        <div className="text-xs text-slate-500">
                                            {Object.keys(nodes).length} 个节点已定义
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    } catch (e) {
                        // JSON 解析失败，不显示可视化
                    }
                    return null;
                })()}

                {/* JSON节点编辑器 */}
                <div className="mt-6">
                    <p className="text-xs text-slate-500 mb-2">此处直接编辑剧情节点的 JSON 结构。适合高级用户或复制粘贴。</p>
                    <textarea 
                        value={formData.nodes || ''} 
                        onChange={e => setFormData({...formData, nodes: e.target.value})} 
                        rows={15} 
                        className="w-full font-mono text-xs bg-slate-950 border border-slate-800 rounded px-3 py-2 text-emerald-300 focus:border-indigo-500 outline-none"
                        placeholder='{ "start": { "id": "start", "title": "...", "prompt": "...", "options": [] } }'
                    />
                </div>
                
                <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-300 mb-2">起始节点 ID</label>
                    <input 
                        type="text"
                        value={formData.startNodeId || 'start'} 
                        onChange={e => setFormData({...formData, startNodeId: e.target.value})} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none font-mono text-xs" 
                    />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <Button variant="ghost" onClick={onCancel} disabled={loading || aiGenerating}>取消</Button>
                    <Button onClick={handleSave} className="bg-indigo-600" disabled={loading || aiGenerating}>
                        {loading ? '保存中...' : '保存剧本'}
                    </Button>
                </div>
                
                {/* 可视化编辑器弹窗 */}
                {showScenarioBuilder && (() => {
                    try {
                        const nodes = typeof formData.nodes === 'string' 
                            ? JSON.parse(formData.nodes || '{}') 
                            : (formData.nodes || {});
                        const scenario: CustomScenario = {
                            id: script.id?.toString() || 'temp',
                            sceneId: formData.eraId?.toString() || '',
                            title: formData.title || '新剧本',
                            description: formData.description || '',
                            nodes: nodes,
                            startNodeId: formData.startNodeId || 'start',
                            author: '用户',
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
        </div>
    );
};

