package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 实体关系表
 * 用于存储实体之间的关系（场景、角色、事件、物品等）
 */
@Data
@Entity
@Table(name = "entity_relations", indexes = {
    @Index(name = "idx_source_entity", columnList = "source_entity_type,source_entity_id"),
    @Index(name = "idx_target_entity", columnList = "target_entity_type,target_entity_id"),
    @Index(name = "idx_relation_type", columnList = "relation_type")
})
public class EntityRelation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 源实体类型（era, character, event, item）
     */
    @Column(name = "source_entity_type", nullable = false, length = 50)
    private String sourceEntityType;
    
    /**
     * 源实体ID
     */
    @Column(name = "source_entity_id", nullable = false, length = 100)
    private String sourceEntityId;
    
    /**
     * 目标实体类型（era, character, event, item）
     */
    @Column(name = "target_entity_type", nullable = false, length = 50)
    private String targetEntityType;
    
    /**
     * 目标实体ID
     */
    @Column(name = "target_entity_id", nullable = false, length = 100)
    private String targetEntityId;
    
    /**
     * 关系类型（FRIEND, ENEMY, ALLY, etc.）
     */
    @Column(name = "relation_type", nullable = false, length = 50)
    private String relationType;
    
    /**
     * 关系强度（0-100）
     */
    @Column(name = "strength")
    private Integer strength;
    
    /**
     * 关系描述（可选）
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 关系元数据（JSON格式，存储额外信息）
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;
    
    /**
     * 创建者（用户ID）
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
