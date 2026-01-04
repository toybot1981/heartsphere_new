package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Graph定义DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphDefinitionDTO {
    private Long id;
    private String name;
    private String description;
    private String graphType;
    private String startNodeId;
    private Boolean isActive;
    private Integer version;
    private Long createdBy;
    private Long updatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 关联的节点和边（可选，用于完整Graph定义）
    private List<GraphNodeDTO> nodes;
    private List<GraphEdgeDTO> edges;
}
