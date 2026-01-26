/**
 * 增强版请求函数
 * Phase 5: 集成请求缓存、去重、重试机制
 */

import { request, RequestOptions } from './request';
import {
  requestCache,
  requestDeduplicator,
  retryRequest,
  RetryOptions,
} from '../../../utils/requestOptimization';
import { logger } from '../../../utils/logger';

export interface EnhancedRequestOptions extends RequestOptions {
  // 缓存选项
  cache?: {
    enabled?: boolean; // 是否启用缓存
    ttl?: number; // 缓存时间（毫秒）
    key?: string; // 自定义缓存键
  };
  // 去重选项
  deduplicate?: boolean; // 是否启用去重
  // 重试选项
  retry?: RetryOptions | boolean; // 重试配置或是否启用默认重试
  // 跳过优化（用于某些特殊请求）
  skipOptimization?: boolean;
}

/**
 * 增强版请求函数
 * 支持缓存、去重、重试机制
 */
export const enhancedRequest = async <T>(
  url: string,
  options?: EnhancedRequestOptions
): Promise<T> => {
  const method = options?.method?.toUpperCase() || 'GET';
  const isGetRequest = method === 'GET';

  // 默认配置
  const cacheEnabled = options?.cache?.enabled ?? isGetRequest; // GET请求默认启用缓存
  const deduplicateEnabled = options?.deduplicate ?? true; // 默认启用去重
  const retryEnabled = options?.retry !== false; // 默认启用重试

  // 如果跳过优化，直接使用原始request
  if (options?.skipOptimization) {
    return request<T>(url, options);
  }

  // 生成缓存键
  const cacheKey = options?.cache?.key || `${method}:${url}:${JSON.stringify(options?.body || '')}`;

  // 1. 尝试从缓存获取（仅GET请求且启用缓存）
  if (cacheEnabled && isGetRequest) {
    const cached = requestCache.get<T>(url, options);
    if (cached !== null) {
      logger.info(`[enhancedRequest] 使用缓存: ${url}`);
      return cached;
    }
  }

  // 2. 执行请求（带去重和重试）
  const executeRequest = async (): Promise<T> => {
    // 如果启用去重，使用去重管理器
    if (deduplicateEnabled) {
      return requestDeduplicator.execute(url, options, () => {
        // 如果启用重试，使用重试机制
        if (retryEnabled) {
          const retryOptions = typeof options?.retry === 'boolean' 
            ? undefined 
            : options?.retry;
          return retryRequest(() => request<T>(url, options), retryOptions);
        }
        return request<T>(url, options);
      });
    }

    // 如果启用重试，使用重试机制
    if (retryEnabled) {
      const retryOptions = typeof options?.retry === 'boolean' 
        ? undefined 
        : options?.retry;
      return retryRequest(() => request<T>(url, options), retryOptions);
    }

    return request<T>(url, options);
  };

  try {
    const result = await executeRequest();

    // 3. 缓存结果（仅GET请求且启用缓存）
    if (cacheEnabled && isGetRequest) {
      const ttl = options?.cache?.ttl;
      requestCache.set(url, result, options, ttl);
      logger.info(`[enhancedRequest] 缓存结果: ${url} (TTL: ${ttl || 'default'})`);
    }

    return result;
  } catch (error) {
    // 请求失败时，如果是GET请求，尝试从缓存获取（降级策略）
    if (cacheEnabled && isGetRequest) {
      const cached = requestCache.get<T>(url, options);
      if (cached !== null) {
        logger.info(`[enhancedRequest] 请求失败，使用缓存降级: ${url}`);
        return cached;
      }
    }
    throw error;
  }
};

/**
 * 清除指定URL的缓存
 */
export const clearCache = (url: string, options?: RequestInit): void => {
  requestCache.delete(url, options);
};

/**
 * 清除所有缓存
 */
export const clearAllCache = (): void => {
  requestCache.clear();
};

/**
 * 获取缓存统计信息
 */
export const getCacheStats = () => {
  return requestCache.getStats();
};
