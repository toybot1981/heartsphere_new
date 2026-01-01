package com.heartsphere.heartconnect.dto;

import lombok.Data;
import java.util.List;

/**
 * 共享配置DTO
 */
@Data
public class ShareConfigDTO {
    private Long id;
    private Long userId;
    private String ownerName; // 主人昵称
    private String shareCode;
    private String shareType; // "all", "world", "era"
    private String shareStatus; // "active", "paused", "closed"
    private String accessPermission; // "approval", "free", "invite"
    private String description;
    private String coverImageUrl;
    private Integer viewCount;
    private Integer requestCount;
    private Integer approvedCount;
    private Long createdAt;
    private Long updatedAt;
    private Long expiresAt;
    
    // 共享范围
    private List<ShareScopeDTO> scopes;
    
    // 统计信息
    private Integer worldCount;
    private Integer eraCount;
    private Integer characterCount;
}

