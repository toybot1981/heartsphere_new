import { adminApi } from './index';

// 类型定义
export interface McpConfigDTO {
  id?: number;
  name: string;
  serverType: string;
  serverUrl: string;
  apiKey?: string;
  enabled: boolean;
  description?: string;
  extraConfig?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  lastTestedAt?: string;
  connectionStatus?: string;
  lastError?: string;
}

export interface AgentRoleDTO {
  id: number;
  name: string;
  description?: string;
  age?: number;
  gender?: string;
  role?: string;
  bio?: string;
  avatarUrl?: string;
  systemInstruction?: string;
  tags?: string;
  skills?: string;
  systemEraId?: number;
  eraName?: string;
  isActive?: boolean;
  capabilities?: Record<string, any>;
}

export interface MentisAgentConfigDTO {
  id?: number;
  agentId: number;
  agentName?: string;
  configuration?: Record<string, any>;
  enabled: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// MCP 配置 API
export const mentisMcpApi = {
  // 获取所有 MCP 配置
  getConfigs: async (): Promise<McpConfigDTO[]> => {
    const response = await adminApi.get<{ data: McpConfigDTO[] }>('/api/admin/mentis/mcp/configs');
    return response.data.data;
  },

  // 获取单个 MCP 配置
  getConfig: async (id: number): Promise<McpConfigDTO> => {
    const response = await adminApi.get<{ data: McpConfigDTO }>(`/api/admin/mentis/mcp/configs/${id}`);
    return response.data.data;
  },

  // 创建 MCP 配置
  createConfig: async (config: McpConfigDTO): Promise<McpConfigDTO> => {
    const response = await adminApi.post<{ data: McpConfigDTO }>('/api/admin/mentis/mcp/configs', config);
    return response.data.data;
  },

  // 更新 MCP 配置
  updateConfig: async (id: number, config: McpConfigDTO): Promise<McpConfigDTO> => {
    const response = await adminApi.put<{ data: McpConfigDTO }>(`/api/admin/mentis/mcp/configs/${id}`, config);
    return response.data.data;
  },

  // 删除 MCP 配置
  deleteConfig: async (id: number): Promise<void> => {
    await adminApi.delete(`/api/admin/mentis/mcp/configs/${id}`);
  },

  // 测试 MCP 连接
  testConnection: async (id: number): Promise<{ success: boolean }> => {
    const response = await adminApi.post<{ data: { success: boolean } }>(`/api/admin/mentis/mcp/configs/${id}/test`);
    return response.data.data;
  },

  // 获取 MCP 工具列表
  getTools: async (id: number): Promise<any[]> => {
    const response = await adminApi.get<{ data: any[] }>(`/api/admin/mentis/mcp/configs/${id}/tools`);
    return response.data.data;
  },
};

// Agent 管理 API
export const mentisAgentApi = {
  // 获取可用的 agent 列表
  getAvailableAgents: async (): Promise<AgentRoleDTO[]> => {
    const response = await adminApi.get<{ data: AgentRoleDTO[] }>('/api/admin/mentis/agents/available');
    return response.data.data;
  },

  // 获取已配置的 agent 列表
  getConfiguredAgents: async (): Promise<MentisAgentConfigDTO[]> => {
    const response = await adminApi.get<{ data: MentisAgentConfigDTO[] }>('/api/admin/mentis/agents/configured');
    return response.data.data;
  },

  // 配置 agent
  configureAgent: async (agentId: number, configuration: Record<string, any>): Promise<MentisAgentConfigDTO> => {
    const response = await adminApi.post<{ data: MentisAgentConfigDTO }>('/api/admin/mentis/agents/configure', {
      agentId,
      configuration,
    });
    return response.data.data;
  },

  // 移除 agent 配置
  removeAgentConfig: async (id: number): Promise<void> => {
    await adminApi.delete(`/api/admin/mentis/agents/${id}`);
  },

  // 获取 agent 能力详情
  getAgentCapabilities: async (id: number): Promise<Record<string, any>> => {
    const response = await adminApi.get<{ data: Record<string, any> }>(`/api/admin/mentis/agents/${id}/capabilities`);
    return response.data.data;
  },

  // 启用/禁用 agent
  toggleAgent: async (id: number, enabled: boolean): Promise<void> => {
    await adminApi.put(`/api/admin/mentis/agents/${id}/toggle`, { enabled });
  },
};
