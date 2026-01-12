package com.heartsphere.heartconnect.dto;

import lombok.Data;

/**
 * 共享范围DTO
 */
@Data
public class ShareScopeDTO {
    private Long id;
    private Long shareConfigId;
    private String scopeType; // "world", "era"
    private Long scopeId;
    private String scopeName; // 世界或场景名称
    private Long createdAt;
}

