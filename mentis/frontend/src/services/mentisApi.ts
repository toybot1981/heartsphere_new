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
// 支持从多个 key 读取 token，与主客户端实现单点登录
apiClient.interceptors.request.use(
  (config) => {
    // 尝试从多个可能的 key 读取 token（兼容主客户端和 mentis 的 token 存储方式）
    const token = localStorage.getItem('token') || 
                  sessionStorage.getItem('token') ||
                  localStorage.getItem('auth_token') || 
                  sessionStorage.getItem('auth_token');
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
    if (response.data && response.data.code !== undefined && response.data.code !== 200) {
      // 对于特定的业务错误码，创建特殊的错误对象，包含错误码信息
      const error: any = new Error(response.data.message || '请求失败');
      error.code = response.data.code;
      error.isBusinessError = true;
      throw error;
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // 服务器返回了错误状态码
      const status = error.response.status;
      if (status === 401) {
        // 未授权，清除 token 并跳转登录
        // 注意：如果是单点登录，应该跳转到主客户端的登录页面
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        // 跳转到主客户端登录页面（如果配置了的话）
        // window.location.href = 'http://localhost:3000/login'; // 主客户端登录页面
        // 或者使用相对路径，如果主客户端和 mentis 在同一域名下
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
  executionId?: string; // 任务执行ID，用于查询任务进度
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
  executionId?: string; // 执行ID，用于查询任务进度
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

export interface McpInspectorInfo {
  available: boolean;
  mcpUrl?: string;
  mcpToken?: string;
  sandboxId?: string;
  inspectorCommand?: string;
  inspectorUrl?: string;
  error?: string;
}

export interface VmInstance {
  vmId: string;
  sessionId: string;
  status: 'IDLE' | 'RUNNING' | 'STOPPED' | 'ERROR';
}

export interface VmStatus {
  vmId: string;
  status: 'IDLE' | 'RUNNING' | 'STOPPED' | 'ERROR';
  cpuUsage?: string;
  memoryUsage?: string;
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
   * 获取会话消息历史
   */
  static async getChatHistory(sessionId: string): Promise<MentisMessage[]> {
    const response = await apiClient.get<ApiResponse<MentisMessage[]>>(
      `/chat/history/${sessionId}`
    );
    return response.data.data || [];
  }

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
            
            // 调试：打印原始数据
            if (buffer.length > 0 && buffer.length < 1000) {
              console.debug('SSE 原始数据:', buffer);
            }
            
            // 解析 SSE 格式的数据
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // 保留最后一个不完整的消息
            
            for (const line of lines) {
              if (line.trim()) {
                const parts = line.split('\n');
                let eventType = 'message';
                let data = '';
                
                for (const part of parts) {
                  const trimmedPart = part.trim();
                  // 兼容 "event: message" 和 "event:message" 两种格式
                  if (trimmedPart.startsWith('event:')) {
                    eventType = trimmedPart.substring(6).trim();
                  } else if (trimmedPart.startsWith('data:')) {
                    data = trimmedPart.substring(5).trim();
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
    const requestBody = title ? { title } : {};
    const response = await apiClient.post<ApiResponse<Session>>(
      '/sessions',
      requestBody
    );
    return response.data?.data || response.data;
  }
  
  /**
   * 获取会话列表
   */
  static async getSessions(): Promise<Session[]> {
    try {
      const response = await apiClient.get<ApiResponse<Session[]>>('/sessions');
      // 确保返回的是数组，如果 data 是 undefined 或 null，返回空数组
      const data = response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('获取会话列表失败:', error);
      return []; // 出错时返回空数组
    }
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
    try {
      const response = await apiClient.get<ApiResponse<Task[]>>(
        '/tasks',
        { params: { sessionId } }
      );
      console.log('[MentisApiService] getTasks: 原始响应=', response);
      console.log('[MentisApiService] getTasks: response.data=', response.data);
      console.log('[MentisApiService] getTasks: response.data.data=', response.data?.data);
      
      // 确保返回的是数组
      const tasks = response.data?.data;
      if (!tasks) {
        console.warn('[MentisApiService] getTasks: response.data.data 为空，返回空数组');
        return [];
      }
      if (!Array.isArray(tasks)) {
        console.warn('[MentisApiService] getTasks: response.data.data 不是数组，类型=', typeof tasks, '值=', tasks);
        return [];
      }
      return tasks;
    } catch (error: any) {
      console.error('[MentisApiService] getTasks: API 调用失败:', error);
      // 如果 API 调用失败，返回空数组而不是抛出异常
      return [];
    }
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
   * 创建虚拟机
   */
  static async createVm(sessionId: string, config?: {
    imageId?: string;
    cpu?: number;
    memory?: number;
    disk?: number;
  }): Promise<VmInstance> {
    const response = await apiClient.post<ApiResponse<VmInstance>>(
      `/vm/${sessionId}/create`,
      config || {}
    );
    return response.data.data;
  }
  
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
   * 删除虚拟机
   */
  static async deleteVm(sessionId: string): Promise<void> {
    await apiClient.delete(`/vm/${sessionId}`);
  }
  
  /**
   * 获取虚拟机屏幕截图（新接口）
   */
  static async getVmScreenshot(sessionId: string): Promise<{
    screenshotUrl?: string;
    screenshot?: string;
    timestamp: string | number;
    vmId?: string;
    vmActivity?: string;
  }> {
    const response = await apiClient.get<ApiResponse<{
      screenshot: string;
      screenshotUrl: string;
      vmId: string;
      timestamp: string | number;
      vmActivity?: string;
    }>>(`/vm/${sessionId}/screenshot`);
    const data = response.data.data;
    return {
      screenshotUrl: data.screenshotUrl || data.screenshot,
      screenshot: data.screenshot || data.screenshotUrl,
      timestamp: data.timestamp,
      vmId: data.vmId,
      vmActivity: data.vmActivity,
    };
  }
  
  /**
   * 获取虚拟机 VNC 连接信息
   */
  static async getVncInfo(sessionId: string): Promise<{
    url?: string;
    password?: string;
    host?: string;
    port?: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      url?: string;
      password?: string;
      host?: string;
      port?: number;
    }>>(`/vm/${sessionId}/vnc`);
    return response.data.data;
  }
  
  /**
   * 在虚拟机中执行命令
   */
  static async executeCommand(sessionId: string, command: string): Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    const response = await apiClient.post<ApiResponse<{
      exitCode: number;
      stdout: string;
      stderr: string;
    }>>(`/vm/${sessionId}/execute`, { command });
    return response.data.data;
  }
  
  /**
   * 获取任务执行状态
   */
  /**
   * 获取任务执行状态
   */
  static async getExecutionStatus(executionId: string): Promise<{
    executionId: string;
    status: string;
    currentStep: number;
    totalSteps: number;
    currentStepDescription: string;
    startTime: number | null;
    currentStepStartTime: number | null;
    endTime: number | null;
    vmId: string | null;
    vmScreenshot: string | null;
    progress: number;
    elapsedTime: number | null;
    currentStepElapsedTime: number | null;
  }> {
    const response = await apiClient.get<ApiResponse<{
      executionId: string;
      status: string;
      currentStep: number;
      totalSteps: number;
      currentStepDescription: string;
      startTime: number | null;
      currentStepStartTime: number | null;
      endTime: number | null;
      vmId: string | null;
      vmScreenshot: string | null;
      progress: number;
      elapsedTime: number | null;
      currentStepElapsedTime: number | null;
    }>>(`/executions/${executionId}/status`);
    return response.data.data;
  }
  
  /**
   * 获取虚拟机状态（新接口）
   */
  static async getVmStatusForSession(sessionId: string): Promise<{
    vmId: string;
    status: string;
    cpuUsage: string;
    memoryUsage: string;
  }> {
    const response = await apiClient.get<ApiResponse<{
      vmId: string;
      status: string;
      cpuUsage: string;
      memoryUsage: string;
    }>>(`/executions/${sessionId}/vm/status`);
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
  
  // ========== MCP 配置管理 ==========
  
  /**
   * MCP 服务器配置
   */
  static async getMcpConfigs(enabled?: boolean): Promise<McpServerConfig[]> {
    const params: any = {};
    if (enabled !== undefined) {
      params.enabled = enabled;
    }
    const response = await apiClient.get<ApiResponse<McpServerConfig[]>>(
      '/mcp/configs',
      { params }
    );
    return response.data.data;
  }
  
  /**
   * 获取 MCP 配置
   */
  static async getMcpConfig(id: number): Promise<McpServerConfig> {
    const response = await apiClient.get<ApiResponse<McpServerConfig>>(
      `/mcp/configs/${id}`
    );
    return response.data.data;
  }
  
  /**
   * 创建 MCP 配置
   */
  static async createMcpConfig(config: Partial<McpServerConfig>): Promise<McpServerConfig> {
    const response = await apiClient.post<ApiResponse<McpServerConfig>>(
      '/mcp/configs',
      config
    );
    return response.data.data;
  }
  
  /**
   * 更新 MCP 配置
   */
  static async updateMcpConfig(id: number, config: Partial<McpServerConfig>): Promise<McpServerConfig> {
    const response = await apiClient.put<ApiResponse<McpServerConfig>>(
      `/mcp/configs/${id}`,
      config
    );
    return response.data.data;
  }
  
  /**
   * 删除 MCP 配置
   */
  static async deleteMcpConfig(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`/mcp/configs/${id}`);
  }
  
  /**
   * 启用/禁用 MCP 配置
   */
  static async toggleMcpConfig(id: number, enabled: boolean): Promise<McpServerConfig> {
    const response = await apiClient.patch<ApiResponse<McpServerConfig>>(
      `/mcp/configs/${id}/toggle`,
      { enabled }
    );
    return response.data.data;
  }
  
  /**
   * 测试 MCP 连接
   */
  static async testMcpConnection(id: number): Promise<{ connected: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ connected: boolean; message: string }>>(
      `/mcp/configs/${id}/test`
    );
    return response.data.data;
  }
  
  /**
   * 列出 MCP 服务器工具
   */
  static async listMcpTools(id: number): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(
      `/mcp/configs/${id}/tools`
    );
    return response.data.data;
  }
  
  /**
   * 调用 MCP 工具
   */
  static async callMcpTool(id: number, toolName: string, args: Record<string, any>): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      `/mcp/configs/${id}/tools/${toolName}/call`,
      { arguments: args }
    );
    return response.data.data;
  }
  
  /**
   * 获取 MCP Inspector 信息
   */
  static async getMcpInspectorInfo(sessionId: string): Promise<McpInspectorInfo> {
    const response = await apiClient.get<ApiResponse<McpInspectorInfo>>(
      `/sessions/${sessionId}/mcp/inspector`
    );
    return response.data.data;
  }
}

// MCP 服务器配置类型
export interface McpServerConfig {
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
  connectionStatus?: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastError?: string;
}
