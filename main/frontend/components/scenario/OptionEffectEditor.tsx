/**
 * 选项效果编辑器组件
 * 用于编辑选项的状态影响（好感度、事件、物品）
 */

import React from 'react';
import { StoryOptionEffect, Character } from '../../types';

interface OptionEffectEditorProps {
  effects: StoryOptionEffect[];
  effectIndex: number;
  availableCharacters: Character[];
  usedEventIds: string[];
  usedItemIds: string[];
  onUpdateEffect: (effectIdx: number, field: keyof StoryOptionEffect, value: any) => void;
  onDeleteEffect: (effectIdx: number) => void;
  onCreateEvent?: () => void;
  onCreateItem?: () => void;
}

export const OptionEffectEditor: React.FC<OptionEffectEditorProps> = ({
  effects,
  effectIndex,
  availableCharacters,
  usedEventIds,
  usedItemIds,
  onUpdateEffect,
  onDeleteEffect,
  onCreateEvent,
  onCreateItem,
}) => {
  const effect = effects[effectIndex];

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
          影响 #{effectIndex + 1}
        </span>
        <button
          onClick={() => onDeleteEffect(effectIndex)}
          className="text-xs px-2 transition-colors"
          style={{ color: 'var(--text-disabled)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-error, #ef4444)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-disabled)';
          }}
          title="删除影响"
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
            影响类型
          </label>
          <select
            value={effect.type}
            onChange={(e) => onUpdateEffect(effectIndex, 'type', e.target.value)}
            className="w-full text-xs rounded px-2 py-1.5 border outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary, #1f2937)',
              borderColor: 'var(--bg-overlay, #374151)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-warning, #eab308)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
            }}
          >
            <option value="favorability">💕 改变好感度</option>
            <option value="event">📌 触发事件</option>
            <option value="item">🎁 收集物品</option>
          </select>
        </div>
        <div>
          <label 
            className="text-xs block mb-1"
            style={{ color: 'var(--text-disabled)' }}
          >
            {effect.type === 'favorability' ? '角色' : effect.type === 'event' ? '事件ID' : '物品ID'}
          </label>
          {effect.type === 'favorability' ? (
            <select
              value={effect.target}
              onChange={(e) => onUpdateEffect(effectIndex, 'target', e.target.value)}
              className="w-full text-xs rounded px-2 py-1.5 border outline-none"
              style={{
                backgroundColor: 'var(--bg-secondary, #1f2937)',
                borderColor: 'var(--bg-overlay, #374151)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-warning, #eab308)';
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
                  list={`effect-${effectIndex}-${effect.type === 'event' ? 'events' : 'items'}`}
                  value={effect.target}
                  onChange={(e) => onUpdateEffect(effectIndex, 'target', e.target.value)}
                  placeholder={`选择已有或输入新的${effect.type === 'event' ? '事件' : '物品'}ID`}
                  className="flex-1 text-xs rounded px-2 py-1.5 border outline-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary, #1f2937)',
                    borderColor: 'var(--bg-overlay, #374151)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-warning, #eab308)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
                  }}
                />
                {effect.type === 'event' && onCreateEvent && (
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
                {effect.type === 'item' && onCreateItem && (
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
              <datalist id={`effect-${effectIndex}-${effect.type === 'event' ? 'events' : 'items'}`}>
                {(effect.type === 'event' ? usedEventIds : usedItemIds).map(id => (
                  <option key={id} value={id} />
                ))}
              </datalist>
              {(effect.type === 'event' ? usedEventIds : usedItemIds).length > 0 && (
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
      {effect.type === 'favorability' && (
        <div className="mt-2">
          <label 
            className="text-xs block mb-1"
            style={{ color: 'var(--text-disabled)' }}
          >
            好感度变化
          </label>
          <input
            type="number"
            value={effect.value ?? 0}
            onChange={(e) => onUpdateEffect(effectIndex, 'value', parseInt(e.target.value) || 0)}
            placeholder="例如：10（增加）或 -5（减少）"
            className="w-full text-xs rounded px-2 py-1.5 border outline-none"
            style={{
              backgroundColor: 'var(--bg-secondary, #1f2937)',
              borderColor: 'var(--bg-overlay, #374151)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-warning, #eab308)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #374151)';
            }}
          />
        </div>
      )}
    </div>
  );
};
