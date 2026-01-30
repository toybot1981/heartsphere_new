package com.heartsphere.ai.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 技能执行记录 DTO
 * 用于在 API 和服务层间传递数据
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillExecutionRecordDTO {
    private Long id;
    private Long conversationId;
    private Long skillId;
    private Long userId;
    private Long roleId;

    // 评估相关
    private Integer semanticScore;
    private Integer contextScore;
    private Integer memoryScore;
    private Integer compositeScore;
    private String decision;
    private String rejectionReason;
    private LocalDateTime evaluationTimestamp;
    private List<String> keywordMatches;

    // 执行相关
    private String executionStatus;
    private LocalDateTime executionTimestamp;
    private Integer executionDurationMs;
    private String executionResult;
    private String errorMessage;

    // 关联信息
    private List<Long> relatedMemoryIds;
    private Long relatedConversationTurnId;

    // 时间戳
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 获取可读的生命周期状态
     */
    public String getLifecycleStatus() {
        if ("REJECTED".equals(decision)) {
            return "已拒绝";
        }
        if (executionStatus == null) {
            return "未开始";
        }
        return executionStatus;
    }

    /**
     * 获取评分的平均值
     */
    public Double getAverageScore() {
        int count = 0;
        int sum = 0;
        if (semanticScore != null) {
            sum += semanticScore;
            count++;
        }
        if (contextScore != null) {
            sum += contextScore;
            count++;
        }
        if (memoryScore != null) {
            sum += memoryScore;
            count++;
        }
        return count > 0 ? (double) sum / count : 0.0;
    }
}
