package com.heartsphere.memory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 角色成长事件实体
 * 用于记录角色的成长事件，包括学习、反思、能力提升等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_growth_events", indexes = {
    @Index(name = "idx_character_user_time", columnList = "character_id,user_id,created_at"),
    @Index(name = "idx_event_type", columnList = "event_type"),
    @Index(name = "idx_event_category", columnList = "event_category"),
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
public class CharacterGrowthEventEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 用户ID
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    /**
     * 事件类型
     * LEARNING - 学习事件
     * REFLECTION - 反思事件
     * ABILITY_UPGRADE - 能力提升
     * RELATIONSHIP_PROGRESS - 关系进展
     */
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;
    
    /**
     * 事件分类
     * SELF_GROWTH - 自我成长
     * COMPANIONSHIP - 挚友能力
     * MENTORSHIP - 导师能力
     */
    @Column(name = "event_category", length = 50)
    private String eventCategory;
    
    /**
     * 事件标题
     */
    @Column(name = "title", length = 255)
    private String title;
    
    /**
     * 事件描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 事件元数据（JSON格式）
     */
    @Column(name = "metadata", columnDefinition = "JSON")
    private String metadata;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
