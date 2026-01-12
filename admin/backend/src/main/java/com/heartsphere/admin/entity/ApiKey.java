package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * API Key实体
 * 用于外部业务系统访问AI服务的认证
 */
@Data
@Entity
@Table(name = "api_keys")
public class ApiKey {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "key_name", nullable = false, length = 100)
    private String keyName; // API Key名称（用于管理）

    @Column(name = "api_key", nullable = false, unique = true, length = 64)
    private String apiKey; // API Key值（存储明文，因为需要用于验证）

    @Column(name = "user_id", nullable = true)
    private Long userId; // 关联的用户ID（可选，如果关联用户则使用该用户的配额）

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 是否启用

    @Column(name = "expires_at", nullable = true)
    private LocalDateTime expiresAt; // 过期时间（可选）

    @Column(name = "last_used_at", nullable = true)
    private LocalDateTime lastUsedAt; // 最后使用时间

    @Column(name = "usage_count", nullable = false)
    private Long usageCount = 0L; // 使用次数

    @Column(name = "rate_limit", nullable = true)
    private Integer rateLimit; // 速率限制（每分钟请求数，可选）

    @Column(name = "description", length = 500)
    private String description; // 描述信息

    @Column(name = "created_by_admin_id", nullable = true)
    private Long createdByAdminId; // 创建该API Key的管理员ID

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}




