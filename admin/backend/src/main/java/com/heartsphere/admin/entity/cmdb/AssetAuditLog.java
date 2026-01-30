package com.heartsphere.admin.entity.cmdb;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 资产审计日志实体
 */
@Data
@Entity
@Table(name = "cmdb_audit_logs", indexes = {
    @Index(name = "idx_asset_id", columnList = "asset_id"),
    @Index(name = "idx_operation", columnList = "operation"),
    @Index(name = "idx_operator_id", columnList = "operator_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class AssetAuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset; // 可为空，表示系统级操作
    
    @Column(name = "operation", nullable = false, length = 50)
    private String operation; // 操作类型
    
    @Column(name = "operator_id")
    private Long operatorId; // 操作人ID
    
    @Column(name = "operator_name", length = 200)
    private String operatorName; // 操作人名称
    
    @Column(name = "details", columnDefinition = "JSON")
    private String details; // JSON格式的操作详情
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
