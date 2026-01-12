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
    console.log('[SkillEquipDialog] 确认装备:', {
      skillId: skill.skillId,
      isEnabled,
      autoTrigger,
      priority,
    });
    onConfirm({
      isEnabled,
      autoTrigger,
      priority,
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl border border-slate-700 max-w-lg w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">装备技能: {skill.name}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* 内容 */}
        <div className="p-6 space-y-6">
          {/* 技能信息 */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <p className="text-slate-300 text-sm mb-2">{skill.description || '暂无描述'}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
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
                className="mt-1 w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <div className="flex-1">
                <label htmlFor="isEnabled" className="block text-white font-medium cursor-pointer">
                  启用技能
                </label>
                <p className="text-sm text-slate-400 mt-1">技能启用后才能在对话中使用</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="autoTrigger"
                checked={autoTrigger}
                onChange={(e) => setAutoTrigger(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 bg-slate-700 border-slate-600 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <div className="flex-1">
                <label htmlFor="autoTrigger" className="block text-white font-medium cursor-pointer">
                  自动触发
                </label>
                <p className="text-sm text-slate-400 mt-1">AI 检测到相关关键词时自动使用该技能</p>
              </div>
            </div>

            <div>
              <label htmlFor="priority" className="block text-white font-medium mb-2">
                优先级
              </label>
              <input
                type="number"
                id="priority"
                min="0"
                max="100"
                value={priority}
                onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-sm text-slate-400 mt-1">优先级越高，在多个技能可用时越优先使用（0-100）</p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            确认装备
          </button>
        </div>
      </div>
    </div>
  );
};
