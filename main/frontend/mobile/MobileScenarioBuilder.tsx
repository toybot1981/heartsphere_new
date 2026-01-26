import React, { useState, useEffect } from 'react';
import { CustomScenario, StoryNode, StoryOption, StoryOptionEffect, StoryOptionCondition } from '../types';
import { MobileTouchableButton } from './components/MobileTouchableButton';
import { aiService } from '../services/ai';
import { showAlert, showConfirm } from '../utils/dialog';

interface MobileScenarioBuilderProps {
  initialScenario?: CustomScenario | null;
  onSave: (scenario: CustomScenario) => void;
  onCancel: () => void;
}

export const MobileScenarioBuilder: React.FC<MobileScenarioBuilderProps> = ({ initialScenario, onSave, onCancel }) => {
  // Scenario State
  const [title, setTitle] = useState('我的新剧本');
  const [description, setDescription] = useState('一段浪漫的冒险...');
  const [nodes, setNodes] = useState<Record<string, StoryNode>>({
    'start': { id: 'start', title: '开场', prompt: '描述开场场景...', options: [] }
  });
  
  // UI State
  const [activeTab, setActiveTab] = useState<'basic' | 'nodes'>('basic');
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [showMagicModal, setShowMagicModal] = useState(false);
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isMagicLoading, setIsMagicLoading] = useState(false);

  useEffect(() => {
    if (initialScenario) {
      setTitle(initialScenario.title);
      setDescription(initialScenario.description);
      setNodes(initialScenario.nodes);
    }
  }, [initialScenario]);

  // --- Logic ---

  const addNode = () => {
    const id = `node_${Date.now()}`;
    setNodes({ ...nodes, [id]: { id, title: '新场景', prompt: '', options: [] } });
    setEditingNodeId(id);
  };

  const updateNode = (id: string, field: keyof StoryNode, value: any) => {
    setNodes(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const addOption = (nodeId: string) => {
    const node = nodes[nodeId];
    const newOption: StoryOption = { id: `opt_${Date.now()}`, text: '新选项', nextNodeId: 'start' };
    updateNode(nodeId, 'options', [...node.options, newOption]);
  };

  const updateOption = (nodeId: string, optIdx: number, field: keyof StoryOption, value: any) => {
    const node = nodes[nodeId];
    const newOpts = [...node.options];
    newOpts[optIdx] = { ...newOpts[optIdx], [field]: value };
    updateNode(nodeId, 'options', newOpts);
  };

  const deleteOption = (nodeId: string, optIdx: number) => {
    const node = nodes[nodeId];
    const newOpts = [...node.options];
    newOpts.splice(optIdx, 1);
    updateNode(nodeId, 'options', newOpts);
  };

  // 状态影响管理
  const addEffect = (nodeId: string, optionIdx: number) => {
    const newEffect: StoryOptionEffect = { type: 'favorability', target: '', value: 0 };
    const option = nodes[nodeId].options[optionIdx];
    const currentEffects = option.effects || [];
    updateOption(nodeId, optionIdx, 'effects', [...currentEffects, newEffect]);
  };

  const updateEffect = (nodeId: string, optionIdx: number, effectIdx: number, field: keyof StoryOptionEffect, value: any) => {
    const option = nodes[nodeId].options[optionIdx];
    const currentEffects = [...(option.effects || [])];
    currentEffects[effectIdx] = { ...currentEffects[effectIdx], [field]: value };
    updateOption(nodeId, optionIdx, 'effects', currentEffects);
  };

  const deleteEffect = (nodeId: string, optionIdx: number, effectIdx: number) => {
    const option = nodes[nodeId].options[optionIdx];
    const currentEffects = [...(option.effects || [])];
    currentEffects.splice(effectIdx, 1);
    updateOption(nodeId, optionIdx, 'effects', currentEffects);
  };

  // 条件管理
  const addCondition = (nodeId: string, optionIdx: number) => {
    const newCondition: StoryOptionCondition = { type: 'favorability', target: '', operator: '>=', value: 0 };
    const option = nodes[nodeId].options[optionIdx];
    const currentConditions = option.conditions || [];
    updateOption(nodeId, optionIdx, 'conditions', [...currentConditions, newCondition]);
  };

  const updateCondition = (nodeId: string, optionIdx: number, conditionIdx: number, field: keyof StoryOptionCondition, value: any) => {
    const option = nodes[nodeId].options[optionIdx];
    const currentConditions = [...(option.conditions || [])];
    currentConditions[conditionIdx] = { ...currentConditions[conditionIdx], [field]: value };
    updateOption(nodeId, optionIdx, 'conditions', currentConditions);
  };

  const deleteCondition = (nodeId: string, optionIdx: number, conditionIdx: number) => {
    const option = nodes[nodeId].options[optionIdx];
    const currentConditions = [...(option.conditions || [])];
    currentConditions.splice(conditionIdx, 1);
    updateOption(nodeId, optionIdx, 'conditions', currentConditions);
  };

  const deleteNode = (nodeId: string) => {
      if (nodeId === 'start') {
          showAlert("无法删除起始节点", "提示", "warning");
          return;
      }
      showConfirm("确定删除此节点吗？", "删除节点", "warning").then((confirmed) => {
          if (confirmed) {
              const newNodes = { ...nodes };
              delete newNodes[nodeId];
              setNodes(newNodes);
              setEditingNodeId(null);
          }
      });
  };

  const handleSave = () => {
    // Check if startNodeId exists in nodes
    let finalStartId = initialScenario?.startNodeId || 'start';
    if (!nodes[finalStartId]) {
        // Fallback to first available node if 'start' or saved ID is invalid
        finalStartId = Object.keys(nodes)[0] || 'start';
    }

    const scenario: CustomScenario = {
      id: initialScenario ? initialScenario.id : `scenario_${Date.now()}`,
      sceneId: initialScenario?.sceneId || '',
      title,
      description,
      nodes,
      startNodeId: finalStartId,
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
        setShowMagicModal(false);
        setActiveTab('nodes');
      }
    } catch (e) {
      showAlert("生成失败，请重试。", "错误", "error");
    } finally {
      setIsMagicLoading(false);
    }
  };

  // --- Render Node Editor (Full Screen Overlay) ---
  const renderNodeEditor = () => {
      if (!editingNodeId) return null;
      const node = nodes[editingNodeId];
      if (!node) return null;

      return (
          <div 
            className="absolute inset-0 z-20 flex flex-col animate-fade-in"
            style={{ backgroundColor: 'var(--bg-primary, #0f172a)' }}
          >
              <div 
                className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b flex items-center justify-between backdrop-blur-md"
                style={{
                  borderColor: 'var(--border-color-overlay, #1e293b)',
                  backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 0.9))',
                }}
              >
                  <button 
                    onClick={() => setEditingNodeId(null)} 
                    className="flex items-center gap-1"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                      返回
                  </button>
                  <h3 
                    className="font-bold truncate max-w-[150px]"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {node.title}
                  </h3>
                  <button 
                    onClick={() => deleteNode(node.id)} 
                    className="text-sm"
                    style={{ color: 'var(--color-error, #f87171)' }}
                  >
                    删除
                  </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div>
                      <label 
                        className="text-xs font-bold mb-1 block"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        节点标题 (内部标识)
                      </label>
                      <input 
                        value={node.title} 
                        onChange={(e) => updateNode(node.id, 'title', e.target.value)}
                        className="w-full rounded-xl px-4 py-3 outline-none"
                        style={{
                          backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                          borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-info, #6366f1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                        }}
                      />
                  </div>

                  <div>
                      <label 
                        className="text-xs font-bold mb-2 block"
                        style={{ color: 'var(--color-primary, #c084fc)' }}
                      >
                        节点类型
                      </label>
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`nodeType-${node.id}`}
                            value="fixed"
                            checked={(node.nodeType || 'fixed') === 'fixed'}
                            onChange={() => updateNode(node.id, 'nodeType', 'fixed')}
                            className="w-4 h-4 focus:ring-2"
                            style={{ accentColor: 'var(--color-primary, #a855f7)' }}
                          />
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            固定内容
                          </span>
                          <span 
                            className="text-[10px]"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            (直接显示预设内容)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`nodeType-${node.id}`}
                            value="ai-dynamic"
                            checked={node.nodeType === 'ai-dynamic'}
                            onChange={() => updateNode(node.id, 'nodeType', 'ai-dynamic')}
                            className="w-4 h-4 focus:ring-2"
                            style={{ accentColor: 'var(--color-primary, #a855f7)' }}
                          />
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            AI动态生成
                          </span>
                          <span 
                            className="text-[10px]"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            (AI根据提示词生成内容)
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`nodeType-${node.id}`}
                            value="ending"
                            checked={node.nodeType === 'ending'}
                            onChange={() => updateNode(node.id, 'nodeType', 'ending')}
                            className="w-4 h-4 focus:ring-2"
                            style={{ accentColor: 'var(--color-primary, #a855f7)' }}
                          />
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            结局节点
                          </span>
                          <span 
                            className="text-[10px]"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            (剧本的结局)
                          </span>
                        </label>
                      </div>
                      <p 
                        className="text-[10px]"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        {(node.nodeType || 'fixed') === 'ai-dynamic' 
                          ? '✨ AI会根据提示词动态生成对话内容，每次体验略有不同。' 
                          : (node.nodeType === 'ending')
                          ? '🎯 结局节点，会在内容前显示【结局】标记。'
                          : '直接使用预设的提示词内容作为节点内容，保持一致性。'}
                      </p>
                  </div>

                  <div>
                      <label 
                        className="text-xs font-bold mb-1 block"
                        style={{ color: 'var(--color-info, #818cf8)' }}
                      >
                        AI 剧情指令 (Prompt)
                      </label>
                      <p 
                        className="text-[10px] mb-2"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        {(node.nodeType || 'fixed') === 'ai-dynamic' 
                          ? '描述这一幕发生的事情，AI将根据此场景描述生成符合角色性格的对话和旁白。'
                          : '描述这一幕发生的事情，AI将据此生成旁白。'}
                      </p>
                      <textarea 
                        value={node.prompt} 
                        onChange={(e) => updateNode(node.id, 'prompt', e.target.value)}
                        className="w-full h-40 rounded-xl p-4 outline-none resize-none leading-relaxed"
                        style={{
                          backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                          borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-info, #6366f1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                        }}
                        placeholder="例如：樱有些害羞地低下了头，递给你一封信..."
                      />
                  </div>

                  {/* 多角色对话编辑 */}
                  <div>
                      <label 
                        className="text-xs font-bold mb-1 block"
                        style={{ color: 'var(--color-info, #06b6d4)' }}
                      >
                        多角色对话（可选）
                      </label>
                      <p 
                        className="text-[10px] mb-2"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        设置多个角色在此节点的对话，按顺序显示
                      </p>
                      <div className="space-y-2 mb-2">
                          {(node.multiCharacterDialogue || []).map((dialogue, idx) => (
                              <div 
                                key={`dialogue-${node.id}-${idx}-${dialogue.characterId || idx}`} 
                                className="p-2 rounded-xl border flex gap-2 items-center flex-wrap"
                                style={{
                                  backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                  borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                }}
                              >
                                  <input
                                      type="text"
                                      value={dialogue.characterId}
                                      onChange={(e) => {
                                          const newDialogue = [...(node.multiCharacterDialogue || [])];
                                          newDialogue[idx] = { ...newDialogue[idx], characterId: e.target.value };
                                          updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                                      }}
                                      placeholder="角色ID"
                                      className="w-24 text-[10px] rounded px-2 py-1 border outline-none"
                                      style={{
                                        backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 1))',
                                        borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                        color: 'var(--text-primary)',
                                      }}
                                  />
                                  <input
                                      type="number"
                                      value={dialogue.order || idx + 1}
                                      onChange={(e) => {
                                          const newDialogue = [...(node.multiCharacterDialogue || [])];
                                          newDialogue[idx] = { ...newDialogue[idx], order: parseInt(e.target.value) || idx + 1 };
                                          updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                                      }}
                                      placeholder="顺序"
                                      className="w-12 text-[10px] rounded px-2 py-1 border outline-none"
                                      style={{
                                        backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 1))',
                                        borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                        color: 'var(--text-primary)',
                                      }}
                                  />
                                  <input
                                      type="text"
                                      value={dialogue.content}
                                      onChange={(e) => {
                                          const newDialogue = [...(node.multiCharacterDialogue || [])];
                                          newDialogue[idx] = { ...newDialogue[idx], content: e.target.value };
                                          updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                                      }}
                                      placeholder="对话内容"
                                      className="flex-1 text-[10px] rounded px-2 py-1 border outline-none min-w-[120px]"
                                      style={{
                                        backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 1))',
                                        borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                        color: 'var(--text-primary)',
                                      }}
                                  />
                                  <button
                                      onClick={() => {
                                          const newDialogue = [...(node.multiCharacterDialogue || [])];
                                          newDialogue.splice(idx, 1);
                                          updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                                      }}
                                      className="text-sm px-1"
                                      style={{ color: 'var(--text-disabled)' }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.color = 'var(--color-error, #f87171)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.color = 'var(--text-disabled)';
                                      }}
                                  >
                                      ×
                                  </button>
                              </div>
                          ))}
                      </div>
                      <button
                          onClick={() => {
                              const newDialogue = [...(node.multiCharacterDialogue || []), { characterId: '', content: '', order: (node.multiCharacterDialogue?.length || 0) + 1 }];
                              updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                          }}
                          className="text-[10px] px-2 py-1 rounded border"
                          style={{
                            backgroundColor: 'var(--bg-info-alpha, rgba(6, 182, 212, 0.3))',
                            color: 'var(--color-info, #06b6d4)',
                            borderColor: 'var(--border-info-alpha, rgba(6, 182, 212, 0.3))',
                          }}
                      >
                          + 添加角色对话
                      </button>
                  </div>

                  {/* 时间系统编辑 */}
                  <div>
                      <label 
                        className="text-xs font-bold mb-1 block"
                        style={{ color: 'var(--color-warning, #fb923c)' }}
                      >
                        时间限制（可选）
                      </label>
                      <p 
                        className="text-[10px] mb-2"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        设置节点的时间限制，超时后自动跳转
                      </p>
                      <div className="flex gap-2 items-center">
                          <div className="flex-1">
                              <input
                                  type="number"
                                  min="0"
                                  value={node.timeLimit || ''}
                                  onChange={(e) => updateNode(node.id, 'timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="限时（秒）"
                                  className="w-full text-[10px] rounded px-2 py-1 border outline-none"
                                  style={{
                                    backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                    borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                    color: 'var(--text-primary)',
                                  }}
                              />
                          </div>
                          {node.timeLimit && (
                              <select
                                  value={node.timeoutNodeId || ''}
                                  onChange={(e) => updateNode(node.id, 'timeoutNodeId', e.target.value || undefined)}
                                  className="flex-1 text-[10px] rounded px-2 py-1 border outline-none"
                                  style={{
                                    backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                    borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                    color: 'var(--text-primary)',
                                  }}
                              >
                                  <option value="">超时跳转节点</option>
                                  {Object.values(nodes).map((n: StoryNode) => (
                                      <option key={n.id} value={n.id}>{n.title}</option>
                                  ))}
                              </select>
                          )}
                      </div>
                  </div>

                  <div>
                      <div className="flex justify-between items-center mb-3">
                          <label 
                            className="text-xs font-bold"
                            style={{ color: 'var(--color-success, #34d399)' }}
                          >
                            分支选项
                          </label>
                          <button 
                            onClick={() => addOption(node.id)} 
                            className="text-[10px] px-2 py-1 rounded border"
                            style={{
                              backgroundColor: 'var(--bg-success-alpha, rgba(34, 197, 94, 0.3))',
                              color: 'var(--color-success, #34d399)',
                              borderColor: 'var(--border-success-alpha, rgba(34, 197, 94, 0.3))',
                            }}
                          >
                            + 添加选项
                          </button>
                      </div>
                      
                      <div className="space-y-3">
                          {node.options.map((opt, idx) => (
                              <div 
                                key={opt.id} 
                                className="p-3 rounded-xl border space-y-3"
                                style={{
                                  backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                  borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                }}
                              >
                                  <div className="flex justify-between items-start">
                                      <span 
                                        className="text-[10px] rounded px-1"
                                        style={{
                                          color: 'var(--text-disabled)',
                                          backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 1))',
                                        }}
                                      >
                                        选项 {idx + 1}
                                      </span>
                                      <button 
                                        onClick={() => deleteOption(node.id, idx)} 
                                        className="text-sm"
                                        style={{ color: 'var(--text-disabled)' }}
                                        onMouseEnter={(e) => {
                                          e.currentTarget.style.color = 'var(--color-error, #f87171)';
                                        }}
                                        onMouseLeave={(e) => {
                                          e.currentTarget.style.color = 'var(--text-disabled)';
                                        }}
                                      >
                                        ×
                                      </button>
                                  </div>
                                  <input 
                                    value={opt.text} 
                                    onChange={(e) => updateOption(node.id, idx, 'text', e.target.value)}
                                    placeholder="按钮文字"
                                    className="w-full rounded px-3 py-2 text-sm outline-none"
                                    style={{
                                      backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 1))',
                                      borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                      color: 'var(--text-primary)',
                                    }}
                                    onFocus={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--color-success, #22c55e)';
                                    }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                                    }}
                                  />
                                  <div className="flex items-center gap-2">
                                      <span 
                                        className="text-[10px] shrink-0"
                                        style={{ color: 'var(--text-disabled)' }}
                                      >
                                        跳转至 &rarr;
                                      </span>
                                      <select 
                                        value={opt.nextNodeId}
                                        onChange={(e) => updateOption(node.id, idx, 'nextNodeId', e.target.value)}
                                        className="w-full rounded px-2 py-1.5 text-xs outline-none"
                                        style={{
                                          backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 1))',
                                          borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                          color: 'var(--text-primary)',
                                        }}
                                      >
                                          {Object.values(nodes).map((n: StoryNode) => (
                                              <option key={n.id} value={n.id}>{n.title}</option>
                                          ))}
                                      </select>
                                  </div>
                                  {/* 状态影响编辑 */}
                                  <div 
                                    className="mt-2 pt-2 border-t"
                                    style={{ borderTopColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))' }}
                                  >
                                      <div className="flex justify-between items-center mb-1">
                                          <span 
                                            className="text-[10px] font-bold"
                                            style={{ color: 'var(--color-warning, #fbbf24)' }}
                                          >
                                            状态影响
                                          </span>
                                          <button 
                                            onClick={() => addEffect(node.id, idx)} 
                                            className="text-[9px] px-1.5 py-0.5 rounded border"
                                            style={{
                                              backgroundColor: 'var(--bg-warning-alpha, rgba(251, 191, 36, 0.3))',
                                              color: 'var(--color-warning, #fbbf24)',
                                              borderColor: 'var(--border-warning-alpha, rgba(251, 191, 36, 0.3))',
                                            }}
                                          >
                                              + 添加
                                          </button>
                                      </div>
                                      {(!opt.effects || opt.effects.length === 0) ? (
                                          <p 
                                            className="text-[10px] italic"
                                            style={{ color: 'var(--text-disabled)' }}
                                          >
                                            未设置（可选）
                                          </p>
                                      ) : (
                                          <div className="space-y-1.5">
                                              {opt.effects.map((effect, effectIdx) => (
                                                  <div 
                                                    key={`effect-${node.id}-${idx}-${effectIdx}-${effect.type}-${effect.target}`} 
                                                    className="p-1.5 rounded border flex gap-1.5 items-center"
                                                    style={{
                                                      backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 0.5))',
                                                      borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 0.5))',
                                                    }}
                                                  >
                                                      <select
                                                          value={effect.type}
                                                          onChange={(e) => updateEffect(node.id, idx, effectIdx, 'type', e.target.value)}
                                                          className="text-[10px] rounded px-1.5 py-0.5 border outline-none"
                                                          style={{
                                                            backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                            borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                            color: 'var(--text-primary)',
                                                          }}
                                                      >
                                                          <option value="favorability">好感度</option>
                                                          <option value="event">事件</option>
                                                          <option value="item">物品</option>
                                                      </select>
                                                      <input
                                                          type="text"
                                                          value={effect.target}
                                                          onChange={(e) => updateEffect(node.id, idx, effectIdx, 'target', e.target.value)}
                                                          placeholder={effect.type === 'favorability' ? '角色ID' : effect.type === 'event' ? '事件ID' : '物品ID'}
                                                          className="flex-1 text-[10px] rounded px-1.5 py-0.5 border outline-none"
                                                          style={{
                                                            backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                            borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                            color: 'var(--text-primary)',
                                                          }}
                                                      />
                                                      {effect.type === 'favorability' && (
                                                          <input
                                                              type="number"
                                                              value={effect.value ?? 0}
                                                              onChange={(e) => updateEffect(node.id, idx, effectIdx, 'value', parseInt(e.target.value) || 0)}
                                                              placeholder="±值"
                                                              className="w-16 text-[10px] rounded px-1.5 py-0.5 border outline-none"
                                                              style={{
                                                                backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                                borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                                color: 'var(--text-primary)',
                                                              }}
                                                          />
                                                      )}
                                                      <button
                                                          onClick={() => deleteEffect(node.id, idx, effectIdx)}
                                                          className="text-xs px-0.5"
                                                          style={{ color: 'var(--text-disabled)' }}
                                                          onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = 'var(--color-error, #f87171)';
                                                          }}
                                                          onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'var(--text-disabled)';
                                                          }}
                                                      >
                                                          ×
                                                      </button>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                                  {/* 条件编辑 */}
                                  <div 
                                    className="mt-2 pt-2 border-t"
                                    style={{ borderTopColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))' }}
                                  >
                                      <div className="flex justify-between items-center mb-1">
                                          <span 
                                            className="text-[10px] font-bold"
                                            style={{ color: 'var(--color-info, #60a5fa)' }}
                                          >
                                            显示条件
                                          </span>
                                          <button 
                                            onClick={() => addCondition(node.id, idx)} 
                                            className="text-[9px] px-1.5 py-0.5 rounded border"
                                            style={{
                                              backgroundColor: 'var(--bg-info-alpha, rgba(37, 99, 235, 0.3))',
                                              color: 'var(--color-info, #60a5fa)',
                                              borderColor: 'var(--border-info-alpha, rgba(59, 130, 246, 0.3))',
                                            }}
                                          >
                                              + 添加
                                          </button>
                                      </div>
                                      {(!opt.conditions || opt.conditions.length === 0) ? (
                                          <p 
                                            className="text-[10px] italic"
                                            style={{ color: 'var(--text-disabled)' }}
                                          >
                                            未设置（默认显示）
                                          </p>
                                      ) : (
                                          <div className="space-y-1.5">
                                              {opt.conditions.map((condition, conditionIdx) => (
                                                  <div 
                                                    key={`condition-${node.id}-${idx}-${conditionIdx}-${condition.type}-${condition.target}`} 
                                                    className="p-1.5 rounded border flex gap-1.5 items-center flex-wrap"
                                                    style={{
                                                      backgroundColor: 'var(--bg-primary, rgba(15, 23, 42, 0.5))',
                                                      borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 0.5))',
                                                    }}
                                                  >
                                                      <select
                                                          value={condition.type}
                                                          onChange={(e) => updateCondition(node.id, idx, conditionIdx, 'type', e.target.value)}
                                                          className="text-[10px] rounded px-1.5 py-0.5 border outline-none"
                                                          style={{
                                                            backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                            borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                            color: 'var(--text-primary)',
                                                          }}
                                                      >
                                                          <option value="favorability">好感度</option>
                                                          <option value="event">事件</option>
                                                          <option value="item">物品</option>
                                                          <option value="time">时间</option>
                                                      </select>
                                                      <input
                                                          type="text"
                                                          value={condition.target}
                                                          onChange={(e) => updateCondition(node.id, idx, conditionIdx, 'target', e.target.value)}
                                                          placeholder={condition.type === 'favorability' ? '角色ID' : condition.type === 'event' ? '事件ID' : condition.type === 'item' ? '物品ID' : '时间ID'}
                                                          className="flex-1 text-[10px] rounded px-1.5 py-0.5 border outline-none min-w-[80px]"
                                                          style={{
                                                            backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                            borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                            color: 'var(--text-primary)',
                                                          }}
                                                      />
                                                      <select
                                                          value={condition.operator}
                                                          onChange={(e) => updateCondition(node.id, idx, conditionIdx, 'operator', e.target.value)}
                                                          className="text-[10px] rounded px-1.5 py-0.5 border outline-none"
                                                          style={{
                                                            backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                            borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                            color: 'var(--text-primary)',
                                                          }}
                                                      >
                                                          {(condition.type === 'favorability' || condition.type === 'time') && (
                                                              <>
                                                                  <option value=">=">{'>='}</option>
                                                                  <option value="<=">{'<='}</option>
                                                                  <option value=">">{'>'}</option>
                                                                  <option value="<">{'<'}</option>
                                                                  <option value="==">{'=='}</option>
                                                                  <option value="!=">{'!='}</option>
                                                              </>
                                                          )}
                                                          {(condition.type === 'event' || condition.type === 'item') && (
                                                              <>
                                                                  <option value="has">拥有</option>
                                                                  <option value="not_has">不拥有</option>
                                                              </>
                                                          )}
                                                      </select>
                                                      {(condition.type === 'favorability' || condition.type === 'time') && (
                                                          <input
                                                              type="number"
                                                              value={condition.value ?? 0}
                                                              onChange={(e) => updateCondition(node.id, idx, conditionIdx, 'value', parseFloat(e.target.value) || 0)}
                                                              placeholder="值"
                                                              className="w-16 text-[10px] rounded px-1.5 py-0.5 border outline-none"
                                                              style={{
                                                                backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                                                                borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                                                                color: 'var(--text-primary)',
                                                              }}
                                                          />
                                                      )}
                                                      <button
                                                          onClick={() => deleteCondition(node.id, idx, conditionIdx)}
                                                          className="text-xs px-0.5"
                                                          style={{ color: 'var(--text-disabled)' }}
                                                          onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = 'var(--color-error, #f87171)';
                                                          }}
                                                          onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'var(--text-disabled)';
                                                          }}
                                                      >
                                                          ×
                                                      </button>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {node.options.length === 0 && (
                              <div 
                                className="text-center text-xs py-2 border-2 border-dashed rounded-xl"
                                style={{
                                  color: 'var(--text-disabled)',
                                  borderColor: 'var(--border-color-overlay, rgba(30, 41, 59, 1))',
                                }}
                              >
                                无分支（剧情结束）
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div 
      className="h-full flex flex-col relative overflow-hidden"
      style={{
        backgroundColor: 'var(--bg-primary, #000000)',
        color: 'var(--text-primary)',
      }}
    >
      
      {/* Header */}
      <div 
        className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b flex justify-between items-center backdrop-blur-md z-10"
        style={{
          borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
          backgroundColor: 'var(--bg-primary, rgba(0, 0, 0, 0.8))',
        }}
      >
          <button 
            onClick={onCancel}
            style={{ color: 'var(--text-tertiary)' }}
          >
            取消
          </button>
          <h2 
            className="font-bold text-lg"
            style={{ color: 'var(--text-primary)' }}
          >
            剧本编辑器
          </h2>
          <button 
            onClick={handleSave}
            className="font-bold"
            style={{ color: 'var(--color-pink, #ec4899)' }}
          >
            保存
          </button>
      </div>

      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{
          borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
          backgroundColor: 'var(--bg-primary, #000000)',
        }}
      >
          <button 
            onClick={() => setActiveTab('basic')}
            className="flex-1 py-3 text-sm font-bold transition-colors border-b-2"
            style={{
              color: activeTab === 'basic' ? 'var(--text-primary)' : 'var(--text-disabled)',
              borderBottomColor: activeTab === 'basic' ? 'var(--color-pink, #ec4899)' : 'transparent',
            }}
          >
              基本设定
          </button>
          <button 
            onClick={() => setActiveTab('nodes')}
            className="flex-1 py-3 text-sm font-bold transition-colors border-b-2"
            style={{
              color: activeTab === 'nodes' ? 'var(--text-primary)' : 'var(--text-disabled)',
              borderBottomColor: activeTab === 'nodes' ? 'var(--color-info, #6366f1)' : 'transparent',
            }}
          >
              剧情节点 ({Object.keys(nodes).length})
          </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
          
          {/* Basic Tab */}
          {activeTab === 'basic' && (
              <div className="space-y-6">
                  <div 
                    className="border p-4 rounded-2xl flex flex-col items-center text-center space-y-3"
                    style={{
                      background: 'linear-gradient(to bottom right, var(--bg-info-alpha, rgba(30, 58, 138, 0.4)), var(--bg-accent-alpha, rgba(88, 28, 135, 0.4)))',
                      borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                    }}
                  >
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: 'var(--bg-overlay-alpha, rgba(255, 255, 255, 0.1))' }}
                      >
                        ✨
                      </div>
                      <div>
                          <h3 
                            className="font-bold"
                            style={{ color: 'var(--text-primary)' }}
                          >
                            AI 灵感生成
                          </h3>
                          <p 
                            className="text-xs mt-1"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            输入你的想法，AI为你构建完整剧本
                          </p>
                      </div>
                      <MobileTouchableButton 
                        variant="secondary" 
                        size="md" 
                        fullWidth
                        onClick={() => setShowMagicModal(true)}
                      >
                        打开 AI 生成器
                      </MobileTouchableButton>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label 
                            className="text-xs font-bold mb-1 block"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            剧本标题
                          </label>
                          <input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            className="w-full rounded-xl px-4 py-3 outline-none font-bold"
                            style={{
                              backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 1))',
                              borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-pink, #ec4899)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                            }}
                          />
                      </div>
                      <div>
                          <label 
                            className="text-xs font-bold mb-1 block"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            简介
                          </label>
                          <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            className="w-full h-32 rounded-xl p-4 outline-none resize-none"
                            style={{
                              backgroundColor: 'var(--bg-card, rgba(15, 23, 42, 1))',
                              borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                              color: 'var(--text-primary)',
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.borderColor = 'var(--color-pink, #ec4899)';
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.borderColor = 'var(--border-color-overlay, rgba(51, 65, 85, 1))';
                            }}
                          />
                      </div>
                  </div>
              </div>
          )}

          {/* Nodes Tab */}
          {activeTab === 'nodes' && (
              <div className="space-y-4 pb-20">
                  <div className="flex justify-between items-center mb-2">
                      <p 
                        className="text-xs"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        点击节点进行编辑
                      </p>
                      <button 
                        onClick={addNode} 
                        className="text-xs px-3 py-1.5 rounded-full shadow-lg"
                        style={{
                          backgroundColor: 'var(--color-info, #6366f1)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        + 新增节点
                      </button>
                  </div>
                  
                  {Object.values(nodes).map((node: StoryNode, index) => (
                      <div 
                        key={node.id} 
                        onClick={() => setEditingNodeId(node.id)}
                        className="p-4 rounded-xl border cursor-pointer active:scale-95 transition-all"
                        style={{
                          backgroundColor: node.id === 'start' 
                            ? 'var(--bg-info-alpha, rgba(30, 58, 138, 0.2))' 
                            : 'var(--bg-card, rgba(15, 23, 42, 1))',
                          borderColor: node.id === 'start' 
                            ? 'var(--border-info-alpha, rgba(99, 102, 241, 0.5))' 
                            : 'var(--border-color-overlay, rgba(30, 41, 59, 1))',
                        }}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <h4 
                                className="font-bold flex items-center gap-2"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                  {node.id === 'start' && (
                                    <span 
                                      className="text-[10px] px-1.5 rounded"
                                      style={{
                                        backgroundColor: 'var(--color-info, #6366f1)',
                                        color: 'var(--text-primary)',
                                      }}
                                    >
                                      START
                                    </span>
                                  )}
                                  {node.title}
                              </h4>
                              <span 
                                className="text-lg"
                                style={{ color: 'var(--text-disabled)' }}
                              >
                                &rsaquo;
                              </span>
                          </div>
                          <p 
                            className="text-xs line-clamp-1"
                            style={{ color: 'var(--text-tertiary)' }}
                          >
                            {node.prompt || '暂无内容...'}
                          </p>
                          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                              {node.options.map(opt => (
                                  <span 
                                    key={opt.id} 
                                    className="text-[10px] border px-2 py-1 rounded whitespace-nowrap"
                                    style={{
                                      backgroundColor: 'var(--bg-overlay-alpha, rgba(255, 255, 255, 0.05))',
                                      borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
                                      color: 'var(--text-secondary)',
                                    }}
                                  >
                                      {opt.text} &rarr;
                                  </span>
                              ))}
                              {node.options.length === 0 && (
                                <span 
                                  className="text-[10px]"
                                  style={{ color: 'var(--text-disabled)' }}
                                >
                                  END
                                </span>
                              )}
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>

      {/* Editor Drawer */}
      {editingNodeId && renderNodeEditor()}

      {/* Magic Modal */}
      {showMagicModal && (
          <div 
            className="absolute inset-0 z-50 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
            style={{ backgroundColor: 'var(--bg-modal-backdrop, rgba(0, 0, 0, 0.9))' }}
          >
              <div 
                className="w-full rounded-2xl border p-6 shadow-2xl"
                style={{
                  backgroundColor: 'var(--bg-modal, rgba(15, 23, 42, 1))',
                  borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                }}
              >
                  <h3 
                    className="text-xl font-bold mb-4"
                    style={{
                      background: 'var(--gradient-text-primary, linear-gradient(to right, var(--color-info, #818cf8), var(--color-pink, #ec4899)))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    AI 创意生成
                  </h3>
                  <textarea 
                    value={magicPrompt}
                    onChange={e => setMagicPrompt(e.target.value)}
                    placeholder="输入一个故事想法，例如：“在深夜的便利店遇到了前女友，但她似乎不记得我了...”"
                    className="w-full h-32 rounded-xl p-4 outline-none resize-none mb-6"
                    style={{
                      backgroundColor: 'var(--bg-card, rgba(30, 41, 59, 1))',
                      borderColor: 'var(--border-color-overlay, rgba(51, 65, 85, 1))',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <div className="flex gap-3">
                      <MobileTouchableButton 
                        variant="secondary" 
                        size="md" 
                        fullWidth
                        onClick={() => setShowMagicModal(false)} 
                        disabled={isMagicLoading}
                      >
                        取消
                      </MobileTouchableButton>
                      <MobileTouchableButton 
                        variant="primary" 
                        size="md" 
                        fullWidth
                        onClick={handleMagicBuild} 
                        disabled={isMagicLoading || !magicPrompt.trim()}
                        loading={isMagicLoading}
                      >
                        开始生成
                      </MobileTouchableButton>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};