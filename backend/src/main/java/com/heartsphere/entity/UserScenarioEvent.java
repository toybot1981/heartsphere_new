package com.heartsphere.entity;

import com.heartsphere.admin.entity.SystemEraEvent;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 用户场景事件实体
 * 用于存储用户在创建场景时，与场景节点关联的事件
 * 一个节点可以有多个事件
 */
@Data
@Entity
@Table(name = "user_scenario_events")
public class UserScenarioEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_id", nullable = false)
    private Script script; // 关联的剧本（用户场景）

    @Column(name = "node_id", length = 100)
    private String nodeId; // 节点ID（在剧本内容中的节点标识）

    @Column(name = "system_era_event_id")
    private Long systemEraEventId; // 关联的系统预置事件ID

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_era_event_id", insertable = false, updatable = false)
    private SystemEraEvent systemEraEvent; // 关联的系统预置事件

    @Column(nullable = false, length = 100)
    private String name; // 事件名称（如果使用系统事件，则为系统事件名称；否则为用户自定义名称）

    @Column(nullable = false, length = 100)
    private String eventId; // 事件ID（唯一标识，用于剧本中引用）

    @Column(columnDefinition = "TEXT")
    private String description; // 事件描述

    @Column(name = "icon_url", length = 500)
    private String iconUrl; // 事件图标URL

    @Column(length = 200)
    private String tags; // 标签（逗号分隔）

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false; // 是否为用户自定义事件（false表示使用系统事件）

    @Column(name = "sort_order")
    private Integer sortOrder = 0; // 排序顺序

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

