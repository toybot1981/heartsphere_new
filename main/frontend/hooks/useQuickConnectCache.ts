import { useCallback, useRef } from 'react';
import type { QuickConnectCharacter } from '../services/api/quickconnect/types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * 快速连接缓存Hook
 * 用于缓存API响应，减少重复请求
 */
export const useQuickConnectCache = () => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
  const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
  
  /**
   * 获取缓存
   */
  const getCache = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);
    if (!entry) {
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      cacheRef.current.delete(key);
      return null;
    }
    
    return entry.data as T;
  }, []);
  
  /**
   * 设置缓存
   */
  const setCache = useCallback(<T,>(key: string, data: T): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);
  
  /**
   * 清除缓存
   */
  const clearCache = useCallback((key?: string): void => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);
  
  /**
   * 生成缓存键
   */
  const generateCacheKey = useCallback((
    filter?: string,
    sceneId?: number,
    sortBy?: string,
    search?: string
  ): string => {
    return `quickconnect_${filter || 'all'}_${sceneId || 'all'}_${sortBy || 'frequency'}_${search || ''}`;
  }, []);
  
  return {
    getCache,
    setCache,
    clearCache,
    generateCacheKey,
  };
};




