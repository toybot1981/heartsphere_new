package com.heartsphere.ai.skill.engine;

import com.heartsphere.skill.entity.SkillDefinition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 技能候选
 * 表示在技能选择过程中被评估的技能及其评分信息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillCandidate {
    
    /**
     * 技能定义
     */
    private SkillDefinition skill;
    
    /**
     * 相关性得分（0-100）
     */
    private Integer relevanceScore;
    
    /**
     * 选择/评估理由
     */
    private String reason;
    
    /**
     * 评估层级（1, 2, 3）
     */
    private Integer level;
    
    /**
     * 置信度（0-100）
     */
    private Integer confidence;
    
    /**
     * 是否应该激活
     */
    private Boolean shouldActivate;
    
    /**
     * 优先级（用于排序）
     */
    private Integer priority;
}
