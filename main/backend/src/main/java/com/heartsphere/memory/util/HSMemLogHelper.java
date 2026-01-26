package com.heartsphere.memory.util;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * HSMem 日志记录辅助工具类
 * 提供统一的日志记录方法，包含请求ID追踪
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
@Slf4j
public class HSMemLogHelper {
    
    private static final String LOG_PREFIX = "[HSMemClient]";
    
    /**
     * 生成请求ID
     * 格式：hsmem-{timestamp}-{random}
     * 
     * @return 请求ID
     */
    public static String generateRequestId() {
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 10000);
        return String.format("hsmem-%d-%04d", timestamp, random);
    }
    
    /**
     * 记录请求开始日志
     * 
     * @param operation 操作名称（如 memorizeConversation）
     * @param requestId 请求ID
     * @param context 上下文信息（用户ID、参数摘要等）
     */
    public static void logRequest(String operation, String requestId, Map<String, Object> context) {
        String contextStr = formatContext(context);
        log.info("{} {} - 请求开始 | requestId={}, {}", LOG_PREFIX, operation, requestId, contextStr);
        
        // DEBUG 级别记录更详细的信息
        if (log.isDebugEnabled()) {
            log.info("{} {} - 请求详情 | requestId={}, {}", LOG_PREFIX, operation, requestId, contextStr);
        }
    }
    
    /**
     * 记录响应日志
     * 
     * @param operation 操作名称
     * @param requestId 请求ID
     * @param success 是否成功
     * @param responseSummary 响应摘要
     * @param durationMs 耗时（毫秒）
     */
    public static void logResponse(String operation, String requestId, boolean success, 
                                   Object responseSummary, long durationMs) {
        String responseStr = LogSanitizer.sanitizeResponse(responseSummary);
        
        if (success) {
            log.info("{} {} - 请求成功 | requestId={}, response={}", 
                LOG_PREFIX, operation, requestId, responseStr);
        } else {
            log.error("{} {} - 请求失败 | requestId={}, response={}", 
                LOG_PREFIX, operation, requestId, responseStr);
        }
        
        // DEBUG 级别记录性能指标
        if (log.isDebugEnabled()) {
            log.info("{} {} - 性能指标 | requestId={}, duration={}ms", 
                LOG_PREFIX, operation, requestId, durationMs);
        }
    }
    
    /**
     * 记录错误日志
     * 
     * @param operation 操作名称
     * @param requestId 请求ID
     * @param error 异常对象
     * @param context 请求上下文
     * @param durationMs 耗时（毫秒）
     */
    public static void logError(String operation, String requestId, Throwable error, 
                               Map<String, Object> context, long durationMs) {
        String contextStr = formatContext(context);
        String errorMessage = error != null ? error.getMessage() : "未知错误";
        String errorType = error != null ? error.getClass().getSimpleName() : "UnknownError";
        
        log.error("{} {} - 请求失败 | requestId={}, error={}: {}, context={}, duration={}ms", 
            LOG_PREFIX, operation, requestId, errorType, errorMessage, contextStr, durationMs);
        
        // DEBUG 级别记录完整异常堆栈
        if (log.isDebugEnabled() && error != null) {
            log.info("{} {} - 异常堆栈 | requestId={}", LOG_PREFIX, operation, requestId, error);
        }
    }
    
    /**
     * 记录性能日志
     * 
     * @param operation 操作名称
     * @param requestId 请求ID
     * @param durationMs 耗时（毫秒）
     * @param isSlow 是否为慢请求
     */
    public static void logPerformance(String operation, String requestId, long durationMs, boolean isSlow) {
        if (isSlow) {
            log.warn("{} {} - 慢请求 | requestId={}, duration={}ms", 
                LOG_PREFIX, operation, requestId, durationMs);
        } else {
            log.info("{} {} - 性能指标 | requestId={}, duration={}ms", 
                LOG_PREFIX, operation, requestId, durationMs);
        }
    }
    
    /**
     * 格式化上下文信息
     * 
     * @param context 上下文Map
     * @return 格式化后的字符串
     */
    private static String formatContext(Map<String, Object> context) {
        if (context == null || context.isEmpty()) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, Object> entry : context.entrySet()) {
            if (!first) {
                sb.append(", ");
            }
            String key = entry.getKey();
            Object value = entry.getValue();
            
            // 对值进行脱敏处理
            String sanitizedValue = LogSanitizer.sanitize(value);
            sb.append(key).append("=").append(sanitizedValue);
            first = false;
        }
        
        return sb.toString();
    }
}
