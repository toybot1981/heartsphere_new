package com.heartsphere.admin.dto.skill;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 技能定义 DTO（Admin模块）
 * 
 * 注意：已移除废弃的 functionSchema 字段，改用 mcpToolConfig
 * 
 * @author HeartSphere
 * @version 2.0
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
    // 已移除：functionSchema (废弃，改用 mcpToolConfig)
    private String executionType;
    private String executionConfig;
    private String autoTriggerKeywords;
    private String requiredPermissions;
    private Integer maxUsagePerDay;
    private String version;
    private String author;
    private Boolean isSystemSkill;
    // 专业 Skill Creator 支持的新字段
    private String license;
    private String compatibility;
    private String metadata;
    private String skillContent;
    private String mcpToolConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
