package com.heartsphere.skill.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.repository.SkillInstructionRepository;
import com.heartsphere.skill.repository.SkillResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 技能迁移工具
 * 
 * 用于将 .claude/skills 目录中的技能迁移到数据库
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SkillMigrationTool {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillInstructionRepository skillInstructionRepository;
    private final SkillResourceRepository skillResourceRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 迁移技能定义
     * 
     * @param skillData 技能数据（从 .claude/skills 目录读取）
     */
    @Transactional
    public void migrateSkill(SkillMigrationData skillData) {
        try {
            // 1. 创建或更新技能定义
            SkillDefinition skillDefinition = createOrUpdateSkillDefinition(skillData);
            
            // 2. 创建或更新技能指令
            createOrUpdateSkillInstructions(skillData, skillDefinition.getSkillId());
            
            // 3. 创建或更新技能资源
            createOrUpdateSkillResources(skillData, skillDefinition.getSkillId());
            
            log.info("技能迁移成功: {}", skillDefinition.getSkillId());
            
        } catch (Exception e) {
            log.error("技能迁移失败: {}", skillData.getSkillId(), e);
            throw new RuntimeException("技能迁移失败: " + skillData.getSkillId(), e);
        }
    }
    
    /**
     * 创建或更新技能定义
     */
    private SkillDefinition createOrUpdateSkillDefinition(SkillMigrationData skillData) {
        SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillData.getSkillId())
            .orElse(new SkillDefinition());
        
        skill.setSkillId(skillData.getSkillId());
        skill.setName(skillData.getName());
        skill.setDescription(skillData.getDescription());
        skill.setCategory(skillData.getCategory());
        skill.setSkillType(skillData.getSkillType());
        skill.setExecutionType(skillData.getExecutionType());
        skill.setFunctionSchema(skillData.getFunctionSchema());
        skill.setExecutionConfig(skillData.getExecutionConfig());
        skill.setAutoTriggerKeywords(skillData.getAutoTriggerKeywords());
        skill.setRequiredPermissions(skillData.getRequiredPermissions());
        skill.setMaxUsagePerDay(skillData.getMaxUsagePerDay());
        skill.setVersion(skillData.getVersion());
        skill.setAuthor(skillData.getAuthor());
        skill.setIsSystemSkill(skillData.isSystemSkill());
        // SkillDefinition 没有 isActive 字段，跳过设置
        
        return skillDefinitionRepository.save(skill);
    }
    
    /**
     * 创建或更新技能指令
     */
    private void createOrUpdateSkillInstructions(SkillMigrationData skillData, String skillId) {
        // 删除旧的指令
        skillInstructionRepository.deleteBySkillId(skillId);
        
        // 创建新指令
        if (skillData.getInstructions() != null) {
            for (int i = 0; i < skillData.getInstructions().size(); i++) {
                SkillInstruction instruction = new SkillInstruction();
                instruction.setSkillId(skillId);
                instruction.setInstructionLevel(2);
                instruction.setInstructionText(skillData.getInstructions().get(i));
                instruction.setExecutionOrder(i + 1); // 使用 executionOrder 而不是 priority
                
                skillInstructionRepository.save(instruction);
            }
        }
    }
    
    /**
     * 创建或更新技能资源
     */
    private void createOrUpdateSkillResources(SkillMigrationData skillData, String skillId) {
        // 删除旧的资源
        skillResourceRepository.deleteBySkillId(skillId);
        
        // 创建新资源
        if (skillData.getResources() != null) {
            for (SkillMigrationData.ResourceData resourceData : skillData.getResources()) {
                SkillResource resource = new SkillResource();
                resource.setSkillId(skillId);
                resource.setResourceType(resourceData.getType());
                resource.setResourceName(resourceData.getName());
                resource.setResourceUrl(resourceData.getPath()); // 使用 resourceUrl 而不是 resourcePath
                resource.setResourceContent(resourceData.getContent());
                
                skillResourceRepository.save(resource);
            }
        }
    }
    
    /**
     * 技能迁移数据类
     */
    public static class SkillMigrationData {
        private String skillId;
        private String name;
        private String description;
        private String category;
        private String skillType = "ACTIVE";
        private String executionType = "SCRIPT";
        private String functionSchema;
        private String executionConfig;
        private String autoTriggerKeywords;
        private String requiredPermissions;
        private Integer maxUsagePerDay = -1;
        private String version = "1.0.0";
        private String author;
        private boolean isSystemSkill = true;
        private List<String> instructions;
        private List<ResourceData> resources;
        
        // Getters and Setters
        public String getSkillId() { return skillId; }
        public void setSkillId(String skillId) { this.skillId = skillId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        
        public String getSkillType() { return skillType; }
        public void setSkillType(String skillType) { this.skillType = skillType; }
        
        public String getExecutionType() { return executionType; }
        public void setExecutionType(String executionType) { this.executionType = executionType; }
        
        public String getFunctionSchema() { return functionSchema; }
        public void setFunctionSchema(String functionSchema) { this.functionSchema = functionSchema; }
        
        public String getExecutionConfig() { return executionConfig; }
        public void setExecutionConfig(String executionConfig) { this.executionConfig = executionConfig; }
        
        public String getAutoTriggerKeywords() { return autoTriggerKeywords; }
        public void setAutoTriggerKeywords(String autoTriggerKeywords) { this.autoTriggerKeywords = autoTriggerKeywords; }
        
        public String getRequiredPermissions() { return requiredPermissions; }
        public void setRequiredPermissions(String requiredPermissions) { this.requiredPermissions = requiredPermissions; }
        
        public Integer getMaxUsagePerDay() { return maxUsagePerDay; }
        public void setMaxUsagePerDay(Integer maxUsagePerDay) { this.maxUsagePerDay = maxUsagePerDay; }
        
        public String getVersion() { return version; }
        public void setVersion(String version) { this.version = version; }
        
        public String getAuthor() { return author; }
        public void setAuthor(String author) { this.author = author; }
        
        public boolean isSystemSkill() { return isSystemSkill; }
        public void setSystemSkill(boolean systemSkill) { isSystemSkill = systemSkill; }
        
        public List<String> getInstructions() { return instructions; }
        public void setInstructions(List<String> instructions) { this.instructions = instructions; }
        
        public List<ResourceData> getResources() { return resources; }
        public void setResources(List<ResourceData> resources) { this.resources = resources; }
        
        public static class ResourceData {
            private String type;
            private String name;
            private String path;
            private String content;
            
            // Getters and Setters
            public String getType() { return type; }
            public void setType(String type) { this.type = type; }
            
            public String getName() { return name; }
            public void setName(String name) { this.name = name; }
            
            public String getPath() { return path; }
            public void setPath(String path) { this.path = path; }
            
            public String getContent() { return content; }
            public void setContent(String content) { this.content = content; }
        }
    }
}
