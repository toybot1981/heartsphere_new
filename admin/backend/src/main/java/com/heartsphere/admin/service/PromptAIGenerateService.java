package com.heartsphere.admin.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.admin.dto.PromptGenerateRequest;
import com.heartsphere.admin.dto.PromptGenerateResponse;
import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.entity.PromptTemplate;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import com.heartsphere.admin.dto.ai.TextGenerationRequest;
import com.heartsphere.admin.dto.ai.TextGenerationResponse;
import com.heartsphere.admin.service.ai.AIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * 提示词AI生成服务
 * 使用AI根据模板生成优化的提示词
 */
@Service
public class PromptAIGenerateService {
    
    private static final Logger logger = LoggerFactory.getLogger(PromptAIGenerateService.class);
    
    @Autowired(required = false)
    private AIService aiService;

    @Autowired
    private com.heartsphere.shared.service.PromptRenderService renderService;

    @Autowired(required = false)
    private PromptTemplateIntegrationService templateService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String DEFAULT_SYSTEM_PROMPT_OPTIMIZE = "你是一个提示词优化专家。请根据用户提供的模板和上下文，生成优化后的提示词。";

    /**
     * AI生成提示词
     * 系统提示与用户提示优先从提示词管理（admin-prompt-optimize）获取，取不到时使用代码内默认。
     */
    public PromptGenerateResponse generatePrompt(PromptTemplate template, PromptGenerateRequest request) {
        try {
            // 先渲染模板，得到基础提示词
            PromptRenderResponse renderResponse = renderService.render(template, request.getVariables() != null ? request.getVariables() : new HashMap<>());

            // 默认用户提示（buildGeneratePrompt）
            String defaultUserPrompt = buildGeneratePrompt(template, renderResponse, request);
            Map<String, Object> variables = new HashMap<>();
            variables.put("templateName", template.getName());
            variables.put("templateDescription", template.getDescription() != null ? template.getDescription() : "");
            variables.put("originalSystemPrompt", renderResponse.getSystemPrompt());
            variables.put("originalUserPrompt", renderResponse.getUserPrompt());
            if (request.getContext() != null && !request.getContext().isEmpty()) {
                variables.put("context", request.getContext());
            }
            PromptRenderResponse prompts = templateService != null
                    ? templateService.getPrompts("admin-prompt-optimize", variables, DEFAULT_SYSTEM_PROMPT_OPTIMIZE, defaultUserPrompt)
                    : null;
            String systemInstruction = (prompts != null) ? prompts.getSystemPrompt() : DEFAULT_SYSTEM_PROMPT_OPTIMIZE;
            String generatePrompt = (prompts != null && prompts.getUserPrompt() != null && !prompts.getUserPrompt().isEmpty())
                    ? prompts.getUserPrompt() : defaultUserPrompt;

            TextGenerationRequest aiRequest = new TextGenerationRequest();
            aiRequest.setPrompt(generatePrompt);
            aiRequest.setSystemInstruction(systemInstruction);
            aiRequest.setTemperature(0.7);
            aiRequest.setMaxTokens(2000);

            // 调用AI服务（使用管理员ID 1作为默认用户）
            TextGenerationResponse aiResponse = aiService.generateText(1L, aiRequest);
            
            // 解析AI响应
            Map<String, String> generatedPrompts = parseAIResponse(aiResponse.getContent());
            
            PromptGenerateResponse response = new PromptGenerateResponse();
            response.setOriginalSystemPrompt(renderResponse.getSystemPrompt());
            response.setOriginalUserPrompt(renderResponse.getUserPrompt());
            response.setGeneratedSystemPrompt(generatedPrompts.getOrDefault("systemPrompt", renderResponse.getSystemPrompt()));
            response.setGeneratedUserPrompt(generatedPrompts.getOrDefault("userPrompt", renderResponse.getUserPrompt()));
            response.setSuggestedVariables(request.getVariables());
            
            return response;
            
        } catch (Exception e) {
            logger.error("AI生成提示词失败", e);
            // 如果AI生成失败，返回原始渲染结果
            PromptRenderResponse renderResponse = renderService.render(template, request.getVariables());
            PromptGenerateResponse response = new PromptGenerateResponse();
            response.setOriginalSystemPrompt(renderResponse.getSystemPrompt());
            response.setOriginalUserPrompt(renderResponse.getUserPrompt());
            response.setGeneratedSystemPrompt(renderResponse.getSystemPrompt());
            response.setGeneratedUserPrompt(renderResponse.getUserPrompt());
            response.setSuggestedVariables(request.getVariables());
            return response;
        }
    }
    
    /**
     * 构建AI生成请求的提示词
     */
    private String buildGeneratePrompt(PromptTemplate template, PromptRenderResponse renderResponse, PromptGenerateRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("请根据以下模板和上下文，生成优化后的提示词。\n\n");
        prompt.append("模板名称：").append(template.getName()).append("\n");
        prompt.append("模板描述：").append(template.getDescription()).append("\n\n");
        
        prompt.append("原始系统提示词：\n").append(renderResponse.getSystemPrompt()).append("\n\n");
        prompt.append("原始用户提示词：\n").append(renderResponse.getUserPrompt()).append("\n\n");
        
        if (request.getContext() != null && !request.getContext().isEmpty()) {
            prompt.append("上下文信息：\n").append(request.getContext()).append("\n\n");
        }
        
        prompt.append("请返回JSON格式，包含以下字段：\n");
        prompt.append("{\n");
        prompt.append("  \"systemPrompt\": \"优化后的系统提示词\",\n");
        prompt.append("  \"userPrompt\": \"优化后的用户提示词\"\n");
        prompt.append("}\n");
        
        return prompt.toString();
    }
    
    /**
     * 解析AI响应
     */
    private Map<String, String> parseAIResponse(String content) {
        Map<String, String> result = new HashMap<>();
        
        if (content == null || content.trim().isEmpty()) {
            return result;
        }
        
        try {
            // 尝试解析JSON
            String jsonStr = content.trim();
            // 移除可能的markdown代码块标记
            if (jsonStr.startsWith("```json")) {
                jsonStr = jsonStr.substring(7);
            }
            if (jsonStr.startsWith("```")) {
                jsonStr = jsonStr.substring(3);
            }
            if (jsonStr.endsWith("```")) {
                jsonStr = jsonStr.substring(0, jsonStr.length() - 3);
            }
            jsonStr = jsonStr.trim();
            
            Map<String, Object> parsed = objectMapper.readValue(jsonStr, new TypeReference<Map<String, Object>>() {});
            result.put("systemPrompt", String.valueOf(parsed.getOrDefault("systemPrompt", "")));
            result.put("userPrompt", String.valueOf(parsed.getOrDefault("userPrompt", "")));
            
        } catch (Exception e) {
            logger.warn("解析AI响应失败，使用原始内容", e);
            // 如果解析失败，尝试提取文本内容
            result.put("userPrompt", content);
        }
        
        return result;
    }
}
