package com.heartsphere.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 技能执行结果 DTO
 * 
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkillExecutionResultDTO {
    private String skillId;
    private Boolean success;
    private Object result;
    private String errorMessage;
    private Integer executionTimeMs;
}
