package com.heartsphere.aiagent.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.lang.NonNull;
import org.springframework.web.client.ResourceAccessException;

import java.io.IOException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;

/**
 * HTTP请求重试拦截器
 * 处理连接错误（Connection refused, Connection timeout等）自动重试
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
public class RetryHttpRequestInterceptor implements ClientHttpRequestInterceptor {
    
    private static final int MAX_RETRIES = 3; // 最大重试次数
    private static final long RETRY_DELAY_MS = 1000; // 重试延迟（毫秒）
    private static final long MAX_RETRY_DELAY_MS = 5000; // 最大重试延迟（毫秒）
    
    @Override
    @NonNull
    public ClientHttpResponse intercept(
            @NonNull HttpRequest request,
            @NonNull byte[] body,
            @NonNull ClientHttpRequestExecution execution) throws IOException {
        
        int attempt = 0;
        long retryDelay = RETRY_DELAY_MS;
        
        while (attempt <= MAX_RETRIES) {
            try {
                if (attempt > 0) {
                    log.warn("[RetryInterceptor] 重试请求 - 尝试次数: {}/{}, URL: {}, 延迟: {}ms", 
                        attempt, MAX_RETRIES, request.getURI(), retryDelay);
                    Thread.sleep(retryDelay);
                    // 指数退避：延迟时间递增
                    retryDelay = Math.min(retryDelay * 2, MAX_RETRY_DELAY_MS);
                }
                
                ClientHttpResponse response = execution.execute(request, body);
                
                // 如果响应成功，记录日志（仅第一次）
                if (attempt == 0 && response.getStatusCode().is2xxSuccessful()) {
                    log.debug("[RetryInterceptor] 请求成功 - URL: {}", request.getURI());
                }
                
                return response;
                
            } catch (ResourceAccessException e) {
                Throwable cause = e.getCause();
                
                // 判断是否是可重试的错误
                boolean shouldRetry = isRetryableException(cause);
                
                if (shouldRetry && attempt < MAX_RETRIES) {
                    attempt++;
                    log.warn("[RetryInterceptor] 请求失败，准备重试 - 尝试次数: {}/{}, 错误: {}, URL: {}", 
                        attempt, MAX_RETRIES, cause != null ? cause.getClass().getSimpleName() : e.getClass().getSimpleName(), 
                        request.getURI());
                    continue;
                } else {
                    // 达到最大重试次数或不可重试的错误，抛出异常
                    log.error("[RetryInterceptor] 请求最终失败 - 尝试次数: {}, 错误: {}, URL: {}", 
                        attempt + 1, e.getMessage(), request.getURI(), e);
                    throw e;
                }
                
            } catch (IOException e) {
                // 其他IO异常，判断是否可重试
                boolean shouldRetry = isRetryableException(e);
                
                if (shouldRetry && attempt < MAX_RETRIES) {
                    attempt++;
                    log.warn("[RetryInterceptor] IO异常，准备重试 - 尝试次数: {}/{}, 错误: {}, URL: {}", 
                        attempt, MAX_RETRIES, e.getClass().getSimpleName(), request.getURI());
                    continue;
                } else {
                    log.error("[RetryInterceptor] IO异常最终失败 - 尝试次数: {}, 错误: {}, URL: {}", 
                        attempt + 1, e.getMessage(), request.getURI(), e);
                    throw e;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("[RetryInterceptor] 重试延迟被中断", e);
                throw new IOException("重试延迟被中断", e);
            }
        }
        
        // 理论上不会执行到这里
        throw new IOException("请求失败，已达到最大重试次数: " + MAX_RETRIES);
    }
    
    /**
     * 判断异常是否可重试
     */
    private boolean isRetryableException(Throwable e) {
        if (e == null) {
            return false;
        }
        
        // Connection refused - 连接被拒绝
        if (e instanceof ConnectException) {
            return true;
        }
        
        // Connection timeout - 连接超时
        if (e instanceof SocketTimeoutException) {
            return true;
        }
        
        // Unknown host - 域名解析失败（可能临时DNS问题）
        if (e instanceof UnknownHostException) {
            return true;
        }
        
        // 检查异常消息中是否包含可重试的关键词
        String message = e.getMessage();
        if (message != null) {
            String lowerMessage = message.toLowerCase();
            if (lowerMessage.contains("connection refused") ||
                lowerMessage.contains("connection reset") ||
                lowerMessage.contains("connection timeout") ||
                lowerMessage.contains("connection closed") ||
                lowerMessage.contains("connection reset by peer") ||
                lowerMessage.contains("timeout") ||
                lowerMessage.contains("read timed out") ||
                lowerMessage.contains("connect timed out")) {
                return true;
            }
        }
        
        return false;
    }
}

