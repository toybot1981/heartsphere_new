package com.heartsphere.memory.service.hsmem;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heartsphere.memory.config.MemoryProperties;
import com.heartsphere.memory.dto.hsmem.*;
import com.heartsphere.memory.util.HSMemLogHelper;
import com.heartsphere.memory.util.PerformanceLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * HSMem 客户端服务
 * 负责调用 hsmem Python 服务，提供记忆化、检索等功能
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HSMemClientService {
    
    private final WebClient webClient;
    private final MemoryProperties memoryProperties;
    private final ObjectMapper objectMapper;
    
    /**
     * 获取 hsmem 服务基础URL
     */
    private String getBaseUrl() {
        return memoryProperties.getHsmem().getBaseUrl();
    }
    
    /**
     * 获取请求超时时间
     */
    private Duration getTimeout() {
        return Duration.ofSeconds(memoryProperties.getHsmem().getTimeout());
    }
    
    /**
     * 获取慢请求阈值（毫秒）
     */
    private long getSlowRequestThresholdMs() {
        return memoryProperties.getHsmem().getSlowRequestThresholdMs();
    }
    
    /**
     * 获取重试配置
     */
    private MemoryProperties.HSMem.Retry getRetryConfig() {
        return memoryProperties.getHsmem().getRetry();
    }
    
    /**
     * 记忆化对话
     * 
     * @param request 对话记忆化请求
     * @return 记忆化响应
     */
    public HSMemResponse.MemorizeData memorizeConversation(HSMemConversationRequest request) {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "memorizeConversation";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文（用于日志记录）
        Map<String, Object> context = new HashMap<>();
        context.put("userId", request.getUser_id());
        context.put("agentId", request.getAgent_id());
        context.put("messageCount", request.getMessages() != null ? request.getMessages().size() : 0);
        context.put("url", "/api/v1/memory/memorize/conversation");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.MemorizeData> response = webClient.post()
                .uri(getBaseUrl() + "/api/v1/memory/memorize/conversation")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.MemorizeData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                
                // 记录性能日志
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("记忆化对话失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("记忆化对话失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 记忆化文本
     * 
     * @param request 文本记忆化请求
     * @return 记忆化响应
     */
    public HSMemResponse.MemorizeData memorizeText(HSMemTextRequest request) {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "memorizeText";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("userId", request.getUser_id());
        context.put("textLength", request.getText() != null ? request.getText().length() : 0);
        context.put("url", "/api/v1/memory/memorize/text");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.MemorizeData> response = webClient.post()
                .uri(getBaseUrl() + "/api/v1/memory/memorize/text")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.MemorizeData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("记忆化文本失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("记忆化文本失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 记忆化文档
     * 
     * @param request 文档记忆化请求
     * @return 记忆化响应
     */
    public HSMemResponse.MemorizeData memorizeDocument(HSMemDocumentRequest request) {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "memorizeDocument";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("userId", request.getUser_id());
        context.put("title", request.getTitle());
        context.put("contentLength", request.getContent() != null ? request.getContent().length() : 0);
        context.put("url", "/api/v1/memory/memorize/document");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.MemorizeData> response = webClient.post()
                .uri(getBaseUrl() + "/api/v1/memory/memorize/document")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.MemorizeData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("记忆化文档失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("记忆化文档失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 检索记忆
     * 
     * @param request 检索请求
     * @return 检索响应
     */
    public HSMemResponse.RetrieveData retrieve(HSMemRetrieveRequest request) {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "retrieve";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("queryCount", request.getQueries() != null ? request.getQueries().size() : 0);
        context.put("where", request.getWhere());
        context.put("limit", request.getLimit());
        context.put("url", "/api/v1/memory/retrieve");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.RetrieveData> response = webClient.post()
                .uri(getBaseUrl() + "/api/v1/memory/retrieve")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.RetrieveData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("检索记忆失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("检索记忆失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取统计信息
     * 
     * @return 统计信息
     */
    public HSMemResponse.StatisticsData getStatistics() {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "getStatistics";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("url", "/api/v1/memory/statistics");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.StatisticsData> response = webClient.get()
                .uri(getBaseUrl() + "/api/v1/memory/statistics")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.StatisticsData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("获取统计信息失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("获取统计信息失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取所有分类
     * 
     * @return 分类列表响应
     */
    public HSMemResponse.CategoriesData getCategories() {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "getCategories";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("url", "/api/v1/memory/categories");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.CategoriesData> response = webClient.get()
                .uri(getBaseUrl() + "/api/v1/memory/categories")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.CategoriesData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("获取分类列表失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("获取分类列表失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取所有记忆项
     * 
     * @param userId 用户ID（可选）
     * @return 记忆项列表响应
     */
    public HSMemResponse.ItemsData getItems(String userId) {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "getItems";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("userId", userId);
        context.put("url", "/api/v1/memory/items");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 构建请求URL
            String url = getBaseUrl() + "/api/v1/memory/items";
            if (userId != null && !userId.isEmpty()) {
                url += "?user_id=" + userId;
            }
            
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.ItemsData> response = webClient.get()
                .uri(url)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.ItemsData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("获取记忆项列表失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("获取记忆项列表失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 获取所有资源
     * 
     * @return 资源列表响应
     */
    public HSMemResponse.ResourcesData getResources() {
        String requestId = HSMemLogHelper.generateRequestId();
        String operation = "getResources";
        PerformanceLogger perfLogger = PerformanceLogger.start(requestId, getSlowRequestThresholdMs());
        
        // 构建请求上下文
        Map<String, Object> context = new HashMap<>();
        context.put("url", "/api/v1/memory/resources");
        
        // 记录请求开始日志
        HSMemLogHelper.logRequest(operation, requestId, context);
        
        try {
            // 调用 hsmem API
            HSMemResponse<HSMemResponse.ResourcesData> response = webClient.get()
                .uri(getBaseUrl() + "/api/v1/memory/resources")
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<HSMemResponse<HSMemResponse.ResourcesData>>() {})
                .timeout(getTimeout())
                .retryWhen(buildRetrySpec(operation, requestId))
                .block();
            
            // 计算耗时
            long durationMs = perfLogger.end(response != null && Boolean.TRUE.equals(response.getSuccess()));
            
            // 记录响应日志
            if (response != null && Boolean.TRUE.equals(response.getSuccess()) && response.getData() != null) {
                HSMemLogHelper.logResponse(operation, requestId, true, response.getData(), durationMs);
                boolean isSlow = perfLogger.isSlowRequest(durationMs);
                HSMemLogHelper.logPerformance(operation, requestId, durationMs, isSlow);
                return response.getData();
            } else {
                String errorMsg = response != null ? response.getError() : "响应为空";
                HSMemLogHelper.logError(operation, requestId, 
                    new RuntimeException(errorMsg), context, durationMs);
                throw new RuntimeException("获取资源列表失败: " + errorMsg);
            }
            
        } catch (WebClientResponseException e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            log.error("[HSMemClient] {} - HTTP错误 | requestId={}, status={}, body={}", 
                operation, requestId, e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("调用 hsmem 服务失败: " + e.getMessage(), e);
        } catch (Exception e) {
            long durationMs = perfLogger.end(false);
            HSMemLogHelper.logError(operation, requestId, e, context, durationMs);
            throw new RuntimeException("获取资源列表失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 构建重试配置
     * 
     * @param operation 操作名称
     * @param requestId 请求ID
     * @return Retry 配置
     */
    private Retry buildRetrySpec(String operation, String requestId) {
        MemoryProperties.HSMem.Retry retryConfig = getRetryConfig();
        
        if (!retryConfig.isEnabled()) {
            return Retry.max(0);
        }
        
        return Retry.backoff(retryConfig.getMaxAttempts(), Duration.ofSeconds(retryConfig.getBackoff()))
            .filter(throwable -> {
                // 仅对连接相关的错误进行重试
                String message = throwable.getMessage() != null ? throwable.getMessage().toLowerCase() : "";
                boolean shouldRetry = message.contains("connection refused") ||
                    message.contains("connection reset") ||
                    message.contains("connection timeout") ||
                    message.contains("connection closed") ||
                    throwable instanceof java.net.ConnectException ||
                    throwable instanceof java.net.SocketTimeoutException;
                
                if (shouldRetry) {
                    log.warn("[HSMemClient] {} - 检测到连接错误，将重试 | requestId={}, error={}", 
                        operation, requestId, throwable.getMessage());
                }
                return shouldRetry;
            })
            .doBeforeRetry(retrySignal -> {
                log.warn("[HSMemClient] {} - 准备重试 | requestId={}, 重试次数: {}/{}", 
                    operation, requestId, retrySignal.totalRetries() + 1, retryConfig.getMaxAttempts());
            });
    }
    
}
