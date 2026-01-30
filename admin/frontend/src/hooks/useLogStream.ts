import { useState, useEffect, useRef } from 'react';

export interface LogMessage {
  timestamp: number;
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
  message: string;
}

interface UseLogStreamResult {
  logs: LogMessage[];
  status: string;
  connected: boolean;
  error: string | null;
  clearLogs: () => void;
}

/**
 * Hook for managing SSE log stream connection
 * Uses fetch + ReadableStream instead of EventSource to support custom headers
 */
export const useLogStream = (executionId: number | null): UseLogStreamResult => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [status, setStatus] = useState<string>('UNKNOWN');
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseReconnectDelay = 1000; // 1 second

  useEffect(() => {
    if (!executionId) {
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      setError('未找到认证 token');
      return;
    }

    const connect = async () => {
      // 清理之前的连接
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api/admin';
      const url = `${baseUrl}/devops/executions/${executionId}/logs/stream`;

      try {
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'text/event-stream',
          },
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('Response body is null');
        }

        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 保留最后不完整的行

          for (const line of lines) {
            if (line.trim() === '') continue;

            // 解析 SSE 格式
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                
                // 处理日志消息
                if (data.message !== undefined) {
                  setLogs(prev => {
                    const newLogs = [...prev, {
                      timestamp: data.timestamp || Date.now(),
                      level: data.level || 'INFO',
                      message: data.message,
                    }];
                    // 限制日志数量，避免内存溢出（保留最近 10000 条）
                    return newLogs.slice(-10000);
                  });
                }
                
                // 处理状态更新
                if (data.status !== undefined) {
                  setStatus(data.status);
                }
              } catch (e) {
                console.warn('Failed to parse SSE data:', line, e);
              }
            } else if (line.startsWith('event: ')) {
              // 事件类型，可以用于区分不同类型的消息
              // 当前实现中，我们通过 data 中的字段来区分
            }
          }
        }

        // 连接正常关闭
        setConnected(false);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // 连接被主动取消，不进行重连
          return;
        }

        setConnected(false);
        const errorMessage = err.message || '连接错误';
        setError(errorMessage);

        // 自动重连（指数退避）
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          const delay = baseReconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);
          
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        } else {
          setError('连接失败，已达到最大重连次数');
        }
      }
    };

    connect();

    // 清理函数
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current !== null) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [executionId]);

  const clearLogs = () => {
    setLogs([]);
  };

  return {
    logs,
    status,
    connected,
    error,
    clearLogs,
  };
};
