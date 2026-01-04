package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 角色技能实体
 * 存储角色拥有的技能及其等级、经验值等信息
 * 
 * 注意：此表用于游戏化的技能系统（等级、经验值）
 * character_skill_bindings 表用于功能化的技能系统（装备、启用）
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "character_skills",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_character_skill", columnNames = {"character_id", "skill_id"})
    },
    indexes = {
        @Index(name = "idx_character_id", columnList = "character_id"),
        @Index(name = "idx_skill_id", columnList = "skill_id")
    }
)
public class CharacterSkill {
    
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
     * 当前等级（0-100）
     */
    @Column(name = "current_level", nullable = false)
    private Integer currentLevel = 0;
    
    /**
     * 经验值
     */
    @Column(nullable = false)
    private Integer experience = 0;
    
    /**
     * 解锁时间
     */
    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt;
    
    /**
     * 最后使用时间
     */
    @Column(name = "last_used_at")
    private LocalDateTime lastUsedAt;
    
    /**
     * 使用次数
     */
    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;
    
    /**
     * 扩展元数据（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String metadata;
    
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
     * 增加经验值
     */
    public void addExperience(int exp) {
        this.experience += exp;
        checkLevelUp();
    }
    
    /**
     * 检查是否升级
     */
    private void checkLevelUp() {
        // 简单的升级逻辑：每100经验升1级，最高100级
        int newLevel = Math.min(100, experience / 100);
        if (newLevel > currentLevel) {
            this.currentLevel = newLevel;
        }
    }
    
    /**
     * 增加使用次数
     */
    public void incrementUsageCount() {
        this.usageCount++;
        this.lastUsedAt = LocalDateTime.now();
    }
}
