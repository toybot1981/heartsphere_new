/**
 * 技能激活项详情组件
 * 显示单个技能执行记录的详细信息
 */
import React from 'react';
import { SkillExecutionRecord } from '../../../types/skill';
import { SkillMemoryCorrelationView } from '../SkillMemoryCorrelationView';
import './SkillDebugPanel.css';

interface SkillActivationItemProps {
  record: SkillExecutionRecord;
  onClose: () => void;
}

export const SkillActivationItem: React.FC<SkillActivationItemProps> = ({
  record,
  onClose,
}) => {
  return (
    <div className="skill-activation-detail">
      <div className="skill-activation-detail__header">
        <h4>技能执行详情</h4>
        <button
          className="skill-activation-detail__close-btn"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      <div className="skill-activation-detail__content">
        <div className="skill-activation-detail__section">
          <h5>基本信息</h5>
          <div className="skill-activation-detail__field">
            <label>技能ID:</label>
            <span>{record.skillId}</span>
          </div>
          <div className="skill-activation-detail__field">
            <label>技能名称:</label>
            <span>{record.skillName || '未知'}</span>
          </div>
          <div className="skill-activation-detail__field">
            <label>决策:</label>
            <span className={record.decision === 'APPLIED' ? 'text-success' : 'text-warning'}>
              {record.decision === 'APPLIED' ? '已应用' : '已拒绝'}
            </span>
          </div>
          <div className="skill-activation-detail__field">
            <label>执行状态:</label>
            <span>{record.executionStatus}</span>
          </div>
        </div>

        <div className="skill-activation-detail__section">
          <h5>评分信息</h5>
          {record.semanticScore !== undefined && (
            <div className="skill-activation-detail__field">
              <label>语义得分:</label>
              <span>{record.semanticScore}</span>
            </div>
          )}
          {record.contextScore !== undefined && (
            <div className="skill-activation-detail__field">
              <label>上下文得分:</label>
              <span>{record.contextScore}</span>
            </div>
          )}
          {record.memoryScore !== undefined && (
            <div className="skill-activation-detail__field">
              <label>记忆得分:</label>
              <span>{record.memoryScore}</span>
            </div>
          )}
          {record.compositeScore !== undefined && (
            <div className="skill-activation-detail__field">
              <label>综合得分:</label>
              <span className="text-bold">{record.compositeScore}</span>
            </div>
          )}
        </div>

        {record.keywordMatches && record.keywordMatches.length > 0 && (
          <div className="skill-activation-detail__section">
            <h5>匹配的关键词</h5>
            <div className="skill-activation-detail__keywords">
              {record.keywordMatches.map((keyword, index) => (
                <span key={index} className="skill-keyword-badge">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {record.relatedMemoryIds && record.relatedMemoryIds.length > 0 && (
          <div className="skill-activation-detail__section">
            <SkillMemoryCorrelationView
              record={record}
              onMemoryClick={(memoryId) => {
                console.log('点击记忆ID:', memoryId);
                if ((window as any).onMemoryNavigation) {
                  (window as any).onMemoryNavigation(memoryId);
                }
              }}
            />
          </div>
        )}

        {record.rejectionReason && (
          <div className="skill-activation-detail__section">
            <h5>拒绝原因</h5>
            <p className="text-warning">{record.rejectionReason}</p>
          </div>
        )}

        {record.errorMessage && (
          <div className="skill-activation-detail__section">
            <h5>错误信息</h5>
            <p className="text-error">{record.errorMessage}</p>
          </div>
        )}

        {record.executionResult && (
          <div className="skill-activation-detail__section">
            <h5>执行结果</h5>
            <pre className="skill-activation-detail__result">
              {JSON.stringify(record.executionResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="skill-activation-detail__section">
          <h5>时间信息</h5>
          {record.evaluationTimestamp && (
            <div className="skill-activation-detail__field">
              <label>评估时间:</label>
              <span>{new Date(record.evaluationTimestamp).toLocaleString()}</span>
            </div>
          )}
          {record.executionTimestamp && (
            <div className="skill-activation-detail__field">
              <label>执行时间:</label>
              <span>{new Date(record.executionTimestamp).toLocaleString()}</span>
            </div>
          )}
          {record.executionDurationMs !== undefined && (
            <div className="skill-activation-detail__field">
              <label>执行耗时:</label>
              <span>{record.executionDurationMs}ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
