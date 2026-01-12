package com.heartsphere.admin.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Graph执行查询请求DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionQueryRequest {
    /**
     * Graph ID（可选）
     */
    private Long graphId;
    
    /**
     * 状态（可选）
     */
    private String status;
    
    /**
     * 创建者ID（可选）
     */
    private Long createdBy;
    
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
    private Integer size = 20;
}
