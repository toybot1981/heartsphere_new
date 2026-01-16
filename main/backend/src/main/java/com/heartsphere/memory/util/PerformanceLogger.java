package com.heartsphere.memory.util;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 性能监控工具类
 * 用于记录请求耗时和识别慢请求
 * 
 * @author HeartSphere
 * @date 2026-01-16
 */
public class PerformanceLogger {
    
    private final Instant startTime;
    private final String requestId;
    private final long slowRequestThresholdMs;
    
    // 统计信息（可选，如果需要全局统计）
    private static final AtomicLong totalRequests = new AtomicLong(0);
    private static final AtomicLong successfulRequests = new AtomicLong(0);
    private static final AtomicLong failedRequests = new AtomicLong(0);
    private static final AtomicLong totalDurationMs = new AtomicLong(0);
    
    /**
     * 创建性能日志记录器
     * 
     * @param requestId 请求ID
     * @param slowRequestThresholdMs 慢请求阈值（毫秒）
     */
    public PerformanceLogger(String requestId, long slowRequestThresholdMs) {
        this.requestId = requestId;
        this.startTime = Instant.now();
        this.slowRequestThresholdMs = slowRequestThresholdMs;
    }
    
    /**
     * 开始计时
     * 
     * @param requestId 请求ID
     * @param slowRequestThresholdMs 慢请求阈值（毫秒）
     * @return PerformanceLogger 实例
     */
    public static PerformanceLogger start(String requestId, long slowRequestThresholdMs) {
        return new PerformanceLogger(requestId, slowRequestThresholdMs);
    }
    
    /**
     * 结束计时并返回耗时（毫秒）
     * 
     * @param success 是否成功
     * @return 耗时（毫秒）
     */
    public long end(boolean success) {
        Instant endTime = Instant.now();
        long durationMs = Duration.between(startTime, endTime).toMillis();
        
        // 更新统计信息
        totalRequests.incrementAndGet();
        if (success) {
            successfulRequests.incrementAndGet();
        } else {
            failedRequests.incrementAndGet();
        }
        totalDurationMs.addAndGet(durationMs);
        
        return durationMs;
    }
    
    /**
     * 判断是否为慢请求
     * 
     * @param durationMs 耗时（毫秒）
     * @return 是否为慢请求
     */
    public boolean isSlowRequest(long durationMs) {
        return durationMs > slowRequestThresholdMs;
    }
    
    /**
     * 获取请求ID
     * 
     * @return 请求ID
     */
    public String getRequestId() {
        return requestId;
    }
    
    /**
     * 获取开始时间
     * 
     * @return 开始时间
     */
    public Instant getStartTime() {
        return startTime;
    }
    
    /**
     * 获取慢请求阈值
     * 
     * @return 慢请求阈值（毫秒）
     */
    public long getSlowRequestThresholdMs() {
        return slowRequestThresholdMs;
    }
    
    /**
     * 获取统计信息（全局）
     * 
     * @return 统计信息
     */
    public static Statistics getStatistics() {
        long total = totalRequests.get();
        long successful = successfulRequests.get();
        long failed = failedRequests.get();
        long totalDuration = totalDurationMs.get();
        
        double avgDuration = total > 0 ? (double) totalDuration / total : 0.0;
        
        return new Statistics(total, successful, failed, avgDuration);
    }
    
    /**
     * 重置统计信息（主要用于测试）
     */
    public static void resetStatistics() {
        totalRequests.set(0);
        successfulRequests.set(0);
        failedRequests.set(0);
        totalDurationMs.set(0);
    }
    
    /**
     * 统计信息数据类
     */
    public static class Statistics {
        private final long totalRequests;
        private final long successfulRequests;
        private final long failedRequests;
        private final double avgDurationMs;
        
        public Statistics(long totalRequests, long successfulRequests, long failedRequests, double avgDurationMs) {
            this.totalRequests = totalRequests;
            this.successfulRequests = successfulRequests;
            this.failedRequests = failedRequests;
            this.avgDurationMs = avgDurationMs;
        }
        
        public long getTotalRequests() {
            return totalRequests;
        }
        
        public long getSuccessfulRequests() {
            return successfulRequests;
        }
        
        public long getFailedRequests() {
            return failedRequests;
        }
        
        public double getAvgDurationMs() {
            return avgDurationMs;
        }
        
        @Override
        public String toString() {
            return String.format("Statistics{total=%d, success=%d, failed=%d, avgDuration=%.2fms}", 
                totalRequests, successfulRequests, failedRequests, avgDurationMs);
        }
    }
}
