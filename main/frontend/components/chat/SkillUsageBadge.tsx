/**
 * 技能使用标记组件
 * 显示在 AI 响应中使用的技能
 */
import React, { useState } from 'react';
import { SkillExecutionRecord } from '../../types/skill';
import './SkillUsageBadge.css';

interface SkillUsageBadgeProps {
  skillId: number;
  skillName?: string;
  score?: number;
  onViewDetails?: (skillId: number) => void;
}

export const SkillUsageBadge: React.FC<SkillUsageBadgeProps> = ({
  skillId,
  skillName,
  score,
  onViewDetails,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const displayName = skillName || `技能 #${skillId}`;

  return (
    <span
      className="skill-usage-badge"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={() => onViewDetails?.(skillId)}
    >
      <span className="skill-usage-badge__icon">🛠️</span>
      <span className="skill-usage-badge__name">{displayName}</span>
      {score !== undefined && (
        <span className="skill-usage-badge__score">{score}</span>
      )}
      
      {showTooltip && (
        <div className="skill-usage-badge__tooltip">
          <div className="skill-usage-badge__tooltip-title">{displayName}</div>
          {score !== undefined && (
            <div className="skill-usage-badge__tooltip-score">
              得分: {score}
            </div>
          )}
          <div className="skill-usage-badge__tooltip-explanation">
            此技能被选中是因为与当前对话内容高度相关
          </div>
          <div className="skill-usage-badge__tooltip-hint">
            点击查看详情
          </div>
        </div>
      )}
    </span>
  );
};

/**
 * 技能使用标记列表组件
 * 显示多个技能标记
 */
interface SkillUsageBadgesProps {
  skills: Array<{
    skillId: number;
    skillName?: string;
    score?: number;
  }>;
  onViewDetails?: (skillId: number) => void;
}

export const SkillUsageBadges: React.FC<SkillUsageBadgesProps> = ({
  skills,
  onViewDetails,
}) => {
  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="skill-usage-badges">
      {skills.map((skill, index) => (
        <SkillUsageBadge
          key={skill.skillId || index}
          skillId={skill.skillId}
          skillName={skill.skillName}
          score={skill.score}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};
