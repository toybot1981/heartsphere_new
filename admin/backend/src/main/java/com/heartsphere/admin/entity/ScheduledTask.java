package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 定时任务实体
 */
@Data
@Entity
@Table(name = "scheduled_tasks", indexes = {
    @Index(name = "idx_script_id", columnList = "script_id"),
    @Index(name = "idx_enabled", columnList = "enabled"),
    @Index(name = "idx_created_by", columnList = "created_by")
})
public class ScheduledTask {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 任务名称
     */
    @Column(name = "name", nullable = false, length = 200)
    private String name;

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
     * Cron表达式
     */
    @Column(name = "cron_expression", nullable = false, length = 100)
    private String cronExpression;

    /**
     * 是否启用
     */
    @Column(name = "enabled", nullable = false)
    private Boolean enabled = true;

    /**
     * 脚本参数（JSON格式）
     */
    @Column(name = "parameters", columnDefinition = "TEXT")
    private String parameters;

    /**
     * 创建者（管理员ID）
     */
    @ManyToOne
    @JoinColumn(name = "created_by", nullable = false)
    private SystemAdmin createdBy;

    /**
     * 上次执行时间
     */
    @Column(name = "last_executed_at")
    private LocalDateTime lastExecutedAt;

    /**
     * 下次执行时间
     */
    @Column(name = "next_execution_time")
    private LocalDateTime nextExecutionTime;

    /**
     * 执行次数
     */
    @Column(name = "execution_count")
    private Long executionCount = 0L;

    /**
     * 成功次数
     */
    @Column(name = "success_count")
    private Long successCount = 0L;

    /**
     * 失败次数
     */
    @Column(name = "failure_count")
    private Long failureCount = 0L;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
