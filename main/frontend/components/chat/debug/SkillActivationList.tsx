/**
 * 技能激活列表组件
 * 显示技能执行记录的列表
 */
import React from 'react';
import { SkillExecutionRecord } from '../../../types/skill';
import './SkillDebugPanel.css';

interface SkillActivationListProps {
  records: SkillExecutionRecord[];
  onSelectRecord: (record: SkillExecutionRecord) => void;
  selectedRecordId?: number;
  expandedItems?: Set<number>;
  onToggleExpand?: (recordId: number) => void;
}

export const SkillActivationList: React.FC<SkillActivationListProps> = ({
  records,
  onSelectRecord,
  selectedRecordId,
  expandedItems = new Set(),
  onToggleExpand,
}) => {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; className: string }> = {
      PENDING: { text: '等待中', className: 'skill-status--pending' },
      EXECUTING: { text: '执行中', className: 'skill-status--executing' },
      COMPLETED: { text: '已完成', className: 'skill-status--completed' },
      FAILED: { text: '失败', className: 'skill-status--failed' },
    };
    const statusInfo = statusMap[status] || { text: status, className: '' };
    return (
      <span className={`skill-status ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getDecisionBadge = (decision: string) => {
    return decision === 'APPLIED' ? (
      <span className="skill-decision skill-decision--applied">✓ 已应用</span>
    ) : (
      <span className="skill-decision skill-decision--rejected">✗ 已拒绝</span>
    );
  };

  return (
    <div className="skill-activation-list">
      {records.map((record) => (
        <div
          key={record.id}
          className={`skill-activation-item ${
            selectedRecordId === record.id ? 'selected' : ''
          } ${expandedItems.has(record.id) ? 'expanded' : ''}`}
          onClick={() => {
            if (onToggleExpand) {
              onToggleExpand(record.id);
            }
            onSelectRecord(record);
          }}
        >
          <div className="skill-activation-item__header">
            <div className="skill-activation-item__title">
              <span className="skill-activation-item__skill-name">
                {record.skillName || `技能 #${record.skillId}`}
              </span>
              {getDecisionBadge(record.decision)}
            </div>
            <div className="skill-activation-item__meta">
              {getStatusBadge(record.executionStatus)}
              {record.compositeScore !== undefined && (
                <span className="skill-activation-item__score">
                  得分: {record.compositeScore}
                </span>
              )}
            </div>
          </div>

          {record.evaluationTimestamp && (
            <div className="skill-activation-item__time">
              {new Date(record.evaluationTimestamp).toLocaleString()}
            </div>
          )}

          {record.rejectionReason && (
            <div className="skill-activation-item__reason">
              拒绝原因: {record.rejectionReason}
            </div>
          )}

          {record.errorMessage && (
            <div className="skill-activation-item__error">
              错误: {record.errorMessage}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
