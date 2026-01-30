/**
 * 协作流程可视化组件
 * 展示参与的智能体和执行步骤
 */

import React, { useState, useEffect } from 'react';
import { multiAgentApi, CollaborationResult } from '../../services/api/multiAgentApi';
import { AgentExecutionCard } from './AgentExecutionCard';
import './CollaborationFlow.css';

export interface CollaborationFlowProps {
  collaborationId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  result: CollaborationResult | null;
}

export const CollaborationFlow: React.FC<CollaborationFlowProps> = ({
  collaborationId,
  status,
  result,
}) => {
  const [agentStatuses, setAgentStatuses] = useState<Record<string, any>>({});

  useEffect(() => {
    if (result && result.agentResults) {
      // 从结果中提取智能体状态
      const statuses: Record<string, any> = {};
      Object.entries(result.agentResults).forEach(([agentId, agentResult]) => {
        statuses[agentId] = {
          agentId,
          agentName: getAgentName(agentId),
          status: 'COMPLETED',
          result: agentResult,
        };
      });
      setAgentStatuses(statuses);
    }
  }, [result]);

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return '#4CAF50';
      case 'RUNNING':
      case 'BUSY':
        return '#2196F3';
      case 'FAILED':
      case 'ERROR':
        return '#F44336';
      case 'PENDING':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return '已完成';
      case 'RUNNING':
      case 'BUSY':
        return '执行中';
      case 'FAILED':
      case 'ERROR':
        return '失败';
      case 'PENDING':
        return '等待中';
      default:
        return '未知';
    }
  };

  return (
    <div className="collaboration-flow">
      <div className="collaboration-flow-header">
        <h3>协作流程</h3>
        <div className="status-badge" style={{ backgroundColor: getStatusColor(status) }}>
          {getStatusText(status)}
        </div>
      </div>

      <div className="collaboration-flow-content">
        {Object.keys(agentStatuses).length === 0 ? (
          <div className="no-agents">
            {status === 'RUNNING' ? '智能体正在协作中...' : '暂无智能体参与'}
          </div>
        ) : (
          <div className="agents-list">
            {Object.values(agentStatuses).map((agentStatus: any) => (
              <AgentExecutionCard
                key={agentStatus.agentId}
                agentId={agentStatus.agentId}
                agentName={agentStatus.agentName}
                status={agentStatus.status}
                result={agentStatus.result}
                error={agentStatus.error}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
