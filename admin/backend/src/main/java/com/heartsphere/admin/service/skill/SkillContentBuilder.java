package com.heartsphere.admin.service.skill;

import com.heartsphere.admin.entity.skill.SkillDefinition;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * 技能内容构建器
 * 从表单数据生成 SKILL.md 格式内容（YAML元数据 + Markdown指令）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Service
public class SkillContentBuilder {
    
    /**
     * 构建SKILL.md格式内容
     * 
     * @param skill 技能实体
     * @param skillData 技能数据（包含指令等）
     * @return SKILL.md格式内容
     */
    public String buildSkillContent(SkillDefinition skill, Map<String, Object> skillData) {
        StringBuilder content = new StringBuilder();
        
        // YAML前置元数据
        content.append("---\n");
        content.append("name: ").append(escapeYaml(skill.getName())).append("\n");
        content.append("description: ").append(escapeYaml(skill.getDescription())).append("\n");
        
        if (skill.getLicense() != null && !skill.getLicense().isEmpty()) {
            content.append("license: ").append(escapeYaml(skill.getLicense())).append("\n");
        }
        
        if (skill.getVersion() != null && !skill.getVersion().isEmpty()) {
            content.append("version: ").append(escapeYaml(skill.getVersion())).append("\n");
        }
        
        if (skill.getAuthor() != null && !skill.getAuthor().isEmpty()) {
            content.append("author: ").append(escapeYaml(skill.getAuthor())).append("\n");
        }
        
        if (skill.getCategory() != null && !skill.getCategory().isEmpty()) {
            content.append("category: ").append(escapeYaml(skill.getCategory())).append("\n");
        }
        
        if (skill.getCompatibility() != null && !skill.getCompatibility().isEmpty()) {
            content.append("compatibility: ").append(escapeYaml(skill.getCompatibility())).append("\n");
        }
        
        if (skill.getMetadata() != null && !skill.getMetadata().isEmpty()) {
            content.append("metadata: ").append(escapeYaml(skill.getMetadata())).append("\n");
        }
        
        content.append("---\n\n");
        
        // Markdown指令内容
        String instruction = (String) skillData.get("instruction");
        if (instruction != null && !instruction.trim().isEmpty()) {
            content.append(instruction).append("\n");
        } else if (skill.getDescription() != null) {
            // 如果没有指令，使用描述作为基础
            content.append(skill.getDescription()).append("\n");
        }
        
        // MCP工具配置说明
        if (skill.getMcpToolConfig() != null && !skill.getMcpToolConfig().isEmpty()) {
            content.append("\n## MCP Tools\n\n");
            content.append("This skill uses the following MCP tools:\n\n");
            content.append("```json\n");
            content.append(skill.getMcpToolConfig()).append("\n");
            content.append("```\n");
        }
        
        return content.toString();
    }
    
    /**
     * 转义YAML字符串
     */
    private String escapeYaml(String value) {
        if (value == null) {
            return "";
        }
        // 如果包含特殊字符，使用引号包裹
        if (value.contains(":") || value.contains("\n") || value.contains("'") || value.contains("\"")) {
            return "\"" + value.replace("\"", "\\\"") + "\"";
        }
        return value;
    }
}
