package com.heartsphere.admin.service.skill;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.entity.skill.SkillDefinition;
import com.heartsphere.admin.repository.skill.SkillDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 技能迁移服务
 * 负责将现有技能从旧规范迁移到新规范
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillMigrationService {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillContentBuilder skillContentBuilder;
    private final SkillValidationService skillValidationService;
    private final SkillQualityAnalyzer skillQualityAnalyzer;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    /**
     * 分析现有技能，识别需要迁移的技能
     * 
     * @return 迁移分析报告
     */
    @Transactional(readOnly = true)
    public MigrationAnalysis analyzeSkills() {
        log.info("开始分析现有技能...");
        
        List<SkillDefinition> allSkills = skillDefinitionRepository.findAll();
        List<SkillMigrationInfo> migrationList = new ArrayList<>();
        
        for (SkillDefinition skill : allSkills) {
            SkillMigrationInfo info = analyzeSkill(skill);
            if (info.needsMigration()) {
                migrationList.add(info);
            }
        }
        
        log.info("分析完成，发现 {} 个技能需要迁移", migrationList.size());
        
        return new MigrationAnalysis(migrationList, allSkills.size());
    }
    
    /**
     * 分析单个技能
     */
    private SkillMigrationInfo analyzeSkill(SkillDefinition skill) {
        SkillMigrationInfo info = new SkillMigrationInfo();
        info.setSkillId(skill.getSkillId());
        info.setName(skill.getName());
        info.setCurrentSkill(skill);
        
        List<String> missingFields = new ArrayList<>();
        List<String> issues = new ArrayList<>();
        
        // 检查新规范要求的字段
        if (skill.getSkillContent() == null || skill.getSkillContent().isEmpty()) {
            missingFields.add("skill_content");
        }
        
        if (skill.getLicense() == null || skill.getLicense().isEmpty()) {
            missingFields.add("license");
        }
        
        // 检查是否有 function_schema（需要迁移到 mcp_tool_config）
        if (skill.getFunctionSchema() != null && !skill.getFunctionSchema().isEmpty()) {
            info.setHasFunctionSchema(true);
            if (skill.getMcpToolConfig() == null || skill.getMcpToolConfig().isEmpty()) {
                issues.add("存在 function_schema，需要转换为 mcp_tool_config");
            }
        }
        
        // 检查描述质量
        if (skill.getDescription() != null) {
            var qualityResult = skillQualityAnalyzer.analyzeDescription(skill.getDescription());
            if (qualityResult.getScore() < 60) {
                issues.add("描述质量较低，建议优化");
            }
        }
        
        info.setMissingFields(missingFields);
        info.setIssues(issues);
        info.setNeedsMigration(!missingFields.isEmpty() || !issues.isEmpty());
        
        return info;
    }
    
    /**
     * 迁移单个技能
     * 
     * @param skillId 技能ID
     * @return 迁移结果
     */
    @Transactional
    public MigrationResult migrateSkill(String skillId) {
        log.info("开始迁移技能: {}", skillId);
        
        SkillDefinition skill = skillDefinitionRepository.findBySkillId(skillId)
            .orElseThrow(() -> new IllegalArgumentException("技能不存在: " + skillId));
        
        try {
            // 1. 生成 skill_content
            if (skill.getSkillContent() == null || skill.getSkillContent().isEmpty()) {
                generateSkillContent(skill);
            }
            
            // 2. 补充元数据
            enrichMetadata(skill);
            
            // 3. 转换 function_schema 到 mcp_tool_config（如果适用）
            convertFunctionSchema(skill);
            
            // 4. 优化描述
            optimizeDescription(skill);
            
            // 5. 保存
            skillDefinitionRepository.save(skill);
            
            // 6. 验证
            var validationResult = validateMigratedSkill(skill);
            
            log.info("技能迁移完成: {}", skillId);
            
            return new MigrationResult(true, skillId, "迁移成功", validationResult);
            
        } catch (Exception e) {
            log.error("技能迁移失败: {}", skillId, e);
            return new MigrationResult(false, skillId, "迁移失败: " + e.getMessage(), null);
        }
    }
    
    /**
     * 批量迁移技能
     * 
     * @param skillIds 技能ID列表
     * @return 迁移结果列表
     */
    @Transactional
    public List<MigrationResult> migrateSkills(List<String> skillIds) {
        log.info("开始批量迁移技能，数量: {}", skillIds.size());
        
        List<MigrationResult> results = new ArrayList<>();
        
        for (String skillId : skillIds) {
            try {
                MigrationResult result = migrateSkill(skillId);
                results.add(result);
            } catch (Exception e) {
                log.error("迁移技能失败: {}", skillId, e);
                results.add(new MigrationResult(false, skillId, "迁移失败: " + e.getMessage(), null));
            }
        }
        
        log.info("批量迁移完成，成功: {}, 失败: {}", 
            results.stream().filter(MigrationResult::isSuccess).count(),
            results.stream().filter(r -> !r.isSuccess()).count());
        
        return results;
    }
    
    /**
     * 生成 skill_content
     * 优先从 skill_instructions 表获取指令，如果没有则使用 description
     */
    private void generateSkillContent(SkillDefinition skill) {
        Map<String, Object> skillData = new HashMap<>();
        
        // 尝试从 skill_instructions 表获取指令
        // 注意：这里需要访问 skill_instructions 表，但为了保持服务独立性，
        // 我们简化处理，使用 description 作为指令基础
        // 如果后续需要，可以注入 SkillInstructionRepository
        
        String instruction = skill.getDescription() != null ? skill.getDescription() : "";
        
        // 如果 description 很短，尝试生成更详细的指令
        if (instruction.length() < 50) {
            instruction = generateInstructionFromSkill(skill);
        }
        
        skillData.put("instruction", instruction);
        
        String skillContent = skillContentBuilder.buildSkillContent(skill, skillData);
        skill.setSkillContent(skillContent);
        
        log.debug("为技能 {} 生成 skill_content", skill.getSkillId());
    }
    
    /**
     * 从技能信息生成指令
     */
    private String generateInstructionFromSkill(SkillDefinition skill) {
        StringBuilder instruction = new StringBuilder();
        
        instruction.append("## 技能说明\n\n");
        instruction.append("这是一个").append(skill.getName()).append("技能。\n\n");
        
        if (skill.getDescription() != null && !skill.getDescription().isEmpty()) {
            instruction.append("### 功能描述\n\n");
            instruction.append(skill.getDescription()).append("\n\n");
        }
        
        instruction.append("### 使用方法\n\n");
        instruction.append("1. 用户可以通过自然语言描述需求\n");
        instruction.append("2. AI会根据需求执行相应的操作\n");
        instruction.append("3. 返回执行结果给用户\n\n");
        
        // 如果有 function_schema，说明需要参数
        if (skill.getFunctionSchema() != null && !skill.getFunctionSchema().isEmpty()) {
            instruction.append("### 参数说明\n\n");
            instruction.append("此技能需要结构化参数。如果MCP工具不可用，可以通过自然语言描述参数，AI会理解并执行。\n\n");
        }
        
        instruction.append("### 返回格式\n\n");
        instruction.append("技能应返回实际的执行结果，而不是工具调用标记。结果应该是用户可以直接使用的信息。\n");
        
        return instruction.toString();
    }
    
    /**
     * 补充元数据
     */
    private void enrichMetadata(SkillDefinition skill) {
        // 补充版本号
        if (skill.getVersion() == null || skill.getVersion().isEmpty()) {
            skill.setVersion("1.0.0");
        }
        
        // 补充许可证（默认值）
        if (skill.getLicense() == null || skill.getLicense().isEmpty()) {
            skill.setLicense("MIT");
        }
        
        log.debug("为技能 {} 补充元数据", skill.getSkillId());
    }
    
    /**
     * 转换 function_schema 到 mcp_tool_config
     * 
     * 注意：function_schema 和 mcp_tool_config 的用途不同：
     * - function_schema: 定义技能的输入参数（JSON Schema格式）
     * - mcp_tool_config: 定义技能使用的MCP工具配置
     * 
     * 如果技能需要结构化参数但不使用MCP工具，应保留 function_schema，
     * 并在 skill_content 中使用描述方式说明如何使用技能。
     */
    private void convertFunctionSchema(SkillDefinition skill) {
        if (skill.getFunctionSchema() == null || skill.getFunctionSchema().isEmpty()) {
            return;
        }
        
        // 如果已经有 mcp_tool_config，跳过
        if (skill.getMcpToolConfig() != null && !skill.getMcpToolConfig().isEmpty()) {
            return;
        }
        
        try {
            // 解析 function_schema
            com.fasterxml.jackson.databind.JsonNode schemaNode = objectMapper.readTree(skill.getFunctionSchema());
            
            // 分析 function_schema 的内容
            // 如果 schema 很简单（只有基本参数），可能不需要MCP工具
            // 如果 schema 很复杂（涉及外部数据），可能需要MCP工具
            
            boolean needsMcpTool = analyzeIfNeedsMcpTool(schemaNode, skill);
            
            if (needsMcpTool) {
                // 尝试查找匹配的MCP工具
                // 这里简化处理，实际应该：
                // 1. 根据 schema 的参数类型和描述，查找匹配的MCP工具
                // 2. 如果找到，创建 mcp_tool_config
                // 3. 如果找不到，保留 function_schema，标记为需要手动处理
                
                log.info("技能 {} 的 function_schema 可能需要MCP工具，但无法自动匹配，保留 function_schema", 
                    skill.getSkillId());
                
                // 在 skill_content 中添加说明，建议使用描述方式
                addMcpToolNoteToSkillContent(skill);
            } else {
                // 不需要MCP工具，保留 function_schema
                // 在 skill_content 中说明参数结构
                log.debug("技能 {} 的 function_schema 不需要MCP工具，保留 function_schema", 
                    skill.getSkillId());
            }
            
        } catch (Exception e) {
            log.error("转换 function_schema 失败: {}", skill.getSkillId(), e);
            // 转换失败时，保留 function_schema
        }
    }
    
    /**
     * 分析是否需要MCP工具
     * 
     * 启发式判断：
     * - 如果参数涉及外部数据（如文件、API、数据库），可能需要MCP工具
     * - 如果参数很简单（如字符串、数字），可能不需要MCP工具
     */
    private boolean analyzeIfNeedsMcpTool(com.fasterxml.jackson.databind.JsonNode schemaNode, SkillDefinition skill) {
        // 检查参数描述中是否包含MCP相关关键词
        String description = skill.getDescription() != null ? skill.getDescription().toLowerCase() : "";
        String[] mcpKeywords = {"api", "database", "file", "web", "http", "查询", "搜索", "获取", "调用"};
        
        for (String keyword : mcpKeywords) {
            if (description.contains(keyword)) {
                return true;
            }
        }
        
        // 检查 schema 的复杂度
        if (schemaNode.has("properties")) {
            com.fasterxml.jackson.databind.JsonNode properties = schemaNode.get("properties");
            int propertyCount = properties.size();
            
            // 如果参数很多或很复杂，可能需要MCP工具
            if (propertyCount > 5) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 在 skill_content 中添加MCP工具说明
     */
    private void addMcpToolNoteToSkillContent(SkillDefinition skill) {
        String skillContent = skill.getSkillContent();
        if (skillContent == null) {
            skillContent = "";
        }
        
        // 如果 skill_content 中还没有MCP工具说明，添加说明
        if (!skillContent.contains("MCP工具") && !skillContent.contains("mcp tool")) {
            String note = "\n\n## 注意\n\n" +
                "此技能当前使用 function_schema 定义参数结构。\n" +
                "如果MCP工具不可用，可以通过自然语言描述的方式使用此技能，AI会根据描述执行相应操作。\n";
            
            skill.setSkillContent(skillContent + note);
        }
    }
    
    /**
     * 优化描述
     * 如果描述质量较低，尝试自动优化
     */
    private void optimizeDescription(SkillDefinition skill) {
        if (skill.getDescription() == null || skill.getDescription().isEmpty()) {
            // 如果描述为空，尝试从名称生成基础描述
            if (skill.getName() != null && !skill.getName().isEmpty()) {
                skill.setDescription("这是一个" + skill.getName() + "技能，用于帮助用户完成相关任务。");
                log.info("为技能 {} 生成基础描述", skill.getSkillId());
            }
            return;
        }
        
        // 使用质量分析器分析描述
        var qualityResult = skillQualityAnalyzer.analyzeDescription(skill.getDescription());
        
        // 如果质量评分较低，尝试优化
        if (qualityResult.getScore() < 60) {
            log.info("技能 {} 的描述质量较低（{}分），尝试优化", 
                skill.getSkillId(), qualityResult.getScore());
            
            String optimizedDescription = tryOptimizeDescription(skill.getDescription(), qualityResult, skill);
            if (optimizedDescription != null && !optimizedDescription.equals(skill.getDescription())) {
                skill.setDescription(optimizedDescription);
                log.info("技能 {} 的描述已优化", skill.getSkillId());
            }
        }
    }
    
    /**
     * 尝试优化描述内容
     */
    private String tryOptimizeDescription(String originalDescription, 
                                          SkillQualityAnalyzer.QualityReport qualityReport,
                                          SkillDefinition skill) {
        String description = originalDescription;
        
        // 如果描述过短，添加功能说明
        if (description.length() < 20) {
            description = description + "。此技能可以帮助用户完成相关任务。";
        }
        
        // 如果缺少功能关键词，尝试添加
        boolean hasFunctionKeywords = description.contains("功能") || 
                                     description.contains("使用") || 
                                     description.contains("执行") ||
                                     description.contains("提供") ||
                                     description.contains("帮助");
        
        if (!hasFunctionKeywords && description.length() < 100) {
            description = "此技能的功能是：" + description;
        }
        
        // 如果缺少场景关键词，尝试添加
        boolean hasScenarioKeywords = description.contains("适用于") || 
                                      description.contains("当") || 
                                      description.contains("用于") ||
                                      description.contains("场景");
        
        if (!hasScenarioKeywords && description.length() < 150) {
            String skillName = skill.getName() != null ? skill.getName() : "相关";
            description = description + "。适用于需要" + skillName + "的场景。";
        }
        
        // 确保描述以句号结尾
        if (!description.endsWith("。") && !description.endsWith(".")) {
            description = description + "。";
        }
        
        return description;
    }
    
    /**
     * 验证迁移后的技能
     */
    private SkillValidationService.ValidationResult validateMigratedSkill(SkillDefinition skill) {
        var idResult = skillValidationService.validateSkillId(skill.getSkillId());
        var descResult = skillValidationService.validateDescription(skill.getDescription());
        
        // 合并验证结果
        List<String> allErrors = new ArrayList<>();
        List<String> allWarnings = new ArrayList<>();
        
        allErrors.addAll(idResult.getErrors());
        allErrors.addAll(descResult.getErrors());
        allWarnings.addAll(idResult.getWarnings());
        allWarnings.addAll(descResult.getWarnings());
        
        return new SkillValidationService.ValidationResult(
            allErrors.isEmpty(), allErrors, allWarnings
        );
    }
    
    /**
     * 迁移分析信息
     */
    public static class MigrationAnalysis {
        private final List<SkillMigrationInfo> skillsToMigrate;
        private final int totalSkills;
        
        public MigrationAnalysis(List<SkillMigrationInfo> skillsToMigrate, int totalSkills) {
            this.skillsToMigrate = skillsToMigrate;
            this.totalSkills = totalSkills;
        }
        
        public List<SkillMigrationInfo> getSkillsToMigrate() {
            return skillsToMigrate;
        }
        
        public int getTotalSkills() {
            return totalSkills;
        }
        
        public int getMigrationCount() {
            return skillsToMigrate.size();
        }
    }
    
    /**
     * 技能迁移信息
     */
    public static class SkillMigrationInfo {
        private String skillId;
        private String name;
        private SkillDefinition currentSkill;
        private List<String> missingFields = new ArrayList<>();
        private List<String> issues = new ArrayList<>();
        private boolean hasFunctionSchema;
        private boolean needsMigration;
        
        // Getters and Setters
        public String getSkillId() { return skillId; }
        public void setSkillId(String skillId) { this.skillId = skillId; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public SkillDefinition getCurrentSkill() { return currentSkill; }
        public void setCurrentSkill(SkillDefinition currentSkill) { this.currentSkill = currentSkill; }
        
        public List<String> getMissingFields() { return missingFields; }
        public void setMissingFields(List<String> missingFields) { this.missingFields = missingFields; }
        
        public List<String> getIssues() { return issues; }
        public void setIssues(List<String> issues) { this.issues = issues; }
        
        public boolean isHasFunctionSchema() { return hasFunctionSchema; }
        public void setHasFunctionSchema(boolean hasFunctionSchema) { this.hasFunctionSchema = hasFunctionSchema; }
        
        public boolean needsMigration() { return needsMigration; }
        public void setNeedsMigration(boolean needsMigration) { this.needsMigration = needsMigration; }
    }
    
    /**
     * 迁移结果
     */
    public static class MigrationResult {
        private final boolean success;
        private final String skillId;
        private final String message;
        private final SkillValidationService.ValidationResult validationResult;
        
        public MigrationResult(boolean success, String skillId, String message, 
                              SkillValidationService.ValidationResult validationResult) {
            this.success = success;
            this.skillId = skillId;
            this.message = message;
            this.validationResult = validationResult;
        }
        
        public boolean isSuccess() { return success; }
        public String getSkillId() { return skillId; }
        public String getMessage() { return message; }
        public SkillValidationService.ValidationResult getValidationResult() { return validationResult; }
    }
}
