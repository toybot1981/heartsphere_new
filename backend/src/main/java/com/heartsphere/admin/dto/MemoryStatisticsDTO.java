package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 记忆系统统计数据DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemoryStatisticsDTO {
    
    // 用户统计
    private Long totalUsers;
    private Long activeUsers24h;
    private Long activeUsers7d;
    private Long activeUsers30d;
    private Long newUsersToday;
    private Double userRetentionRate; // 用户留存率
    
    // 记忆类型统计
    private Map<String, Long> memoryTypeDistribution; // 各类型记忆数量
    private Map<String, Long> memoryTypeGrowth; // 各类型增长趋势
    private Map<String, Double> memoryTypeUsageRate; // 各类型使用率
    
    // 使用量统计
    private Long totalMemoriesCreated;
    private Long totalExtractions;
    private Long totalRetrievals;
    private Map<String, Long> usageTrend; // 使用量趋势
    
    // 性能统计
    private Double averageResponseTime;
    private Double p95ResponseTime;
    private Double p99ResponseTime;
    private Double successRate;
    private Double errorRate;
    private Double cacheHitRate;
    
    // 存储统计
    private Long redisMemoryUsage; // Redis内存使用（字节）
    private Long mongoStorageUsage; // MongoDB存储使用（字节）
    private Long totalStorageUsage; // 总存储使用（字节）
}




