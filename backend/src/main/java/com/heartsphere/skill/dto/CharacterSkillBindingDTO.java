package com.heartsphere.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 角色技能装备 DTO
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
public class CharacterSkillBindingDTO {
    private Long id;
    private Long characterId;
    private String skillId;
    private Boolean isEnabled;
    private Boolean autoTrigger;
    private Integer priority;
    private Integer usageCount;
    private LocalDateTime lastUsedAt;
    private LocalDateTime equippedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 关联的技能信息（可选）
    private SkillDefinitionDTO skill;
}
