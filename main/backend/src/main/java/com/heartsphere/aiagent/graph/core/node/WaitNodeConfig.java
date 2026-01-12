package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 等待节点配置
 * 用于从JSON或其他配置源创建WaitNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class WaitNodeConfig {
    private String id;
    private WaitNode.WaitType waitType;
    private String waitCondition;
    private String nextNodeId;
    private Long timeout;

    @JsonCreator
    public WaitNodeConfig(
            @JsonProperty("id") String id,
            @JsonProperty("waitType") WaitNode.WaitType waitType,
            @JsonProperty("waitCondition") String waitCondition,
            @JsonProperty("nextNodeId") String nextNodeId,
            @JsonProperty("timeout") Long timeout) {
        this.id = id;
        this.waitType = waitType;
        this.waitCondition = waitCondition;
        this.nextNodeId = nextNodeId;
        this.timeout = timeout;
    }

    public WaitNode toWaitNode() {
        return WaitNode.builder()
                .id(id)
                .waitType(waitType)
                .waitCondition(waitCondition)
                .nextNodeId(nextNodeId)
                .timeout(timeout)
                .build();
    }
}
