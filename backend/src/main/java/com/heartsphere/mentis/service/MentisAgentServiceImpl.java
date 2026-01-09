package com.heartsphere.mentis.service;

import com.heartsphere.aiagent.service.AIService;
import com.heartsphere.aiagent.dto.request.TextGenerationRequest;
import com.heartsphere.aiagent.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.agent.IntentRecognizer;
import com.heartsphere.mentis.agent.ResponseGenerator;
import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.executor.ExecutionEngine;
import com.heartsphere.mentis.executor.TaskPlanner;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

/**
 * Mentis 智能体核心服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Lazy
@Service
@ConditionalOnProperty(prefix = "mentis", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class MentisAgentServiceImpl implements MentisAgentService {
    
    private final IntentRecognizer intentRecognizer;
    private final TaskPlanner taskPlanner;
    private final ExecutionEngine executionEngine;
    private final ResponseGenerator responseGenerator;
    private final MentisSessionService sessionService;
    private final AIService aiService;
    
    @Override
    public ChatResponseDTO processMessage(Long userId, ChatRequestDTO request) {
        log.info("处理用户消息: userId={}, sessionId={}, message={}", 
                userId, request.getSessionId(), request.getMessage());
        
        try {
            String userMessage = request.getMessage();
            String sessionId = request.getSessionId();
            
            // 1. 识别用户意图
            IntentRecognizer.IntentRecognitionResult intentResult = 
                    intentRecognizer.recognize(userMessage, sessionId);
            
            log.debug("意图识别结果: taskType={}, intent={}, confidence={}", 
                    intentResult.getTaskType(), intentResult.getIntent(), intentResult.getConfidence());
            
            String taskType = intentResult.getTaskType();
            if (taskType == null) {
                taskType = "CHAT"; // 默认作为聊天处理
            }
            
            String responseText;
            
            // 2. 根据任务类型处理
            if ("CHAT".equalsIgnoreCase(taskType)) {
                // 聊天类型：直接调用大模型生成回复
                responseText = generateChatResponse(userId, userMessage, sessionId);
            } else {
                // 其他类型：任务规划 -> 执行 -> 生成响应
                // 2.1 规划任务
                TaskPlanner.TaskPlan plan = taskPlanner.planTask(userMessage, sessionId);
                
                if (!taskPlanner.validateTask(plan)) {
                    responseText = "抱歉，我无法执行这个任务。任务计划验证失败。";
                } else {
                    // 2.2 执行任务
                    ExecutionEngine.ExecutionResult executionResult = 
                            executionEngine.execute(plan, sessionId);
                    
                    // 2.3 生成响应
                    ResponseGenerator.ExecutionResult responseExecutionResult = 
                            convertToResponseExecutionResult(executionResult, plan);
                    responseText = responseGenerator.generate(responseExecutionResult, sessionId);
                }
            }
            
            // 构建响应
            ChatResponseDTO response = new ChatResponseDTO();
            response.setMessageId("msg_" + System.currentTimeMillis());
            response.setResponse(responseText);
            response.setSessionId(sessionId);
            
            log.debug("消息处理完成: messageId={}, responseLength={}", 
                    response.getMessageId(), responseText != null ? responseText.length() : 0);
            
            return response;
            
        } catch (Exception e) {
            log.error("处理消息失败: userId={}, sessionId={}", userId, request.getSessionId(), e);
            throw new RuntimeException("处理消息失败: " + e.getMessage(), e);
        }
    }
    
    @Override
    public void processMessageStream(Long userId, ChatRequestDTO request, 
                                     StreamResponseHandler handler) {
        log.info("流式处理用户消息: userId={}, sessionId={}, message={}", 
                userId, request.getSessionId(), request.getMessage());
        
        try {
            String userMessage = request.getMessage();
            String sessionId = request.getSessionId();
            String messageId = "msg_" + System.currentTimeMillis();
            
            // 1. 识别用户意图
            IntentRecognizer.IntentRecognitionResult intentResult = 
                    intentRecognizer.recognize(userMessage, sessionId);
            
            String taskType = intentResult.getTaskType();
            if (taskType == null) {
                taskType = "CHAT";
            }
            
            // 2. 根据任务类型处理
            if ("CHAT".equalsIgnoreCase(taskType)) {
                // 聊天类型：流式调用大模型生成回复
                generateChatResponseStream(userId, userMessage, sessionId, messageId, handler);
            } else {
                // 其他类型：先执行任务，然后流式生成响应
                TaskPlanner.TaskPlan plan = taskPlanner.planTask(userMessage, sessionId);
                
                if (!taskPlanner.validateTask(plan)) {
                    ChatResponseDTO errorResponse = new ChatResponseDTO();
                    errorResponse.setSessionId(sessionId);
                    errorResponse.setMessageId(messageId);
                    errorResponse.setResponse("抱歉，我无法执行这个任务。任务计划验证失败。");
                    handler.handle(errorResponse);
                    return;
                }
                
                // 执行任务
                ExecutionEngine.ExecutionResult executionResult = 
                        executionEngine.execute(plan, sessionId);
                
                // 生成响应（目前不支持流式，发送完整响应）
                ResponseGenerator.ExecutionResult responseExecutionResult = 
                        convertToResponseExecutionResult(executionResult, plan);
                String responseText = responseGenerator.generate(responseExecutionResult, sessionId);
                
                ChatResponseDTO response = new ChatResponseDTO();
                response.setSessionId(sessionId);
                response.setMessageId(messageId);
                response.setResponse(responseText);
                handler.handle(response);
            }
            
        } catch (Exception e) {
            log.error("流式处理消息失败: userId={}, sessionId={}", userId, request.getSessionId(), e);
            throw new RuntimeException("流式处理消息失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 生成聊天回复（同步）
     */
    private String generateChatResponse(Long userId, String userMessage, String sessionId) {
        log.debug("生成聊天回复: userId={}, sessionId={}", userId, sessionId);
        
        try {
            // 获取会话历史（可选，目前简化处理）
            // List<Message> history = sessionService.getSessionMessages(sessionId);
            
            // 构建提示词
            String systemInstruction = "你是 Mentis，一个友好的智能助手。请用自然、友好的语言回复用户的问题。";
            
            // 调用大模型
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(userMessage);
            request.setSystemInstruction(systemInstruction);
            request.setTemperature(0.7);
            request.setMaxTokens(2000);
            
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            String responseText = response.getContent();
            log.debug("聊天回复生成完成: responseLength={}", 
                    responseText != null ? responseText.length() : 0);
            
            return responseText != null ? responseText : "抱歉，我无法生成回复。";
            
        } catch (Exception e) {
            log.error("生成聊天回复失败: userId={}, sessionId={}", userId, sessionId, e);
            return "抱歉，我在处理您的消息时遇到了问题：" + e.getMessage();
        }
    }
    
    /**
     * 流式生成聊天回复
     */
    private void generateChatResponseStream(Long userId, String userMessage, String sessionId, 
                                           String messageId, StreamResponseHandler handler) {
        log.debug("流式生成聊天回复: userId={}, sessionId={}, messageId={}", 
                userId, sessionId, messageId);
        
        try {
            String systemInstruction = "你是 Mentis，一个友好的智能助手。请用自然、友好的语言回复用户的问题。";
            
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(userMessage);
            request.setSystemInstruction(systemInstruction);
            request.setTemperature(0.7);
            request.setMaxTokens(2000);
            
            final StringBuilder[] fullResponse = {new StringBuilder()};
            final int[] chunkCount = {0};
            
            // 调用流式生成
            // 注意：根据 adapter 实现，response.getContent() 每次返回的是增量内容（delta），不是累积内容
            aiService.generateTextStream(userId, request, (response, done) -> {
                if (done) {
                    log.info("[MentisAgent] 流式生成完成，共处理 {} 个 chunks, 最终响应长度: {}", 
                            chunkCount[0], fullResponse[0].length());
                    return;
                }
                
                if (response != null && response.getContent() != null && !response.getContent().isEmpty()) {
                    // adapter 返回的是增量内容，直接追加
                    String deltaContent = response.getContent();
                    fullResponse[0].append(deltaContent);
                    chunkCount[0]++;
                    
                    // 发送累积的响应给前端
                    ChatResponseDTO partialResponse = new ChatResponseDTO();
                    partialResponse.setSessionId(sessionId);
                    partialResponse.setMessageId(messageId);
                    partialResponse.setResponse(fullResponse[0].toString());
                    handler.handle(partialResponse);
                    
                    if (chunkCount[0] <= 5 || chunkCount[0] % 10 == 0) {
                        log.info("[MentisAgent] 已发送 SSE chunk #{}, 增量长度: {}, 累积长度: {}, 预览: {}", 
                                chunkCount[0], 
                                deltaContent.length(), 
                                fullResponse[0].length(),
                                deltaContent.length() > 30 ? deltaContent.substring(0, 30) + "..." : deltaContent);
                    }
                }
            });
            
            log.debug("流式聊天回复生成完成: responseLength={}", fullResponse[0].length());
            
        } catch (Exception e) {
            log.error("流式生成聊天回复失败: userId={}, sessionId={}", userId, sessionId, e);
            
            ChatResponseDTO errorResponse = new ChatResponseDTO();
            errorResponse.setSessionId(sessionId);
            errorResponse.setMessageId(messageId);
            errorResponse.setResponse("抱歉，我在处理您的消息时遇到了问题：" + e.getMessage());
            handler.handle(errorResponse);
        }
    }
    
    /**
     * 转换执行结果为响应生成器所需的格式
     */
    private ResponseGenerator.ExecutionResult convertToResponseExecutionResult(
            ExecutionEngine.ExecutionResult executionResult, TaskPlanner.TaskPlan plan) {
        
        ResponseGenerator.ExecutionResult result = new ResponseGenerator.ExecutionResult();
        result.setStatus(executionResult.getStatus());
        result.setErrorMessage(executionResult.getErrorMessage());
        
        // 转换任务步骤结果为响应生成器格式
        if (plan.getSteps() != null && executionResult.getResult() != null) {
            java.util.List<ResponseGenerator.TaskResult> taskResults = new java.util.ArrayList<>();
            
            for (int i = 0; i < plan.getSteps().size(); i++) {
                TaskPlanner.TaskStep step = plan.getSteps().get(i);
                
                ResponseGenerator.TaskResult taskResult = new ResponseGenerator.TaskResult();
                taskResult.setTaskId(step.getStepId());
                taskResult.setDescription(step.getDescription());
                taskResult.setStatus("COMPLETED");
                
                // 简化处理：使用执行结果的一部分
                if (executionResult.getResult() != null && !executionResult.getResult().isEmpty()) {
                    String[] results = executionResult.getResult().split("\n");
                    if (i < results.length) {
                        taskResult.setResult(results[i]);
                    }
                }
                
                taskResults.add(taskResult);
            }
            
            result.setTaskResults(taskResults);
        }
        
        return result;
    }
}
