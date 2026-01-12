package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 系统配置实体（用于存储邀请码开关等系统设置）
 * 注意：此实体直接访问数据库，admin 只负责配置
 */
@Data
@Entity
@Table(name = "system_config")
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "config_key", nullable = false, unique = true, length = 100)
    private String configKey; // 配置键，如 "invite_code_required"

    @Column(name = "config_value", nullable = false, length = 500)
    private String configValue; // 配置值，如 "true" 或 "false"

    @Column(length = 500)
    private String description; // 配置描述

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
