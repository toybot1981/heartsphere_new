package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AICostDaily;
import com.heartsphere.billing.entity.AIUsageRecord;
import com.heartsphere.billing.repository.AICostDailyRepository;
import com.heartsphere.billing.repository.AIUsageRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 成本统计汇总服务
 * 从 ai_usage_records 汇总数据到 ai_cost_daily
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CostStatisticsService {

    private final AIUsageRecordRepository usageRecordRepository;
    private final AICostDailyRepository costDailyRepository;

    /**
     * 定时汇总成本数据（每天凌晨2点执行）
     * 汇总前一天的使用记录
     */
    @Scheduled(cron = "0 0 2 * * ?") // 每天凌晨2点
    @Transactional
    public void aggregateDailyCost() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        log.info("开始汇总成本统计数据，日期: {}", yesterday);
        aggregateCostForDate(yesterday);
        log.info("成本统计汇总完成，日期: {}", yesterday);
    }

    /**
     * 汇总指定日期的成本数据
     * @param date 要汇总的日期
     */
    @Transactional
    public void aggregateCostForDate(LocalDate date) {
        LocalDateTime startDateTime = date.atStartOfDay();
        LocalDateTime endDateTime = date.atTime(LocalTime.MAX);

        // 查询该日期的所有成功使用记录（使用JPA查询，性能更好）
        List<AIUsageRecord> records = usageRecordRepository.findSuccessRecordsByDateRange(
                startDateTime, endDateTime);

        if (records.isEmpty()) {
            log.debug("日期 {} 没有使用记录，跳过汇总", date);
            return;
        }

        // 按 providerId, modelId, usageType 分组汇总
        Map<String, List<AIUsageRecord>> grouped = records.stream()
                .collect(Collectors.groupingBy(r -> 
                    r.getProviderId() + "_" + r.getModelId() + "_" + r.getUsageType()
                ));

        int aggregatedCount = 0;
        for (Map.Entry<String, List<AIUsageRecord>> entry : grouped.entrySet()) {
            List<AIUsageRecord> groupRecords = entry.getValue();
            if (groupRecords.isEmpty()) continue;

            AIUsageRecord firstRecord = groupRecords.get(0);
            Long providerId = firstRecord.getProviderId();
            Long modelId = firstRecord.getModelId();
            String usageType = firstRecord.getUsageType();

            // 计算汇总数据
            BigDecimal totalCost = groupRecords.stream()
                    .map(AIUsageRecord::getCostAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long totalUsage = calculateTotalUsage(groupRecords, usageType);
            int callCount = groupRecords.size();

            // 查找或创建统计记录
            AICostDaily costDaily = costDailyRepository
                    .findByStatDateAndProviderIdAndModelIdAndUsageType(
                            date, providerId, modelId, usageType
                    )
                    .orElse(new AICostDaily());

            costDaily.setStatDate(date);
            costDaily.setProviderId(providerId);
            costDaily.setModelId(modelId);
            costDaily.setUsageType(usageType);
            costDaily.setTotalUsage(totalUsage);
            costDaily.setTotalCost(totalCost);
            costDaily.setCallCount(callCount);

            costDailyRepository.save(costDaily);
            aggregatedCount++;

            log.debug("汇总完成: date={}, providerId={}, modelId={}, usageType={}, " +
                    "totalUsage={}, totalCost={}, callCount={}",
                    date, providerId, modelId, usageType, totalUsage, totalCost, callCount);
        }

        log.info("成本统计汇总完成: date={}, 汇总记录数={}, 统计条目数={}", 
                date, records.size(), aggregatedCount);
    }

    /**
     * 计算总使用量（根据使用类型）
     */
    private long calculateTotalUsage(List<AIUsageRecord> records, String usageType) {
        switch (usageType) {
            case "text_generation":
                // 文本生成：使用 totalTokens
                return records.stream()
                        .mapToLong(r -> r.getTotalTokens() != null ? r.getTotalTokens() : 0)
                        .sum();
            case "image_generation":
                // 图片生成：使用 imageCount
                return records.stream()
                        .mapToLong(r -> r.getImageCount() != null ? r.getImageCount() : 0)
                        .sum();
            case "audio_tts":
            case "audio_stt":
                // 音频：使用 audioDuration（秒）
                return records.stream()
                        .mapToLong(r -> r.getAudioDuration() != null ? r.getAudioDuration() : 0)
                        .sum();
            case "video_generation":
                // 视频：使用 videoDuration（秒）
                return records.stream()
                        .mapToLong(r -> r.getVideoDuration() != null ? r.getVideoDuration() : 0)
                        .sum();
            default:
                // 默认：使用 totalTokens
                return records.stream()
                        .mapToLong(r -> r.getTotalTokens() != null ? r.getTotalTokens() : 0)
                        .sum();
        }
    }

    /**
     * 汇总最近N天的数据（用于补全历史数据）
     * @param days 要汇总的天数
     */
    @Transactional
    public void aggregateRecentDays(int days) {
        log.info("开始汇总最近 {} 天的成本统计数据", days);
        for (int i = 1; i <= days; i++) {
            LocalDate date = LocalDate.now().minusDays(i);
            aggregateCostForDate(date);
        }
        log.info("最近 {} 天的成本统计汇总完成", days);
    }

    /**
     * 重新汇总指定日期范围的数据
     * @param startDate 开始日期
     * @param endDate 结束日期
     */
    @Transactional
    public void aggregateDateRange(LocalDate startDate, LocalDate endDate) {
        log.info("开始汇总日期范围的成本统计数据: {} 到 {}", startDate, endDate);
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            aggregateCostForDate(current);
            current = current.plusDays(1);
        }
        log.info("日期范围成本统计汇总完成: {} 到 {}", startDate, endDate);
    }
}

