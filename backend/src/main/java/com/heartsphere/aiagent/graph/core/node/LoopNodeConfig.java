package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 循环节点配置
 * 用于从JSON或其他配置源创建LoopNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class LoopNodeConfig {
    private String id;
    private LoopNode.LoopType loopType;
    private LoopNode.LoopCondition condition;
    private Integer maxIterations;
    private List<String> loopBody;
    private String exitNodeId;
    private String loopVariableName;
    
    @JsonCreator
    public LoopNodeConfig(
            @JsonProperty("id") String id,
            @JsonProperty("loopType") LoopNode.LoopType loopType,
            @JsonProperty("condition") LoopNode.LoopCondition condition,
            @JsonProperty("maxIterations") Integer maxIterations,
            @JsonProperty("loopBody") List<String> loopBody,
            @JsonProperty("exitNodeId") String exitNodeId,
            @JsonProperty("loopVariableName") String loopVariableName) {
        this.id = id;
        this.loopType = loopType != null ? loopType : LoopNode.LoopType.CONDITION;
        this.condition = condition;
        this.maxIterations = maxIterations != null ? maxIterations : 1000;
        this.loopBody = loopBody;
        this.exitNodeId = exitNodeId;
        this.loopVariableName = loopVariableName != null ? loopVariableName : "loop_count";
    }
    
    /**
     * 从Map创建LoopCondition（用于JSON反序列化）
     */
    @SuppressWarnings("unchecked")
    public static LoopNode.LoopCondition conditionFromMap(Map<String, Object> map) {
        if (map == null) {
            return null;
        }
        
        LoopNode.LoopCondition.LoopConditionBuilder builder = LoopNode.LoopCondition.builder();
        
        if (map.containsKey("type")) {
            String typeStr = (String) map.get("type");
            try {
                builder.type(LoopNode.LoopCondition.ConditionType.valueOf(typeStr));
            } catch (IllegalArgumentException e) {
                // 忽略无效的类型
            }
        }
        
        if (map.containsKey("target")) {
            builder.target((String) map.get("target"));
        }
        
        if (map.containsKey("operator")) {
            builder.operator((String) map.get("operator"));
        }
        
        if (map.containsKey("value")) {
            builder.value(map.get("value"));
        }
        
        return builder.build();
    }
    
    public LoopNode toLoopNode() {
        return LoopNode.builder()
                .id(id)
                .loopType(loopType != null ? loopType : LoopNode.LoopType.CONDITION)
                .condition(condition)
                .maxIterations(maxIterations != null ? maxIterations : 1000)
                .loopBody(loopBody != null ? loopBody : new java.util.ArrayList<>())
                .exitNodeId(exitNodeId)
                .loopVariableName(loopVariableName != null ? loopVariableName : "loop_count")
                .build();
    }
}
