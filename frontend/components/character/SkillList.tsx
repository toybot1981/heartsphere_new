import React, { useState } from 'react';
import { SkillDefinition, CharacterSkillBinding } from '../../services/skill/SkillService';
import { SkillCard } from './SkillCard';

interface SkillListProps {
  skills: SkillDefinition[];
  equippedBindings?: CharacterSkillBinding[];
  onEquip?: (skillId: string) => void;
  onUnequip?: (skillId: string) => void;
  onToggle?: (skillId: string) => void;
  onViewDetails?: (skill: SkillDefinition) => void;
  showEquippedOnly?: boolean;
  searchQuery?: string;
  categoryFilter?: string;
}

/**
 * 技能列表组件
 */
export const SkillList: React.FC<SkillListProps> = ({
  skills,
  equippedBindings = [],
  onEquip,
  onUnequip,
  onToggle,
  onViewDetails,
  showEquippedOnly = false,
  searchQuery = '',
  categoryFilter,
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'usage'>('name');

  // 创建技能ID到绑定的映射
  const bindingMap = new Map<string, CharacterSkillBinding>();
  equippedBindings.forEach(binding => {
    bindingMap.set(binding.skillId, binding);
  });

  // 过滤技能
  let filteredSkills = skills;

  // 只显示已装备的技能
  if (showEquippedOnly) {
    const equippedSkillIds = new Set(equippedBindings.map(b => b.skillId));
    filteredSkills = filteredSkills.filter(skill => equippedSkillIds.has(skill.skillId));
  }

  // 搜索过滤
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredSkills = filteredSkills.filter(skill =>
      skill.name.toLowerCase().includes(query) ||
      skill.description.toLowerCase().includes(query) ||
      skill.skillId.toLowerCase().includes(query)
    );
  }

  // 分类过滤
  if (categoryFilter) {
    filteredSkills = filteredSkills.filter(skill => skill.category === categoryFilter);
  }

  // 排序
  filteredSkills = [...filteredSkills].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      case 'usage':
        const usageA = bindingMap.get(a.skillId)?.usageCount || 0;
        const usageB = bindingMap.get(b.skillId)?.usageCount || 0;
        return usageB - usageA;
      default:
        return 0;
    }
  });

  // 获取所有分类
  const categories = Array.from(new Set(skills.map(s => s.category).filter(Boolean)));

  if (filteredSkills.length === 0) {
    return (
      <div className="skill-list-empty">
        <p>没有找到技能</p>
        {searchQuery && (
          <p className="text-muted">尝试使用不同的搜索关键词</p>
        )}
      </div>
    );
  }

  return (
    <div className="skill-list">
      <div className="skill-list-controls">
        <div className="skill-list-filters">
          <select
            className="form-select"
            value={categoryFilter || ''}
            onChange={(e) => {
              // 这个需要由父组件处理
            }}
          >
            <option value="">所有分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="name">按名称排序</option>
            <option value="category">按分类排序</option>
            <option value="usage">按使用次数排序</option>
          </select>
        </div>
      </div>

      <div className="skill-list-grid">
        {filteredSkills.map(skill => {
          const binding = bindingMap.get(skill.skillId);
          const isEquipped = !!binding;

          return (
            <SkillCard
              key={skill.skillId}
              skill={skill}
              binding={binding}
              isEquipped={isEquipped}
              onEquip={onEquip}
              onUnequip={onUnequip}
              onToggle={onToggle}
              onViewDetails={onViewDetails}
            />
          );
        })}
      </div>
    </div>
  );
};
