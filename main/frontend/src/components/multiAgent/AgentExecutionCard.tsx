/**
 * 智能体执行卡片组件
 * 展示单个智能体的执行状态和结果
 */

import React, { useState } from 'react';
import './AgentExecutionCard.css';

export interface AgentExecutionCardProps {
  agentId: string;
  agentName: string;
  status: 'IDLE' | 'BUSY' | 'COMPLETED' | 'ERROR';
  result?: any;
  error?: string;
}

export const AgentExecutionCard: React.FC<AgentExecutionCardProps> = ({
  agentId,
  agentName,
  status,
  result,
  error,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (): string => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'BUSY':
        return '#2196F3';
      case 'ERROR':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (): string => {
    switch (status) {
      case 'COMPLETED':
        return '已完成';
      case 'BUSY':
        return '执行中';
      case 'ERROR':
        return '失败';
      default:
        return '等待中';
    }
  };

  return (
    <div className="agent-execution-card">
      <div
        className="agent-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: result || error ? 'pointer' : 'default' }}
      >
        <div className="agent-info">
          <div className="agent-name">{agentName}</div>
          <div className="agent-id">({agentId})</div>
        </div>
        <div className="agent-status">
          <span
            className="status-dot"
            style={{ backgroundColor: getStatusColor() }}
          />
          <span className="status-text">{getStatusText()}</span>
          {(result || error) && (
            <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
          )}
        </div>
      </div>

      {isExpanded && (result || error) && (
        <div className="agent-card-content">
          {error ? (
            <div className="error-content">
              <strong>错误:</strong>
              <pre>{error}</pre>
            </div>
          ) : (
            <div className="result-content">
              <strong>执行结果:</strong>
              <pre>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
