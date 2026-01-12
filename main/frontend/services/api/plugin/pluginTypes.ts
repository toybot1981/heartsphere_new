// 插件类型定义
// 基于后端 PluginDTO、PluginListRequest、PluginListResponse

export interface Plugin {
  pluginId: string;
  name: string;
  description?: string;
  category?: string;
  version?: string;
  author?: string;
  icon?: string;
  status?: string;
  publishStatus?: string;
  config?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface PluginListRequest {
  keyword?: string;
  category?: string;
  status?: string;
  publishStatus?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PluginListResponse {
  plugins: Plugin[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
