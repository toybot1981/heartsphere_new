package com.heartsphere.admin.graph.core.node;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 状态变更节点配置
 * 用于从JSON或其他配置源创建StateChangeNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StateChangeNodeConfig {
    @JsonProperty("id")
    private String id;
    
    @JsonProperty("changes")
    private List<StateChangeNode.StateChange> changes;

    public StateChangeNode toStateChangeNode() {
        // 确保id不为null
        String nodeId = id != null ? id : "state_change_" + System.currentTimeMillis();
        // 确保changes不为null
        List<StateChangeNode.StateChange> nodeChanges = changes != null ? changes : new ArrayList<>();
        
        return StateChangeNode.builder()
                .id(nodeId)
                .changes(nodeChanges)
                .build();
    }
}
