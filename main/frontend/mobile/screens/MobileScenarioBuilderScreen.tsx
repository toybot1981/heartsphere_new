import React, { useState, useEffect, memo } from 'react';
import { CustomScenario, StoryNode, StoryOption, StoryOptionEffect, StoryOptionCondition } from '../../types';
import { aiService } from '../../services/ai';
import { showAlert, showConfirm } from '../../utils/dialog';
import { MobileTouchableButton } from '../components/MobileTouchableButton';
import { MobileSmoothScroll } from '../components/MobileSmoothScroll';
import { MobileInputStyles, MobileColors, MobileCardStyles } from '../components/MobileStyleGuide';
import { MobileLoadingSpinner } from '../components/MobileLoadingSpinner';

interface MobileScenarioBuilderProps {
  initialScenario?: CustomScenario | null;
  onSave: (scenario: CustomScenario) => void;
  onCancel: () => void;
}

/**
 * Mobile版本剧本构建器页面组件
 * Phase 5优化: 使用React.memo优化渲染性能
 */
export const MobileScenarioBuilder: React.FC<MobileScenarioBuilderProps> = memo(({ initialScenario, onSave, onCancel }) => {
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
          <div className="absolute inset-0 z-20 bg-slate-900 flex flex-col animate-fade-in">
              <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur-md">
                  <MobileTouchableButton onClick={() => setEditingNodeId(null)} variant="ghost" size="sm" className="text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                      返回
                  </MobileTouchableButton>
                  <h3 className="font-bold text-white truncate max-w-[150px]">{node.title}</h3>
                  <MobileTouchableButton onClick={() => deleteNode(node.id)} variant="danger" size="sm">删除</MobileTouchableButton>
              </div>
              
              <MobileSmoothScroll className="flex-1 p-4 space-y-6">
                  <div>
                      <label className="text-xs text-slate-500 font-bold mb-1 block">节点标题 (内部标识)</label>
                      <input 
                        value={node.title} 
                        onChange={(e) => updateNode(node.id, 'title', e.target.value)}
                        className={`${MobileInputStyles} text-base`}
                      />
                  </div>

                  <div>
                      <label className="text-xs text-purple-400 font-bold mb-2 block">节点类型</label>
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`nodeType-${node.id}`}
                            value="fixed"
                            checked={(node.nodeType || 'fixed') === 'fixed'}
                            onChange={() => updateNode(node.id, 'nodeType', 'fixed')}
                            className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-xs text-white">固定内容</span>
                          <span className="text-[10px] text-slate-500">(直接显示预设内容)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`nodeType-${node.id}`}
                            value="ai-dynamic"
                            checked={node.nodeType === 'ai-dynamic'}
                            onChange={() => updateNode(node.id, 'nodeType', 'ai-dynamic')}
                            className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-xs text-white">AI动态生成</span>
                          <span className="text-[10px] text-slate-500">(AI根据提示词生成内容)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`nodeType-${node.id}`}
                            value="ending"
                            checked={node.nodeType === 'ending'}
                            onChange={() => updateNode(node.id, 'nodeType', 'ending')}
                            className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                          />
                          <span className="text-xs text-white">结局节点</span>
                          <span className="text-[10px] text-slate-500">(剧本的结局)</span>
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {(node.nodeType || 'fixed') === 'ai-dynamic' 
                          ? '✨ AI会根据提示词动态生成对话内容，每次体验略有不同。' 
                          : (node.nodeType === 'ending')
                          ? '🎯 结局节点，会在内容前显示【结局】标记。'
                          : '直接使用预设的提示词内容作为节点内容，保持一致性。'}
                      </p>
                  </div>

                  <div>
                      <label className="text-xs text-indigo-400 font-bold mb-1 block">AI 剧情指令 (Prompt)</label>
                      <p className="text-[10px] text-slate-500 mb-2">
                        {(node.nodeType || 'fixed') === 'ai-dynamic' 
                          ? '描述这一幕发生的事情，AI将根据此场景描述生成符合角色性格的对话和旁白。'
                          : '描述这一幕发生的事情，AI将据此生成旁白。'}
                      </p>
                      <textarea 
                        value={node.prompt} 
                        onChange={(e) => updateNode(node.id, 'prompt', e.target.value)}
                        className={`${MobileInputStyles} h-40 resize-none leading-relaxed`}
                        placeholder="例如：樱有些害羞地低下了头，递给你一封信..."
                      />
                  </div>

                  {/* 多角色对话编辑 */}
                  <div>
                      <label className="text-xs text-cyan-400 font-bold mb-1 block">多角色对话（可选）</label>
                      <p className="text-[10px] text-slate-500 mb-2">设置多个角色在此节点的对话，按顺序显示</p>
                      <div className="space-y-2 mb-2">
                          {(node.multiCharacterDialogue || []).map((dialogue, idx) => (
                              <div key={idx} className="bg-slate-800 p-2 rounded-xl border border-slate-700 flex gap-2 items-center flex-wrap">
                                  <input
                                      type="text"
                                      value={dialogue.characterId}
                                      onChange={(e) => {
                                          const newDialogue = [...(node.multiCharacterDialogue || [])];
                                          newDialogue[idx] = { ...newDialogue[idx], characterId: e.target.value };
                                          updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                                      }}
                                      placeholder="角色ID"
                                      className={`${MobileInputStyles} w-24 text-[10px]`}
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
                                      className={`${MobileInputStyles} w-12 text-[10px]`}
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
                                      className={`${MobileInputStyles} flex-1 text-[10px] min-w-[120px]`}
                                  />
                                  <MobileTouchableButton
                                      onClick={() => {
                                          const newDialogue = [...(node.multiCharacterDialogue || [])];
                                          newDialogue.splice(idx, 1);
                                          updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                                      }}
                                      variant="ghost"
                                      size="sm"
                                      className="text-slate-500 hover:text-red-400 text-sm px-1"
                                  >
                                      ×
                                  </MobileTouchableButton>
                              </div>
                          ))}
                      </div>
                      <MobileTouchableButton
                          onClick={() => {
                              const newDialogue = [...(node.multiCharacterDialogue || []), { characterId: '', content: '', order: (node.multiCharacterDialogue?.length || 0) + 1 }];
                              updateNode(node.id, 'multiCharacterDialogue', newDialogue);
                          }}
                          variant="outline"
                          size="sm"
                          className="text-[10px] bg-cyan-900/30 text-cyan-400 border-cyan-500/30"
                      >
                          + 添加角色对话
                      </MobileTouchableButton>
                  </div>

                  {/* 时间系统编辑 */}
                  <div>
                      <label className="text-xs text-orange-400 font-bold mb-1 block">时间限制（可选）</label>
                      <p className="text-[10px] text-slate-500 mb-2">设置节点的时间限制，超时后自动跳转</p>
                      <div className="flex gap-2 items-center">
                          <div className="flex-1">
                              <input
                                  type="number"
                                  min="0"
                                  value={node.timeLimit || ''}
                                  onChange={(e) => updateNode(node.id, 'timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                                  placeholder="限时（秒）"
                                  className={`${MobileInputStyles} w-full text-[10px]`}
                              />
                          </div>
                          {node.timeLimit && (
                              <select
                                  value={node.timeoutNodeId || ''}
                                  onChange={(e) => updateNode(node.id, 'timeoutNodeId', e.target.value || undefined)}
                                  className="flex-1 text-[10px] bg-slate-800 rounded px-2 py-1 border border-slate-700 text-white outline-none"
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
                          <label className="text-xs text-green-400 font-bold">分支选项</label>
                          <MobileTouchableButton onClick={() => addOption(node.id)} variant="outline" size="sm" className="text-[10px] bg-green-900/30 text-green-400 border-green-500/30">+ 添加选项</MobileTouchableButton>
                      </div>
                      
                      <div className="space-y-3">
                          {node.options.map((opt, idx) => (
                              <div key={opt.id} className="bg-slate-800 p-3 rounded-xl border border-slate-700 space-y-3">
                                  <div className="flex justify-between items-start">
                                      <span className="text-[10px] text-slate-500 rounded bg-slate-900 px-1">选项 {idx + 1}</span>
                                      <MobileTouchableButton onClick={() => deleteOption(node.id, idx)} variant="ghost" size="sm" className="text-slate-600 hover:text-red-400">×</MobileTouchableButton>
                                  </div>
                                  <input 
                                    value={opt.text} 
                                    onChange={(e) => updateOption(node.id, idx, 'text', e.target.value)}
                                    placeholder="按钮文字"
                                    className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                                  />
                                  <div className="flex items-center gap-2">
                                      <span className="text-[10px] text-slate-500 shrink-0">跳转至 &rarr;</span>
                                      <select 
                                        value={opt.nextNodeId}
                                        onChange={(e) => updateOption(node.id, idx, 'nextNodeId', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white outline-none"
                                      >
                                          {Object.values(nodes).map((n: StoryNode) => (
                                              <option key={n.id} value={n.id}>{n.title}</option>
                                          ))}
                                      </select>
                                  </div>
                                  {/* 状态影响编辑 */}
                                  <div className="mt-2 pt-2 border-t border-slate-700">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] text-yellow-400 font-bold">状态影响</span>
                                          <MobileTouchableButton 
                                            onClick={() => addEffect(node.id, idx)} 
                                            variant="outline"
                                            size="sm"
                                            className="text-[9px] bg-yellow-900/30 text-yellow-400 border-yellow-500/30"
                                          >
                                              + 添加
                                          </MobileTouchableButton>
                                      </div>
                                      {(!opt.effects || opt.effects.length === 0) ? (
                                          <p className="text-[10px] text-slate-500 italic">未设置（可选）</p>
                                      ) : (
                                          <div className="space-y-1.5">
                                              {opt.effects.map((effect, effectIdx) => (
                                                  <div key={effectIdx} className="bg-slate-900/50 p-1.5 rounded border border-slate-700/50 flex gap-1.5 items-center">
                                                      <select
                                                          value={effect.type}
                                                          onChange={(e) => updateEffect(node.id, idx, effectIdx, 'type', e.target.value)}
                                                          className={`${MobileInputStyles} text-[10px]`}
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
                                                          className={`${MobileInputStyles} flex-1 text-[10px]`}
                                                      />
                                                      {effect.type === 'favorability' && (
                                                          <input
                                                              type="number"
                                                              value={effect.value ?? 0}
                                                              onChange={(e) => updateEffect(node.id, idx, effectIdx, 'value', parseInt(e.target.value) || 0)}
                                                              placeholder="±值"
                                                              className={`${MobileInputStyles} w-16 text-[10px]`}
                                                          />
                                                      )}
                                                      <MobileTouchableButton
                                                          onClick={() => deleteEffect(node.id, idx, effectIdx)}
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-slate-500 hover:text-red-400 text-xs px-0.5"
                                                      >
                                                          ×
                                                      </MobileTouchableButton>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                                  {/* 条件编辑 */}
                                  <div className="mt-2 pt-2 border-t border-slate-700">
                                      <div className="flex justify-between items-center mb-1">
                                          <span className="text-[10px] text-blue-400 font-bold">显示条件</span>
                                          <MobileTouchableButton 
                                            onClick={() => addCondition(node.id, idx)} 
                                            variant="outline"
                                            size="sm"
                                            className="text-[9px] bg-blue-900/30 text-blue-400 border-blue-500/30"
                                          >
                                              + 添加
                                          </MobileTouchableButton>
                                      </div>
                                      {(!opt.conditions || opt.conditions.length === 0) ? (
                                          <p className="text-[10px] text-slate-500 italic">未设置（默认显示）</p>
                                      ) : (
                                          <div className="space-y-1.5">
                                              {opt.conditions.map((condition, conditionIdx) => (
                                                  <div key={conditionIdx} className="bg-slate-900/50 p-1.5 rounded border border-slate-700/50 flex gap-1.5 items-center flex-wrap">
                                                      <select
                                                          value={condition.type}
                                                          onChange={(e) => updateCondition(node.id, idx, conditionIdx, 'type', e.target.value)}
                                                          className={`${MobileInputStyles} text-[10px]`}
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
                                                          className="flex-1 text-[10px] bg-slate-800 rounded px-1.5 py-0.5 border border-slate-700 text-white outline-none min-w-[80px]"
                                                      />
                                                      <select
                                                          value={condition.operator}
                                                          onChange={(e) => updateCondition(node.id, idx, conditionIdx, 'operator', e.target.value)}
                                                          className={`${MobileInputStyles} text-[10px]`}
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
                                                              className={`${MobileInputStyles} w-16 text-[10px]`}
                                                          />
                                                      )}
                                                      <MobileTouchableButton
                                                          onClick={() => deleteCondition(node.id, idx, conditionIdx)}
                                                          variant="ghost"
                                                          size="sm"
                                                          className="text-slate-500 hover:text-red-400 text-xs px-0.5"
                                                      >
                                                          ×
                                                      </MobileTouchableButton>
                                                  </div>
                                              ))}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {node.options.length === 0 && (
                              <div className="text-center text-xs text-slate-600 py-2 border-2 border-dashed border-slate-800 rounded-xl">无分支（剧情结束）</div>
                          )}
                      </div>
                  </div>
              </MobileSmoothScroll>
          </div>
      );
  };

  return (
    <div className="h-full bg-black text-white flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <div className="p-4 pt-[calc(1rem+env(safe-area-inset-top))] border-b border-white/10 flex justify-between items-center bg-black/80 backdrop-blur-md z-10">
          <MobileTouchableButton onClick={onCancel} variant="ghost" size="sm" className="text-slate-400">取消</MobileTouchableButton>
          <h2 className="font-bold text-lg">剧本编辑器</h2>
          <MobileTouchableButton onClick={handleSave} variant="primary" size="sm" className="text-purple-400 font-bold">保存</MobileTouchableButton>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-black">
          <button 
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'basic' ? 'text-white border-b-2 border-purple-500/50' : 'text-slate-500'}`}
          >
              基本设定
          </button>
          <button 
            onClick={() => setActiveTab('nodes')}
            className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'nodes' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-500'}`}
          >
              剧情节点 ({Object.keys(nodes).length})
          </button>
      </div>

      {/* Content */}
      <MobileSmoothScroll className="flex-1 p-4">
          
          {/* Basic Tab */}
          {activeTab === 'basic' && (
              <div className="space-y-6">
                  <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 p-4 rounded-2xl flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl">✨</div>
                      <div>
                          <h3 className="font-bold text-white">AI 灵感生成</h3>
                          <p className="text-xs text-slate-400 mt-1">输入你的想法，AI为你构建完整剧本</p>
                      </div>
                      <MobileTouchableButton
                        onClick={() => setShowMagicModal(true)}
                        variant="outline"
                        size="md"
                        fullWidth
                        className="bg-white/10 border-white/20"
                      >
                          打开 AI 生成器
                      </MobileTouchableButton>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs text-slate-500 font-bold mb-1 block">剧本标题</label>
                          <input 
                            value={title} 
                            onChange={e => setTitle(e.target.value)}
                            className={`${MobileInputStyles} text-base font-bold focus:border-purple-500/50`}
                          />
                      </div>
                      <div>
                          <label className="text-xs text-slate-500 font-bold mb-1 block">简介</label>
                          <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)}
                            className={`${MobileInputStyles} h-32 resize-none focus:border-purple-500/50`}
                          />
                      </div>
                  </div>
              </div>
          )}

          {/* Nodes Tab */}
          {activeTab === 'nodes' && (
              <div className="space-y-4 pb-[calc(4rem+env(safe-area-inset-bottom))]">
                  <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-slate-500">点击节点进行编辑</p>
                      <MobileTouchableButton onClick={addNode} variant="primary" size="sm" className="bg-indigo-600 shadow-lg">+ 新增节点</MobileTouchableButton>
                  </div>
                  
                  {Object.values(nodes).map((node: StoryNode, index) => (
                      <div 
                        key={node.id} 
                        onClick={() => setEditingNodeId(node.id)}
                        className={`p-4 rounded-xl border cursor-pointer active:scale-95 transition-all ${
                            node.id === 'start' ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900 border-slate-800'
                        }`}
                      >
                          <div className="flex justify-between items-center mb-1">
                              <h4 className="font-bold text-white flex items-center gap-2">
                                  {node.id === 'start' && <span className="text-[10px] bg-indigo-500 text-white px-1.5 rounded">START</span>}
                                  {node.title}
                              </h4>
                              <span className="text-slate-600 text-lg">&rsaquo;</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-1">{node.prompt || '暂无内容...'}</p>
                          <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                              {node.options.map(opt => (
                                  <span key={opt.id} className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-slate-300 whitespace-nowrap">
                                      {opt.text} &rarr;
                                  </span>
                              ))}
                              {node.options.length === 0 && <span className="text-[10px] text-slate-600">END</span>}
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </MobileSmoothScroll>

      {/* Editor Drawer */}
      {editingNodeId && renderNodeEditor()}

      {/* Magic Modal */}
      {showMagicModal && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
              <div className="w-full bg-slate-900 rounded-2xl border border-slate-700 p-6 shadow-2xl">
                  <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4">AI 创意生成</h3>
                  <textarea 
                    value={magicPrompt}
                    onChange={e => setMagicPrompt(e.target.value)}
                    placeholder="输入一个故事想法，例如：“在深夜的便利店遇到了前女友，但她似乎不记得我了...”"
                    className={`${MobileInputStyles} h-32 resize-none mb-6`}
                  />
                  <div className="flex gap-3">
                      <MobileTouchableButton
                        variant="ghost"
                        onClick={() => setShowMagicModal(false)}
                        disabled={isMagicLoading}
                        fullWidth
                      >
                        取消
                      </MobileTouchableButton>
                      <MobileTouchableButton
                        onClick={handleMagicBuild}
                        disabled={isMagicLoading || !magicPrompt.trim()}
                        variant="primary"
                        fullWidth
                        loading={isMagicLoading}
                        className="bg-indigo-600"
                      >
                          {isMagicLoading ? '生成中...' : '开始生成'}
                      </MobileTouchableButton>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
});

MobileScenarioBuilder.displayName = 'MobileScenarioBuilder';