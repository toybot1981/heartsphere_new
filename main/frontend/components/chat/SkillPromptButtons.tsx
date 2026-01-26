/**
 * 技能预设话术按钮组件
 * 为生活助手角色显示预设话术，方便用户测试技能
 */

import React, { useState, useMemo } from 'react';
import { Character } from '../../types';
import { getCharacterPrompts, SkillPrompt } from '../../constants/skillPrompts';

interface SkillPromptButtonsProps {
  character: Character;
  onSelectPrompt: (text: string) => void;
  disabled?: boolean;
}

export const SkillPromptButtons: React.FC<SkillPromptButtonsProps> = ({
  character,
  onSelectPrompt,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 获取角色的预设话术
  const prompts = useMemo(() => {
    return getCharacterPrompts(character.name);
  }, [character.name]);

  // 如果没有预设话术，不显示组件
  if (prompts.length === 0) {
    return null;
  }

  // 获取所有分类
  const categories = useMemo(() => {
    const cats = new Set<string>();
    prompts.forEach(prompt => {
      if (prompt.category) {
        cats.add(prompt.category);
      }
    });
    return Array.from(cats).sort();
  }, [prompts]);

  // 根据选择的分类过滤话术
  const filteredPrompts = useMemo(() => {
    if (!selectedCategory) {
      return prompts;
    }
    return prompts.filter(prompt => prompt.category === selectedCategory);
  }, [prompts, selectedCategory]);

  // 默认只显示前4个话术，展开后显示全部
  const displayedPrompts = isExpanded ? filteredPrompts : filteredPrompts.slice(0, 4);

  const handlePromptClick = (prompt: SkillPrompt) => {
    if (disabled) return;
    onSelectPrompt(prompt.text);
  };

  return (
    <div className="w-full mb-2 animate-fade-in">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center space-x-2">
          <span 
            className="text-xs font-medium"
            style={{ color: 'var(--text-tertiary)' }}
          >
            💡 技能测试话术
          </span>
          {prompts.length > 0 && (
            <span 
              className="text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              ({displayedPrompts.length}/{filteredPrompts.length})
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          {/* 分类选择 */}
          {categories.length > 0 && (
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="text-xs rounded-md px-2 py-1 border transition-all focus:outline-none"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
                color: 'var(--text-secondary)',
                borderColor: 'var(--border-color-overlay, rgba(255, 255, 255, 0.1))',
              }}
              disabled={disabled}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                e.currentTarget.style.outline = '1px solid var(--border-color-overlay, rgba(255, 255, 255, 0.3))';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.outline = 'none';
              }}
            >
              <option value="">全部技能</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
          {/* 展开/收起按钮 */}
          {filteredPrompts.length > 4 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={disabled}
              className="text-xs px-2 py-1 rounded transition-all disabled:opacity-50"
              style={{ color: 'var(--text-tertiary)' }}
              title={isExpanded ? '收起' : '展开全部'}
              onMouseEnter={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.1))';
                }
              }}
              onMouseLeave={(e) => {
                if (!disabled) {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {isExpanded ? '收起 ↑' : '展开 ↓'}
            </button>
          )}
        </div>
      </div>

      {/* 话术按钮列表 */}
      <div className="flex flex-wrap gap-2">
        {displayedPrompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handlePromptClick(prompt)}
            disabled={disabled}
            className="group relative text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
              borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.1))',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, rgba(255, 255, 255, 0.2))';
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.3))';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(255, 255, 255, 0.1))';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
            title={prompt.skillName ? `点击测试: ${prompt.skillName}` : prompt.text}
          >
            <span className="block truncate max-w-[200px]">
              {prompt.text}
            </span>
            {prompt.skillName && (
              <span 
                className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-10 border"
                style={{
                  backgroundColor: 'var(--bg-card, rgba(0, 0, 0, 0.9))',
                  borderColor: 'var(--bg-overlay, rgba(255, 255, 255, 0.2))',
                  color: 'var(--text-secondary)',
                }}
              >
                {prompt.skillName}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 提示信息 */}
      {!isExpanded && filteredPrompts.length > 4 && (
        <div 
          className="text-xs mt-2 px-1"
          style={{ color: 'var(--text-disabled)' }}
        >
          还有 {filteredPrompts.length - 4} 个话术，点击"展开"查看全部
        </div>
      )}
    </div>
  );
};
