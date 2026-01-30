package com.heartsphere.memory.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 角色学习历史实体
 * 用于追踪角色的学习事件和成长过程
 * 
 * @author HeartSphere
 * @date 2026-01-24
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_learning_history", indexes = {
    @Index(name = "idx_character_event_time", columnList = "character_id,created_at"),
    @Index(name = "idx_event_type", columnList = "event_type")
})
public class CharacterLearningHistoryEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 事件类型
     * ASSET_PROMOTED - 资产升级
     * ASSET_UPDATED - 资产更新
     * LEVEL_UP - 等级提升
     * FEEDBACK_RECEIVED - 反馈接收
     */
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;
    
    /**
     * 关联的资产ID
     */
    @Column(name = "asset_id")
    private Long assetId;
    
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
