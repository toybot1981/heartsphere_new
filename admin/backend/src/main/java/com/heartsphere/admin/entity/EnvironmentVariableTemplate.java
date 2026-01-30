package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 环境变量模板实体
 */
@Data
@Entity
@Table(name = "environment_variable_templates", indexes = {
    @Index(name = "idx_template_environment", columnList = "environment"),
    @Index(name = "idx_template_scope", columnList = "scope, project, module")
})
public class EnvironmentVariableTemplate {
    
    /**
     * 作用域类型
     */
    public enum Scope {
        GLOBAL,      // 全局模板
        PROJECT,     // 项目级模板
        MODULE       // 模块级模板
    }
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 模板名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    /**
     * 描述
     */
    @Column(name = "description", length = 500)
    private String description;
    
    /**
     * 环境（dev, test, prod）
     */
    @Column(name = "environment", length = 20)
    private String environment;
    
    /**
     * 作用域
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false, length = 20)
    private Scope scope;
    
    /**
     * 项目名称（GLOBAL 时为 null）
     */
    @Column(name = "project", length = 50)
    private String project;
    
    /**
     * 模块名称（GLOBAL/PROJECT 时为 null）
     */
    @Column(name = "module", length = 50)
    private String module;
    
    /**
     * 是否默认模板
     */
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
    
    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 创建者
     */
    @Column(name = "created_by", length = 100)
    private String createdBy;
    
    /**
     * 模板包含的变量（通过关联表管理，这里不直接映射）
     * 实际使用时通过 EnvironmentVariableService 查询
     */
    @Transient
    private List<EnvironmentVariable> variables = new ArrayList<>();
}
