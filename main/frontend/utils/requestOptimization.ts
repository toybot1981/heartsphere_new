/**
 * 网络请求优化工具
 * Phase 5: 实现请求缓存、去重、防抖/节流、重试机制
 */

import { logger } from './logger';

// ==================== 请求缓存 ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * 请求缓存管理器
 * 支持TTL（Time To Live）和最大缓存数量
 */
export class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize: number;
  private defaultTTL: number; // 默认缓存时间（毫秒）

  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }

  /**
   * 生成缓存键
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * 获取缓存
   */
  get<T>(url: string, options?: RequestInit): T | null {
    const key = this.generateKey(url, options);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * 设置缓存
   */
  set<T>(url: string, data: T, options?: RequestInit, ttl?: number): void {
    const key = this.generateKey(url, options);
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt,
    });
  }

  /**
   * 删除缓存
   */
  delete(url: string, options?: RequestInit): void {
    const key = this.generateKey(url, options);
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期缓存
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const now = Date.now();
    let expiredCount = 0;
    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      expiredCount,
    };
  }
}

// 全局缓存实例
export const requestCache = new RequestCache(100, 5 * 60 * 1000); // 100个条目，默认5分钟TTL

// ==================== 请求去重 ====================

interface PendingRequest<T> {
  promise: Promise<T>;
  timestamp: number;
}

/**
 * 请求去重管理器
 * 防止相同请求并发执行
 */
export class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();
  private maxAge: number; // 请求最大保留时间（毫秒）

  constructor(maxAge: number = 30 * 1000) {
    this.maxAge = maxAge;
  }

  /**
   * 生成请求键
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * 执行请求（去重）
   */
  async execute<T>(
    url: string,
    options: RequestInit | undefined,
    requestFn: () => Promise<T>
  ): Promise<T> {
    const key = this.generateKey(url, options);
    const now = Date.now();

    // 检查是否有正在进行的相同请求
    const pending = this.pendingRequests.get(key);
    if (pending && (now - pending.timestamp) < this.maxAge) {
      logger.info(`[RequestDeduplicator] 复用正在进行的请求: ${key}`);
      return pending.promise;
    }

    // 创建新请求
    const promise = requestFn().finally(() => {
      // 请求完成后清理
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, {
      promise,
      timestamp: now,
    });

    return promise;
  }

  /**
   * 清理过期请求
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, request] of this.pendingRequests.entries()) {
      if (now - request.timestamp > this.maxAge) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * 清空所有待处理请求
   */
  clear(): void {
    this.pendingRequests.clear();
  }
}

// 全局去重实例
export const requestDeduplicator = new RequestDeduplicator(30 * 1000); // 30秒最大保留时间

// ==================== 防抖/节流 ====================

/**
 * 防抖函数
 * 在连续触发时，只在最后一次触发后等待指定时间才执行
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args);
      timeoutId = null;
    }, wait);
  };
}

/**
 * 节流函数
 * 在连续触发时，每隔指定时间执行一次
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let lastTime = 0;
  let timeoutId: NodeJS.Timeout | null = null;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;
    const now = Date.now();

    if (now - lastTime >= wait) {
      // 立即执行
      func.apply(context, args);
      lastTime = now;
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    } else {
      // 延迟执行（确保最后一次也会执行）
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        func.apply(context, args);
        lastTime = Date.now();
        timeoutId = null;
      }, wait - (now - lastTime));
    }
  };
}

/**
 * 异步防抖函数
 * 返回一个Promise，在防抖时间后执行
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let resolveFn: ((value: ReturnType<T>) => void) | null = null;
  let rejectFn: ((error: any) => void) | null = null;

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    const context = this;

    return new Promise<ReturnType<T>>((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 保存新的resolve和reject
      resolveFn = resolve;
      rejectFn = reject;

      timeoutId = setTimeout(async () => {
        try {
          const result = await func.apply(context, args);
          if (resolveFn) {
            resolveFn(result);
          }
        } catch (error) {
          if (rejectFn) {
            rejectFn(error);
          }
        } finally {
          timeoutId = null;
          resolveFn = null;
          rejectFn = null;
        }
      }, wait);
    });
  };
}

// ==================== 请求重试 ====================

export interface RetryOptions {
  maxRetries?: number; // 最大重试次数
  retryDelay?: number; // 重试延迟（毫秒）
  retryDelayMultiplier?: number; // 重试延迟倍数（指数退避）
  retryableStatuses?: number[]; // 可重试的状态码
  retryableErrors?: string[]; // 可重试的错误消息
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryDelayMultiplier: 2,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['NetworkError', 'Failed to fetch', 'timeout'],
};

/**
 * 带重试机制的请求函数
 */
export async function retryRequest<T>(
  requestFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 检查是否应该重试
      const shouldRetry = shouldRetryError(lastError, opts, attempt);

      if (!shouldRetry || attempt === opts.maxRetries) {
        throw lastError;
      }

      // 计算延迟时间（指数退避）
      const delay = opts.retryDelay * Math.pow(opts.retryDelayMultiplier, attempt);
      logger.info(
        `[retryRequest] 请求失败，${delay}ms后重试 (${attempt + 1}/${opts.maxRetries})`,
        lastError
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('请求失败');
}

/**
 * 判断是否应该重试
 */
function shouldRetryError(
  error: Error,
  options: Required<RetryOptions>,
  attempt: number
): boolean {
  if (attempt >= options.maxRetries) {
    return false;
  }

  // 检查错误消息
  const errorMessage = error.message.toLowerCase();
  for (const retryableError of options.retryableErrors) {
    if (errorMessage.includes(retryableError.toLowerCase())) {
      return true;
    }
  }

  // 检查状态码（如果错误包含状态码）
  const statusMatch = error.message.match(/\b(\d{3})\b/);
  if (statusMatch) {
    const statusCode = parseInt(statusMatch[1], 10);
    if (options.retryableStatuses.includes(statusCode)) {
      return true;
    }
  }

  return false;
}

// ==================== 定期清理 ====================

/**
 * 启动定期清理任务
 */
export function startCleanupTask(interval: number = 60 * 1000): () => void {
  const cleanup = () => {
    requestCache.cleanExpired();
    requestDeduplicator.cleanExpired();
  };

  const intervalId = setInterval(cleanup, interval);

  // 返回清理函数
  return () => {
    clearInterval(intervalId);
  };
}

// 自动启动清理任务（每60秒清理一次）
let cleanupTask: (() => void) | null = null;

if (typeof window !== 'undefined') {
  cleanupTask = startCleanupTask(60 * 1000);
}
