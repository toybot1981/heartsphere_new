package com.heartsphere.mentis.monitor;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 执行监控服务实现
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionMonitorServiceImpl implements ExecutionMonitorService {
    
    // 任务执行计数器
    private final AtomicLong totalTasks = new AtomicLong(0);
    private final AtomicLong successfulTasks = new AtomicLong(0);
    private final AtomicLong failedTasks = new AtomicLong(0);
    
    // 任务执行时间统计
    private final Map<String, Long> taskDurations = new ConcurrentHashMap<>();
    
    @Override
    public void recordTaskStart(String taskId, String sessionId) {
        log.debug("记录任务开始: taskId={}, sessionId={}", taskId, sessionId);
        totalTasks.incrementAndGet();
    }
    
    @Override
    public void recordTaskComplete(String taskId, boolean success, long duration) {
        log.debug("记录任务完成: taskId={}, success={}, duration={}ms", taskId, success, duration);
        
        if (success) {
            successfulTasks.incrementAndGet();
        } else {
            failedTasks.incrementAndGet();
        }
        
        taskDurations.put(taskId, duration);
    }
    
    @Override
    public void recordMetrics(String taskId, Map<String, Object> metrics) {
        log.debug("记录执行指标: taskId={}, metrics={}", taskId, metrics);
        // TODO: 存储指标数据
    }
    
    @Override
    public ExecutionStatistics getStatistics(String sessionId, LocalDateTime startTime, LocalDateTime endTime) {
        log.debug("获取执行统计: sessionId={}", sessionId);
        
        ExecutionStatistics stats = new ExecutionStatistics();
        stats.setTotalTasks(totalTasks.get());
        stats.setSuccessfulTasks(successfulTasks.get());
        stats.setFailedTasks(failedTasks.get());
        
        // 计算平均执行时间
        if (!taskDurations.isEmpty()) {
            double avgTime = taskDurations.values().stream()
                    .mapToLong(Long::longValue)
                    .average()
                    .orElse(0.0);
            stats.setAverageExecutionTime(avgTime);
        }
        
        // 计算成功率
        if (totalTasks.get() > 0) {
            double successRate = (double) successfulTasks.get() / totalTasks.get() * 100;
            stats.setSuccessRate(successRate);
        }
        
        return stats;
    }
    
    @Override
    public Map<String, Object> getRealtimeMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalTasks", totalTasks.get());
        metrics.put("successfulTasks", successfulTasks.get());
        metrics.put("failedTasks", failedTasks.get());
        metrics.put("activeTasks", 0); // TODO: 获取活跃任务数
        return metrics;
    }
}
