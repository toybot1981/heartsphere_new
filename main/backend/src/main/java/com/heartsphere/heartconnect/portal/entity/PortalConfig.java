package com.heartsphere.heartconnect.portal.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 传送门配置实体
 * 参考HeartSphereShareConfig的设计模式
 */
@Entity
@Table(name = "portal_config")
@Data
public class PortalConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "scene_id", nullable = false)
    private Long sceneId; // era_id
    
    @Column(name = "portal_name", nullable = false, length = 100)
    private String portalName;
    
    @Convert(converter = com.heartsphere.heartconnect.portal.entity.converter.PortalTypeConverter.class)
    @Column(name = "portal_type", nullable = false)
    private PortalType portalType = PortalType.STARGATE;
    
    @Column(name = "target_heartsphere_id")
    private Long targetHeartsphereId; // user_id（通过逻辑关联，无外键）
    
    @Column(name = "target_share_code", length = 20)
    private String targetShareCode; // 用于快速查找目标心域
    
    @Column(name = "position_x", columnDefinition = "DOUBLE(10,2) DEFAULT 0.0")
    private Double positionX = 0.0;
    
    @Column(name = "position_y", columnDefinition = "DOUBLE(10,2) DEFAULT 0.0")
    private Double positionY = 0.0;
    
    @Column(name = "position_z", columnDefinition = "DOUBLE(10,2) DEFAULT 0.0")
    private Double positionZ = 0.0;
    
    @Column(name = "size", columnDefinition = "DOUBLE(5,2) DEFAULT 3.0")
    private Double size = 3.0; // 默认3米
    
    @Convert(converter = com.heartsphere.heartconnect.portal.entity.converter.PermissionTypeConverter.class)
    @Column(name = "permission_type", nullable = false)
    private PermissionType permissionType = PermissionType.APPROVAL;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
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
     * 传送门类型枚举
     */
    public enum PortalType {
        STARGATE,  // 星门传送门
        WORMHOLE,  // 虫洞传送门
        QUANTUM,   // 量子传送门
        GARDEN,    // 花园传送门 - 典雅轻柔
        SAKURA,    // 樱花传送门 - 典雅轻柔
        BUTTERFLY, // 蝴蝶传送门 - 典雅轻柔
        RAINBOW    // 彩虹传送门 - 典雅轻柔
    }
    
    /**
     * 权限类型枚举
     */
    public enum PermissionType {
        PUBLIC,    // 公开
        APPROVAL,  // 需要审批
        INVITE     // 邀请制
    }
}
