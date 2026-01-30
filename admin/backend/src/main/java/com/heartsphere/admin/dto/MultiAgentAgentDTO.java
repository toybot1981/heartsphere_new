package com.heartsphere.admin.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 多智能体 Agent DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiAgentAgentDTO {
    
    private String agentId;
    private String name;
    private String description;
    private Set<String> capabilities;
    private String status; // IDLE, BUSY, ERROR
    private LocalDateTime lastExecutionTime;
    private Long totalExecutions;
    private Long successfulExecutions;
    private Double successRate;
    private Double averageResponseTimeMs;
    private Boolean enabled;
}
