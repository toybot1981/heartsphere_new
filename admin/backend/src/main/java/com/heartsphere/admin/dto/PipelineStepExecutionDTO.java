package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 步骤执行记录DTO
 */
@Data
public class PipelineStepExecutionDTO {
    private Long id;
    private Long pipelineExecutionId;
    private Long stepId;
    private String stepName;
    private String scriptId;
    private String scriptName;
    private Long scriptExecutionId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private String error;
    private Long durationSeconds;
}
