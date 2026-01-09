package com.heartsphere.mentis.executor;

/**
 * 重试策略接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface RetryPolicy {
    
    /**
     * 是否应该重试
     * 
     * @param attemptCount 当前尝试次数
     * @param lastException 最后一次异常
     * @return 是否应该重试
     */
    boolean shouldRetry(int attemptCount, Exception lastException);
    
    /**
     * 获取下次重试的延迟时间（毫秒）
     * 
     * @param attemptCount 当前尝试次数
     * @return 延迟时间（毫秒）
     */
    long getRetryDelay(int attemptCount);
    
    /**
     * 获取最大重试次数
     * 
     * @return 最大重试次数
     */
    int getMaxRetries();
}
