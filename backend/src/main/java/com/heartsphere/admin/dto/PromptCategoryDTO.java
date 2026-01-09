package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 提示词分类DTO
 */
@Data
public class PromptCategoryDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private Long parentId;
    private Integer sortOrder;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
