package com.heartsphere.mentis.service;

import com.heartsphere.mentis.dto.ChatRequestDTO;
import com.heartsphere.mentis.dto.ChatResponseDTO;
import com.heartsphere.mentis.service.McpToolAdapter.FunctionDefinition;
import com.heartsphere.mentis.service.McpToolAdapter.ToolExecutionResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * MCP 集成服务
 * 在对话处理中集成 MCP 工具调用
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class McpIntegrationService {

    private final McpToolAdapter mcpToolAdapter;
    private final com.heartsphere.mentis.ai.service.AIService aiService;

    /**
     * 处理带 MCP 工具的消息
     */
    public ChatResponseDTO processMessageWithMcpTools(Long userId, ChatRequestDTO request) {
        String userMessage = request.getMessage();
        String sessionId = request.getSessionId();
        
        log.info("处理带 MCP 工具的消息: userId={}, sessionId={}", userId, sessionId);
        
        // 1. 获取可用的 MCP 工具
        List<FunctionDefinition> availableTools = mcpToolAdapter.getAvailableTools();
        log.debug("可用 MCP 工具数量: {}", availableTools.size());
        
        if (availableTools.isEmpty()) {
            log.debug("没有可用的 MCP 工具，使用普通对话处理");
            return processNormalChat(userId, request);
        }
        
        // 2. 将工具转换为 AI 服务可用的格式
        List<Map<String, Object>> functionDefinitions = convertToolsToFunctionDefinitions(availableTools);
        
        // 3. 检测是否需要自动调用工具（基于用户消息）
        List<ToolCall> toolCalls = detectToolCallsFromUserMessage(userMessage, availableTools);
        
        // 4. 如果没有自动检测到工具调用，调用 AI 服务让 AI 决定
        String aiResponse = null;
        if (toolCalls.isEmpty()) {
            aiResponse = callAIWithTools(userMessage, sessionId, functionDefinitions);
            // 检查 AI 响应中是否包含工具调用
            toolCalls = extractToolCalls(aiResponse);
        } else {
            // 如果已经检测到工具调用，生成一个简单的 AI 响应
            aiResponse = "我将为您搜索相关信息。";
        }
        
        if (toolCalls.isEmpty()) {
            // 没有工具调用，直接返回 AI 响应
            ChatResponseDTO response = new ChatResponseDTO();
            response.setMessageId("msg_" + System.currentTimeMillis());
            response.setResponse(aiResponse);
            response.setSessionId(sessionId);
            return response;
        }
        
        // 5. 执行工具调用
        List<ToolResult> toolResults = executeToolCalls(toolCalls, availableTools);
        
        // 6. 将工具结果反馈给 AI，生成最终响应
        String finalResponse = generateFinalResponse(userMessage, aiResponse, toolResults, sessionId);
        
        ChatResponseDTO response = new ChatResponseDTO();
        response.setMessageId("msg_" + System.currentTimeMillis());
        response.setResponse(finalResponse);
        response.setSessionId(sessionId);
        
        return response;
    }

    /**
     * 普通对话处理（无工具）
     */
    private ChatResponseDTO processNormalChat(Long userId, ChatRequestDTO request) {
        // 这里可以调用现有的对话服务
        // 暂时返回简单响应
        ChatResponseDTO response = new ChatResponseDTO();
        response.setMessageId("msg_" + System.currentTimeMillis());
        response.setResponse("处理中...");
        response.setSessionId(request.getSessionId());
        return response;
    }

    /**
     * 将工具转换为函数定义格式
     */
    private List<Map<String, Object>> convertToolsToFunctionDefinitions(List<FunctionDefinition> tools) {
        List<Map<String, Object>> functions = new ArrayList<>();
        
        for (FunctionDefinition tool : tools) {
            Map<String, Object> function = new HashMap<>();
            function.put("name", tool.getName());
            function.put("description", tool.getDescription());
            function.put("parameters", tool.getParameters());
            functions.add(function);
        }
        
        return functions;
    }

    /**
     * 调用 AI 服务（带工具）
     */
    private String callAIWithTools(String userMessage, String sessionId, List<Map<String, Object>> functions) {
        try {
            log.debug("调用 AI 服务，工具数量: {}", functions.size());
            
            // 构建 AI 请求
            com.heartsphere.mentis.ai.dto.request.TextGenerationRequest request = 
                    new com.heartsphere.mentis.ai.dto.request.TextGenerationRequest();
            request.setProvider("dashscope");
            request.setModel("qwen-max");
            request.setPrompt(userMessage);
            
            // 添加工具定义到请求中（如果 AI 服务支持）
            // 注意：这里需要根据实际的 AI 服务接口调整
            // 如果 AI 服务支持函数调用，应该在这里传入 functions
            
            // 调用 AI 服务
            com.heartsphere.mentis.ai.dto.response.TextGenerationResponse response = 
                    aiService.generateText(1L, request);
            
            return response.getContent() != null ? response.getContent() : "无响应";
        } catch (Exception e) {
            log.error("调用 AI 服务失败", e);
            return "抱歉，AI 服务调用失败。";
        }
    }

    /**
     * 从 AI 响应中提取工具调用
     */
    private List<ToolCall> extractToolCalls(String aiResponse) {
        List<ToolCall> toolCalls = new ArrayList<>();
        
        // 简单的工具调用提取逻辑
        // 实际实现应该解析 AI 返回的 JSON 格式的工具调用
        Pattern pattern = Pattern.compile("调用工具[：:](\\w+)\\(([^)]+)\\)");
        Matcher matcher = pattern.matcher(aiResponse);
        
        while (matcher.find()) {
            String toolName = matcher.group(1);
            String argsStr = matcher.group(2);
            
            Map<String, Object> arguments = parseArguments(argsStr);
            
            ToolCall toolCall = new ToolCall();
            toolCall.setToolName(toolName);
            toolCall.setArguments(arguments);
            toolCalls.add(toolCall);
        }
        
        return toolCalls;
    }

    /**
     * 解析工具参数
     */
    private Map<String, Object> parseArguments(String argsStr) {
        Map<String, Object> arguments = new HashMap<>();
        // 简单的参数解析，实际应该使用 JSON 解析
        if (argsStr.contains("query=")) {
            String query = argsStr.substring(argsStr.indexOf("query=") + 6);
            if (query.contains(",")) {
                query = query.substring(0, query.indexOf(","));
            }
            arguments.put("query", query.trim());
        }
        return arguments;
    }
    
    /**
     * 检测是否需要自动调用工具（基于用户消息内容）
     */
    private List<ToolCall> detectToolCallsFromUserMessage(String userMessage, List<FunctionDefinition> availableTools) {
        List<ToolCall> toolCalls = new ArrayList<>();
        
        // 检测搜索意图
        if (needsSearch(userMessage)) {
            // 查找 Tavily 搜索工具
            for (FunctionDefinition tool : availableTools) {
                if (tool.getMcpToolName() != null && 
                    (tool.getMcpToolName().contains("search") || tool.getMcpToolName().contains("tavily"))) {
                    ToolCall toolCall = new ToolCall();
                    toolCall.setToolName(tool.getName());
                    
                    // 从用户消息中提取搜索关键词
                    String query = extractSearchQuery(userMessage);
                    Map<String, Object> arguments = new HashMap<>();
                    arguments.put("query", query);
                    toolCall.setArguments(arguments);
                    
                    toolCalls.add(toolCall);
                    log.info("自动检测到搜索意图，将调用工具: {}, 关键词: {}", tool.getName(), query);
                    break;
                }
            }
        }
        
        return toolCalls;
    }
    
    /**
     * 判断是否需要搜索
     */
    private boolean needsSearch(String message) {
        String lowerMessage = message.toLowerCase();
        // 搜索相关的关键词
        String[] searchKeywords = {
            "搜索", "查询", "查找", "找", "搜", "search", "find", "lookup",
            "最新", "最近", "现在", "当前", "实时", "最新消息", "新闻"
        };
        
        for (String keyword : searchKeywords) {
            if (lowerMessage.contains(keyword)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 从用户消息中提取搜索关键词
     */
    private String extractSearchQuery(String message) {
        // 简单的关键词提取逻辑
        // 移除常见的搜索提示词
        String query = message;
        query = query.replaceAll("(请|帮我|帮我|帮我|能否|可以|想要)?(搜索|查询|查找|找|搜)", "");
        query = query.replaceAll("(一下|一下|一下|一下)", "");
        query = query.trim();
        
        // 如果提取的关键词太短，使用整个消息
        if (query.length() < 3) {
            query = message;
        }
        
        return query;
    }

    /**
     * 执行工具调用
     */
    private List<ToolResult> executeToolCalls(List<ToolCall> toolCalls, List<FunctionDefinition> availableTools) {
        List<ToolResult> results = new ArrayList<>();
        
        for (ToolCall toolCall : toolCalls) {
            try {
                ToolExecutionResult result = mcpToolAdapter.executeTool(
                        toolCall.getToolName(), 
                        toolCall.getArguments()
                );
                
                ToolResult toolResult = new ToolResult();
                toolResult.setToolName(toolCall.getToolName());
                toolResult.setSuccess(result.isSuccess());
                toolResult.setResult(result.getResult());
                toolResult.setMessage(result.getMessage());
                results.add(toolResult);
            } catch (Exception e) {
                log.error("执行工具调用失败: {}", toolCall.getToolName(), e);
                ToolResult toolResult = new ToolResult();
                toolResult.setToolName(toolCall.getToolName());
                toolResult.setSuccess(false);
                toolResult.setMessage("执行失败: " + e.getMessage());
                results.add(toolResult);
            }
        }
        
        return results;
    }

    /**
     * 生成最终响应（将工具结果反馈给 AI）
     */
    private String generateFinalResponse(String userMessage, String aiResponse, 
                                        List<ToolResult> toolResults, String sessionId) {
        try {
            // 构建包含工具结果的提示
            StringBuilder contextBuilder = new StringBuilder();
            contextBuilder.append("用户问题: ").append(userMessage).append("\n\n");
            contextBuilder.append("AI 初始响应: ").append(aiResponse).append("\n\n");
            contextBuilder.append("工具执行结果:\n");
            
            for (ToolResult result : toolResults) {
                if (result.isSuccess()) {
                    contextBuilder.append("- ").append(result.getToolName())
                            .append(": 执行成功\n");
                    if (result.getResult() != null) {
                        // 格式化工具结果
                        String resultStr = formatToolResult(result.getResult());
                        contextBuilder.append("  结果: ").append(resultStr).append("\n");
                    }
                } else {
                    contextBuilder.append("- ").append(result.getToolName())
                            .append(": 执行失败 - ").append(result.getMessage()).append("\n");
                }
            }
            
            contextBuilder.append("\n请基于以上工具执行结果，生成最终的回答。");
            
            // 调用 AI 服务生成最终响应
            com.heartsphere.mentis.ai.dto.request.TextGenerationRequest request = 
                    new com.heartsphere.mentis.ai.dto.request.TextGenerationRequest();
            request.setProvider("dashscope");
            request.setModel("qwen-max");
            request.setPrompt(contextBuilder.toString());
            request.setSystemInstruction("你是一个智能助手。请根据工具执行结果，生成清晰、准确的回答。");
            
            com.heartsphere.mentis.ai.dto.response.TextGenerationResponse response = 
                    aiService.generateText(1L, request);
            
            return response.getContent() != null ? response.getContent() : aiResponse;
        } catch (Exception e) {
            log.error("生成最终响应失败", e);
            // 回退到简单拼接
            StringBuilder responseBuilder = new StringBuilder();
            responseBuilder.append(aiResponse).append("\n\n");
            for (ToolResult result : toolResults) {
                if (result.isSuccess() && result.getResult() != null) {
                    responseBuilder.append("工具执行结果: ").append(formatToolResult(result.getResult()));
                }
            }
            return responseBuilder.toString();
        }
    }
    
    /**
     * 格式化工具结果
     */
    private String formatToolResult(Map<String, Object> result) {
        if (result == null) {
            return "无结果";
        }
        
        // 尝试提取文本内容
        Object content = result.get("content");
        if (content != null) {
            if (content instanceof String) {
                return (String) content;
            } else if (content instanceof List) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> contentList = (List<Map<String, Object>>) content;
                StringBuilder sb = new StringBuilder();
                int index = 1;
                for (Map<String, Object> item : contentList) {
                    Object text = item.get("text");
                    if (text != null) {
                        sb.append("\n【结果 ").append(index++).append("】\n");
                        sb.append(text).append("\n");
                    }
                }
                return sb.toString().trim();
            }
        }
        
        // 检查是否有其他常见的结果字段
        if (result.containsKey("results")) {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> results = (List<Map<String, Object>>) result.get("results");
            if (results != null) {
                StringBuilder sb = new StringBuilder();
                int index = 1;
                for (Map<String, Object> item : results) {
                    sb.append("\n【结果 ").append(index++).append("】\n");
                    if (item.containsKey("title")) {
                        sb.append("标题: ").append(item.get("title")).append("\n");
                    }
                    if (item.containsKey("url")) {
                        sb.append("链接: ").append(item.get("url")).append("\n");
                    }
                    if (item.containsKey("content")) {
                        String contentStr = String.valueOf(item.get("content"));
                        // 限制内容长度
                        if (contentStr.length() > 500) {
                            contentStr = contentStr.substring(0, 500) + "...";
                        }
                        sb.append("内容: ").append(contentStr).append("\n");
                    }
                }
                return sb.toString().trim();
            }
        }
        
        // 如果无法提取，返回 JSON 字符串
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            return mapper.writeValueAsString(result);
        } catch (Exception e) {
            return result.toString();
        }
    }

    /**
     * 工具调用
     */
    @lombok.Data
    public static class ToolCall {
        private String toolName;
        private Map<String, Object> arguments;
    }

    /**
     * 工具执行结果
     */
    @lombok.Data
    public static class ToolResult {
        private String toolName;
        private boolean success;
        private Map<String, Object> result;
        private String message;
    }
}
