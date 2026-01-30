package com.heartsphere.capability.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * 能力协同日志实体
 * 记录能力之间的协同效果
 * 
 * @author HeartSphere
 * @date 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "capability_synergy_log", indexes = {
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_synergy_type", columnList = "synergy_type"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class CapabilitySynergyLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID（不建立外键，通过ID关联）
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 协同类型
     * SKILL_MEMORY, SKILL_CONSCIOUSNESS, MEMORY_CONSCIOUSNESS,
     * RELATIONSHIP_SKILL, RELATIONSHIP_MEMORY, RELATIONSHIP_CONSCIOUSNESS
     */
    @Column(name = "synergy_type", nullable = false, length = 50)
    private String synergyType;
    
    /**
     * 源维度
     */
    @Column(name = "source_dimension", nullable = false, length = 50)
    private String sourceDimension;
    
    /**
     * 目标维度
     */
    @Column(name = "target_dimension", nullable = false, length = 50)
    private String targetDimension;
    
    /**
     * 协同效果（0-1）
     */
    @Column(name = "synergy_effect", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal synergyEffect = BigDecimal.ZERO;
    
    /**
     * 协同元数据（JSON格式）
     */
    @Column(name = "metadata", columnDefinition = "JSON")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> metadata;
    
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
