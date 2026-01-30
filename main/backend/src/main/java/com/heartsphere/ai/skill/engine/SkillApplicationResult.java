package com.heartsphere.ai.skill.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 技能应用结果
 * 包含应用决策、执行记录ID等信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillApplicationResult {
    
    /**
     * 被应用的技能列表
     */
    @Builder.Default
    private Map<Long, String> appliedSkills = new HashMap<>();
    
    /**
     * 被拒绝的技能列表及原因
     */
    @Builder.Default
    private Map<Long, String> rejectedSkills = new HashMap<>();
    
    /**
     * 执行记录IDs（用于后续跟踪）
     */
    @Builder.Default
    private List<Long> executionRecordIds = new ArrayList<>();
    
    /**
     * 总评估的技能数
     */
    private Integer totalEvaluated;
    
    /**
     * 被应用的技能数
     */
    private Integer totalApplied;
    
    /**
     * 评估时间戳
     */
    private LocalDateTime evaluationTimestamp;
    
    /**
     * 错误信息
     */
    @Builder.Default
    private Map<String, String> errors = new HashMap<>();
    
    // ==================== 业务方法 ====================
    
    public void addAppliedSkill(Long skillId, String skillName) {
        appliedSkills.put(skillId, skillName);
    }
    
    public void addRejectedSkill(Long skillId, String skillName, int score, String reason) {
        rejectedSkills.put(skillId, String.format("%s (评分: %d, 原因: %s)", skillName, score, reason));
    }
    
    public void addError(String skillName, String errorMessage) {
        errors.put(skillName, errorMessage);
    }
    
    public boolean hasAppliedSkills() {
        return !appliedSkills.isEmpty();
    }
    
    public boolean hasErrors() {
        return !errors.isEmpty();
    }
    
    public int getSuccessCount() {
        return appliedSkills.size();
    }
    
    public int getFailureCount() {
        return rejectedSkills.size();
    }
    
    public double getApplicationRate() {
        if (totalEvaluated == null || totalEvaluated == 0) {
            return 0;
        }
        return (double) totalApplied / totalEvaluated * 100;
    }
}
