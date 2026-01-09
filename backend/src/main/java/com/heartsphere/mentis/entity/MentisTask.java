package com.heartsphere.mentis.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * Mentis任务实体
 * 表示Mentis智能体执行的单个任务
 */
@Entity
@Table(name = "mentis_tasks")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 任务唯一标识
     */
    @Column(unique = true, nullable = false, length = 200)
    private String taskId;

    /**
     * 关联的会话
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private MentisSession session;

    /**
     * 任务类型：COMMAND, SCRIPT, INTERACTIVE, COMPUTER_USE
     */
    @Column(nullable = false, length = 50)
    private String taskType;

    /**
     * 任务状态：PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
     */
    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    /**
     * 任务描述/指令
     */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    /**
     * 执行的命令或脚本
     */
    @Column(columnDefinition = "TEXT")
    private String command;

    /**
     * 任务参数（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String parameters;

    /**
     * 任务结果（JSON格式）
     */
    @Column(columnDefinition = "TEXT")
    private String result;

    /**
     * 错误信息
     */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * 执行开始时间
     */
    private LocalDateTime startedAt;

    /**
     * 执行结束时间
     */
    private LocalDateTime completedAt;

    /**
     * 执行耗时（毫秒）
     */
    private Long duration;

    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (taskId == null) {
            taskId = "task_" + System.currentTimeMillis() + "_" + (session != null ? session.getId() : 0);
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (completedAt != null && startedAt != null && duration == null) {
            duration = java.time.Duration.between(startedAt, completedAt).toMillis();
        }
    }
}
