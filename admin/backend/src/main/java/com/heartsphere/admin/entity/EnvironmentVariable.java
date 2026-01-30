package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 环境变量实体
 */
@Data
@Entity
@Table(name = "environment_variables", indexes = {
    @Index(name = "idx_env_var_scope", columnList = "scope, project, module"),
    @Index(name = "idx_env_var_name", columnList = "name"),
    @Index(name = "idx_env_var_environment", columnList = "environment")
})
public class EnvironmentVariable {
    
    /**
     * 作用域类型
     */
    public enum Scope {
        GLOBAL,      // 全局变量
        PROJECT,     // 项目级变量
        MODULE,      // 模块级变量
        PIPELINE     // 流程级变量
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 变量名称（HS_ 前缀，UPPER_SNAKE_CASE）
     */
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    /**
     * 变量值（敏感值会被加密存储）
     */
    @Column(name = "value", nullable = false, columnDefinition = "TEXT")
    private String value;
    
    /**
     * 作用域
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 20)
    private Scope scope;
    
    /**
     * 项目名称（GLOBAL 时为 null，PROJECT/MODULE 时为项目名）
     */
    @Column(name = "project", length = 50)
    private String project;
    
    /**
     * 模块名称（GLOBAL/PROJECT 时为 null，MODULE 时为模块名）
     */
    @Column(name = "module", length = 50)
    private String module;
    
    /**
     * 流程ID（GLOBAL/PROJECT/MODULE 时为 null，PIPELINE 时为流程ID）
     */
    @Column(name = "pipeline_id")
    private Long pipelineId;
    
    /**
     * 环境（dev, test, prod）
     */
    @Column(name = "environment", length = 20)
    private String environment;
    
    /**
     * 是否敏感（敏感值在 UI 和日志中会被掩码）
     */
    @Column(name = "sensitive", nullable = false)
    private Boolean sensitive = false;
    
    /**
     * 描述
     */
    @Column(name = "description", length = 500)
    private String description;
    
    /**
     * 验证规则（可选的正则表达式或验证逻辑）
     */
    @Column(name = "validation_rule", length = 200)
    private String validationRule;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    /**
     * 创建者
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;
}
