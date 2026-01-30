package com.heartsphere.admin.dto.agentmind;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 智能体身份认知DTO
 */
@Data
public class AgentIdentityDTO {
    
    private Long id;
    private Long characterId;
    
    // 角色基本信息（从Character表获取）
    private String characterName;
    private String characterRole;
    private String characterBio;
    
    // 身份认知数据（JSON格式，解析为Map）
    private Map<String, Object> identityData;
    
    // 能力列表（JSON格式，解析为List）
    private List<Map<String, Object>> capabilities;
    
    // 能力边界（JSON格式，解析为List）
    private List<Map<String, Object>> limitations;
    
    // 自我认知水平（0-100）
    private Integer selfAwarenessLevel;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
