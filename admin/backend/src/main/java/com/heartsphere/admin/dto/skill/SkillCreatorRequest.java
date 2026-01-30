package com.heartsphere.admin.dto.skill;

import lombok.Data;
import java.util.Map;

/**
 * 技能创建器请求DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class SkillCreatorRequest {
    private String sessionId;
    private Map<String, Object> skillData;
}
