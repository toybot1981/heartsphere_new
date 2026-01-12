package com.heartsphere.admin.entity.graph;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Graph执行日志实体
 * 记录每个节点的执行日志
 */
@Data
@Entity
@Table(name = "graph_execution_logs", indexes = {
    @Index(name = "idx_execution_id", columnList = "execution_id"),
    @Index(name = "idx_node_id", columnList = "node_id"),
    @Index(name = "idx_execution_node", columnList = "execution_id,node_id")
})
public class ExecutionLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "execution_id", nullable = false, length = 100)
    private String executionId; // 执行ID（UUID）
    
    @Column(name = "graph_id", nullable = false)
    private Long graphId; // Graph定义ID
    
    @Column(name = "node_id", nullable = false, length = 255)
    private String nodeId; // 节点ID
    
    @Column(name = "node_type", length = 50)
    private String nodeType; // 节点类型（dialogue, choice, condition等）
    
    @Column(name = "log_type", nullable = false, length = 50)
    private String logType; // 日志类型：NODE_START, NODE_END, NODE_ERROR, STATE_CHANGE, USER_ACTION
    
    @Column(name = "message", columnDefinition = "TEXT")
    private String message; // 日志消息
    
    @Column(name = "state_snapshot", columnDefinition = "LONGTEXT")
    private String stateSnapshot; // 状态快照（JSON）
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage; // 错误信息（如果有错误）
    
    @Column(name = "execution_time_ms")
    private Long executionTimeMs; // 执行时间（毫秒）
    
    @Column(name = "step_number")
    private Integer stepNumber; // 执行步骤号
    
    @Column(name = "created_at", nullable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    /**
     * 日志类型枚举
     */
    public enum LogType {
        NODE_START,     // 节点开始执行
        NODE_END,       // 节点执行结束
        NODE_ERROR,     // 节点执行错误
        STATE_CHANGE,   // 状态变更
        USER_ACTION,    // 用户操作（选择、输入等）
        WAIT,           // 等待
        RESUME,         // 恢复执行
        PAUSE,          // 暂停执行
        CANCEL          // 取消执行
    }
}
