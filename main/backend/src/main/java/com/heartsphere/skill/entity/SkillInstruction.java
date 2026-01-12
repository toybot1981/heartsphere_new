package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 技能指令实体
 * 对应 Claude Skill 的 Level 2：指令
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_instructions", indexes = {
    @Index(name = "idx_skill_id", columnList = "skill_id"),
    @Index(name = "idx_instruction_level", columnList = "instruction_level")
})
public class SkillInstruction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 关联的技能ID
     */
    @Column(name = "skill_id", nullable = false, length = 100)
    private String skillId;
    
    /**
     * 指令层级（1-3，对应 Claude 的 Level）
     * Level 1: 基础信息（始终加载）
     * Level 2: 详细指令（触发时加载）
     * Level 3: 高级指令（按需加载）
     */
    @Column(name = "instruction_level", nullable = false)
    private Integer instructionLevel = 1;
    
    /**
     * 指令内容
     */
    @Column(name = "instruction_text", nullable = false, columnDefinition = "TEXT")
    private String instructionText;
    
    /**
     * 触发条件（JSON格式）
     */
    @Column(name = "trigger_condition", columnDefinition = "TEXT")
    private String triggerCondition;
    
    /**
     * 执行顺序
     */
    @Column(name = "execution_order")
    private Integer executionOrder = 0;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 外键关联到技能定义（数据库层面）
     * 注意：这里不建立 JPA 关系，保持模块独立
     */
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "skill_id", insertable = false, updatable = false)
    // private SkillDefinition skillDefinition;
}
