package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 记忆系统仪表板DTO
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemorySystemDashboardDTO {
    
    // 系统状态
    private String systemStatus; // NORMAL/ABNORMAL/MAINTENANCE
    private Double serviceAvailability; // 服务可用率
    private String lastUpdatedAt; // 最后更新时间
    
    // 数据统计
    private Long totalUsers; // 用户总数
    private Long activeUsers24h; // 24小时活跃用户数
    private Long activeUsers7d; // 7天活跃用户数
    private Long totalMemories; // 记忆数据总量
    private Long shortTermMemories; // 短时记忆数量
    private Long longTermMemories; // 长时记忆数量
    private Long totalExtractions; // 记忆提取总数
    private Long totalRetrievals; // 记忆检索总数
    
    // 性能指标
    private Double averageResponseTime; // 平均响应时间（ms）
    private Double successRate; // 成功率
    private Double errorRate; // 错误率
    private Double cacheHitRate; // 缓存命中率
    
    // 趋势数据
    private Map<String, Long> userGrowthTrend; // 用户增长趋势
    private Map<String, Long> usageTrend; // 使用量趋势
    private Map<String, Double> performanceTrend; // 性能趋势
    
    // Redis状态
    private RedisStatusDTO redisStatus;
    
    // MongoDB状态
    private MongoStatusDTO mongoStatus;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RedisStatusDTO {
        private Boolean connected;
        private Long usedMemory; // 已使用内存（字节）
        private Long totalMemory; // 总内存（字节）
        private Integer activeSessions; // 活跃会话数
        private Integer totalKeys; // 总键数
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MongoStatusDTO {
        private Boolean connected;
        private Long totalDocuments; // 总文档数
        private Long totalCollections; // 总集合数
        private Long databaseSize; // 数据库大小（字节）
    }
}



