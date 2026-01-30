package com.heartsphere.ai.skill.entity;

import com.heartsphere.ai.skill.enums.ExecutionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 技能执行记录实体
 * 记录技能的评估、决策、执行、结果全过程
 * 用于调试和数据分析
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "skill_execution_records",
    indexes = {
        @Index(name = "idx_conversation_created", columnList = "conversation_id,created_at"),
        @Index(name = "idx_skill_created", columnList = "skill_id,created_at"),
        @Index(name = "idx_user_created", columnList = "user_id,created_at"),
        @Index(name = "idx_decision", columnList = "decision"),
        @Index(name = "idx_execution_status", columnList = "execution_status"),
        @Index(name = "idx_composite_score", columnList = "composite_score")
    }
)
public class SkillExecutionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false)
    private Long conversationId;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "role_id")
    private Long roleId;

    // ==================== 评估阶段 ====================

    @Column(name = "evaluation_context", columnDefinition = "JSON")
    private String evaluationContext;

    @Column(name = "evaluation_timestamp")
    private LocalDateTime evaluationTimestamp;

    @Column(name = "keyword_matches", columnDefinition = "JSON")
    private String keywordMatches;

    @Column(name = "semantic_score")
    private Integer semanticScore;

    @Column(name = "context_score")
    private Integer contextScore;

    @Column(name = "memory_score")
    private Integer memoryScore;

    @Column(name = "composite_score")
    private Integer compositeScore;

    @Column(name = "decision", length = 50)
    private String decision;  // APPLIED, REJECTED

    @Column(name = "rejection_reason")
    private String rejectionReason;

    // ==================== 应用阶段 ====================

    @Column(name = "execution_parameters", columnDefinition = "JSON")
    private String executionParameters;

    @Column(name = "execution_status", length = 50)
    @Enumerated(EnumType.STRING)
    private ExecutionStatus executionStatus;

    @Column(name = "execution_timestamp")
    private LocalDateTime executionTimestamp;

    @Column(name = "execution_duration_ms")
    private Integer executionDurationMs;

    // ==================== 结果阶段 ====================

    @Column(name = "execution_result", columnDefinition = "JSON")
    private String executionResult;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "resource_usage", columnDefinition = "JSON")
    private String resourceUsage;

    // ==================== 关联信息 ====================

    @Column(name = "related_memory_ids", columnDefinition = "JSON")
    private String relatedMemoryIds;

    @Column(name = "related_conversation_turn_id")
    private Long relatedConversationTurnId;

    // ==================== 时间戳 ====================

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // ==================== 业务方法 ====================

    /**
     * 判断是否已被应用
     */
    public boolean isApplied() {
        return "APPLIED".equals(decision);
    }

    /**
     * 判断是否已完成
     */
    public boolean isCompleted() {
        return executionStatus == ExecutionStatus.COMPLETED;
    }

    /**
     * 判断是否失败
     */
    public boolean isFailed() {
        return executionStatus == ExecutionStatus.FAILED;
    }

    /**
     * 判断是否正在进行
     */
    public boolean isInProgress() {
        return executionStatus != null && executionStatus.isInProgress();
    }

    /**
     * 获取最终的生命周期状态
     */
    public String getLifecycleStatus() {
        if ("REJECTED".equals(decision)) {
            return "已拒绝";
        }
        if (executionStatus == null) {
            return "未开始";
        }
        return executionStatus.getDisplayName();
    }
}
