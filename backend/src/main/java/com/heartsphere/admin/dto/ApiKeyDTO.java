package com.heartsphere.admin.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * API Key DTO
 */
@Data
public class ApiKeyDTO {
    private Long id;
    private String keyName;
    private String apiKey; // 仅在创建时返回完整Key，列表查询时不返回
    private Long userId;
    private Boolean isActive;
    private LocalDateTime expiresAt;
    private LocalDateTime lastUsedAt;
    private Long usageCount;
    private Integer rateLimit;
    private String description;
    private Long createdByAdminId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * 是否已过期
     */
    public Boolean getIsExpired() {
        if (expiresAt == null) {
            return false;
        }
        return expiresAt.isBefore(LocalDateTime.now());
    }
}




