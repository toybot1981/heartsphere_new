/**
 * 温度感引擎事件系统
 */

import { EventListener, EngineEventType, EventData } from './EventTypes';

/**
 * 事件系统类
 */
export class EventSystem {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: EventData[] = [];
  private maxHistorySize: number = 100;

  /**
   * 注册事件监听
   */
  on(event: EngineEventType, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听
   */
  off(event: EngineEventType, listener: EventListener): void {
    this.listeners.get(event)?.delete(listener);
  }

  /**
   * 触发事件
   */
  emit(event: EngineEventType, data?: any): void {
    // 记录事件历史
    this.recordEvent(event, data);

    // 触发监听器
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`[TemperatureEngine] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * 一次性事件监听
   */
  once(event: EngineEventType, listener: EventListener): void {
    const wrapper = (data: any) => {
      listener(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * 移除所有事件监听
   */
  removeAllListeners(event?: EngineEventType): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * 获取事件监听器数量
   */
  listenerCount(event: EngineEventType): number {
    return this.listeners.get(event)?.size || 0;
  }

  /**
   * 获取所有事件类型
   */
  getEventTypes(): EngineEventType[] {
    return Array.from(this.listeners.keys()) as EngineEventType[];
  }

  /**
   * 记录事件历史
   */
  private recordEvent(event: EngineEventType, data?: any): void {
    const eventData: EventData = {
      type: event,
      timestamp: Date.now(),
      data,
    };

    this.eventHistory.push(eventData);

    // 限制历史记录大小
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * 获取事件历史
   */
  getEventHistory(limit?: number): EventData[] {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  /**
   * 清空事件历史
   */
  clearEventHistory(): void {
    this.eventHistory = [];
  }

  /**
   * 设置最大历史记录大小
   */
  setMaxHistorySize(size: number): void {
    this.maxHistorySize = size;
    // 如果当前历史超过新大小，截断
    if (this.eventHistory.length > size) {
      this.eventHistory = this.eventHistory.slice(-size);
    }
  }
}



