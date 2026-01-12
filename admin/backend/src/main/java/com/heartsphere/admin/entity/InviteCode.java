package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 邀请码实体
 */
@Data
@Entity
@Table(name = "system_invite_codes")
public class InviteCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code; // 邀请码

    @Column(name = "is_used", nullable = false)
    private Boolean isUsed = false; // 是否已使用

    @Column(name = "used_by_user_id")
    private Long usedByUserId; // 使用该邀请码的用户ID

    @Column(name = "used_at")
    private LocalDateTime usedAt; // 使用时间

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt; // 过期时间

    @Column(name = "created_by_admin_id")
    private Long createdByAdminId; // 创建该邀请码的管理员ID

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}



