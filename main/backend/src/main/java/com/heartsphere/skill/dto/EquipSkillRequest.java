package com.heartsphere.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 装备技能请求 DTO
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
public class EquipSkillRequest {
    private Boolean isEnabled;
    private Boolean autoTrigger;
    private Integer priority;
}
