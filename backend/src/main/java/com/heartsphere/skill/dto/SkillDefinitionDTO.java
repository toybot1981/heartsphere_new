package com.heartsphere.skill.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 技能定义 DTO
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
public class SkillDefinitionDTO {
    private Long id;
    private String skillId;
    private String name;
    private String description;
    private String category;
    private String skillType;
    private Integer maxLevel;
    private Integer baseValue;
    private String iconUrl;
    private String functionSchema;
    private String executionType;
    private String executionConfig;
    private String autoTriggerKeywords;
    private String requiredPermissions;
    private Integer maxUsagePerDay;
    private String version;
    private String author;
    private Boolean isSystemSkill;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
