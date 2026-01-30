/**
 * @deprecated 此 API 客户端已废弃
 * 
 * 请使用 `memoryApi` (services/api/memory/memory.ts) 替代
 * 
 * 原因：
 * - main 项目前端应该通过 backend API 调用 hsmem 服务
 * - backend 提供统一的记忆服务接口，增强安全性
 * - 便于统一管理和扩展
 * 
 * 迁移指南：
 * - 对话记忆：使用 `memoryApi.memorizeConversation()`
 * - 文本记忆：使用 `memoryApi.memorizeText()`
 * - 文档记忆：使用 `memoryApi.memorizeDocument()`
 * - 记忆检索：使用 `memoryApi.retrieve()`
 * 
 * 注意：
 * - admin 项目可以继续使用此客户端（直接调用 hsmem 是合理的架构设计）
 */

// HSMem API 客户端服务
// 直接调用 hsmem 服务的 REST API (http://localhost:8000)
// ⚠️ 已废弃：main 项目应使用 backend API，admin 项目可继续使用

const HSMEM_BASE_URL = import.meta.env.VITE_HSMEM_BASE_URL || 'http://localhost:8000';

// ========== Type Definitions ==========

export interface Message {
  role: string;
  content: {
    text: string;
  } | string;
}

export interface ConversationRequest {
  messages: Message[];
  user_id?: string;
  agent_id?: string;
}

export interface TextMemoryRequest {
  text: string;
  context?: Record<string, any>;
  user_id?: string;
}

export interface DocumentMemoryRequest {
  title: string;
  content: string;
  author?: string;
  user_id?: string;
}

export interface MemorizeResponse {
  success: boolean;
  data: {
    resource_id: string;
    items_count: number;
    categories: Array<{
      name: string;
      item_count: number;
    }>;
  };
}

export interface RetrieveRequest {
  queries: Message[];
  where?: Record<string, any>;
  limit?: number;
}

export interface MemoryItem {
  id: string;
  resource_id?: string;
  user_id?: string;
  summary: string;
  memory_type: string;
  content?: string;
  categories?: string[];
  importance?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface RetrieveResponse {
  success: boolean;
  data: {
    method: string;
    items: MemoryItem[];
  };
}

export interface Resource {
  id: string;
  modality: string;
  data: Record<string, any>;
  created_at: string;
  metadata?: Record<string, any>;
}

// ========== Helper Functions ==========

/**
 * 通用请求函数
 */
async function hsmemRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${HSMEM_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `HSMem API请求失败: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // 如果响应不是JSON，使用默认错误信息
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error: any) {
    console.error(`[HSMem API] ${options?.method || 'GET'} ${url} 失败:`, error);
    throw error;
  }
}

// ========== API Methods ==========

export const hsmemApi = {
  /**
   * 健康检查
   */
  healthCheck: async (): Promise<{ status: string; statistics: any }> => {
    return hsmemRequest<{ status: string; statistics: any }>('/health');
  },

  /**
   * 记忆化对话
   */
  memorizeConversation: async (
    request: ConversationRequest
  ): Promise<MemorizeResponse> => {
    return hsmemRequest<MemorizeResponse>('/api/v1/memory/memorize/conversation', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 记忆化文本
   */
  memorizeText: async (
    request: TextMemoryRequest
  ): Promise<MemorizeResponse> => {
    return hsmemRequest<MemorizeResponse>('/api/v1/memory/memorize/text', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 记忆化文档
   */
  memorizeDocument: async (
    request: DocumentMemoryRequest
  ): Promise<MemorizeResponse> => {
    return hsmemRequest<MemorizeResponse>('/api/v1/memory/memorize/document', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 检索记忆
   */
  retrieve: async (request: RetrieveRequest): Promise<RetrieveResponse> => {
    return hsmemRequest<RetrieveResponse>('/api/v1/memory/retrieve', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};
