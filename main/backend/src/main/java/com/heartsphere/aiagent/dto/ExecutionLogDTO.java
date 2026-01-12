package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Graph执行日志DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExecutionLogDTO {
    private Long id;
    private String executionId;
    private Long graphId;
    private String nodeId;
    private String nodeType;
    private String logType;
    private String message;
    private Map<String, Object> stateSnapshot;
    private String errorMessage;
    private Long executionTimeMs;
    private Integer stepNumber;
    private LocalDateTime createdAt;
}
