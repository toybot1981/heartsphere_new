package com.heartsphere.mentis.service;

import com.heartsphere.mentis.ai.service.AIService;
import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.agent.IntentRecognizer;
import com.heartsphere.mentis.agent.ResponseGenerator;
import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.executor.ExecutionEngine;
import com.heartsphere.mentis.executor.TaskPlanner;
import com.heartsphere.mentis.repository.MentisTaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private final MentisMessageService messageService;
    private final AIService aiService;
    // MCP Gateway 相关逻辑已禁用（MCP Gateway 是可选功能，避免阻塞执行）
    // 使用 @Autowired(required = false) 避免依赖注入失败
    // @Autowired(required = false)
    // private McpIntegrationService mcpIntegrationService;
    private final MentisTaskRepository taskRepository;
    private final SessionRealtimeService sessionRealtimeService;
    
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
                // MCP Gateway 相关逻辑已禁用（MCP Gateway 是可选功能，避免阻塞执行）
                // 聊天类型：直接使用普通对话处理
                // try {
                //     ChatResponseDTO mcpResponse = mcpIntegrationService.processMessageWithMcpTools(userId, request);
                //     if (mcpResponse != null && mcpResponse.getResponse() != null && 
                //         !mcpResponse.getResponse().equals("处理中...")) {
                //         return mcpResponse;
                //     }
                // } catch (Exception e) {
                //     log.warn("MCP 工具处理失败，回退到普通对话: {}", e.getMessage());
                // }
                // 直接使用普通对话
                responseText = generateChatResponse(userId, userMessage, sessionId);
            } else {
                // 其他类型：先清理该会话中未完成的任务，然后规划新任务
                clearPendingTasks(sessionId);
                
                // 保存用户消息，获取 messageId
                var userMessageEntity = messageService.saveMessage(sessionId, "USER", userMessage, "TEXT");
                String messageId = userMessageEntity.getMessageId();
                log.debug("保存用户消息: messageId={}", messageId);
                
                // 2.1 规划任务
                TaskPlanner.TaskPlan plan = taskPlanner.planTask(userMessage, sessionId);
                
                if (!taskPlanner.validateTask(plan)) {
                    responseText = "抱歉，我无法执行这个任务。任务计划验证失败。";
                } else {
                    // 2.2 执行任务（传入 messageId）
                    ExecutionEngine.ExecutionResult executionResult = 
                            executionEngine.execute(plan, sessionId, messageId);
                    
                    // 2.3 生成响应
                    ResponseGenerator.ExecutionResult responseExecutionResult = 
                            convertToResponseExecutionResult(executionResult, plan);
                    
                    log.info("开始生成响应: sessionId={}, executionStatus={}", 
                            sessionId, executionResult.getStatus());
                    log.debug("执行结果摘要: taskResults数量={}", 
                            responseExecutionResult.getTaskResults() != null ? responseExecutionResult.getTaskResults().size() : 0);
                    
                    responseText = responseGenerator.generate(responseExecutionResult, sessionId);
                    
                    log.info("响应生成完成: sessionId={}, responseLength={}, responsePreview={}", 
                            sessionId, 
                            responseText != null ? responseText.length() : 0,
                            responseText != null && responseText.length() > 100 ? 
                                    responseText.substring(0, 100) + "..." : responseText);
                    
                    // 确保响应文本不为空
                    if (responseText == null || responseText.trim().isEmpty()) {
                        log.warn("生成的响应为空，使用默认响应: sessionId={}", sessionId);
                        responseText = "任务执行完成，但未能生成详细回复。请查看任务进度了解执行结果。";
                    }
                    
                    // 将 executionId 保存到响应中，以便前端查询任务进度
                    ChatResponseDTO response = new ChatResponseDTO();
                    response.setMessageId("msg_" + System.currentTimeMillis());
                    response.setResponse(responseText);
                    response.setSessionId(sessionId);
                    response.setExecutionId(executionResult.getExecutionId());
                    response.setTaskStatus(executionResult.getStatus());
                    
                    // 保存助手响应消息到数据库
                    try {
                        messageService.saveMessage(sessionId, "MENTIS", responseText, "TEXT");
                        log.debug("保存助手响应消息到数据库: sessionId={}", sessionId);
                    } catch (Exception e) {
                        log.warn("保存助手响应消息失败（不影响响应返回）: sessionId={}", sessionId, e);
                    }
                    
                    log.info("任务执行完成: executionId={}, status={}, responseLength={}", 
                            executionResult.getExecutionId(), executionResult.getStatus(), responseText.length());
                    
                    return response;
                }
            }
            
            // 构建响应（普通对话）
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
            
            // 保存用户消息，获取 messageId
            var userMessageEntity = messageService.saveMessage(sessionId, "USER", userMessage, "TEXT");
            String messageId = userMessageEntity.getMessageId();
            log.debug("保存用户消息: messageId={}", messageId);
            
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
                // 其他类型：先清理该会话中未完成的任务，然后规划新任务
                clearPendingTasks(sessionId);
                
                // 执行任务
                TaskPlanner.TaskPlan plan = taskPlanner.planTask(userMessage, sessionId);
                
                if (!taskPlanner.validateTask(plan)) {
                    ChatResponseDTO errorResponse = new ChatResponseDTO();
                    errorResponse.setSessionId(sessionId);
                    errorResponse.setMessageId(messageId);
                    errorResponse.setResponse("抱歉，我无法执行这个任务。任务计划验证失败。");
                    handler.handle(errorResponse);
                    return;
                }
                
                // 执行任务（传入 messageId）
                ExecutionEngine.ExecutionResult executionResult = 
                        executionEngine.execute(plan, sessionId, messageId);
                
                // 生成响应（使用流式方式，实时返回给前端）
                ResponseGenerator.ExecutionResult responseExecutionResult = 
                        convertToResponseExecutionResult(executionResult, plan);
                
                log.info("开始流式生成响应: sessionId={}, messageId={}, executionStatus={}", 
                        sessionId, messageId, executionResult.getStatus());
                log.debug("执行结果摘要: taskResults数量={}", 
                        responseExecutionResult.getTaskResults() != null ? responseExecutionResult.getTaskResults().size() : 0);
                
                // 使用流式生成响应，实时返回给前端
                responseGenerator.generateStream(responseExecutionResult, sessionId, messageId, 
                        (chatResponse, done) -> {
                            chatResponse.setExecutionId(executionResult.getExecutionId());
                            chatResponse.setTaskStatus(executionResult.getStatus());
                            handler.handle(chatResponse);
                            
                            if (done) {
                                log.info("流式响应发送完成: sessionId={}, messageId={}", sessionId, messageId);
                            }
                        });
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
            String systemInstruction = "你是 Mentis，一个友好的智能助手。请用自然、友好的语言回复用户的问题。";
            
            // 获取会话历史消息（最近 20 条，避免上下文过长）
            List<com.heartsphere.mentis.entity.MentisMessage> historyMessages = 
                    messageService.getRecentMessages(sessionId, 20);
            
            // 转换为 AI 服务需要的消息格式
            List<TextGenerationRequest.Message> messages = new java.util.ArrayList<>();
            for (com.heartsphere.mentis.entity.MentisMessage msg : historyMessages) {
                TextGenerationRequest.Message aiMessage = new TextGenerationRequest.Message();
                // 转换角色：USER -> user, MENTIS -> assistant
                String role = "USER".equals(msg.getRole()) ? "user" : 
                             "MENTIS".equals(msg.getRole()) ? "assistant" : "user";
                aiMessage.setRole(role);
                aiMessage.setContent(msg.getContent());
                messages.add(aiMessage);
            }
            
            // 添加当前用户消息
            TextGenerationRequest.Message currentMessage = new TextGenerationRequest.Message();
            currentMessage.setRole("user");
            currentMessage.setContent(userMessage);
            messages.add(currentMessage);
            
            // 调用大模型
            TextGenerationRequest request = new TextGenerationRequest();
            request.setMessages(messages);
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
            
            // 获取会话历史消息（最近 20 条，避免上下文过长）
            List<com.heartsphere.mentis.entity.MentisMessage> historyMessages = 
                    messageService.getRecentMessages(sessionId, 20);
            
            // 转换为 AI 服务需要的消息格式
            List<TextGenerationRequest.Message> messages = new java.util.ArrayList<>();
            for (com.heartsphere.mentis.entity.MentisMessage msg : historyMessages) {
                TextGenerationRequest.Message aiMessage = new TextGenerationRequest.Message();
                // 转换角色：USER -> user, MENTIS -> assistant
                String role = "USER".equals(msg.getRole()) ? "user" : 
                             "MENTIS".equals(msg.getRole()) ? "assistant" : "user";
                aiMessage.setRole(role);
                aiMessage.setContent(msg.getContent());
                messages.add(aiMessage);
            }
            
            // 添加当前用户消息
            TextGenerationRequest.Message currentMessage = new TextGenerationRequest.Message();
            currentMessage.setRole("user");
            currentMessage.setContent(userMessage);
            messages.add(currentMessage);
            
            TextGenerationRequest request = new TextGenerationRequest();
            request.setMessages(messages);
            request.setSystemInstruction(systemInstruction);
            request.setTemperature(0.7);
            request.setMaxTokens(2000);
            
            final StringBuilder[] fullResponse = {new StringBuilder()};
            final int[] chunkCount = {0};
            
            // 调用流式生成
            // 注意：根据 adapter 实现，response.getContent() 可能返回增量内容（delta）或完整内容
            aiService.generateTextStream(userId, request, (response, done) -> {
                if (response != null && response.getContent() != null && !response.getContent().isEmpty()) {
                    // 如果 done=false，表示这是增量内容或中间响应
                    // 如果 done=true，表示这是最终响应
                    String content = response.getContent();
                    
                    if (!done) {
                        // 增量内容：追加到累积响应中
                        fullResponse[0].append(content);
                        chunkCount[0]++;
                    } else {
                        // 最终响应：如果累积响应为空，使用最终响应；否则使用累积响应
                        if (fullResponse[0].length() == 0) {
                            fullResponse[0].append(content);
                        }
                    }
                    
                    // 发送累积的响应给前端
                    ChatResponseDTO partialResponse = new ChatResponseDTO();
                    partialResponse.setSessionId(sessionId);
                    partialResponse.setMessageId(messageId);
                    partialResponse.setResponse(fullResponse[0].toString());
                    handler.handle(partialResponse);
                    
                    if (!done && (chunkCount[0] <= 5 || chunkCount[0] % 10 == 0)) {
                        log.info("[MentisAgent] 已发送 SSE chunk #{}, 增量长度: {}, 累积长度: {}, 预览: {}", 
                                chunkCount[0], 
                                content.length(), 
                                fullResponse[0].length(),
                                content.length() > 30 ? content.substring(0, 30) + "..." : content);
                    }
                }
                
                if (done) {
                    log.info("[MentisAgent] 流式生成完成，共处理 {} 个 chunks, 最终响应长度: {}", 
                            chunkCount[0], fullResponse[0].length());
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
            
            // 将执行结果按行分割（每个步骤的结果占一行）
            String[] resultLines = executionResult.getResult().split("\n");
            
            for (int i = 0; i < plan.getSteps().size(); i++) {
                TaskPlanner.TaskStep step = plan.getSteps().get(i);
                
                ResponseGenerator.TaskResult taskResult = new ResponseGenerator.TaskResult();
                taskResult.setTaskId(step.getStepId());
                taskResult.setDescription(step.getDescription());
                taskResult.setStatus("COMPLETED");
                
                // 获取该步骤的执行结果
                // 如果结果行数少于步骤数，使用最后一行或空字符串
                if (i < resultLines.length) {
                    // 使用该步骤对应的结果行
                    String stepResult = resultLines[i];
                    // 如果结果很长（比如包含页面内容），保留完整内容
                    taskResult.setResult(stepResult);
                } else if (resultLines.length > 0) {
                    // 如果步骤数多于结果行数，使用最后一行（可能是合并的结果）
                    taskResult.setResult(resultLines[resultLines.length - 1]);
                } else {
                    // 如果没有结果，使用空字符串
                    taskResult.setResult("");
                }
                
                taskResults.add(taskResult);
            }
            
            // 如果结果行数多于步骤数，将多余的结果合并到最后一个步骤
            if (resultLines.length > plan.getSteps().size() && !taskResults.isEmpty()) {
                StringBuilder mergedResult = new StringBuilder();
                if (taskResults.get(taskResults.size() - 1).getResult() != null) {
                    mergedResult.append(taskResults.get(taskResults.size() - 1).getResult());
                }
                for (int i = plan.getSteps().size(); i < resultLines.length; i++) {
                    if (mergedResult.length() > 0) {
                        mergedResult.append("\n");
                    }
                    mergedResult.append(resultLines[i]);
                }
                taskResults.get(taskResults.size() - 1).setResult(mergedResult.toString());
            }
            
            result.setTaskResults(taskResults);
        }
        
        return result;
    }
    
    /**
     * 清理会话中未完成的任务（PENDING 或 RUNNING 状态）
     * 当用户发起新问题时，取消之前的任务
     */
    private void clearPendingTasks(String sessionId) {
        try {
            // 查找会话中所有未完成的任务
            var session = sessionService.getSession(sessionId);
            if (session == null) {
                log.warn("会话不存在，无法清理任务: sessionId={}", sessionId);
                return;
            }
            
            List<com.heartsphere.mentis.entity.MentisTask> pendingTasks = 
                    taskRepository.findBySession_IdAndStatusOrderByCreatedAtDesc(
                            session.getId(), "PENDING");
            List<com.heartsphere.mentis.entity.MentisTask> runningTasks = 
                    taskRepository.findBySession_IdAndStatusOrderByCreatedAtDesc(
                            session.getId(), "RUNNING");
            
            List<com.heartsphere.mentis.entity.MentisTask> tasksToCancel = new ArrayList<>();
            tasksToCancel.addAll(pendingTasks);
            tasksToCancel.addAll(runningTasks);
            
            if (!tasksToCancel.isEmpty()) {
                log.info("清理会话中的未完成任务: sessionId={}, count={}", sessionId, tasksToCancel.size());
                
                // 取消所有未完成的任务
                for (com.heartsphere.mentis.entity.MentisTask task : tasksToCancel) {
                    task.setStatus("CANCELLED");
                    task.setCompletedAt(java.time.LocalDateTime.now());
                    task.setErrorMessage("用户发起新问题，任务已取消");
                    taskRepository.save(task);
                    
                    // 通过SSE通知前端任务被取消
                    Map<String, Object> taskCancelledData = new HashMap<>();
                    taskCancelledData.put("taskId", task.getTaskId());
                    taskCancelledData.put("status", "CANCELLED");
                    taskCancelledData.put("completedAt", task.getCompletedAt());
                    taskCancelledData.put("errorMessage", task.getErrorMessage());
                    sessionRealtimeService.sendEvent(sessionId, "task_status_changed", taskCancelledData);
                    
                    log.debug("任务已取消: taskId={}, description={}", task.getTaskId(), task.getDescription());
                }
                
                // 发送一个清理事件，通知前端清空任务列表
                Map<String, Object> tasksClearedData = new HashMap<>();
                tasksClearedData.put("action", "clear");
                tasksClearedData.put("message", "用户发起新问题，已清理之前的任务");
                sessionRealtimeService.sendEvent(sessionId, "tasks_cleared", tasksClearedData);
            }
        } catch (Exception e) {
            log.error("清理未完成任务失败: sessionId={}", sessionId, e);
            // 不抛出异常，避免影响主流程
        }
    }
}
