import React, { useState } from 'react';
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
 * 技能装备对话框组件
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

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm({
      isEnabled,
      autoTrigger,
      priority,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content skill-equip-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>装备技能: {skill.name}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="skill-info">
            <p className="skill-description">{skill.description}</p>
            {skill.category && (
              <p className="skill-meta">
                <span>分类: {skill.category}</span>
                {skill.version && <span>版本: {skill.version}</span>}
              </p>
            )}
          </div>

          <div className="equip-options">
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
                <span>启用技能</span>
              </label>
              <p className="form-help">技能启用后才能在对话中使用</p>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={autoTrigger}
                  onChange={(e) => setAutoTrigger(e.target.checked)}
                />
                <span>自动触发</span>
              </label>
              <p className="form-help">AI 检测到相关关键词时自动使用该技能</p>
            </div>

            <div className="form-group">
              <label>
                优先级
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
                  className="form-control"
                />
              </label>
              <p className="form-help">优先级越高，在多个技能可用时越优先使用（0-100）</p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary" onClick={handleConfirm}>
            确认装备
          </button>
        </div>
      </div>
    </div>
  );
};
