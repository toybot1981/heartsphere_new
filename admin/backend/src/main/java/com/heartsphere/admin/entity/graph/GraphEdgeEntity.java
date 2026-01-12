package com.heartsphere.admin.entity.graph;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Graph边实体
 * 存储流程图中节点之间的连接关系
 */
@Data
@Entity
@Table(name = "graph_edges")
public class GraphEdgeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "graph_id", nullable = false)
    private Long graphId; // 关联的Graph定义ID
    
    @Column(name = "source_node_id", nullable = false, length = 100)
    private String sourceNodeId; // 源节点ID
    
    @Column(name = "target_node_id", nullable = false, length = 100)
    private String targetNodeId; // 目标节点ID
    
    @Column(name = "edge_type", length = 50)
    private String edgeType; // 边类型：default, true, false, condition等
    
    @Column(name = "edge_label", length = 200)
    private String edgeLabel; // 边的标签（用于显示）
    
    @Column(name = "condition_config", columnDefinition = "TEXT")
    private String conditionConfig; // 条件配置（JSON格式，用于条件边）
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0; // 排序顺序
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
