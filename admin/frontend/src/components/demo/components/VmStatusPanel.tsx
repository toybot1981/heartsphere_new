/**
 * VM 状态面板组件 - 类型定义
 */

import React from 'react';

export interface VmStatusInfo {
  vmId: string;
  sessionId: string;
  status: 'RUNNING' | 'IDLE' | 'ERROR' | 'NOT_FOUND';
  createdAt?: string;
  lastHeartbeat?: string;
  cpuUsage?: number;
  memoryUsage?: number;
  diskUsage?: number;
}

/**
 * VM 状态面板组件（简化版）
 * 用于在 admin 前端展示虚拟机状态信息
 */
export const VmStatusPanel: React.FC<{ vmInfo: VmStatusInfo }> = ({ vmInfo }) => {
  return (
    <div className="vm-status-panel">
      <div>VM ID: {vmInfo.vmId}</div>
      <div>状态: {vmInfo.status}</div>
      {vmInfo.cpuUsage !== undefined && <div>CPU: {vmInfo.cpuUsage}%</div>}
      {vmInfo.memoryUsage !== undefined && <div>内存: {vmInfo.memoryUsage}%</div>}
    </div>
  );
};
