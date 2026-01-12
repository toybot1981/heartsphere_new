package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 提示词变量DTO
 */
@Data
public class PromptVariableDTO {
    private Long id;
    private Long templateId;
    private String variableName;
    private String variableType; // string, number, boolean, array, object
    private String description;
    private String defaultValue;
    private Boolean isRequired;
    private Map<String, Object> validationRule; // 验证规则
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
