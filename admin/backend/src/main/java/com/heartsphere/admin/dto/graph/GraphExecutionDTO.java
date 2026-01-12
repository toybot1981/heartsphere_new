package com.heartsphere.admin.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Graph执行DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GraphExecutionDTO {
    private Long id;
    private String executionId;
    private Long graphId;
    private String status;
    private String currentNodeId;
    private String waitType;
    private String waitingNodeId;
    private Integer stepCount;
    private Map<String, Object> state; // GraphState数据
    private Map<String, Object> contextData; // 执行上下文数据
    private String errorMessage;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
}
