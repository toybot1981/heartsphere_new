package com.heartsphere.ai.skill.engine;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * LLM 技能选择响应
 * 用于解析 LLM 返回的技能选择结果
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillSelectionResponse {
    
    /**
     * Level 1 响应：选中的技能列表
     */
    @JsonProperty("selectedSkills")
    private List<SelectedSkill> selectedSkills;
    
    /**
     * Level 2 响应：评估后的技能列表
     */
    @JsonProperty("evaluatedSkills")
    private List<EvaluatedSkill> evaluatedSkills;
    
    /**
     * Level 3 响应：最终决策的技能列表
     */
    @JsonProperty("finalSkills")
    private List<FinalSkill> finalSkills;
    
    /**
     * Level 1 选中的技能
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SelectedSkill {
        @JsonProperty("skillId")
        private String skillId;
        
        @JsonProperty("relevanceScore")
        private Integer relevanceScore;
        
        @JsonProperty("reason")
        private String reason;
    }
    
    /**
     * Level 2 评估后的技能
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvaluatedSkill {
        @JsonProperty("skillId")
        private String skillId;
        
        @JsonProperty("shouldActivate")
        private Boolean shouldActivate;
        
        @JsonProperty("confidence")
        private Integer confidence;
        
        @JsonProperty("reason")
        private String reason;
    }
    
    /**
     * Level 3 最终决策的技能
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FinalSkill {
        @JsonProperty("skillId")
        private String skillId;
        
        @JsonProperty("priority")
        private Integer priority;
        
        @JsonProperty("activationOrder")
        private Integer activationOrder;
        
        @JsonProperty("reason")
        private String reason;
    }
}
