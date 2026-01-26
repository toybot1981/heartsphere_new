/**
 * 选项条件编辑器组件
 * 用于编辑选项的显示条件（好感度、事件、物品、时间）
 */

import React from 'react';
import { StoryOptionCondition, Character } from '../../types';

interface OptionConditionEditorProps {
  conditions: StoryOptionCondition[];
  conditionIndex: number;
  availableCharacters: Character[];
  usedEventIds: string[];
  usedItemIds: string[];
  onUpdateCondition: (conditionIdx: number, field: keyof StoryOptionCondition, value: any) => void;
  onDeleteCondition: (conditionIdx: number) => void;
  onCreateEvent?: () => void;
  onCreateItem?: () => void;
}

export const OptionConditionEditor: React.FC<OptionConditionEditorProps> = ({
  conditions,
  conditionIndex,
  availableCharacters,
  usedEventIds,
  usedItemIds,
  onUpdateCondition,
  onDeleteCondition,
  onCreateEvent,
  onCreateItem,
}) => {
  const condition = conditions[conditionIndex];

  return (
    <div 
      className="p-3 rounded-lg border"
      style={{
        backgroundColor: 'var(--bg-overlay, rgba(17, 24, 39, 0.5))',
        borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 0.5))',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span 
          className="text-xs"
          style={{ color: 'var(--text-tertiary)' }}
        >
          条件 #{conditionIndex + 1}
        </span>
        <button
          onClick={() => onDeleteCondition(conditionIndex)}
          className="text-xs px-2 transition-colors"
          style={{ color: 'var(--text-disabled)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-error, #ef4444)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-disabled)';
          }}
          title="删除条件"
        >
          删除
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label 
            className="text-xs block mb-1"
            style={{ color: 'var(--text-disabled)' }}
          >
            条件类型
          </label>
          <select
            value={condition.type}
            onChange={(e) => onUpdateCondition(conditionIndex, 'type', e.target.value)}
            className="w-full text-xs rounded px-2 py-1.5 border outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary, #1f2937)',
              borderColor: 'var(--bg-overlay, #374151)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-info, #3b82f6)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
            }}
          >
            <option value="favorability">💕 好感度</option>
            <option value="event">📌 事件</option>
            <option value="item">🎁 物品</option>
            <option value="time">⏰ 时间</option>
          </select>
        </div>
        <div>
          <label 
            className="text-xs block mb-1"
            style={{ color: 'var(--text-disabled)' }}
          >
            {condition.type === 'favorability' ? '角色' : condition.type === 'event' ? '事件ID' : condition.type === 'item' ? '物品ID' : '时间ID'}
          </label>
          {condition.type === 'favorability' ? (
            <select
              value={condition.target}
              onChange={(e) => onUpdateCondition(conditionIndex, 'target', e.target.value)}
              className="w-full text-xs rounded px-2 py-1.5 border outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info, #3b82f6)';
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
          ) : condition.type === 'event' || condition.type === 'item' ? (
            <>
              <div className="flex gap-1">
                <input
                  type="text"
                  list={`condition-${conditionIndex}-${condition.type === 'event' ? 'events' : 'items'}`}
                  value={condition.target}
                  onChange={(e) => onUpdateCondition(conditionIndex, 'target', e.target.value)}
                  placeholder={`选择已有或输入新的${condition.type === 'event' ? '事件' : '物品'}ID`}
                  className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary, #1f2937)',
                    borderColor: 'var(--bg-overlay, #374151)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-info, #3b82f6)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                  }}
                />
                {condition.type === 'event' && onCreateEvent && (
                  <button
                    type="button"
                    onClick={onCreateEvent}
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
                {condition.type === 'item' && onCreateItem && (
                  <button
                    type="button"
                    onClick={onCreateItem}
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
              <datalist id={`condition-${conditionIndex}-${condition.type === 'event' ? 'events' : 'items'}`}>
                {(condition.type === 'event' ? usedEventIds : usedItemIds).map(id => (
                  <option key={id} value={id} />
                ))}
              </datalist>
              {(condition.type === 'event' ? usedEventIds : usedItemIds).length > 0 && (
                <p 
                  className="text-[10px] mt-0.5"
                  style={{ color: 'var(--text-disabled)' }}
                >
                  💡 下拉选择已有ID，或直接输入新ID
                </p>
              )}
            </>
          ) : (
            <input
              type="text"
              value={condition.target}
              onChange={(e) => onUpdateCondition(conditionIndex, 'target', e.target.value)}
              placeholder="输入时间ID"
              className="w-full text-xs rounded px-2 py-1.5 border outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info, #3b82f6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
              }}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <div>
          <label 
            className="text-xs block mb-1"
            style={{ color: 'var(--text-disabled)' }}
          >
            比较方式
          </label>
          <select
            value={condition.operator}
            onChange={(e) => onUpdateCondition(conditionIndex, 'operator', e.target.value)}
            className="w-full text-xs rounded px-2 py-1.5 border outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary, #1f2937)',
              borderColor: 'var(--bg-overlay, #374151)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-info, #3b82f6)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
            }}
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
            <label 
              className="text-xs block mb-1"
              style={{ color: 'var(--text-disabled)' }}
            >
              比较值
            </label>
            <input
              type="number"
              value={condition.value ?? 0}
              onChange={(e) => onUpdateCondition(conditionIndex, 'value', parseFloat(e.target.value) || 0)}
              placeholder="数值"
              className="w-full text-xs rounded px-2 py-1.5 border outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-info, #3b82f6)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
