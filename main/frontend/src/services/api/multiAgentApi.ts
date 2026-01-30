/**
 * 多智能体协作 API 服务
 */

import { apiClient } from './base/apiClient';

export interface CollaborationRequest {
  request: string;
  sessionId?: string;
}

export interface CollaborationStatus {
  collaborationId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
}

export interface CollaborationResult {
  collaborationId: string;
  success: boolean;
  result: string;
  agentResults: Record<string, any>;
  errors: string[];
}

export interface AgentExecutionStatus {
  agentId: string;
  agentName: string;
  status: 'IDLE' | 'BUSY' | 'COMPLETED' | 'ERROR';
  result?: string;
  error?: string;
}

/**
 * 多智能体协作 API
 */
export const multiAgentApi = {
  /**
   * 创建协作请求
   */
  async collaborate(request: CollaborationRequest): Promise<{ collaborationId: string; status: string; message: string }> {
    const response = await apiClient.post('/api/multi-agent/collaborate', request);
    return response.data;
  },

  /**
   * 获取协作状态
   */
  async getStatus(collaborationId: string): Promise<CollaborationStatus> {
    const response = await apiClient.get(`/api/multi-agent/collaboration/${collaborationId}/status`);
    return response.data;
  },

  /**
   * 执行协作（获取结果）
   */
  async execute(collaborationId: string): Promise<CollaborationResult> {
    const response = await apiClient.post(`/api/multi-agent/collaboration/${collaborationId}/execute`);
    return response.data;
  },

  /**
   * 取消协作
   */
  async cancel(collaborationId: string): Promise<{ collaborationId: string; status: string; message: string }> {
    const response = await apiClient.delete(`/api/multi-agent/collaboration/${collaborationId}`);
    return response.data;
  },
};
