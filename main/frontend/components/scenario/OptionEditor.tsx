/**
 * 选项编辑器组件
 * 用于编辑剧本节点的选项（分支选择）
 */

import React from 'react';
import { StoryOption, StoryNode, Character } from '../../types';
import { OptionEffectEditor } from './OptionEffectEditor';
import { OptionConditionEditor } from './OptionConditionEditor';

interface OptionEditorProps {
  option: StoryOption;
  optionIndex: number;
  nodes: Record<string, StoryNode>;
  availableCharacters: Character[];
  usedEventIds: string[];
  usedItemIds: string[];
  expandedSections: Record<string, boolean>;
  onUpdateOption: (field: keyof StoryOption, value: any) => void;
  onDeleteOption: () => void;
  onAddEffect: () => void;
  onUpdateEffect: (effectIdx: number, field: keyof import('../../types').StoryOptionEffect, value: any) => void;
  onDeleteEffect: (effectIdx: number) => void;
  onAddCondition: () => void;
  onUpdateCondition: (conditionIdx: number, field: keyof import('../../types').StoryOptionCondition, value: any) => void;
  onDeleteCondition: (conditionIdx: number) => void;
  onToggleSection: (key: string) => void;
  onCreateEvent?: () => void;
  onCreateItem?: () => void;
}

