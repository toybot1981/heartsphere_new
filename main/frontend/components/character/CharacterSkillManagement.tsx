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
          <div 
            className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-4"
            style={{ borderColor: 'var(--color-primary, #4f46e5)' }}
          />
          <p style={{ color: 'var(--text-tertiary)' }}>加载技能数据中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="border rounded-lg p-6 text-center"
        style={{
          backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
          borderColor: 'var(--color-error, rgba(239, 68, 68, 0.5))',
        }}
      >
        <p 
          className="mb-4"
          style={{ color: 'var(--color-error, #fca5a5)' }}
        >
          错误: {error}
        </p>
        <button
          className="px-4 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: 'var(--color-primary, #4f46e5)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-light, #4338ca)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary, #4f46e5)';
          }}
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
      <div 
        className="rounded-lg p-6 border"
        style={{
          backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            {characterName ? `${characterName} 的技能管理` : '技能管理'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="px-3 py-1.5 text-sm rounded transition-colors"
              style={{
                backgroundColor: 'var(--bg-secondary, #374151)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover, #4b5563)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary, #374151)';
              }}
              title={viewMode === 'grid' ? '切换到列表视图' : '切换到网格视图'}
            >
              {viewMode === 'grid' ? '📋' : '🔲'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="rounded p-3 border"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
            }}
          >
            <div 
              className="text-xs mb-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              总技能数
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {stats.total}
            </div>
          </div>
          <div 
            className="rounded p-3 border"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
            }}
          >
            <div 
              className="text-xs mb-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              已装备
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-primary, #818cf8)' }}
            >
              {stats.equipped}
            </div>
          </div>
          <div 
            className="rounded p-3 border"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
            }}
          >
            <div 
              className="text-xs mb-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              已启用
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-success, #86efac)' }}
            >
              {stats.enabled}
            </div>
          </div>
          <div 
            className="rounded p-3 border"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
            }}
          >
            <div 
              className="text-xs mb-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              自动触发
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ color: 'var(--color-warning, #fcd34d)' }}
            >
              {stats.autoTrigger}
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤控制 */}
      <div 
        className="rounded-lg p-4 border space-y-4"
        style={{
          backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索技能名称、描述或ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 pl-10 focus:outline-none"
                style={{
                  backgroundColor: 'var(--bg-overlay, #0f172a)',
                  borderColor: 'var(--bg-overlay, #475569)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
                }}
              />
              <span 
                className="absolute left-3 top-2.5"
                style={{ color: 'var(--text-tertiary)' }}
              >
                🔍
              </span>
            </div>
          </div>

          {/* 分类过滤 */}
          <select
            className="border rounded-lg px-4 py-2 focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-overlay, #0f172a)',
              borderColor: 'var(--bg-overlay, #475569)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
            }}
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
            className="border rounded-lg px-4 py-2 focus:outline-none"
            style={{
              backgroundColor: 'var(--bg-overlay, #0f172a)',
              borderColor: 'var(--bg-overlay, #475569)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary, #4f46e5)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--bg-overlay, #475569)';
            }}
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
              className="w-4 h-4 rounded"
              style={{
                accentColor: 'var(--color-primary, #4f46e5)',
                backgroundColor: 'var(--bg-secondary, #374151)',
                borderColor: 'var(--bg-overlay, #475569)',
              }}
            />
            <span 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              只显示已装备
            </span>
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
