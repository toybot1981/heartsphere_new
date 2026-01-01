
import React, { useState, useEffect, useMemo } from 'react';
import { CustomScenario, StoryNode, StoryOption, StoryOptionEffect, StoryOptionCondition, Character } from '../types';
import { Button } from './Button';
import { aiService } from '../services/ai';
import { showAlert } from '../utils/dialog';
import { scenarioEventApi, scenarioItemApi, type CreateScenarioEventDTO, type CreateScenarioItemDTO } from '../services/api/scenario';
import { OptionEffectEditor } from './scenario/OptionEffectEditor';
import { OptionConditionEditor } from './scenario/OptionConditionEditor';
import { OptionEditor } from './scenario/OptionEditor';
import { NodeEditor } from './scenario/NodeEditor';

interface ScenarioBuilderProps {
  initialScenario?: CustomScenario | null;
  onSave: (scenario: CustomScenario) => void;
  onCancel: () => void;
  participatingCharacters?: string[]; // 参与剧本的角色ID列表
  sceneId?: string; // 场景ID，用于获取角色列表
  allCharacters?: Character[]; // 所有可选角色列表（如果直接传入）
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ 
  initialScenario, 
  onSave, 
  onCancel,
  participatingCharacters,
  sceneId,
  allCharacters 
}) => {
  const [title, setTitle] = useState('我的新剧本');
  const [description, setDescription] = useState('一段浪漫的冒险...');
  
  const [nodes, setNodes] = useState<Record<string, StoryNode>>({
    'start': { id: 'start', title: '开场场景', prompt: '描述一个阳光明媚的大学早晨。介绍樱向用户跑来的场景。', options: [] }
  });
  const [selectedNodeId, setSelectedNodeId] = useState<string>('start');
  
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  
  // UI状态：折叠面板
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    advancedFeatures: false, // 高级功能折叠面板
    multiCharacter: false,   // 多角色对话
    randomEvents: false,     // 随机事件
    timeSystem: false,       // 时间系统
  });
  
  // 快捷创建模态框状态
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [creatingEventFor, setCreatingEventFor] = useState<{ optionIdx: number; effectIdx: number } | null>(null);
  const [creatingItemFor, setCreatingItemFor] = useState<{ optionIdx: number; effectIdx: number } | null>(null);
  const [createEventForm, setCreateEventForm] = useState({ name: '', eventId: '', description: '' });
  const [createItemForm, setCreateItemForm] = useState({ name: '', itemId: '', description: '', itemType: '' });
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isCreatingItem, setIsCreatingItem] = useState(false);
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  // 获取用户token
  const getToken = () => localStorage.getItem('auth_token');
  
  // 获取场景ID（用于创建事件/物品）
  const getEraId = (): number | undefined => {
    if (initialScenario?.sceneId) {
      // sceneId可能是字符串，尝试转换为数字
      const eraIdNum = parseInt(initialScenario.sceneId);
      return isNaN(eraIdNum) ? undefined : eraIdNum;
    }
    return undefined;
  };
  
  // 创建事件
  const handleCreateEvent = async () => {
    const token = getToken();
    if (!token) {
      showAlert('请先登录', '未登录', 'warning');
      return;
    }
    
    if (!createEventForm.name || !createEventForm.eventId) {
      showAlert('请填写事件名称和事件ID', '缺少参数', 'warning');
      return;
    }
    
    setIsCreatingEvent(true);
    try {
      const createData: CreateScenarioEventDTO = {
        name: createEventForm.name,
        eventId: createEventForm.eventId,
        description: createEventForm.description || undefined,
        eraId: getEraId(),
      };
      const created = await scenarioEventApi.createEvent(createData, token);
      
      // 如果是在编辑器中创建，自动填入新创建的事件ID
      if (creatingEventFor && creatingEventFor.effectIdx >= 0) {
        updateEffect(creatingEventFor.optionIdx, creatingEventFor.effectIdx, 'target', created.eventId);
      } else if (creatingEventFor && creatingEventFor.effectIdx === -1) {
        // 如果是条件中创建的，需要更新条件
        const option = currentNode.options[creatingEventFor.optionIdx];
        const conditions = [...(option.conditions || [])];
        const conditionIdx = conditions.findIndex((c: StoryOptionCondition) => c.type === 'event' && !c.target);
        if (conditionIdx >= 0) {
          conditions[conditionIdx] = { ...conditions[conditionIdx], target: created.eventId };
          updateOption(creatingEventFor.optionIdx, 'conditions', conditions);
        }
      }
      
      showAlert('事件创建成功', '成功', 'success');
      setShowCreateEventModal(false);
      setCreateEventForm({ name: '', eventId: '', description: '' });
      setCreatingEventFor(null);
    } catch (error: any) {
      showAlert('创建失败: ' + (error.message || '未知错误'), '创建失败', 'error');
    } finally {
      setIsCreatingEvent(false);
    }
  };
  
  // 创建物品
  const handleCreateItem = async () => {
    const token = getToken();
    if (!token) {
      showAlert('请先登录', '未登录', 'warning');
      return;
    }
    
    if (!createItemForm.name || !createItemForm.itemId) {
      showAlert('请填写物品名称和物品ID', '缺少参数', 'warning');
      return;
    }
    
    setIsCreatingItem(true);
    try {
      const createData: CreateScenarioItemDTO = {
        name: createItemForm.name,
        itemId: createItemForm.itemId,
        description: createItemForm.description || undefined,
        itemType: createItemForm.itemType || undefined,
        eraId: getEraId(),
      };
      const created = await scenarioItemApi.createItem(createData, token);
      
      // 如果是在编辑器中创建，自动填入新创建的物品ID
      if (creatingItemFor && creatingItemFor.effectIdx >= 0) {
        updateEffect(creatingItemFor.optionIdx, creatingItemFor.effectIdx, 'target', created.itemId);
      } else if (creatingItemFor && creatingItemFor.effectIdx === -1) {
        // 如果是条件中创建的，需要更新条件
        const option = currentNode.options[creatingItemFor.optionIdx];
        const conditions = [...(option.conditions || [])];
        const conditionIdx = conditions.findIndex((c: StoryOptionCondition) => c.type === 'item' && !c.target);
        if (conditionIdx >= 0) {
          conditions[conditionIdx] = { ...conditions[conditionIdx], target: created.itemId };
          updateOption(creatingItemFor.optionIdx, 'conditions', conditions);
        }
      }
      
      showAlert('物品创建成功', '成功', 'success');
      setShowCreateItemModal(false);
      setCreateItemForm({ name: '', itemId: '', description: '', itemType: '' });
      setCreatingItemFor(null);
    } catch (error: any) {
      showAlert('创建失败: ' + (error.message || '未知错误'), '创建失败', 'error');
    } finally {
      setIsCreatingItem(false);
    }
  };

  // 从所有节点中提取已使用的事件ID和物品ID
  const usedEventIds = useMemo(() => {
    const events = new Set<string>();
    Object.values(nodes).forEach(node => {
      // 从选项的条件中提取事件ID
      node.options?.forEach(opt => {
        opt.conditions?.forEach(cond => {
          if (cond.type === 'event' && cond.target) events.add(cond.target);
        });
        opt.effects?.forEach(effect => {
          if (effect.type === 'event' && effect.target) events.add(effect.target);
        });
      });
      // 从随机事件中提取事件ID
      node.randomEvents?.forEach(event => {
        if (event.effect.type === 'event' && event.effect.target) events.add(event.effect.target);
        if (event.id) events.add(event.id);
      });
    });
    return Array.from(events);
  }, [nodes]);

  const usedItemIds = useMemo(() => {
    const items = new Set<string>();
    Object.values(nodes).forEach(node => {
      // 从选项的条件中提取物品ID
      node.options?.forEach(opt => {
        opt.conditions?.forEach(cond => {
          if (cond.type === 'item' && cond.target) items.add(cond.target);
        });
        opt.effects?.forEach(effect => {
          if (effect.type === 'item' && effect.target) items.add(effect.target);
        });
      });
      // 从随机事件中提取物品ID
      node.randomEvents?.forEach(event => {
        if (event.effect.type === 'item' && event.effect.target) items.add(event.effect.target);
      });
    });
    return Array.from(items);
  }, [nodes]);

  // 可选择的角色列表（优先使用传入的allCharacters，否则从participatingCharacters中获取）
  const availableCharacters = useMemo(() => {
    if (allCharacters && allCharacters.length > 0) {
      return allCharacters;
    }
    // 如果只有participatingCharacters ID列表，需要从gameState中获取，这里暂时返回空数组
    // 实际使用时应该从App.tsx传入完整的角色列表
    return [];
  }, [allCharacters, participatingCharacters]);

  useEffect(() => {
    if (initialScenario) {
      setTitle(initialScenario.title);
      setDescription(initialScenario.description);
      setNodes(initialScenario.nodes || { 'start': { id: 'start', title: '开场场景', prompt: '描述一个阳光明媚的大学早晨。介绍樱向用户跑来的场景。', options: [] } });
      setSelectedNodeId(initialScenario.startNodeId || 'start');
    }
  }, [initialScenario]);

  const currentNode = nodes[selectedNodeId];

  const addNode = () => {
    const id = `node_${Date.now()}`;
    setNodes({ ...nodes, [id]: { id, title: '新场景', prompt: '描述接下来发生了什么...', options: [] } });
    setSelectedNodeId(id);
  };

  const updateNode = (field: keyof StoryNode, value: any) => {
    setNodes({ ...nodes, [selectedNodeId]: { ...nodes[selectedNodeId], [field]: value } });
  };

  const addOption = () => {
    const newOption: StoryOption = { id: `opt_${Date.now()}`, text: '新选项', nextNodeId: 'start' };
    updateNode('options', [...currentNode.options, newOption]);
  };

  const updateOption = (idx: number, field: keyof StoryOption, value: any) => {
    const newOpts = [...currentNode.options];
    newOpts[idx] = { ...newOpts[idx], [field]: value };
    updateNode('options', newOpts);
  };

  const deleteOption = (idx: number) => {
    const newOpts = [...currentNode.options];
    newOpts.splice(idx, 1);
    updateNode('options', newOpts);
  };

  // 状态影响管理
  const addEffect = (optionIdx: number) => {
    const newEffect: StoryOptionEffect = { type: 'favorability', target: '', value: 0 };
    const option = currentNode.options[optionIdx];
    const currentEffects = option.effects || [];
    updateOption(optionIdx, 'effects', [...currentEffects, newEffect]);
  };

  const updateEffect = (optionIdx: number, effectIdx: number, field: keyof StoryOptionEffect, value: any) => {
    const option = currentNode.options[optionIdx];
    const currentEffects = [...(option.effects || [])];
    currentEffects[effectIdx] = { ...currentEffects[effectIdx], [field]: value };
    updateOption(optionIdx, 'effects', currentEffects);
  };

  const deleteEffect = (optionIdx: number, effectIdx: number) => {
    const option = currentNode.options[optionIdx];
    const currentEffects = [...(option.effects || [])];
    currentEffects.splice(effectIdx, 1);
    updateOption(optionIdx, 'effects', currentEffects);
  };

  // 条件管理
  const addCondition = (optionIdx: number) => {
    const newCondition: StoryOptionCondition = { type: 'favorability', target: '', operator: '>=', value: 0 };
    const option = currentNode.options[optionIdx];
    const currentConditions = option.conditions || [];
    updateOption(optionIdx, 'conditions', [...currentConditions, newCondition]);
  };

  const updateCondition = (optionIdx: number, conditionIdx: number, field: keyof StoryOptionCondition, value: any) => {
    const option = currentNode.options[optionIdx];
    const currentConditions = [...(option.conditions || [])];
    currentConditions[conditionIdx] = { ...currentConditions[conditionIdx], [field]: value };
    updateOption(optionIdx, 'conditions', currentConditions);
  };

  const deleteCondition = (optionIdx: number, conditionIdx: number) => {
    const option = currentNode.options[optionIdx];
    const currentConditions = [...(option.conditions || [])];
    currentConditions.splice(conditionIdx, 1);
    updateOption(optionIdx, 'conditions', currentConditions);
  };

  const handleSave = () => {
    const scenario: CustomScenario = {
      id: initialScenario ? initialScenario.id : `scenario_${Date.now()}`,
      sceneId: initialScenario?.sceneId || '',
      title,
      description,
      nodes,
      startNodeId: Object.keys(nodes).includes(initialScenario?.startNodeId || 'start') ? (initialScenario?.startNodeId || 'start') : Object.keys(nodes)[0],
      author: initialScenario ? initialScenario.author : 'User',
    };
    onSave(scenario);
  };

  const handleMagicBuild = async () => {
    if (!magicPrompt.trim()) return;
    setIsMagicLoading(true);
    try {
      const scenario = await aiService.generateScenarioFromPrompt(magicPrompt);
      if (scenario) {
        setTitle(scenario.title);
        setDescription(scenario.description);
        setNodes(scenario.nodes);
        setSelectedNodeId(scenario.startNodeId);
        setShowMagicModal(false);
      }
    } catch (e: any) {
      console.error(e);
      let errorMsg = "生成失败，请稍后重试。";
      if (e?.status === 429 || e?.message?.includes('429') || e?.message?.includes('quota') || e?.message?.includes('RESOURCE_EXHAUSTED')) {
          errorMsg = "API 配额已耗尽或请求过于频繁 (429)。请在设置中检查您的 API Key，或稍作休息后重试。";
      } else if (e?.message?.includes('API config missing')) {
          errorMsg = "未配置 API Key。请前往设置 > AI 模型，输入您选择的模型的 API Key。";
      }
      showAlert(errorMsg, '生成失败', 'error');
    } finally {
      setIsMagicLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white relative">
      {showMagicModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-4">AI 一键生成剧本</h3>
            <p className="text-sm text-gray-400 mb-4">输入一个简单的想法（例如：“一个关于在闹鬼的图书馆里寻找丢失书籍的恐怖故事”），AI 将为您构建完整的剧情分支。</p>
            <textarea value={magicPrompt} onChange={e => setMagicPrompt(e.target.value)} placeholder="在这里输入你的创意..." className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-600 focus:border-indigo-500 outline-none resize-none mb-6" disabled={isMagicLoading} />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowMagicModal(false)} disabled={isMagicLoading}>取消</Button>
              <Button onClick={handleMagicBuild} disabled={isMagicLoading || !magicPrompt.trim()} className="bg-indigo-600 hover:bg-indigo-500 flex items-center">
                {isMagicLoading ? (<><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />正在构思中...</>) : (<>✨ 开始生成</>)}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="p-4 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">剧本编辑器</h2>
          <p className="text-xs text-gray-500">{initialScenario ? `正在编辑: ${initialScenario.title}` : '设计属于你的命运流程。'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowMagicModal(true)} className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10">✨ AI 一键生成</Button>
          <div className="w-px h-8 bg-gray-800 mx-1"></div>
          <Button variant="ghost" onClick={onCancel}>取消</Button>
          <Button onClick={handleSave} className="bg-pink-600 hover:bg-pink-500">保存剧本</Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/4 min-w-[250px] border-r border-gray-800 p-4 overflow-y-auto bg-gray-900/50">
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs text-gray-400 mb-1">剧本标题</label>
              <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 text-sm focus:border-pink-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">简介</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 text-sm focus:border-pink-500 outline-none h-20 resize-none" />
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-300">剧情节点</h3>
            <button onClick={addNode} className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded">+ 添加</button>
          </div>
          <div className="space-y-2">
            {Object.values(nodes).map((node: StoryNode) => (
              <div key={node.id} onClick={() => setSelectedNodeId(node.id)} className={`p-3 rounded-lg cursor-pointer border transition-all ${selectedNodeId === node.id ? 'bg-pink-500/20 border-pink-500' : 'bg-gray-800 border-transparent hover:border-gray-600'}`}>
                <div className="font-medium text-sm truncate">{node.title}</div>
                <div className="text-xs text-gray-500">{node.options.length} 个分支</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 p-8 overflow-y-auto bg-gray-900">
          {currentNode ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <NodeEditor
              node={currentNode}
              nodeIndex={nodes && selectedNodeId ? Object.keys(nodes).indexOf(selectedNodeId) : 0}
              nodes={nodes}
              availableCharacters={availableCharacters}
              usedEventIds={usedEventIds}
              usedItemIds={usedItemIds}
              expandedSections={expandedSections}
              onUpdateNode={updateNode}
              onToggleSection={toggleSection}
              onCreateEvent={(context) => {
                                        setCreatingEventFor(null);
                                        setCreateEventForm({ name: '', eventId: '', description: '' });
                                        setShowCreateEventModal(true);
                                      }}
              onCreateItem={(context) => {
                setCreatingItemFor(null);
                setCreateItemForm({ name: '', itemId: '', description: '', itemType: '' });
                setShowCreateItemModal(true);
              }}
            />
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-green-400">玩家选项 (分支)</label>
                <button onClick={addOption} className="text-xs bg-green-900/50 text-green-400 px-3 py-1 rounded hover:bg-green-900">+ 添加选项</button>
              </div>
              {currentNode.options.length === 0 ? (
                <div className="p-4 border border-dashed border-gray-700 rounded-xl text-center text-gray-500 text-sm">未定义选项。故事将在此结束。</div>
              ) : (
                <div className="space-y-3">
                  {currentNode.options.map((opt, idx) => (
                    <OptionEditor
                      key={opt.id}
                      option={opt}
                      optionIndex={idx}
                      nodes={nodes}
                      availableCharacters={availableCharacters}
                      usedEventIds={usedEventIds}
                      usedItemIds={usedItemIds}
                      expandedSections={expandedSections}
                      onUpdateOption={(field, value) => updateOption(idx, field, value)}
                      onDeleteOption={() => deleteOption(idx)}
                      onAddEffect={() => addEffect(idx)}
                      onUpdateEffect={(effectIdx, field, value) => updateEffect(idx, effectIdx, field, value)}
                      onDeleteEffect={(effectIdx) => deleteEffect(idx, effectIdx)}
                      onAddCondition={() => addCondition(idx)}
                      onUpdateCondition={(conditionIdx, field, value) => updateCondition(idx, conditionIdx, field, value)}
                      onDeleteCondition={(conditionIdx) => deleteCondition(idx, conditionIdx)}
                      onToggleSection={(key) => {
                        setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
                      }}
                      onCreateEvent={() => {
                        setCreatingEventFor({ optionIdx: idx, effectIdx: -1 });
                        setCreateEventForm({ name: '', eventId: '', description: '' });
                        setShowCreateEventModal(true);
                      }}
                      onCreateItem={() => {
                        setCreatingItemFor({ optionIdx: idx, effectIdx: -1 });
                        setCreateItemForm({ name: '', itemId: '', description: '', itemType: '' });
                        setShowCreateItemModal(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          ) : ( <div className="text-center text-gray-500 mt-20">请在左侧选择或创建一个节点</div> )}
        </div>
      </div>
      
      {/* 创建事件模态框 */}
      {showCreateEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-4">创建新事件</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">事件名称 *</label>
                <input
                  type="text"
                  value={createEventForm.name}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, name: e.target.value })}
                  placeholder="例如：发现线索"
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">事件ID *</label>
                <input
                  type="text"
                  value={createEventForm.eventId}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, eventId: e.target.value })}
                  placeholder="例如：event_find_clue"
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">用于剧本中引用，建议使用小写字母和下划线</p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">描述（可选）</label>
                <textarea
                  value={createEventForm.description}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, description: e.target.value })}
                  placeholder="事件描述..."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateEvent}
                disabled={isCreatingEvent || !createEventForm.name || !createEventForm.eventId}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isCreatingEvent ? '创建中...' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateEventModal(false);
                  setCreateEventForm({ name: '', eventId: '', description: '' });
                  setCreatingEventFor(null);
                }}
                className="bg-gray-700 hover:bg-gray-600"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 创建物品模态框 */}
      {showCreateItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400 mb-4">创建新物品</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">物品名称 *</label>
                <input
                  type="text"
                  value={createItemForm.name}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, name: e.target.value })}
                  placeholder="例如：神秘钥匙"
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">物品ID *</label>
                <input
                  type="text"
                  value={createItemForm.itemId}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, itemId: e.target.value })}
                  placeholder="例如：item_mysterious_key"
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">用于剧本中引用，建议使用小写字母和下划线</p>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">物品类型（可选）</label>
                <select
                  value={createItemForm.itemType}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, itemType: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none"
                >
                  <option value="">未分类</option>
                  <option value="weapon">武器</option>
                  <option value="tool">工具</option>
                  <option value="key">钥匙</option>
                  <option value="consumable">消耗品</option>
                  <option value="collectible">收藏品</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">描述（可选）</label>
                <textarea
                  value={createItemForm.description}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, description: e.target.value })}
                  placeholder="物品描述..."
                  rows={3}
                  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateItem}
                disabled={isCreatingItem || !createItemForm.name || !createItemForm.itemId}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isCreatingItem ? '创建中...' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateItemModal(false);
                  setCreateItemForm({ name: '', itemId: '', description: '', itemType: '' });
                  setCreatingItemFor(null);
                }}
                className="bg-gray-700 hover:bg-gray-600"
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};