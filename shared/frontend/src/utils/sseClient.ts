/**
 * SSE客户端工具
 * 提供SSE连接管理和事件解析功能
 */

import { SseEvent } from '../types/sse';

/**
 * 创建SSE连接
 */
export function createSseConnection(url: string): EventSource {
  return new EventSource(url);
}

/**
 * 解析SSE事件
 */
export function parseSseEvent<T = any>(event: MessageEvent): SseEvent<T> | null {
  try {
    const data = JSON.parse(event.data);
    
    // 如果已经是标准格式，直接返回
    if (data.type && data.timestamp && data.data !== undefined) {
      return data as SseEvent<T>;
    }
    
    // 否则包装为标准格式
    return {
      type: event.type || 'message',
      timestamp: Date.now(),
      data: data as T,
    };
  } catch (error) {
    console.error('Failed to parse SSE event:', error);
    return null;
  }
}

/**
 * 格式化SSE事件数据
 */
export function formatSseEvent<T>(type: string, data: T, id?: string): string {
  return JSON.stringify({
    type,
    timestamp: Date.now(),
    data,
    ...(id && { id }),
  });
}
