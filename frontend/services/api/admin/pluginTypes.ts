// 插件管理相关的类型定义

export interface Plugin {
  id: number;
  pluginId: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  iconUrl?: string;
  category?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DISABLED';
  publishStatus?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';
  previewUrl?: string;
  publishNote?: string;
  publishedAt?: string;
  permissions?: string[];
  dependencies?: string[];
  minSystemVersion?: string;
  configSchema?: string;
  defaultConfig?: any;
  isSystemPlugin: boolean;
  usageCount: number;
  rating?: number;
  userCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PluginListRequest {
  keyword?: string;
  category?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  type?: 'SYSTEM' | 'USER' | 'ALL';
  page?: number;
  size?: number;
  sort?: 'name' | 'usage_count' | 'rating' | 'created_at';
}

export interface PluginListResponse {
  plugins: Plugin[];
  total: number;
  page: number;
  size: number;
}

export interface PluginConfigRequest {
  config: Record<string, any>;
}

export interface PluginPreview {
  plugin: Plugin;
  previewUrl?: string;
  canPublish: boolean;
}

export interface PluginPublishRequest {
  publishNote?: string;
}
