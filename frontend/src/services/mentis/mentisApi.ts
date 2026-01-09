import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = '/api/mentis';

// 创建 axios 实例，配置默认选项
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60秒超时
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加认证 token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：统一错误处理
apiClient.interceptors.response.use(
  (response) => {
    // 检查业务状态码
    if (response.data.code !== undefined && response.data.code !== 200) {
      throw new Error(response.data.message || '请求失败');
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      if (status === 401) {
        // 未授权，清除 token 并跳转登录
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        throw new Error('无权访问');
      } else if (status === 404) {
        throw new Error('资源不存在');
      } else if (status >= 500) {
        throw new Error('服务器错误，请稍后重试');
      } else {
        throw new Error(error.response.data?.message || '请求失败');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      throw new Error('网络错误，请检查网络连接');
    } else {
      // 其他错误
      throw new Error(error.message || '请求失败');
    }
  }
);

// ========== 类型定义 ==========

export interface ChatRequest {
  sessionId?: string;
  message: string;
  taskType?: 'COMMAND' | 'SCRIPT' | 'INTERACTIVE' | 'COMPUTER_USE';
  parameters?: Record<string, any>;
  enableComputerUse?: boolean;
}

export interface ChatResponse {
  sessionId: string;
  messageId: string;
  response: string;
  taskId?: string;
  taskStatus?: string;
  result?: Record<string, any>;
  conversationHistory?: MentisMessage[];
  vmState?: Record<string, any>;
}

export interface MentisMessage {
  messageId: string;
  sessionId: string;
  role: 'USER' | 'MENTIS' | 'SYSTEM';
  content: string;
  messageType: 'TEXT' | 'COMMAND' | 'RESULT' | 'ERROR' | 'ACTION';
  taskId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Session {
  id?: number;
  sessionId: string;
  userId: number;
  title?: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';
  vmStatus: 'IDLE' | 'RUNNING' | 'ERROR';
  vmImageId?: string;
  vmConfig?: string;
  context?: string;
  createdAt: string;
  updatedAt?: string;
  lastActiveAt?: string;
}

export interface Task {
  id?: number;
  taskId: string;
  sessionId: string;
  taskType: 'COMMAND' | 'SCRIPT' | 'INTERACTIVE' | 'COMPUTER_USE';
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  command?: string;
  parameters?: string;
  result?: string;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VmStatus {
  vmId: string;
  status: 'IDLE' | 'RUNNING' | 'STOPPED' | 'ERROR';
  ipAddress?: string;
  resourceUsage?: Record<string, string>;
}

export interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

/**
 * Mentis API 服务
 */
export class MentisApiService {
  
  // ========== 对话相关 ==========
  
  /**
   * 发送消息给 Mentis
   */
  static async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await apiClient.post<ApiResponse<ChatResponse>>(
      '/chat/send',
      request
    );
    return response.data.data;
  }
  
  /**
   * 流式发送消息（使用 SSE）
   * 
   * @param request 聊天请求
   * @param onMessage 收到消息时的回调
   * @param onError 错误回调
   * @param onComplete 完成回调
   * @returns 关闭流的函数
   */
  static async sendMessageStream(
    request: ChatRequest,
    onMessage: (data: ChatResponse) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<() => void> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    let cancelled = false;
    
    try {
      const response = await fetch(`${window.location.origin}${API_BASE_URL}/chat/stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      if (!response.body) {
        throw new Error('响应体为空');
      }
      
      reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      const readStream = async () => {
        try {
          while (!cancelled) {
            const { done, value } = await reader!.read();
            if (done) {
              if (onComplete && !cancelled) {
                onComplete();
              }
              break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            
            // 解析 SSE 格式的数据
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的消息
            
            for (const line of lines) {
              if (line.trim()) {
                const parts = line.split('\n');
                let eventType = 'message';
                let data = '';
                
                for (const part of parts) {
                  if (part.startsWith('event: ')) {
                    eventType = part.substring(7).trim();
                  } else if (part.startsWith('data: ')) {
                    data = part.substring(6).trim();
                  }
                }
                
                if (data) {
                  try {
                    if (eventType === 'message') {
                      const chatResponse: ChatResponse = JSON.parse(data);
                      onMessage(chatResponse);
                    } else if (eventType === 'complete') {
                      if (onComplete) {
                        onComplete();
                      }
                    } else if (eventType === 'error') {
                      if (onError) {
                        onError(new Error(data));
                      }
                    }
                  } catch (e) {
                    console.error('解析 SSE 数据失败:', e, data);
                  }
                }
              }
            }
          }
        } catch (error) {
          if (!cancelled && onError) {
            onError(error as Error);
          }
        }
      };
      
      readStream();
      
      // 返回关闭函数
      return () => {
        cancelled = true;
        if (reader) {
          reader.cancel();
        }
      };
    } catch (error) {
      console.error('流式请求失败:', error);
      if (onError) {
        onError(error as Error);
      }
      return () => {};
    }
  }
  
  // ========== 会话管理 ==========
  
  /**
   * 创建会话
   */
  static async createSession(title?: string): Promise<Session> {
    const params = title ? { title } : undefined;
    const response = await apiClient.post<ApiResponse<Session>>(
      '/sessions',
      null,
      params ? { params } : undefined
    );
    return response.data.data;
  }
  
  /**
   * 获取会话列表
   */
  static async getSessions(): Promise<Session[]> {
    const response = await apiClient.get<ApiResponse<Session[]>>('/sessions');
    return response.data.data;
  }
  
  /**
   * 获取会话详情
   */
  static async getSession(sessionId: string): Promise<Session> {
    const response = await apiClient.get<ApiResponse<Session>>(
      `/sessions/${sessionId}`
    );
    return response.data.data;
  }
  
  /**
   * 更新会话状态
   */
  static async updateSessionStatus(
    sessionId: string,
    status: Session['status']
  ): Promise<Session> {
    const response = await apiClient.put<ApiResponse<Session>>(
      `/sessions/${sessionId}/status`,
      null,
      { params: { status } }
    );
    return response.data.data;
  }
  
  /**
   * 删除会话
   */
  static async deleteSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/sessions/${sessionId}`);
  }
  
  // ========== 任务管理 ==========
  
  /**
   * 获取任务列表
   */
  static async getTasks(sessionId: string): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>(
      '/tasks',
      { params: { sessionId } }
    );
    return response.data.data;
  }
  
  /**
   * 获取任务详情
   */
  static async getTask(taskId: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(
      `/tasks/${taskId}`
    );
    return response.data.data;
  }
  
  /**
   * 取消任务
   */
  static async cancelTask(taskId: string): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>(
      `/tasks/${taskId}/cancel`
    );
    return response.data.data;
  }
  
  // ========== 虚拟机管理 ==========
  
  /**
   * 获取虚拟机状态
   */
  static async getVmStatus(sessionId: string): Promise<VmStatus> {
    const response = await apiClient.get<ApiResponse<VmStatus>>(
      `/vm/${sessionId}/status`
    );
    return response.data.data;
  }
  
  /**
   * 创建虚拟机快照
   */
  static async createVmSnapshot(sessionId: string): Promise<{ snapshotId: string }> {
    const response = await apiClient.post<ApiResponse<{ snapshotId: string }>>(
      `/vm/${sessionId}/snapshot`
    );
    return response.data.data;
  }
  
  /**
   * 恢复虚拟机快照
   */
  static async restoreVmSnapshot(
    sessionId: string,
    snapshotId: string
  ): Promise<void> {
    await apiClient.post(
      `/vm/${sessionId}/restore`,
      null,
      { params: { snapshotId } }
    );
  }
  
  /**
   * 获取虚拟机屏幕截图
   */
  static async getVmScreenshot(sessionId: string): Promise<{
    screenshotUrl: string;
    timestamp: string;
  }> {
    const response = await apiClient.get<ApiResponse<{
      screenshotUrl: string;
      timestamp: string;
    }>>(`/vm/${sessionId}/screenshot`);
    return response.data.data;
  }
  
  /**
   * 获取虚拟机统计信息
   */
  static async getVmStatistics(): Promise<Record<string, any>> {
    const response = await apiClient.get<ApiResponse<Record<string, any>>>(
      '/vm/statistics'
    );
    return response.data.data;
  }
}
