package com.heartsphere.websearch.controller;

import com.heartsphere.websearch.dto.ApiResponse;
import com.heartsphere.websearch.service.CacheService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 缓存管理Controller
 *
 * @author HeartSphere
 * @version 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/cache")
@RequiredArgsConstructor
@Tag(name = "缓存管理", description = "搜索缓存管理接口")
public class CacheController {

    private final CacheService cacheService;

    /**
     * 清除指定查询的缓存
     *
     * @param query 查询
     * @return 操作结果
     */
    @DeleteMapping("/{query}")
    @Operation(summary = "清除指定缓存", description = "清除指定查询的缓存")
    public ApiResponse<String> evict(@PathVariable String query) {
        cacheService.evict(query);
        return ApiResponse.success("缓存已清除");
    }

    /**
     * 清除所有缓存
     *
     * @return 操作结果
     */
    @DeleteMapping("/all")
    @Operation(summary = "清除所有缓存", description = "清除所有搜索缓存")
    public ApiResponse<String> evictAll() {
        cacheService.evictAll();
        return ApiResponse.success("所有缓存已清除");
    }

    /**
     * 获取缓存统计
     *
     * @return 缓存统计信息
     */
    @GetMapping("/stats")
    @Operation(summary = "获取缓存统计", description = "获取缓存统计信息")
    public ApiResponse<Map<String, Object>> getStats() {
        return ApiResponse.success(cacheService.getCacheStats());
    }
}
