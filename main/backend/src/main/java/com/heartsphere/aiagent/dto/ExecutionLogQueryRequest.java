package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Graph执行日志查询请求DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionLogQueryRequest {
    /**
     * 执行ID（可选）
     */
    private String executionId;
    
    /**
     * Graph ID（可选）
     */
    private Long graphId;
    
    /**
     * 节点ID（可选）
     */
    private String nodeId;
    
    /**
     * 日志类型（可选）
     */
    private String logType;
    
    /**
     * 开始时间（可选）
     */
    private LocalDateTime startTime;
    
    /**
     * 结束时间（可选）
     */
    private LocalDateTime endTime;
    
    /**
     * 页码（从0开始）
     */
    @Builder.Default
    private Integer page = 0;
    
    /**
     * 每页大小
     */
    @Builder.Default
    private Integer size = 50;
}
