package com.heartsphere.admin.dto;

import com.heartsphere.admin.entity.EnvironmentVariableTemplate;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 环境变量模板 DTO
 */
@Data
public class EnvironmentVariableTemplateDTO {
    private Long id;
    private String name;
    private String description;
    private String environment;
    private EnvironmentVariableTemplate.Scope scope;
    private String project;
    private String module;
    private Boolean isDefault;
    private LocalDateTime createdAt;
    private String createdBy;
    private List<EnvironmentVariableDTO> variables = new ArrayList<>();
}
