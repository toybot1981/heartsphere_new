package com.heartsphere.admin.entity.cmdb;

import com.heartsphere.admin.entity.SystemAdmin;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 资产实体
 */
@Data
@Entity
@Table(name = "cmdb_assets", indexes = {
    @Index(name = "idx_type_id", columnList = "type_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_owner_id", columnList = "owner_id"),
    @Index(name = "idx_name", columnList = "name"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class Asset {
    
    /**
     * 资产状态枚举
     */
    public enum AssetStatus {
        ACTIVE,      // 活跃
        INACTIVE,    // 非活跃
        DEPRECATED,  // 已弃用
        DELETED      // 已删除
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private AssetType type;
    
    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AssetStatus status = AssetStatus.ACTIVE;
    
    @Column(name = "version", length = 100)
    private String version;
    
    @Column(name = "location", length = 500)
    private String location;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private SystemAdmin owner;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "attributes", columnDefinition = "JSON")
    private String attributes; // JSON格式的扩展属性
    
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private SystemAdmin createdBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
