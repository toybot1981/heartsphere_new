package com.heartsphere.admin.entity.graph;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Graph执行实体
 * 存储Graph执行的状态和结果
 */
@Data
@Entity
@Table(name = "graph_executions")
public class GraphExecution {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "execution_id", nullable = false, unique = true, length = 100)
    private String executionId; // 执行ID（UUID）
    
    @Column(name = "graph_id", nullable = false)
    private Long graphId; // Graph定义ID
    
    @Column(name = "status", nullable = false, length = 50)
    private String status; // 执行状态：RUNNING, PAUSED, WAITING, COMPLETED, FAILED, CANCELLED
    
    @Column(name = "current_node_id", length = 255)
    private String currentNodeId; // 当前执行的节点ID
    
    @Column(name = "wait_type", length = 50)
    private String waitType; // 等待类型：CHOICE, WAIT, NONE
    
    @Column(name = "waiting_node_id", length = 255)
    private String waitingNodeId; // 等待中的节点ID
    
    @Column(name = "step_count")
    private Integer stepCount = 0; // 执行步骤数
    
    @Column(name = "state_json", columnDefinition = "LONGTEXT")
    private String stateJson; // GraphState的JSON序列化
    
    @Column(name = "context_data_json", columnDefinition = "TEXT")
    private String contextDataJson; // 执行上下文数据的JSON序列化
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage; // 错误信息（如果执行失败）
    
    @Column(name = "created_by")
    private Long createdBy; // 创建者ID（管理员ID）
    
    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt; // 完成时间（如果执行完成或失败）
}
