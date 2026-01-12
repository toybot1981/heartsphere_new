package com.heartsphere.mentis.executor.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.ai.service.AIService;
import com.heartsphere.mentis.executor.TaskDecomposer;
import com.heartsphere.mentis.util.LLMResponseParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * 基于 LLM 的任务分解器实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LLMTaskDecomposer implements TaskDecomposer {
    
    private final AIService aiService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final LLMResponseParser responseParser;
    
    private static final String DECOMPOSE_PROMPT_TEMPLATE = """
        你是一个任务分解专家。请将用户的需求分解为可执行的任务步骤。
        
        用户需求：{userRequest}
        
        请按照以下JSON格式返回任务步骤列表：
        {
          "steps": [
            {
              "stepId": "step_1",
              "taskType": "COMMAND|SCRIPT|COMPUTER_USE",
              "description": "任务描述",
              "command": "执行的命令或脚本内容",
              "order": 1,
              "dependencies": []
            }
          ]
        }
        
        要求：
        1. 每个步骤应该清晰、可执行
        2. 任务类型要准确识别
        3. 步骤之间的依赖关系要明确
        4. 步骤顺序要合理
        """;
    
    @Override
    public List<TaskStep> decompose(String userRequest, String sessionId) {
        log.info("分解任务: sessionId={}, request={}", sessionId, userRequest);
        
        try {
            // 构建 Prompt
            String prompt = DECOMPOSE_PROMPT_TEMPLATE.replace("{userRequest}", userRequest);
            
            // 调用 LLM
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是一个专业的任务分解专家，擅长将复杂需求分解为可执行的任务步骤。");
            request.setTemperature(0.3);
            request.setMaxTokens(2000);
            
            // TODO: 获取真实的 userId，这里暂时使用默认值
            Long userId = 1L;
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            // 解析响应
            return parseResponse(response.getContent());
            
        } catch (Exception e) {
            log.error("任务分解失败: sessionId={}", sessionId, e);
            // 返回默认的简单任务步骤
            return createDefaultStep(userRequest);
        }
    }
    
    @Override
    public String identifyTaskType(String userRequest) {
        log.debug("识别任务类型: request={}", userRequest);
        
        // 简单的关键词匹配，后续可以用 LLM 优化
        String requestLower = userRequest.toLowerCase();
        
        if (requestLower.contains("python") || requestLower.contains("script")) {
            return "SCRIPT";
        } else if (requestLower.contains("command") || requestLower.contains("执行")) {
            return "COMMAND";
        } else if (requestLower.contains("gui") || requestLower.contains("自动化")) {
            return "COMPUTER_USE";
        }
        
        return "COMMAND"; // 默认类型
    }
    
    /**
     * 解析 LLM 响应
     */
    private List<TaskStep> parseResponse(String responseContent) {
        try {
            // 使用 LLMResponseParser 提取和解析 JSON
            JsonNode jsonNode = responseParser.extractAndParseJsonSafely(responseContent);
            
            if (jsonNode == null) {
                log.warn("无法解析 JSON，返回空列表");
                return new ArrayList<>();
            }
            
            List<TaskStep> steps = new ArrayList<>();
            
            // 解析 steps 数组
            if (jsonNode.has("steps") && jsonNode.get("steps").isArray()) {
                JsonNode stepsArray = jsonNode.get("steps");
                
                for (JsonNode stepNode : stepsArray) {
                    try {
                        TaskStep step = parseTaskStep(stepNode);
                        if (step != null) {
                            steps.add(step);
                        }
                    } catch (Exception e) {
                        log.warn("解析任务步骤失败，跳过该步骤", e);
                    }
                }
            } else {
                log.warn("响应中没有找到 steps 数组");
            }
            
            log.debug("解析任务步骤完成: 共 {} 个步骤", steps.size());
            return steps;
            
        } catch (Exception e) {
            log.error("解析任务分解响应失败", e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 解析单个任务步骤
     */
    private TaskStep parseTaskStep(JsonNode stepNode) {
        TaskStep step = new TaskStep();
        
        // stepId
        if (stepNode.has("stepId")) {
            step.setStepId(stepNode.get("stepId").asText());
        } else {
            step.setStepId("step_" + UUID.randomUUID().toString().substring(0, 8));
        }
        
        // taskType
        if (stepNode.has("taskType")) {
            String taskType = stepNode.get("taskType").asText().toUpperCase();
            if (isValidTaskType(taskType)) {
                step.setTaskType(taskType);
            } else {
                log.warn("无效的任务类型: {}, 使用默认值 COMMAND", taskType);
                step.setTaskType("COMMAND");
            }
        } else {
            step.setTaskType("COMMAND");
        }
        
        // description
        if (stepNode.has("description")) {
            step.setDescription(stepNode.get("description").asText());
        } else {
            step.setDescription("未描述的任务");
        }
        
        // command
        if (stepNode.has("command")) {
            step.setCommand(stepNode.get("command").asText());
        }
        
        // order
        if (stepNode.has("order")) {
            step.setOrder(stepNode.get("order").asInt());
        } else {
            step.setOrder(1);
        }
        
        // dependencies
        List<String> dependencies = new ArrayList<>();
        if (stepNode.has("dependencies") && stepNode.get("dependencies").isArray()) {
            for (JsonNode depNode : stepNode.get("dependencies")) {
                dependencies.add(depNode.asText());
            }
        }
        step.setDependencies(dependencies);
        
        return step;
    }
    
    /**
     * 验证任务类型是否有效
     */
    private boolean isValidTaskType(String taskType) {
        return "COMMAND".equals(taskType) || 
               "SCRIPT".equals(taskType) || 
               "COMPUTER_USE".equals(taskType);
    }
    
    /**
     * 创建默认任务步骤
     */
    private List<TaskStep> createDefaultStep(String userRequest) {
        List<TaskStep> steps = new ArrayList<>();
        TaskStep step = new TaskStep();
        step.setStepId("step_" + UUID.randomUUID().toString().substring(0, 8));
        step.setTaskType(identifyTaskType(userRequest));
        step.setDescription(userRequest);
        step.setOrder(1);
        step.setDependencies(new ArrayList<>());
        steps.add(step);
        return steps;
    }
}
