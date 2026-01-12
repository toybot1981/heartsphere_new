package com.heartsphere.heartconnect.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 连接记录实体
 * 记录已建立的连接
 */
@Entity
@Table(name = "heartsphere_connection")
@Data
public class HeartSphereConnection {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "share_config_id", nullable = false)
    private Long shareConfigId;
    
    @Column(name = "visitor_id", nullable = false)
    private Long visitorId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "connection_status", nullable = false)
    private ConnectionStatus connectionStatus = ConnectionStatus.ACTIVE;
    
    @Column(name = "connected_at", updatable = false)
    private LocalDateTime connectedAt;
    
    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
    
    @Column(name = "ended_at")
    private LocalDateTime endedAt;
    
    @Column(name = "visit_duration")
    private Integer visitDuration = 0;
    
    @PrePersist
    protected void onCreate() {
        connectedAt = LocalDateTime.now();
        lastAccessedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (connectionStatus == ConnectionStatus.ENDED && endedAt == null) {
            endedAt = LocalDateTime.now();
        }
    }
    
    /**
     * 连接状态枚举
     */
    public enum ConnectionStatus {
        ACTIVE,   // 活跃
        ENDED,    // 已结束
        EXPIRED   // 已过期
    }
}

