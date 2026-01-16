/**
 * 记忆系统 API 客户端
 * 连接到后端的 MySQL (长期记忆) 和 Redis (短期记忆)
 * 
 * 注意：request.ts 已经处理了 ApiResponse<T> 格式，自动提取 data 字段
 */

import { request } from '../base/request';
import { UserMemory, MemorySearchOptions } from '../../memory-system/types/MemoryTypes';
import { logger } from '../../../utils/logger';

/**
 * 保存用户记忆请求
 */
export interface SaveMemoryRequest {
  memoryType: string;
  importance: string;
  content: string;
  structuredData?: {
    key?: string;
    value?: any;
    tags?: string[];
  };
  source: string;
  sourceId?: string;
  confidence: number;
  tags?: string[];
  metadata?: {
    emotion?: string;
    eraId?: number;
    characterId?: string;
  };
}

/**
 * 记忆搜索响应
 */
export interface MemorySearchResponse {
  memories: UserMemory[];
  total: number;
}

/**
 * API 返回的 UserMemory 格式（与客户端格式不同）
 */
interface ApiUserMemory {
  id: string;
  userId: string;
  type: string; // API 使用 type，客户端使用 memoryType
  importance: string;
  content: string;
  structuredData?: any;
  source: string;
  sourceId?: string;
  confidence: number;
  tags?: string[];
  metadata?: any;
  createdAt: string; // ISO 8601 格式
  lastAccessedAt?: string;
  accessCount: number; // API 使用 accessCount，客户端使用 usageCount
}

/**
 * 将 API 格式转换为客户端格式
 */
function normalizeMemory(apiMemory: ApiUserMemory, userId: string | number): UserMemory {
  return {
    id: apiMemory.id,
    userId: Number(userId),
    memoryType: apiMemory.type,
    importance: apiMemory.importance,
    content: apiMemory.content,
    structuredData: apiMemory.structuredData,
    source: apiMemory.source,
    sourceId: apiMemory.sourceId,
    timestamp: apiMemory.createdAt ? new Date(apiMemory.createdAt).getTime() : Date.now(),
    usageCount: apiMemory.accessCount || 0,
    confidence: apiMemory.confidence || 0.7,
    metadata: apiMemory.metadata,
  } as UserMemory;
}

/**
 * 记忆系统 API
 */
