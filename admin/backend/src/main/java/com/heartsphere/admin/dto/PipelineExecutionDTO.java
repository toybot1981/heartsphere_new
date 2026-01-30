package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 流程执行DTO
 */
@Data
public class PipelineExecutionDTO {
    private Long id;
    private Long pipelineId;
    private String pipelineName;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private Long executedById;
    private String executedByUsername;
    private List<PipelineStepExecutionDTO> stepExecutions;
    private Long durationSeconds;
    private Integer totalSteps;
    private Integer completedSteps;
    private Integer successSteps;
    private Integer failedSteps;
}
