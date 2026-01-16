import { request } from '../request';

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
    return await request<McpConfigDTO[]>('/mentis/mcp/configs');
  },

  // 获取单个 MCP 配置
  getConfig: async (id: number): Promise<McpConfigDTO> => {
    return await request<McpConfigDTO>(`/mentis/mcp/configs/${id}`);
  },

  // 创建 MCP 配置
  createConfig: async (config: McpConfigDTO): Promise<McpConfigDTO> => {
    return await request<McpConfigDTO>('/mentis/mcp/configs', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  // 更新 MCP 配置
  updateConfig: async (id: number, config: McpConfigDTO): Promise<McpConfigDTO> => {
    return await request<McpConfigDTO>(`/mentis/mcp/configs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  },

  // 删除 MCP 配置
  deleteConfig: async (id: number): Promise<void> => {
    await request<void>(`/mentis/mcp/configs/${id}`, {
      method: 'DELETE',
    });
  },

  // 测试 MCP 连接
  testConnection: async (id: number): Promise<{ success: boolean }> => {
    return await request<{ success: boolean }>(`/mentis/mcp/configs/${id}/test`, {
      method: 'POST',
    });
  },

  // 获取 MCP 工具列表
  getTools: async (id: number): Promise<any[]> => {
    return await request<any[]>(`/mentis/mcp/configs/${id}/tools`);
  },

  // 调用 MCP 工具进行测试
  callTool: async (id: number, toolName: string, args: Record<string, any>): Promise<any> => {
    return await request<any>(`/mentis/mcp/configs/${id}/tools/${toolName}/call`, {
      method: 'POST',
      body: JSON.stringify({ arguments: args }),
    });
  },
};

// Agent 管理 API
export const mentisAgentApi = {
  // 获取可用的 agent 列表
  getAvailableAgents: async (): Promise<AgentRoleDTO[]> => {
    return await request<AgentRoleDTO[]>('/mentis/agents/available');
  },

  // 获取已配置的 agent 列表
  getConfiguredAgents: async (): Promise<MentisAgentConfigDTO[]> => {
    return await request<MentisAgentConfigDTO[]>('/mentis/agents/configured');
  },

  // 配置 agent
  configureAgent: async (agentId: number, configuration: Record<string, any>): Promise<MentisAgentConfigDTO> => {
    return await request<MentisAgentConfigDTO>('/mentis/agents/configure', {
      method: 'POST',
      body: JSON.stringify({
        agentId,
        configuration,
      }),
    });
  },

  // 移除 agent 配置
  removeAgentConfig: async (id: number): Promise<void> => {
    await request<void>(`/mentis/agents/${id}`, {
      method: 'DELETE',
    });
  },

  // 获取 agent 能力详情
  getAgentCapabilities: async (id: number): Promise<Record<string, any>> => {
    return await request<Record<string, any>>(`/mentis/agents/${id}/capabilities`);
  },

  // 启用/禁用 agent
  toggleAgent: async (id: number, enabled: boolean): Promise<void> => {
    await request<void>(`/mentis/agents/${id}/toggle`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  },
};