export const memoryApi = {
  /**
   * 保存用户记忆到长期记忆
   */
  saveMemory: async (
    userId: string | number,
    memory: SaveMemoryRequest,
    token: string
  ): Promise<UserMemory> => {
    try {
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const savedMemory = await request<ApiUserMemory>(`/memory/v1/users/${userId}/memories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });
      
      // 转换为客户端格式
      return normalizeMemory(savedMemory, userId);
    } catch (error) {
      logger.error('[memoryApi] 保存记忆失败', { userId, error });
      throw error;
    }
  },

  /**
   * 批量保存用户记忆
   */
  saveMemories: async (
    userId: string | number,
    memories: SaveMemoryRequest[],
    token: string
  ): Promise<UserMemory[]> => {
    try {
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const memoryList = await request<ApiUserMemory[]>(`/memory/v1/users/${userId}/memories/batch`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memories),
      });
      
      // 确保是数组
      const memoriesArray = Array.isArray(memoryList) ? memoryList : [];
      
      // 转换为客户端格式
      return memoriesArray.map(m => normalizeMemory(m, userId));
    } catch (error) {
      logger.error('[memoryApi] 批量保存记忆失败', { userId, error });
      throw error;
    }
  },

  /**
   * 搜索用户记忆
   */
  searchMemories: async (
    userId: string | number,
    options: MemorySearchOptions,
    token: string
  ): Promise<MemorySearchResponse> => {
    try {
      // 使用后端的memories/search端点
      const query = options.keyword || options.context || '';
      const limit = options.limit || 10;
      
      // 确保userId是字符串类型
      const userIdStr = String(userId);
      
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const memoryList = await request<ApiUserMemory[]>(`/memory/v1/users/${userIdStr}/memories/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // 确保是数组
      const memoriesArray = Array.isArray(memoryList) ? memoryList : [];
      
      // 转换为客户端格式
      let convertedMemories = memoriesArray.map(m => normalizeMemory(m, userId));
      
      // 应用前端过滤（如果后端不支持这些过滤参数）
      if (options.memoryType) {
        convertedMemories = convertedMemories.filter(m => m.memoryType === options.memoryType);
      }
      if (options.importance) {
        convertedMemories = convertedMemories.filter(m => m.importance === options.importance);
      }
      if (options.source) {
        convertedMemories = convertedMemories.filter(m => m.source === options.source);
      }
      
      return {
        memories: convertedMemories,
        total: convertedMemories.length,
      };
    } catch (error) {
      logger.error('[memoryApi] 搜索记忆失败', { userId, options, error });
      throw error;
    }
  },

  /**
   * 根据ID获取记忆
   */
  getMemoryById: async (
    userId: string | number,
    memoryId: string,
    token: string
  ): Promise<UserMemory> => {
    try {
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const memory = await request<ApiUserMemory>(`/memory/v1/users/${userId}/memories/${memoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // 转换为客户端格式
      return normalizeMemory(memory, userId);
    } catch (error) {
      logger.error('[memoryApi] 获取记忆失败', { userId, memoryId, error });
      throw error;
    }
  },

  /**
   * 更新记忆
   */
  updateMemory: async (
    userId: string | number,
    memoryId: string,
    memory: Partial<SaveMemoryRequest>,
    token: string
  ): Promise<UserMemory> => {
    try {
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const updatedMemory = await request<ApiUserMemory>(`/memory/v1/users/${userId}/memories/${memoryId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(memory),
      });
      
      // 转换为客户端格式
      return normalizeMemory(updatedMemory, userId);
    } catch (error) {
      logger.error('[memoryApi] 更新记忆失败', { userId, memoryId, error });
      throw error;
    }
  },

  /**
   * 删除记忆
   */
  deleteMemory: async (
    userId: string | number,
    memoryId: string,
    token: string
  ): Promise<void> => {
    try {
      await request(`/memory/v1/users/${userId}/memories/${memoryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      logger.error('[memoryApi] 删除记忆失败', { userId, memoryId, error });
      throw error;
    }
  },

  /**
   * 从会话提取记忆
   */
  extractMemoriesFromSession: async (
    userId: string | number,
    sessionId: string,
    token: string
  ): Promise<UserMemory[]> => {
    try {
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const memoryList = await request<ApiUserMemory[]>(`/memory/v1/users/${userId}/sessions/${sessionId}/extract`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // 确保是数组
      const memoriesArray = Array.isArray(memoryList) ? memoryList : [];
      
      // 转换为客户端格式
      return memoriesArray.map(m => normalizeMemory(m, userId));
    } catch (error) {
      logger.error('[memoryApi] 从会话提取记忆失败', { userId, sessionId, error });
      throw error;
    }
  },

  // ==================== HSMem 记忆服务 API ====================
  
  /**
   * HSMem 记忆化对话请求
   */
  memorizeConversation: async (
    request: {
      messages: Array<{ role: string; content: string | { text: string } }>;
      user_id?: string;
      agent_id?: string;
    },
    token: string
  ): Promise<{
    resource_id: string;
    items_count: number;
    categories: Array<{ name: string; item_count: number }>;
  }> => {
    try {
      // 验证 token
      if (!token || !token.trim()) {
        logger.error('[memoryApi] 记忆化对话失败: token 为空', { token });
        throw new Error('认证 token 无效');
      }
      
      logger.debug('[memoryApi] 记忆化对话请求', { 
        messageCount: request.messages?.length || 0,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, Math.min(20, token.length))
      });
      
      // request.ts 已经处理了 ApiResponse<T> 格式，直接返回 data 字段
      const result = await request<{
        resource_id: string;
        items_count: number;
        categories: Array<{ name: string; item_count: number }>;
      }>('/memory/v1/hsmem/memorize/conversation', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 记忆化对话失败', { error, tokenLength: token?.length });
      throw error;
    }
  },
  
  /**
   * HSMem 记忆化文本
   */
  memorizeText: async (
    request: {
      text: string;
      context?: Record<string, any>;
      user_id?: string;
    },
    token: string
  ): Promise<{
    resource_id: string;
    items_count: number;
    categories: Array<{ name: string; item_count: number }>;
  }> => {
    try {
      const result = await request<{
        resource_id: string;
        items_count: number;
        categories: Array<{ name: string; item_count: number }>;
      }>('/memory/v1/hsmem/memorize/text', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 记忆化文本失败', { error });
      throw error;
    }
  },
  
  /**
   * HSMem 记忆化文档
   */
  memorizeDocument: async (
    request: {
      title: string;
      content: string;
      author?: string;
      user_id?: string;
    },
    token: string
  ): Promise<{
    resource_id: string;
    items_count: number;
    categories: Array<{ name: string; item_count: number }>;
  }> => {
    try {
      const result = await request<{
        resource_id: string;
        items_count: number;
        categories: Array<{ name: string; item_count: number }>;
      }>('/memory/v1/hsmem/memorize/document', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 记忆化文档失败', { error });
      throw error;
    }
  },
  
  /**
   * HSMem 检索记忆
   */
  retrieve: async (
    request: {
      queries: Array<{ role: string; content: string | { text: string } }>;
      where?: Record<string, any>;
      limit?: number;
    },
    token: string
  ): Promise<{
    method: string;
    items: Array<Record<string, any>>;
  }> => {
    try {
      const result = await request<{
        method: string;
        items: Array<Record<string, any>>;
      }>('/memory/v1/hsmem/retrieve', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 检索记忆失败', { error });
      throw error;
    }
  },
  
  /**
   * HSMem 获取统计信息
   */
  getStatistics: async (
    token: string
  ): Promise<{
    resources_count: number;
    items_count: number;
    categories_count: number;
  }> => {
    try {
      const result = await request<{
        resources_count: number;
        items_count: number;
        categories_count: number;
      }>('/memory/v1/hsmem/statistics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 获取统计信息失败', { error });
      throw error;
    }
  },
  
  /**
   * HSMem 获取分类列表
   */
  getCategories: async (
    token: string
  ): Promise<{
    categories: Array<Record<string, any>>;
    total: number;
  }> => {
    try {
      const result = await request<{
        categories: Array<Record<string, any>>;
        total: number;
      }>('/memory/v1/hsmem/categories', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 获取分类列表失败', { error });
      throw error;
    }
  },
  
  /**
   * HSMem 获取记忆项列表
   */
  getItems: async (
    userId: string | number | undefined,
    token: string
  ): Promise<{
    items: Array<Record<string, any>>;
    total: number;
  }> => {
    try {
      const url = userId 
        ? `/memory/v1/hsmem/items?user_id=${userId}`
        : '/memory/v1/hsmem/items';
      
      const result = await request<{
        items: Array<Record<string, any>>;
        total: number;
      }>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 获取记忆项列表失败', { userId, error });
      throw error;
    }
  },
  
  /**
   * HSMem 获取资源列表
   */
  getResources: async (
    token: string
  ): Promise<{
    resources: Array<Record<string, any>>;
    total: number;
  }> => {
    try {
      const result = await request<{
        resources: Array<Record<string, any>>;
        total: number;
      }>('/memory/v1/hsmem/resources', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return result;
    } catch (error) {
      logger.error('[memoryApi] 获取资源列表失败', { error });
      throw error;
    }
  },
};

