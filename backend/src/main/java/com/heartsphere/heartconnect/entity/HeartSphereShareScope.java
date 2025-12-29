package com.heartsphere.heartconnect.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 共享范围实体
 * 存储共享的世界或场景
 */
@Entity
@Table(name = "heartsphere_share_scope")
@Data
public class HeartSphereShareScope {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "share_config_id", nullable = false)
    private Long shareConfigId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "scope_type", nullable = false)
    private ScopeType scopeType;
    
    @Column(name = "scope_id", nullable = false)
    private Long scopeId;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    /**
     * 范围类型枚举
     */
    public enum ScopeType {
        WORLD,  // 世界
        ERA     // 场景
    }
}

