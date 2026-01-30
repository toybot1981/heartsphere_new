package com.heartsphere.admin.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

/**
 * 多智能体协作统计 DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentCollaborationStatisticsDTO {
    
    /**
     * 总协作数
     */
    private Long totalCollaborations;
    
    /**
     * 成功数
     */
    private Long successfulCollaborations;
    
    /**
     * 失败数
     */
    private Long failedCollaborations;
    
    /**
     * 运行中数
     */
    private Long runningCollaborations;
    
    /**
     * 成功率（百分比）
     */
    private Double successRate;
    
    /**
     * 平均执行时间（毫秒）
     */
    private Double averageExecutionTimeMs;
    
    /**
     * 最长执行时间（毫秒）
     */
    private Long maxExecutionTimeMs;
    
    /**
     * 各智能体的调用次数
     */
    private Map<String, Long> agentCallCounts;
    
    /**
     * 各智能体的成功率
     */
    private Map<String, Double> agentSuccessRates;
    
    /**
     * 按时间维度的统计（日、周、月）
     */
    private Map<String, Object> timeBasedStatistics;
}
