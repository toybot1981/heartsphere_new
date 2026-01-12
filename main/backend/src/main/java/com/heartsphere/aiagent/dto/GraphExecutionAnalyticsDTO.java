package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Graph执行分析DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionAnalyticsDTO {
    /**
     * 总执行次数
     */
    private Long totalExecutions;
    
    /**
     * 成功执行次数
     */
    private Long completedExecutions;
    
    /**
     * 失败执行次数
     */
    private Long failedExecutions;
    
    /**
     * 取消执行次数
     */
    private Long cancelledExecutions;
    
    /**
     * 成功率（百分比）
     */
    private Double successRate;
    
    /**
     * 平均执行步骤数
     */
    private Double averageStepCount;
    
    /**
     * 平均执行时间（秒）
     */
    private Double averageExecutionTime;
    
    /**
     * 按状态统计
     */
    private Map<String, Long> statusCounts;
    
    /**
     * 按日期统计（可选）
     */
    private Map<String, Long> dailyCounts;
}
