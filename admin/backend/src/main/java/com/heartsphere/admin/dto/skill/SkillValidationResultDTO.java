package com.heartsphere.admin.dto.skill;

import lombok.Data;
import java.util.List;

/**
 * 技能验证结果DTO
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
public class SkillValidationResultDTO {
    private boolean valid;
    private List<String> errors;
    private List<String> warnings;
}
