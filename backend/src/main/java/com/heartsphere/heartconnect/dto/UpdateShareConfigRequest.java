package com.heartsphere.heartconnect.dto;

import lombok.Data;
import java.util.List;

/**
 * 更新共享配置请求DTO
 */
@Data
public class UpdateShareConfigRequest {
    private String shareType; // "all", "world", "era"
    private String shareStatus; // "active", "paused", "closed"
    private String accessPermission; // "approval", "free", "invite"
    private String description;
    private String coverImageUrl;
    private List<ShareScopeItem> scopes; // 共享范围
    private Long expiresAt; // 过期时间（可选）
    
    /**
     * 共享范围项
     */
    @Data
    public static class ShareScopeItem {
        private String scopeType; // "world", "era"
        private Long scopeId;
    }
}

