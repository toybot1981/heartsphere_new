import React, { useState, useEffect, useMemo } from 'react';
import { skillService, SkillDefinition, CharacterSkillBinding } from '../../services/skill/SkillService';
import { SkillList } from './SkillList';
import { SkillEquipDialog } from './SkillEquipDialog';
import { SkillDetailDialog } from './SkillDetailDialog';
import { showAlert } from '../../utils/dialog';

interface CharacterSkillManagementProps {
  characterId: number;
  characterName?: string;
  token?: string | null;
}

/**
 * 角色技能管理页面 - 优化版
 */
export const CharacterSkillManagement: React.FC<CharacterSkillManagementProps> = ({
  characterId,
  characterName,
  token,
}) => {
  const [allSkills, setAllSkills] = useState<SkillDefinition[]>([]);
  const [equippedBindings, setEquippedBindings] = useState<CharacterSkillBinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [skillTypeFilter, setSkillTypeFilter] = useState<string>('');
  const [showEquippedOnly, setShowEquippedOnly] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [equipDialogOpen, setEquipDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 加载数据
  useEffect(() => {
    loadData();
  }, [characterId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [skills, bindings] = await Promise.all([
        skillService.getAllSkills(undefined, token || undefined),
        skillService.getEquippedSkills(characterId, token || undefined),
      ]);

      setAllSkills(skills);
      setEquippedBindings(bindings);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
      console.error('[CharacterSkillManagement] 加载数据失败:', err);
      showAlert('加载技能数据失败: ' + (err instanceof Error ? err.message : '未知错误'), '错误', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEquip = async (skillId: string) => {
    try {
      const skill = allSkills.find(s => s.skillId === skillId);
      if (!skill) return;
      
      setSelectedSkill(skill);
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
    if (!selectedSkill) {
      console.error('[CharacterSkillManagement] 没有选中的技能');
      return;
    }

    try {
      await skillService.equipSkill(
        characterId, 
        selectedSkill.skillId, 
        options, 
        token || undefined
      );
      
      // 关闭对话框
      setEquipDialogOpen(false);
      setSelectedSkill(null);
      
      // 重新加载数据
      await loadData();
      
      // 显示成功提示
      showAlert('技能装备成功', '成功', 'success');
    } catch (err) {
      console.error('[CharacterSkillManagement] 装备技能失败:', err);
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      showAlert(`装备技能失败: ${errorMessage}`, '错误', 'error');
      
      // 保持对话框打开，让用户重试
      // setEquipDialogOpen(false);
    }
  };

  const handleUnequip = async (skillId: string) => {
    if (!confirm('确定要卸载该技能吗？')) {
      return;
    }

    try {
      await skillService.unequipSkill(characterId, skillId, token || undefined);
      await loadData(); // 重新加载数据
      showAlert('技能卸载成功', '成功', 'success');
    } catch (err) {
      console.error('[CharacterSkillManagement] 卸载技能失败:', err);
      showAlert('卸载技能失败: ' + (err instanceof Error ? err.message : '未知错误'), '错误', 'error');
    }
  };

  const handleToggle = async (skillId: string) => {
    try {
      await skillService.toggleSkill(characterId, skillId, token || undefined);
      await loadData(); // 重新加载数据
    } catch (err) {
      console.error('[CharacterSkillManagement] 切换技能状态失败:', err);
      showAlert('切换技能状态失败: ' + (err instanceof Error ? err.message : '未知错误'), '错误', 'error');
    }
  };

  const handleViewDetails = async (skill: SkillDefinition) => {
    try {
      const details = await skillService.getSkillById(skill.skillId, token || undefined);
      if (details) {
        setSelectedSkill(details);
        setDetailDialogOpen(true);
      }
    } catch (err) {
      console.error('[CharacterSkillManagement] 获取技能详情失败:', err);
      showAlert('获取技能详情失败: ' + (err instanceof Error ? err.message : '未知错误'), '错误', 'error');
    }
  };

  // 获取所有分类
  const categories = useMemo(() => {
    return Array.from(new Set(allSkills.map(s => s.category).filter(Boolean))).sort();
  }, [allSkills]);

  // 获取技能类型
  const skillTypes = useMemo(() => {
    return Array.from(new Set(allSkills.map(s => s.skillType).filter(Boolean))).sort();
  }, [allSkills]);

  // 统计信息
  const stats = useMemo(() => {
    const equipped = equippedBindings.length;
    const enabled = equippedBindings.filter(b => b.isEnabled).length;
    const autoTrigger = equippedBindings.filter(b => b.autoTrigger).length;
    return { equipped, enabled, autoTrigger, total: allSkills.length };
  }, [equippedBindings, allSkills]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-400">加载技能数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
        <p className="text-red-400 mb-4">错误: {error}</p>
        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          onClick={loadData}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="character-skill-management space-y-6">
      {/* 头部统计信息 */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {characterName ? `${characterName} 的技能管理` : '技能管理'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              title={viewMode === 'grid' ? '切换到列表视图' : '切换到网格视图'}
            >
              {viewMode === 'grid' ? '📋' : '🔲'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">总技能数</div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>
          <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">已装备</div>
            <div className="text-2xl font-bold text-indigo-400">{stats.equipped}</div>
          </div>
          <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">已启用</div>
            <div className="text-2xl font-bold text-green-400">{stats.enabled}</div>
          </div>
          <div className="bg-slate-900/50 rounded p-3 border border-slate-700">
            <div className="text-xs text-slate-400 mb-1">自动触发</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.autoTrigger}</div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤控制 */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索技能名称、描述或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
              <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
            </div>
          </div>

          {/* 分类过滤 */}
          <select
            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">所有分类</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* 技能类型过滤 */}
          <select
            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
            value={skillTypeFilter}
            onChange={(e) => setSkillTypeFilter(e.target.value)}
          >
            <option value="">所有类型</option>
            {skillTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* 快速过滤选项 */}
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEquippedOnly}
              onChange={(e) => setShowEquippedOnly(e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-slate-300">只显示已装备</span>
          </label>
        </div>
      </div>

      {/* 技能列表 */}
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
          skillTypeFilter={skillTypeFilter}
          viewMode={viewMode}
        />
      </div>

      {/* 装备对话框 */}
      {selectedSkill && (
        <SkillEquipDialog
          skill={selectedSkill}
          isOpen={equipDialogOpen}
          onClose={() => {
            setEquipDialogOpen(false);
            setSelectedSkill(null);
          }}
          onConfirm={handleEquipConfirm}
          initialOptions={equippedBindings.find(b => b.skillId === selectedSkill.skillId) ? {
            isEnabled: equippedBindings.find(b => b.skillId === selectedSkill.skillId)!.isEnabled,
            autoTrigger: equippedBindings.find(b => b.skillId === selectedSkill.skillId)!.autoTrigger,
            priority: equippedBindings.find(b => b.skillId === selectedSkill.skillId)!.priority,
          } : undefined}
        />
      )}

      {/* 详情对话框 */}
      {selectedSkill && (
        <SkillDetailDialog
          skill={selectedSkill}
          isOpen={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedSkill(null);
          }}
          binding={equippedBindings.find(b => b.skillId === selectedSkill.skillId)}
          onEquip={() => {
            setDetailDialogOpen(false);
            handleEquip(selectedSkill.skillId);
          }}
          onUnequip={() => {
            setDetailDialogOpen(false);
            handleUnequip(selectedSkill.skillId);
          }}
          onToggle={() => {
            if (equippedBindings.find(b => b.skillId === selectedSkill.skillId)) {
              handleToggle(selectedSkill.skillId);
            }
          }}
        />
      )}
    </div>
  );
};
