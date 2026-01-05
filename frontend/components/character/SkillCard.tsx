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
        className={`bg-slate-800/50 rounded-lg border transition-all hover:border-indigo-500/50 cursor-pointer ${
          isEquipped ? 'border-green-500/50' : 'border-slate-700'
        } ${binding && !binding.isEnabled ? 'opacity-60' : ''}`}
        onClick={handleViewDetails}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex-1 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{skill.name}</h3>
                {isEquipped && (
                  <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">
                    已装备
                  </span>
                )}
                {skill.isSystemSkill && (
                  <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                    系统
                  </span>
                )}
                {binding && !binding.isEnabled && (
                  <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded border border-red-500/30">
                    已禁用
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 line-clamp-1">{skill.description || '暂无描述'}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              {skill.category && (
                <span className="text-slate-500">{skill.category}</span>
              )}
              {binding && (
                <span className="text-slate-500">使用 {binding.usageCount || 0} 次</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {onViewDetails && (
              <button
                onClick={handleViewDetails}
                className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
              >
                详情
              </button>
            )}
            {isEquipped ? (
              <>
                {onToggle && binding && (
                  <button
                    onClick={handleToggle}
                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                      binding.isEnabled
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {binding.isEnabled ? '禁用' : '启用'}
                  </button>
                )}
                {onUnequip && (
                  <button
                    onClick={handleEquip}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    卸载
                  </button>
                )}
              </>
            ) : (
              onEquip && (
                <button
                  onClick={handleEquip}
                  className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
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
      className={`bg-slate-800/50 rounded-lg border transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer ${
        isEquipped ? 'border-green-500/50' : 'border-slate-700'
      } ${binding && !binding.isEnabled ? 'opacity-60' : ''}`}
      onClick={handleViewDetails}
    >
      <div className="p-4 space-y-3">
        {/* 头部 */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-1 line-clamp-1">{skill.name}</h3>
            <div className="flex flex-wrap items-center gap-2">
              {isEquipped && (
                <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">
                  已装备
                </span>
              )}
              {skill.isSystemSkill && (
                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                  系统
                </span>
              )}
              {binding && !binding.isEnabled && (
                <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded border border-red-500/30">
                  已禁用
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 描述 */}
        <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem]">
          {skill.description || '暂无描述'}
        </p>

        {/* 元数据 */}
        <div className="flex items-center justify-between text-xs text-slate-500">
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
            <span className="text-indigo-400">
              {binding.usageCount || 0} 次使用
            </span>
          )}
        </div>

        {/* 统计信息 */}
        {binding && (
          <div className="pt-2 border-t border-slate-700">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">优先级:</span>
                <span className="text-white ml-1">{binding.priority}</span>
              </div>
              <div>
                <span className="text-slate-500">自动触发:</span>
                <span className={`ml-1 ${binding.autoTrigger ? 'text-yellow-400' : 'text-slate-500'}`}>
                  {binding.autoTrigger ? '是' : '否'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-700" onClick={(e) => e.stopPropagation()}>
          {onViewDetails && (
            <button
              onClick={handleViewDetails}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
            >
              详情
            </button>
          )}
          {isEquipped ? (
            <>
              {onToggle && binding && (
                <button
                  onClick={handleToggle}
                  className={`px-3 py-1.5 text-xs rounded transition-colors ${
                    binding.isEnabled
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {binding.isEnabled ? '禁用' : '启用'}
                </button>
              )}
              {onUnequip && (
                <button
                  onClick={handleEquip}
                  className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  卸载
                </button>
              )}
            </>
          ) : (
            onEquip && (
              <button
                onClick={handleEquip}
                className="flex-1 px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
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
