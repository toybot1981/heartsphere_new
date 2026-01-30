package com.heartsphere.admin.dto;

import com.heartsphere.admin.entity.EnvironmentVariable;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 环境变量 DTO
 */
@Data
public class EnvironmentVariableDTO {
    private Long id;
    private String name;
    private String value;  // 敏感值会被掩码
    private EnvironmentVariable.Scope scope;
    private String project;
    private String module;
    private Long pipelineId;
    private String environment;
    private Boolean sensitive;
    private String description;
    private String validationRule;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    
    /**
     * 是否显示真实值（用于前端控制）
     */
    private Boolean showValue = false;
}
