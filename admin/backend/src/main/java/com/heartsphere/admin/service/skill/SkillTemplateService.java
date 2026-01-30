package com.heartsphere.admin.service.skill;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 技能模板服务
 * 提供常用技能类型模板，加速创建过程
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class SkillTemplateService {
    
    /**
     * 获取所有模板
     * 
     * @return 模板列表
     */
    public List<SkillTemplate> getAllTemplates() {
        List<SkillTemplate> templates = new ArrayList<>();
        
        // UTILITY 模板
        templates.add(createUtilityTemplate());
        
        // HEALTHCARE 模板
        templates.add(createHealthcareTemplate());
        
        // EDUCATION 模板
        templates.add(createEducationTemplate());
        
        // SOCIAL 模板
        templates.add(createSocialTemplate());
        
        return templates;
    }
    
    /**
     * 根据分类获取模板
     * 
     * @param category 分类
     * @return 模板列表
     */
    public List<SkillTemplate> getTemplatesByCategory(String category) {
        List<SkillTemplate> allTemplates = getAllTemplates();
        return allTemplates.stream()
            .filter(t -> category.equalsIgnoreCase(t.getCategory()))
            .toList();
    }
    
    /**
     * 根据ID获取模板
     * 
     * @param templateId 模板ID
     * @return 模板
     */
    public Optional<SkillTemplate> getTemplateById(String templateId) {
        return getAllTemplates().stream()
            .filter(t -> templateId.equals(t.getId()))
            .findFirst();
    }
    
    /**
     * 应用模板到技能数据
     * 
     * @param template 模板
     * @param skillData 技能数据（会被更新）
     */
    public void applyTemplate(SkillTemplate template, Map<String, Object> skillData) {
        if (template.getMetadata() != null) {
            skillData.putAll(template.getMetadata());
        }
        if (template.getInstruction() != null) {
            skillData.put("instruction", template.getInstruction());
        }
        if (template.getMcpToolConfig() != null) {
            skillData.put("mcpToolConfig", template.getMcpToolConfig());
        }
        if (template.getExecutionConfig() != null) {
            skillData.put("executionConfig", template.getExecutionConfig());
        }
    }
    
    /**
     * 创建 UTILITY 模板
     */
    private SkillTemplate createUtilityTemplate() {
        SkillTemplate template = new SkillTemplate();
        template.setId("utility-basic");
        template.setName("基础工具技能");
        template.setCategory("UTILITY");
        template.setDescription("基础工具类技能模板，适用于通用工具功能");
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("category", "UTILITY");
        metadata.put("skillType", "ACTIVE");
        metadata.put("executionType", "RULE_BASED");
        metadata.put("version", "1.0.0");
        template.setMetadata(metadata);
        
        template.setInstruction("""
            # 工具技能指令
            
            这是一个基础工具技能。请根据用户需求执行相应的工具操作。
            
            ## 使用说明
            1. 理解用户意图
            2. 调用相应的MCP工具
            3. 返回实际执行结果
            
            ## 注意事项
            - 必须返回实际执行结果，不能返回FunctionCall格式
            - 如果MCP工具不可用，使用自然语言描述执行任务
            """);
        
        // MCP工具配置示例
        template.setMcpToolConfig("""
            {
              "mcpConfigId": null,
              "tools": [],
              "parameterMapping": {}
            }
            """);
        
        return template;
    }
    
    /**
     * 创建 HEALTHCARE 模板
     */
    private SkillTemplate createHealthcareTemplate() {
        SkillTemplate template = new SkillTemplate();
        template.setId("healthcare-basic");
        template.setName("健康医疗技能");
        template.setCategory("HEALTHCARE");
        template.setDescription("健康医疗类技能模板，适用于健康评估、医疗咨询等功能");
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("category", "HEALTHCARE");
        metadata.put("skillType", "ACTIVE");
        metadata.put("executionType", "RULE_BASED");
        metadata.put("version", "1.0.0");
        template.setMetadata(metadata);
        
        template.setInstruction("""
            # 健康医疗技能指令
            
            这是一个健康医疗相关技能。请根据用户需求提供专业的健康医疗建议。
            
            ## 使用说明
            1. 收集用户的健康信息
            2. 分析健康状况
            3. 提供专业建议（注意：不能替代专业医疗诊断）
            
            ## 注意事项
            - 必须强调这不是专业医疗诊断
            - 建议严重情况时寻求专业医疗帮助
            - 返回实际的分析结果和建议
            """);
        
        return template;
    }
    
    /**
     * 创建 EDUCATION 模板
     */
    private SkillTemplate createEducationTemplate() {
        SkillTemplate template = new SkillTemplate();
        template.setId("education-basic");
        template.setName("教育学习技能");
        template.setCategory("EDUCATION");
        template.setDescription("教育学习类技能模板，适用于学习辅导、知识问答等功能");
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("category", "EDUCATION");
        metadata.put("skillType", "ACTIVE");
        metadata.put("executionType", "RULE_BASED");
        metadata.put("version", "1.0.0");
        template.setMetadata(metadata);
        
        template.setInstruction("""
            # 教育学习技能指令
            
            这是一个教育学习相关技能。请根据用户需求提供学习辅导和知识解答。
            
            ## 使用说明
            1. 理解用户的学习需求
            2. 提供相应的学习内容或解答
            3. 鼓励用户继续学习
            
            ## 注意事项
            - 提供准确的知识内容
            - 根据用户水平调整讲解方式
            - 返回实际的学习内容
            """);
        
        return template;
    }
    
    /**
     * 创建 SOCIAL 模板
     */
    private SkillTemplate createSocialTemplate() {
        SkillTemplate template = new SkillTemplate();
        template.setId("social-basic");
        template.setName("社交互动技能");
        template.setCategory("SOCIAL");
        template.setDescription("社交互动类技能模板，适用于对话分析、关系管理等功能");
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("category", "SOCIAL");
        metadata.put("skillType", "ACTIVE");
        metadata.put("executionType", "RULE_BASED");
        metadata.put("version", "1.0.0");
        template.setMetadata(metadata);
        
        template.setInstruction("""
            # 社交互动技能指令
            
            这是一个社交互动相关技能。请根据用户需求提供社交建议和互动支持。
            
            ## 使用说明
            1. 理解用户的社交需求
            2. 提供相应的社交建议
            3. 帮助用户改善社交关系
            
            ## 注意事项
            - 尊重用户隐私
            - 提供建设性建议
            - 返回实际的社交分析结果
            """);
        
        return template;
    }
    
    /**
     * 技能模板类
     */
    public static class SkillTemplate {
        private String id;
        private String name;
        private String category;
        private String description;
        private Map<String, Object> metadata;
        private String instruction;
        private String mcpToolConfig;
        private String executionConfig;
        
        // Getters and Setters
        public String getId() {
            return id;
        }
        
        public void setId(String id) {
            this.id = id;
        }
        
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public String getCategory() {
            return category;
        }
        
        public void setCategory(String category) {
            this.category = category;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public Map<String, Object> getMetadata() {
            return metadata;
        }
        
        public void setMetadata(Map<String, Object> metadata) {
            this.metadata = metadata;
        }
        
        public String getInstruction() {
            return instruction;
        }
        
        public void setInstruction(String instruction) {
            this.instruction = instruction;
        }
        
        public String getMcpToolConfig() {
            return mcpToolConfig;
        }
        
        public void setMcpToolConfig(String mcpToolConfig) {
            this.mcpToolConfig = mcpToolConfig;
        }
        
        public String getExecutionConfig() {
            return executionConfig;
        }
        
        public void setExecutionConfig(String executionConfig) {
            this.executionConfig = executionConfig;
        }
    }
}
