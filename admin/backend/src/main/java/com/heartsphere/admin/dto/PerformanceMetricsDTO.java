package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * 性能指标DTO
 * 
 * @author HeartSphere
 * @date 2025-12-30
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PerformanceMetricsDTO {
    private Double averageResponseTime;
    private Double p95ResponseTime;
    private Double p99ResponseTime;
    private Double successRate;
    private Double errorRate;
    private Long totalRequests;
    private Map<String, Double> responseTimeTrend;
    private Map<String, Double> errorRateTrend;
}



