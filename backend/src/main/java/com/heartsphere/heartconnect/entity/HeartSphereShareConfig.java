package com.heartsphere.heartconnect.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 心域共享配置实体
 */
@Entity
@Table(name = "heartsphere_share_config")
@Data
public class HeartSphereShareConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "share_code", nullable = false, unique = true, length = 20)
    private String shareCode;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "share_type", nullable = false)
    private ShareType shareType = ShareType.ALL;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "share_status", nullable = false)
    private ShareStatus shareStatus = ShareStatus.ACTIVE;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "access_permission", nullable = false)
    private AccessPermission accessPermission = AccessPermission.APPROVAL;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;
    
    @Column(name = "view_count")
    private Integer viewCount = 0;
    
    @Column(name = "request_count")
    private Integer requestCount = 0;
    
    @Column(name = "approved_count")
    private Integer approvedCount = 0;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    /**
     * 共享类型枚举
     */
    public enum ShareType {
        ALL,      // 全部共享
        WORLD,    // 按世界共享
        ERA       // 按场景共享
    }
    
    /**
     * 共享状态枚举
     */
    public enum ShareStatus {
        ACTIVE,   // 已开启
        PAUSED,   // 已暂停
        CLOSED    // 已关闭
    }
    
    /**
     * 访问权限枚举
     */
    public enum AccessPermission {
        APPROVAL, // 需要审批
        FREE,     // 自由连接
        INVITE    // 邀请连接
    }
}

