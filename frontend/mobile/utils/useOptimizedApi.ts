/**
 * Mobile版本优化的API调用Hook
 * Phase 5: 提供防抖/节流等优化功能
 */

import { useCallback, useRef } from 'react';
import { debounce, throttle, debounceAsync } from '../../utils/requestOptimization';

/**
 * 使用防抖的API调用Hook
 * 适用于搜索、输入等场景
 */
export function useDebouncedApi<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  delay: number = 500
): T {
  const debouncedFn = useRef(
    debounceAsync(apiFn, delay)
  ).current;

  return debouncedFn as T;
}

/**
 * 使用节流的API调用Hook
 * 适用于滚动加载、实时更新等场景
 */
export function useThrottledApi<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  delay: number = 1000
): T {
  const throttledFn = useRef(
    throttle(async (...args: Parameters<T>) => {
      return apiFn(...args);
    }, delay)
  ).current;

  return throttledFn as T;
}

/**
 * 使用缓存的API调用Hook
 * 自动缓存GET请求结果
 */
export function useCachedApi<T extends (...args: any[]) => Promise<any>>(
  apiFn: T,
  cacheKey?: string
): T {
  return useCallback(async (...args: Parameters<T>) => {
    // 这里可以集成缓存逻辑
    // 目前API模块已经使用enhancedRequest，会自动缓存
    return apiFn(...args);
  }, [apiFn, cacheKey]) as T;
}
