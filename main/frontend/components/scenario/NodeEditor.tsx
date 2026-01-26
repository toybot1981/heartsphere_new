/**
 * 节点编辑器组件
 * 用于编辑剧本节点的所有属性
 * 
 * 包含功能：
 * - 节点标题和类型选择
 * - 节点提示词编辑
 * - 高级功能（多角色对话、随机事件、时间系统）
 */

import React from 'react';
import { StoryNode, Character } from '../../types';

interface NodeEditorProps {
  node: StoryNode;
  nodeIndex: number;
  nodes: Record<string, StoryNode>;
  availableCharacters: Character[];
  usedEventIds: string[];
  usedItemIds: string[];
  expandedSections: Record<string, boolean>;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
  onToggleSection: (section: string) => void;
  onCreateEvent?: (context?: { nodeId?: string; randomEventIdx?: number }) => void;
  onCreateItem?: (context?: { nodeId?: string; randomEventIdx?: number }) => void;
}

/**
 * 节点编辑器主组件
 */
export const NodeEditor: React.FC<NodeEditorProps> = ({
  node,
  nodeIndex,
  nodes,
  availableCharacters,
  usedEventIds,
  usedItemIds,
  expandedSections,
  onUpdateNode,
  onToggleSection,
  onCreateEvent,
  onCreateItem,
}) => {
  return (
    <div className="space-y-6">
      {/* 节点标题和类型 */}
      <NodeBasicInfo
        node={node}
        nodeIndex={nodeIndex}
        onUpdateNode={onUpdateNode}
      />

      {/* 节点提示词编辑 */}
      <NodePromptEditor
        node={node}
        onUpdateNode={onUpdateNode}
      />

      {/* 高级功能折叠面板 */}
      <NodeAdvancedFeatures
        node={node}
        nodes={nodes}
        availableCharacters={availableCharacters}
        usedEventIds={usedEventIds}
        usedItemIds={usedItemIds}
        expandedSections={expandedSections}
        onUpdateNode={onUpdateNode}
        onToggleSection={onToggleSection}
        onCreateEvent={onCreateEvent}
        onCreateItem={onCreateItem}
      />
    </div>
  );
};

/**
 * 节点基本信息编辑器（标题和类型）
 */
interface NodeBasicInfoProps {
  node: StoryNode;
  nodeIndex: number;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
}

