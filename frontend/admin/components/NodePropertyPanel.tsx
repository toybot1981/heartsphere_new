import React, { useState, useEffect } from 'react';
import { Node } from 'reactflow';
import { InputGroup, TextInput, TextArea, ConfigSection } from './AdminUIComponents';
import { EntitySelector } from './EntitySelector';
import type { GraphNode } from '../../services/api/admin/graphTypes';

interface NodePropertyPanelProps {
  node: Node;
  onUpdate: (nodeId: string, config: Record<string, any>) => void;
  adminToken?: string | null;
}

/**
 * 节点属性编辑面板
 * 根据节点类型显示不同的属性编辑界面
 */
export const NodePropertyPanel: React.FC<NodePropertyPanelProps> = ({ node, onUpdate, adminToken }) => {
  const nodeType = node.data.nodeType;
  const config = node.data.config || {};
  
  const updateConfig = (updates: Record<string, any>) => {
    onUpdate(node.id, { ...config, ...updates });
  };

  // 根据节点类型渲染不同的编辑界面
  switch (nodeType) {
    case 'start':
      return <StartNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'dialogue':
      return <DialogueNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'choice':
      return <ChoiceNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'condition':
      return <ConditionNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'skill_check':
      return <SkillCheckNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'state_change':
      return <StateChangeNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'wait':
      return <WaitNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'end':
      return <EndNodePanel node={node} config={config} onUpdate={updateConfig} />;
    case 'era':
    case 'scene':
      return <EraNodePanel node={node} config={config} onUpdate={updateConfig} adminToken={adminToken} />;
    case 'character':
      return <CharacterNodePanel node={node} config={config} onUpdate={updateConfig} adminToken={adminToken} />;
    case 'event':
      return <EventNodePanel node={node} config={config} onUpdate={updateConfig} adminToken={adminToken} />;
    case 'item':
      return <ItemNodePanel node={node} config={config} onUpdate={updateConfig} adminToken={adminToken} />;
    case 'entity_relation':
    case 'relation':
      return <EntityRelationNodePanel node={node} config={config} onUpdate={updateConfig} adminToken={adminToken} />;
    default:
      return <GenericNodePanel node={node} config={config} onUpdate={updateConfig} />;
  }
};

/**
 * 开始节点属性面板
 */
const StartNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ node, config, onUpdate }) => {
  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value="start" disabled />
      </InputGroup>
      <InputGroup label="下一个节点ID">
        <TextInput
          value={config.nextNodeId || ''}
          onChange={(e) => onUpdate({ nextNodeId: e.target.value })}
          placeholder="输入下一个节点ID"
        />
      </InputGroup>
    </div>
  );
};

/**
 * 对话节点属性面板
 */
const DialogueNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [content, setContent] = useState(config.content || '');
  const [type, setType] = useState(config.type || 'DIALOGUE');
  const [characterId, setCharacterId] = useState(config.characterId || '');
  const [characterName, setCharacterName] = useState(config.characterName || '');

  useEffect(() => {
    onUpdate({
      content,
      type,
      characterId: characterId || undefined,
      characterName: characterName || undefined,
    });
  }, [content, type, characterId, characterName, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="对话内容" required>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="输入对话内容"
          rows={5}
        />
      </InputGroup>
      <InputGroup label="对话类型">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="DIALOGUE">对话</option>
          <option value="NARRATION">旁白</option>
          <option value="THOUGHT">内心独白</option>
        </select>
      </InputGroup>
      <ConfigSection title="角色信息（可选）">
        <InputGroup label="角色ID">
          <TextInput
            value={characterId}
            onChange={(e) => setCharacterId(e.target.value)}
            placeholder="角色ID"
          />
        </InputGroup>
        <InputGroup label="角色名称">
          <TextInput
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="角色名称"
          />
        </InputGroup>
      </ConfigSection>
    </div>
  );
};

/**
 * 选择节点属性面板
 */
const ChoiceNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [prompt, setPrompt] = useState(config.prompt || '');
  const [options, setOptions] = useState<any[]>(config.options || []);

  useEffect(() => {
    onUpdate({ prompt, options });
  }, [prompt, options, onUpdate]);

  const addOption = () => {
    setOptions([...options, {
      id: `option_${Date.now()}`,
      text: '',
      nextNodeId: '',
    }]);
  };

  const updateOption = (index: number, updates: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <InputGroup label="提示文本" required>
        <TextArea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="输入选择提示文本"
          rows={3}
        />
      </InputGroup>
      <ConfigSection title="选项列表">
        <div className="space-y-4">
          {options.map((option, index) => (
            <div key={option.id || index} className="bg-slate-800/50 p-3 rounded border border-slate-700">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400">选项 {index + 1}</span>
                <button
                  onClick={() => removeOption(index)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  删除
                </button>
              </div>
              <div className="space-y-2">
                <TextInput
                  value={option.id || ''}
                  onChange={(e) => updateOption(index, { id: e.target.value })}
                  placeholder="选项ID"
                  className="text-xs"
                />
                <TextInput
                  value={option.text || ''}
                  onChange={(e) => updateOption(index, { text: e.target.value })}
                  placeholder="选项文本"
                  className="text-xs"
                />
                <TextInput
                  value={option.nextNodeId || ''}
                  onChange={(e) => updateOption(index, { nextNodeId: e.target.value })}
                  placeholder="下一个节点ID"
                  className="text-xs"
                />
              </div>
            </div>
          ))}
          <button
            onClick={addOption}
            className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + 添加选项
          </button>
        </div>
      </ConfigSection>
    </div>
  );
};

/**
 * 条件节点属性面板
 */
const ConditionNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [logicType, setLogicType] = useState(config.logicType || 'AND');
  const [trueNodeId, setTrueNodeId] = useState(config.trueNodeId || '');
  const [falseNodeId, setFalseNodeId] = useState(config.falseNodeId || '');

  useEffect(() => {
    onUpdate({
      logicType,
      trueNodeId,
      falseNodeId,
      conditions: config.conditions || [],
    });
  }, [logicType, trueNodeId, falseNodeId, config.conditions, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="逻辑类型">
        <select
          value={logicType}
          onChange={(e) => setLogicType(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="AND">AND（所有条件都满足）</option>
          <option value="OR">OR（任意一个条件满足）</option>
        </select>
      </InputGroup>
      <InputGroup label="True分支节点ID">
        <TextInput
          value={trueNodeId}
          onChange={(e) => setTrueNodeId(e.target.value)}
          placeholder="条件满足时跳转的节点ID"
        />
      </InputGroup>
      <InputGroup label="False分支节点ID">
        <TextInput
          value={falseNodeId}
          onChange={(e) => setFalseNodeId(e.target.value)}
          placeholder="条件不满足时跳转的节点ID"
        />
      </InputGroup>
      <div className="text-xs text-slate-500 mt-2">
        条件配置需要通过JSON编辑（高级功能）
      </div>
    </div>
  );
};

/**
 * 技能检查节点属性面板
 */
const SkillCheckNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [skillId, setSkillId] = useState(config.skillId || '');
  const [operator, setOperator] = useState(config.operator || '>=');
  const [targetValue, setTargetValue] = useState(config.targetValue || 0);
  const [successNodeId, setSuccessNodeId] = useState(config.successNodeId || '');
  const [failureNodeId, setFailureNodeId] = useState(config.failureNodeId || '');

  useEffect(() => {
    onUpdate({
      skillId,
      operator,
      targetValue: Number(targetValue),
      successNodeId,
      failureNodeId,
    });
  }, [skillId, operator, targetValue, successNodeId, failureNodeId, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="技能ID" required>
        <TextInput
          value={skillId}
          onChange={(e) => setSkillId(e.target.value)}
          placeholder="技能ID"
        />
      </InputGroup>
      <InputGroup label="运算符">
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value=">">&gt;</option>
          <option value="<">&lt;</option>
          <option value=">=">&gt;=</option>
          <option value="<=">&lt;=</option>
          <option value="==">==</option>
          <option value="!=">!=</option>
        </select>
      </InputGroup>
      <InputGroup label="目标值" required>
        <TextInput
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(Number(e.target.value))}
          placeholder="目标技能值"
        />
      </InputGroup>
      <InputGroup label="成功节点ID">
        <TextInput
          value={successNodeId}
          onChange={(e) => setSuccessNodeId(e.target.value)}
          placeholder="检查成功时跳转的节点ID"
        />
      </InputGroup>
      <InputGroup label="失败节点ID">
        <TextInput
          value={failureNodeId}
          onChange={(e) => setFailureNodeId(e.target.value)}
          placeholder="检查失败时跳转的节点ID"
        />
      </InputGroup>
    </div>
  );
};

/**
 * 状态变更节点属性面板
 */
const StateChangeNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [nextNodeId, setNextNodeId] = useState(config.nextNodeId || '');

  useEffect(() => {
    onUpdate({
      nextNodeId,
      changes: config.changes || [],
    });
  }, [nextNodeId, config.changes, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="下一个节点ID">
        <TextInput
          value={nextNodeId}
          onChange={(e) => setNextNodeId(e.target.value)}
          placeholder="下一个节点ID"
        />
      </InputGroup>
      <div className="text-xs text-slate-500 mt-2">
        状态变更配置需要通过JSON编辑（高级功能）
      </div>
    </div>
  );
};

/**
 * 等待节点属性面板
 */
const WaitNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [waitType, setWaitType] = useState(config.waitType || 'USER_INPUT');
  const [waitCondition, setWaitCondition] = useState(config.waitCondition || '');
  const [nextNodeId, setNextNodeId] = useState(config.nextNodeId || '');

  useEffect(() => {
    onUpdate({
      waitType,
      waitCondition: waitCondition || undefined,
      nextNodeId,
    });
  }, [waitType, waitCondition, nextNodeId, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="等待类型">
        <select
          value={waitType}
          onChange={(e) => setWaitType(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="USER_INPUT">等待用户输入</option>
          <option value="USER_CLICK">等待用户点击</option>
          <option value="USER_CHOICE">等待用户选择</option>
          <option value="EVENT">等待事件触发</option>
          <option value="TIMER">等待指定时间</option>
          <option value="CONDITION">等待条件满足</option>
        </select>
      </InputGroup>
      <InputGroup label="等待条件">
        <TextInput
          value={waitCondition}
          onChange={(e) => setWaitCondition(e.target.value)}
          placeholder="等待条件标识（可选）"
        />
      </InputGroup>
      <InputGroup label="下一个节点ID">
        <TextInput
          value={nextNodeId}
          onChange={(e) => setNextNodeId(e.target.value)}
          placeholder="等待完成后的下一个节点ID"
        />
      </InputGroup>
    </div>
  );
};

/**
 * 结束节点属性面板
 */
const EndNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ config, onUpdate }) => {
  const [result, setResult] = useState(config.result || '');
  const [type, setType] = useState(config.type || 'neutral');

  useEffect(() => {
    onUpdate({ result, type });
  }, [result, type, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="结果/消息">
        <TextArea
          value={result}
          onChange={(e) => setResult(e.target.value)}
          placeholder="流程结束时的结果或消息"
          rows={3}
        />
      </InputGroup>
      <InputGroup label="结局类型">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="success">成功</option>
          <option value="failure">失败</option>
          <option value="neutral">中性</option>
        </select>
      </InputGroup>
    </div>
  );
};

/**
 * 通用节点属性面板（JSON编辑）
 */
const GenericNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void }> = ({ node, config, onUpdate }) => {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(config, null, 2));

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      onUpdate(parsed);
    } catch (e) {
      // JSON解析错误，忽略
    }
  };

  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value={node.data.nodeType} disabled />
      </InputGroup>
      <InputGroup label="节点配置（JSON）">
        <TextArea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          rows={15}
          className="font-mono text-xs"
        />
      </InputGroup>
    </div>
  );
};

