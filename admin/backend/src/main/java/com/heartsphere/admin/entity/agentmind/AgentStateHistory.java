package com.heartsphere.admin.entity.agentmind;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 智能体状态历史实体
 * 记录智能体的状态变化历史
 */
@Data
@Entity
@Table(name = "agent_state_history", indexes = {
    @Index(name = "idx_character_id", columnList = "character_id"),
    @Index(name = "idx_state_type", columnList = "state_type"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
public class AgentStateHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    /**
     * 角色ID（关联到Character表）
     */
    @Column(name = "character_id", nullable = false)
    private Long characterId;
    
    /**
     * 状态类型
     * 可选值：IDLE（空闲）、THINKING（思考中）、PROCESSING（处理中）、RESPONDING（响应中）、EXECUTING（执行中）等
     */
    @Column(name = "state_type", nullable = false, length = 50)
    private String stateType;
    
    /**
     * 状态描述
     */
    @Column(name = "state_description", columnDefinition = "TEXT")
    private String stateDescription;
    
    /**
     * 状态持续时间（毫秒）
     */
    @Column(name = "duration_ms")
    private Long durationMs;
    
    /**
     * 状态转换原因
     */
    @Column(name = "transition_reason", columnDefinition = "TEXT")
    private String transitionReason;
    
    /**
     * 关联的会话ID
     */
    @Column(name = "related_session_id")
    private Long relatedSessionId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
