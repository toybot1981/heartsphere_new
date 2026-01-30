package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 流程步骤实体
 */
@Data
@Entity
@Table(name = "pipeline_steps", indexes = {
    @Index(name = "idx_pipeline_id", columnList = "pipeline_id"),
    @Index(name = "idx_order", columnList = "pipeline_id, `order`")
})
public class PipelineStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 所属流程ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // 防止 JSON 序列化时访问延迟加载的关系
    private DeploymentPipeline pipeline;

    /**
     * 步骤名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    /**
     * 关联的脚本ID
     */
    @Column(name = "script_id", nullable = false, length = 100)
    private String scriptId;

    /**
     * 执行顺序
     */
    @Column(name = "`order`", nullable = false)
    private Integer order;

    /**
     * 依赖的步骤ID列表（JSON格式，存储步骤的order值）
     */
    @Column(name = "depends_on", columnDefinition = "TEXT")
    private String dependsOn; // JSON array of step orders

    /**
     * 步骤参数（JSON格式）
     */
    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    /**
     * 执行条件（如：previous_step.success）
     */
    @Column(name = "`condition`", length = 200)
    private String condition;

    /**
     * 是否可并行执行
     */
    @Column(name = "parallel", nullable = false)
    private Boolean parallel = false;

    /**
     * 是否必需（失败是否停止流程）
     */
    @Column(name = "required", nullable = false)
    private Boolean required = true;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
