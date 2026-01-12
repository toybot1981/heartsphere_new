package com.heartsphere.admin.entity.graph;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Graph定义实体
 * 存储流程图的定义信息
 */
@Data
@Entity
@Table(name = "graph_definitions")
public class GraphDefinition {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String name; // Graph名称
    
    @Column(length = 500)
    private String description; // 描述
    
    @Column(name = "graph_type", length = 50)
    private String graphType = "SCRIPT"; // Graph类型：SCRIPT, SKILL_CHECK等
    
    @Column(name = "start_node_id", length = 100)
    private String startNodeId; // 开始节点ID
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 是否启用
    
    @Column(name = "version")
    private Integer version = 1; // 版本号
    
    @Column(name = "created_by")
    private Long createdBy; // 创建者ID（管理员ID）
    
    @Column(name = "updated_by")
    private Long updatedBy; // 更新者ID（管理员ID）
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
