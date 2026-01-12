package com.heartsphere.skill.service.executor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * 脚本技能执行器
 * 
 * 执行 JavaScript/Python 脚本类型的技能
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
public class ScriptSkillExecutor implements SkillExecutor.SkillExecutionHandler {
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public Object execute(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 从 execution_config 中获取脚本路径
            String scriptPath = extractScriptPath(skill.getExecutionConfig());
            if (scriptPath == null) {
                throw new IllegalArgumentException("脚本路径未配置");
            }
            
            // 检查文件是否存在
            File scriptFile = new File(scriptPath);
            if (!scriptFile.exists()) {
                throw new IllegalArgumentException("脚本文件不存在: " + scriptPath);
            }
            
            // 根据脚本类型选择执行方式
            String scriptType = extractScriptType(skill.getExecutionConfig());
            
            if ("nodejs".equalsIgnoreCase(scriptType) || scriptPath.endsWith(".js")) {
                return executeNodeJsScript(scriptPath, parameters, context);
            } else if ("python".equalsIgnoreCase(scriptType) || scriptPath.endsWith(".py")) {
                return executePythonScript(scriptPath, parameters, context);
            } else {
                throw new IllegalArgumentException("不支持的脚本类型: " + scriptType);
            }
            
        } catch (Exception e) {
            log.error("执行脚本技能失败: skillId={}", skill.getSkillId(), e);
            throw new RuntimeException("脚本执行失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 执行 Node.js 脚本
     */
    private Object executeNodeJsScript(
        String scriptPath,
        Map<String, Object> parameters,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 读取脚本内容（用于验证文件存在）
            Files.readAllBytes(Paths.get(scriptPath));
            
            // 使用 GraalVM JavaScript 引擎执行（如果可用）
            // 或者通过 ProcessBuilder 调用 node 命令
            // 这里简化实现，实际应该使用合适的脚本执行引擎
            
            // 临时方案：返回模拟结果
            log.warn("Node.js 脚本执行暂未实现，返回模拟结果: scriptPath={}", scriptPath);
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("scriptPath", scriptPath);
            result.put("parameters", parameters);
            result.put("message", "脚本执行成功（模拟）");
            result.put("note", "需要实现实际的脚本执行引擎");
            
            return result;
            
        } catch (Exception e) {
            log.error("执行 Node.js 脚本失败", e);
            throw new RuntimeException("Node.js 脚本执行失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 执行 Python 脚本
     */
    private Object executePythonScript(
        String scriptPath,
        Map<String, Object> parameters,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 通过 ProcessBuilder 调用 python 命令
            // 这里简化实现
            
            log.warn("Python 脚本执行暂未实现，返回模拟结果: scriptPath={}", scriptPath);
            
            Map<String, Object> result = new java.util.HashMap<>();
            result.put("scriptPath", scriptPath);
            result.put("parameters", parameters);
            result.put("message", "脚本执行成功（模拟）");
            result.put("note", "需要实现实际的脚本执行引擎");
            
            return result;
            
        } catch (Exception e) {
            log.error("执行 Python 脚本失败", e);
            throw new RuntimeException("Python 脚本执行失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 从执行配置中提取脚本路径
     */
    private String extractScriptPath(String executionConfig) {
        if (executionConfig == null || executionConfig.isEmpty()) {
            return null;
        }
        
        try {
            Map<String, Object> config = objectMapper.readValue(
                executionConfig,
                new TypeReference<Map<String, Object>>() {}
            );
            return (String) config.get("scriptPath");
        } catch (Exception e) {
            log.error("解析执行配置失败", e);
            return null;
        }
    }
    
    /**
     * 从执行配置中提取脚本类型
     */
    private String extractScriptType(String executionConfig) {
        if (executionConfig == null || executionConfig.isEmpty()) {
            return "nodejs"; // 默认
        }
        
        try {
            Map<String, Object> config = objectMapper.readValue(
                executionConfig,
                new TypeReference<Map<String, Object>>() {}
            );
            return (String) config.getOrDefault("scriptType", "nodejs");
        } catch (Exception e) {
            log.error("解析执行配置失败", e);
            return "nodejs";
        }
    }
}
