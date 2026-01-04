package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * 条件节点配置
 * 用于从JSON或其他配置源创建ConditionNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ConditionNodeConfig {
    private String id;
    private ConditionNode.LogicType logic;
    private List<ConditionNode.Condition> conditions;
    private String trueNodeId;
    private String falseNodeId;

    @JsonCreator
    public ConditionNodeConfig(
            @JsonProperty("id") String id,
            @JsonProperty("logic") ConditionNode.LogicType logic,
            @JsonProperty("conditions") List<ConditionNode.Condition> conditions,
            @JsonProperty("trueNodeId") String trueNodeId,
            @JsonProperty("falseNodeId") String falseNodeId) {
        this.id = id;
        this.logic = logic != null ? logic : ConditionNode.LogicType.AND; // 默认AND
        this.conditions = conditions;
        this.trueNodeId = trueNodeId;
        this.falseNodeId = falseNodeId;
    }

    public ConditionNode toConditionNode() {
        return ConditionNode.builder()
                .id(id)
                .logic(logic)
                .conditions(conditions)
                .trueNodeId(trueNodeId)
                .falseNodeId(falseNodeId)
                .build();
    }
}
