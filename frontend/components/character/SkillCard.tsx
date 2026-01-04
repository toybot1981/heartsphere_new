import React from 'react';
import { SkillDefinition, CharacterSkillBinding } from '../../services/skill/SkillService';

interface SkillCardProps {
  skill: SkillDefinition;
  binding?: CharacterSkillBinding;
  isEquipped?: boolean;
  onEquip?: (skillId: string) => void;
  onUnequip?: (skillId: string) => void;
  onToggle?: (skillId: string) => void;
  onViewDetails?: (skill: SkillDefinition) => void;
}

/**
 * 技能卡片组件
 */
export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  binding,
  isEquipped = false,
  onEquip,
  onUnequip,
  onToggle,
  onViewDetails,
}) => {
  const handleEquip = () => {
    if (isEquipped && onUnequip) {
      onUnequip(skill.skillId);
    } else if (!isEquipped && onEquip) {
      onEquip(skill.skillId);
    }
  };

  const handleToggle = () => {
    if (onToggle && binding) {
      onToggle(skill.skillId);
    }
  };

  return (
    <div className={`skill-card ${isEquipped ? 'equipped' : ''} ${binding && !binding.isEnabled ? 'disabled' : ''}`}>
      <div className="skill-card-header">
        <h3 className="skill-name">{skill.name}</h3>
        {isEquipped && (
          <span className="skill-badge equipped-badge">已装备</span>
        )}
        {skill.isSystemSkill && (
          <span className="skill-badge system-badge">系统</span>
        )}
      </div>

      <p className="skill-description">{skill.description}</p>

      {skill.category && (
        <div className="skill-meta">
          <span className="skill-category">{skill.category}</span>
          {skill.version && (
            <span className="skill-version">v{skill.version}</span>
          )}
        </div>
      )}

      {binding && (
        <div className="skill-stats">
          <div className="stat-item">
            <span className="stat-label">使用次数:</span>
            <span className="stat-value">{binding.usageCount}</span>
          </div>
          {binding.lastUsedAt && (
            <div className="stat-item">
              <span className="stat-label">最后使用:</span>
              <span className="stat-value">
                {new Date(binding.lastUsedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="skill-actions">
        {onViewDetails && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onViewDetails(skill)}
          >
            详情
          </button>
        )}
        {isEquipped ? (
          <>
            {onToggle && binding && (
              <button
                className={`btn btn-sm ${binding.isEnabled ? 'btn-warning' : 'btn-success'}`}
                onClick={handleToggle}
              >
                {binding.isEnabled ? '禁用' : '启用'}
              </button>
            )}
            {onUnequip && (
              <button
                className="btn btn-danger btn-sm"
                onClick={handleEquip}
              >
                卸载
              </button>
            )}
          </>
        ) : (
          onEquip && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleEquip}
            >
              装备
            </button>
          )
        )}
      </div>
    </div>
  );
};
