import { request } from '../request';

// 类型定义
export interface AgentIdentityDTO {
  id?: number;
  characterId: number;
  characterName?: string;
  characterRole?: string;
  characterBio?: string;
  identityData?: Record<string, any>;
  capabilities?: Array<Record<string, any>>;
  limitations?: Array<Record<string, any>>;
  selfAwarenessLevel?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AgentStateHistoryDTO {
  id?: number;
  characterId: number;
  characterName?: string;
  stateType: string;
  stateDescription?: string;
  durationMs?: number;
  transitionReason?: string;
  relatedSessionId?: number;
  createdAt?: string;
}

export interface AgentStateStatisticsDTO {
  characterId: number;
  characterName?: string;
  stateTypeCounts?: Array<{ stateType: string; count: number }>;
  stateTypeAvgDurations?: Array<{ stateType: string; avgDurationMs: number }>;
  totalRecords?: number;
  earliestStateTime?: string;
  latestStateTime?: string;
}

// Agent Mind 管理 API
export const agentMindApi = {
  // ========== 身份认知管理 ==========
  
  /**
   * 获取智能体身份认知列表
   */
  getAgentIdentities: async (page: number = 0, size: number = 20, search?: string) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (search) {
      params.append('search', search);
    }
    return request<{
      content: AgentIdentityDTO[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`/agent-mind/identities?${params.toString()}`, {
      method: 'GET',
    });
  },
  
  /**
   * 根据角色ID获取智能体身份认知信息
   */
  getAgentIdentity: async (characterId: number) => {
    return request<AgentIdentityDTO>(
      `/agent-mind/identities/${characterId}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 更新智能体身份认知信息
   */
  updateAgentIdentity: async (characterId: number, dto: Partial<AgentIdentityDTO>) => {
    return request<AgentIdentityDTO>(
      `/agent-mind/identities/${characterId}`,
      {
        method: 'PUT',
        body: JSON.stringify(dto),
      }
    );
  },
  
  /**
   * 初始化智能体身份认知
   */
  initializeAgentIdentity: async (characterId: number) => {
    return request<AgentIdentityDTO>(
      `/agent-mind/identities/${characterId}/initialize`,
      { method: 'POST' }
    );
  },
  
  // ========== 状态监控 ==========
  
  /**
   * 获取智能体当前状态
   */
  getCurrentState: async (characterId: number) => {
    return request<AgentStateHistoryDTO>(
      `/agent-mind/states/${characterId}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 获取智能体状态历史
   */
  getStateHistory: async (characterId: number, page: number = 0, size: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    return request<{
      content: AgentStateHistoryDTO[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>(`/agent-mind/states/${characterId}/history?${params.toString()}`, {
      method: 'GET',
    });
  },
  
  /**
   * 根据时间范围获取状态历史
   */
  getStateHistoryByTimeRange: async (
    characterId: number,
    startTime: string,
    endTime: string
  ) => {
    const params = new URLSearchParams();
    params.append('startTime', startTime);
    params.append('endTime', endTime);
    return request<AgentStateHistoryDTO[]>(
      `/agent-mind/states/${characterId}/history/range?${params.toString()}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 获取智能体状态统计信息
   */
  getStateStatistics: async (characterId: number) => {
    return request<AgentStateStatisticsDTO>(
      `/agent-mind/states/${characterId}/statistics`,
      { method: 'GET' }
    );
  },
  
  // ========== 能力管理 ==========
  
  /**
   * 获取智能体能力列表
   */
  getCapabilities: async (characterId: number) => {
    return request<Array<Record<string, any>>>(
      `/agent-mind/capabilities/${characterId}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 更新智能体能力列表
   */
  updateCapabilities: async (characterId: number, capabilities: Array<Record<string, any>>) => {
    return request<AgentIdentityDTO>(
      `/agent-mind/capabilities/${characterId}`,
      {
        method: 'PUT',
        body: JSON.stringify(capabilities),
      }
    );
  },
  
  /**
   * 获取智能体能力边界
   */
  getLimitations: async (characterId: number) => {
    return request<Array<Record<string, any>>>(
      `/agent-mind/limitations/${characterId}`,
      { method: 'GET' }
    );
  },
  
  /**
   * 更新智能体能力边界
   */
  updateLimitations: async (characterId: number, limitations: Array<Record<string, any>>) => {
    return request<AgentIdentityDTO>(
      `/agent-mind/limitations/${characterId}`,
      {
        method: 'PUT',
        body: JSON.stringify(limitations),
      }
    );
  },
};
