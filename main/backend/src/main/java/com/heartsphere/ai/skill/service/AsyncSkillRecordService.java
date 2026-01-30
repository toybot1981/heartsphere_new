package com.heartsphere.ai.skill.service;

import com.heartsphere.ai.skill.dto.SkillExecutionRecordDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 异步技能执行记录服务
 * 用于异步保存执行记录，避免阻塞 AI 响应流程
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncSkillRecordService {

    private final SkillExecutionRecordService recordService;
    
    // 可选：注入监控服务
    private SkillRecordMonitor monitor;
    
    public void setMonitor(SkillRecordMonitor monitor) {
        this.monitor = monitor;
    }

    /**
     * 异步创建执行记录
     * 
     * @param dto 执行记录 DTO
     * @return CompletableFuture，包含创建的记录 ID
     */
    @Async("skillRecordExecutor")
    public CompletableFuture<Long> createRecordAsync(SkillExecutionRecordDTO dto) {
        if (monitor != null) {
            monitor.asyncTaskSubmitted();
        }
        try {
            var record = recordService.createRecord(dto);
            log.info("异步创建执行记录成功: recordId={}, skillId={}", 
                record.getId(), dto.getSkillId());
            if (monitor != null) {
                monitor.recordCreated();
            }
            return CompletableFuture.completedFuture(record.getId());
        } catch (Exception e) {
            log.error("异步创建执行记录失败: skillId={}", dto.getSkillId(), e);
            if (monitor != null) {
                monitor.recordFailed();
                monitor.asyncTaskFailed();
            }
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 异步更新执行结果
     * 
     * @param recordId 记录ID
     * @param status 执行状态
     * @param result 执行结果
     * @param durationMs 执行耗时
     * @param error 错误信息
     * @return CompletableFuture
     */
    @Async("skillRecordExecutor")
    public CompletableFuture<Void> updateExecutionResultAsync(
            Long recordId,
            String status,
            String result,
            Integer durationMs,
            String error) {
        try {
            recordService.updateExecutionResult(recordId, status, result, durationMs, error);
            log.info("异步更新执行结果成功: recordId={}, status={}", recordId, status);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("异步更新执行结果失败: recordId={}", recordId, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 异步标记为执行中
     */
    @Async("skillRecordExecutor")
    public CompletableFuture<Void> markAsExecutingAsync(Long recordId) {
        try {
            recordService.markAsExecuting(recordId);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("异步标记为执行中失败: recordId={}", recordId, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 异步标记为完成
     */
    @Async("skillRecordExecutor")
    public CompletableFuture<Void> markAsCompletedAsync(Long recordId, String result, Integer durationMs) {
        try {
            recordService.markAsCompleted(recordId, result, durationMs);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("异步标记为完成失败: recordId={}", recordId, e);
            return CompletableFuture.failedFuture(e);
        }
    }

    /**
     * 异步标记为失败
     */
    @Async("skillRecordExecutor")
    public CompletableFuture<Void> markAsFailedAsync(Long recordId, String errorMessage, Integer durationMs) {
        try {
            recordService.markAsFailed(recordId, errorMessage, durationMs);
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("异步标记为失败失败: recordId={}", recordId, e);
            return CompletableFuture.failedFuture(e);
        }
    }
}
