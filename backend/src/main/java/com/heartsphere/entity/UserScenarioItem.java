package com.heartsphere.entity;

import com.heartsphere.admin.entity.SystemEraItem;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 用户场景物品实体
 * 用于存储用户在创建场景时，与场景节点关联的物品
 * 一个节点可以有多个物品
 */
@Data
@Entity
@Table(name = "user_scenario_items")
public class UserScenarioItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_id", nullable = false)
    private Script script; // 关联的剧本（用户场景）

    @Column(name = "node_id", length = 100)
    private String nodeId; // 节点ID（在剧本内容中的节点标识）

    @Column(name = "system_era_item_id")
    private Long systemEraItemId; // 关联的系统预置物品ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_era_item_id", insertable = false, updatable = false)
    private SystemEraItem systemEraItem; // 关联的系统预置物品

    @Column(nullable = false, length = 100)
    private String name; // 物品名称（如果使用系统物品，则为系统物品名称；否则为用户自定义名称）

    @Column(nullable = false, length = 100)
    private String itemId; // 物品ID（唯一标识，用于剧本中引用）

    @Column(columnDefinition = "TEXT")
    private String description; // 物品描述

    @Column(name = "icon_url", length = 500)
    private String iconUrl; // 物品图标URL

    @Column(name = "item_type", length = 50)
    private String itemType; // 物品类型：weapon, tool, key, consumable, collectible等

    @Column(length = 200)
    private String tags; // 标签（逗号分隔）

    @Column
    private Integer quantity = 1; // 数量

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false; // 是否为用户自定义物品（false表示使用系统物品）

    @Column(name = "sort_order")
    private Integer sortOrder = 0; // 排序顺序

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}



