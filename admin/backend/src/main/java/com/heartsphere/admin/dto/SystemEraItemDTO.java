package com.heartsphere.admin.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 系统预置时代物品DTO
 * 包含关联的场景名称信息
 */
@Data
public class SystemEraItemDTO {
    private Long id;
    private String name;
    private String itemId;
    private String description;
    private Long systemEraId;
    private String systemEraName; // 关联的系统时代名称
    private String iconUrl;
    private String itemType;
    private String tags;
    private Integer sortOrder;
    private Boolean isActive;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 标识为系统预置物品
    private Boolean isSystem = true;
}
