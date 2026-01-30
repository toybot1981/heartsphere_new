/**
 * SSE (Server-Sent Events) 类型定义
 */

/**
 * 标准SSE事件格式
 */
export interface SseEvent<T = any> {
  type: string;        // 事件类型
  timestamp: number;   // 时间戳
  data: T;            // 事件数据
  id?: string;        // 事件ID（可选）
}

/**
 * SSE事件类型
 */
export enum SseEventType {
  MESSAGE = 'message',
  COMPLETE = 'complete',
  ERROR = 'error',
  PROGRESS = 'progress',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

/**
 * SSE连接状态
 */
export enum SseConnectionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * SSE Stream Hook选项
 */
export interface SseStreamOptions<T = any> {
  url: string;                                    // SSE URL
  eventHandlers: Record<string, (data: T) => void>; // 事件处理器映射
  enabled?: boolean;                              // 是否启用（默认true）
  autoReconnect?: boolean;                        // 是否自动重连（默认true）
  maxReconnectAttempts?: number;                  // 最大重连次数（默认5）
  reconnectInterval?: number;                     // 重连间隔（毫秒，默认3000）
  onConnect?: () => void;                        // 连接成功回调
  onDisconnect?: () => void;                     // 断开连接回调
  onError?: (error: Event) => void;             // 错误回调
}

/**
 * SSE Stream Hook返回值
 */
export interface SseStreamResult {
  status: SseConnectionStatus;      // 连接状态
  error: Event | null;              // 错误信息
  reconnectAttempts: number;        // 重连次数
  connect: () => void;             // 手动连接
  disconnect: () => void;           // 手动断开
}
