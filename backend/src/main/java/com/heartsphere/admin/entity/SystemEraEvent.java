package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 系统预置时代事件实体
 * 用于存储系统预设的事件，关联到系统时代（SystemEra）
 */
@Data
@Entity
@Table(name = "system_era_events")
public class SystemEraEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // 事件名称

    @Column(nullable = false, unique = true, length = 100)
    private String eventId; // 事件ID（唯一标识，用于剧本中引用）

    @Column(columnDefinition = "TEXT")
    private String description; // 事件描述

    @Column(name = "system_era_id")
    private Long systemEraId; // 关联的系统预设时代ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_era_id", insertable = false, updatable = false)
    private SystemEra systemEra; // 关联的系统预设时代

    @Column(name = "icon_url", length = 500)
    private String iconUrl; // 事件图标URL

    @Column(length = 200)
    private String tags; // 标签（逗号分隔）

    @Column(name = "sort_order")
    private Integer sortOrder = 0; // 排序顺序

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 是否启用

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false; // 是否已删除（软删除）

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}




