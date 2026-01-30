package com.heartsphere.capability.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 角色能力档案实体
 * 存储角色的多维度能力评估结果
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "role_capability_profile", indexes = {
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_overall_score", columnList = "overall_score")
})
public class RoleCapabilityProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID（不建立外键，通过ID关联）
     */
    @Column(name = "character_id", nullable = false, unique = true)
    private Long characterId;
    
    /**
     * 技能维度得分
     */
    @Column(name = "skill_dimension_score", nullable = false)
    @Builder.Default
    private Integer skillDimensionScore = 0;
    
    /**
     * 记忆维度得分
     */
    @Column(name = "memory_dimension_score", nullable = false)
    @Builder.Default
    private Integer memoryDimensionScore = 0;
    
    /**
     * 意识维度得分
     */
    @Column(name = "consciousness_dimension_score", nullable = false)
    @Builder.Default
    private Integer consciousnessDimensionScore = 0;
    
    /**
     * 协作维度得分
     */
    @Column(name = "collaboration_dimension_score", nullable = false)
    @Builder.Default
    private Integer collaborationDimensionScore = 0;
    
    /**
     * 关系维度得分
     */
    @Column(name = "relationship_dimension_score", nullable = false)
    @Builder.Default
    private Integer relationshipDimensionScore = 0;
    
    /**
     * 导师能力得分
     */
    @Column(name = "mentorship_capability_score", nullable = false)
    @Builder.Default
    private Integer mentorshipCapabilityScore = 0;
    
    /**
     * 挚友能力得分
     */
    @Column(name = "companionship_capability_score", nullable = false)
    @Builder.Default
    private Integer companionshipCapabilityScore = 0;
    
    /**
     * 综合得分
     */
    @Column(name = "overall_score", nullable = false)
    @Builder.Default
    private Integer overallScore = 0;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
