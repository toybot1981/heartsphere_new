package com.heartsphere.admin.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Graph边DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphEdgeDTO {
    private Long id;
    private Long graphId;
    private String sourceNodeId;
    private String targetNodeId;
    private String edgeType;
    private String edgeLabel;
    private Map<String, Object> conditionConfig; // 条件配置（解析后的JSON）
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
