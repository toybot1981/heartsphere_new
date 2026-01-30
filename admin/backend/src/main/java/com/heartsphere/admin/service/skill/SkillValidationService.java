package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.dto.skill.SkillEnhancedValidationResultDTO;
import com.heartsphere.admin.entity.skill.SkillDefinition;
import com.heartsphere.admin.repository.skill.SkillResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * 技能验证服务
 * 实现技能格式、内容、完整性等多层级验证
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillValidationService {
    
    private final SkillResourceRepository resourceRepository;
    private final Yaml yaml = new Yaml();
    
    // 技能ID格式正则：小写字母、数字和单连字符
    private static final Pattern SKILL_ID_PATTERN = Pattern.compile("^[a-z0-9]+(-[a-z0-9]+)*$");
    
    // FunctionCall 标记模式
    private static final Pattern FUNCTION_CALL_PATTERN = Pattern.compile(
        "<\\|FunctionCall(Begin|End)\\|>", Pattern.CASE_INSENSITIVE
    );
    
    /**
     * 验证技能ID格式
     * 
     * @param skillId 技能ID
     * @return 验证结果
     */
    public ValidationResult validateSkillId(String skillId) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (skillId == null || skillId.trim().isEmpty()) {
            errors.add("技能ID不能为空");
            return new ValidationResult(false, errors, warnings);
        }
        
        // 长度验证：1-64字符
        if (skillId.length() < 1 || skillId.length() > 64) {
            errors.add("技能ID长度必须在1-64字符之间");
        }
        
        // 格式验证
        if (!SKILL_ID_PATTERN.matcher(skillId).matches()) {
            errors.add("技能ID格式不正确，只能包含小写字母、数字和单连字符（如：my-skill-123）");
        }
        
        return new ValidationResult(errors.isEmpty(), errors, warnings);
    }
    
    /**
     * 验证技能描述
     * 
     * @param description 技能描述
     * @return 验证结果
     */
    public ValidationResult validateDescription(String description) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (description == null || description.trim().isEmpty()) {
            errors.add("技能描述不能为空");
            return new ValidationResult(false, errors, warnings);
        }
        
        // 长度验证：1-1024字符
        if (description.length() < 1) {
            errors.add("技能描述不能为空");
        } else if (description.length() > 1024) {
            errors.add("技能描述长度不能超过1024字符");
        }
        
        // 质量检查
        if (description.length() < 20) {
            warnings.add("技能描述过短，建议至少20字符，包含功能说明和使用场景");
        }
        
        return new ValidationResult(errors.isEmpty(), errors, warnings);
    }
    
    /**
     * 验证MCP工具配置JSON格式
     * 
     * @param mcpToolConfig MCP工具配置JSON字符串
     * @return 验证结果
     */
    public ValidationResult validateMcpToolConfig(String mcpToolConfig) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (mcpToolConfig == null || mcpToolConfig.trim().isEmpty()) {
            // MCP工具配置是可选的，允许为空
            return new ValidationResult(true, errors, warnings);
        }
        
        try {
            // 验证JSON格式
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            mapper.readTree(mcpToolConfig);
            
            // 验证必需字段
            com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(mcpToolConfig);
            if (!root.has("mcpConfigId")) {
                warnings.add("MCP工具配置缺少 mcpConfigId 字段");
            }
            if (!root.has("tools") || !root.get("tools").isArray()) {
                warnings.add("MCP工具配置缺少 tools 数组字段");
            }
        } catch (Exception e) {
            errors.add("MCP工具配置JSON格式错误: " + e.getMessage());
        }
        
        return new ValidationResult(errors.isEmpty(), errors, warnings);
    }
    
    /**
     * 验证返回格式（检测FunctionCall标记）
     * 
     * @param instructionText 指令内容
     * @return 验证结果
     */
    public ValidationResult validateReturnFormat(String instructionText) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (instructionText == null || instructionText.trim().isEmpty()) {
            return new ValidationResult(true, errors, warnings);
        }
        
        // 检测FunctionCall标记
        if (FUNCTION_CALL_PATTERN.matcher(instructionText).find()) {
            warnings.add("技能指令中不应包含 FunctionCall 格式标记（<|FunctionCallBegin|>、<|FunctionCallEnd|>）");
            warnings.add("技能应返回实际执行结果，而非工具调用标记");
            warnings.add("建议使用 MCP 工具调用，并返回工具执行的实际结果");
        }
        
        return new ValidationResult(true, errors, warnings);
    }
    
    /**
     * 验证元数据完整性
     * 
     * @param name 技能名称
     * @param description 技能描述
     * @return 验证结果
     */
    public ValidationResult validateMetadataCompleteness(String name, String description) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        if (name == null || name.trim().isEmpty()) {
            errors.add("技能名称不能为空");
        }
        
        if (description == null || description.trim().isEmpty()) {
            errors.add("技能描述不能为空");
        }
        
        return new ValidationResult(errors.isEmpty(), errors, warnings);
    }
    
    /**
     * 增强验证：对技能进行全面的验证
     * 参考 Claude 官方的 quick_validate.py
     * 
     * @param skill 技能定义
     * @return 增强验证结果
     */
    public SkillEnhancedValidationResultDTO validateEnhanced(SkillDefinition skill) {
        SkillEnhancedValidationResultDTO.ValidationSection basicValidation = validateBasic(skill);
        SkillEnhancedValidationResultDTO.ValidationSection structureValidation = validateStructure(skill);
        SkillEnhancedValidationResultDTO.ValidationSection qualityValidation = validateQuality(skill);
        SkillEnhancedValidationResultDTO.ValidationSection progressiveDisclosureValidation = validateProgressiveDisclosure(skill);
        
        // 汇总所有错误和警告
        List<String> allErrors = new ArrayList<>();
        List<String> allWarnings = new ArrayList<>();
        
        allErrors.addAll(basicValidation.getErrors());
        allErrors.addAll(structureValidation.getErrors());
        allErrors.addAll(qualityValidation.getErrors());
        allErrors.addAll(progressiveDisclosureValidation.getErrors());
        
        allWarnings.addAll(basicValidation.getWarnings());
        allWarnings.addAll(structureValidation.getWarnings());
        allWarnings.addAll(qualityValidation.getWarnings());
        allWarnings.addAll(progressiveDisclosureValidation.getWarnings());
        
        boolean valid = allErrors.isEmpty();
        
        return SkillEnhancedValidationResultDTO.builder()
            .valid(valid)
            .basicValidation(basicValidation)
            .structureValidation(structureValidation)
            .qualityValidation(qualityValidation)
            .progressiveDisclosureValidation(progressiveDisclosureValidation)
            .allErrors(allErrors)
            .allWarnings(allWarnings)
            .build();
    }
    
    /**
     * 基础验证：YAML frontmatter、命名规范、描述格式
     */
    private SkillEnhancedValidationResultDTO.ValidationSection validateBasic(SkillDefinition skill) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // 验证技能ID
        ValidationResult skillIdResult = validateSkillId(skill.getSkillId());
        errors.addAll(skillIdResult.getErrors());
        warnings.addAll(skillIdResult.getWarnings());
        
        // 验证描述
        ValidationResult descResult = validateDescription(skill.getDescription());
        errors.addAll(descResult.getErrors());
        warnings.addAll(descResult.getWarnings());
        
        // 验证 YAML frontmatter（如果 skillContent 存在）
        if (skill.getSkillContent() != null && !skill.getSkillContent().trim().isEmpty()) {
            validateYamlFrontmatter(skill.getSkillContent(), errors, warnings);
        }
        
        return SkillEnhancedValidationResultDTO.ValidationSection.builder()
            .passed(errors.isEmpty())
            .errors(errors)
            .warnings(warnings)
            .build();
    }
    
    /**
     * 结构验证：目录结构、资源引用
     */
    private SkillEnhancedValidationResultDTO.ValidationSection validateStructure(SkillDefinition skill) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // 验证 skillContent 存在（相当于 SKILL.md）
        if (skill.getSkillContent() == null || skill.getSkillContent().trim().isEmpty()) {
            warnings.add("技能缺少 skillContent（SKILL.md 内容），建议添加完整的技能内容");
        }
        
        // 验证资源引用（检查 skillContent 中引用的资源是否存在）
        if (skill.getSkillContent() != null && !skill.getSkillContent().trim().isEmpty()) {
            validateResourceReferences(skill.getSkillId(), skill.getSkillContent(), errors, warnings);
        }
        
        return SkillEnhancedValidationResultDTO.ValidationSection.builder()
            .passed(errors.isEmpty())
            .errors(errors)
            .warnings(warnings)
            .build();
    }
    
    /**
     * 质量验证：描述质量、内容质量
     */
    private SkillEnhancedValidationResultDTO.ValidationSection validateQuality(SkillDefinition skill) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // 描述质量检查
        if (skill.getDescription() != null) {
            String desc = skill.getDescription().trim();
            if (desc.length() < 50) {
                warnings.add("技能描述过短（" + desc.length() + "字符），建议至少50字符，包含详细的功能说明和使用场景");
            }
            if (!desc.contains("功能") && !desc.contains("用途") && !desc.contains("用于")) {
                warnings.add("技能描述建议包含功能说明或使用场景");
            }
        }
        
        // 检查描述中是否包含禁止字符
        if (skill.getDescription() != null) {
            if (skill.getDescription().contains("<") || skill.getDescription().contains(">")) {
                errors.add("技能描述不能包含尖括号（< 或 >）");
            }
        }
        
        return SkillEnhancedValidationResultDTO.ValidationSection.builder()
            .passed(errors.isEmpty())
            .errors(errors)
            .warnings(warnings)
            .build();
    }
    
    /**
     * 渐进式披露验证：SKILL.md 长度、资源组织
     */
    private SkillEnhancedValidationResultDTO.ValidationSection validateProgressiveDisclosure(SkillDefinition skill) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        // 验证 SKILL.md body 长度（建议 < 500 行）
        if (skill.getSkillContent() != null && !skill.getSkillContent().trim().isEmpty()) {
            String[] lines = skill.getSkillContent().split("\n");
            int bodyStartIndex = 0;
            
            // 找到 YAML frontmatter 结束位置
            if (skill.getSkillContent().startsWith("---")) {
                int secondDashIndex = skill.getSkillContent().indexOf("\n---", 3);
                if (secondDashIndex > 0) {
                    bodyStartIndex = secondDashIndex + 4;
                }
            }
            
            int bodyLineCount = lines.length - (bodyStartIndex > 0 ? 
                skill.getSkillContent().substring(0, bodyStartIndex).split("\n").length : 0);
            
            if (bodyLineCount > 500) {
                warnings.add("SKILL.md body 长度过长（" + bodyLineCount + " 行），建议 < 500 行，以符合渐进式披露原则");
            }
        }
        
        // 验证资源组织（检查资源是否按类型正确分类）
        String sid = skill.getSkillId();
        if (sid != null && !sid.isEmpty()) {
            long scriptCount = resourceRepository.countBySkillIdAndResourceType(sid, "SCRIPT");
            long referenceCount = resourceRepository.countBySkillIdAndResourceType(sid, "REFERENCE");
            long assetCount = resourceRepository.countBySkillIdAndResourceType(sid, "ASSET");
        
            if (scriptCount > 0 || referenceCount > 0 || assetCount > 0) {
                log.debug("技能资源统计: skillId={}, scripts={}, references={}, assets={}", 
                    sid, scriptCount, referenceCount, assetCount);
            }
        }
        
        return SkillEnhancedValidationResultDTO.ValidationSection.builder()
            .passed(errors.isEmpty())
            .errors(errors)
            .warnings(warnings)
            .build();
    }
    
    /**
     * 验证 YAML frontmatter 格式
     */
    private void validateYamlFrontmatter(String skillContent, List<String> errors, List<String> warnings) {
        if (!skillContent.startsWith("---")) {
            errors.add("SKILL.md 必须以 YAML frontmatter 开头（---）");
            return;
        }
        
        // 提取 YAML frontmatter
        Pattern frontmatterPattern = Pattern.compile("^---\\s*\\n(.*?)\\n---\\s*\\n", Pattern.DOTALL);
        java.util.regex.Matcher matcher = frontmatterPattern.matcher(skillContent);
        
        if (!matcher.find()) {
            errors.add("YAML frontmatter 格式不正确，应包含开始和结束标记（---）");
            return;
        }
        
        String yamlContent = matcher.group(1);
        
        try {
            Object parsed = yaml.load(yamlContent);
            if (!(parsed instanceof Map)) {
                errors.add("YAML frontmatter 必须是字典格式");
                return;
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> frontmatter = (Map<String, Object>) parsed;
            
            // 检查必需字段
            if (!frontmatter.containsKey("name")) {
                errors.add("YAML frontmatter 缺少必需字段: name");
            }
            if (!frontmatter.containsKey("description")) {
                errors.add("YAML frontmatter 缺少必需字段: description");
            }
            
            // 检查允许的字段
            Set<String> allowedProperties = Set.of("name", "description", "license", "allowed-tools", "metadata");
            Set<String> unexpectedKeys = new HashSet<>(frontmatter.keySet());
            unexpectedKeys.removeAll(allowedProperties);
            
            if (!unexpectedKeys.isEmpty()) {
                warnings.add("YAML frontmatter 包含未预期的字段: " + String.join(", ", unexpectedKeys) + 
                    "。允许的字段: " + String.join(", ", allowedProperties));
            }
            
        } catch (Exception e) {
            errors.add("YAML frontmatter 解析失败: " + e.getMessage());
        }
    }
    
    /**
     * 验证资源引用（检查 skillContent 中引用的资源文件是否存在）
     */
    private void validateResourceReferences(String skillId, String skillContent, List<String> errors, List<String> warnings) {
        if (skillId == null || skillContent == null) {
            return;
        }
        // 查找可能的资源引用（scripts/, references/, assets/ 路径）
        Pattern resourcePattern = Pattern.compile("(scripts|references|assets)/[^\\s\\)]+", Pattern.CASE_INSENSITIVE);
        java.util.regex.Matcher matcher = resourcePattern.matcher(skillContent);
        
        Set<String> referencedResources = new HashSet<>();
        while (matcher.find()) {
            referencedResources.add(matcher.group());
        }
        
        if (!referencedResources.isEmpty()) {
            // 检查引用的资源是否存在
            var allResources = resourceRepository.findBySkillId(skillId);
            if (allResources == null) {
                allResources = new ArrayList<>();
            }
            Set<String> existingResources = new HashSet<>();
            
            for (var resource : allResources) {
                String type = resource.getResourceType() != null ? resource.getResourceType().toLowerCase() : "script";
                String name = resource.getFileName() != null ? resource.getFileName() : (resource.getResourceName() != null ? resource.getResourceName() : "");
                existingResources.add(type + "/" + name);
            }
            
            for (String referenced : referencedResources) {
                boolean found = existingResources.stream()
                    .anyMatch(existing -> existing.contains(referenced) || referenced.contains(existing));
                
                if (!found) {
                    warnings.add("技能内容中引用了资源文件 '" + referenced + "'，但该资源不存在");
                }
            }
        }
    }
    
    /**
     * 验证结果类
     */
    public static class ValidationResult {
        private final boolean valid;
        private final List<String> errors;
        private final List<String> warnings;
        
        public ValidationResult(boolean valid, List<String> errors, List<String> warnings) {
            this.valid = valid;
            this.errors = errors != null ? errors : new ArrayList<>();
            this.warnings = warnings != null ? warnings : new ArrayList<>();
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public List<String> getErrors() {
            return errors;
        }
        
        public List<String> getWarnings() {
            return warnings;
        }
    }
}
