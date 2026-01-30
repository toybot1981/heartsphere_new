/**
 * 记忆系统 API 客户端
 * 连接到后端的 MySQL (长期记忆) 和 Redis (短期记忆)
 * 
 * 注意：request.ts 已经处理了 ApiResponse<T> 格式，自动提取 data 字段
 */

import { request } from '../base/request';
import { UserMemory, MemorySearchOptions, MemorySource } from '../../memory-system/types/MemoryTypes';
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
  // 规范化 source 字段：后端可能返回 "JOURNAL" (大写)，前端期望 "journal" (小写)
  // 导入 MemorySource 类型
  const MemorySource = {
    CONVERSATION: 'conversation',
    JOURNAL: 'journal',
    BEHAVIOR: 'behavior',
    MANUAL: 'manual',
    SYSTEM: 'system',
  } as const;
  
  let normalizedSource: string = apiMemory.source || MemorySource.CONVERSATION;
  if (apiMemory.source) {
    const sourceLower = apiMemory.source.toLowerCase();
    // 映射后端枚举值到前端枚举值
    if (sourceLower === 'journal' || apiMemory.source === 'JOURNAL') {
      normalizedSource = MemorySource.JOURNAL;
    } else if (sourceLower === 'conversation' || apiMemory.source === 'CONVERSATION') {
      normalizedSource = MemorySource.CONVERSATION;
    } else if (sourceLower === 'behavior' || apiMemory.source === 'USER_INPUT') {
      normalizedSource = MemorySource.BEHAVIOR;
    } else if (sourceLower === 'manual' || apiMemory.source === 'MANUAL_CREATE') {
      normalizedSource = MemorySource.MANUAL;
    } else if (sourceLower === 'system' || apiMemory.source === 'SYSTEM_DETECTED') {
      normalizedSource = MemorySource.SYSTEM;
    } else {
      // 默认值：如果无法匹配，使用小写格式
      normalizedSource = sourceLower;
    }
  }
  
  return {
    id: apiMemory.id,
    userId: Number(userId),
    memoryType: apiMemory.type,
    importance: apiMemory.importance,
    content: apiMemory.content,
    structuredData: apiMemory.structuredData,
    source: normalizedSource as any, // 类型转换，因为前端 MemorySource 是枚举
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
    memorizeRequest: {
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
      
      logger.info('[memoryApi] 记忆化对话请求', { 
        messageCount: memorizeRequest.messages?.length || 0,
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
        body: JSON.stringify(memorizeRequest),
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
    textRequest: {
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
        body: JSON.stringify(textRequest),
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
    documentRequest: {
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
        body: JSON.stringify(documentRequest),
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
    retrieveRequest: {
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
        body: JSON.stringify(retrieveRequest),
      });
      
      return result;
    } catch (error) {
      // 改进错误处理，显示更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      } : error;
      
      logger.error('[memoryApi] 检索记忆失败', { 
        error: errorMessage,
        details: errorDetails,
        request: {
          queriesCount: retrieveRequest.queries?.length || 0,
          limit: retrieveRequest.limit,
        },
      });
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
  
  /**
   * 保存聊天消息到数据库
   */
  saveChatMessage: async (
    sessionId: string,
    role: 'USER' | 'ASSISTANT' | 'SYSTEM',
    content: string,
    token: string,
    metadata?: Record<string, any>,
    importance?: number
  ): Promise<{
    id: string;
    sessionId: string;
    userId: string;
    role: string;
    content: string;
    timestamp: number;
  }> => {
    logger.info('[memoryApi] ========== 开始保存聊天消息 ==========');
    logger.info('[memoryApi] 请求参数:', {
      sessionId,
      role,
      contentLength: content?.length || 0,
      hasMetadata: !!metadata,
      metadataKeys: metadata ? Object.keys(metadata) : [],
      importance,
      hasToken: !!token,
      tokenLength: token?.length || 0,
    });
    
    try {
      const requestBody = {
        sessionId,
        role,
        content,
        metadata,
        importance,
      };
      
      logger.info('[memoryApi] 准备发送请求: url=/memory/v1/chat/messages, method=POST');
      logger.info('[memoryApi] 请求体:', {
        sessionId,
        role,
        contentLength: content?.length || 0,
        contentPreview: content ? (content.length > 100 ? content.substring(0, 100) + '...' : content) : null,
        metadata,
        importance,
      });
      
      const result = await request<{
        id: string;
        sessionId: string;
        userId: string;
        role: string;
        content: string;
        timestamp: number;
      }>('/memory/v1/chat/messages', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      logger.info('[memoryApi] ✅ 保存聊天消息成功:', {
        messageId: result?.id,
        sessionId: result?.sessionId,
        userId: result?.userId,
        role: result?.role,
        contentLength: result?.content?.length || 0,
        timestamp: result?.timestamp,
      });
      logger.info('[memoryApi] ========== 保存聊天消息完成 ==========');
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 10).join('\n'),
      } : error;
      
      logger.error('[memoryApi] ❌ 保存聊天消息失败:', {
        sessionId,
        role,
        contentLength: content?.length || 0,
        error: errorMessage,
        details: errorDetails,
      });
      logger.info('[memoryApi] ========== 保存聊天消息失败 ==========');
      throw error;
    }
  },
  
  /**
   * 获取聊天消息历史
   */
  getChatMessages: async (
    sessionId: string,
    token: string,
    limit: number = 10,
    beforeTimestamp?: number
  ): Promise<Array<{
    id: string;
    sessionId: string;
    userId: string;
    role: string;
    content: string;
    timestamp: number;
    metadata?: Record<string, any>;
    importance?: number;
  }>> => {
    logger.info('[memoryApi] ========== 开始获取聊天消息历史 ==========');
    logger.info('[memoryApi] 请求参数: sessionId={}, limit={}, beforeTimestamp={}', 
      sessionId, limit, beforeTimestamp);
    
    try {
      const params = new URLSearchParams();
      params.append('sessionId', sessionId);
      params.append('limit', String(limit));
      if (beforeTimestamp) {
        params.append('beforeTimestamp', String(beforeTimestamp));
      }
      
      const url = `/memory/v1/chat/messages?${params.toString()}`;
      logger.info('[memoryApi] 准备发送请求: url={}, method=GET', url);
      
      const result = await request<Array<{
        id: string;
        sessionId: string;
        userId: string;
        role: string;
        content: string;
        timestamp: number;
        metadata?: Record<string, any>;
        importance?: number;
      }>>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // 确保返回数组（即使后端返回 null 或 undefined）
      const messages = Array.isArray(result) ? result : [];
      const userCount = messages.filter(m => m.role === 'USER').length;
      const assistantCount = messages.filter(m => m.role === 'ASSISTANT').length;
      
      logger.info('[memoryApi] ✅ 获取聊天消息历史成功:', {
        sessionId,
        total: messages.length,
        userCount,
        assistantCount,
        messageIds: messages.map(m => m.id),
      });
      logger.info('[memoryApi] ========== 获取聊天消息历史完成 ==========');
      
      return messages;
    } catch (error) {
      // 改进错误处理，显示更详细的错误信息
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorDetails = error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 10).join('\n'),
      } : error;
      
      logger.error('[memoryApi] ❌ 获取聊天消息历史失败:', { 
        sessionId, 
        limit,
        beforeTimestamp,
        error: errorMessage,
        details: errorDetails,
      });
      
      // 如果是404，返回空数组而不是抛出错误（表示没有历史消息）
      if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
        logger.info('[memoryApi] 没有历史消息（404），返回空数组');
        logger.info('[memoryApi] ========== 获取聊天消息历史完成（无消息） ==========');
        return [];
      }
      
      logger.info('[memoryApi] ========== 获取聊天消息历史失败 ==========');
      throw error;
    }
  },

  // ========== 角色成长系统 API ==========

  /**
   * 获取角色成长信息
   */
  getCharacterGrowth: async (
    characterId: number,
    userId: number,
    token: string
  ): Promise<any> => {
    try {
      const growth = await request<any>(`/memory/v1/character/${characterId}/growth?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return growth;
    } catch (error) {
      logger.error('[memoryApi] 获取角色成长信息失败', { characterId, userId, error });
      throw error;
    }
  },

  /**
   * 获取成长轨迹
   * @param characterId - 角色ID（数字）
   * @param userId - 用户ID（数字或字符串，会自动转换为数字）
   * @param token - 认证token
   */
  getGrowthTrajectory: async (
    characterId: number,
    userId: number | string,
    token: string
  ): Promise<any> => {
    try {
      // 确保 userId 是数字类型
      const userIdNum = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      if (isNaN(userIdNum) || userIdNum <= 0) {
        const errorMsg = `无效的用户ID: ${userId} (转换为数字: ${userIdNum})`;
        logger.warn('[memoryApi] ' + errorMsg);
        throw new Error(errorMsg);
      }
      
      const trajectory = await request<any>(`/memory/v1/character/${characterId}/growth/trajectory?userId=${userIdNum}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return trajectory;
    } catch (error) {
      logger.error('[memoryApi] 获取成长轨迹失败', { characterId, userId, error });
      throw error;
    }
  },

  /**
   * 触发自我反思
   * @param characterId - 角色ID（数字或字符串，使用统一的ID映射）
   * @param userId - 用户ID
   * @param reflectionType - 反思类型
   * @param token - 认证token
   */
  triggerSelfReflection: async (
    characterId: number | string,
    userId: number,
    reflectionType: string,
    token: string
  ): Promise<string> => {
    try {
      // 使用统一的ID映射工具
      const { normalizeCharacterId, isValidCharacterId } = await import('../../../utils/characterIdMapper');
      const characterIdNum = normalizeCharacterId(characterId);
      
      // 验证 characterId 是否有效（只有正数ID才支持成长系统）
      if (!isValidCharacterId(characterId)) {
        const errorMsg = `系统角色不支持自我反思: ${characterId} (normalized: ${characterIdNum})`;
        logger.info('[memoryApi] ' + errorMsg);
        throw new Error(errorMsg);
      }
      
      if (characterIdNum === null || characterIdNum <= 0) {
        const errorMsg = `无效的角色ID: ${characterId}`;
        logger.warn('[memoryApi] ' + errorMsg);
        throw new Error(errorMsg);
      }
      
      const result = await request<{ message: string }>(`/memory/v1/character/${characterIdNum}/growth/reflect?userId=${userId}&reflectionType=${reflectionType}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return result.message || '自我反思已触发';
    } catch (error) {
      logger.error('[memoryApi] 触发自我反思失败', { characterId, userId, error });
      throw error;
    }
  },

  /**
   * 获取关系信息
   */
  getRelationshipInfo: async (
    characterId: number,
    userId: number,
    token: string
  ): Promise<any> => {
    try {
      const info = await request<any>(`/memory/v1/character/${characterId}/relationship?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return info;
    } catch (error) {
      logger.error('[memoryApi] 获取关系信息失败', { characterId, userId, error });
      throw error;
    }
  },

  /**
   * 获取关系里程碑
   */
  getRelationshipMilestones: async (
    characterId: number,
    userId: number,
    token: string
  ): Promise<any[]> => {
    try {
      const milestones = await request<any[]>(`/memory/v1/character/${characterId}/relationship/milestones?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return milestones;
    } catch (error) {
      logger.error('[memoryApi] 获取关系里程碑失败', { characterId, userId, error });
      throw error;
    }
  },

  /**
   * 获取导师能力
   */
  getMentorshipCapabilities: async (
    characterId: number,
    token: string
  ): Promise<any> => {
    try {
      const capabilities = await request<any>(`/memory/v1/character/${characterId}/mentorship/capabilities`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return capabilities;
    } catch (error) {
      logger.error('[memoryApi] 获取导师能力失败', { characterId, error });
      throw error;
    }
  },

  /**
   * 获取指导会话列表
   */
  getMentorshipSessions: async (
    characterId: number,
    userId: number,
    activeOnly: boolean,
    token: string
  ): Promise<any[]> => {
    try {
      const sessions = await request<any[]>(`/memory/v1/character/${characterId}/mentorship/sessions?userId=${userId}&activeOnly=${activeOnly}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return sessions;
    } catch (error) {
      logger.error('[memoryApi] 获取指导会话列表失败', { characterId, userId, error });
      throw error;
    }
  },
};


// 🆕 Phase 4: 知识资产反馈 API
export const submitAssetFeedback = async (
  assetId: number,
  feedbackType: string,
  token: string,
  comment?: string
): Promise<void> => {
  try {
    await request(`/memory/v1/assets/${assetId}/feedback`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feedbackType,
        comment,
      }),
    });
    
    logger.info('[memoryApi] 资产反馈已提交', { assetId, feedbackType });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('[memoryApi] 提交资产反馈失败', { 
      assetId,
      feedbackType,
      error: errorMessage,
    });
    throw error;
  }
};
