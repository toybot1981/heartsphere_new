import React, { useState, useEffect } from 'react';
import { skillService, SkillDefinition, CharacterSkillBinding } from '../../services/skill/SkillService';
import { SkillList } from './SkillList';
import { SkillEquipDialog } from './SkillEquipDialog';

interface CharacterSkillManagementProps {
  characterId: number;
  characterName?: string;
  adminToken?: string | null;
}

/**
 * 角色技能管理页面
 */
export const CharacterSkillManagement: React.FC<CharacterSkillManagementProps> = ({
  characterId,
  characterName,
  adminToken,
}) => {
  const [allSkills, setAllSkills] = useState<SkillDefinition[]>([]);
  const [equippedBindings, setEquippedBindings] = useState<CharacterSkillBinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [showEquippedOnly, setShowEquippedOnly] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [equipDialogOpen, setEquipDialogOpen] = useState(false);

  // 加载数据
  useEffect(() => {
    loadData();
  }, [characterId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [skills, bindings] = await Promise.all([
        skillService.getAllSkills(undefined, adminToken || undefined),
        skillService.getEquippedSkills(characterId, adminToken || undefined),
      ]);

      setAllSkills(skills);
      setEquippedBindings(bindings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('[CharacterSkillManagement] 加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (skillId: string) => {
    try {
      setSelectedSkill(allSkills.find(s => s.skillId === skillId) || null);
      setEquipDialogOpen(true);
    } catch (err) {
      console.error('[CharacterSkillManagement] 打开装备对话框失败:', err);
    }
  };

  const handleEquipConfirm = async (options: {
    isEnabled: boolean;
    autoTrigger: boolean;
    priority: number;
  }) => {
    if (!selectedSkill) return;

    try {
      await skillService.equipSkill(characterId, selectedSkill.skillId, options, adminToken || undefined);
      await loadData(); // 重新加载数据
      setEquipDialogOpen(false);
      setSelectedSkill(null);
    } catch (err) {
      console.error('[CharacterSkillManagement] 装备技能失败:', err);
      alert('装备技能失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleUnequip = async (skillId: string) => {
    if (!confirm('确定要卸载该技能吗？')) {
      return;
    }

    try {
      await skillService.unequipSkill(characterId, skillId, adminToken || undefined);
      await loadData(); // 重新加载数据
    } catch (err) {
      console.error('[CharacterSkillManagement] 卸载技能失败:', err);
      alert('卸载技能失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleToggle = async (skillId: string) => {
    try {
      await skillService.toggleSkill(characterId, skillId, adminToken || undefined);
      await loadData(); // 重新加载数据
    } catch (err) {
      console.error('[CharacterSkillManagement] 切换技能状态失败:', err);
      alert('切换技能状态失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const handleViewDetails = async (skill: SkillDefinition) => {
    // 可以打开一个详情对话框或导航到详情页
    const details = await skillService.getSkillById(skill.skillId, adminToken || undefined);
    if (details) {
      alert(`技能详情:\n名称: ${details.name}\n描述: ${details.description}\n版本: ${details.version || 'N/A'}`);
    }
  };

  // 获取所有分类
  const categories = Array.from(new Set(allSkills.map(s => s.category).filter(Boolean)));

  if (loading) {
    return (
      <div className="character-skill-management loading">
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-skill-management error">
        <p>错误: {error}</p>
        <button className="btn btn-primary" onClick={loadData}>
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="character-skill-management">
      <div className="skill-management-header">
        <h2>
          {characterName ? `${characterName} 的技能管理` : '技能管理'}
        </h2>
        <div className="skill-stats">
          <span>已装备: {equippedBindings.length}</span>
          <span>可用: {allSkills.length}</span>
        </div>
      </div>

      <div className="skill-management-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索技能..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="filter-controls">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">所有分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={showEquippedOnly}
              onChange={(e) => setShowEquippedOnly(e.target.checked)}
            />
            <span>只显示已装备</span>
          </label>
        </div>
      </div>

      <div className="skill-management-content">
        <SkillList
          skills={allSkills}
          equippedBindings={equippedBindings}
          onEquip={handleEquip}
          onUnequip={handleUnequip}
          onToggle={handleToggle}
          onViewDetails={handleViewDetails}
          showEquippedOnly={showEquippedOnly}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
        />
      </div>

      {selectedSkill && (
        <SkillEquipDialog
          skill={selectedSkill}
          isOpen={equipDialogOpen}
          onClose={() => {
            setEquipDialogOpen(false);
            setSelectedSkill(null);
          }}
          onConfirm={handleEquipConfirm}
        />
      )}
    </div>
  );
};
