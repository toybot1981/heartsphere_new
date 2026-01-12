package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemScriptDTO {
    private Long id;
    private String title;
    private String description;
    private String content; // JSON格式
    private Integer sceneCount;
    private Long systemEraId;
    private String eraName; // 时代名称
    private String characterIds; // JSON数组格式
    private String tags;
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}



