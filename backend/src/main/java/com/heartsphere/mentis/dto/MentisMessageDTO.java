package com.heartsphere.mentis.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Mentis消息DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MentisMessageDTO {
    private Long id;
    private String messageId;
    private String sessionId;
    private String role;
    private String content;
    private String messageType;
    private String taskId;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
    
    // 技能信息（当角色触发技能时显示）
    private String skillId;      // 技能ID
    private String skillName;    // 技能名称
}
