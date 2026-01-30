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

  // 已移除：functionSchema (废弃，改用 mcpToolConfig)
  // 解析 mcp_tool_config
  let mcpToolConfig: any = null;
  try {
    if (skill.mcpToolConfig) {
      mcpToolConfig = typeof skill.mcpToolConfig === 'string' 
        ? JSON.parse(skill.mcpToolConfig) 
        : skill.mcpToolConfig;
    }
  } catch (e) {
    console.error('Failed to parse MCP tool config:', e);
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
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-card, #1e293b)',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="sticky top-0 border-b px-6 py-4 flex items-center justify-between"
          style={{
            backgroundColor: 'var(--bg-card, #1e293b)',
            borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
          }}
        >
          <div className="flex items-center gap-3">
            <h2 
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              {skill.name}
            </h2>
            {skill.isSystemSkill && (
              <span 
                className="px-2 py-1 text-xs rounded border"
                style={{
                  backgroundColor: 'var(--color-info, rgba(59, 130, 246, 0.2))',
                  color: 'var(--color-info, #93c5fd)',
                  borderColor: 'var(--color-info, rgba(59, 130, 246, 0.3))',
                }}
              >
                系统技能
              </span>
            )}
            {isEquipped && (
              <span 
                className="px-2 py-1 text-xs rounded border"
                style={{
                  backgroundColor: 'var(--color-success, rgba(34, 197, 94, 0.2))',
                  color: 'var(--color-success, #86efac)',
                  borderColor: 'var(--color-success, rgba(34, 197, 94, 0.3))',
                }}
              >
                已装备
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-2xl leading-none transition-colors"
            style={{ color: 'var(--text-secondary, #CBD5E1)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary, #CBD5E1)';
            }}
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 基本信息 */}
          <div>
            <h3 
              className="text-sm font-semibold mb-2"
              style={{ color: 'var(--text-secondary, #CBD5E1)' }}
            >
              描述
            </h3>
            <p style={{ color: 'var(--text-primary)' }}>{skill.description || '暂无描述'}</p>
          </div>

          {/* 元数据 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skill.category && (
              <div>
                <div 
                  className="text-xs mb-1"
                  style={{ color: 'var(--text-secondary, #CBD5E1)' }}
                >
                  分类
                </div>
                <div 
                  className="font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {skill.category}
                </div>
              </div>
            )}
            {skill.skillType && (
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>类型</div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.skillType}</div>
              </div>
            )}
            {skill.executionType && (
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>执行类型</div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{skill.executionType}</div>
              </div>
            )}
            {skill.version && (
              <div>
                <div className="text-xs mb-1" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>版本</div>
                <div className="font-medium" style={{ color: 'var(--text-primary)' }}>v{skill.version}</div>
              </div>
            )}
          </div>

          {/* 装备状态 */}
          {isEquipped && binding && (
            <div 
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
                borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
              }}
            >
              <h3 
                className="text-sm font-semibold mb-3"
                style={{ color: 'var(--text-secondary, #CBD5E1)' }}
              >
                装备状态
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div 
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-secondary, #CBD5E1)' }}
                  >
                    启用状态
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ 
                      color: binding.isEnabled 
                        ? 'var(--color-success, #86efac)' 
                        : 'var(--color-error, #fca5a5)' 
                    }}
                  >
                    {binding.isEnabled ? '已启用' : '已禁用'}
                  </div>
                </div>
                <div>
                  <div 
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-secondary, #CBD5E1)' }}
                  >
                    自动触发
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ 
                      color: binding.autoTrigger 
                        ? 'var(--color-warning, #fcd34d)' 
                        : 'var(--text-secondary, #CBD5E1)' 
                    }}
                  >
                    {binding.autoTrigger ? '是' : '否'}
                  </div>
                </div>
                <div>
                  <div 
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-secondary, #CBD5E1)' }}
                  >
                    优先级
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {binding.priority}
                  </div>
                </div>
                <div>
                  <div 
                    className="text-xs mb-1"
                    style={{ color: 'var(--text-secondary, #CBD5E1)' }}
                  >
                    使用次数
                  </div>
                  <div 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {binding.usageCount || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MCP 工具配置 */}
          {mcpToolConfig && (
            <div>
              <h3 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text-secondary, #CBD5E1)' }}
              >
                MCP 工具配置
              </h3>
              <div 
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
                  borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
                }}
              >
                <pre 
                  className="text-xs overflow-x-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {JSON.stringify(mcpToolConfig, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 执行配置 */}
          {executionConfig && (
            <div>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary, #CBD5E1)' }}>执行配置</h3>
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-color-overlay)',
                }}
              >
                <pre
                  className="text-xs overflow-x-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {JSON.stringify(executionConfig, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* 自动触发关键词 */}
          {skill.autoTriggerKeywords && (
            <div>
              <h3 
                className="text-sm font-semibold mb-2"
                style={{ color: 'var(--text-secondary, #CBD5E1)' }}
              >
                自动触发关键词
              </h3>
              <div className="flex flex-wrap gap-2">
                {skill.autoTriggerKeywords.split(',').map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 text-xs rounded border"
                    style={{
                      backgroundColor: 'var(--color-primary, rgba(79, 70, 229, 0.2))',
                      color: 'var(--color-primary, #818cf8)',
                      borderColor: 'var(--color-primary, rgba(79, 70, 229, 0.3))',
                    }}
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
              <div 
                className="text-xs mb-1"
                style={{ color: 'var(--text-secondary, #CBD5E1)' }}
              >
                作者
              </div>
              <div style={{ color: 'var(--text-primary)' }}>{skill.author}</div>
            </div>
          )}
        </div>

        {/* 底部操作按钮 */}
        <div 
          className="sticky bottom-0 border-t px-6 py-4 flex items-center justify-end gap-3"
          style={{
            backgroundColor: 'var(--bg-card, #1e293b)',
            borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors"
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
            关闭
          </button>
          {isEquipped ? (
            <>
              {onToggle && (
                <button
                  onClick={onToggle}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{
                    backgroundColor: binding?.isEnabled
                      ? 'var(--color-warning, #ca8a04)'
                      : 'var(--color-success, #16a34a)',
                    color: 'var(--text-primary)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = binding?.isEnabled
                      ? 'var(--color-warning-light, #a16207)'
                      : 'var(--color-success-light, #15803d)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = binding?.isEnabled
                      ? 'var(--color-warning, #ca8a04)'
                      : 'var(--color-success, #16a34a)';
                  }}
                >
                  {binding?.isEnabled ? '禁用' : '启用'}
                </button>
              )}
              {onUnequip && (
                <button
                  onClick={onUnequip}
                  className="px-4 py-2 rounded-lg transition-colors"
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
                onClick={onEquip}
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
