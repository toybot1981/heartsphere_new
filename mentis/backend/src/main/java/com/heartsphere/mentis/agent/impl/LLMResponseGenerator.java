package com.heartsphere.mentis.agent.impl;

import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.ai.service.AIService;
import com.heartsphere.mentis.agent.ResponseGenerator;
import com.heartsphere.mentis.agent.ResponseGenerator.ExecutionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 基于 LLM 的响应生成器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LLMResponseGenerator implements ResponseGenerator {
    
    private final AIService aiService;
    private final PromptTemplateIntegrationService templateService;
    
    private static final String RESPONSE_GENERATION_PROMPT = """
        你是一个智能助手 Mentis。请根据任务执行结果，生成友好的自然语言响应返回给用户。
        
        执行结果：
        {executionResult}
        
        请生成一个友好的响应，说明任务执行情况。
        如果任务成功，简要说明结果。
        如果任务失败，友好地解释原因。
        """;
    
    @Override
    public String generate(ExecutionResult executionResult, String sessionId) {
        log.info("生成响应: sessionId={}, status={}", sessionId, executionResult.getStatus());
        
        try {
            // 构建 Prompt
            String executionSummary = buildExecutionSummary(executionResult);
            
            // 使用提示词模板
            Map<String, Object> variables = new HashMap<>();
            variables.put("executionResult", executionSummary);
            variables.put("status", executionResult.getStatus() != null ? executionResult.getStatus() : "未知");
            
            PromptRenderResponse prompts = templateService.getPrompts(
                "response",
                variables,
                "你是 Mentis，一个友好的智能助手。请用自然、友好的语言回复用户。",
                RESPONSE_GENERATION_PROMPT.replace("{executionResult}", executionSummary)
            );
            
            // 调用 LLM
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompts.getUserPrompt());
            request.setSystemInstruction(prompts.getSystemPrompt());
            request.setTemperature(0.7);
            request.setMaxTokens(500);
            
            // TODO: 获取真实的 userId
            Long userId = 1L;
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            return response.getContent();
            
        } catch (Exception e) {
            log.error("生成响应失败: sessionId={}", sessionId, e);
            return generateDefaultResponse(executionResult);
        }
    }
    
    /**
     * 构建执行结果摘要
     */
    private String buildExecutionSummary(ExecutionResult result) {
        if (result == null) {
            return "无执行结果";
        }
        
        StringBuilder summary = new StringBuilder();
        summary.append("执行状态: ").append(result.getStatus() != null ? result.getStatus() : "未知").append("\n");
        
        if (result.getTaskResults() != null && !result.getTaskResults().isEmpty()) {
            summary.append("任务步骤:\n");
            for (TaskResult taskResult : result.getTaskResults()) {
                summary.append("- ").append(taskResult.getDescription() != null ? taskResult.getDescription() : "未知任务")
                       .append(": ").append(taskResult.getStatus() != null ? taskResult.getStatus() : "未知状态")
                       .append("\n");
                if (taskResult.getResult() != null) {
                    summary.append("  结果: ").append(taskResult.getResult()).append("\n");
                }
            }
        }
        
        if (result.getErrorMessage() != null) {
            summary.append("错误信息: ").append(result.getErrorMessage());
        }
        
        return summary.toString();
    }
    
    /**
     * 生成默认响应
     */
    private String generateDefaultResponse(ExecutionResult result) {
        if (result == null || result.getStatus() == null) {
            return "任务执行完成。";
        }
        
        if ("COMPLETED".equals(result.getStatus())) {
            return "任务执行完成！";
        } else if ("FAILED".equals(result.getStatus())) {
            return "抱歉，任务执行失败。错误信息: " + 
                   (result.getErrorMessage() != null ? result.getErrorMessage() : "未知错误");
        } else {
            return "任务正在执行中...";
        }
    }
}
