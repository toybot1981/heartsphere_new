package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 步骤执行记录实体
 */
@Data
@Entity
@Table(name = "pipeline_step_executions", indexes = {
    @Index(name = "idx_pipeline_execution_id", columnList = "pipeline_execution_id"),
    @Index(name = "idx_step_id", columnList = "step_id"),
    @Index(name = "idx_script_execution_id", columnList = "script_execution_id"),
    @Index(name = "idx_status", columnList = "status")
})
public class PipelineStepExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 流程执行ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_execution_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore // 防止 JSON 序列化时访问延迟加载的关系
    private PipelineExecution pipelineExecution;

    /**
     * 步骤ID
     * 注意：当流程初始化失败或流程没有步骤时，此字段可以为 null
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "step_id", nullable = true)
    @com.fasterxml.jackson.annotation.JsonIgnore // 防止 JSON 序列化时访问延迟加载的关系
    private PipelineStep step;

    /**
     * 关联的脚本执行ID
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_execution_id")
    @com.fasterxml.jackson.annotation.JsonIgnore // 防止 JSON 序列化时访问延迟加载的关系
    private ScriptExecution scriptExecution;

    /**
     * 步骤状态：PENDING, RUNNING, SUCCESS, FAILED, SKIPPED, CANCELLED
     */
    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private StepStatus status = StepStatus.PENDING;

    /**
     * 开始时间
     */
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    /**
     * 结束时间
     */
    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    /**
     * 错误信息
     */
    @Column(name = "error", columnDefinition = "TEXT")
    private String error;

    /**
     * 执行时长（秒）
     */
    @Column(name = "duration_seconds")
    private Long durationSeconds;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    /**
     * 计算执行时长
     */
    public void calculateDuration() {
        if (startedAt != null && finishedAt != null) {
            this.durationSeconds = java.time.Duration.between(startedAt, finishedAt).getSeconds();
        }
    }

    /**
     * 步骤状态枚举
     */
    public enum StepStatus {
        PENDING,    // 待执行
        RUNNING,    // 执行中
        SUCCESS,    // 成功
        FAILED,     // 失败
        SKIPPED,    // 跳过
        CANCELLED   // 已取消
    }
}
