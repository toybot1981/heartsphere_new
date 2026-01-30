package com.heartsphere.admin.dto.skill;

import lombok.Data;
import java.util.Map;

/**
 * 技能创建器响应DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class SkillCreatorResponse {
    private String sessionId;
    private boolean success;
    private String message;
    private Map<String, Object> data;
}
