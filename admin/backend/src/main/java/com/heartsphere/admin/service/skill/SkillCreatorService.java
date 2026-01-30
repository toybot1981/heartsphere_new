package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.entity.skill.SkillDefinition;
import com.heartsphere.admin.repository.skill.SkillDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * 技能创建器服务
 * 实现分步骤创建流程管理、草稿保存、最终生成等
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillCreatorService {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillValidationService validationService;
    private final McpToolValidator mcpToolValidator;
    private final SkillContentBuilder contentBuilder;
    private final SkillQualityAnalyzer qualityAnalyzer;
    private final SkillAIGeneratorService aiGeneratorService;
    private final SkillFileParserService fileParserService;
    
    // 草稿存储（实际应该使用Redis或数据库）
    private final Map<String, SkillDraft> draftStorage = new HashMap<>();
    
    /**
     * 开始创建流程
     * 
     * @return 创建会话ID
     */
    public String startCreation() {
        String sessionId = UUID.randomUUID().toString();
        SkillDraft draft = new SkillDraft();
        draft.setSessionId(sessionId);
        draftStorage.put(sessionId, draft);
        return sessionId;
    }
    
    /**
     * 保存草稿
     * 
     * @param sessionId 会话ID
     * @param draftData 草稿数据
     */
    public void saveDraft(String sessionId, Map<String, Object> draftData) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new IllegalArgumentException("sessionId 不能为空");
        }
        SkillDraft draft = draftStorage.get(sessionId);
        if (draft == null) {
            draft = new SkillDraft();
            draft.setSessionId(sessionId);
            draftStorage.put(sessionId, draft);
        }
        draft.setData(draftData != null ? draftData : new HashMap<>());
        draft.setUpdatedAt(System.currentTimeMillis());
    }
    
    /**
     * 恢复草稿
     * 
     * @param sessionId 会话ID
     * @return 草稿数据
     */
    public Map<String, Object> restoreDraft(String sessionId) {
        SkillDraft draft = draftStorage.get(sessionId);
        if (draft == null) {
            return new HashMap<>();
        }
        return draft.getData();
    }
    
    /**
     * 验证技能
     * 
     * @param skillData 技能数据
     * @return 验证结果
     */
    public SkillValidationResult validateSkill(Map<String, Object> skillData) {
        SkillValidationResult result = new SkillValidationResult();
        
        // 验证技能ID
        String skillId = (String) skillData.get("skillId");
        if (skillId != null) {
            var idResult = validationService.validateSkillId(skillId);
            result.addErrors(idResult.getErrors());
            result.addWarnings(idResult.getWarnings());
            
            // 检查唯一性
            if (skillDefinitionRepository.findBySkillId(skillId).isPresent()) {
                result.addError("技能ID已存在: " + skillId);
            }
        }
        
        // 验证描述
        String description = (String) skillData.get("description");
        if (description != null) {
            var descResult = validationService.validateDescription(description);
            result.addErrors(descResult.getErrors());
            result.addWarnings(descResult.getWarnings());
        }
        
        // 验证MCP工具配置
        String mcpToolConfig = (String) skillData.get("mcpToolConfig");
        if (mcpToolConfig != null) {
            var mcpResult = validationService.validateMcpToolConfig(mcpToolConfig);
            result.addErrors(mcpResult.getErrors());
            result.addWarnings(mcpResult.getWarnings());
            
            // 验证MCP工具可用性
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                var configNode = mapper.readTree(mcpToolConfig);
                if (configNode.has("mcpConfigId") && configNode.has("tools")) {
                    Long mcpConfigId = configNode.get("mcpConfigId").asLong();
                    var toolsNode = configNode.get("tools");
                    if (toolsNode.isArray()) {
                        java.util.List<String> toolNames = new java.util.ArrayList<>();
                        for (var toolNode : toolsNode) {
                            if (toolNode.has("name")) {
                                toolNames.add(toolNode.get("name").asText());
                            }
                        }
                        if (!toolNames.isEmpty()) {
                            var mcpValidation = mcpToolValidator.validateToolAvailability(mcpConfigId, toolNames);
                            result.addErrors(mcpValidation.getErrors());
                            result.addWarnings(mcpValidation.getWarnings());
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("解析MCP工具配置失败: {}", e.getMessage());
            }
        }
        
        // 验证返回格式
        String instruction = (String) skillData.get("instruction");
        if (instruction != null) {
            var formatResult = validationService.validateReturnFormat(instruction);
            result.addWarnings(formatResult.getWarnings());
        }
        
        // 验证元数据完整性
        String name = (String) skillData.get("name");
        var metadataResult = validationService.validateMetadataCompleteness(name, description);
        result.addErrors(metadataResult.getErrors());
        
        result.setValid(result.getErrors().isEmpty());
        return result;
    }
    
    /**
     * 分析技能质量
     * 
     * @param skillData 技能数据
     * @return 质量报告
     */
    public SkillQualityReport analyzeQuality(java.util.Map<String, Object> skillData) {
        SkillQualityReport report = new SkillQualityReport();
        
        // 分析描述质量
        String description = (String) skillData.get("description");
        if (description != null) {
            var descReport = qualityAnalyzer.analyzeDescription(description);
            report.setDescriptionScore(descReport.getScore());
            report.setDescriptionLevel(descReport.getLevel());
            report.setDescriptionSuggestions(descReport.getSuggestions());
        }
        
        // 检查内容完整性
        var completenessReport = qualityAnalyzer.checkCompleteness(skillData);
        report.setCompletenessScore(completenessReport.isComplete() ? 100 : 50);
        report.setMissingFields(completenessReport.getMissingFields());
        report.setCompletenessSuggestions(completenessReport.getSuggestions());
        
        // 计算综合评分
        int totalScore = (report.getDescriptionScore() + report.getCompletenessScore()) / 2;
        report.setTotalScore(totalScore);
        
        return report;
    }
    
    /**
     * 完成创建
     * 
     * @param skillData 技能数据
     * @return 创建的技能
     */
    @Transactional
    public SkillDefinition finalizeSkill(Map<String, Object> skillData) {
        // 先验证
        SkillValidationResult validation = validateSkill(skillData);
        if (!validation.isValid()) {
            throw new IllegalArgumentException("技能验证失败: " + String.join(", ", validation.getErrors()));
        }
        
        // 构建技能实体
        SkillDefinition skill = new SkillDefinition();
        skill.setSkillId((String) skillData.get("skillId"));
        skill.setName((String) skillData.get("name"));
        skill.setDescription((String) skillData.get("description"));
        skill.setCategory((String) skillData.get("category"));
        skill.setSkillType((String) skillData.getOrDefault("skillType", "PASSIVE"));
        skill.setExecutionType((String) skillData.getOrDefault("executionType", "RULE_BASED"));
        skill.setVersion((String) skillData.getOrDefault("version", "1.0.0"));
        skill.setAuthor((String) skillData.get("author"));
        skill.setLicense((String) skillData.get("license"));
        skill.setCompatibility((String) skillData.get("compatibility"));
        skill.setMetadata((String) skillData.get("metadata"));
        skill.setMcpToolConfig((String) skillData.get("mcpToolConfig"));
        skill.setIsSystemSkill((Boolean) skillData.getOrDefault("isSystemSkill", false));
        
        // 生成SKILL.md内容
        String skillContent = contentBuilder.buildSkillContent(skill, skillData);
        skill.setSkillContent(skillContent);
        
        // 保存到数据库
        return skillDefinitionRepository.save(skill);
    }
    
    /**
     * 从描述生成技能（AI生成）
     * 
     * @param description 用户描述
     * @param sessionId 会话ID
     * @param authToken 认证Token（可选，用于调用AI服务）
     * @return 生成的技能定义
     */
    public Map<String, Object> generateSkillFromDescription(String description, String sessionId, String authToken) {
        return aiGeneratorService.generateSkillFromDescription(description, sessionId, authToken);
    }
    
    /**
     * 从文件内容解析技能（文件导入）
     * 
     * @param content 文件内容（skill.md 格式）
     * @param sessionId 会话ID
     * @return 解析后的技能定义
     */
    public Map<String, Object> parseSkillFromMdContent(String content, String sessionId) {
        return fileParserService.parseSkillFromContent(content);
    }
    
    /**
     * 技能草稿
     */
    private static class SkillDraft {
        private String sessionId;
        private Map<String, Object> data = new HashMap<>();
        private long updatedAt;
        
        public String getSessionId() {
            return sessionId;
        }
        
        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }
        
        public Map<String, Object> getData() {
            return data;
        }
        
        public void setData(Map<String, Object> data) {
            this.data = data;
        }
        
        public long getUpdatedAt() {
            return updatedAt;
        }
        
        public void setUpdatedAt(long updatedAt) {
            this.updatedAt = updatedAt;
        }
    }
    
    /**
     * 技能验证结果
     */
    public static class SkillValidationResult {
        private boolean valid = true;
        private final java.util.List<String> errors = new java.util.ArrayList<>();
        private final java.util.List<String> warnings = new java.util.ArrayList<>();
        
        public boolean isValid() {
            return valid;
        }
        
        public void setValid(boolean valid) {
            this.valid = valid;
        }
        
        public java.util.List<String> getErrors() {
            return errors;
        }
        
        public void addError(String error) {
            this.errors.add(error);
        }
        
        public void addErrors(java.util.List<String> errors) {
            this.errors.addAll(errors);
        }
        
        public java.util.List<String> getWarnings() {
            return warnings;
        }
        
        public void addWarning(String warning) {
            this.warnings.add(warning);
        }
        
        public void addWarnings(java.util.List<String> warnings) {
            this.warnings.addAll(warnings);
        }
    }
    
    /**
     * 技能质量报告
     */
    public static class SkillQualityReport {
        private int totalScore;
        private int descriptionScore;
        private String descriptionLevel;
        private java.util.List<String> descriptionSuggestions;
        private int completenessScore;
        private java.util.List<String> missingFields;
        private java.util.List<String> completenessSuggestions;
        
        public int getTotalScore() {
            return totalScore;
        }
        
        public void setTotalScore(int totalScore) {
            this.totalScore = totalScore;
        }
        
        public int getDescriptionScore() {
            return descriptionScore;
        }
        
        public void setDescriptionScore(int descriptionScore) {
            this.descriptionScore = descriptionScore;
        }
        
        public String getDescriptionLevel() {
            return descriptionLevel;
        }
        
        public void setDescriptionLevel(String descriptionLevel) {
            this.descriptionLevel = descriptionLevel;
        }
        
        public java.util.List<String> getDescriptionSuggestions() {
            return descriptionSuggestions;
        }
        
        public void setDescriptionSuggestions(java.util.List<String> descriptionSuggestions) {
            this.descriptionSuggestions = descriptionSuggestions;
        }
        
        public int getCompletenessScore() {
            return completenessScore;
        }
        
        public void setCompletenessScore(int completenessScore) {
            this.completenessScore = completenessScore;
        }
        
        public java.util.List<String> getMissingFields() {
            return missingFields;
        }
        
        public void setMissingFields(java.util.List<String> missingFields) {
            this.missingFields = missingFields;
        }
        
        public java.util.List<String> getCompletenessSuggestions() {
            return completenessSuggestions;
        }
        
        public void setCompletenessSuggestions(java.util.List<String> completenessSuggestions) {
            this.completenessSuggestions = completenessSuggestions;
        }
    }
}
