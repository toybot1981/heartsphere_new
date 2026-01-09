package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 提示词模板DTO
 */
@Data
public class PromptTemplateDTO {
    private Long id;
    private String name;
    private String categoryCode;
    private String categoryName;
    private String description;
    private String systemPrompt;
    private String userPrompt;
    private Map<String, Object> variables; // 变量定义
    private Map<String, Object> exampleData; // 示例数据
    private Integer version;
    private Boolean isActive;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
