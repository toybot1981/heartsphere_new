package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 开始节点配置
 * 用于从JSON或其他配置源创建StartNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class StartNodeConfig {
    private String id;

    @JsonCreator
    public StartNodeConfig(@JsonProperty("id") String id) {
        this.id = id;
    }

    public StartNode toStartNode() {
        return StartNode.builder()
                .id(id)
                .build();
    }
}
