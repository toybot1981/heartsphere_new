package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 流程执行记录实体
 */
@Data
@Entity
@Table(name = "pipeline_executions", indexes = {
    @Index(name = "idx_pipeline_id", columnList = "pipeline_id"),
    @Index(name = "idx_executed_by", columnList = "executed_by"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_started_at", columnList = "started_at")
})
public class PipelineExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 流程模板ID
     */
    @ManyToOne
    @JoinColumn(name = "pipeline_id", nullable = false)
    private DeploymentPipeline pipeline;

    /**
     * 执行状态：RUNNING, SUCCESS, FAILED, CANCELLED
     */
    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus status = ExecutionStatus.RUNNING;

    /**
     * 开始时间
     */
    @Column(name = "started_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime startedAt;

    /**
     * 结束时间
     */
    @Column(name = "finished_at")
    private LocalDateTime finishedAt;

    /**
     * 执行者（管理员ID）
     */
    @ManyToOne
    @JoinColumn(name = "executed_by", nullable = false)
    private SystemAdmin executedBy;

    /**
     * 步骤执行记录（一对多关系）
     */
    @OneToMany(mappedBy = "pipelineExecution", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("startedAt ASC")
    @com.fasterxml.jackson.annotation.JsonIgnore // 防止 JSON 序列化时访问延迟加载的集合
    private List<PipelineStepExecution> stepExecutions;

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
     * 执行状态枚举
     */
    public enum ExecutionStatus {
        RUNNING,
        SUCCESS,
        FAILED,
        CANCELLED
    }
}
