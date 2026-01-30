/**
 * 技能-记忆关联视图组件
 * 显示影响技能决策的内存和技能-记忆的双向关联
 */
import React from 'react';
import { SkillExecutionRecord } from '../../types/skill';
import './SkillMemoryCorrelationView.css';

interface SkillMemoryCorrelationViewProps {
  record: SkillExecutionRecord;
  onMemoryClick?: (memoryId: number) => void;
  onSkillClick?: (skillId: number) => void;
}

export const SkillMemoryCorrelationView: React.FC<SkillMemoryCorrelationViewProps> = ({
  record,
  onMemoryClick,
  onSkillClick,
}) => {
  const relatedMemoryIds = record.relatedMemoryIds || [];

  if (relatedMemoryIds.length === 0) {
    return (
      <div className="skill-memory-correlation">
        <div className="skill-memory-correlation__empty">
          此技能执行未关联任何记忆
        </div>
      </div>
    );
  }

  return (
    <div className="skill-memory-correlation">
      <div className="skill-memory-correlation__header">
        <h4>相关记忆 ({relatedMemoryIds.length})</h4>
        <span className="skill-memory-correlation__subtitle">
          这些记忆影响了技能的选择和应用
        </span>
      </div>

      <div className="skill-memory-correlation__list">
        {relatedMemoryIds.map((memoryId) => (
          <div
            key={memoryId}
            className="skill-memory-correlation__item"
            onClick={() => onMemoryClick?.(memoryId)}
          >
            <div className="skill-memory-correlation__item-icon">🧠</div>
            <div className="skill-memory-correlation__item-content">
              <div className="skill-memory-correlation__item-title">
                记忆 #{memoryId}
              </div>
              <div className="skill-memory-correlation__item-hint">
                点击查看记忆详情
              </div>
            </div>
            <div className="skill-memory-correlation__item-arrow">→</div>
          </div>
        ))}
      </div>

      {record.memoryScore !== undefined && (
        <div className="skill-memory-correlation__score">
          <span className="skill-memory-correlation__score-label">记忆得分:</span>
          <span className="skill-memory-correlation__score-value">{record.memoryScore}</span>
        </div>
      )}
    </div>
  );
};
