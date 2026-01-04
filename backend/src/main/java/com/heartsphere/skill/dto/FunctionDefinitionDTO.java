package com.heartsphere.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Function Definition DTO
 * 
 * 用于 AI Function Calling 的技能定义
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FunctionDefinitionDTO {
    private String name;
    private String description;
    private Map<String, Object> parameters;
}
