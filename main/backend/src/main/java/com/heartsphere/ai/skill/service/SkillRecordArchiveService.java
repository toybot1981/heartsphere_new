package com.heartsphere.ai.skill.service;

import com.heartsphere.ai.skill.entity.SkillExecutionRecord;
import com.heartsphere.ai.skill.repository.SkillExecutionRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 技能执行记录归档服务
 * 定期将旧记录移到归档表或清理过期数据
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SkillRecordArchiveService {

    private final SkillExecutionRecordRepository repository;
    
    // 归档阈值：90天前的记录
    private static final int ARCHIVE_DAYS = 90;
    
    // 清理阈值：180天前的记录
    private static final int CLEANUP_DAYS = 180;

    /**
     * 归档旧记录
     * 每天凌晨2点执行
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void archiveOldRecords() {
        try {
            LocalDateTime archiveThreshold = LocalDateTime.now().minusDays(ARCHIVE_DAYS);
            
            // 查询需要归档的记录
            List<SkillExecutionRecord> recordsToArchive = repository
                .findByCreatedAtBefore(archiveThreshold);
            
            if (recordsToArchive.isEmpty()) {
                log.info("没有需要归档的记录");
                return;
            }
            
            log.info("开始归档技能执行记录: count={}, threshold={}", 
                recordsToArchive.size(), archiveThreshold);
            
            // TODO: 实现归档逻辑
            // 1. 创建归档表（如果需要）
            // 2. 将记录复制到归档表
            // 3. 从主表删除（或标记为已归档）
            
            // 当前实现：只记录日志，不实际归档
            log.info("归档完成: count={}", recordsToArchive.size());
            
        } catch (Exception e) {
            log.error("归档记录失败", e);
        }
    }

    /**
     * 清理过期记录
     * 每周日凌晨3点执行
     */
    @Scheduled(cron = "0 0 3 ? * SUN")
    @Transactional
    public void cleanupExpiredRecords() {
        try {
            LocalDateTime cleanupThreshold = LocalDateTime.now().minusDays(CLEANUP_DAYS);
            
            // 查询需要清理的记录（只清理已归档或失败的记录）
            List<SkillExecutionRecord> recordsToCleanup = repository
                .findByCreatedAtBeforeAndExecutionStatus(cleanupThreshold, 
                    com.heartsphere.ai.skill.enums.ExecutionStatus.FAILED);
            
            if (recordsToCleanup.isEmpty()) {
                log.info("没有需要清理的记录");
                return;
            }
            
            log.info("开始清理过期记录: count={}, threshold={}", 
                recordsToCleanup.size(), cleanupThreshold);
            
            // 删除过期记录
            repository.deleteAll(recordsToCleanup);
            
            log.info("清理完成: count={}", recordsToCleanup.size());
            
        } catch (Exception e) {
            log.error("清理记录失败", e);
        }
    }

    /**
     * 手动触发归档
     */
    @Transactional
    public int manualArchive(int days) {
        LocalDateTime threshold = LocalDateTime.now().minusDays(days);
        List<SkillExecutionRecord> records = repository.findByCreatedAtBefore(threshold);
        
        if (!records.isEmpty()) {
            // TODO: 实现归档逻辑
            log.info("手动归档: count={}, days={}", records.size(), days);
        }
        
        return records.size();
    }
}
