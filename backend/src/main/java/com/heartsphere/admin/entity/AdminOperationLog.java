/**
 * 管理员操作日志实体
 */
package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 管理员操作日志
 */
@Data
@Entity
@Table(name = "admin_operation_logs", indexes = {
    @Index(name = "idx_admin_time", columnList = "admin_id,created_at"),
    @Index(name = "idx_module", columnList = "module,created_at")
})
public class AdminOperationLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "operation_type", nullable = false, length = 20)
    private String operationType; // view/edit/delete/export

    @Column(nullable = false, length = 50)
    private String module; // 功能模块

    @Column(name = "target_id")
    private Long targetId; // 目标对象ID

    @Column(name = "operation_content", columnDefinition = "TEXT")
    private String operationContent; // 操作内容

    @Column(name = "operation_result", length = 20)
    private String operationResult; // success/failed

    @Column(name = "ip_address", length = 50)
    private String ipAddress; // IP地址

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}




