package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 选择节点配置
 * 
 * 用于从JSON或其他配置源创建ChoiceNode
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChoiceNodeConfig {
    
    /**
     * 节点ID
     */
    @JsonProperty("id")
    private String id;
    
    /**
     * 选择提示文本
     */
    @JsonProperty("prompt")
    private String prompt;
    
    /**
     * 选项列表
     */
    @JsonProperty("options")
    @Builder.Default
    private List<ChoiceOptionConfig> options = new ArrayList<>();
    
    /**
     * 选项配置
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoiceOptionConfig {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("text")
        private String text;
        
        @JsonProperty("nextNodeId")
        private String nextNodeId;
        
        @JsonProperty("conditions")
        private List<ChoiceConditionConfig> conditions;
        
        @JsonProperty("effect")
        private ChoiceEffectConfig effect;
        
        @JsonProperty("hidden")
        private Boolean hidden;
    }
    
    /**
     * 条件配置
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoiceConditionConfig {
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("target")
        private String target;
        
        @JsonProperty("operator")
        private String operator;
        
        @JsonProperty("value")
        private Object value;
    }
    
    /**
     * 效果配置
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChoiceEffectConfig {
        @JsonProperty("favorabilityChange")
        private Map<String, Integer> favorabilityChange;
        
        @JsonProperty("skillChange")
        private Map<String, Integer> skillChange;
        
        @JsonProperty("triggerEvents")
        private List<String> triggerEvents;
        
        @JsonProperty("addItems")
        private List<String> addItems;
        
        @JsonProperty("setVariables")
        private Map<String, Object> setVariables;
    }
    
    /**
     * 从配置创建ChoiceNode
     */
    public ChoiceNode toChoiceNode() {
        List<ChoiceNode.ChoiceOption> choiceOptions = new ArrayList<>();
        
        for (ChoiceOptionConfig optionConfig : options) {
            ChoiceNode.ChoiceOption.ChoiceOptionBuilder optionBuilder = ChoiceNode.ChoiceOption.builder()
                .id(optionConfig.getId())
                .text(optionConfig.getText())
                .nextNodeId(optionConfig.getNextNodeId())
                .hidden(optionConfig.getHidden());
            
            // 转换条件
            if (optionConfig.getConditions() != null) {
                List<ChoiceNode.ChoiceCondition> conditions = new ArrayList<>();
                for (ChoiceConditionConfig conditionConfig : optionConfig.getConditions()) {
                    ChoiceNode.ChoiceCondition.ChoiceConditionBuilder conditionBuilder = 
                        ChoiceNode.ChoiceCondition.builder()
                            .target(conditionConfig.getTarget())
                            .operator(conditionConfig.getOperator())
                            .value(conditionConfig.getValue());
                    
                    // 转换条件类型
                    if (conditionConfig.getType() != null) {
                        try {
                            ChoiceNode.ChoiceCondition.ConditionType type = 
                                ChoiceNode.ChoiceCondition.ConditionType.valueOf(
                                    conditionConfig.getType().toUpperCase()
                                );
                            conditionBuilder.type(type);
                        } catch (IllegalArgumentException e) {
                            // 使用默认值或跳过
                        }
                    }
                    
                    conditions.add(conditionBuilder.build());
                }
                optionBuilder.conditions(conditions);
            }
            
            // 转换效果
            if (optionConfig.getEffect() != null) {
                ChoiceEffectConfig effectConfig = optionConfig.getEffect();
                ChoiceNode.ChoiceEffect effect = ChoiceNode.ChoiceEffect.builder()
                    .favorabilityChange(effectConfig.getFavorabilityChange())
                    .skillChange(effectConfig.getSkillChange())
                    .triggerEvents(effectConfig.getTriggerEvents())
                    .addItems(effectConfig.getAddItems())
                    .setVariables(effectConfig.getSetVariables())
                    .build();
                optionBuilder.effect(effect);
            }
            
            choiceOptions.add(optionBuilder.build());
        }
        
        return ChoiceNode.builder()
            .id(id)
            .prompt(prompt)
            .options(choiceOptions)
            .build();
    }
}
