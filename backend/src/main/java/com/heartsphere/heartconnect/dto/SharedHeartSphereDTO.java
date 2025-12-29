package com.heartsphere.heartconnect.dto;

import lombok.Data;

/**
 * 共享心域DTO（用于发现页面）
 */
@Data
public class SharedHeartSphereDTO {
    private Long shareConfigId;
    private String shareCode;
    private Long ownerId;
    private String ownerName;
    private String ownerAvatar;
    private String heartSphereName; // 心域名称（用户昵称或自定义名称）
    private String description;
    private String coverImageUrl;
    private String shareType; // "all", "world", "era"
    private String accessPermission; // "approval", "free", "invite"
    private Integer viewCount;
    private Integer requestCount;
    private Integer approvedCount;
    
    // 共享范围统计
    private Integer worldCount;
    private Integer eraCount;
    private Integer characterCount;
    
    // 请求状态（如果已发送请求）
    private String requestStatus; // "pending", "approved", "rejected", null
    private Long requestedAt;
}

