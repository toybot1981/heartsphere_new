package com.heartsphere.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 角色可用技能响应DTO
 * 包含两类技能：
 * 1. Function Calling 技能（有 function_schema）
 * 2. 提示词驱动技能（无 function_schema）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CharacterAvailableSkillsDTO {
    
    /**
     * Function Calling 技能列表
     * 这些技能有 function_schema，可以通过 Function Calling 自动调用
     */
    private List<FunctionDefinitionDTO> functionCallingSkills;
    
    /**
     * 提示词驱动技能列表
     * 这些技能没有 function_schema，通过在系统指令中描述，让AI自然使用
     */
    private List<PromptDrivenSkillDTO> promptDrivenSkills;
    
    /**
     * 提示词驱动技能基本信息DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PromptDrivenSkillDTO {
        /**
         * 技能ID
         */
        private String skillId;
        
        /**
         * 技能名称
         */
        private String name;
        
        /**
         * 技能描述
         */
        private String description;
    }
}
