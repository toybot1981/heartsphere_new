import React, { useState, useMemo } from 'react';
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
  skillTypeFilter?: string;
  viewMode?: 'grid' | 'list';
}

/**
 * 技能列表组件 - 优化版
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
  categoryFilter = '',
  skillTypeFilter = '',
  viewMode = 'grid',
}) => {
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'usage' | 'equipped'>('name');

  // 创建技能ID到绑定的映射
  const bindingMap = useMemo(() => {
    const map = new Map<string, CharacterSkillBinding>();
    equippedBindings.forEach(binding => {
      map.set(binding.skillId, binding);
    });
    return map;
  }, [equippedBindings]);

  // 过滤和排序技能
  const filteredSkills = useMemo(() => {
    let filtered = [...skills];

    // 只显示已装备的技能
    if (showEquippedOnly) {
      const equippedSkillIds = new Set(equippedBindings.map(b => b.skillId));
      filtered = filtered.filter(skill => equippedSkillIds.has(skill.skillId));
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skill.skillId.toLowerCase().includes(query)
      );
    }

    // 分类过滤
    if (categoryFilter) {
      filtered = filtered.filter(skill => skill.category === categoryFilter);
    }

    // 技能类型过滤
    if (skillTypeFilter) {
      filtered = filtered.filter(skill => skill.skillType === skillTypeFilter);
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'zh-CN');
        case 'category':
          return (a.category || '').localeCompare(b.category || '', 'zh-CN');
        case 'usage':
          const usageA = bindingMap.get(a.skillId)?.usageCount || 0;
          const usageB = bindingMap.get(b.skillId)?.usageCount || 0;
          return usageB - usageA;
        case 'equipped':
          const equippedA = bindingMap.has(a.skillId) ? 1 : 0;
          const equippedB = bindingMap.has(b.skillId) ? 1 : 0;
          return equippedB - equippedA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [skills, equippedBindings, showEquippedOnly, searchQuery, categoryFilter, skillTypeFilter, sortBy, bindingMap]);

  if (filteredSkills.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-12 text-center border border-slate-700">
        <div className="text-4xl mb-4">🔍</div>
        <p className="text-slate-300 text-lg mb-2">没有找到技能</p>
        {searchQuery && (
          <p className="text-slate-500 text-sm">尝试使用不同的搜索关键词或清除筛选条件</p>
        )}
      </div>
    );
  }

  return (
    <div className="skill-list">
      {/* 排序控制 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-slate-400">
          共找到 <span className="text-white font-semibold">{filteredSkills.length}</span> 个技能
        </div>
        <select
          className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
        >
          <option value="name">按名称排序</option>
          <option value="category">按分类排序</option>
          <option value="usage">按使用次数排序</option>
          <option value="equipped">按装备状态排序</option>
        </select>
      </div>

      {/* 技能列表/网格 */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
        : 'space-y-3'
      }>
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
              viewMode={viewMode}
            />
          );
        })}
      </div>
    </div>
  );
};
