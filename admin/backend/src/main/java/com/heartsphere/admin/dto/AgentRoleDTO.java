package com.heartsphere.admin.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * Agent 角色 DTO
 */
@Data
public class AgentRoleDTO {
    private Long id;
    private String name;
    private String description;
    private Integer age;
    private String gender;
    private String role;
    private String bio;
    private String avatarUrl;
    private String systemInstruction;
    private String tags;
    private String skills;
    private Long systemEraId;
    private String eraName;
    private Boolean isActive;
    private Map<String, Object> capabilities; // 技能和能力详情
}
