package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

/**
 * 心域共享配置DTO（管理端）
 * 
 * @author HeartSphere
 * @date 2025-12-29
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartSphereShareConfigDTO {
    
    private Long id;
    private Long userId;
    private String username;
    private String userEmail;
    
    // 共享配置信息
    private String shareType; // ALL/WORLD/ERA
    private String accessType; // APPROVAL/FREE
    private String shareCode;
    private String qrCodeUrl;
    private String status; // ACTIVE/DISABLED/PAUSED
    
    // 共享范围
    private List<ShareScopeDTO> shareScopes;
    
    // 统计信息
    private Long accessCount; // 访问次数
    private Long visitorCount; // 访问人数
    private Long connectionRequestCount; // 连接请求数
    private Long approvedRequestCount; // 已批准请求数
    
    // 时间信息
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastAccessedAt;
    
    /**
     * 共享范围DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareScopeDTO {
        private Long worldId;
        private String worldName;
        private Long eraId;
        private String eraName;
    }
}




