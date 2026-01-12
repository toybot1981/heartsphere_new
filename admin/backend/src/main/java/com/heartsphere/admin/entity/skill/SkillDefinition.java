package com.heartsphere.admin.entity.skill;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 技能定义实体（Admin模块）
 * 对应表：skill_definitions
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_definitions", indexes = {
    @Index(name = "idx_category", columnList = "category"),
    @Index(name = "idx_skill_type", columnList = "skill_type"),
    @Index(name = "idx_execution_type", columnList = "execution_type"),
    @Index(name = "idx_is_system_skill", columnList = "is_system_skill")
})
public class SkillDefinition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 技能ID（唯一标识）
     */
    @Column(name = "skill_id", nullable = false, unique = true, length = 100)
    private String skillId;
    
    /**
     * 技能名称
     */
    @Column(nullable = false, length = 255)
    private String name;
    
    /**
     * 技能描述
     */
    @Column(columnDefinition = "TEXT")
    private String description;
    
    /**
     * 技能分类：combat/magic/craft/social/exploration/life/healthcare/utility等
     */
    @Column(length = 50)
    private String category;
    
    /**
     * 技能类型：ACTIVE（主动）/PASSIVE（被动）/AUTOMATIC（自动）
     */
    @Column(name = "skill_type", length = 50)
    private String skillType = "PASSIVE";
    
    /**
     * 最大等级
     */
    @Column(name = "max_level")
    private Integer maxLevel = 100;
    
    /**
     * 基础值
     */
    @Column(name = "base_value")
    private Integer baseValue = 0;
    
    /**
     * 技能图标URL
     */
    @Column(name = "icon_url", length = 500)
    private String iconUrl;
    
    /**
     * Function Calling JSON Schema（JSON格式）
     * 用于 AI Function Calling，定义技能的输入参数
     */
    @Column(name = "function_schema", columnDefinition = "TEXT")
    private String functionSchema;
    
    /**
     * 执行类型：SCRIPT/API/GRAPH/DATABASE/RULE_BASED
     */
    @Column(name = "execution_type", length = 50)
    private String executionType = "RULE_BASED";
    
    /**
     * 执行配置（JSON格式）
     * 包含脚本路径、API配置、Graph配置等
     */
    @Column(name = "execution_config", columnDefinition = "TEXT")
    private String executionConfig;
    
    /**
     * 自动触发关键词（JSON数组格式）
     * AI检测到这些关键词时自动考虑使用该技能
     */
    @Column(name = "auto_trigger_keywords", columnDefinition = "TEXT")
    private String autoTriggerKeywords;
    
    /**
     * 所需权限（逗号分隔）
     * 用于权限控制
     */
    @Column(name = "required_permissions", length = 255)
    private String requiredPermissions;
    
    /**
     * 每日最大使用次数（-1表示无限制）
     */
    @Column(name = "max_usage_per_day")
    private Integer maxUsagePerDay = -1;
    
    /**
     * 技能版本号
     */
    @Column(length = 50)
    private String version = "1.0.0";
    
    /**
     * 技能作者
     */
    @Column(length = 255)
    private String author;
    
    /**
     * 是否为系统技能（系统技能不可删除）
     */
    @Column(name = "is_system_skill", nullable = false)
    private Boolean isSystemSkill = false;
    
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
}
