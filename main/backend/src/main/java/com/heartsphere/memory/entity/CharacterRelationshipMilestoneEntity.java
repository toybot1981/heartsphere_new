package com.heartsphere.memory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 角色关系里程碑实体
 * 用于记录角色与用户关系的重要里程碑，如阶段转换、情感连接等
 * 
 * @author HeartSphere
 * @date 2026-01-25
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_relationship_milestones", indexes = {
    @Index(name = "idx_character_user_time", columnList = "character_id,user_id,created_at"),
    @Index(name = "idx_milestone_type", columnList = "milestone_type"),
    @Index(name = "idx_stage_transition", columnList = "from_stage,to_stage"),
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_user_id", columnList = "user_id")
})
public class CharacterRelationshipMilestoneEntity {
    
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
     * 里程碑类型
     * STAGE_TRANSITION - 阶段转换
     * EMOTIONAL_CONNECTION - 情感连接
     * SHARED_EXPERIENCE - 共同经历
     */
    @Column(name = "milestone_type", nullable = false, length = 50)
    private String milestoneType;
    
    /**
     * 起始阶段
     * STRANGER/FRIEND/CLOSE_FRIEND/MENTOR
     */
    @Column(name = "from_stage", length = 20)
    private String fromStage;
    
    /**
     * 目标阶段
     * STRANGER/FRIEND/CLOSE_FRIEND/MENTOR
     */
    @Column(name = "to_stage", length = 20)
    private String toStage;
    
    /**
     * 里程碑标题
     */
    @Column(name = "title", nullable = false, length = 255)
    private String title;
    
    /**
     * 里程碑描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    /**
     * 里程碑元数据（JSON格式）
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
