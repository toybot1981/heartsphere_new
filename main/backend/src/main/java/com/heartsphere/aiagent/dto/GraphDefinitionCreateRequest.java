package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 创建Graph定义的请求DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphDefinitionCreateRequest {
    private String name;
    private String description;
    private String graphType;
    private String startNodeId;
    private Boolean isActive;
    private List<GraphNodeDTO> nodes;
    private List<GraphEdgeDTO> edges;
}
