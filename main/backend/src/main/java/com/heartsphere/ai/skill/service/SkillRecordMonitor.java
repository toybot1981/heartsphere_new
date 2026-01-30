package com.heartsphere.ai.skill.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.LongAdder;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 技能执行记录监控服务
 * 监控异步任务队列状态、失败率等指标
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillRecordMonitor {

    private final AsyncSkillRecordService asyncRecordService;
    private final SkillExecutionRecordService recordService;
    
    // 监控指标
    private final AtomicLong totalRecordsCreated = new AtomicLong(0);
    private final AtomicLong totalRecordsFailed = new AtomicLong(0);
    private final AtomicLong totalAsyncTasks = new AtomicLong(0);
    private final AtomicLong totalAsyncTasksFailed = new AtomicLong(0);
    
    // 性能监控指标
    private final LongAdder totalEvaluationTime = new LongAdder();
    private final LongAdder totalWriteTime = new LongAdder();
    private final LongAdder totalQueryTime = new LongAdder();
    private final AtomicLong evaluationCount = new AtomicLong(0);
    private final AtomicLong writeCount = new AtomicLong(0);
    private final AtomicLong queryCount = new AtomicLong(0);
    
    // 响应时间统计
    private final Map<String, LongAdder> apiResponseTimes = new ConcurrentHashMap<>();
    private final Map<String, AtomicLong> apiRequestCounts = new ConcurrentHashMap<>();

    /**
     * 记录创建成功
     */
    public void recordCreated() {
        totalRecordsCreated.incrementAndGet();
    }

    /**
     * 记录创建失败
     */
    public void recordFailed() {
        totalRecordsFailed.incrementAndGet();
    }

    /**
     * 异步任务提交
     */
    public void asyncTaskSubmitted() {
        totalAsyncTasks.incrementAndGet();
    }

    /**
     * 异步任务失败
     */
    public void asyncTaskFailed() {
        totalAsyncTasksFailed.incrementAndGet();
    }

    /**
     * 获取创建成功率
     */
    public double getSuccessRate() {
        long total = totalRecordsCreated.get() + totalRecordsFailed.get();
        if (total == 0) {
            return 1.0;
        }
        return (double) totalRecordsCreated.get() / total;
    }

    /**
     * 获取异步任务成功率
     */
    public double getAsyncTaskSuccessRate() {
        long total = totalAsyncTasks.get();
        if (total == 0) {
            return 1.0;
        }
        return (double) (totalAsyncTasks.get() - totalAsyncTasksFailed.get()) / total;
    }

    /**
     * 定期检查任务队列状态
     * 每5分钟执行一次
     */
    @Scheduled(fixedRate = 300000) // 5分钟
    public void checkQueueStatus() {
        try {
            // 检查异步任务失败率
            double asyncFailureRate = 1.0 - getAsyncTaskSuccessRate();
            if (asyncFailureRate > 0.1) { // 失败率超过10%
                log.warn("⚠️ 告警: 技能执行记录异步任务失败率过高: {}%", asyncFailureRate * 100);
                // TODO: 发送告警通知（邮件、短信、钉钉等）
            }

            // 检查总体成功率
            double successRate = getSuccessRate();
            if (successRate < 0.95) { // 成功率低于95%
                log.warn("⚠️ 告警: 技能执行记录创建成功率过低: {}%", successRate * 100);
                // TODO: 发送告警通知
            }
            
            // 检查平均评估延迟
            double avgEvaluationTime = getAverageEvaluationTime();
            if (avgEvaluationTime > 1000) { // 超过1秒
                log.warn("⚠️ 告警: 技能评估平均延迟过高: {}ms", avgEvaluationTime);
            }
            
            // 检查平均写入时间
            double avgWriteTime = getAverageWriteTime();
            if (avgWriteTime > 500) { // 超过500ms
                log.warn("⚠️ 告警: 执行记录写入平均时间过长: {}ms", avgWriteTime);
            }
            
            // 检查平均查询时间
            double avgQueryTime = getAverageQueryTime();
            if (avgQueryTime > 1000) { // 超过1秒
                log.warn("⚠️ 告警: 数据库查询平均时间过长: {}ms", avgQueryTime);
            }

            // 记录监控指标
            log.info("技能执行记录监控指标 - 总创建: {}, 总失败: {}, 成功率: {}%, 异步任务: {}, 异步失败: {}",
                totalRecordsCreated.get(),
                totalRecordsFailed.get(),
                successRate * 100,
                totalAsyncTasks.get(),
                totalAsyncTasksFailed.get());

        } catch (Exception e) {
            log.error("监控检查失败", e);
        }
    }

    /**
     * 记录评估耗时
     */
    public void recordEvaluationTime(long durationMs) {
        totalEvaluationTime.add(durationMs);
        evaluationCount.incrementAndGet();
    }

    /**
     * 记录写入耗时
     */
    public void recordWriteTime(long durationMs) {
        totalWriteTime.add(durationMs);
        writeCount.incrementAndGet();
    }

    /**
     * 记录查询耗时
     */
    public void recordQueryTime(String apiName, long durationMs) {
        apiResponseTimes.computeIfAbsent(apiName, k -> new LongAdder()).add(durationMs);
        apiRequestCounts.computeIfAbsent(apiName, k -> new AtomicLong(0)).incrementAndGet();
        totalQueryTime.add(durationMs);
        queryCount.incrementAndGet();
    }

    /**
     * 获取平均评估延迟
     */
    public double getAverageEvaluationTime() {
        long count = evaluationCount.get();
        return count > 0 ? (double) totalEvaluationTime.sum() / count : 0.0;
    }

    /**
     * 获取平均写入时间
     */
    public double getAverageWriteTime() {
        long count = writeCount.get();
        return count > 0 ? (double) totalWriteTime.sum() / count : 0.0;
    }

    /**
     * 获取平均查询时间
     */
    public double getAverageQueryTime() {
        long count = queryCount.get();
        return count > 0 ? (double) totalQueryTime.sum() / count : 0.0;
    }

    /**
     * 获取API平均响应时间
     */
    public double getAverageApiResponseTime(String apiName) {
        LongAdder totalTime = apiResponseTimes.get(apiName);
        AtomicLong count = apiRequestCounts.get(apiName);
        if (totalTime == null || count == null || count.get() == 0) {
            return 0.0;
        }
        return (double) totalTime.sum() / count.get();
    }

    /**
     * 获取监控统计信息
     */
    public MonitorStats getStats() {
        return MonitorStats.builder()
            .totalRecordsCreated(totalRecordsCreated.get())
            .totalRecordsFailed(totalRecordsFailed.get())
            .successRate(getSuccessRate())
            .totalAsyncTasks(totalAsyncTasks.get())
            .totalAsyncTasksFailed(totalAsyncTasksFailed.get())
            .asyncTaskSuccessRate(getAsyncTaskSuccessRate())
            .averageEvaluationTime(getAverageEvaluationTime())
            .averageWriteTime(getAverageWriteTime())
            .averageQueryTime(getAverageQueryTime())
            .build();
    }

    /**
     * 监控统计信息
     */
    @lombok.Data
    @lombok.Builder
    public static class MonitorStats {
        private long totalRecordsCreated;
        private long totalRecordsFailed;
        private double successRate;
        private long totalAsyncTasks;
        private long totalAsyncTasksFailed;
        private double asyncTaskSuccessRate;
        
        // 性能指标
        private double averageEvaluationTime;
        private double averageWriteTime;
        private double averageQueryTime;
    }
}
