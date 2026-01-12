// HSMem API 客户端服务
// 直接调用 hsmem 服务的 REST API (http://localhost:8000)

const HSMEM_BASE_URL = import.meta.env.VITE_HSMEM_BASE_URL || 'http://localhost:8000';

// ========== Type Definitions ==========

export interface HSMemHealthStatus {
  status: string;
  statistics: {
    resources_count: number;
    items_count: number;
    categories_count: number;
  };
}

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
  summary: string;
  memory_type: string;
  content?: string;
  categories?: string[];
  importance?: string;
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

export interface StatisticsResponse {
  success: boolean;
  data: {
    statistics: {
      resources_count: number;
      items_count: number;
      categories_count: number;
    };
    status: string;
  };
}

export interface Category {
  id: string;
  name: string;
  item_count: number;
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: Category[];
    total: number;
  };
}

export interface CategoryItemsResponse {
  success: boolean;
  data: {
    category: string;
    items: MemoryItem[];
    total: number;
  };
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
  healthCheck: async (): Promise<HSMemHealthStatus> => {
    return hsmemRequest<HSMemHealthStatus>('/health');
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

  /**
   * 获取统计信息
   */
  getStatistics: async (): Promise<StatisticsResponse> => {
    return hsmemRequest<StatisticsResponse>('/api/v1/memory/statistics');
  },

  /**
   * 获取所有分类
   */
  getCategories: async (): Promise<CategoriesResponse> => {
    return hsmemRequest<CategoriesResponse>('/api/v1/memory/categories');
  },

  /**
   * 获取指定分类的记忆项
   */
  getCategoryItems: async (categoryName: string): Promise<CategoryItemsResponse> => {
    return hsmemRequest<CategoryItemsResponse>(
      `/api/v1/memory/categories/${encodeURIComponent(categoryName)}`
    );
  },
};
