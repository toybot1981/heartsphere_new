package com.heartsphere.mentis.agent.impl;

import com.heartsphere.mentis.ai.dto.request.TextGenerationRequest;
import com.heartsphere.mentis.ai.dto.response.TextGenerationResponse;
import com.heartsphere.mentis.ai.service.AIService;
import com.heartsphere.mentis.ai.util.StreamResponseHandler;
import com.heartsphere.mentis.agent.ResponseGenerator;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.service.MentisMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

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
    private final MentisMessageService messageService;
    
    private static final String RESPONSE_GENERATION_PROMPT = """
        你是一个智能助手 Mentis。请根据任务执行结果，生成友好的自然语言响应返回给用户。
        
        执行结果：
        {executionResult}
        
        请仔细分析执行结果，特别是：
        1. 如果任务涉及网页访问（如天气查询、股票查询等），请从页面内容中提取关键信息
        2. 如果页面内容中包含用户需要的信息（如明天的天气预报），请直接提取并回答
        3. 如果任务成功，请详细说明结果，包括从页面中提取的具体信息
        4. 如果任务失败，友好地解释原因
        
        对于天气查询任务：
        - 如果页面内容中包含天气预报信息，请提取并回答用户的问题
        - 如果页面只显示当前天气，请说明需要进一步操作（如点击"明天"标签）才能获取明天的天气预报
        - 请用自然、友好的语言回答，就像在和用户聊天一样
        """;
    
    @Override
    public String generate(ExecutionResult executionResult, String sessionId) {
        log.info("生成响应: sessionId={}, status={}", sessionId, executionResult.getStatus());
        
        try {
            // 构建 Prompt（直接使用硬编码，mentis项目的提示词不在admin中管理）
            String executionSummary = buildExecutionSummary(executionResult);
            log.debug("执行结果摘要长度: sessionId={}, summaryLength={}", sessionId, executionSummary.length());
            log.debug("执行结果摘要内容: sessionId={}, summary={}", sessionId, 
                    executionSummary.length() > 500 ? executionSummary.substring(0, 500) + "..." : executionSummary);
            
            String prompt = RESPONSE_GENERATION_PROMPT.replace("{executionResult}", executionSummary);
            
            // 调用 LLM
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是 Mentis，一个友好的智能助手。请用自然、友好的语言回复用户。");
            request.setTemperature(0.7);
            request.setMaxTokens(2000);  // 增加token数量，确保能够处理较长的执行结果
            
            // TODO: 获取真实的 userId
            Long userId = 1L;
            log.debug("调用 AI 服务生成响应: sessionId={}, promptLength={}", sessionId, prompt.length());
            TextGenerationResponse response = aiService.generateText(userId, request);
            
            String content = response != null ? response.getContent() : null;
            log.info("AI 服务返回响应: sessionId={}, contentLength={}, contentPreview={}", 
                    sessionId, 
                    content != null ? content.length() : 0,
                    content != null && content.length() > 100 ? content.substring(0, 100) + "..." : content);
            
            if (content == null || content.trim().isEmpty()) {
                log.warn("AI 服务返回的响应为空: sessionId={}", sessionId);
                return generateDefaultResponse(executionResult);
            }
            
            return content;
            
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
                if (taskResult.getResult() != null && !taskResult.getResult().trim().isEmpty()) {
                    // 保留完整的执行结果，特别是页面内容
                    String stepResult = taskResult.getResult();
                    // 如果结果很长，保留前5000个字符（确保包含页面内容）
                    if (stepResult.length() > 5000) {
                        summary.append("  结果: ").append(stepResult.substring(0, 5000))
                               .append("\n   ... (结果较长，已截断) ...\n");
                    } else {
                        summary.append("  结果: ").append(stepResult).append("\n");
                    }
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
    
    @Override
    public void generateStream(ExecutionResult executionResult, String sessionId, String messageId,
                              StreamResponseHandler<ChatResponseDTO> handler) {
        log.info("流式生成响应: sessionId={}, messageId={}, status={}", 
                sessionId, messageId, executionResult.getStatus());
        
        try {
            // 构建 Prompt
            String executionSummary = buildExecutionSummary(executionResult);
            log.debug("执行结果摘要长度: sessionId={}, summaryLength={}", sessionId, executionSummary.length());
            
            String prompt = RESPONSE_GENERATION_PROMPT.replace("{executionResult}", executionSummary);
            
            // 调用流式 LLM
            TextGenerationRequest request = new TextGenerationRequest();
            request.setPrompt(prompt);
            request.setSystemInstruction("你是 Mentis，一个友好的智能助手。请用自然、友好的语言回复用户。");
            request.setTemperature(0.7);
            request.setMaxTokens(2000);
            
            // TODO: 获取真实的 userId
            Long userId = 1L;
            
            final StringBuilder[] fullResponse = {new StringBuilder()};
            final int[] chunkCount = {0};
            
            log.debug("调用 AI 服务流式生成响应: sessionId={}, messageId={}, promptLength={}", 
                    sessionId, messageId, prompt.length());
            
            // 调用流式生成
            aiService.generateTextStream(userId, request, (response, done) -> {
                if (response != null && response.getContent() != null && !response.getContent().isEmpty()) {
                    String content = response.getContent();
                    chunkCount[0]++;
                    
                    // 累积完整响应
                    fullResponse[0].append(content);
                    
                    // 创建响应 DTO
                    ChatResponseDTO chatResponse = new ChatResponseDTO();
                    chatResponse.setSessionId(sessionId);
                    chatResponse.setMessageId(messageId);
                    chatResponse.setResponse(content); // 发送增量内容
                    chatResponse.setTaskStatus(executionResult.getStatus());
                    
                    // 发送增量响应到前端
                    handler.handle(chatResponse, done);
                    
                    if (done) {
                        log.info("流式响应生成完成: sessionId={}, messageId={}, totalChunks={}, totalLength={}", 
                                sessionId, messageId, chunkCount[0], fullResponse[0].length());
                        
                        // 保存完整响应到数据库
                        try {
                            if (fullResponse[0].length() > 0) {
                                messageService.saveMessage(sessionId, "MENTIS", fullResponse[0].toString(), "TEXT");
                                log.debug("保存完整响应到数据库: sessionId={}, messageId={}, length={}", 
                                        sessionId, messageId, fullResponse[0].length());
                            }
                        } catch (Exception e) {
                            log.warn("保存完整响应失败: sessionId={}, messageId={}", sessionId, messageId, e);
                        }
                    }
                } else if (done) {
                    // 如果 done=true 但没有内容，可能是错误或空响应
                    log.warn("流式响应完成但没有内容: sessionId={}, messageId={}", sessionId, messageId);
                    
                    String defaultResponse = generateDefaultResponse(executionResult);
                    ChatResponseDTO chatResponse = new ChatResponseDTO();
                    chatResponse.setSessionId(sessionId);
                    chatResponse.setMessageId(messageId);
                    chatResponse.setResponse(defaultResponse);
                    chatResponse.setTaskStatus(executionResult.getStatus());
                    
                    handler.handle(chatResponse, true);
                }
            });
            
        } catch (Exception e) {
            log.error("流式生成响应失败: sessionId={}, messageId={}", sessionId, messageId, e);
            
            // 发送错误响应
            String errorResponse = generateDefaultResponse(executionResult);
            ChatResponseDTO chatResponse = new ChatResponseDTO();
            chatResponse.setSessionId(sessionId);
            chatResponse.setMessageId(messageId);
            chatResponse.setResponse(errorResponse);
            chatResponse.setTaskStatus(executionResult.getStatus());
            
            handler.handle(chatResponse, true);
        }
    }
}
