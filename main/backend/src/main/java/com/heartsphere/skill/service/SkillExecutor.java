package com.heartsphere.skill.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillExecution;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.repository.SkillDefinitionRepository;
import com.heartsphere.skill.repository.SkillExecutionRepository;
import com.heartsphere.skill.repository.SkillInstructionRepository;
import com.heartsphere.skill.repository.SkillResourceRepository;
import com.heartsphere.skill.service.executor.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 技能执行器服务
 * 
 * 负责技能的执行逻辑，支持多种执行类型
 * 技能系统独立模块
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
public class SkillExecutor {
    
    private final SkillDefinitionRepository skillDefinitionRepository;
    private final SkillInstructionRepository skillInstructionRepository;
    private final SkillResourceRepository skillResourceRepository;
    private final SkillExecutionRepository skillExecutionRepository;
    private final SkillRegistry skillRegistry;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // 执行器映射
    private final Map<String, SkillExecutionHandler> executionHandlers = new HashMap<>();
    
    /**
     * 构造函数：注册所有执行器
     */
    public SkillExecutor(
        SkillDefinitionRepository skillDefinitionRepository,
        SkillInstructionRepository skillInstructionRepository,
        SkillResourceRepository skillResourceRepository,
        SkillExecutionRepository skillExecutionRepository,
        SkillRegistry skillRegistry,
        ScriptSkillExecutor scriptExecutor,
        ApiSkillExecutor apiExecutor,
        GraphSkillExecutor graphExecutor,
        DatabaseSkillExecutor databaseExecutor,
        com.heartsphere.skill.service.executor.LLMBasedSkillExecutor llmBasedExecutor
    ) {
        this.skillDefinitionRepository = skillDefinitionRepository;
        this.skillInstructionRepository = skillInstructionRepository;
        this.skillResourceRepository = skillResourceRepository;
        this.skillExecutionRepository = skillExecutionRepository;
        this.skillRegistry = skillRegistry;
        
        // 注册执行器
        executionHandlers.put("SCRIPT", scriptExecutor);
        executionHandlers.put("API", apiExecutor);
        executionHandlers.put("GRAPH", graphExecutor);
        executionHandlers.put("DATABASE", databaseExecutor);
        // 注册基于大模型的执行器（用于RULE_BASED类型）
        executionHandlers.put("RULE_BASED", llmBasedExecutor);
    }
    
    /**
     * 执行技能
     */
    @Transactional
    public SkillExecutionResult execute(
        String skillId,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        long startTime = System.currentTimeMillis();
        SkillExecutionResult result;
        
        try {
            // 1. 加载技能定义
            SkillDefinition skill = skillRegistry.getSkill(skillId)
                .orElseThrow(() -> new SkillNotFoundException("技能不存在: " + skillId));
            
            // 2. 验证参数
            validateParameters(skill, parameters);
            
            // 3. 检查权限和使用限制
            checkPermissionsAndLimits(skill, context);
            
            // 4. 加载 Level 2：指令
            List<SkillInstruction> instructions = skillInstructionRepository
                .findBySkillIdAndInstructionLevel(skillId, 2);
            
            // 5. 加载 Level 3：资源
            List<SkillResource> resources = skillResourceRepository
                .findBySkillId(skillId);
            
            // 6. 执行技能逻辑
            Object executionResult = executeSkillLogic(
                skill, 
                instructions, 
                resources, 
                parameters, 
                context
            );
            
            result = SkillExecutionResult.builder()
                .skillId(skillId)
                .success(true)
                .result(executionResult)
                .executionTimeMs((int)(System.currentTimeMillis() - startTime))
                .build();
            
        } catch (Exception e) {
            log.error("执行技能失败: skillId={}, error={}", skillId, e.getMessage(), e);
            result = SkillExecutionResult.builder()
                .skillId(skillId)
                .success(false)
                .errorMessage(e.getMessage())
                .executionTimeMs((int)(System.currentTimeMillis() - startTime))
                .build();
        }
        
        // 7. 记录执行历史
        recordExecution(skillId, parameters, result, context);
        
        return result;
    }
    
    /**
     * 执行技能逻辑
     */
    private Object executeSkillLogic(
        SkillDefinition skill,
        List<SkillInstruction> instructions,
        List<SkillResource> resources,
        Map<String, Object> parameters,
        SkillExecutionContext context
    ) {
        String executionType = skill.getExecutionType() != null 
            ? skill.getExecutionType() 
            : "RULE_BASED";
        
        SkillExecutionHandler handler = executionHandlers.get(executionType);
        if (handler != null) {
            return handler.execute(skill, instructions, resources, parameters, context);
        }
        
        // 如果没有找到对应的执行器，使用RULE_BASED作为fallback
        log.warn("未找到执行器: executionType={}, 使用RULE_BASED作为fallback", executionType);
        SkillExecutionHandler fallbackHandler = executionHandlers.get("RULE_BASED");
        if (fallbackHandler != null) {
            return fallbackHandler.execute(skill, instructions, resources, parameters, context);
        }
        
        // 最后的fallback：返回简单结果
        return createFallbackResult(skill, parameters);
    }
    
