package com.heartsphere.mentis.monitor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 执行监控服务接口
 * 
 * @author HeartSphere
 * @version 1.0
 */
public interface ExecutionMonitorService {
    
    /**
     * 记录任务执行开始
     * 
     * @param taskId 任务ID
     * @param sessionId 会话ID
     */
    void recordTaskStart(String taskId, String sessionId);
    
    /**
     * 记录任务执行完成
     * 
     * @param taskId 任务ID
     * @param success 是否成功
     * @param duration 执行时长（毫秒）
     */
    void recordTaskComplete(String taskId, boolean success, long duration);
    
    /**
     * 记录执行指标
     * 
     * @param taskId 任务ID
     * @param metrics 指标数据
     */
    void recordMetrics(String taskId, Map<String, Object> metrics);
    
    /**
     * 获取任务执行统计
     * 
     * @param sessionId 会话ID（可选）
     * @param startTime 开始时间（可选）
     * @param endTime 结束时间（可选）
     * @return 统计信息
     */
    ExecutionStatistics getStatistics(String sessionId, LocalDateTime startTime, LocalDateTime endTime);
    
    /**
     * 获取实时监控数据
     * 
     * @return 监控数据
     */
    Map<String, Object> getRealtimeMetrics();
    
    /**
     * 执行统计信息
     */
    class ExecutionStatistics {
        private long totalTasks;
        private long successfulTasks;
        private long failedTasks;
        private double averageExecutionTime;
        private double successRate;
        
        // Getters and Setters
        public long getTotalTasks() { return totalTasks; }
        public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
        public long getSuccessfulTasks() { return successfulTasks; }
        public void setSuccessfulTasks(long successfulTasks) { this.successfulTasks = successfulTasks; }
        public long getFailedTasks() { return failedTasks; }
        public void setFailedTasks(long failedTasks) { this.failedTasks = failedTasks; }
        public double getAverageExecutionTime() { return averageExecutionTime; }
        public void setAverageExecutionTime(double averageExecutionTime) { this.averageExecutionTime = averageExecutionTime; }
        public double getSuccessRate() { return successRate; }
        public void setSuccessRate(double successRate) { this.successRate = successRate; }
    }
}
