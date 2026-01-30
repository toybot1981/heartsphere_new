import { request } from '../request';

// ========== 类型定义 ==========

/**
 * 多智能体协作 DTO
 */
export interface MultiAgentCollaborationDTO {
  collaborationId: string;
  userId?: string;
  sessionId?: string;
  taskDescription?: string;
  agentIds?: string[];
  status?: string;
  workflowMode?: string;
  startedAt?: string;
  completedAt?: string;
  executionTimeMs?: number;
  result?: string;
  agentResults?: Record<string, any>;
  errors?: string[];
  success?: boolean;
  createdAt?: string;
  notes?: string;
}

/**
 * 多智能体协作统计 DTO
 */
export interface MultiAgentCollaborationStatisticsDTO {
  totalCollaborations?: number;
  successfulCollaborations?: number;
  failedCollaborations?: number;
  inProgressCollaborations?: number;
  averageExecutionTimeMs?: number;
  successRate?: number;
  collaborationsByPeriod?: Array<{
    period: string;
    count: number;
    successCount: number;
  }>;
  topAgents?: Array<{
    agentId: string;
    agentName?: string;
    callCount: number;
    successCount: number;
    successRate: number;
  }>;
}

/**
 * 多智能体 Agent DTO
 */
export interface MultiAgentAgentDTO {
  agentId: string;
  name?: string;
  description?: string;
  capabilities?: string[];
  status?: string; // IDLE, BUSY, ERROR
  lastExecutionTime?: string;
  totalExecutions?: number;
  successfulExecutions?: number;
  successRate?: number;
  averageResponseTimeMs?: number;
  enabled?: boolean;
}

/**
 * 多智能体 Agent 性能指标 DTO
 */
export interface MultiAgentAgentMetricsDTO {
  agentId: string;
  agentName?: string;
  totalCalls?: number;
  successfulCalls?: number;
  failedCalls?: number;
  successRate?: number;
  averageResponseTimeMs?: number;
  minResponseTimeMs?: number;
  maxResponseTimeMs?: number;
  period?: {
    startTime?: string;
    endTime?: string;
  };
}

/**
 * 多智能体路由配置 DTO
 */
export interface MultiAgentRoutingConfigDTO {
  keywordToCapabilities?: Record<string, string[]>;
  agentPriorities?: Record<string, number>;
  decompositionRules?: Array<Record<string, any>>;
  routingParameters?: Record<string, any>;
}

/**
 * 多智能体系统配置 DTO
 */
export interface MultiAgentSystemConfigDTO {
  collaborationTimeoutSeconds?: number;
  maxRetryCount?: number;
  maxConcurrentCollaborations?: number;
  logLevel?: string; // DEBUG, INFO, WARN, ERROR
  agentScopeConfig?: {
    enabled?: boolean;
    modelName?: string;
    maxIters?: number;
    stream?: boolean;
  };
}

// ========== API 服务 ==========

export const multiAgentApi = {
  // ========== 协作管理 ==========
  
  /**
   * 获取协作列表
   */
  getCollaborations: async (
    page: number = 0,
    size: number = 20,
    status?: string,
    userId?: string,
    startTime?: string,
    endTime?: string
  ) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    
    return request<{
      content: MultiAgentCollaborationDTO[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`/multi-agent/collaborations?${params.toString()}`, {
      method: 'GET',
    });
  },
  
  /**
   * 获取协作详情
   */
  getCollaborationById: async (collaborationId: string) => {
    return request<MultiAgentCollaborationDTO>(
      `/multi-agent/collaborations/${collaborationId}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 取消协作
   */
  cancelCollaboration: async (collaborationId: string) => {
    return request<void>(
      `/multi-agent/collaborations/${collaborationId}/cancel`,
      { method: 'POST' }
    );
  },
  
  /**
   * 获取协作统计
   */
  getCollaborationStatistics: async (startTime?: string, endTime?: string) => {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    
    return request<MultiAgentCollaborationStatisticsDTO>(
      `/multi-agent/collaborations/statistics?${params.toString()}`,
      { method: 'GET' }
    );
  },
  
  // ========== 智能体管理 ==========
  
  /**
   * 获取所有智能体
   */
  getAllAgents: async () => {
    return request<MultiAgentAgentDTO[]>(
      '/multi-agent/agents',
      { method: 'GET' }
    );
  },
  
  /**
   * 获取智能体详情
   */
  getAgentById: async (agentId: string) => {
    return request<MultiAgentAgentDTO>(
      `/multi-agent/agents/${agentId}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 获取智能体性能指标
   */
  getAgentMetrics: async (agentId: string, startTime?: string, endTime?: string) => {
    const params = new URLSearchParams();
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    
    return request<MultiAgentAgentMetricsDTO>(
      `/multi-agent/agents/${agentId}/metrics?${params.toString()}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 获取智能体执行历史
   */
  getAgentHistory: async (agentId: string, page: number = 0, size: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    return request<{
      content: MultiAgentCollaborationDTO[];
      totalElements: number;
      totalPages: number;
    }>(
      `/multi-agent/agents/${agentId}/history?${params.toString()}`,
      { method: 'GET' }
    );
  },
  
  // ========== 路由配置 ==========
  
  /**
   * 获取路由配置
   */
  getRoutingConfig: async () => {
    return request<MultiAgentRoutingConfigDTO>(
      '/multi-agent/routing/config',
      { method: 'GET' }
    );
  },
  
  /**
   * 更新路由配置
   */
  updateRoutingConfig: async (config: MultiAgentRoutingConfigDTO) => {
    return request<MultiAgentRoutingConfigDTO>(
      '/multi-agent/routing/config',
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
  },
  
  /**
   * 测试路由策略
   */
  testRoutingStrategy: async (task: string) => {
    return request<{
      selectedAgents: string[];
      decompositionResult: Array<{
        taskId: string;
        description: string;
        assignedAgentId?: string;
      }>;
    }>(
      '/multi-agent/routing/test',
      {
        method: 'POST',
        body: JSON.stringify({ task }),
      }
    );
  },
  
  // ========== 系统配置 ==========
  
  /**
   * 获取系统配置
   */
  getSystemConfig: async () => {
    return request<MultiAgentSystemConfigDTO>(
      '/multi-agent/config',
      { method: 'GET' }
    );
  },
  
  /**
   * 更新系统配置
   */
  updateSystemConfig: async (config: MultiAgentSystemConfigDTO) => {
    return request<void>(
      '/multi-agent/config',
      {
        method: 'PUT',
        body: JSON.stringify(config),
      }
    );
  },
  
  // ========== 日志管理 ==========
  
  /**
   * 获取日志列表
   */
  getLogs: async (
    page: number = 0,
    size: number = 20,
    status?: string,
    userId?: string,
    agentId?: string,
    startTime?: string,
    endTime?: string
  ) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (status) params.append('status', status);
    if (userId) params.append('userId', userId);
    if (agentId) params.append('agentId', agentId);
    if (startTime) params.append('startTime', startTime);
    if (endTime) params.append('endTime', endTime);
    
    return request<{
      content: MultiAgentCollaborationDTO[];
      totalElements: number;
      totalPages: number;
    }>(
      `/multi-agent/logs?${params.toString()}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 获取错误日志
   */
  getErrorLogs: async (page: number = 0, size: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    
    return request<{
      content: MultiAgentCollaborationDTO[];
      totalElements: number;
      totalPages: number;
    }>(
      `/multi-agent/logs/errors?${params.toString()}`,
      { method: 'GET' }
    );
  },
};
