
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
      setTitle(initialScenario.title || '');
      setDescription(initialScenario.description || '');
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
        setTitle(scenario.title || '');
        setDescription(scenario.description || '');
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
    <div 
      className="h-full flex flex-col relative"
      style={{
        backgroundColor: 'var(--bg-overlay, #111827)',
        color: 'var(--text-primary)',
      }}
    >
      {showMagicModal && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.8))' }}
        >
          <div 
            className="border rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-fade-in"
            style={{
              backgroundColor: 'var(--bg-card, #1f2937)',
              borderColor: 'var(--bg-overlay, #374151)',
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{
                background: 'var(--gradient-text, linear-gradient(to right, #818cf8, #f472b6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              AI 一键生成剧本
            </h3>
            <p 
              className="text-sm mb-4"
              style={{ color: 'var(--text-secondary, #CBD5E1)' }}
            >
              输入一个简单的想法（例如："一个关于在闹鬼的图书馆里寻找丢失书籍的恐怖故事"），AI 将为您构建完整的剧情分支。
            </p>
            <textarea 
              value={magicPrompt || ''} 
              onChange={e => setMagicPrompt(e.target.value)} 
              placeholder="在这里输入你的创意..." 
              className="w-full h-32 border rounded-xl p-4 outline-none resize-none mb-6" 
              style={{
                backgroundColor: 'var(--bg-overlay, #111827)',
                borderColor: 'var(--bg-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info, #818cf8)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
              }}
              disabled={isMagicLoading} 
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowMagicModal(false)} disabled={isMagicLoading}>取消</Button>
              <Button
                onClick={handleMagicBuild}
                disabled={isMagicLoading || !magicPrompt.trim()}
                className="flex items-center"
                style={{
                  backgroundColor: 'var(--color-info)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!isMagicLoading && magicPrompt.trim()) {
                    e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info)';
                }}
              >
                {isMagicLoading ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 rounded-full animate-spin mr-2"
                      style={{
                        borderColor: 'var(--border-color-overlay)',
                        borderTopColor: 'var(--text-primary)',
                      }}
                    />
                    正在构思中...
                  </>
                ) : (
                  <>✨ 开始生成</>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div 
        className="p-4 border-b flex justify-between items-center"
        style={{
          borderColor: 'var(--bg-overlay, #1f2937)',
          backgroundColor: 'var(--bg-overlay, #111827)',
        }}
      >
        <div>
          <h2 
            className="text-xl font-bold"
            style={{
              background: 'var(--gradient-text, linear-gradient(to right, #f472b6, #a855f7))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            剧本编辑器
          </h2>
          <p 
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            {initialScenario ? `正在编辑: ${initialScenario.title}` : '设计属于你的命运流程。'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowMagicModal(true)}
            style={{
              borderColor: 'var(--border-info-alpha)',
              color: 'var(--text-info)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-info-alpha)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✨ AI 一键生成
          </Button>
          <div 
            className="w-px h-8 mx-1"
            style={{ backgroundColor: 'var(--bg-overlay, #1f2937)' }}
          />
          <Button variant="ghost" onClick={onCancel}>取消</Button>
          <Button
            onClick={handleSave}
            style={{
              backgroundColor: 'var(--color-pink)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-pink-light)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-pink)';
            }}
          >
            保存剧本
          </Button>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div 
          className="w-1/4 min-w-[250px] border-r p-4 overflow-y-auto"
          style={{
            borderColor: 'var(--bg-overlay, #1f2937)',
            backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
          }}
        >
          <div className="space-y-4 mb-8">
            <div>
              <label 
                className="block text-xs mb-1"
                style={{ color: 'var(--text-secondary, #CBD5E1)' }}
              >
                剧本标题
              </label>
              <input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="w-full rounded px-3 py-2 border text-sm outline-none" 
                style={{
                  backgroundColor: 'var(--bg-secondary, #1f2937)',
                  borderColor: 'var(--bg-overlay, #374151)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                }}
              />
            </div>
            <div>
              <label 
                className="block text-xs mb-1"
                style={{ color: 'var(--text-secondary, #CBD5E1)' }}
              >
                简介
              </label>
              <textarea 
                value={description || ''} 
                onChange={e => setDescription(e.target.value)} 
                className="w-full rounded px-3 py-2 border text-sm outline-none h-20 resize-none" 
                style={{
                  backgroundColor: 'var(--bg-secondary, #1f2937)',
                  borderColor: 'var(--bg-overlay, #374151)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                }}
              />
            </div>
          </div>
          <div className="flex justify-between items-center mb-2">
            <h3 
              className="font-bold"
              style={{ color: 'var(--text-secondary)' }}
            >
              剧情节点
            </h3>
            <button 
              onClick={addNode} 
              className="text-xs px-2 py-1 rounded transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, #374151)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #1f2937)';
              }}
            >
              + 添加
            </button>
          </div>
          <div className="space-y-2">
            {Object.values(nodes).map((node: StoryNode) => (
              <div 
                key={node.id} 
                onClick={() => setSelectedNodeId(node.id)} 
                className="p-3 rounded-lg cursor-pointer border transition-all"
                style={{
                  backgroundColor: selectedNodeId === node.id 
                    ? 'var(--color-primary, rgba(236, 72, 153, 0.2))' 
                    : 'var(--bg-secondary, #1f2937)',
                  borderColor: selectedNodeId === node.id 
                    ? 'var(--color-primary, #ec4899)' 
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (selectedNodeId !== node.id) {
                    e.currentTarget.style.borderColor = 'var(--bg-hover, #4b5563)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedNodeId !== node.id) {
                    e.currentTarget.style.borderColor = 'transparent';
                  }
                }}
              >
                <div 
                  className="font-medium text-sm truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {node.title}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  {node.options.length} 个分支
                </div>
              </div>
            ))}
          </div>
        </div>
        <div 
          className="flex-1 p-8 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-overlay, #111827)' }}
        >
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
                <label 
                  className="block text-sm font-bold"
                  style={{ color: 'var(--color-success, #22c55e)' }}
                >
                  玩家选项 (分支)
                </label>
                <button 
                  onClick={addOption} 
                  className="text-xs px-3 py-1 rounded transition-colors font-medium"
                  style={{
                    backgroundColor: 'var(--color-success, rgba(34, 197, 94, 0.5))',
                    color: 'var(--text-primary, #FFFFFF)',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-success, rgba(34, 197, 94, 0.7))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-success, rgba(34, 197, 94, 0.5))';
                  }}
                >
                  + 添加选项
                </button>
              </div>
              {currentNode.options.length === 0 ? (
                <div 
                  className="p-4 border border-dashed rounded-xl text-center text-sm"
                  style={{
                    borderColor: 'var(--bg-overlay, #374151)',
                    color: 'var(--text-disabled)',
                  }}
                >
                  未定义选项。故事将在此结束。
                </div>
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
          ) : ( 
            <div 
              className="text-center mt-20"
              style={{ color: 'var(--text-disabled)' }}
            >
              请在左侧选择或创建一个节点
            </div>
          )}
        </div>
      </div>
      
      {/* 创建事件模态框 */}
      {showCreateEventModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.8))' }}
        >
          <div 
            className="border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card, #1f2937)',
              borderColor: 'var(--bg-overlay, #374151)',
            }}
          >
            <h3 
              className="text-xl font-bold mb-4"
              style={{
                background: 'var(--gradient-text, linear-gradient(to right, #818cf8, #f472b6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              创建新事件
            </h3>
            <div className="space-y-4">
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  事件名称 *
                </label>
                <input
                  type="text"
                  value={createEventForm.name}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, name: e.target.value })}
                  placeholder="例如：发现线索"
                  className="w-full border rounded px-3 py-2 outline-none"
                  style={{
                    backgroundColor: 'var(--bg-overlay, #111827)',
                    borderColor: 'var(--bg-overlay, #4b5563)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info, #818cf8)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bg-overlay, #4b5563)';
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm mb-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  事件ID *
                </label>
                <input
                  type="text"
                  value={createEventForm.eventId}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, eventId: e.target.value })}
                  placeholder="例如：event_find_clue"
                  className="w-full border rounded px-3 py-2 outline-none font-mono text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary-dark)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>用于剧本中引用，建议使用小写字母和下划线</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>描述（可选）</label>
                <textarea
                  value={createEventForm.description || ''}
                  onChange={(e) => setCreateEventForm({ ...createEventForm, description: e.target.value })}
                  placeholder="事件描述..."
                  rows={3}
                  className="w-full border rounded px-3 py-2 outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--bg-primary-dark)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateEvent}
                disabled={isCreatingEvent || !createEventForm.name || !createEventForm.eventId}
                className="disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-info)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!isCreatingEvent && createEventForm.name && createEventForm.eventId) {
                    e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info)';
                }}
              >
                {isCreatingEvent ? '创建中...' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateEventModal(false);
                  setCreateEventForm({ name: '', eventId: '', description: '' });
                  setCreatingEventFor(null);
                }}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
              >
                取消
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 创建物品模态框 */}
      {showCreateItemModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4"
          style={{ backgroundColor: 'var(--bg-overlay-dark)' }}
        >
          <div
            className="border rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color-overlay)',
            }}
          >
            <h3
              className="text-xl font-bold mb-4"
              style={{
                background: 'var(--gradient-text-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              创建新物品
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>物品名称 *</label>
                <input
                  type="text"
                  value={createItemForm.name}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, name: e.target.value })}
                  placeholder="例如：神秘钥匙"
                  className="w-full border rounded px-3 py-2 outline-none"
                  style={{
                    backgroundColor: 'var(--bg-primary-dark)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
                />
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>物品ID *</label>
                <input
                  type="text"
                  value={createItemForm.itemId}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, itemId: e.target.value })}
                  placeholder="例如：item_mysterious_key"
                  className="w-full border rounded px-3 py-2 outline-none font-mono text-sm"
                  style={{
                    backgroundColor: 'var(--bg-primary-dark)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-disabled)' }}>用于剧本中引用，建议使用小写字母和下划线</p>
              </div>
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>物品类型（可选）</label>
                <select
                  value={createItemForm.itemType}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, itemType: e.target.value })}
                  className="w-full border rounded px-3 py-2 outline-none"
                  style={{
                    backgroundColor: 'var(--bg-primary-dark)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
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
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>描述（可选）</label>
                <textarea
                  value={createItemForm.description || ''}
                  onChange={(e) => setCreateItemForm({ ...createItemForm, description: e.target.value })}
                  placeholder="物品描述..."
                  rows={3}
                  className="w-full border rounded px-3 py-2 outline-none resize-none"
                  style={{
                    backgroundColor: 'var(--bg-primary-dark)',
                    borderColor: 'var(--border-color-overlay)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color-overlay)';
                  }}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreateItem}
                disabled={isCreatingItem || !createItemForm.name || !createItemForm.itemId}
                className="disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-info)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  if (!isCreatingItem && createItemForm.name && createItemForm.itemId) {
                    e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info)';
                }}
              >
                {isCreatingItem ? '创建中...' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateItemModal(false);
                  setCreateItemForm({ name: '', itemId: '', description: '', itemType: '' });
                  setCreatingItemFor(null);
                }}
                style={{
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                }}
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