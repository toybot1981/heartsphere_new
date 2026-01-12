package com.heartsphere.admin.entity.graph;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Graph节点实体
 * 存储流程图中节点的配置信息
 */
@Data
@Entity
@Table(name = "graph_nodes")
public class GraphNodeEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "graph_id", nullable = false)
    private Long graphId; // 关联的Graph定义ID
    
    @Column(name = "node_id", nullable = false, length = 100)
    private String nodeId; // 节点ID（在Graph中唯一）
    
    @Column(name = "node_type", nullable = false, length = 50)
    private String nodeType; // 节点类型：dialogue, choice, condition等
    
    @Column(name = "node_config", columnDefinition = "TEXT")
    private String nodeConfig; // 节点配置（JSON格式）
    
    @Column(name = "position_x")
    private Double positionX; // 节点在编辑器中的X坐标
    
    @Column(name = "position_y")
    private Double positionY; // 节点在编辑器中的Y坐标
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0; // 排序顺序
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
