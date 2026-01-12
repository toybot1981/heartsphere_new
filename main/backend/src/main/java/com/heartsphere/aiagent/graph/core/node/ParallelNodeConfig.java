package com.heartsphere.aiagent.graph.core.node;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/**
 * 并行节点配置
 * 用于从JSON或其他配置源创建ParallelNode
 *
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class ParallelNodeConfig {
    private String id;
    private List<List<String>> branches;
    private String mergeNodeId;
    private ParallelNode.MergeStrategy mergeStrategy;
    
    @JsonCreator
    public ParallelNodeConfig(
            @JsonProperty("id") String id,
            @JsonProperty("branches") List<List<String>> branches,
            @JsonProperty("mergeNodeId") String mergeNodeId,
            @JsonProperty("mergeStrategy") ParallelNode.MergeStrategy mergeStrategy) {
        this.id = id;
        this.branches = branches;
        this.mergeNodeId = mergeNodeId;
        this.mergeStrategy = mergeStrategy != null ? mergeStrategy : ParallelNode.MergeStrategy.ALL;
    }
    
    public ParallelNode toParallelNode() {
        return ParallelNode.builder()
                .id(id)
                .branches(branches != null ? branches : new java.util.ArrayList<>())
                .mergeNodeId(mergeNodeId)
                .mergeStrategy(mergeStrategy != null ? mergeStrategy : ParallelNode.MergeStrategy.ALL)
                .build();
    }
}
