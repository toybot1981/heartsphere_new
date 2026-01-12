package com.heartsphere.websearch.service;

import com.heartsphere.websearch.dto.WebSearchRequest;
import com.heartsphere.websearch.dto.WebSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 缓存服务
 * 提供细粒度的缓存控制
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Slf4j
@Service
public class CacheService {

    private final Map<String, Long> accessTimes = new ConcurrentHashMap<>();

    /**
     * 获取缓存(带访问时间记录)
     */
    @Cacheable(value = "webSearch", key = "#query")
    public WebSearchResponse get(String query, WebSearchRequest request) {
        // 这个方法不会被实际调用,仅用于注解
        return null;
    }

    /**
     * 记录缓存访问时间
     */
    public void recordAccess(String query) {
        accessTimes.put(query, System.currentTimeMillis());
        log.debug("记录缓存访问: query={}", query);
    }

    /**
     * 获取缓存访问时间
     */
    public Long getAccessTime(String query) {
        return accessTimes.get(query);
    }

    /**
     * 清除指定查询的缓存
     */
    @CacheEvict(value = "webSearch", key = "#query")
    public void evict(String query) {
        log.info("清除缓存: query={}", query);
    }

    /**
     * 清除所有缓存
     */
    @CacheEvict(value = "webSearch", allEntries = true)
    public void evictAll() {
        log.info("清除所有缓存");
        accessTimes.clear();
    }

    /**
     * 更新缓存
     */
    @CachePut(value = "webSearch", key = "#query")
    public WebSearchResponse update(String query, WebSearchResponse response) {
        log.info("更新缓存: query={}", query);
        return response;
    }

    /**
     * 获取缓存统计
     */
    public Map<String, Object> getCacheStats() {
        return Map.of(
                "cachedQueries", accessTimes.size(),
                "lastAccessTime", accessTimes.values().stream().max(Long::compareTo).orElse(0L)
        );
    }
}
