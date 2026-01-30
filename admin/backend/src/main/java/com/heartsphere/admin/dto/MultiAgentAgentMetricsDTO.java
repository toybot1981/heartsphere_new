package com.heartsphere.admin.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * 多智能体 Agent 性能指标 DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentAgentMetricsDTO {
    
    private String agentId;
    private String agentName;
    
    /**
     * 总调用次数
     */
    private Long totalCalls;
    
    /**
     * 成功次数
     */
    private Long successfulCalls;
    
    /**
     * 失败次数
     */
    private Long failedCalls;
    
    /**
     * 成功率
     */
    private Double successRate;
    
    /**
     * 平均响应时间（毫秒）
     */
    private Double averageResponseTimeMs;
    
    /**
     * 最小响应时间（毫秒）
     */
    private Long minResponseTimeMs;
    
    /**
     * 最大响应时间（毫秒）
     */
    private Long maxResponseTimeMs;
    
    /**
     * 响应时间分布
     */
    private Map<String, Long> responseTimeDistribution;
    
    /**
     * 最近N次执行的响应时间
     */
    private List<Long> recentResponseTimes;
}
