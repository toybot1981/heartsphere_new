package com.heartsphere.skill.service.executor;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import com.heartsphere.skill.entity.SkillDefinition;
import com.heartsphere.skill.entity.SkillInstruction;
import com.heartsphere.skill.entity.SkillResource;
import com.heartsphere.skill.service.SkillExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 基于大模型的技能执行器
 * 
 * 利用大模型的能力来执行RULE_BASED类型的技能
 * 通过Level 2指令和Level 3资源指导大模型执行技能逻辑
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LLMBasedSkillExecutor implements SkillExecutor.SkillExecutionHandler {

    private final AIService aiService;
    private final PromptTemplateIntegrationService templateService;
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
            log.info("使用大模型执行技能: skillId={}, characterId={}",
                skill.getSkillId(), context.getCharacterId());

            // 1. 默认系统指令与用户提示（fallback）
            String defaultSystem = buildSystemInstruction(skill, instructions);
            String defaultUser = buildUserPrompt(skill, parameters, resources, context);
            // 2. 从提示词管理获取，取不到时用默认
            Map<String, Object> variables = buildSkillExecutionVariables(skill, instructions, parameters, resources);
            PromptRenderResponse prompts = templateService.getPrompts(
                    "skill-execution", variables, defaultSystem, defaultUser);
            String systemInstruction = prompts.getSystemPrompt();
            String userPrompt = prompts.getUserPrompt();

            // 3. 解析execution_config获取workflow（如果有）
            Map<String, Object> workflow = extractWorkflow(skill.getExecutionConfig());
            
            // 4. 如果有workflow，按步骤执行
            if (workflow != null && !workflow.isEmpty()) {
                return executeWithWorkflow(skill, systemInstruction, userPrompt, parameters, workflow, context);
            }
            
            // 5. 否则直接调用大模型执行
            return executeDirectly(skill, systemInstruction, userPrompt, context);
            
        } catch (Exception e) {
            log.error("大模型执行技能失败: skillId={}", skill.getSkillId(), e);
            throw new RuntimeException("大模型执行技能失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建系统指令
     * 支持向后兼容：优先使用 skill_content，如果没有则使用 skill_instructions 表
     */
    private String buildSystemInstruction(SkillDefinition skill, List<SkillInstruction> instructions) {
        StringBuilder sb = new StringBuilder();
        
        // 优先使用新格式：skill_content
        if (skill.getSkillContent() != null && !skill.getSkillContent().isEmpty()) {
            return buildSystemInstructionFromSkillContent(skill);
        }
        
        // 降级使用旧格式：skill_instructions 表
        log.debug("技能 {} 使用旧格式 skill_instructions，建议迁移到 skill_content", skill.getSkillId());
        return buildSystemInstructionFromInstructions(skill, instructions);
    }
    
    /**
     * 从 skill_content 构建系统指令（新格式）
     */
    private String buildSystemInstructionFromSkillContent(SkillDefinition skill) {
        String skillContent = skill.getSkillContent();
        
        // 提取 YAML 元数据后的 Markdown 指令部分
        // skill_content 格式：---\nYAML元数据\n---\n\nMarkdown指令内容
        int yamlEndIndex = skillContent.indexOf("---\n", 4); // 跳过第一个 ---
        if (yamlEndIndex > 0) {
            String instructionPart = skillContent.substring(yamlEndIndex + 4).trim();
            
            StringBuilder sb = new StringBuilder();
            sb.append("你是一个专业的").append(skill.getName()).append("助手。\n\n");
            sb.append("技能描述: ").append(skill.getDescription() != null ? skill.getDescription() : "").append("\n\n");
            sb.append("执行指南:\n");
            sb.append(instructionPart).append("\n\n");
            sb.append("请以JSON格式返回执行结果，包含以下字段：\n");
            sb.append("- success: 是否成功（boolean）\n");
            sb.append("- result: 执行结果（object，包含具体的技能输出）\n");
            sb.append("- message: 执行说明（string，可选）\n");
            
            return sb.toString();
        }
        
        // 如果没有找到 YAML 分隔符，整个内容作为指令
        StringBuilder sb = new StringBuilder();
        sb.append("你是一个专业的").append(skill.getName()).append("助手。\n\n");
        sb.append(skillContent).append("\n\n");
        sb.append("请以JSON格式返回执行结果，包含以下字段：\n");
        sb.append("- success: 是否成功（boolean）\n");
        sb.append("- result: 执行结果（object，包含具体的技能输出）\n");
        sb.append("- message: 执行说明（string，可选）\n");
        
        return sb.toString();
    }
    
    /**
     * 从 skill_instructions 表构建系统指令（旧格式）
     */
    private String buildSystemInstructionFromInstructions(SkillDefinition skill, List<SkillInstruction> instructions) {
        StringBuilder sb = new StringBuilder();
        
        // 技能基本信息
        sb.append("你是一个专业的").append(skill.getName()).append("助手。\n\n");
        sb.append("技能描述: ").append(skill.getDescription() != null ? skill.getDescription() : "").append("\n\n");
        
        // Level 2指令（按优先级排序）
        List<SkillInstruction> sortedInstructions = instructions.stream()
            .filter(inst -> inst.getInstructionLevel() == 2)
            .sorted(Comparator.comparing(SkillInstruction::getExecutionOrder, 
                Comparator.nullsLast(Comparator.naturalOrder())))
            .collect(Collectors.toList());
        
        if (!sortedInstructions.isEmpty()) {
            sb.append("执行指南:\n");
            for (int i = 0; i < sortedInstructions.size(); i++) {
                SkillInstruction inst = sortedInstructions.get(i);
                sb.append(i + 1).append(". ").append(inst.getInstructionText()).append("\n");
            }
            sb.append("\n");
        }
        
        // 输出格式要求
        sb.append("请以JSON格式返回执行结果，包含以下字段：\n");
        sb.append("- success: 是否成功（boolean）\n");
        sb.append("- result: 执行结果（object，包含具体的技能输出）\n");
        sb.append("- message: 执行说明（string，可选）\n");
        
        return sb.toString();
    }
    
    /**
     * 构建用户提示
     */
    private String buildUserPrompt(
        SkillDefinition skill,
        Map<String, Object> parameters,
        List<SkillResource> resources,
        SkillExecutor.SkillExecutionContext context
    ) {
        StringBuilder sb = new StringBuilder();
        
        // 参数信息
        sb.append("请执行").append(skill.getName()).append("技能。\n\n");
        sb.append("输入参数:\n");
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            sb.append("- ").append(entry.getKey()).append(": ");
            if (entry.getValue() instanceof Collection) {
                sb.append(entry.getValue());
            } else if (entry.getValue() instanceof Map) {
                sb.append(entry.getValue());
            } else {
                sb.append(entry.getValue());
            }
            sb.append("\n");
        }
        sb.append("\n");
        
        // Level 3资源（模板、示例等）
        if (resources != null && !resources.isEmpty()) {
            sb.append("可用资源:\n");
            for (SkillResource resource : resources) {
                if ("TEMPLATE".equals(resource.getResourceType()) || 
                    "EXAMPLE".equals(resource.getResourceType()) ||
                    "CONFIG".equals(resource.getResourceType())) {
                    sb.append("- ").append(resource.getResourceName()).append(": ");
                    if (resource.getResourceContent() != null) {
                        sb.append(resource.getResourceContent());
                    }
                    sb.append("\n");
                }
            }
            sb.append("\n");
        }
        
        // 执行要求
        sb.append("请根据系统指令中的指南，使用提供的参数和资源执行技能，并返回JSON格式的结果。");

        return sb.toString();
    }

    /**
     * 构建技能执行模板变量（供提示词管理渲染）
     */
    private Map<String, Object> buildSkillExecutionVariables(
            SkillDefinition skill,
            List<SkillInstruction> instructions,
            Map<String, Object> parameters,
            List<SkillResource> resources) {
        Map<String, Object> vars = new HashMap<>();
        vars.put("skillName", skill.getName());
        vars.put("skillDescription", skill.getDescription() != null ? skill.getDescription() : "");
        vars.put("instructionPart", extractInstructionPart(skill, instructions));
        StringBuilder parametersBlock = new StringBuilder();
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            parametersBlock.append("- ").append(entry.getKey()).append(": ");
            if (entry.getValue() instanceof Collection) {
                parametersBlock.append(entry.getValue());
            } else if (entry.getValue() instanceof Map) {
                parametersBlock.append(entry.getValue());
            } else {
                parametersBlock.append(entry.getValue());
            }
            parametersBlock.append("\n");
        }
        vars.put("parametersBlock", parametersBlock.toString());
        StringBuilder resourcesBlock = new StringBuilder();
        if (resources != null && !resources.isEmpty()) {
            for (SkillResource resource : resources) {
                if ("TEMPLATE".equals(resource.getResourceType()) || "EXAMPLE".equals(resource.getResourceType()) || "CONFIG".equals(resource.getResourceType())) {
                    resourcesBlock.append("- ").append(resource.getResourceName()).append(": ");
                    if (resource.getResourceContent() != null) {
                        resourcesBlock.append(resource.getResourceContent());
                    }
                    resourcesBlock.append("\n");
                }
            }
        }
        vars.put("resourcesBlock", resourcesBlock.toString());
        return vars;
    }

    private String extractInstructionPart(SkillDefinition skill, List<SkillInstruction> instructions) {
        if (skill.getSkillContent() != null && !skill.getSkillContent().isEmpty()) {
            String content = skill.getSkillContent();
            int yamlEnd = content.indexOf("---\n", 4);
            if (yamlEnd > 0) {
                return content.substring(yamlEnd + 4).trim();
            }
            return content;
        }
        if (instructions != null) {
            List<SkillInstruction> sorted = instructions.stream()
                    .filter(inst -> inst.getInstructionLevel() == 2)
                    .sorted(Comparator.comparing(SkillInstruction::getExecutionOrder, Comparator.nullsLast(Comparator.naturalOrder())))
                    .collect(Collectors.toList());
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < sorted.size(); i++) {
                sb.append(i + 1).append(". ").append(sorted.get(i).getInstructionText()).append("\n");
            }
            return sb.toString();
        }
        return "";
    }

    /**
     * 提取workflow配置
     */
    private Map<String, Object> extractWorkflow(String executionConfig) {
        if (executionConfig == null || executionConfig.isEmpty()) {
            return null;
        }
        
        try {
            Map<String, Object> config = objectMapper.readValue(
                executionConfig,
                new TypeReference<Map<String, Object>>() {}
            );
            @SuppressWarnings("unchecked")
            Map<String, Object> workflow = (Map<String, Object>) config.get("workflow");
            return workflow;
        } catch (Exception e) {
            log.warn("解析workflow配置失败", e);
            return null;
        }
    }
    
    /**
     * 按workflow执行（多步骤执行）
     */
    private Object executeWithWorkflow(
        SkillDefinition skill,
        String systemInstruction,
        String userPrompt,
        Map<String, Object> parameters,
        Map<String, Object> workflow,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 获取action参数
            String action = (String) parameters.get("action");
            if (action == null) {
                action = "default";
            }
            
            // 获取该action的步骤
            Map<String, Object> actionWorkflow = null;
            Object actionWorkflowObj = workflow.get(action);
            if (actionWorkflowObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> temp = (Map<String, Object>) actionWorkflowObj;
                actionWorkflow = temp;
            }
            if (actionWorkflow == null) {
                Object defaultWorkflowObj = workflow.get("default");
                if (defaultWorkflowObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> temp = (Map<String, Object>) defaultWorkflowObj;
                    actionWorkflow = temp;
                }
            }
            
            if (actionWorkflow != null) {
                @SuppressWarnings("unchecked")
                List<String> steps = (List<String>) actionWorkflow.get("steps");
                if (steps != null && !steps.isEmpty()) {
                    // 多步骤执行
                    return executeMultiStep(skill, systemInstruction, userPrompt, steps, context);
                }
            }
            
            // 如果没有步骤定义，直接执行
            return executeDirectly(skill, systemInstruction, userPrompt, context);
            
        } catch (Exception e) {
            log.error("按workflow执行失败", e);
            return executeDirectly(skill, systemInstruction, userPrompt, context);
        }
    }
    
    /**
     * 多步骤执行
     */
    private Object executeMultiStep(
        SkillDefinition skill,
        String systemInstruction,
        String userPrompt,
        List<String> steps,
        SkillExecutor.SkillExecutionContext context
    ) {
        Map<String, Object> stepResults = new LinkedHashMap<>();
        String currentContext = userPrompt;
        
        for (int i = 0; i < steps.size(); i++) {
            String step = steps.get(i);
            log.info("执行步骤 {}/{}: {}", i + 1, steps.size(), step);
            
            // 构建步骤提示
            String stepPrompt = String.format(
                "步骤 %d/%d: %s\n\n当前上下文:\n%s\n\n请执行此步骤并返回JSON格式的结果。",
                i + 1, steps.size(), step, currentContext
            );
            
            // 调用大模型执行步骤
            TextGenerationResponse stepResponse = callLLM(skill, systemInstruction, stepPrompt, context);
            
            // 解析步骤结果
            try {
                Map<String, Object> stepResult = objectMapper.readValue(
                    stepResponse.getContent(),
                    new TypeReference<Map<String, Object>>() {}
                );
                stepResults.put("step" + (i + 1), stepResult);
                stepResults.put(step, stepResult);
                
                // 更新上下文
                currentContext += "\n\n步骤" + (i + 1) + "结果: " + stepResponse.getContent();
            } catch (Exception e) {
                log.warn("解析步骤结果失败，使用原始内容", e);
                stepResults.put("step" + (i + 1), stepResponse.getContent());
                currentContext += "\n\n步骤" + (i + 1) + "结果: " + stepResponse.getContent();
            }
        }
        
        // 构建最终结果
        Map<String, Object> finalResult = new HashMap<>();
        finalResult.put("success", true);
        finalResult.put("steps", stepResults);
        finalResult.put("result", stepResults); // 兼容性
        
        return finalResult;
    }
    
    /**
     * 直接执行（单次调用）
     */
    private Object executeDirectly(
        SkillDefinition skill,
        String systemInstruction,
        String userPrompt,
        SkillExecutor.SkillExecutionContext context
    ) {
        TextGenerationResponse response = callLLM(skill, systemInstruction, userPrompt, context);
        
        // 尝试解析JSON结果
        try {
            return objectMapper.readValue(
                response.getContent(),
                new TypeReference<Map<String, Object>>() {}
            );
        } catch (Exception e) {
            log.warn("解析大模型返回结果失败，返回原始内容", e);
            // 如果解析失败，返回包装后的结果
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("result", response.getContent());
            result.put("raw", true);
            return result;
        }
    }
    
    /**
     * 调用大模型
     */
    private TextGenerationResponse callLLM(
        SkillDefinition skill,
        String systemInstruction,
        String userPrompt,
        SkillExecutor.SkillExecutionContext context
    ) {
        try {
            // 构建请求
            TextGenerationRequest request = new TextGenerationRequest();
            request.setSystemInstruction(systemInstruction);
            request.setPrompt(userPrompt);
            request.setTemperature(0.3); // 较低温度以获得更稳定的结果
            request.setMaxTokens(2000);
            
            // 如果有userId，使用userId；否则使用characterId作为fallback
            Long userId = context.getUserId();
            if (userId == null && context.getCharacterId() != null) {
                // 如果没有userId，尝试从additionalContext获取
                if (context.getAdditionalContext() != null) {
                    Object userIdObj = context.getAdditionalContext().get("userId");
                    if (userIdObj instanceof Number) {
                        userId = ((Number) userIdObj).longValue();
                    }
                }
            }
            
            // 如果还是没有userId，使用默认值1（系统用户）
            if (userId == null) {
                userId = 1L;
                log.warn("技能执行缺少userId，使用默认值1: skillId={}, characterId={}", 
                    skill.getSkillId(), context.getCharacterId());
            }
            
            // 调用AI服务
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            String content = response.getContent() != null ? response.getContent() : "";
            log.info("大模型执行技能成功: skillId={}, responseLength={}", 
                skill.getSkillId(), content.length());
            log.info("大模型执行技能响应内容: {}", content);
            
            return response;
            
        } catch (Exception e) {
            log.error("调用大模型失败: skillId={}", skill.getSkillId(), e);
            throw new RuntimeException("调用大模型失败: " + e.getMessage(), e);
        }
    }
}
