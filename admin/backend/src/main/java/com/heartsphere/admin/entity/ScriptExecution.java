package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 脚本执行记录实体
 */
@Data
@Entity
@Table(name = "script_executions", indexes = {
    @Index(name = "idx_script_id", columnList = "script_id"),
    @Index(name = "idx_executed_by", columnList = "executed_by"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_started_at", columnList = "started_at")
})
public class ScriptExecution {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 脚本ID（对应脚本配置中的id）
     */
    @Column(name = "script_id", nullable = false, length = 100)
    private String scriptId;

    /**
     * 脚本名称
     */
    @Column(name = "script_name", nullable = false, length = 200)
    private String scriptName;

    /**
     * 执行者（管理员ID）
     */
    @ManyToOne
    @JoinColumn(name = "executed_by", nullable = false)
    private SystemAdmin executedBy;

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
     * 执行状态：RUNNING, SUCCESS, FAILED, CANCELLED
     */
    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus status = ExecutionStatus.RUNNING;

    /**
     * 执行参数（JSON格式）
     */
    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    /**
     * 执行输出（完整日志存储在文件系统，此字段仅用于备份）
     * 使用 LONGTEXT 支持大型脚本输出 (最多 4GB)
     */
    @Column(name = "output", columnDefinition = "LONGTEXT")
    private String output;

    /**
     * 错误信息
     */
    @Column(name = "error", columnDefinition = "LONGTEXT")
    private String error;

    /**
     * 退出代码
     */
    @Column(name = "exit_code")
    private Integer exitCode;

    /**
     * 日志文件路径
     */
    @Column(name = "log_file_path", length = 500)
    private String logFilePath;

    /**
     * 关联的定时任务ID（如果是定时任务触发的）
     */
    @ManyToOne
    @JoinColumn(name = "scheduled_task_id")
    private ScheduledTask scheduledTask;

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
