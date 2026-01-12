package com.heartsphere.scheduler;

import com.heartsphere.service.QuotaManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 配额重置定时任务
 * 负责定期重置会员配额
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class QuotaResetScheduler {

    private final QuotaManagementService quotaManagementService;

    /**
     * 月度配额重置
     * 每月1日 00:00:00 执行
     * 重置文本Token、图片、视频配额
     */
    @Scheduled(cron = "0 0 0 1 * ?")
    public void resetMonthlyQuota() {
        log.info("开始执行月度配额重置任务");
        try {
            quotaManagementService.resetMonthlyQuota();
            log.info("月度配额重置任务执行完成");
        } catch (Exception e) {
            log.error("月度配额重置任务执行失败", e);
        }
    }

    /**
     * 日度配额重置（API调用配额）
     * 每天 00:00:00 执行
     * 重置API调用配额
     */
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetDailyQuota() {
        log.info("开始执行日度配额重置任务（API调用）");
        try {
            quotaManagementService.resetDailyQuota();
            log.info("日度配额重置任务执行完成");
        } catch (Exception e) {
            log.error("日度配额重置任务执行失败", e);
        }
    }
}
