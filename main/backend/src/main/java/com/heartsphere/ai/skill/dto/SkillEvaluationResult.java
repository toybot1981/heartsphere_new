package com.heartsphere.ai.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 技能评估结果模型
 * 用于封装技能评估的得分、原因等信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillEvaluationResult {
    
    /**
     * 技能ID
     */
    private Long skillId;
    
    /**
     * 技能名称
     */
    private String skillName;
    
    /**
     * 关键词匹配得分 (0-100)
     */
    private Integer keywordScore;
    
    /**
     * 语义相似度得分 (0-100)
     */
    private Integer semanticScore;
    
    /**
     * 上下文匹配得分 (0-100)
     */
    private Integer contextScore;
    
    /**
     * 内存触发得分 (0-100)
     */
    private Integer memoryScore;
    
    /**
     * 综合得分 (0-100)
     */
    private Integer compositeScore;
    
    /**
     * 匹配的关键词列表
     */
    private List<String> matchedKeywords;
    
    /**
     * 评估原因说明
     */
    private String evaluationReason;
    
    /**
     * 是否通过阈值检查
     */
    private Boolean passedThreshold;
    
    /**
     * 是否被应用
     */
    private Boolean applied;
    
    /**
     * 拒绝原因（如果被拒绝）
     */
    private String rejectionReason;
    
    /**
     * 相关内存ID列表
     */
    private List<Long> relatedMemoryIds;
    
    // ==================== 业务方法 ====================
    
    /**
     * 获取评分等级
     */
    public String getScoreGrade() {
        if (compositeScore == null) {
            return "未评分";
        }
        if (compositeScore >= 90) {
            return "优秀";
        } else if (compositeScore >= 75) {
            return "良好";
        } else if (compositeScore >= 60) {
            return "及格";
        } else {
            return "不达标";
        }
    }
    
    /**
     * 获取评分百分比字符串
     */
    public String getScorePercentage() {
        return compositeScore != null ? compositeScore + "%" : "N/A";
    }
    
    /**
     * 判断是否应该被应用
     */
    public boolean shouldApply(int threshold) {
        return compositeScore != null && compositeScore >= threshold && passedThreshold != null && passedThreshold;
    }
}
