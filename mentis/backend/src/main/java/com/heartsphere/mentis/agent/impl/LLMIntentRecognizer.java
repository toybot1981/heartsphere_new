package com.heartsphere.mentis.agent.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.shared.dto.PromptRenderResponse;
import com.heartsphere.shared.service.PromptTemplateIntegrationService;
import com.heartsphere.mentis.ai.service.AIService;
import com.heartsphere.mentis.agent.IntentRecognizer;
import com.heartsphere.mentis.util.LLMResponseParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

/**
 * 基于 LLM 的意图识别器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LLMIntentRecognizer implements IntentRecognizer {
    
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final LLMResponseParser responseParser;
    private final PromptTemplateIntegrationService templateService;
    
    private static final String INTENT_RECOGNITION_PROMPT = """
        你是一个意图识别专家。请分析用户的消息，识别用户的意图和任务类型。
        
        用户消息：{userMessage}
        
        请按照以下JSON格式返回识别结果：
        {
          "taskType": "COMMAND|SCRIPT|COMPUTER_USE|CHAT",
          "intent": "意图描述",
          "parameters": {
            "key": "value"
          },
          "confidence": 0.9
        }
        
        任务类型说明：
        - COMMAND: 执行系统命令
        - SCRIPT: 执行脚本（Python、JavaScript等）
        - COMPUTER_USE: GUI自动化操作
        - CHAT: 普通对话，不需要执行任务
        
        请准确识别用户意图。
        """;
    
    @Override
    public IntentRecognizer.IntentRecognitionResult recognize(String userMessage, String sessionId) {
        log.info("识别用户意图: sessionId={}, message={}", sessionId, userMessage);
        
        try {
            // 使用提示词模板
            Map<String, Object> variables = new HashMap<>();
            variables.put("userMessage", userMessage);
            
            PromptRenderResponse prompts = templateService.getPrompts(
                "intent",
                variables,
                "你是一个专业的意图识别专家，擅长准确识别用户的任务意图。",
                INTENT_RECOGNITION_PROMPT.replace("{userMessage}", userMessage)
            );
            
            // 调用 LLM
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompts.getUserPrompt());
            request.setSystemInstruction(prompts.getSystemPrompt());
            request.setTemperature(0.3);
            request.setMaxTokens(500);
            
            // TODO: 获取真实的 userId
            Long userId = 1L;
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            // 解析响应
            return parseResponse(response.getContent());
            
        } catch (Exception e) {
            log.error("意图识别失败: sessionId={}", sessionId, e);
            // 返回默认结果
            return createDefaultResult(userMessage);
        }
    }
    
    /**
     * 解析 LLM 响应
     */
    private IntentRecognizer.IntentRecognitionResult parseResponse(String responseContent) {
        try {
            // 使用 LLMResponseParser 提取和解析 JSON
            JsonNode jsonNode = responseParser.extractAndParseJsonSafely(responseContent);
            
            if (jsonNode == null) {
                log.warn("无法解析 JSON，使用默认结果");
                return createDefaultResult("");
            }
            
            IntentRecognizer.IntentRecognitionResult result = new IntentRecognizer.IntentRecognitionResult();
            
            // 解析 taskType
            if (jsonNode.has("taskType")) {
                String taskType = jsonNode.get("taskType").asText().toUpperCase();
                // 验证任务类型
                if (isValidTaskType(taskType)) {
                    result.setTaskType(taskType);
                } else {
                    log.warn("无效的任务类型: {}, 使用默认值", taskType);
                    result.setTaskType("CHAT");
                }
            } else {
                result.setTaskType("CHAT");
            }
            
            // 解析 intent
            if (jsonNode.has("intent")) {
                result.setIntent(jsonNode.get("intent").asText());
            } else {
                result.setIntent("未识别");
            }
            
            // 解析 parameters
            Map<String, Object> parameters = new HashMap<>();
            if (jsonNode.has("parameters") && jsonNode.get("parameters").isObject()) {
                JsonNode paramsNode = jsonNode.get("parameters");
                paramsNode.fields().forEachRemaining(entry -> {
                    String key = entry.getKey();
                    JsonNode valueNode = entry.getValue();
                    Object value = parseJsonValue(valueNode);
                    parameters.put(key, value);
                });
            }
            result.setParameters(parameters);
            
            // 解析 confidence
            if (jsonNode.has("confidence")) {
                double confidence = jsonNode.get("confidence").asDouble();
                // 确保置信度在 0-1 之间
                result.setConfidence(Math.max(0.0, Math.min(1.0, confidence)));
            } else {
                result.setConfidence(0.7);
            }
            
            log.debug("解析意图识别结果: taskType={}, intent={}, confidence={}", 
                    result.getTaskType(), result.getIntent(), result.getConfidence());
            
            return result;
            
        } catch (Exception e) {
            log.error("解析意图识别响应失败", e);
            return createDefaultResult("");
        }
    }
    
    /**
     * 验证任务类型是否有效
     */
    private boolean isValidTaskType(String taskType) {
        return "COMMAND".equals(taskType) || 
               "SCRIPT".equals(taskType) || 
               "COMPUTER_USE".equals(taskType) || 
               "CHAT".equals(taskType);
    }
    
    /**
     * 解析 JSON 值为 Java 对象
     */
    private Object parseJsonValue(JsonNode node) {
        if (node.isTextual()) {
            return node.asText();
        } else if (node.isNumber()) {
            if (node.isInt()) {
                return node.asInt();
            } else if (node.isLong()) {
                return node.asLong();
            } else {
                return node.asDouble();
            }
        } else if (node.isBoolean()) {
            return node.asBoolean();
        } else if (node.isArray()) {
            return objectMapper.convertValue(node, java.util.List.class);
        } else if (node.isObject()) {
            return objectMapper.convertValue(node, java.util.Map.class);
        } else {
            return node.asText();
        }
    }
    
    /**
     * 创建默认识别结果
     */
    private IntentRecognizer.IntentRecognitionResult createDefaultResult(String userMessage) {
        IntentRecognizer.IntentRecognitionResult result = new IntentRecognizer.IntentRecognitionResult();
        
        // 简单的关键词匹配
        String messageLower = userMessage.toLowerCase();
        if (messageLower.contains("执行") || messageLower.contains("运行") || messageLower.contains("command")) {
            result.setTaskType("COMMAND");
            result.setIntent("执行命令");
        } else if (messageLower.contains("脚本") || messageLower.contains("script") || 
                   messageLower.contains("python") || messageLower.contains("javascript")) {
            result.setTaskType("SCRIPT");
            result.setIntent("执行脚本");
        } else if (messageLower.contains("gui") || messageLower.contains("自动化") || 
                   messageLower.contains("点击") || messageLower.contains("操作")) {
            result.setTaskType("COMPUTER_USE");
            result.setIntent("GUI自动化操作");
        } else {
            result.setTaskType("CHAT");
            result.setIntent("对话");
        }
        
        result.setParameters(new HashMap<>());
        result.setConfidence(0.7);
        
        return result;
    }
}
