package com.heartsphere.skill.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 技能执行记录实体
 * 记录所有技能的执行历史
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Entity
@Table(name = "skill_executions", indexes = {
    @Index(name = "idx_skill_id", columnList = "skill_id"),
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at"),
    @Index(name = "idx_success", columnList = "success"),
    @Index(name = "idx_execution_type", columnList = "execution_type")
})
public class SkillExecution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 技能ID
     * 注意：不建立 JPA 关系，只存储 ID，保持模块独立
     */
    @Column(name = "skill_id", nullable = false, length = 100)
    private String skillId;
    
    /**
     * 角色ID
     * 注意：不建立 JPA 关系，只存储 ID，保持模块独立
     */
    @Column(name = "character_id")
    private Long characterId;
    
    /**
     * 用户ID
     * 注意：不建立 JPA 关系，只存储 ID，保持模块独立
     */
    @Column(name = "user_id")
    private Long userId;
    
    /**
     * 执行类型：FUNCTION_CALL/GRAPH_NODE/MANUAL/AUTO_TRIGGER
     */
    @Column(name = "execution_type", length = 50)
    private String executionType = "FUNCTION_CALL";
    
    /**
     * 执行参数（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String parameters;
    
    /**
     * 执行结果（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String result;
    
    /**
     * 执行耗时（毫秒）
     */
    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;
    
    /**
     * 是否成功
     */
    @Column(nullable = false)
    private Boolean success = true;
    
    /**
     * 错误信息
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    /**
     * 错误堆栈（用于调试）
     */
    @Column(name = "error_stack", columnDefinition = "TEXT")
    private String errorStack;
    
    /**
     * 创建时间（执行时间）
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
