import React from 'react';
import { SkillDefinition, CharacterSkillBinding } from '../../services/skill/SkillService';

interface SkillDetailDialogProps {
  skill: SkillDefinition;
  isOpen: boolean;
  onClose: () => void;
  binding?: CharacterSkillBinding;
  onEquip?: () => void;
  onUnequip?: () => void;
  onToggle?: () => void;
}

/**
 * 技能详情对话框组件
 */
export const SkillDetailDialog: React.FC<SkillDetailDialogProps> = ({
  skill,
  isOpen,
  onClose,
  binding,
  onEquip,
  onUnequip,
  onToggle,
}) => {
  if (!isOpen) {
    return null;
  }

  const isEquipped = !!binding;

  // 解析 function_schema
  let functionSchema: any = null;
  try {
    if (skill.functionSchema) {
      functionSchema = typeof skill.functionSchema === 'string' 
        ? JSON.parse(skill.functionSchema) 
        : skill.functionSchema;
    }
  } catch (e) {
    console.error('Failed to parse function schema:', e);
  }

  // 解析 execution_config
  let executionConfig: any = null;
  try {
    if (skill.executionConfig) {
      executionConfig = typeof skill.executionConfig === 'string'
        ? JSON.parse(skill.executionConfig)
        : skill.executionConfig;
    }
  } catch (e) {
    console.error('Failed to parse execution config:', e);
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl border border-slate-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{skill.name}</h2>
            {skill.isSystemSkill && (
              <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                系统技能
              </span>
            )}
            {isEquipped && (
              <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded border border-green-500/30">
                已装备
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 className="text-sm font-semibold text-slate-400 mb-2">描述</h3>
            <p className="text-white">{skill.description || '暂无描述'}</p>
          </div>

          {/* 元数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skill.category && (
              <div>
                <div className="text-xs text-slate-400 mb-1">分类</div>
                <div className="text-white font-medium">{skill.category}</div>
              </div>
            )}
            {skill.skillType && (
              <div>
                <div className="text-xs text-slate-400 mb-1">类型</div>
                <div className="text-white font-medium">{skill.skillType}</div>
              </div>
            )}
            {skill.executionType && (
              <div>
                <div className="text-xs text-slate-400 mb-1">执行类型</div>
                <div className="text-white font-medium">{skill.executionType}</div>
              </div>
            )}
            {skill.version && (
              <div>
                <div className="text-xs text-slate-400 mb-1">版本</div>
                <div className="text-white font-medium">v{skill.version}</div>
              </div>
            )}
          </div>

          {/* 装备状态 */}
          {isEquipped && binding && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-400 mb-3">装备状态</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">启用状态</div>
                  <div className={`text-sm font-medium ${binding.isEnabled ? 'text-green-400' : 'text-red-400'}`}>
                    {binding.isEnabled ? '已启用' : '已禁用'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">自动触发</div>
                  <div className={`text-sm font-medium ${binding.autoTrigger ? 'text-yellow-400' : 'text-slate-400'}`}>
                    {binding.autoTrigger ? '是' : '否'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">优先级</div>
                  <div className="text-sm font-medium text-white">{binding.priority}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-1">使用次数</div>
                  <div className="text-sm font-medium text-white">{binding.usageCount || 0}</div>
                </div>
              </div>
            </div>
          )}

          {/* Function Schema */}
          {functionSchema && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">函数参数</h3>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(functionSchema, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 执行配置 */}
          {executionConfig && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">执行配置</h3>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <pre className="text-xs text-slate-300 overflow-x-auto">
                  {JSON.stringify(executionConfig, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 自动触发关键词 */}
          {skill.autoTriggerKeywords && (
            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-2">自动触发关键词</h3>
              <div className="flex flex-wrap gap-2">
                {skill.autoTriggerKeywords.split(',').map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs bg-indigo-500/20 text-indigo-400 rounded border border-indigo-500/30"
                  >
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 作者信息 */}
          {skill.author && (
            <div>
              <div className="text-xs text-slate-400 mb-1">作者</div>
              <div className="text-white">{skill.author}</div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-slate-700 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            关闭
          </button>
          {isEquipped ? (
            <>
              {onToggle && (
                <button
                  onClick={onToggle}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    binding?.isEnabled
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {binding?.isEnabled ? '禁用' : '启用'}
                </button>
              )}
              {onUnequip && (
                <button
                  onClick={onUnequip}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  卸载
                </button>
              )}
            </>
          ) : (
            onEquip && (
              <button
                onClick={onEquip}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                装备技能
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};
