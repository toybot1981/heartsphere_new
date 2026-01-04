package com.heartsphere.aiagent.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Graph节点DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphNodeDTO {
    private Long id;
    private Long graphId;
    private String nodeId;
    private String nodeType;
    private Map<String, Object> nodeConfig; // 节点配置（解析后的JSON）
    private Double positionX;
    private Double positionY;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
