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
  viewMode?: 'grid' | 'list';
}

/**
 * 技能卡片组件 - 优化版
 */
export const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  binding,
  isEquipped = false,
  onEquip,
  onUnequip,
  onToggle,
  onViewDetails,
  viewMode = 'grid',
}) => {
  const handleEquip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEquipped && onUnequip) {
      onUnequip(skill.skillId);
    } else if (!isEquipped && onEquip) {
      onEquip(skill.skillId);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggle && binding) {
      onToggle(skill.skillId);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(skill);
    }
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="rounded-lg border transition-all cursor-pointer"
        style={{
          backgroundColor: 'var(--bg-overlay, rgba(30, 41, 59, 0.5))',
          borderColor: isEquipped 
            ? 'var(--color-success, rgba(34, 197, 94, 0.5))' 
            : 'var(--bg-overlay, rgba(55, 65, 81, 1))',
          opacity: binding && !binding.isEnabled ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isEquipped) {
            e.currentTarget.style.borderColor = 'var(--color-primary, rgba(79, 70, 229, 0.5))';
          }
        }}
        onMouseLeave={(e) => {
          if (!isEquipped) {
            e.currentTarget.style.borderColor = 'var(--bg-overlay, rgba(55, 65, 81, 1))';
          }
        }}
        onClick={handleViewDetails}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {skill.name}
                </h3>
                {isEquipped && (
                  <span 
                    className="px-2 py-0.5 text-xs rounded border"
                    style={{
                      backgroundColor: 'var(--color-success, rgba(34, 197, 94, 0.2))',
                      color: 'var(--color-success, #86efac)',
                      borderColor: 'var(--color-success, rgba(34, 197, 94, 0.3))',
                    }}
                  >
                    已装备
                  </span>
                )}
                {skill.isSystemSkill && (
                  <span 
                    className="px-2 py-0.5 text-xs rounded border"
                    style={{
                      backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.2))',
                      color: 'var(--color-info, #93c5fd)',
                      borderColor: 'var(--color-info, rgba(59, 130, 246, 0.3))',
                    }}
                  >
                    系统
                  </span>
                )}
                {binding && !binding.isEnabled && (
                  <span 
                    className="px-2 py-0.5 text-xs rounded border"
                    style={{
                      backgroundColor: 'var(--color-error, rgba(239, 68, 68, 0.2))',
                      color: 'var(--color-error, #fca5a5)',
                      borderColor: 'var(--color-error, rgba(239, 68, 68, 0.3))',
                    }}
                  >
                    已禁用
                  </span>
                )}
              </div>
              <p 
                className="text-sm line-clamp-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {skill.description || '暂无描述'}
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {skill.category && (
                <span style={{ color: 'var(--text-disabled)' }}>{skill.category}</span>
              )}
              {binding && (
                <span style={{ color: 'var(--text-disabled)' }}>使用 {binding.usageCount || 0} 次</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {onViewDetails && (
              <button
                onClick={handleViewDetails}
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
              >
                详情
              </button>
            )}
            {isEquipped ? (
              <>
                {onToggle && binding && (
                  <button
                    onClick={handleToggle}
                    className="px-3 py-1.5 text-sm rounded transition-colors"
                    style={{
                      backgroundColor: binding.isEnabled 
                        ? 'var(--color-warning, #ca8a04)' 
                        : 'var(--color-success, #16a34a)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = binding.isEnabled 
                        ? 'var(--color-warning-light, #a16207)' 
                        : 'var(--color-success-light, #15803d)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = binding.isEnabled 
                        ? 'var(--color-warning, #ca8a04)' 
                        : 'var(--color-success, #16a34a)';
                    }}
                  >
                    {binding.isEnabled ? '禁用' : '启用'}
                  </button>
                )}
                {onUnequip && (
                  <button
                    onClick={handleEquip}
                    className="px-3 py-1.5 text-sm rounded transition-colors"
                    style={{
                      backgroundColor: 'var(--color-error, #dc2626)',
                      color: 'var(--text-primary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error-light, #b91c1c)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-error, #dc2626)';
                    }}
                  >
                    卸载
                  </button>
                )}
              </>
            ) : (
              onEquip && (
                <button
                  onClick={handleEquip}
                  className="px-3 py-1.5 text-sm rounded transition-colors"
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
                >
                  装备
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  // 网格视图
  return (
    <div
      className={`rounded-lg border transition-all hover:shadow-lg cursor-pointer ${
        binding && !binding.isEnabled ? 'opacity-60' : ''
      }`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isEquipped ? 'var(--border-success-alpha)' : 'var(--border-color-overlay)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-info-alpha)';
        e.currentTarget.style.boxShadow = '0 0 0 1px var(--border-info-alpha)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isEquipped ? 'var(--border-success-alpha)' : 'var(--border-color-overlay)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={handleViewDetails}
    >
      <div className="p-4 space-y-3">
        {/* 头部 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold mb-1 line-clamp-1" style={{ color: 'var(--text-primary)' }}>{skill.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              {isEquipped && (
                <span
                  className="px-2 py-0.5 text-xs rounded border"
                  style={{
                    backgroundColor: 'var(--bg-success-alpha)',
                    color: 'var(--color-success)',
                    borderColor: 'var(--border-success-alpha)',
                  }}
                >
                  已装备
                </span>
              )}
              {skill.isSystemSkill && (
                <span
                  className="px-2 py-0.5 text-xs rounded border"
                  style={{
                    backgroundColor: 'var(--bg-info-alpha)',
                    color: 'var(--color-info)',
                    borderColor: 'var(--border-info-alpha)',
                  }}
                >
                  系统
                </span>
              )}
              {binding && !binding.isEnabled && (
                <span
                  className="px-2 py-0.5 text-xs rounded border"
                  style={{
                    backgroundColor: 'var(--bg-error-alpha)',
                    color: 'var(--color-error)',
                    borderColor: 'var(--border-error-alpha)',
                  }}
                >
                  已禁用
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 描述 */}
        <p 
          className="text-sm line-clamp-2 min-h-[2.5rem]"
          style={{ color: 'var(--text-tertiary)' }}
        >
          {skill.description || '暂无描述'}
        </p>

        {/* 元数据 */}
        <div 
          className="flex items-center justify-between text-xs"
          style={{ color: 'var(--text-disabled)' }}
        >
          <div className="flex items-center gap-3">
            {skill.category && (
              <span className="flex items-center gap-1">
                <span>📁</span>
                <span>{skill.category}</span>
              </span>
            )}
            {skill.version && (
              <span>v{skill.version}</span>
            )}
          </div>
          {binding && (
            <span style={{ color: 'var(--color-primary, #818cf8)' }}>
              {binding.usageCount || 0} 次使用
            </span>
          )}
        </div>

        {/* 统计信息 */}
        {binding && (
          <div 
            className="pt-2 border-t"
            style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
          >
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span style={{ color: 'var(--text-disabled)' }}>优先级:</span>
                <span 
                  className="ml-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {binding.priority}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-disabled)' }}>自动触发:</span>
                <span 
                  className="ml-1"
                  style={{ 
                    color: binding.autoTrigger 
                      ? 'var(--color-warning, #fcd34d)' 
                      : 'var(--text-disabled)' 
                  }}
                >
                  {binding.autoTrigger ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div 
          className="flex items-center gap-2 pt-2 border-t"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
          onClick={(e) => e.stopPropagation()}
        >
          {onViewDetails && (
            <button
              onClick={handleViewDetails}
              className="flex-1 px-3 py-1.5 text-xs rounded transition-colors"
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
            >
              详情
            </button>
          )}
          {isEquipped ? (
            <>
              {onToggle && binding && (
                <button
                  onClick={handleToggle}
                  className="px-3 py-1.5 text-xs rounded transition-colors"
                  style={{
                    backgroundColor: binding.isEnabled ? 'var(--color-warning)' : 'var(--color-success)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = binding.isEnabled ? 'var(--color-warning-light)' : 'var(--color-success-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = binding.isEnabled ? 'var(--color-warning)' : 'var(--color-success)';
                  }}
                >
                  {binding.isEnabled ? '禁用' : '启用'}
                </button>
              )}
              {onUnequip && (
                <button
                  onClick={handleEquip}
                  className="px-3 py-1.5 text-xs rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--color-error)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-error-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-error)';
                  }}
                >
                  卸载
                </button>
              )}
            </>
          ) : (
            onEquip && (
              <button
                onClick={handleEquip}
                className="flex-1 px-3 py-1.5 text-xs rounded transition-colors"
                style={{
                  backgroundColor: 'var(--color-info)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-info)';
                }}
              >
                装备
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
