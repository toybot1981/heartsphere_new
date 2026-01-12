/**
 * 工具调用监控组件 - 类型定义和简化实现
 */

import React from 'react';

export interface ToolCall {
  id: string;
  sessionId: string;
  toolName: string;
  parameters?: string;
  result?: string;
  status: 'SUCCESS' | 'ERROR' | 'RUNNING' | 'PENDING';
  startTime: string;
  endTime?: string;
  duration?: number;
  errorMessage?: string;
}

/**
 * 工具调用监控组件（简化版）
 * 用于在 admin 前端展示工具调用信息
 */
export const ToolCallMonitor: React.FC<{ toolCalls: ToolCall[] }> = ({ toolCalls }) => {
  return (
    <div className="tool-call-monitor">
      {toolCalls.map(call => (
        <div key={call.id} className="tool-call-item">
          <div>{call.toolName}</div>
          <div>{call.status}</div>
        </div>
      ))}
    </div>
  );
};