    /**
     * 创建fallback结果（当没有执行器时）
     */
    private Object createFallbackResult(SkillDefinition skill, Map<String, Object> parameters) {
        Map<String, Object> result = new HashMap<>();
        result.put("skillId", skill.getSkillId());
        result.put("skillName", skill.getName());
        result.put("message", "技能执行成功（fallback模式）");
        result.put("parameters", parameters);
        result.put("warning", "未找到对应的执行器，使用fallback模式");
        return result;
    }
    
    /**
     * 验证参数
     */
    private void validateParameters(SkillDefinition skill, Map<String, Object> parameters) {
        try {
            if (skill.getFunctionSchema() == null || skill.getFunctionSchema().isEmpty()) {
                return;
            }
            
            Map<String, Object> schema = objectMapper.readValue(
                skill.getFunctionSchema(),
                new TypeReference<Map<String, Object>>() {}
            );
            
            // 验证必填参数
            @SuppressWarnings("unchecked")
            Map<String, Object> properties = (Map<String, Object>) schema.get("properties");
            @SuppressWarnings("unchecked")
            List<String> required = (List<String>) schema.getOrDefault("required", Collections.emptyList());
            
            for (String param : required) {
                if (!parameters.containsKey(param)) {
                    throw new IllegalArgumentException("缺少必填参数: " + param);
                }
            }
            
            // 验证参数类型（简化实现）
            if (properties != null) {
                for (Map.Entry<String, Object> entry : parameters.entrySet()) {
                    String paramName = entry.getKey();
                    Object paramValue = entry.getValue();
                    
                    if (properties.containsKey(paramName)) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> paramDef = (Map<String, Object>) properties.get(paramName);
                        String expectedType = (String) paramDef.get("type");
                        
                        // 简单的类型检查
                        if (expectedType != null && !isTypeMatch(paramValue, expectedType)) {
                            log.warn("参数类型不匹配: paramName={}, expectedType={}, actualType={}", 
                                paramName, expectedType, paramValue.getClass().getSimpleName());
                        }
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("参数验证失败", e);
            throw new IllegalArgumentException("参数验证失败: " + e.getMessage());
        }
    }
    
    /**
     * 检查类型是否匹配
     */
    private boolean isTypeMatch(Object value, String expectedType) {
        if (value == null) {
            return true; // null 值由 required 检查
        }
        
        switch (expectedType.toLowerCase()) {
            case "string":
                return value instanceof String;
            case "integer":
            case "number":
                return value instanceof Number;
            case "boolean":
                return value instanceof Boolean;
            case "array":
                return value instanceof List || value instanceof Object[];
            case "object":
                return value instanceof Map;
            default:
                return true; // 未知类型，不检查
        }
    }
    
    /**
     * 检查权限和使用限制
     */
    private void checkPermissionsAndLimits(SkillDefinition skill, SkillExecutionContext context) {
        // 检查每日使用次数限制
        if (skill.getMaxUsagePerDay() != null && skill.getMaxUsagePerDay() > 0) {
            long todayUsage = skillExecutionRepository.countTodayUsage(
                skill.getSkillId(),
                context.getCharacterId()
            );
            if (todayUsage >= skill.getMaxUsagePerDay()) {
                throw new SkillUsageLimitExceededException(
                    "技能 " + skill.getSkillId() + " 今日使用次数已达上限: " + skill.getMaxUsagePerDay()
                );
            }
        }
        
        // 检查权限（如果需要）
        // TODO: 实现权限检查逻辑
    }
    
    /**
     * 记录执行历史
     */
    private void recordExecution(
        String skillId,
        Map<String, Object> parameters,
        SkillExecutionResult result,
        SkillExecutionContext context
    ) {
        try {
            SkillExecution execution = new SkillExecution();
            execution.setSkillId(skillId);
            execution.setCharacterId(context.getCharacterId());
            execution.setUserId(context.getUserId());
            execution.setExecutionType("FUNCTION_CALL");
            execution.setParameters(objectMapper.writeValueAsString(parameters));
            execution.setResult(objectMapper.writeValueAsString(result.getResult()));
            execution.setExecutionTimeMs(result.getExecutionTimeMs());
            execution.setSuccess(result.isSuccess());
            execution.setErrorMessage(result.getErrorMessage());
            
            skillExecutionRepository.save(execution);
            
        } catch (Exception e) {
            log.error("记录技能执行历史失败", e);
        }
    }
    
    /**
     * 技能执行结果
     */
    @lombok.Data
    @lombok.Builder
    public static class SkillExecutionResult {
        private String skillId;
        private boolean success;
        private Object result;
        private String errorMessage;
        private Integer executionTimeMs;
    }
    
    /**
     * 技能执行上下文
     */
    @lombok.Data
    @lombok.Builder
    public static class SkillExecutionContext {
        private Long characterId;
        private Long userId;
        private Map<String, Object> additionalContext;
    }
    
    /**
     * 技能执行处理器接口
     */
    public interface SkillExecutionHandler {
        Object execute(
            SkillDefinition skill,
            List<SkillInstruction> instructions,
            List<SkillResource> resources,
            Map<String, Object> parameters,
            SkillExecutionContext context
        );
    }
    
    /**
     * 技能未找到异常
     */
    public static class SkillNotFoundException extends RuntimeException {
        public SkillNotFoundException(String message) {
            super(message);
        }
    }
    
    /**
     * 技能使用限制超出异常
     */
    public static class SkillUsageLimitExceededException extends RuntimeException {
        public SkillUsageLimitExceededException(String message) {
            super(message);
        }
    }
}
