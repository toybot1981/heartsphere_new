package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 技能检查节点配置
 * 用于从JSON或其他配置源创建SkillCheckNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class SkillCheckNodeConfig {
    private String id;
    private String characterId;
    private String skillId;
    private String operator;
    private Integer requiredValue;
    private String successNodeId;
    private String failureNodeId;

    @JsonCreator
    public SkillCheckNodeConfig(
            @JsonProperty("id") String id,
            @JsonProperty("characterId") String characterId,
            @JsonProperty("skillId") String skillId,
            @JsonProperty("operator") @JsonAlias({"checkType"}) String operator,
            @JsonProperty("requiredValue") @JsonAlias({"minValue", "targetValue"}) Integer requiredValue,
            @JsonProperty("successNodeId") String successNodeId,
            @JsonProperty("failureNodeId") String failureNodeId) {
        this.id = id;
        this.characterId = characterId;
        this.skillId = skillId;
        this.operator = operator != null ? operator : ">="; // 默认 >=
        this.requiredValue = requiredValue;
        this.successNodeId = successNodeId;
        this.failureNodeId = failureNodeId;
    }

    public SkillCheckNode toSkillCheckNode() {
        return SkillCheckNode.builder()
                .id(id)
                .characterId(characterId)
                .skillId(skillId)
                .operator(operator)
                .requiredValue(requiredValue)
                .successNodeId(successNodeId)
                .failureNodeId(failureNodeId)
                .build();
    }
}
