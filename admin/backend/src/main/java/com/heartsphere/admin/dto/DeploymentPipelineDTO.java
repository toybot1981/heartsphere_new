package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 部署流程模板DTO
 */
@Data
public class DeploymentPipelineDTO {
    private Long id;
    private String name;
    private String description;
    private String environment;
    private String project; // main, admin, company, edu, mentis, shared, 或 "" 表示通用
    private Boolean isTemplate;
    private Long createdById;
    private String createdByUsername;
    private List<PipelineStepDTO> steps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
