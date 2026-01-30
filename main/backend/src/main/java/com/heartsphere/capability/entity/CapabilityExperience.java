package com.heartsphere.capability.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 能力经验值实体
 * 存储角色在各维度的经验值
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "capability_experience", indexes = {
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_total_experience", columnList = "total_experience")
})
public class CapabilityExperience {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID（不建立外键，通过ID关联）
     */
    @Column(name = "character_id", nullable = false, unique = true)
    private Long characterId;
    
    /**
     * 技能经验值
     */
    @Column(name = "skill_experience", nullable = false)
    @Builder.Default
    private Long skillExperience = 0L;
    
    /**
     * 记忆经验值
     */
    @Column(name = "memory_experience", nullable = false)
    @Builder.Default
    private Long memoryExperience = 0L;
    
    /**
     * 意识经验值
     */
    @Column(name = "consciousness_experience", nullable = false)
    @Builder.Default
    private Long consciousnessExperience = 0L;
    
    /**
     * 协作经验值
     */
    @Column(name = "collaboration_experience", nullable = false)
    @Builder.Default
    private Long collaborationExperience = 0L;
    
    /**
     * 关系维度经验值
     */
    @Column(name = "relationship_experience", nullable = false)
    @Builder.Default
    private Long relationshipExperience = 0L;
    
    /**
     * 导师能力经验值
     */
    @Column(name = "mentorship_experience", nullable = false)
    @Builder.Default
    private Long mentorshipExperience = 0L;
    
    /**
     * 挚友能力经验值
     */
    @Column(name = "companionship_experience", nullable = false)
    @Builder.Default
    private Long companionshipExperience = 0L;
    
    /**
     * 总经验值
     */
    @Column(name = "total_experience", nullable = false)
    @Builder.Default
    private Long totalExperience = 0L;
    
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
        calculateTotalExperience();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        calculateTotalExperience();
    }
    
    /**
     * 计算总经验值
     */
    private void calculateTotalExperience() {
        totalExperience = skillExperience + memoryExperience + consciousnessExperience
                + collaborationExperience + relationshipExperience
                + mentorshipExperience + companionshipExperience;
    }
}
