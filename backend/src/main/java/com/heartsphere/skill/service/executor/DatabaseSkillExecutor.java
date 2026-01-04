package com.heartsphere.skill.service.executor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 数据库技能执行器
 * 
 * 执行数据库操作类型的技能
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class DatabaseSkillExecutor implements SkillExecutor.SkillExecutionHandler {
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public DatabaseSkillExecutor(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 从 execution_config 中获取 SQL 配置
            Map<String, Object> config = parseExecutionConfig(skill.getExecutionConfig());
            
            String sql = (String) config.get("sql");
            if (sql == null || sql.isEmpty()) {
                throw new IllegalArgumentException("SQL 未配置");
            }
            
            // 替换 SQL 中的占位符
            sql = replacePlaceholders(sql, parameters);
            
            // 执行 SQL
            String operation = (String) config.getOrDefault("operation", "SELECT");
            
            switch (operation.toUpperCase()) {
                case "SELECT":
                    return executeSelect(sql, parameters);
                case "INSERT":
                case "UPDATE":
                case "DELETE":
                    return executeUpdate(sql, parameters);
                default:
                    throw new IllegalArgumentException("不支持的数据库操作: " + operation);
            }
            
        } catch (Exception e) {
            log.error("执行数据库技能失败: skillId={}", skill.getSkillId(), e);
            throw new RuntimeException("数据库操作失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 执行 SELECT 查询
     */
    private Object executeSelect(String sql, Map<String, Object> parameters) {
        List<Map<String, Object>> results = jdbcTemplate.queryForList(sql);
        return results;
    }
    
    /**
     * 执行 UPDATE/INSERT/DELETE
     */
    private Object executeUpdate(String sql, Map<String, Object> parameters) {
        int affectedRows = jdbcTemplate.update(sql);
        Map<String, Object> result = new HashMap<>();
        result.put("affectedRows", affectedRows);
        result.put("success", true);
        return result;
    }
    
    /**
     * 替换 SQL 占位符
     */
    private String replacePlaceholders(String sql, Map<String, Object> parameters) {
        String result = sql;
        
        // 替换参数占位符 ${paramName}
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            String placeholder = "${" + entry.getKey() + "}";
            String value = String.valueOf(entry.getValue());
            // SQL 注入防护：对字符串值进行转义
            if (entry.getValue() instanceof String) {
                value = "'" + value.replace("'", "''") + "'";
            }
            result = result.replace(placeholder, value);
        }
        
        return result;
    }
    
    /**
     * 解析执行配置
     */
    private Map<String, Object> parseExecutionConfig(String configJson) {
        try {
            return objectMapper.readValue(configJson, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("解析执行配置失败", e);
            throw new IllegalArgumentException("无效的执行配置: " + e.getMessage());
        }
    }
}