const NodeBasicInfo: React.FC<NodeBasicInfoProps> = ({ node, nodeIndex, onUpdateNode }) => {
  return (
    <>
      {/* 节点标题编辑 */}
      <div className="flex items-center gap-4">
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg"
          style={{
            backgroundColor: 'var(--color-primary, #ec4899)',
            color: 'var(--text-primary)',
          }}
        >
          {nodeIndex + 1}
        </div>
        <div className="flex-1">
          <label 
            className="block text-xs mb-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            节点标题 (内部标识)
          </label>
          <input
            value={node.title}
            onChange={(e) => onUpdateNode('title', e.target.value)}
            className="w-full rounded px-3 py-2 border outline-none font-bold text-lg"
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

      {/* 节点类型选择 */}
      <div 
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.3))',
          borderColor: 'var(--bg-overlay, #374151)',
        }}
      >
        <label 
          className="block text-sm font-bold mb-3"
          style={{ color: 'var(--color-primary, #a855f7)' }}
        >
          节点类型
        </label>
        <div className="grid grid-cols-3 gap-3 mb-3">
          <label
            className="flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all"
            style={{
              borderColor: (node.nodeType || 'fixed') === 'fixed' 
                ? 'var(--color-primary, #a855f7)' 
                : 'var(--bg-overlay, #374151)',
              backgroundColor: (node.nodeType || 'fixed') === 'fixed' 
                ? 'var(--color-primary, rgba(168, 85, 247, 0.2))' 
                : 'transparent'
            }}
            onMouseEnter={(e) => {
              if ((node.nodeType || 'fixed') !== 'fixed') {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(55, 65, 81, 0.3))';
              }
            }}
            onMouseLeave={(e) => {
              if ((node.nodeType || 'fixed') !== 'fixed') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <input
              type="radio"
              name="nodeType"
              value="fixed"
              checked={(node.nodeType || 'fixed') === 'fixed'}
              onChange={() => onUpdateNode('nodeType', 'fixed')}
              className="w-4 h-4 mb-2"
              style={{
                accentColor: 'var(--color-primary, #a855f7)',
              }}
            />
            <span className="text-lg mb-1">📝</span>
            <span 
              className="text-sm font-semibold text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              固定内容
            </span>
            <span 
              className="text-[10px] text-center mt-1"
              style={{ color: 'var(--text-disabled)' }}
            >
              直接显示预设内容
            </span>
          </label>
          <label
            className="flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all"
            onMouseEnter={(e) => {
              if (node.nodeType !== 'ai-dynamic') {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(55, 65, 81, 0.3))';
              }
            }}
            onMouseLeave={(e) => {
              if (node.nodeType !== 'ai-dynamic') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            style={{
              borderColor: node.nodeType === 'ai-dynamic' ? '#a855f7' : '#374151',
              backgroundColor: node.nodeType === 'ai-dynamic' ? '#a855f7' + '20' : 'transparent'
            }}
          >
            <input
              type="radio"
              name="nodeType"
              value="ai-dynamic"
              checked={node.nodeType === 'ai-dynamic'}
              onChange={() => onUpdateNode('nodeType', 'ai-dynamic')}
              className="w-4 h-4 mb-2"
              style={{
                accentColor: 'var(--color-primary, #a855f7)',
              }}
            />
            <span className="text-lg mb-1">✨</span>
            <span 
              className="text-sm font-semibold text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              AI动态生成
            </span>
            <span 
              className="text-[10px] text-center mt-1"
              style={{ color: 'var(--text-disabled)' }}
            >
              AI根据提示词生成
            </span>
          </label>
          <label
            className="flex flex-col items-center p-3 rounded-lg border-2 cursor-pointer transition-all"
            onMouseEnter={(e) => {
              if (node.nodeType !== 'ai-dynamic') {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(55, 65, 81, 0.3))';
              }
            }}
            onMouseLeave={(e) => {
              if (node.nodeType !== 'ai-dynamic') {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            style={{
              borderColor: node.nodeType === 'ending' ? '#a855f7' : '#374151',
              backgroundColor: node.nodeType === 'ending' ? '#a855f7' + '20' : 'transparent'
            }}
          >
            <input
              type="radio"
              name="nodeType"
              value="ending"
              checked={node.nodeType === 'ending'}
              onChange={() => onUpdateNode('nodeType', 'ending')}
              className="w-4 h-4 mb-2"
              style={{
                accentColor: 'var(--color-primary, #a855f7)',
              }}
            />
            <span className="text-lg mb-1">🎯</span>
            <span 
              className="text-sm font-semibold text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              结局节点
            </span>
            <span 
              className="text-[10px] text-center mt-1"
              style={{ color: 'var(--text-disabled)' }}
            >
              剧本的结局
            </span>
          </label>
        </div>
        <div 
          className="p-2 rounded text-xs"
          style={{
            backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
            color: 'var(--text-tertiary)',
          }}
        >
          {(node.nodeType || 'fixed') === 'ai-dynamic'
            ? '💡 AI会根据提示词动态生成对话内容，每次体验略有不同，增强表现力'
            : (node.nodeType === 'ending')
            ? '💡 结局节点会在内容前显示【结局】标记，通常没有后续选项，作为剧本的终点'
            : '💡 固定内容模式直接使用预设的提示词内容，保持每次体验的一致性'}
        </div>
      </div>
    </>
  );
};

/**
 * 节点提示词编辑器
 */
interface NodePromptEditorProps {
  node: StoryNode;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
}

const NodePromptEditor: React.FC<NodePromptEditorProps> = ({ node, onUpdateNode }) => {
  return (
    <div>
      <label 
        className="block text-sm font-bold mb-2"
        style={{ color: 'var(--color-info, #818cf8)' }}
      >
        AI 旁白提示词 (Prompt)
      </label>
      <p 
        className="text-xs mb-2"
        style={{ color: 'var(--text-disabled)' }}
      >
        {(node.nodeType || 'fixed') === 'ai-dynamic'
          ? '描述这一幕会发生什么。AI 将根据此场景描述生成符合角色性格的对话和旁白。'
          : '描述这一幕会发生什么。AI 将根据此生成对话和旁白。'}
      </p>
      <textarea
        value={node.prompt}
        onChange={(e) => onUpdateNode('prompt', e.target.value)}
        className="w-full rounded-xl p-4 border outline-none h-40 resize-none leading-relaxed"
        style={{
          backgroundColor: 'var(--bg-secondary, #1f2937)',
          borderColor: 'var(--bg-overlay, #374151)',
          color: 'var(--text-primary)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-info, #818cf8)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
        }}
        placeholder="例如：用户在咖啡馆遇到了樱。她正在喝拿铁，看起来对考试很担心……"
      />
    </div>
  );
};

/**
 * 节点高级功能编辑器
 */
interface NodeAdvancedFeaturesProps {
  node: StoryNode;
  nodes: Record<string, StoryNode>;
  availableCharacters: Character[];
  usedEventIds: string[];
  usedItemIds: string[];
  expandedSections: Record<string, boolean>;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
  onToggleSection: (section: string) => void;
  onCreateEvent?: (context?: { nodeId?: string; randomEventIdx?: number }) => void;
  onCreateItem?: (context?: { nodeId?: string; randomEventIdx?: number }) => void;
}

const NodeAdvancedFeatures: React.FC<NodeAdvancedFeaturesProps> = ({
  node,
  nodes,
  availableCharacters,
  usedEventIds,
  usedItemIds,
  expandedSections,
  onUpdateNode,
  onToggleSection,
  onCreateEvent,
  onCreateItem,
}) => {
  return (
    <div 
      className="border-t pt-6"
      style={{ borderColor: 'var(--bg-overlay, #374151)' }}
    >
      {/* 高级功能折叠面板标题 */}
      <div
        className="flex items-center justify-between cursor-pointer mb-4"
        onClick={() => onToggleSection('advancedFeatures')}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">⚙️</span>
          <label 
            className="text-sm font-bold"
            style={{ color: 'var(--text-secondary)' }}
          >
            高级功能（可选）
          </label>
        </div>
        <span 
          className="text-sm"
          style={{ color: 'var(--text-disabled)' }}
        >
          {expandedSections.advancedFeatures ? '▼' : '▶'}
        </span>
      </div>

      {expandedSections.advancedFeatures && (
        <div 
          className="space-y-4 pl-6 border-l-2"
          style={{ borderColor: 'var(--bg-overlay, #374151)' }}
        >
          {/* 多角色对话编辑器 */}
          <MultiCharacterDialogueEditor
            node={node}
            availableCharacters={availableCharacters}
            expandedSections={expandedSections}
            onUpdateNode={onUpdateNode}
            onToggleSection={onToggleSection}
          />

          {/* 随机事件编辑器 */}
          <RandomEventsEditor
            node={node}
            nodes={nodes}
            availableCharacters={availableCharacters}
            usedEventIds={usedEventIds}
            usedItemIds={usedItemIds}
            expandedSections={expandedSections}
            onUpdateNode={onUpdateNode}
            onToggleSection={onToggleSection}
            onCreateEvent={onCreateEvent}
            onCreateItem={onCreateItem}
          />

          {/* 时间系统编辑器 */}
          <TimeSystemEditor
            node={node}
            nodes={nodes}
            expandedSections={expandedSections}
            onUpdateNode={onUpdateNode}
            onToggleSection={onToggleSection}
          />
        </div>
      )}
    </div>
  );
};

/**
 * 多角色对话编辑器
 */
interface MultiCharacterDialogueEditorProps {
  node: StoryNode;
  availableCharacters: Character[];
  expandedSections: Record<string, boolean>;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
  onToggleSection: (section: string) => void;
}

const MultiCharacterDialogueEditor: React.FC<MultiCharacterDialogueEditorProps> = ({
  node,
  availableCharacters,
  expandedSections,
  onUpdateNode,
  onToggleSection,
}) => {
  const dialogues = node.multiCharacterDialogue || [];

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => onToggleSection('multiCharacter')}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-info, #22d3ee)' }}>💬</span>
          <label 
            className="text-sm font-semibold"
            style={{ color: 'var(--color-info, #22d3ee)' }}
          >
            多角色对话
          </label>
          <span 
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            ({dialogues.length} 条)
          </span>
        </div>
        <span 
          className="text-xs"
          style={{ color: 'var(--text-disabled)' }}
        >
          {expandedSections.multiCharacter ? '▼' : '▶'}
        </span>
      </div>
      {expandedSections.multiCharacter && (
        <div className="ml-6 space-y-3">
          <p 
            className="text-xs italic"
            style={{ color: 'var(--text-tertiary)' }}
          >
            💡 让多个角色在此节点依次发言，营造多人对话场景
          </p>
          <div className="space-y-2 mb-2">
            {dialogues.map((dialogue, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.5))',
                  borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 0.5))',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    第 {idx + 1} 条对话
                  </span>
                  <button
                    onClick={() => {
                      const newDialogue = [...dialogues];
                      newDialogue.splice(idx, 1);
                      onUpdateNode('multiCharacterDialogue', newDialogue);
                    }}
                    className="ml-auto text-xs px-2 transition-colors"
                    style={{ color: 'var(--text-disabled)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-error, #ef4444)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-disabled)';
                    }}
                  >
                    删除
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      角色
                    </label>
                    <select
                      value={dialogue.characterId}
                      onChange={(e) => {
                        const newDialogue = [...dialogues];
                        newDialogue[idx] = { ...newDialogue[idx], characterId: e.target.value };
                        onUpdateNode('multiCharacterDialogue', newDialogue);
                      }}
                      className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-overlay, #111827)',
                        borderColor: 'var(--bg-overlay, #374151)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                      }}
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
                      <p 
                        className="text-[10px] mt-1"
                        style={{ color: 'var(--color-warning, #eab308)' }}
                      >
                        ⚠️ 此角色ID不在可选列表中
                      </p>
                    )}
                  </div>
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      显示顺序
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={dialogue.order || idx + 1}
                      onChange={(e) => {
                        const newDialogue = [...dialogues];
                        newDialogue[idx] = { ...newDialogue[idx], order: parseInt(e.target.value) || idx + 1 };
                        onUpdateNode('multiCharacterDialogue', newDialogue);
                      }}
                      className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-overlay, #111827)',
                        borderColor: 'var(--bg-overlay, #374151)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label 
                    className="text-xs block mb-1"
                    style={{ color: 'var(--text-disabled)' }}
                  >
                    对话内容
                  </label>
                  <textarea
                    value={dialogue.content}
                    onChange={(e) => {
                      const newDialogue = [...dialogues];
                      newDialogue[idx] = { ...newDialogue[idx], content: e.target.value };
                      onUpdateNode('multiCharacterDialogue', newDialogue);
                    }}
                    placeholder="例如：你好，很高兴见到你！"
                    className="w-full text-xs rounded px-2 py-1.5 border outline-none resize-none"
                    style={{
                      backgroundColor: 'var(--bg-overlay, #111827)',
                      borderColor: 'var(--bg-overlay, #374151)',
                      color: 'var(--text-primary)',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-info, #06b6d4)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                    }}
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const newDialogue = [...dialogues, { characterId: '', content: '', order: dialogues.length + 1 }];
              onUpdateNode('multiCharacterDialogue', newDialogue);
            }}
            className="text-xs px-3 py-1.5 rounded border transition-colors"
            style={{
              backgroundColor: 'var(--color-info, rgba(6, 182, 212, 0.3))',
              color: 'var(--color-info, #22d3ee)',
              borderColor: 'var(--color-info, rgba(6, 182, 212, 0.3))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(6, 182, 212, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(6, 182, 212, 0.3))';
            }}
          >
            + 添加一条对话
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 随机事件编辑器
 */
interface RandomEventsEditorProps {
  node: StoryNode;
  nodes: Record<string, StoryNode>;
  availableCharacters: Character[];
  usedEventIds: string[];
  usedItemIds: string[];
  expandedSections: Record<string, boolean>;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
  onToggleSection: (section: string) => void;
  onCreateEvent?: (context?: { nodeId?: string; randomEventIdx?: number }) => void;
  onCreateItem?: (context?: { nodeId?: string; randomEventIdx?: number }) => void;
}

const RandomEventsEditor: React.FC<RandomEventsEditorProps> = ({
  node,
  nodes,
  availableCharacters,
  usedEventIds,
  usedItemIds,
  expandedSections,
  onUpdateNode,
  onToggleSection,
  onCreateEvent,
  onCreateItem,
}) => {
  const randomEvents = node.randomEvents || [];

  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => onToggleSection('randomEvents')}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-primary, #ec4899)' }}>🎲</span>
          <label 
            className="text-sm font-semibold"
            style={{ color: 'var(--color-primary, #ec4899)' }}
          >
            随机事件
          </label>
          <span 
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            ({randomEvents.length} 个)
          </span>
        </div>
        <span 
          className="text-xs"
          style={{ color: 'var(--text-disabled)' }}
        >
          {expandedSections.randomEvents ? '▼' : '▶'}
        </span>
      </div>
      {expandedSections.randomEvents && (
        <div className="ml-6 space-y-3">
          <p 
            className="text-xs italic"
            style={{ color: 'var(--text-tertiary)' }}
          >
            💡 进入节点时随机触发的事件，增加不确定性（概率：0-1，0.5表示50%概率）
          </p>
          <div className="space-y-2 mb-2">
            {randomEvents.map((event, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(31, 41, 55, 0.5))',
                  borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 0.5))',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span 
                    className="text-xs"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    随机事件 #{idx + 1}
                  </span>
                  <button
                    onClick={() => {
                      const newEvents = [...randomEvents];
                      newEvents.splice(idx, 1);
                      onUpdateNode('randomEvents', newEvents);
                    }}
                    className="text-xs px-2 transition-colors"
                    style={{ color: 'var(--text-disabled)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-error, #ef4444)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-disabled)';
                    }}
                  >
                    删除
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      事件ID
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        list={`randomevent-${idx}-id`}
                        value={event.id}
                        onChange={(e) => {
                          const newEvents = [...randomEvents];
                          newEvents[idx] = { ...newEvents[idx], id: e.target.value };
                          onUpdateNode('randomEvents', newEvents);
                        }}
                        placeholder="选择已有或输入新的事件ID"
                        className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
                        style={{
                          backgroundColor: 'var(--bg-overlay, #111827)',
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
                      {onCreateEvent && (
                        <button
                          type="button"
                          onClick={() => onCreateEvent({ nodeId: node.id, randomEventIdx: idx })}
                          className="px-2 py-1.5 rounded text-xs font-bold transition-colors"
                          style={{
                            backgroundColor: 'var(--color-primary, #db2777)',
                            color: 'var(--text-primary)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #be185d)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
                          }}
                          title="创建新事件"
                        >
                          +
                        </button>
                      )}
                    </div>
                    <datalist id={`randomevent-${idx}-id`}>
                      {usedEventIds.map(id => (
                        <option key={id} value={id} />
                      ))}
                    </datalist>
                    {usedEventIds.length > 0 && (
                      <p 
                        className="text-[10px] mt-0.5"
                        style={{ color: 'var(--text-disabled)' }}
                      >
                        💡 下拉选择已有ID，或直接输入新ID，点击"+"快速创建
                      </p>
                    )}
                  </div>
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      触发概率 (0-1)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={event.probability}
                      onChange={(e) => {
                        const newEvents = [...randomEvents];
                        newEvents[idx] = { ...newEvents[idx], probability: parseFloat(e.target.value) || 0 };
                        onUpdateNode('randomEvents', newEvents);
                      }}
                      placeholder="0.5 = 50%"
                      className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-overlay, #111827)',
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
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      效果类型
                    </label>
                    <select
                      value={event.effect.type}
                      onChange={(e) => {
                        const newEvents = [...randomEvents];
                        newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, type: e.target.value as any } };
                        onUpdateNode('randomEvents', newEvents);
                      }}
                      className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-overlay, #111827)',
                        borderColor: 'var(--bg-overlay, #374151)',
                        color: 'var(--text-primary)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                      }}
                    >
                      <option value="event">触发事件</option>
                      <option value="item">获得物品</option>
                      <option value="favorability">改变好感度</option>
                    </select>
                  </div>
                  <div>
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      {event.effect.type === 'favorability' ? '角色' : event.effect.type === 'event' ? '事件ID' : '物品ID'}
                    </label>
                    {event.effect.type === 'favorability' ? (
                      <select
                        value={event.effect.target}
                        onChange={(e) => {
                          const newEvents = [...randomEvents];
                          newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, target: e.target.value } };
                          onUpdateNode('randomEvents', newEvents);
                        }}
                        className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                        style={{
                          backgroundColor: 'var(--bg-overlay, #111827)',
                          borderColor: 'var(--bg-overlay, #374151)',
                          color: 'var(--text-primary)',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary, #ec4899)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                        }}
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
                        <div className="flex gap-1">
                          <input
                            type="text"
                            list={`randomevent-${idx}-effect-${event.effect.type === 'event' ? 'events' : 'items'}`}
                            value={event.effect.target}
                            onChange={(e) => {
                              const newEvents = [...randomEvents];
                              newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, target: e.target.value } };
                              onUpdateNode('randomEvents', newEvents);
                            }}
                            placeholder={`选择已有或输入新的${event.effect.type === 'event' ? '事件' : '物品'}ID`}
                            className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
                            style={{
                              backgroundColor: 'var(--bg-overlay, #111827)',
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
                          {event.effect.type === 'event' && onCreateEvent && (
                            <button
                              type="button"
                              onClick={() => onCreateEvent({ nodeId: node.id, randomEventIdx: idx })}
                              className="px-2 py-1.5 rounded text-xs font-bold transition-colors"
                              style={{
                                backgroundColor: 'var(--color-primary, #db2777)',
                                color: 'var(--text-primary)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #be185d)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
                              }}
                              title="创建新事件"
                            >
                              +
                            </button>
                          )}
                          {event.effect.type === 'item' && onCreateItem && (
                            <button
                              type="button"
                              onClick={() => onCreateItem({ nodeId: node.id, randomEventIdx: idx })}
                              className="px-2 py-1.5 rounded text-xs font-bold transition-colors"
                              style={{
                                backgroundColor: 'var(--color-primary, #db2777)',
                                color: 'var(--text-primary)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #be185d)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-primary, #db2777)';
                              }}
                              title="创建新物品"
                            >
                              +
                            </button>
                          )}
                        </div>
                        <datalist id={`randomevent-${idx}-effect-${event.effect.type === 'event' ? 'events' : 'items'}`}>
                          {(event.effect.type === 'event' ? usedEventIds : usedItemIds).map(id => (
                            <option key={id} value={id} />
                          ))}
                        </datalist>
                        {(event.effect.type === 'event' ? usedEventIds : usedItemIds).length > 0 && (
                          <p 
                            className="text-[10px] mt-0.5"
                            style={{ color: 'var(--text-disabled)' }}
                          >
                            💡 下拉选择已有ID，或直接输入新ID
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {event.effect.type === 'favorability' && (
                  <div className="mt-2">
                    <label 
                      className="text-xs block mb-1"
                      style={{ color: 'var(--text-disabled)' }}
                    >
                      好感度变化 (±)
                    </label>
                    <input
                      type="number"
                      value={event.effect.value ?? 0}
                      onChange={(e) => {
                        const newEvents = [...randomEvents];
                        newEvents[idx] = { ...newEvents[idx], effect: { ...newEvents[idx].effect, value: parseInt(e.target.value) || 0 } };
                        onUpdateNode('randomEvents', newEvents);
                      }}
                      placeholder="例如：10 或 -5"
                      className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                      style={{
                        backgroundColor: 'var(--bg-overlay, #111827)',
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
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              const newEvents = [...randomEvents, { id: `random_${Date.now()}`, probability: 0.5, effect: { type: 'event' as const, target: '' } }];
              onUpdateNode('randomEvents', newEvents);
            }}
            className="text-xs px-3 py-1.5 rounded border transition-colors"
            style={{
              backgroundColor: 'var(--color-primary, rgba(236, 72, 153, 0.3))',
              color: 'var(--color-primary, #f472b6)',
              borderColor: 'var(--color-primary, rgba(236, 72, 153, 0.3))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.5))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-primary, rgba(236, 72, 153, 0.3))';
            }}
          >
            + 添加随机事件
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * 时间系统编辑器
 */
interface TimeSystemEditorProps {
  node: StoryNode;
  nodes: Record<string, StoryNode>;
  expandedSections: Record<string, boolean>;
  onUpdateNode: (field: keyof StoryNode, value: any) => void;
  onToggleSection: (section: string) => void;
}

const TimeSystemEditor: React.FC<TimeSystemEditorProps> = ({
  node,
  nodes,
  expandedSections,
  onUpdateNode,
  onToggleSection,
}) => {
  return (
    <div>
      <div
        className="flex items-center justify-between cursor-pointer mb-2"
        onClick={() => onToggleSection('timeSystem')}
      >
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--color-warning, #fb923c)' }}>⏱️</span>
          <label 
            className="text-sm font-semibold"
            style={{ color: 'var(--color-warning, #fb923c)' }}
          >
            限时节点
          </label>
          {node.timeLimit && (
            <span 
              className="text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              ({node.timeLimit}秒)
            </span>
          )}
        </div>
        <span 
          className="text-xs"
          style={{ color: 'var(--text-disabled)' }}
        >
          {expandedSections.timeSystem ? '▼' : '▶'}
        </span>
      </div>
      {expandedSections.timeSystem && (
        <div className="ml-6 space-y-3">
          <p 
            className="text-xs italic"
            style={{ color: 'var(--text-tertiary)' }}
          >
            💡 设置时间限制，玩家必须在指定时间内做出选择，否则自动跳转到超时节点
          </p>
          <div className="space-y-3">
            <div>
              <label 
                className="text-xs block mb-1"
                style={{ color: 'var(--text-disabled)' }}
              >
                限时时间（秒）
              </label>
              <input
                type="number"
                min="0"
                value={node.timeLimit || ''}
                onChange={(e) => onUpdateNode('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="例如：30 表示30秒"
                className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                style={{
                  backgroundColor: 'var(--bg-overlay, #111827)',
                  borderColor: 'var(--bg-overlay, #374151)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-warning, #fb923c)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                }}
              />
              <p 
                className="text-[10px] mt-1"
                style={{ color: 'var(--text-disabled)' }}
              >
                留空表示无时间限制
              </p>
            </div>
            {node.timeLimit && (
              <div>
                <label 
                  className="text-xs block mb-1"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  超时后跳转到
                </label>
                <select
                  value={node.timeoutNodeId || ''}
                  onChange={(e) => onUpdateNode('timeoutNodeId', e.target.value || undefined)}
                  className="w-full text-xs rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-overlay, #111827)',
                    borderColor: 'var(--bg-overlay, #374151)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-warning, #fb923c)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                  }}
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
  );
};