export const OptionEditor: React.FC<OptionEditorProps> = ({
  option,
  optionIndex,
  nodes,
  availableCharacters,
  usedEventIds,
  usedItemIds,
  expandedSections,
  onUpdateOption,
  onDeleteOption,
  onAddEffect,
  onUpdateEffect,
  onDeleteEffect,
  onAddCondition,
  onUpdateCondition,
  onDeleteCondition,
  onToggleSection,
  onCreateEvent,
  onCreateItem,
}) => {
  const effectsKey = `option_${optionIndex}_effects`;
  const conditionsKey = `option_${optionIndex}_conditions`;

  return (
    <div 
      className="p-4 rounded-xl border flex gap-4 items-start"
      style={{
        backgroundColor: 'var(--bg-secondary, #1f2937)',
        borderColor: 'var(--bg-overlay, #374151)',
      }}
    >
      <div className="flex-1 space-y-2">
        <div>
          <label 
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            按钮文本
          </label>
          <input
            value={option.text}
            onChange={(e) => onUpdateOption('text', e.target.value)}
            className="w-full rounded px-2 py-1 border text-sm"
            style={{
              backgroundColor: 'var(--bg-overlay, #111827)',
              borderColor: 'var(--bg-overlay, #374151)',
              color: 'var(--text-primary)',
            }}
            placeholder="例如：询问她考试的事"
          />
        </div>
        <div>
          <label 
            className="text-xs"
            style={{ color: 'var(--text-disabled)' }}
          >
            跳转至节点
          </label>
          <select
            value={option.nextNodeId || ''}
            onChange={(e) => onUpdateOption('nextNodeId', e.target.value)}
            className="w-full rounded px-2 py-1 border text-sm outline-none"
            style={{
              backgroundColor: 'var(--bg-overlay, #111827)',
              borderColor: 'var(--bg-overlay, #374151)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-success, #22c55e)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
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
                      backgroundColor: 'var(--bg-overlay, #111827)',
                      color: 'var(--text-primary)',
                      padding: '8px'
                    }}
                  >
                    {nodeTitle}
                  </option>
                );
              })
            ) : (
              <option 
                value=""
                style={{ 
                  color: 'var(--text-primary)', 
                  backgroundColor: 'var(--bg-overlay, #111827)' 
                }}
              >
                暂无节点
              </option>
            )}
          </select>
          {/* 调试信息：显示当前选中的值和节点数量 */}
          {process.env.NODE_ENV === 'development' && (
            <div 
              className="text-xs mt-1"
              style={{ color: 'var(--text-disabled)' }}
            >
              选中: {option.nextNodeId}, 节点数: {Object.values(nodes).length}
            </div>
          )}
        </div>

        {/* 状态影响编辑 - 使用折叠面板 */}
        <div 
          className="mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--bg-overlay, #374151)' }}
        >
          <div
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => onToggleSection(effectsKey)}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-warning, #eab308)' }}>⚡</span>
              <label 
                className="text-xs font-bold"
                style={{ color: 'var(--color-warning, #eab308)' }}
              >
                状态影响
              </label>
              {option.effects && option.effects.length > 0 && (
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  ({option.effects.length} 项)
                </span>
              )}
            </div>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              {expandedSections[effectsKey] ? '▼' : '▶'}
            </span>
          </div>
          {expandedSections[effectsKey] && (
            <div className="ml-4 space-y-2">
              {(!option.effects || option.effects.length === 0) ? (
                <div 
                  className="p-2 rounded text-xs italic"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.3))',
                    color: 'var(--text-disabled)',
                  }}
                >
                  💡 未设置状态影响，选择此选项不会改变任何状态（可选功能）
                </div>
              ) : (
                <div className="space-y-2">
                  {option.effects.map((effect, effectIdx) => (
                    <OptionEffectEditor
                      key={effectIdx}
                      effects={option.effects || []}
                      effectIndex={effectIdx}
                      availableCharacters={availableCharacters}
                      usedEventIds={usedEventIds}
                      usedItemIds={usedItemIds}
                      onUpdateEffect={onUpdateEffect}
                      onDeleteEffect={onDeleteEffect}
                      onCreateEvent={onCreateEvent}
                      onCreateItem={onCreateItem}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={onAddEffect}
                className="text-xs px-3 py-1.5 rounded border w-full transition-colors"
                style={{
                  backgroundColor: 'var(--color-warning, rgba(234, 179, 8, 0.3))',
                  color: 'var(--color-warning, #fcd34d)',
                  borderColor: 'var(--color-warning, rgba(234, 179, 8, 0.3))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-warning, rgba(234, 179, 8, 0.5))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-warning, rgba(234, 179, 8, 0.3))';
                }}
              >
                + 添加状态影响
              </button>
              {option.effects && option.effects.length > 0 && (
                <div 
                  className="p-2 rounded text-[10px] italic"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.3))',
                    color: 'var(--text-disabled)',
                  }}
                >
                  💡 提示：选择此选项时会触发这些状态变化，用于追踪玩家进度和影响后续剧情
                </div>
              )}
            </div>
          )}
        </div>

        {/* 条件编辑 - 使用折叠面板 */}
        <div 
          className="mt-3 pt-3 border-t"
          style={{ borderColor: 'var(--bg-overlay, #374151)' }}
        >
          <div
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => onToggleSection(conditionsKey)}
          >
            <div className="flex items-center gap-2">
              <span style={{ color: 'var(--color-info, #60a5fa)' }}>🔒</span>
              <label 
                className="text-xs font-bold"
                style={{ color: 'var(--color-info, #60a5fa)' }}
              >
                显示条件
              </label>
              {option.conditions && option.conditions.length > 0 && (
                <span 
                  className="text-xs"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  ({option.conditions.length} 条)
                </span>
              )}
            </div>
            <span 
              className="text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              {expandedSections[conditionsKey] ? '▼' : '▶'}
            </span>
          </div>
          {expandedSections[conditionsKey] && (
            <div className="ml-4 space-y-2">
              {(!option.conditions || option.conditions.length === 0) ? (
                <div 
                  className="p-2 rounded text-xs italic"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.3))',
                    color: 'var(--text-disabled)',
                  }}
                >
                  💡 未设置条件时，此选项默认会显示
                </div>
              ) : (
                <div className="space-y-2">
                  {option.conditions.map((condition, conditionIdx) => (
                    <OptionConditionEditor
                      key={conditionIdx}
                      conditions={option.conditions || []}
                      conditionIndex={conditionIdx}
                      availableCharacters={availableCharacters}
                      usedEventIds={usedEventIds}
                      usedItemIds={usedItemIds}
                      onUpdateCondition={onUpdateCondition}
                      onDeleteCondition={onDeleteCondition}
                      onCreateEvent={onCreateEvent}
                      onCreateItem={onCreateItem}
                    />
                  ))}
                </div>
              )}
              <button
                onClick={onAddCondition}
                className="text-xs px-3 py-1.5 rounded border w-full transition-colors"
                style={{
                  backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.3))',
                  color: 'var(--color-info, #93c5fd)',
                  borderColor: 'var(--color-info, rgba(59, 130, 246, 0.3))',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(59, 130, 246, 0.5))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info, rgba(59, 130, 246, 0.3))';
                }}
              >
                + 添加条件
              </button>
              {option.conditions && option.conditions.length > 0 && (
                <p 
                  className="text-[10px] italic p-2 rounded"
                  style={{
                    backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.3))',
                    color: 'var(--text-disabled)',
                  }}
                >
                  💡 提示：所有条件都必须满足（AND逻辑），此选项才会显示
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <button
        onClick={onDeleteOption}
        className="mt-6 transition-colors"
        style={{ color: 'var(--text-disabled)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-error, #ef4444)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-disabled)';
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};
