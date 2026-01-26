package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 角色技能装备实体
 * 管理角色装备的技能及其配置
 * 
 * 技能系统独立模块
 * 注意：不直接关联 Character 实体，只存储 character_id，保持模块独立
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "character_skill_bindings", 
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_character_skill", columnNames = {"character_id", "skill_id"})
    },
    indexes = {
        @Index(name = "idx_character_id", columnList = "character_id"),
        @Index(name = "idx_skill_id", columnList = "skill_id"),
        @Index(name = "idx_is_enabled", columnList = "is_enabled"),
        @Index(name = "idx_auto_trigger", columnList = "auto_trigger"),
        @Index(name = "idx_priority", columnList = "priority")
    }
)
public class CharacterSkillBinding {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID
     * 注意：不建立 JPA 关系，只存储 ID，保持模块独立
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 技能ID
     * 注意：不建立 JPA 关系，只存储 ID，保持模块独立
     */
    @Column(name = "skill_id", nullable = false, length = 100)
    private String skillId;
    
    /**
     * 是否启用（装备后可以启用/禁用）
     */
    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;
    
    /**
     * 是否自动触发（AI自动判断是否使用）
     */
    @Column(name = "auto_trigger", nullable = false)
    @Builder.Default
    private Boolean autoTrigger = false;
    
    /**
     * 优先级（数字越大优先级越高，用于多个技能同时匹配时）
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer priority = 0;
    
    /**
     * 使用次数统计
     */
    @Column(name = "usage_count", nullable = false)
    @Builder.Default
    private Integer usageCount = 0;
    
    /**
     * 最后使用时间
     */
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    /**
     * 装备时间
     */
    @Column(name = "equipped_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime equippedAt;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 增加使用次数
     */
    public void incrementUsageCount() {
        this.usageCount++;
        this.lastUsedAt = LocalDateTime.now();
    }
}
