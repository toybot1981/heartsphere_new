package com.heartsphere.admin.dto.agentmind;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 智能体状态历史DTO
 */
@Data
public class AgentStateHistoryDTO {
    
    private Long id;
    private Long characterId;
    
    // 角色名称（从Character表获取）
    private String characterName;
    
    // 状态类型
    private String stateType;
    
    // 状态描述
    private String stateDescription;
    
    // 状态持续时间（毫秒）
    private Long durationMs;
    
    // 状态转换原因
    private String transitionReason;
    
    // 关联的会话ID
    private Long relatedSessionId;
    
    private LocalDateTime createdAt;
}
