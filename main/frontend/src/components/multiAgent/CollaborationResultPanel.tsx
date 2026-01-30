/**
 * 协作结果面板组件
 * 展示整合后的协作结果
 */

import React from 'react';
import { CollaborationResult } from '../../services/api/multiAgentApi';
import './CollaborationResultPanel.css';

export interface CollaborationResultPanelProps {
  result: CollaborationResult;
  onClose?: () => void;
}

export const CollaborationResultPanel: React.FC<CollaborationResultPanelProps> = ({
  result,
  onClose,
}) => {
  return (
    <div className="collaboration-result-panel">
      <div className="result-panel-header">
        <h3>协作结果</h3>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="result-panel-content">
        {result.success ? (
          <div className="result-success">
            <div className="result-main">
              <h4>整合结果</h4>
              <div className="result-text">{result.result}</div>
            </div>

            {result.agentResults && Object.keys(result.agentResults).length > 0 && (
              <div className="agent-results">
                <h4>各智能体贡献</h4>
                {Object.entries(result.agentResults).map(([agentId, agentResult]) => (
                  <div key={agentId} className="agent-result-item">
                    <div className="agent-result-header">
                      <strong>{getAgentName(agentId)}</strong>
                    </div>
                    <div className="agent-result-content">
                      {typeof agentResult === 'string' ? agentResult : JSON.stringify(agentResult, null, 2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="result-error">
            <h4>协作失败</h4>
            {result.errors && result.errors.length > 0 && (
              <ul>
                {result.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const getAgentName = (agentId: string): string => {
  const nameMap: Record<string, string> = {
    'shixiaoguang': '时小光',
    'kangxiaojian': '康小健',
    'xuexiaozhi': '学小知',
    'xinxiaonuan': '心小暖',
    'xinxiaoan': '心小安',
    'nuanxiaoyang': '暖小阳',
  };
  return nameMap[agentId] || agentId;
};
