package com.heartsphere.ai.skill.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 技能评分调试信息
 * 用于在 UI 中显示详细的评分信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillScoreDebugInfo {
    
    /**
     * 技能ID
     */
    private Long skillId;
    
    /**
     * 技能名称
     */
    private String skillName;
    
    /**
     * 语义相似度得分
     */
    private Integer semanticScore;
    
    /**
     * 上下文匹配得分
     */
    private Integer contextScore;
    
    /**
     * 内存触发得分
     */
    private Integer memoryScore;
    
    /**
     * 综合评分
     */
    private Integer compositeScore;
    
    /**
     * 匹配的关键词
     */
    private List<String> matchedKeywords;
    
    /**
     * 是否被应用
     */
    private Boolean appliedYesNo;
    
    // ==================== 业务方法 ====================
    
    /**
     * 获取评分等级
     */
    public String getScoreGrade() {
        if (compositeScore >= 90) {
            return "A (优秀)";
        } else if (compositeScore >= 75) {
            return "B (良好)";
        } else if (compositeScore >= 60) {
            return "C (及格)";
        } else {
            return "D (不达标)";
        }
    }
    
    /**
     * 获取评分百分比
     */
    public String getScorePercentage() {
        return compositeScore + "%";
    }
    
    /**
     * 获取决策理由
     */
    public String getDecisionReason() {
        if (appliedYesNo) {
            return "技能被应用：评分达到阈值";
        } else {
            return "技能被拒绝：评分未达到阈值";
        }
    }
}
