package com.heartsphere.ai.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 技能统计数据 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillStatistics {
    
    /**
     * 总执行次数
     */
    private Long totalCount;
    
    /**
     * 被应用的次数
     */
    @Builder.Default
    private Long appliedCount = 0L;
    
    /**
     * 成功完成的次数
     */
    @Builder.Default
    private Long completedCount = 0L;
    
    /**
     * 失败的次数
     */
    @Builder.Default
    private Long failedCount = 0L;
    
    /**
     * 成功率（0-1）
     */
    @Builder.Default
    private Double successRate = 0.0;
    
    /**
     * 平均评分（0-100）
     */
    @Builder.Default
    private Double averageScore = 0.0;
    
    /**
     * 平均执行耗时（毫秒）
     */
    @Builder.Default
    private Integer averageDurationMs = 0;
    
    /**
     * 获取百分比形式的成功率
     */
    public String getSuccessRatePercentage() {
        return String.format("%.2f%%", successRate * 100);
    }
    
    /**
     * 获取评分等级
     */
    public String getScoreGrade() {
        if (averageScore >= 90) {
            return "优秀";
        } else if (averageScore >= 75) {
            return "良好";
        } else if (averageScore >= 60) {
            return "及格";
        } else {
            return "需改进";
        }
    }
}
