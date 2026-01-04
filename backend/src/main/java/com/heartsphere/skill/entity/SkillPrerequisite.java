package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 技能前置条件实体
 * 定义技能解锁的前置条件
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_prerequisites", indexes = {
    @Index(name = "idx_skill_id", columnList = "skill_id"),
    @Index(name = "idx_prerequisite_skill_id", columnList = "prerequisite_skill_id")
})
public class SkillPrerequisite {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 技能ID
     */
    @Column(name = "skill_id", nullable = false, length = 100)
    private String skillId;
    
    /**
     * 前置技能ID（需要先拥有该技能）
     */
    @Column(name = "prerequisite_skill_id", length = 100)
    private String prerequisiteSkillId;
    
    /**
     * 前置技能所需等级
     */
    @Column(name = "prerequisite_level")
    private Integer prerequisiteLevel = 0;
    
    /**
     * 角色所需等级
     */
    @Column(name = "required_character_level")
    private Integer requiredCharacterLevel = 0;
    
    /**
     * 所需物品（JSON数组）
     */
    @Column(name = "required_items", columnDefinition = "TEXT")
    private String requiredItems;
    
    /**
     * 自定义条件（JSON格式）
     */
    @Column(name = "custom_condition", columnDefinition = "TEXT")
    private String customCondition;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
