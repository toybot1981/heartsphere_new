import React, { useState, useEffect } from 'react';
import { SkillDefinition } from '../../services/skill/SkillService';

interface SkillEquipDialogProps {
  skill: SkillDefinition;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (options: {
    isEnabled: boolean;
    autoTrigger: boolean;
    priority: number;
  }) => void;
  initialOptions?: {
    isEnabled: boolean;
    autoTrigger: boolean;
    priority: number;
  };
}

/**
 * 技能装备对话框组件 - 优化版
 */
export const SkillEquipDialog: React.FC<SkillEquipDialogProps> = ({
  skill,
  isOpen,
  onClose,
  onConfirm,
  initialOptions,
}) => {
  const [isEnabled, setIsEnabled] = useState(initialOptions?.isEnabled ?? true);
  const [autoTrigger, setAutoTrigger] = useState(initialOptions?.autoTrigger ?? false);
  const [priority, setPriority] = useState(initialOptions?.priority ?? 0);

  // 当对话框打开时重置状态
  useEffect(() => {
    if (isOpen) {
      setIsEnabled(initialOptions?.isEnabled ?? true);
      setAutoTrigger(initialOptions?.autoTrigger ?? false);
      setPriority(initialOptions?.priority ?? 0);
    }
  }, [isOpen, initialOptions]);

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm({
      isEnabled,
      autoTrigger,
      priority,
    });
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--bg-overlay, rgba(0, 0, 0, 0.6))' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl max-w-lg w-full shadow-xl"
        style={{
          backgroundColor: 'var(--bg-card, #1e293b)',
          borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
        >
          <h2 
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            装备技能: {skill.name}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl leading-none transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 技能信息 */}
          <div 
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: 'var(--bg-overlay, rgba(15, 23, 42, 0.5))',
              borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))',
            }}
          >
            <p 
              className="text-sm mb-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {skill.description || '暂无描述'}
            </p>
            <div 
              className="flex items-center gap-3 text-xs"
              style={{ color: 'var(--text-disabled)' }}
            >
              {skill.category && (
                <span>分类: {skill.category}</span>
              )}
              {skill.version && (
                <span>版本: {skill.version}</span>
              )}
            </div>
          </div>

          {/* 装备选项 */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="isEnabled"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="mt-1 w-4 h-4 rounded focus:ring-2"
                style={{
                  accentColor: 'var(--color-primary, #4f46e5)',
                  backgroundColor: 'var(--bg-secondary, #374151)',
                  borderColor: 'var(--bg-overlay, #475569)',
                }}
              />
              <div className="flex-1">
                <label 
                  htmlFor="isEnabled" 
                  className="block font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  启用技能
                </label>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  技能启用后才能在对话中使用
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="autoTrigger"
                checked={autoTrigger}
                onChange={(e) => setAutoTrigger(e.target.checked)}
                className="mt-1 w-4 h-4 rounded focus:ring-2"
                style={{
                  accentColor: 'var(--color-primary, #4f46e5)',
                  backgroundColor: 'var(--bg-secondary, #374151)',
                  borderColor: 'var(--bg-overlay, #475569)',
                }}
              />
              <div className="flex-1">
                <label 
                  htmlFor="autoTrigger" 
                  className="block font-medium cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  自动触发
                </label>
                <p 
                  className="text-sm mt-1"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  AI 检测到相关关键词时自动使用该技能
                </p>
              </div>
            </div>

            <div>
              <label 
                htmlFor="priority" 
                className="block font-medium mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                优先级
              </label>
              <input
                type="number"
                id="priority"
                min="0"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none"
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
              <p 
                className="text-sm mt-1"
                style={{ color: 'var(--text-tertiary)' }}
              >
                优先级越高，在多个技能可用时越优先使用（0-100）
              </p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div 
          className="px-6 py-4 border-t flex items-center justify-end gap-3"
          style={{ borderColor: 'var(--bg-overlay, rgba(55, 65, 81, 1))' }}
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
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-lg transition-colors font-medium"
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
            确认装备
          </button>
        </div>
      </div>
    </div>
  );
};
