package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 多智能体协作日志实体
 * 记录协作任务的执行日志，用于管理和审计
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "multi_agent_collaboration_logs", indexes = {
    @Index(name = "idx_collaboration_id", columnList = "collaboration_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentCollaborationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 协作任务ID
     */
    @Column(name = "collaboration_id", nullable = false, length = 100, unique = true)
    private String collaborationId;

    /**
     * 用户ID
     */
    @Column(name = "user_id", length = 100)
    private String userId;

    /**
     * 会话ID
     */
    @Column(name = "session_id", length = 100)
    private String sessionId;

    /**
     * 任务描述
     */
    @Column(name = "task_description", columnDefinition = "TEXT")
    private String taskDescription;

    /**
     * 参与的智能体ID列表（JSON格式）
     */
    @Column(name = "agent_ids", columnDefinition = "TEXT")
    private String agentIds; // JSON array: ["agent1", "agent2"]

    /**
     * 协作状态
     */
    @Column(name = "status", nullable = false, length = 50)
    private String status; // PENDING, RUNNING, COMPLETED, FAILED, CANCELLED

    /**
     * 工作流模式
     */
    @Column(name = "workflow_mode", length = 50)
    private String workflowMode; // SEQUENTIAL, PARALLEL, CONDITIONAL

    /**
     * 开始时间
     */
    @Column(name = "started_at")
    private LocalDateTime startedAt;

    /**
     * 结束时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * 执行耗时（毫秒）
     */
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    /**
     * 执行结果（JSON格式）
     */
    @Column(name = "result", columnDefinition = "TEXT")
    private String result; // JSON object

    /**
     * 智能体执行结果（JSON格式）
     */
    @Column(name = "agent_results", columnDefinition = "TEXT")
    private String agentResults; // JSON object: {"agent1": "result1", "agent2": "result2"}

    /**
     * 错误信息（JSON格式）
     */
    @Column(name = "errors", columnDefinition = "TEXT")
    private String errors; // JSON array: ["error1", "error2"]

    /**
     * 是否成功
     */
    @Column(name = "success", nullable = false)
    private Boolean success = false;

    /**
     * 创建时间
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 备注信息
     */
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