/**
 * 场景节点属性面板
 */
const EraNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void; adminToken?: string | null }> = ({ node, config, onUpdate, adminToken }) => {
  const [action, setAction] = useState(config.action || 'SET_CURRENT');

  useEffect(() => {
    onUpdate({ action });
  }, [action, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value="era" disabled />
      </InputGroup>
      <InputGroup label="场景">
        <EntitySelector
          entityType="era"
          value={config.eraId}
          adminToken={adminToken}
          onChange={(eraId, entity) => {
            onUpdate({
              eraId: eraId ? Number(eraId) : undefined,
              eraName: entity?.name,
            });
          }}
        />
      </InputGroup>
      <InputGroup label="操作类型">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="SET_CURRENT">设置当前场景</option>
          <option value="TRIGGER_EVENT">触发场景事件</option>
          <option value="UPDATE_STATE">更新场景状态</option>
        </select>
      </InputGroup>
      {action === 'TRIGGER_EVENT' && (
        <InputGroup label="事件ID">
          <TextInput
            value={config.eventId || ''}
            onChange={(e) => onUpdate({ eventId: e.target.value })}
            placeholder="输入事件ID"
          />
        </InputGroup>
      )}
    </div>
  );
};

/**
 * 角色节点属性面板
 */
const CharacterNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void; adminToken?: string | null }> = ({ node, config, onUpdate, adminToken }) => {
  const [action, setAction] = useState(config.action || 'SET_CURRENT');

  useEffect(() => {
    onUpdate({ action });
  }, [action, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value="character" disabled />
      </InputGroup>
      <InputGroup label="角色">
        <EntitySelector
          entityType="character"
          value={config.characterId}
          adminToken={adminToken}
          onChange={(characterId, entity) => {
            onUpdate({
              characterId: characterId ? Number(characterId) : undefined,
              characterName: entity?.name,
            });
          }}
        />
      </InputGroup>
      <InputGroup label="操作类型">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="SET_CURRENT">设置当前角色</option>
          <option value="UPDATE_ATTRIBUTES">更新角色属性</option>
          <option value="TRIGGER_EVENT">触发角色事件</option>
          <option value="UPDATE_RELATION">更新角色关系</option>
        </select>
      </InputGroup>
    </div>
  );
};

/**
 * 事件节点属性面板
 */
const EventNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void; adminToken?: string | null }> = ({ node, config, onUpdate, adminToken }) => {
  const [action, setAction] = useState(config.action || 'TRIGGER');

  useEffect(() => {
    onUpdate({ action });
  }, [action, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value="event" disabled />
      </InputGroup>
      <InputGroup label="事件">
        <EntitySelector
          entityType="event"
          value={config.eventId}
          adminToken={adminToken}
          onChange={(eventId, entity) => {
            onUpdate({
              eventId: eventId ? String(eventId) : undefined,
              eventName: entity?.name,
            });
          }}
        />
      </InputGroup>
      <InputGroup label="操作类型">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="TRIGGER">触发事件</option>
          <option value="CHECK_CONDITION">检查触发条件</option>
          <option value="EXECUTE">执行事件逻辑</option>
        </select>
      </InputGroup>
    </div>
  );
};

/**
 * 物品节点属性面板
 */
const ItemNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void; adminToken?: string | null }> = ({ node, config, onUpdate, adminToken }) => {
  const [action, setAction] = useState(config.action || 'ADD');
  const [quantity, setQuantity] = useState(config.quantity || 1);

  useEffect(() => {
    onUpdate({ action, quantity });
  }, [action, quantity, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value="item" disabled />
      </InputGroup>
      <InputGroup label="物品">
        <EntitySelector
          entityType="item"
          value={config.itemId}
          adminToken={adminToken}
          onChange={(itemId, entity) => {
            onUpdate({
              itemId: itemId ? String(itemId) : undefined,
              itemName: entity?.name,
            });
          }}
        />
      </InputGroup>
      <InputGroup label="操作类型">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="ADD">添加物品</option>
          <option value="REMOVE">移除物品</option>
          <option value="USE">使用物品</option>
          <option value="CHECK">检查物品拥有情况</option>
        </select>
      </InputGroup>
      {(action === 'ADD' || action === 'REMOVE') && (
        <InputGroup label="数量">
          <TextInput
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min={1}
          />
        </InputGroup>
      )}
    </div>
  );
};

/**
 * 实体关联节点属性面板
 */
const EntityRelationNodePanel: React.FC<{ node: Node; config: any; onUpdate: (updates: any) => void; adminToken?: string | null }> = ({ node, config, onUpdate, adminToken }) => {
  const [relationType, setRelationType] = useState(config.relationType || 'FRIEND');
  const [action, setAction] = useState(config.action || 'CREATE');
  const [strength, setStrength] = useState(config.strength || 50);

  useEffect(() => {
    onUpdate({ relationType, action, strength });
  }, [relationType, action, strength, onUpdate]);

  return (
    <div className="space-y-4">
      <InputGroup label="节点ID">
        <TextInput value={node.data.nodeId} disabled />
      </InputGroup>
      <InputGroup label="节点类型">
        <TextInput value="entity_relation" disabled />
      </InputGroup>
      <InputGroup label="源实体类型">
        <select
          value={config.sourceEntityType || 'character'}
          onChange={(e) => onUpdate({ sourceEntityType: e.target.value })}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="era">场景</option>
          <option value="character">角色</option>
          <option value="event">事件</option>
          <option value="item">物品</option>
        </select>
      </InputGroup>
      <InputGroup label="源实体ID">
        <TextInput
          value={config.sourceEntityId || ''}
          onChange={(e) => onUpdate({ sourceEntityId: e.target.value })}
          placeholder="输入源实体ID"
        />
      </InputGroup>
      <InputGroup label="目标实体类型">
        <select
          value={config.targetEntityType || 'character'}
          onChange={(e) => onUpdate({ targetEntityType: e.target.value })}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="era">场景</option>
          <option value="character">角色</option>
          <option value="event">事件</option>
          <option value="item">物品</option>
        </select>
      </InputGroup>
      <InputGroup label="目标实体ID">
        <TextInput
          value={config.targetEntityId || ''}
          onChange={(e) => onUpdate({ targetEntityId: e.target.value })}
          placeholder="输入目标实体ID"
        />
      </InputGroup>
      <InputGroup label="关系类型">
        <select
          value={relationType}
          onChange={(e) => setRelationType(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="FRIEND">朋友</option>
          <option value="ENEMY">敌人</option>
          <option value="ALLY">盟友</option>
          <option value="MENTOR">导师</option>
          <option value="STUDENT">学生</option>
          <option value="LOVER">恋人</option>
          <option value="RIVAL">对手</option>
          <option value="PARTNER">伙伴</option>
          <option value="BELONGS_TO">属于</option>
          <option value="OWNS">拥有</option>
          <option value="TRIGGERS">触发</option>
          <option value="LOCATED_IN">位于</option>
          <option value="CUSTOM">自定义</option>
        </select>
      </InputGroup>
      <InputGroup label="操作类型">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
        >
          <option value="CREATE">创建关系</option>
          <option value="UPDATE">更新关系</option>
          <option value="CHECK">检查关系</option>
          <option value="DELETE">删除关系</option>
          <option value="INCREASE">增加关系强度</option>
          <option value="DECREASE">减少关系强度</option>
        </select>
      </InputGroup>
      <InputGroup label="关系强度">
        <TextInput
          type="number"
          value={strength}
          onChange={(e) => setStrength(Number(e.target.value))}
          min={0}
          max={100}
        />
      </InputGroup>
    </div>
  );
};
