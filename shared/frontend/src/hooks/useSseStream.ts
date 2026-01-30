import { useEffect, useRef, useState, useCallback } from 'react';
import { SseConnectionStatus, SseStreamOptions, SseStreamResult } from '../types/sse';
import { parseSseEvent } from '../utils/sseClient';

/**
 * SSE Stream Hook
 * 通用的SSE流式响应Hook，支持自动重连和错误处理
 * 
 * @example
 * ```tsx
 * const { status, error, connect, disconnect } = useSseStream({
 *   url: '/api/psychology/sessions/123/stream',
 *   eventHandlers: {
 *     message: (data) => console.log('Message:', data),
 *     complete: (data) => console.log('Complete:', data),
 *     error: (data) => console.error('Error:', data),
 *   },
 *   enabled: true,
 *   autoReconnect: true,
 * });
 * ```
 */
export function useSseStream<T = any>(
  options: SseStreamOptions<T>
): SseStreamResult {
  const {
    url,
    eventHandlers,
    enabled = true,
    autoReconnect = true,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    onConnect,
    onDisconnect,
    onError,
  } = options;

  const [status, setStatus] = useState<SseConnectionStatus>(SseConnectionStatus.DISCONNECTED);
  const [error, setError] = useState<Event | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    if (!url || !enabled) return;

    // 关闭现有连接
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      setStatus(SseConnectionStatus.CONNECTING);
      setError(null);

      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      // 连接成功
      eventSource.onopen = () => {
        setStatus(SseConnectionStatus.CONNECTED);
        setReconnectAttempts(0);
        reconnectAttemptsRef.current = 0;
        onConnect?.();
      };

      // 处理消息
      eventSource.onmessage = (event) => {
        const parsedEvent = parseSseEvent<T>(event);
        if (parsedEvent) {
          const handler = eventHandlers[parsedEvent.type] || eventHandlers['message'];
          if (handler) {
            handler(parsedEvent.data);
          }
        }
      };

      // 处理自定义事件类型
      Object.keys(eventHandlers).forEach((eventType) => {
        eventSource.addEventListener(eventType, (event: Event) => {
          const messageEvent = event as MessageEvent;
          const parsedEvent = parseSseEvent<T>(messageEvent);
          if (parsedEvent) {
            eventHandlers[eventType](parsedEvent.data);
          }
        });
      });

      // 错误处理
      eventSource.onerror = (err) => {
        setError(err);
        setStatus(SseConnectionStatus.ERROR);
        onError?.(err);

        // 自动重连
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          setReconnectAttempts(reconnectAttemptsRef.current);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else {
          setStatus(SseConnectionStatus.DISCONNECTED);
        }
      };

    } catch (err) {
      console.error('Failed to create SSE connection:', err);
      setError(err as Event);
      setStatus(SseConnectionStatus.ERROR);
    }
  }, [url, enabled, autoReconnect, maxReconnectAttempts, reconnectInterval, eventHandlers, onConnect, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setStatus(SseConnectionStatus.DISCONNECTED);
    setReconnectAttempts(0);
    reconnectAttemptsRef.current = 0;
    onDisconnect?.();
  }, [onDisconnect]);

  // 自动连接/断开
  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    // 清理函数
    return () => {
      disconnect();
    };
  }, [enabled, url]); // url变化时重新连接

  return {
    status,
    error,
    reconnectAttempts,
    connect,
    disconnect,
  };
}
