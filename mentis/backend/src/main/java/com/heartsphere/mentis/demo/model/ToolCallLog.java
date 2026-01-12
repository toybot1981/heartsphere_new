package com.heartsphere.mentis.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 工具调用日志实体
 * 用于记录 AgentScope 工具调用的详细信息
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "tool_call_logs", indexes = {
    @Index(name = "idx_session_id", columnList = "sessionId"),
    @Index(name = "idx_tool_name", columnList = "toolName"),
    @Index(name = "idx_timestamp", columnList = "timestamp")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ToolCallLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 会话ID
     */
    @Column(nullable = false, length = 100)
    private String sessionId;
    
    /**
     * 工具名称
     */
    @Column(nullable = false, length = 100)
    private String toolName;
    
    /**
     * 工具调用参数（JSON格式存储）
     */
    @Column(columnDefinition = "TEXT")
    private String parameters;
    
    /**
     * 工具执行结果（JSON格式存储）
     */
    @Column(columnDefinition = "TEXT")
    private String result;
    
    /**
     * 工具调用状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ToolCallStatus status;
    
    /**
     * 开始时间
     */
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    /**
     * 结束时间
     */
    private LocalDateTime endTime;
    
    /**
     * 执行耗时（毫秒）
     */
    private Long duration;
    
    /**
     * 错误信息
     */
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    /**
     * 创建时间
     */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    /**
     * 工具调用状态枚举
     */
    public enum ToolCallStatus {
        PENDING,    // 等待执行
        RUNNING,    // 执行中
        SUCCESS,    // 执行成功
        ERROR       // 执行失败
    }
}
