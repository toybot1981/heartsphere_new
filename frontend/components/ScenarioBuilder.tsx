
import React, { useState, useEffect, useMemo } from 'react';
import { CustomScenario, StoryNode, StoryOption, StoryOptionEffect, StoryOptionCondition, Character } from '../types';
import { Button } from './Button';
import { aiService } from '../services/ai';
import { showAlert } from '../utils/dialog';
import { scenarioEventApi, scenarioItemApi, type CreateScenarioEventDTO, type CreateScenarioItemDTO } from '../services/api/scenario';

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
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center font-bold text-lg">{nodes && selectedNodeId ? Object.keys(nodes).indexOf(selectedNodeId) + 1 : 1}</div>
               <div className="flex-1">
                 <label className="block text-xs text-gray-400 mb-1">节点标题 (内部标识)</label>
                 <input value={currentNode.title} onChange={e => updateNode('title', e.target.value)} className="w-full bg-gray-800 rounded px-3 py-2 border border-gray-700 focus:border-pink-500 outline-none font-bold text-lg" />
               </div>
            </div>
            <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
              <label className="block text-sm font-bold text-purple-400 mb-3">节点类型</label>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <label className="flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-700/30"
                  style={{ 
                    borderColor: (currentNode.nodeType || 'fixed') === 'fixed' ? '#a855f7' : '#374151',
                    backgroundColor: (currentNode.nodeType || 'fixed') === 'fixed' ? '#a855f7' + '20' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="nodeType"
                    value="fixed"
                    checked={(currentNode.nodeType || 'fixed') === 'fixed'}
                    onChange={() => updateNode('nodeType', 'fixed')}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500 mb-2"
                  />
                  <span className="text-lg mb-1">📝</span>
                  <span className="text-sm font-semibold text-gray-300 text-center">固定内容</span>
                  <span className="text-[10px] text-gray-500 text-center mt-1">直接显示预设内容</span>
                </label>
                <label className="flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-700/30"
                  style={{ 
                    borderColor: currentNode.nodeType === 'ai-dynamic' ? '#a855f7' : '#374151',
                    backgroundColor: currentNode.nodeType === 'ai-dynamic' ? '#a855f7' + '20' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="nodeType"
                    value="ai-dynamic"
                    checked={currentNode.nodeType === 'ai-dynamic'}
                    onChange={() => updateNode('nodeType', 'ai-dynamic')}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500 mb-2"
                  />
                  <span className="text-lg mb-1">✨</span>
                  <span className="text-sm font-semibold text-gray-300 text-center">AI动态生成</span>
                  <span className="text-[10px] text-gray-500 text-center mt-1">AI根据提示词生成</span>
                </label>
                <label className="flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-700/30"
                  style={{ 
                    borderColor: currentNode.nodeType === 'ending' ? '#a855f7' : '#374151',
                    backgroundColor: currentNode.nodeType === 'ending' ? '#a855f7' + '20' : 'transparent'
                  }}
                >
                  <input
                    type="radio"
                    name="nodeType"
                    value="ending"
                    checked={currentNode.nodeType === 'ending'}
                    onChange={() => updateNode('nodeType', 'ending')}
                    className="w-4 h-4 text-purple-500 focus:ring-purple-500 mb-2"
                  />
                  <span className="text-lg mb-1">🎯</span>
                  <span className="text-sm font-semibold text-gray-300 text-center">结局节点</span>
                  <span className="text-[10px] text-gray-500 text-center mt-1">剧本的结局</span>
                </label>
              </div>
              <div className="bg-gray-900/50 p-2 rounded text-xs text-gray-400">
                {(currentNode.nodeType || 'fixed') === 'ai-dynamic' 
                  ? '💡 AI会根据提示词动态生成对话内容，每次体验略有不同，增强表现力' 
                  : (currentNode.nodeType === 'ending')
                  ? '💡 结局节点会在内容前显示【结局】标记，通常没有后续选项，作为剧本的终点'
                  : '💡 固定内容模式直接使用预设的提示词内容，保持每次体验的一致性'}
              </div>
            </div>
            {/* 高级功能 - 使用折叠面板 */}
            <div className="border-t border-gray-700 pt-6">
              <div 
                className="flex items-center justify-between cursor-pointer mb-4"
                onClick={() => toggleSection('advancedFeatures')}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">⚙️</span>
                  <label className="text-sm font-bold text-gray-300">高级功能（可选）</label>
                </div>
                <span className="text-gray-500 text-sm">{expandedSections.advancedFeatures ? '▼' : '▶'}</span>
              </div>
              
              {expandedSections.advancedFeatures && (
                <div className="space-y-4 pl-6 border-l-2 border-gray-700">
                  {/* 多角色对话编辑 */}
                  <div>
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-2"
                      onClick={() => toggleSection('multiCharacter')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400">💬</span>
                        <label className="text-sm font-semibold text-cyan-400">多角色对话</label>
                        <span className="text-xs text-gray-500">({(currentNode.multiCharacterDialogue || []).length} 条)</span>
                      </div>
                      <span className="text-gray-500 text-xs">{expandedSections.multiCharacter ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.multiCharacter && (
                      <div className="ml-6 space-y-3">
                        <p className="text-xs text-gray-400 italic">💡 让多个角色在此节点依次发言，营造多人对话场景</p>
                        <div className="space-y-2 mb-2">
                          {(currentNode.multiCharacterDialogue || []).map((dialogue, idx) => (
                            <div key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-400">第 {idx + 1} 条对话</span>
                                <button
                                  onClick={() => {
                                    const newDialogue = [...(currentNode.multiCharacterDialogue || [])];
                                    newDialogue.splice(idx, 1);
                                    updateNode('multiCharacterDialogue', newDialogue);
                                  }}
                                  className="ml-auto text-gray-500 hover:text-red-500 text-xs px-2"
                                >
                                  删除
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">角色</label>
                                  <select
                                    value={dialogue.characterId}
                                    onChange={(e) => {
                                      const newDialogue = [...(currentNode.multiCharacterDialogue || [])];
                                      newDialogue[idx] = { ...newDialogue[idx], characterId: e.target.value };
                                      updateNode('multiCharacterDialogue', newDialogue);
                                    }}
                                    className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-cyan-500 outline-none"
                                  >
                                    <option value="">选择角色</option>
                                    {availableCharacters.map(char => (
                                      <option key={char.id} value={char.id}>
                                        {char.name} {char.role ? `(${char.role})` : ''}
                                      </option>
                                    ))}
                                    {availableCharacters.length === 0 && (
                                      <option disabled>暂无可选角色，请先在剧本设置中选择参与角色</option>
                                    )}
                                  </select>
                                  {dialogue.characterId && !availableCharacters.find(c => c.id === dialogue.characterId) && (
                                    <p className="text-[10px] text-yellow-500 mt-1">⚠️ 此角色ID不在可选列表中</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">显示顺序</label>
                                  <input
                                    type="number"
                                    min="1"
                                    value={dialogue.order || idx + 1}
                                    onChange={(e) => {
                                      const newDialogue = [...(currentNode.multiCharacterDialogue || [])];
                                      newDialogue[idx] = { ...newDialogue[idx], order: parseInt(e.target.value) || idx + 1 };
                                      updateNode('multiCharacterDialogue', newDialogue);
                                    }}
                                    className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-cyan-500 outline-none"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-xs text-gray-500 block mb-1">对话内容</label>
                                <textarea
                                  value={dialogue.content}
                                  onChange={(e) => {
                                    const newDialogue = [...(currentNode.multiCharacterDialogue || [])];
                                    newDialogue[idx] = { ...newDialogue[idx], content: e.target.value };
                                    updateNode('multiCharacterDialogue', newDialogue);
                                  }}
                                  placeholder="例如：你好，很高兴见到你！"
                                  className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-cyan-500 outline-none resize-none"
                                  rows={2}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newDialogue = [...(currentNode.multiCharacterDialogue || []), { characterId: '', content: '', order: (currentNode.multiCharacterDialogue?.length || 0) + 1 }];
                            updateNode('multiCharacterDialogue', newDialogue);
                          }}
                          className="text-xs bg-cyan-900/30 text-cyan-400 px-3 py-1.5 rounded border border-cyan-500/30 hover:bg-cyan-900/50"
                        >
                          + 添加一条对话
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 随机事件编辑 */}
                  <div>
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-2"
                      onClick={() => toggleSection('randomEvents')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-pink-400">🎲</span>
                        <label className="text-sm font-semibold text-pink-400">随机事件</label>
                        <span className="text-xs text-gray-500">({(currentNode.randomEvents || []).length} 个)</span>
                      </div>
                      <span className="text-gray-500 text-xs">{expandedSections.randomEvents ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.randomEvents && (
                      <div className="ml-6 space-y-3">
                        <p className="text-xs text-gray-400 italic">💡 进入节点时随机触发的事件，增加不确定性（概率：0-1，0.5表示50%概率）</p>
                        <div className="space-y-2 mb-2">
                          {(currentNode.randomEvents || []).map((event, idx) => (
                            <div key={idx} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">随机事件 #{idx + 1}</span>
                                <button
                                  onClick={() => {
                                    const newEvents = [...(currentNode.randomEvents || [])];
                                    newEvents.splice(idx, 1);
                                    updateNode('randomEvents', newEvents);
                                  }}
                                  className="text-gray-500 hover:text-red-500 text-xs px-2"
                                >
                                  删除
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">事件ID</label>
                                  <div className="flex gap-1">
                                    <input
                                      type="text"
                                      list={`randomevent-${idx}-id`}
                                      value={event.id}
                                      onChange={(e) => {
                                        const newEvents = [...(currentNode.randomEvents || [])];
                                        newEvents[idx] = { ...newEvents[idx], id: e.target.value };
                                        updateNode('randomEvents', newEvents);
                                      }}
                                      placeholder="选择已有或输入新的事件ID"
                                      className="flex-1 text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-pink-500 outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCreatingEventFor(null);
                                        setCreateEventForm({ name: '', eventId: '', description: '' });
                                        setShowCreateEventModal(true);
                                      }}
                                      className="px-2 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded text-xs font-bold"
                                      title="创建新事件"
                                    >
                                      +
                                    </button>
                                  </div>
                                  <datalist id={`randomevent-${idx}-id`}>
                                    {usedEventIds.map(id => (
                                      <option key={id} value={id} />
                                    ))}
                                  </datalist>
                                  {usedEventIds.length > 0 && (
                                    <p className="text-[10px] text-gray-500 mt-0.5">💡 下拉选择已有ID，或直接输入新ID，点击"+"快速创建</p>
                                  )}
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">触发概率 (0-1)</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={event.probability}
                                    onChange={(e) => {
                                      const newEvents = [...(currentNode.randomEvents || [])];
                                      newEvents[idx] = { ...newEvents[idx], probability: parseFloat(e.target.value) || 0 };
                                      updateNode('randomEvents', newEvents);
                                    }}
                                    placeholder="0.5 = 50%"
                                    className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-pink-500 outline-none"
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">效果类型</label>
                                  <select
                                    value={event.effect.type}
                                    onChange={(e) => {
                                      const newEvents = [...(currentNode.randomEvents || [])];
                                      newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, type: e.target.value as any } };
                                      updateNode('randomEvents', newEvents);
                                    }}
                                    className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-pink-500 outline-none"
                                  >
                                    <option value="event">触发事件</option>
                                    <option value="item">获得物品</option>
                                    <option value="favorability">改变好感度</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs text-gray-500 block mb-1">
                                    {event.effect.type === 'favorability' ? '角色' : event.effect.type === 'event' ? '事件ID' : '物品ID'}
                                  </label>
                                  {event.effect.type === 'favorability' ? (
                                    <select
                                      value={event.effect.target}
                                      onChange={(e) => {
                                        const newEvents = [...(currentNode.randomEvents || [])];
                                        newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, target: e.target.value } };
                                        updateNode('randomEvents', newEvents);
                                      }}
                                      className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-pink-500 outline-none"
                                    >
                                      <option value="">选择角色</option>
                                      {availableCharacters.map(char => (
                                        <option key={char.id} value={char.id}>
                                          {char.name} {char.role ? `(${char.role})` : ''}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <>
                                      <input
                                        type="text"
                                        list={`randomevent-${idx}-effect-${event.effect.type === 'event' ? 'events' : 'items'}`}
                                        value={event.effect.target}
                                        onChange={(e) => {
                                          const newEvents = [...(currentNode.randomEvents || [])];
                                          newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, target: e.target.value } };
                                          updateNode('randomEvents', newEvents);
                                        }}
                                        placeholder={`选择已有或输入新的${event.effect.type === 'event' ? '事件' : '物品'}ID`}
                                        className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-pink-500 outline-none"
                                      />
                                      <datalist id={`randomevent-${idx}-effect-${event.effect.type === 'event' ? 'events' : 'items'}`}>
                                        {(event.effect.type === 'event' ? usedEventIds : usedItemIds).map(id => (
                                          <option key={id} value={id} />
                                        ))}
                                      </datalist>
                                      {(event.effect.type === 'event' ? usedEventIds : usedItemIds).length > 0 && (
                                        <p className="text-[10px] text-gray-500 mt-0.5">💡 下拉选择已有ID，或直接输入新ID</p>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                              {event.effect.type === 'favorability' && (
                                <div className="mt-2">
                                  <label className="text-xs text-gray-500 block mb-1">好感度变化 (±)</label>
                                  <input
                                    type="number"
                                    value={event.effect.value ?? 0}
                                    onChange={(e) => {
                                      const newEvents = [...(currentNode.randomEvents || [])];
                                      newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, value: parseInt(e.target.value) || 0 } };
                                      updateNode('randomEvents', newEvents);
                                    }}
                                    placeholder="例如：10 或 -5"
                                    className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-pink-500 outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const newEvents = [...(currentNode.randomEvents || []), { id: `random_${Date.now()}`, probability: 0.5, effect: { type: 'event', target: '' } }];
                            updateNode('randomEvents', newEvents);
                          }}
                          className="text-xs bg-pink-900/30 text-pink-400 px-3 py-1.5 rounded border border-pink-500/30 hover:bg-pink-900/50"
                        >
                          + 添加随机事件
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 时间系统编辑 */}
                  <div>
                    <div 
                      className="flex items-center justify-between cursor-pointer mb-2"
                      onClick={() => toggleSection('timeSystem')}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400">⏱️</span>
                        <label className="text-sm font-semibold text-orange-400">限时节点</label>
                        {currentNode.timeLimit && (
                          <span className="text-xs text-gray-500">({currentNode.timeLimit}秒)</span>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs">{expandedSections.timeSystem ? '▼' : '▶'}</span>
                    </div>
                    {expandedSections.timeSystem && (
                      <div className="ml-6 space-y-3">
                        <p className="text-xs text-gray-400 italic">💡 设置时间限制，玩家必须在指定时间内做出选择，否则自动跳转到超时节点</p>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-gray-500 block mb-1">限时时间（秒）</label>
                            <input
                              type="number"
                              min="0"
                              value={currentNode.timeLimit || ''}
                              onChange={(e) => updateNode('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                              placeholder="例如：30 表示30秒"
                              className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-orange-500 outline-none"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">留空表示无时间限制</p>
                          </div>
                          {currentNode.timeLimit && (
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">超时后跳转到</label>
                              <select
                                value={currentNode.timeoutNodeId || ''}
                                onChange={(e) => updateNode('timeoutNodeId', e.target.value || undefined)}
                                className="w-full text-xs bg-gray-900 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-orange-500 outline-none"
                              >
                                <option value="">选择节点（留空表示继续当前节点）</option>
                                {Object.values(nodes).map((n: StoryNode) => (
                                  <option key={n.id} value={n.id}>{n.title}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-indigo-400 mb-2">AI 旁白提示词 (Prompt)</label>
              <p className="text-xs text-gray-500 mb-2">
                {(currentNode.nodeType || 'fixed') === 'ai-dynamic' 
                  ? '描述这一幕会发生什么。AI 将根据此场景描述生成符合角色性格的对话和旁白。'
                  : '描述这一幕会发生什么。AI 将根据此生成对话和旁白。'}
              </p>
              <textarea value={currentNode.prompt} onChange={e => updateNode('prompt', e.target.value)} className="w-full bg-gray-800 rounded-xl p-4 border border-gray-700 focus:border-indigo-500 outline-none h-40 resize-none leading-relaxed" placeholder="例如：用户在咖啡馆遇到了樱。她正在喝拿铁，看起来对考试很担心……" />
            </div>
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
                    <div key={opt.id} className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex gap-4 items-start">
                      <div className="flex-1 space-y-2">
                        <div>
                          <label className="text-xs text-gray-500">按钮文本</label>
                          <input value={opt.text} onChange={e => updateOption(idx, 'text', e.target.value)} className="w-full bg-gray-900 rounded px-2 py-1 border border-gray-700 text-sm" placeholder="例如：询问她考试的事" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">跳转至节点</label>
                          <select 
                            value={opt.nextNodeId || ''} 
                            onChange={e => updateOption(idx, 'nextNodeId', e.target.value)} 
                            className="w-full bg-gray-900 rounded px-2 py-1 border border-gray-700 text-sm focus:border-green-500 outline-none"
                            style={{ 
                              color: '#ffffff', 
                              backgroundColor: '#111827',
                              WebkitAppearance: 'none',
                              MozAppearance: 'none',
                              appearance: 'none'
                            }}
                          >
                            {Object.values(nodes).length > 0 ? (
                              Object.values(nodes).map((n: StoryNode) => {
                                const nodeTitle = n.title || n.id || '未命名节点';
                                return (
                                  <option 
                                    key={n.id} 
                                    value={n.id} 
                                    style={{ 
                                      backgroundColor: '#111827', 
                                      color: '#ffffff',
                                      padding: '8px'
                                    }}
                                  >
                                    {nodeTitle}
                                  </option>
                                );
                              })
                            ) : (
                              <option value="" style={{ color: '#ffffff', backgroundColor: '#111827' }}>暂无节点</option>
                            )}
                          </select>
                          {/* 调试信息：显示当前选中的值和节点数量 */}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="text-xs text-gray-600 mt-1">
                              选中: {opt.nextNodeId}, 节点数: {Object.values(nodes).length}
                            </div>
                          )}
                        </div>
                        {/* 状态影响编辑 - 使用折叠面板 */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div 
                            className="flex justify-between items-center mb-2 cursor-pointer"
                            onClick={() => {
                              const key = `option_${idx}_effects`;
                              setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-yellow-400">⚡</span>
                              <label className="text-xs text-yellow-400 font-bold">状态影响</label>
                              {opt.effects && opt.effects.length > 0 && (
                                <span className="text-xs text-gray-500">({opt.effects.length} 项)</span>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs">{expandedSections[`option_${idx}_effects`] ? '▼' : '▶'}</span>
                          </div>
                          {expandedSections[`option_${idx}_effects`] && (
                            <div className="ml-4 space-y-2">
                              {(!opt.effects || opt.effects.length === 0) ? (
                                <div className="bg-gray-900/30 p-2 rounded text-xs text-gray-500 italic">
                                  💡 未设置状态影响，选择此选项不会改变任何状态（可选功能）
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {opt.effects.map((effect, effectIdx) => (
                                    <div key={effectIdx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-400">影响 #{effectIdx + 1}</span>
                                        <button
                                          onClick={() => deleteEffect(idx, effectIdx)}
                                          className="text-gray-500 hover:text-red-500 text-xs px-2"
                                          title="删除影响"
                                        >
                                          删除
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">影响类型</label>
                                          <select
                                            value={effect.type}
                                            onChange={(e) => updateEffect(idx, effectIdx, 'type', e.target.value)}
                                            className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-yellow-500 outline-none"
                                          >
                                            <option value="favorability">💕 改变好感度</option>
                                            <option value="event">📌 触发事件</option>
                                            <option value="item">🎁 收集物品</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">
                                            {effect.type === 'favorability' ? '角色' : effect.type === 'event' ? '事件ID' : '物品ID'}
                                          </label>
                                          {effect.type === 'favorability' ? (
                                            <select
                                              value={effect.target}
                                              onChange={(e) => updateEffect(idx, effectIdx, 'target', e.target.value)}
                                              className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-yellow-500 outline-none"
                                            >
                                              <option value="">选择角色</option>
                                              {availableCharacters.map(char => (
                                                <option key={char.id} value={char.id}>
                                                  {char.name} {char.role ? `(${char.role})` : ''}
                                                </option>
                                              ))}
                                            </select>
                                          ) : (
                                            <>
                                              <input
                                                type="text"
                                                list={`effect-${idx}-${effectIdx}-${effect.type === 'event' ? 'events' : 'items'}`}
                                                value={effect.target}
                                                onChange={(e) => updateEffect(idx, effectIdx, 'target', e.target.value)}
                                                placeholder={`选择已有或输入新的${effect.type === 'event' ? '事件' : '物品'}ID`}
                                                className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-yellow-500 outline-none"
                                              />
                                              <datalist id={`effect-${idx}-${effectIdx}-${effect.type === 'event' ? 'events' : 'items'}`}>
                                                {(effect.type === 'event' ? usedEventIds : usedItemIds).map(id => (
                                                  <option key={id} value={id} />
                                                ))}
                                              </datalist>
                                              {(effect.type === 'event' ? usedEventIds : usedItemIds).length > 0 && (
                                                <p className="text-[10px] text-gray-500 mt-0.5">💡 下拉选择已有ID，或直接输入新ID</p>
                                              )}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {effect.type === 'favorability' && (
                                        <div className="mt-2">
                                          <label className="text-xs text-gray-500 block mb-1">好感度变化</label>
                                          <input
                                            type="number"
                                            value={effect.value ?? 0}
                                            onChange={(e) => updateEffect(idx, effectIdx, 'value', parseInt(e.target.value) || 0)}
                                            placeholder="例如：10（增加）或 -5（减少）"
                                            className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-yellow-500 outline-none"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              <button 
                                onClick={() => addEffect(idx)} 
                                className="text-xs bg-yellow-900/30 text-yellow-400 px-3 py-1.5 rounded border border-yellow-500/30 hover:bg-yellow-900/50 w-full"
                              >
                                + 添加状态影响
                              </button>
                              {opt.effects && opt.effects.length > 0 && (
                                <div className="bg-gray-900/30 p-2 rounded text-[10px] text-gray-500 italic">
                                  💡 提示：选择此选项时会触发这些状态变化，用于追踪玩家进度和影响后续剧情
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {/* 条件编辑 - 使用折叠面板 */}
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <div 
                            className="flex justify-between items-center mb-2 cursor-pointer"
                            onClick={() => {
                              const key = `option_${idx}_conditions`;
                              setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
                            }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400">🔒</span>
                              <label className="text-xs text-blue-400 font-bold">显示条件</label>
                              {opt.conditions && opt.conditions.length > 0 && (
                                <span className="text-xs text-gray-500">({opt.conditions.length} 条)</span>
                              )}
                            </div>
                            <span className="text-gray-500 text-xs">{expandedSections[`option_${idx}_conditions`] ? '▼' : '▶'}</span>
                          </div>
                          {expandedSections[`option_${idx}_conditions`] && (
                            <div className="ml-4 space-y-2">
                              {(!opt.conditions || opt.conditions.length === 0) ? (
                                <div className="bg-gray-900/30 p-2 rounded text-xs text-gray-500 italic">
                                  💡 未设置条件时，此选项默认会显示
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {opt.conditions.map((condition, conditionIdx) => (
                                    <div key={conditionIdx} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs text-gray-400">条件 #{conditionIdx + 1}</span>
                                        <button
                                          onClick={() => deleteCondition(idx, conditionIdx)}
                                          className="text-gray-500 hover:text-red-500 text-xs px-2"
                                          title="删除条件"
                                        >
                                          删除
                                        </button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">条件类型</label>
                                          <select
                                            value={condition.type}
                                            onChange={(e) => updateCondition(idx, conditionIdx, 'type', e.target.value)}
                                            className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-blue-500 outline-none"
                                          >
                                            <option value="favorability">💕 好感度</option>
                                            <option value="event">📌 事件</option>
                                            <option value="item">🎁 物品</option>
                                            <option value="time">⏰ 时间</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">
                                            {condition.type === 'favorability' ? '角色' : condition.type === 'event' ? '事件ID' : condition.type === 'item' ? '物品ID' : '时间ID'}
                                          </label>
                                          {condition.type === 'favorability' ? (
                                            <select
                                              value={condition.target}
                                              onChange={(e) => updateCondition(idx, conditionIdx, 'target', e.target.value)}
                                              className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-blue-500 outline-none"
                                            >
                                              <option value="">选择角色</option>
                                              {availableCharacters.map(char => (
                                                <option key={char.id} value={char.id}>
                                                  {char.name} {char.role ? `(${char.role})` : ''}
                                                </option>
                                              ))}
                                            </select>
                                          ) : condition.type === 'event' || condition.type === 'item' ? (
                                            <>
                                              <input
                                                type="text"
                                                list={`condition-${idx}-${conditionIdx}-${condition.type === 'event' ? 'events' : 'items'}`}
                                                value={condition.target}
                                                onChange={(e) => updateCondition(idx, conditionIdx, 'target', e.target.value)}
                                                placeholder={`选择已有或输入新的${condition.type === 'event' ? '事件' : '物品'}ID`}
                                                className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-blue-500 outline-none"
                                              />
                                              <datalist id={`condition-${idx}-${conditionIdx}-${condition.type === 'event' ? 'events' : 'items'}`}>
                                                {(condition.type === 'event' ? usedEventIds : usedItemIds).map(id => (
                                                  <option key={id} value={id} />
                                                ))}
                                              </datalist>
                                              {(condition.type === 'event' ? usedEventIds : usedItemIds).length > 0 && (
                                                <p className="text-[10px] text-gray-500 mt-0.5">💡 下拉选择已有ID，或直接输入新ID</p>
                                              )}
                                            </>
                                          ) : (
                                            <input
                                              type="text"
                                              value={condition.target}
                                              onChange={(e) => updateCondition(idx, conditionIdx, 'target', e.target.value)}
                                              placeholder="输入时间ID"
                                              className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-blue-500 outline-none"
                                            />
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div>
                                          <label className="text-xs text-gray-500 block mb-1">比较方式</label>
                                          <select
                                            value={condition.operator}
                                            onChange={(e) => updateCondition(idx, conditionIdx, 'operator', e.target.value)}
                                            className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-blue-500 outline-none"
                                          >
                                            {(condition.type === 'favorability' || condition.type === 'time') && (
                                              <>
                                                <option value=">=">大于等于 (&gt;=)</option>
                                                <option value="<=">小于等于 (&lt;=)</option>
                                                <option value=">">大于 (&gt;)</option>
                                                <option value="<">小于 (&lt;)</option>
                                                <option value="==">等于 (==)</option>
                                                <option value="!=">不等于 (!=)</option>
                                              </>
                                            )}
                                            {(condition.type === 'event' || condition.type === 'item') && (
                                              <>
                                                <option value="has">已拥有</option>
                                                <option value="not_has">未拥有</option>
                                              </>
                                            )}
                                          </select>
                                        </div>
                                        {(condition.type === 'favorability' || condition.type === 'time') && (
                                          <div>
                                            <label className="text-xs text-gray-500 block mb-1">比较值</label>
                                            <input
                                              type="number"
                                              value={condition.value ?? 0}
                                              onChange={(e) => updateCondition(idx, conditionIdx, 'value', parseFloat(e.target.value) || 0)}
                                              placeholder="数值"
                                              className="w-full text-xs bg-gray-800 rounded px-2 py-1.5 border border-gray-700 text-white focus:border-blue-500 outline-none"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              <button 
                                onClick={() => addCondition(idx)} 
                                className="text-xs bg-blue-900/30 text-blue-400 px-3 py-1.5 rounded border border-blue-500/30 hover:bg-blue-900/50 w-full"
                              >
                                + 添加条件
                              </button>
                              {opt.conditions && opt.conditions.length > 0 && (
                                <p className="text-[10px] text-gray-500 italic bg-gray-900/30 p-2 rounded">
                                  💡 提示：所有条件都必须满足（AND逻辑），此选项才会显示
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteOption(idx)} className="text-gray-500 hover:text-red-500 mt-6"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button>
                    </div>
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