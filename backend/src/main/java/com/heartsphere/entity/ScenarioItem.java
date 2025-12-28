package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 剧本物品实体（用于剧本系统中的物品管理）
 */
@Data
@Entity
@Table(name = "scenario_items")
public class ScenarioItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name; // 物品名称

    @Column(nullable = false, unique = true, length = 100)
    private String itemId; // 物品ID（唯一标识，用于剧本中引用）

    @Column(columnDefinition = "TEXT")
    private String description; // 物品描述

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "era_id")
    private Era era; // 所属场景（用户创建的场景）

    @Column(name = "system_era_id")
    private Long systemEraId; // 关联的系统预设时代ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // 创建者（用户创建的自定义物品）

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = false; // 是否为系统预设物品

    @Column(name = "icon_url", length = 500)
    private String iconUrl; // 物品图标URL

    @Column(name = "item_type", length = 50)
    private String itemType; // 物品类型：weapon, tool, key, consumable, collectible等

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

