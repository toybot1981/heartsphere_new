package com.heartsphere.service;

import com.heartsphere.billing.dto.CostAnalysis;
import com.heartsphere.billing.dto.UsageStats;
import com.heartsphere.billing.entity.OverageCharge;
import com.heartsphere.billing.entity.QuotaUsageRecord;
import com.heartsphere.billing.enums.QuotaType;
import com.heartsphere.billing.repository.OverageChargeRepository;
import com.heartsphere.billing.repository.QuotaUsageRecordRepository;
import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 使用统计服务
 * 基于会员体系的使用统计：实时统计、历史统计、成本分析
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UsageStatisticsService {

    private final QuotaUsageRecordRepository usageRecordRepository;
    private final OverageChargeRepository overageChargeRepository;
    private final MembershipService membershipService;
    private final SubscriptionPlanRepository planRepository;
    private final QuotaManagementService quotaManagementService;

    /**
     * 获取当前周期使用统计
     */
    @Transactional(readOnly = true)
    public UsageStats getCurrentPeriodStats(Long userId) {
        log.debug("获取当前周期使用统计: userId={}", userId);
        
        // 获取会员信息
        Membership membership = membershipService.getUserMembership(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
        
        SubscriptionPlan plan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
        
        // 获取当前周期（本月）
        YearMonth currentMonth = YearMonth.now();
        LocalDate periodStart = currentMonth.atDay(1);
        LocalDate periodEnd = currentMonth.atEndOfMonth();
        
        return buildUsageStats(userId, membership, plan, periodStart, periodEnd);
    }

    /**
     * 获取配额使用率
     */
    @Transactional(readOnly = true)
    public UsageStats.QuotaUsageStats getQuotaUsageRate(Long userId, QuotaType quotaType) {
        log.debug("获取配额使用率: userId={}, quotaType={}", userId, quotaType);
        
        // 获取配额信息
        com.heartsphere.billing.dto.QuotaInfo quotaInfo = quotaManagementService.getQuotaInfo(userId);
        
        UsageStats.QuotaUsageStats stats = new UsageStats.QuotaUsageStats();
        
        switch (quotaType) {
            case TEXT_TOKEN:
                stats.setQuotaTotal(quotaInfo.getTextTokenQuota());
                stats.setUsed(quotaInfo.getTextTokenUsed());
                stats.setAvailable(quotaInfo.getTextTokenAvailable());
                break;
            case IMAGE:
                stats.setQuotaTotal(quotaInfo.getImageQuota().longValue());
                stats.setUsed(quotaInfo.getImageUsed().longValue());
                stats.setAvailable(quotaInfo.getImageAvailable().longValue());
                break;
            case VIDEO:
                stats.setQuotaTotal(quotaInfo.getVideoQuota().longValue());
                stats.setUsed(quotaInfo.getVideoUsed().longValue());
                stats.setAvailable(quotaInfo.getVideoAvailable().longValue());
                break;
            case API_CALL:
                stats.setQuotaTotal(quotaInfo.getApiCallQuotaPerDay().longValue());
                stats.setUsed(quotaInfo.getApiCallUsedToday().longValue());
                stats.setAvailable(quotaInfo.getApiCallAvailableToday().longValue());
                break;
        }
        
        // 计算使用率
        if (stats.getQuotaTotal() != null && stats.getQuotaTotal() > 0) {
            double usageRate = (stats.getUsed().doubleValue() / stats.getQuotaTotal().doubleValue()) * 100;
            stats.setUsageRate(Math.min(100.0, Math.max(0.0, usageRate)));
        } else {
            stats.setUsageRate(0.0);
        }
        
        return stats;
    }

    /**
     * 获取每日使用统计
     */
    @Transactional(readOnly = true)
    public List<UsageStats.DailyUsage> getDailyUsage(Long userId, LocalDate startDate, LocalDate endDate) {
        log.debug("获取每日使用统计: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // 查询使用记录
        List<QuotaUsageRecord> records = usageRecordRepository.findByUserIdAndDateRange(userId, start, end);
        
        // 按日期分组统计
        Map<LocalDate, UsageStats.DailyUsage> dailyMap = new HashMap<>();
        
        for (QuotaUsageRecord record : records) {
            LocalDate date = record.getCreatedAt().toLocalDate();
            UsageStats.DailyUsage daily = dailyMap.computeIfAbsent(date, d -> 
                    UsageStats.DailyUsage.builder()
                            .date(d)
                            .textTokenUsed(0L)
                            .imageUsed(0L)
                            .videoUsed(0L)
                            .apiCallUsed(0L)
                            .build()
            );
            
            switch (record.getQuotaType()) {
                case "text_token":
                    daily.setTextTokenUsed(daily.getTextTokenUsed() + record.getAmountUsed());
                    break;
                case "image":
                    daily.setImageUsed(daily.getImageUsed() + record.getAmountUsed());
                    break;
                case "video":
                    daily.setVideoUsed(daily.getVideoUsed() + record.getAmountUsed());
                    break;
                case "api_call":
                    daily.setApiCallUsed(daily.getApiCallUsed() + record.getAmountUsed());
                    break;
            }
        }
        
        // 填充缺失的日期（使用量为0）
        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dailyMap.putIfAbsent(current, UsageStats.DailyUsage.builder()
                    .date(current)
                    .textTokenUsed(0L)
                    .imageUsed(0L)
                    .videoUsed(0L)
                    .apiCallUsed(0L)
                    .build());
            current = current.plusDays(1);
        }
        
        // 按日期排序
        return dailyMap.values().stream()
                .sorted((a, b) -> a.getDate().compareTo(b.getDate()))
                .collect(Collectors.toList());
    }

    /**
     * 获取月度使用统计
     */
    @Transactional(readOnly = true)
    public List<UsageStats> getMonthlyUsage(Long userId, int months) {
        log.debug("获取月度使用统计: userId={}, months={}", userId, months);
        
        List<UsageStats> monthlyStats = new ArrayList<>();
        
        // 获取会员信息
        Membership membership = membershipService.getUserMembership(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
        
        SubscriptionPlan plan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
        
        // 获取最近N个月的数据
        YearMonth currentMonth = YearMonth.now();
        for (int i = 0; i < months; i++) {
            YearMonth month = currentMonth.minusMonths(i);
            LocalDate periodStart = month.atDay(1);
            LocalDate periodEnd = month.atEndOfMonth();
            
            UsageStats stats = buildUsageStats(userId, membership, plan, periodStart, periodEnd);
            monthlyStats.add(stats);
        }
        
        return monthlyStats;
    }

    /**
     * 计算使用成本
     */
    @Transactional(readOnly = true)
    public BigDecimal calculateUsageCost(Long userId, LocalDate startDate, LocalDate endDate) {
        log.debug("计算使用成本: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // 统计超量付费
        BigDecimal overageCost = overageChargeRepository.sumTotalAmountByUserIdAndDateRange(userId, start, end);
        if (overageCost == null) {
            overageCost = BigDecimal.ZERO;
        }
        
        // 订阅费用（需要根据实际订阅情况计算）
        // 这里简化处理，只返回超量费用
        // 实际应该根据会员订阅情况计算订阅费用
        
        return overageCost.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * 获取成本分析
     */
    @Transactional(readOnly = true)
    public CostAnalysis getCostAnalysis(Long userId, LocalDate startDate, LocalDate endDate) {
        log.debug("获取成本分析: userId={}, startDate={}, endDate={}", userId, startDate, endDate);
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(23, 59, 59);
        
        // 获取会员信息
        Membership membership = membershipService.getUserMembership(userId)
                .orElseGet(() -> membershipService.getOrCreateFreeMembership(userId));
        
        SubscriptionPlan plan = planRepository.findById(membership.getPlanId())
                .orElseThrow(() -> new RuntimeException("订阅计划不存在: " + membership.getPlanId()));
        
        // 计算订阅费用（简化：使用计划价格）
        BigDecimal subscriptionCost = plan.getPrice();
        
        // 统计超量付费
        BigDecimal overageCost = overageChargeRepository.sumTotalAmountByUserIdAndDateRange(userId, start, end);
        if (overageCost == null) {
            overageCost = BigDecimal.ZERO;
        }
        
        // 总成本
        BigDecimal totalCost = subscriptionCost.add(overageCost);
        
        // 计算天数
        long days = java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
        BigDecimal averageDailyCost = days > 0 ? 
                totalCost.divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        
        // 构建成本分解
        List<CostAnalysis.QuotaCostBreakdown> costBreakdown = buildCostBreakdown(userId, plan, start, end);
        
        return CostAnalysis.builder()
                .userId(userId)
                .periodStart(startDate)
                .periodEnd(endDate)
                .subscriptionCost(subscriptionCost)
                .overageCost(overageCost)
                .totalCost(totalCost)
                .averageDailyCost(averageDailyCost)
                .costBreakdown(costBreakdown)
                .build();
    }

    /**
     * 构建使用统计
     */
    private UsageStats buildUsageStats(Long userId, Membership membership, SubscriptionPlan plan, 
                                       LocalDate periodStart, LocalDate periodEnd) {
        LocalDateTime start = periodStart.atStartOfDay();
        LocalDateTime end = periodEnd.atTime(23, 59, 59);
        
        // 查询使用记录
        List<QuotaUsageRecord> records = usageRecordRepository.findByUserIdAndDateRange(userId, start, end);
        
        // 统计各类配额使用量
        long textTokenUsed = records.stream()
                .filter(r -> "text_token".equals(r.getQuotaType()))
                .mapToLong(QuotaUsageRecord::getAmountUsed)
                .sum();
        
        long imageUsed = records.stream()
                .filter(r -> "image".equals(r.getQuotaType()))
                .mapToLong(QuotaUsageRecord::getAmountUsed)
                .sum();
        
        long videoUsed = records.stream()
                .filter(r -> "video".equals(r.getQuotaType()))
                .mapToLong(QuotaUsageRecord::getAmountUsed)
                .sum();
        
        long apiCallUsed = records.stream()
                .filter(r -> "api_call".equals(r.getQuotaType()))
                .mapToLong(QuotaUsageRecord::getAmountUsed)
                .sum();
        
        // 获取配额信息
        com.heartsphere.billing.dto.QuotaInfo quotaInfo = quotaManagementService.getQuotaInfo(userId);
        
        // 构建统计结果
        UsageStats.QuotaUsageStats textTokenStats = buildQuotaUsageStats(
                quotaInfo.getTextTokenQuota(),
                textTokenUsed
        );
        
        UsageStats.QuotaUsageStats imageStats = buildQuotaUsageStats(
                quotaInfo.getImageQuota().longValue(),
                imageUsed
        );
        
        UsageStats.QuotaUsageStats videoStats = buildQuotaUsageStats(
                quotaInfo.getVideoQuota().longValue(),
                videoUsed
        );
        
        UsageStats.QuotaUsageStats apiCallStats = buildQuotaUsageStats(
                quotaInfo.getApiCallQuotaPerDay().longValue(),
                apiCallUsed
        );
        
        // 获取每日使用统计
        List<UsageStats.DailyUsage> dailyUsageList = getDailyUsage(userId, periodStart, periodEnd);
        
        return UsageStats.builder()
                .userId(userId)
                .membershipId(membership.getId())
                .planType(plan.getType())
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .textTokenStats(textTokenStats)
                .imageStats(imageStats)
                .videoStats(videoStats)
                .apiCallStats(apiCallStats)
                .dailyUsageList(dailyUsageList)
                .build();
    }

    /**
     * 构建配额使用统计
     */
    private UsageStats.QuotaUsageStats buildQuotaUsageStats(Long quotaTotal, Long used) {
        Long available = quotaTotal - used;
        double usageRate = quotaTotal > 0 ? (used.doubleValue() / quotaTotal.doubleValue()) * 100 : 0.0;
        
        return UsageStats.QuotaUsageStats.builder()
                .quotaTotal(quotaTotal)
                .used(used)
                .available(Math.max(0, available))
                .usageRate(Math.min(100.0, Math.max(0.0, usageRate)))
                .build();
    }

    /**
     * 构建成本分解
     */
    private List<CostAnalysis.QuotaCostBreakdown> buildCostBreakdown(Long userId, SubscriptionPlan plan, 
                                                                      LocalDateTime start, LocalDateTime end) {
        List<CostAnalysis.QuotaCostBreakdown> breakdown = new ArrayList<>();
        
        // 查询超量付费记录
        List<OverageCharge> overageCharges = overageChargeRepository.findByUserIdAndDateRange(userId, start, end);
        
        // 按配额类型分组
        Map<String, List<OverageCharge>> chargesByType = overageCharges.stream()
                .filter(c -> "paid".equals(c.getStatus()))
                .collect(Collectors.groupingBy(OverageCharge::getQuotaType));
        
        // 文本Token
        if (chargesByType.containsKey("text_token")) {
            List<OverageCharge> charges = chargesByType.get("text_token");
            long usage = charges.stream().mapToLong(OverageCharge::getAmountUsed).sum();
            BigDecimal cost = charges.stream()
                    .map(OverageCharge::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal unitPrice = plan.getOverageTokenPrice() != null ? 
                    plan.getOverageTokenPrice() : new BigDecimal("0.02");
            
            breakdown.add(CostAnalysis.QuotaCostBreakdown.builder()
                    .quotaType("text_token")
                    .usage(usage)
                    .overageUsage(usage)
                    .overageCost(cost)
                    .unitPrice(unitPrice)
                    .build());
        }
        
        // 图片
        if (chargesByType.containsKey("image")) {
            List<OverageCharge> charges = chargesByType.get("image");
            long usage = charges.stream().mapToLong(OverageCharge::getAmountUsed).sum();
            BigDecimal cost = charges.stream()
                    .map(OverageCharge::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal unitPrice = plan.getOverageImagePrice() != null ? 
                    plan.getOverageImagePrice() : new BigDecimal("2.00");
            
            breakdown.add(CostAnalysis.QuotaCostBreakdown.builder()
                    .quotaType("image")
                    .usage(usage)
                    .overageUsage(usage)
                    .overageCost(cost)
                    .unitPrice(unitPrice)
                    .build());
        }
        
        // 视频
        if (chargesByType.containsKey("video")) {
            List<OverageCharge> charges = chargesByType.get("video");
            long usage = charges.stream().mapToLong(OverageCharge::getAmountUsed).sum();
            BigDecimal cost = charges.stream()
                    .map(OverageCharge::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal unitPrice = plan.getOverageVideoPrice() != null ? 
                    plan.getOverageVideoPrice() : new BigDecimal("0.50");
            
            breakdown.add(CostAnalysis.QuotaCostBreakdown.builder()
                    .quotaType("video")
                    .usage(usage)
                    .overageUsage(usage)
                    .overageCost(cost)
                    .unitPrice(unitPrice)
                    .build());
        }
        
        return breakdown;
    }
}
