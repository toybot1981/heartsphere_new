import { request } from '../request';

// 工具配置类型定义
export interface ToolConfig {
  id?: number;
  toolName: string;
  description?: string;
  category?: string;
  promptTemplateCategory?: string;
  instructionTemplate?: string;
  scriptTemplate?: string;
  parametersSchema?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToolListResponse {
  tools: ToolConfig[];
  total: number;
}

export interface ToolTestRequest {
  parameters: Record<string, any>;
}

export interface ToolTestResponse {
  toolName: string;
  parameters: Record<string, any>;
  result?: any;
  success: boolean;
  message?: string;
  error?: string;
}

// 工具管理 API
export const toolApi = {
  // 获取工具列表
  getTools: async (
    params?: {
      category?: string;
      keyword?: string;
    },
    token?: string | null
  ): Promise<ToolListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.keyword) queryParams.append('keyword', params.keyword);
    
    const url = `/mentis/tools${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return await request<ToolListResponse>(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // 获取工具详情
  getTool: async (toolName: string, token?: string | null): Promise<ToolConfig> => {
    return await request<ToolConfig>(`/mentis/tools/${encodeURIComponent(toolName)}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // 更新工具配置
  updateToolConfig: async (
    toolName: string,
    config: ToolConfig,
    token?: string | null
  ): Promise<ToolConfig> => {
    return await request<ToolConfig>(`/mentis/tools/${encodeURIComponent(toolName)}/config`, {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // 初始化工具配置
  initializeToolConfigs: async (token?: string | null): Promise<{ message: string; status: string }> => {
    return await request<{ message: string; status: string }>('/mentis/tools/init', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
  },

  // 测试工具执行
  testTool: async (
    toolName: string,
    request: ToolTestRequest,
    token?: string | null
  ): Promise<ToolTestResponse> => {
    return await request<ToolTestResponse>(
      `/mentis/tools/${encodeURIComponent(toolName)}/test`,
      {
        method: 'POST',
        body: JSON.stringify(request),
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );
  },
};
