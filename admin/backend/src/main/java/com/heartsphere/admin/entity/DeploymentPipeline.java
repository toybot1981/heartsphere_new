package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 部署流程模板实体
 */
@Data
@Entity
@Table(name = "deployment_pipelines", indexes = {
    @Index(name = "idx_environment", columnList = "environment"),
    @Index(name = "idx_created_by", columnList = "created_by"),
    @Index(name = "idx_is_template", columnList = "is_template"),
    @Index(name = "idx_project", columnList = "project")
})
public class DeploymentPipeline {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 流程名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * 流程描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 目标环境 (test/prod)
     */
    @Column(name = "environment", nullable = false, length = 20)
    private String environment;

    /**
     * 关联的项目 (main, admin, company, edu, mentis, shared, 或 "" 表示通用)
     */
    @Column(name = "project", length = 50)
    private String project;

    /**
     * 是否为模板
     */
    @Column(name = "is_template", nullable = false)
    private Boolean isTemplate = true;

    /**
     * 创建者（管理员ID）
     */
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private SystemAdmin createdBy;

    /**
     * 流程步骤（一对多关系）
     */
    @OneToMany(mappedBy = "pipeline", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("order ASC")
    @com.fasterxml.jackson.annotation.JsonIgnore // 防止 JSON 序列化时访问延迟加载的集合
    private List<PipelineStep> steps;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
