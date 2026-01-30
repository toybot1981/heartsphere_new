package com.heartsphere.admin.service.skill;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.yaml.snakeyaml.Yaml;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 技能文件解析服务
 * 解析 skill.md 文件（YAML front matter + Markdown 指令）
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SkillFileParserService {
    
    private final ObjectMapper objectMapper;
    private final Yaml yaml = new Yaml();
    
    // YAML front matter 分隔符模式
    private static final Pattern YAML_FRONT_MATTER_PATTERN = 
        Pattern.compile("^---\\s*\\n(.*?)\\n---\\s*\\n(.*)$", Pattern.DOTALL);
    
    /**
     * 从文件内容解析技能定义
     * 
     * @param content 文件内容（skill.md 格式）
     * @return 解析后的技能定义（Map格式）
     */
    public Map<String, Object> parseSkillFromContent(String content) {
        try {
            log.info("开始解析技能文件内容");
            
            // 分离 YAML front matter 和 Markdown 内容
            ParsedContent parsed = parseContent(content);
            
            // 解析 YAML front matter
            Map<String, Object> yamlData = parseYamlFrontMatter(parsed.yamlPart);
            
            // 提取 Markdown 指令
            String instruction = parsed.markdownPart.trim();
            
            // 映射字段
            Map<String, Object> skillDefinition = mapFields(yamlData, instruction);
            
            log.info("解析技能文件成功: skillId={}", skillDefinition.get("skillId"));
            
            return skillDefinition;
            
        } catch (Exception e) {
            log.error("解析技能文件失败", e);
            throw new RuntimeException("解析技能文件失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 分离 YAML front matter 和 Markdown 内容
     */
    private ParsedContent parseContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new IllegalArgumentException("文件内容为空");
        }
        
        Matcher matcher = YAML_FRONT_MATTER_PATTERN.matcher(content);
        
        if (matcher.matches()) {
            String yamlPart = matcher.group(1);
            String markdownPart = matcher.group(2);
            return new ParsedContent(yamlPart, markdownPart);
        } else {
            // 没有 YAML front matter，整个内容作为 Markdown 指令
            log.warn("文件没有 YAML front matter，整个内容将作为指令");
            return new ParsedContent("", content);
        }
    }
    
    /**
     * 解析 YAML front matter
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> parseYamlFrontMatter(String yamlContent) {
        if (yamlContent == null || yamlContent.trim().isEmpty()) {
            return new HashMap<>();
        }
        
        try {
            Object parsed = yaml.load(yamlContent);
            if (parsed instanceof Map) {
                return (Map<String, Object>) parsed;
            } else {
                log.warn("YAML front matter 解析结果不是 Map 类型");
                return new HashMap<>();
            }
        } catch (Exception e) {
            log.error("解析 YAML front matter 失败", e);
            throw new RuntimeException("解析 YAML front matter 失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 映射字段（YAML -> 技能定义字段）
     */
    private Map<String, Object> mapFields(Map<String, Object> yamlData, String instruction) {
        Map<String, Object> skillDefinition = new HashMap<>();
        
        // 基础字段映射
        skillDefinition.put("skillId", yamlData.getOrDefault("skill_id", yamlData.get("skillId")));
        skillDefinition.put("name", yamlData.getOrDefault("name", ""));
        skillDefinition.put("description", yamlData.getOrDefault("description", ""));
        skillDefinition.put("category", yamlData.getOrDefault("category", "UTILITY"));
        skillDefinition.put("skillType", convertSkillType(yamlData.get("skill_type"), yamlData.get("skillType")));
        skillDefinition.put("executionType", convertExecutionType(yamlData.get("execution_type"), yamlData.get("executionType")));
        skillDefinition.put("license", yamlData.getOrDefault("license", "MIT"));
        skillDefinition.put("version", yamlData.getOrDefault("version", "1.0.0"));
        skillDefinition.put("author", yamlData.getOrDefault("author", ""));
        
        // 复杂字段
        if (yamlData.containsKey("mcp_tool_config") || yamlData.containsKey("mcpToolConfig")) {
            Object mcpConfig = yamlData.getOrDefault("mcp_tool_config", yamlData.get("mcpToolConfig"));
            if (mcpConfig != null) {
                try {
                    skillDefinition.put("mcpToolConfig", 
                        mcpConfig instanceof String ? mcpConfig : objectMapper.writeValueAsString(mcpConfig));
                } catch (Exception e) {
                    log.warn("转换 mcpToolConfig 失败", e);
                }
            }
        }
        
        if (yamlData.containsKey("execution_config") || yamlData.containsKey("executionConfig")) {
            Object execConfig = yamlData.getOrDefault("execution_config", yamlData.get("executionConfig"));
            if (execConfig != null) {
                try {
                    skillDefinition.put("executionConfig", 
                        execConfig instanceof String ? execConfig : objectMapper.writeValueAsString(execConfig));
                } catch (Exception e) {
                    log.warn("转换 executionConfig 失败", e);
                }
            }
        }
        
        // 指令内容
        skillDefinition.put("instruction", instruction);
        
        // 其他元数据
        if (yamlData.containsKey("compatibility")) {
            Object compatibility = yamlData.get("compatibility");
            try {
                skillDefinition.put("compatibility", 
                    compatibility instanceof String ? compatibility : objectMapper.writeValueAsString(compatibility));
            } catch (Exception e) {
                log.warn("转换 compatibility 失败", e);
            }
        }
        
        if (yamlData.containsKey("metadata")) {
            Object metadata = yamlData.get("metadata");
            try {
                skillDefinition.put("metadata", 
                    metadata instanceof String ? metadata : objectMapper.writeValueAsString(metadata));
            } catch (Exception e) {
                log.warn("转换 metadata 失败", e);
            }
        }
        
        return skillDefinition;
    }
    
    /**
     * 转换技能类型
     */
    private String convertSkillType(Object skillType, Object skillTypeAlt) {
        if (skillType != null) {
            return skillType.toString().toUpperCase();
        }
        if (skillTypeAlt != null) {
            return skillTypeAlt.toString().toUpperCase();
        }
        return "ACTIVE";
    }
    
    /**
     * 转换执行类型
     */
    private String convertExecutionType(Object executionType, Object executionTypeAlt) {
        if (executionType != null) {
            return executionType.toString().toUpperCase();
        }
        if (executionTypeAlt != null) {
            return executionTypeAlt.toString().toUpperCase();
        }
        return "PROMPT_DRIVEN";
    }
    
    /**
     * 解析后的内容
     */
    private static class ParsedContent {
        final String yamlPart;
        final String markdownPart;
        
        ParsedContent(String yamlPart, String markdownPart) {
            this.yamlPart = yamlPart;
            this.markdownPart = markdownPart;
        }
    }
}
