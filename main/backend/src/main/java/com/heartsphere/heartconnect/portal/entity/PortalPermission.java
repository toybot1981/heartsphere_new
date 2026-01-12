package com.heartsphere.heartconnect.portal.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 传送门权限实体
 */
@Entity
@Table(name = "portal_permission")
@Data
public class PortalPermission {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "portal_id", nullable = false)
    private Long portalId;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "permission_type", nullable = false)
    private PermissionType permissionType;
    
    @Column(name = "invited_by")
    private Long invitedBy;
    
    @Column(name = "invited_at", updatable = false)
    private LocalDateTime invitedAt;
    
    @PrePersist
    protected void onCreate() {
        if (invitedAt == null) {
            invitedAt = LocalDateTime.now();
        }
    }
    
    /**
     * 权限类型枚举
     */
    public enum PermissionType {
        APPROVED,  // 已批准
        INVITED    // 已邀请
    }
}
