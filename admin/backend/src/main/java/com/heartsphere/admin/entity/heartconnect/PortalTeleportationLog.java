package com.heartsphere.admin.entity.heartconnect;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 传送门传送记录实体
 */
@Entity
@Table(name = "portal_teleportation_log")
@Data
public class PortalTeleportationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "portal_id", nullable = false)
    private Long portalId;
    
    @Column(name = "visitor_id", nullable = false)
    private Long visitorId;
    
    @Column(name = "source_heartsphere_id")
    private Long sourceHeartsphereId; // user_id（通过逻辑关联，无外键）
    
    @Column(name = "source_scene_id")
    private Long sourceSceneId; // era_id
    
    @Column(name = "target_heartsphere_id")
    private Long targetHeartsphereId; // user_id（通过逻辑关联，无外键）
    
    @Column(name = "target_scene_id")
    private Long targetSceneId; // era_id
    
    @Column(name = "teleported_at", updatable = false)
    private LocalDateTime teleportedAt;
    
    @Column(name = "duration_ms")
    private Integer durationMs = 0;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private Status status = Status.SUCCESS;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @PrePersist
    protected void onCreate() {
        if (teleportedAt == null) {
            teleportedAt = LocalDateTime.now();
        }
    }
    
    /**
     * 传送状态枚举
     */
    public enum Status {
        SUCCESS,   // 成功
        FAILED,    // 失败
        CANCELLED  // 取消
    }
}
