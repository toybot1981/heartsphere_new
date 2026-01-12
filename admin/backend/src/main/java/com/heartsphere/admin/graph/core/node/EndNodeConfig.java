package com.heartsphere.admin.graph.core.node;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

/**
 * 结束节点配置
 * 用于从JSON或其他配置源创建EndNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class EndNodeConfig {
    private String id;
    private String endingType;
    private String endingDescription;

    @JsonCreator
    public EndNodeConfig(
            @JsonProperty("id") String id,
            @JsonProperty("endingType") @JsonAlias({"endType"}) String endingType,
            @JsonProperty("endingDescription") @JsonAlias({"result"}) String endingDescription) {
        this.id = id;
        this.endingType = endingType;
        this.endingDescription = endingDescription;
    }

    public EndNode toEndNode() {
        return EndNode.builder()
                .id(id)
                .endingType(endingType)
                .endingDescription(endingDescription)
                .build();
    }
}
