package com.heartsphere.heartconnect.dto;

import lombok.Data;
import java.util.List;

/**
 * 创建共享配置请求DTO
 */
@Data
public class CreateShareConfigRequest {
    private String shareType; // "all", "world", "era"
    private String accessPermission; // "approval", "free", "invite"
    private String description;
    private String coverImageUrl;
    private List<ShareScopeItem> scopes; // 共享范围（当shareType为world或era时必填）
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

