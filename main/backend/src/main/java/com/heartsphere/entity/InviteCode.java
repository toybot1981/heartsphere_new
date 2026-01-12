package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 邀请码实体
 * 注意：此实体直接访问数据库，admin 只负责配置
 */
@Data
@Entity
@Table(name = "invite_codes")
public class InviteCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code; // 邀请码

    @Column(name = "max_uses")
    private Integer maxUses; // 最大使用次数（null表示无限制）

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0; // 已使用次数

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false; // 是否已使用（兼容旧字段）

    @Column(name = "used_by_user_id")
    private Long usedByUserId; // 使用该邀请码的用户ID

    @Column(name = "used_at")
    private LocalDateTime usedAt; // 使用时间

    @Column(name = "expires_at")
    private LocalDateTime expiresAt; // 过期时间（null表示永不过期）

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 是否启用

    @Column(length = 500)
    private String description; // 描述

    @Column(name = "created_by_admin_id")
    private Long createdByAdminId; // 创建者管理员ID

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
