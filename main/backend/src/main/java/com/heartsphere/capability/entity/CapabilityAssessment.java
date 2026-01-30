package com.heartsphere.capability.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 能力评估记录实体
 * 记录角色的能力评估结果
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "capability_assessment", indexes = {
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_assessment_type", columnList = "assessment_type"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class CapabilityAssessment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID（不建立外键，通过ID关联）
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 评估类型
     * FULL - 全面评估
     * DIMENSION - 维度评估
     * RELATIONSHIP - 关系维度评估
     */
    @Column(name = "assessment_type", nullable = false, length = 50)
    private String assessmentType;
    
    /**
     * 技能维度得分
     */
    @Column(name = "skill_score", nullable = false)
    @Builder.Default
    private Integer skillScore = 0;
    
    /**
     * 记忆维度得分
     */
    @Column(name = "memory_score", nullable = false)
    @Builder.Default
    private Integer memoryScore = 0;
    
    /**
     * 意识维度得分
     */
    @Column(name = "consciousness_score", nullable = false)
    @Builder.Default
    private Integer consciousnessScore = 0;
    
    /**
     * 协作维度得分
     */
    @Column(name = "collaboration_score", nullable = false)
    @Builder.Default
    private Integer collaborationScore = 0;
    
    /**
     * 关系维度得分
     */
    @Column(name = "relationship_score", nullable = false)
    @Builder.Default
    private Integer relationshipScore = 0;
    
    /**
     * 导师能力得分
     */
    @Column(name = "mentorship_score", nullable = false)
    @Builder.Default
    private Integer mentorshipScore = 0;
    
    /**
     * 挚友能力得分
     */
    @Column(name = "companionship_score", nullable = false)
    @Builder.Default
    private Integer companionshipScore = 0;
    
    /**
     * 综合得分
     */
    @Column(name = "overall_score", nullable = false)
    @Builder.Default
    private Integer overallScore = 0;
    
    /**
     * 评估结果详情（JSON格式）
     */
    @Column(name = "assessment_result", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> assessmentResult;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
