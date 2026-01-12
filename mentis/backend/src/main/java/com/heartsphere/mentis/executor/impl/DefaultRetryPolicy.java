package com.heartsphere.mentis.executor.impl;

import com.heartsphere.mentis.executor.RetryPolicy;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * 默认重试策略实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Data
public class DefaultRetryPolicy implements RetryPolicy {
    
    private int maxRetries = 3;
    private long initialDelay = 1000; // 初始延迟1秒
    private double backoffMultiplier = 2.0; // 退避倍数
    private long maxDelay = 60000; // 最大延迟60秒
    
    @Override
    public boolean shouldRetry(int attemptCount, Exception lastException) {
        if (attemptCount >= maxRetries) {
            log.debug("达到最大重试次数: attemptCount={}, maxRetries={}", attemptCount, maxRetries);
            return false;
        }
        
        // 某些异常不应该重试
        if (lastException != null) {
            String exceptionType = lastException.getClass().getSimpleName();
            if (exceptionType.contains("Security") || exceptionType.contains("Permission")) {
                log.warn("安全相关异常，不重试: {}", exceptionType);
                return false;
            }
        }
        
        return true;
    }
    
    @Override
    public long getRetryDelay(int attemptCount) {
        // 指数退避策略
        long delay = (long) (initialDelay * Math.pow(backoffMultiplier, attemptCount - 1));
        return Math.min(delay, maxDelay);
    }
    
    @Override
    public int getMaxRetries() {
        return maxRetries;
    }
}
