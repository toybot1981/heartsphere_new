// Graph流程编辑器API
import { request } from "../request";
import type { GraphDefinition, GraphNode, GraphDefinitionCreateRequest } from './graphTypes';
import type { GraphExecutionRequest, GraphExecutionDTO, GraphExecutionChoiceRequest } from './graphExecutionTypes';
import type { ExecutionLogDTO } from './graphExecutionLogTypes';

/**
 * Graph流程编辑器API（管理员专用）
 */
export const adminGraphApi = {
  /**
   * 获取所有Graph定义
   */
  getAll: (token: string): Promise<GraphDefinition[]> => {
    return request<GraphDefinition[]>('/graph', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 根据ID获取Graph定义（包含节点和边）
   */
  getById: (id: number, token: string): Promise<GraphDefinition> => {
    return request<GraphDefinition>(`/graph/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 创建Graph定义
   */
  create: (data: GraphDefinitionCreateRequest, token: string): Promise<GraphDefinition> => {
    return request<GraphDefinition>('/graph', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 更新Graph定义
   */
  update: (id: number, data: GraphDefinitionCreateRequest, token: string): Promise<GraphDefinition> => {
    return request<GraphDefinition>(`/graph/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 删除Graph定义
   */
  delete: (id: number, token: string): Promise<void> => {
    return request<void>(`/graph/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 执行Graph
   */
  execute: (id: number, executionRequest: GraphExecutionRequest, token: string): Promise<GraphExecutionDTO> => {
    return request<GraphExecutionDTO>(`/graph/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify(executionRequest),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * 获取执行状态
   */
  getExecutionStatus: (graphId: number, executionId: string, token: string): Promise<GraphExecutionDTO> => {
    return request<GraphExecutionDTO>(`/graph/${graphId}/execution/${executionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 获取执行日志
   */
  getExecutionLogs: (executionId: string, token: string, all?: boolean): Promise<ExecutionLogDTO[]> => {
    const url = `/graph/executions/${executionId}/logs${all ? '?all=true' : ''}`;
    return request<ExecutionLogDTO[]>(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 提交用户选择（用于ChoiceNode）
   */
  submitChoice: (graphId: number, executionId: string, choiceRequest: GraphExecutionChoiceRequest, token: string): Promise<GraphExecutionDTO> => {
    return request<GraphExecutionDTO>(`/graph/${graphId}/execution/${executionId}/choice`, {
      method: 'POST',
      body: JSON.stringify(choiceRequest),
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
};
