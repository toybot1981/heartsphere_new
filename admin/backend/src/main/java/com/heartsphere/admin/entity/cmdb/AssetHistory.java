package com.heartsphere.admin.entity.cmdb;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 资产历史实体
 */
@Data
@Entity
@Table(name = "cmdb_asset_history", indexes = {
    @Index(name = "idx_asset_id", columnList = "asset_id"),
    @Index(name = "idx_action", columnList = "action"),
    @Index(name = "idx_changed_by", columnList = "changed_by"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
public class AssetHistory {
    
    /**
     * 操作类型枚举
     */
    public enum ActionType {
        CREATE,
        UPDATE,
        DELETE
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;
    
    @Column(name = "action", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ActionType action;
    
    @Column(name = "changed_by")
    private Long changedBy; // 变更人ID（关联system_admins表）
    
    @Column(name = "old_value", columnDefinition = "JSON")
    private String oldValue; // JSON格式的变更前值
    
    @Column(name = "new_value", columnDefinition = "JSON")
    private String newValue; // JSON格式的变更后值
    
    @Column(name = "change_summary", columnDefinition = "TEXT")
    private String changeSummary;
    
    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;
    
    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
