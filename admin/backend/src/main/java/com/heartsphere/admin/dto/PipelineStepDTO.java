package com.heartsphere.admin.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 流程步骤DTO
 */
@Data
public class PipelineStepDTO {
    private Long id;
    private Long pipelineId;
    private String name;
    private String scriptId;
    private String scriptName;
    private Integer order;
    private List<Integer> dependsOn; // 依赖的步骤order列表
    private Map<String, Object> parameters;
    private String condition;
    private Boolean parallel;
    private Boolean required;
}
