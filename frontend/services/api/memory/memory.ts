/**
 * 记忆系统 API 客户端
 * 连接到后端的 Redis (短期记忆) 和 MongoDB (长期记忆)
 */

import { request } from '../base/request';
import { UserMemory, MemorySearchOptions } from '../../memory-system/types/MemoryTypes';

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
 * 记忆系统 API
 */
export const memoryApi = {
  /**
   * 保存用户记忆到长期记忆（MongoDB）
   */
  saveMemory: async (
    userId: string | number,
    memory: SaveMemoryRequest,
    token: string
  ): Promise<UserMemory> => {
    const response = await request<{ data: UserMemory }>(`/memory/v1/users/${userId}/memories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memory),
    });
    
    // 处理响应格式（可能是 { data: UserMemory } 或直接是 UserMemory）
    const savedMemory = (response as any).data || response;
    
    // 转换为前端格式
    return {
      id: savedMemory.id,
      userId: Number(userId),
      memoryType: savedMemory.type || memory.memoryType,
      importance: savedMemory.importance || memory.importance,
      content: savedMemory.content || memory.content,
      structuredData: savedMemory.structuredData || memory.structuredData,
      source: savedMemory.source || memory.source,
      sourceId: savedMemory.sourceId || memory.sourceId,
      timestamp: savedMemory.createdAt ? new Date(savedMemory.createdAt).getTime() : Date.now(),
      usageCount: savedMemory.accessCount || 0,
      confidence: savedMemory.confidence || memory.confidence || 0.7,
      metadata: savedMemory.metadata || memory.metadata,
    } as UserMemory;
  },

  /**
   * 批量保存用户记忆
   */
  saveMemories: async (
    userId: string | number,
    memories: SaveMemoryRequest[],
    token: string
  ): Promise<UserMemory[]> => {
    const response = await request<{ data: UserMemory[] }>(`/memory/v1/users/${userId}/memories/batch`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memories),
    });
    
    // 处理响应格式
    let memoryList = Array.isArray(response) ? response : (response as any).data || [];
    
    // 转换为前端格式
    return memoryList.map((m: any) => ({
      id: m.id,
      userId: Number(userId),
      memoryType: m.type,
      importance: m.importance,
      content: m.content,
      structuredData: m.structuredData,
      source: m.source,
      sourceId: m.sourceId,
      timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      usageCount: m.accessCount || 0,
      confidence: m.confidence || 0.7,
      metadata: m.metadata,
    })) as UserMemory[];
  },

  /**
   * 搜索用户记忆
   */
  searchMemories: async (
    userId: string | number,
    options: MemorySearchOptions,
    token: string
  ): Promise<MemorySearchResponse> => {
    // 使用后端的memories/search端点
    const query = options.keyword || options.context || '';
    const limit = options.limit || 10;
    
    // 确保userId是字符串类型
    const userIdStr = String(userId);
    const response = await request<{ data: UserMemory[] }>(`/memory/v1/users/${userIdStr}/memories/search?query=${encodeURIComponent(query)}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // 如果后端返回的是包装格式，提取data字段
    let memoryList = Array.isArray(response) ? response : (response as any).data || [];
    
    // 转换为前端格式
    memoryList = memoryList.map((m: any) => ({
      id: m.id,
      userId: Number(userId),
      memoryType: m.type,
      importance: m.importance,
      content: m.content,
      structuredData: m.structuredData,
      source: m.source,
      sourceId: m.sourceId,
      timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      usageCount: m.accessCount || 0,
      confidence: m.confidence || 0.7,
      metadata: m.metadata,
    })) as UserMemory[];
    
    // 应用前端过滤
    let filtered = memoryList;
    if (options.memoryType) {
      filtered = filtered.filter((m: UserMemory) => m.memoryType === options.memoryType);
    }
    if (options.importance) {
      filtered = filtered.filter((m: UserMemory) => m.importance === options.importance);
    }
    if (options.source) {
      filtered = filtered.filter((m: UserMemory) => m.source === options.source);
    }
    
    return {
      memories: filtered,
      total: filtered.length,
    };
  },

  /**
   * 根据ID获取记忆
   */
  getMemoryById: async (
    userId: string | number,
    memoryId: string,
    token: string
  ): Promise<UserMemory> => {
    const response = await request<{ data: UserMemory }>(`/memory/v1/users/${userId}/memories/${memoryId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    const memory = (response as any).data || response;
    
    // 转换为前端格式
    return {
      id: memory.id,
      userId: Number(userId),
      memoryType: memory.type,
      importance: memory.importance,
      content: memory.content,
      structuredData: memory.structuredData,
      source: memory.source,
      sourceId: memory.sourceId,
      timestamp: memory.createdAt ? new Date(memory.createdAt).getTime() : Date.now(),
      usageCount: memory.accessCount || 0,
      confidence: memory.confidence || 0.7,
      metadata: memory.metadata,
    } as UserMemory;
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
    const response = await request<{ data: UserMemory }>(`/memory/v1/users/${userId}/memories/${memoryId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(memory),
    });
    
    const updatedMemory = (response as any).data || response;
    
    // 转换为前端格式
    return {
      id: updatedMemory.id,
      userId: Number(userId),
      memoryType: updatedMemory.type,
      importance: updatedMemory.importance,
      content: updatedMemory.content,
      structuredData: updatedMemory.structuredData,
      source: updatedMemory.source,
      sourceId: updatedMemory.sourceId,
      timestamp: updatedMemory.createdAt ? new Date(updatedMemory.createdAt).getTime() : Date.now(),
      usageCount: updatedMemory.accessCount || 0,
      confidence: updatedMemory.confidence || 0.7,
      metadata: updatedMemory.metadata,
    } as UserMemory;
  },

  /**
   * 删除记忆
   */
  deleteMemory: async (
    userId: string | number,
    memoryId: string,
    token: string
  ): Promise<void> => {
    await request(`/memory/v1/users/${userId}/memories/${memoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  /**
   * 从会话提取记忆
   */
  extractMemoriesFromSession: async (
    userId: string | number,
    sessionId: string,
    token: string
  ): Promise<UserMemory[]> => {
    const response = await request<{ data: UserMemory[] }>(`/memory/v1/users/${userId}/sessions/${sessionId}/extract`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    // 处理响应格式
    let memoryList = Array.isArray(response) ? response : (response as any).data || [];
    
    // 转换为前端格式
    return memoryList.map((m: any) => ({
      id: m.id,
      userId: Number(userId),
      memoryType: m.type,
      importance: m.importance,
      content: m.content,
      structuredData: m.structuredData,
      source: m.source,
      sourceId: m.sourceId,
      timestamp: m.createdAt ? new Date(m.createdAt).getTime() : Date.now(),
      usageCount: m.accessCount || 0,
      confidence: m.confidence || 0.7,
      metadata: m.metadata,
    })) as UserMemory[];
  },
};

