package com.heartsphere.mentis.agent.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
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
        - COMMAND: 执行系统命令（如：运行 ls、执行命令、执行系统操作、执行 shell 命令等）
        - SCRIPT: 执行脚本（如：运行 Python 脚本、执行 JavaScript 代码、运行脚本、执行代码等）
        - COMPUTER_USE: GUI自动化操作（如：打开浏览器、搜索信息、查询天气、查询资料、点击按钮、操作界面、自动化操作、使用应用程序等）
        - CHAT: 普通对话，不需要执行任务（如：纯聊天、问候、简单询问、不需要实际操作的问题等）
        
        识别规则：
        1. 如果用户消息包含明确的执行意图（如"执行"、"运行"、"执行命令"、"运行脚本"、"打开"、"点击"等），应该识别为相应的任务类型
        2. 如果用户消息需要实际操作才能完成（如"查天气"、"查资料"、"搜索"、"打开网站"、"获取信息"等），应该识别为 COMPUTER_USE
        3. 查询类任务（查天气、查资料、搜索、获取信息等）需要打开浏览器、搜索、操作界面等，应该识别为 COMPUTER_USE，而不是 CHAT
        4. 只有在用户消息只是询问、咨询、聊天，不需要实际操作时，才识别为 CHAT
        5. 优先识别为任务类型（COMMAND/SCRIPT/COMPUTER_USE），只有在确实没有执行意图时才识别为 CHAT
        
        重要：查询类任务（如"查天气"、"查资料"、"搜索"等）应该识别为 COMPUTER_USE，因为需要打开浏览器、搜索、获取信息等实际操作。
        
        请准确识别用户意图，优先识别为任务类型。
        """;
    
    @Override
    public IntentRecognizer.IntentRecognitionResult recognize(String userMessage, String sessionId) {
        log.info("识别用户意图: sessionId={}, message={}", sessionId, userMessage);
        
        try {
            // 直接使用硬编码的提示词（mentis项目的提示词不在admin中管理）
            String prompt = INTENT_RECOGNITION_PROMPT.replace("{userMessage}", userMessage);
            
            // 调用 LLM
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的意图识别专家，擅长准确识别用户的任务意图。");
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
        
        // 改进的关键词匹配，优先识别为任务类型
        String messageLower = userMessage.toLowerCase();
        
        // COMMAND 关键词
        if (messageLower.matches(".*(执行|运行|执行命令|运行命令|command|cmd|terminal|bash|shell).*") &&
            !messageLower.matches(".*(脚本|script|python|javascript|js|py).*")) {
            result.setTaskType("COMMAND");
            result.setIntent("执行命令");
        } 
        // SCRIPT 关键词
        else if (messageLower.matches(".*(脚本|script|python|javascript|js|py|运行.*脚本|执行.*脚本).*")) {
            result.setTaskType("SCRIPT");
            result.setIntent("执行脚本");
        } 
        // COMPUTER_USE 关键词（包括查询类任务）
        else if (messageLower.matches(".*(gui|自动化|点击|操作|打开|浏览器|界面|窗口|按钮|菜单|搜索|查询|查.*|获取.*信息|查找.*|搜索.*).*")) {
            result.setTaskType("COMPUTER_USE");
            result.setIntent("GUI自动化操作");
        } 
        // 包含明确执行意图的动词
        else if (messageLower.matches(".*(创建|删除|修改|更新|安装|卸载|启动|停止|重启|配置|设置).*")) {
            // 根据上下文判断是命令还是 GUI 操作
            if (messageLower.matches(".*(文件|目录|文件夹|系统|服务|进程).*")) {
                result.setTaskType("COMMAND");
                result.setIntent("执行命令");
            } else {
                result.setTaskType("COMPUTER_USE");
                result.setIntent("GUI自动化操作");
            }
        } 
        // 默认作为对话
        else {
            result.setTaskType("CHAT");
            result.setIntent("对话");
        }
        
        result.setParameters(new HashMap<>());
        result.setConfidence(0.7);
        
        log.debug("使用默认意图识别结果: taskType={}, intent={}, message={}", 
                result.getTaskType(), result.getIntent(), userMessage);
        
        return result;
    }
}
