package com.heartsphere.billing.service;

import com.heartsphere.billing.entity.AIUsageRecord;
import com.heartsphere.billing.entity.UserTokenQuota;
import com.heartsphere.billing.repository.AIUsageRecordRepository;
import com.heartsphere.billing.repository.UserTokenQuotaRepository;
import com.heartsphere.entity.Membership;
import com.heartsphere.entity.SubscriptionPlan;
import com.heartsphere.repository.MembershipRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 用户使用统计服务
 * 提供用户实时的token、图片等使用数据统计，并与会员等级配额进行对比
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserUsageStatisticsService {

    private final UserTokenQuotaRepository quotaRepository;
    private final AIUsageRecordRepository usageRecordRepository;
    private final MembershipRepository membershipRepository;

    /**
     * 获取用户实时使用统计
     */
    @Transactional(readOnly = true)
    public UserUsageStatistics getUserStatistics(Long userId) {
        // 获取用户配额（只读，不创建）
        UserTokenQuota quota = quotaRepository.findByUserId(userId).orElse(null);
        if (quota == null) {
            log.warn("[UserUsageStatisticsService] getUserStatistics - 用户配额不存在, userId: {}, 返回空统计", userId);
            // 返回一个默认的空配额对象用于统计
            quota = new UserTokenQuota();
            quota.setUserId(userId);
        }

        // 获取用户会员信息
        Optional<Membership> membershipOpt = membershipRepository.findByUserId(userId);
        SubscriptionPlan plan = null;
        if (membershipOpt.isPresent() && membershipOpt.get().getStatus().equals("active")) {
            Membership membership = membershipOpt.get();
            plan = membership.getPlan();
        }

        // 计算本月统计
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime monthEnd = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // 从使用记录中统计本月实际使用量
        Map<String, Object> monthlyUsage = calculateMonthlyUsage(userId, monthStart, monthEnd);

        // 构建统计结果
        UserUsageStatistics stats = new UserUsageStatistics();
        stats.setUserId(userId);

        // 文本Token统计
        stats.setTextTokenStats(buildTokenStats(
                quota.getTextTokenTotal(),
                quota.getTextTokenUsed(),
                quota.getTextTokenMonthlyQuota(),
                quota.getTextTokenMonthlyUsed(),
                (Long) monthlyUsage.getOrDefault("textTokens", 0L),
                plan != null ? getPlanTextTokenQuota(plan) : null,
                plan != null ? plan.getPermanentTokenQuota() : null
        ));

        // 图片统计
        stats.setImageStats(buildImageStats(
                quota.getImageQuotaTotal(),
                quota.getImageQuotaUsed(),
                quota.getImageQuotaMonthly(),
                quota.getImageQuotaMonthlyUsed(),
                (Integer) monthlyUsage.getOrDefault("images", 0),
                plan != null ? (plan.getImageGenerationQuota() != null ? plan.getImageGenerationQuota() : plan.getMaxImagesPerMonth()) : null
        ));

        // 音频统计
        stats.setAudioStats(buildAudioStats(
                quota.getAudioQuotaTotal(),
                quota.getAudioQuotaUsed(),
                quota.getAudioQuotaMonthly(),
                quota.getAudioQuotaMonthlyUsed(),
                (Integer) monthlyUsage.getOrDefault("audioMinutes", 0),
                plan != null ? plan.getAudioProcessingQuota() : null
        ));

        // 视频统计
        stats.setVideoStats(buildVideoStats(
                quota.getVideoQuotaTotal(),
                quota.getVideoQuotaUsed(),
                quota.getVideoQuotaMonthly(),
                quota.getVideoQuotaMonthlyUsed(),
                (Integer) monthlyUsage.getOrDefault("videoSeconds", 0),
                plan != null ? plan.getVideoGenerationQuota() : null
        ));

        // 会员信息
        if (plan != null) {
            stats.setPlanName(plan.getName());
            stats.setPlanType(plan.getType());
        }

        stats.setLastResetDate(quota.getLastResetDate());
        stats.setCurrentMonth(currentMonth.toString());

        return stats;
    }

    /**
     * 计算本月实际使用量（从使用记录中统计）
     */
    private Map<String, Object> calculateMonthlyUsage(Long userId, LocalDateTime start, LocalDateTime end) {
        Map<String, Object> usage = new HashMap<>();
        
        // 查询本月使用记录
        java.util.List<AIUsageRecord> records = usageRecordRepository.findByUserIdAndDateRange(userId, start, end);
        
        long textTokens = 0;
        int images = 0;
        int audioMinutes = 0;
        int videoSeconds = 0;
        
        for (AIUsageRecord record : records) {
            if (record.getStatus().equals("success")) {
                // 文本Token（只统计文本生成类型）
                if ("text_generation".equals(record.getUsageType()) && record.getTotalTokens() != null) {
                    textTokens += record.getTotalTokens();
                }
                
                // 图片（只统计图片生成类型）
                if ("image_generation".equals(record.getUsageType())) {
                    images += record.getImageCount() != null ? record.getImageCount() : 1;
                }
                
                // 音频（分钟，统计TTS和STT）
                if (("audio_tts".equals(record.getUsageType()) || "audio_stt".equals(record.getUsageType())) 
                        && record.getAudioDuration() != null) {
                    audioMinutes += record.getAudioDuration() / 60; // 转换为分钟
                }
                
                // 视频（秒）
                if ("video_generation".equals(record.getUsageType()) && record.getVideoDuration() != null) {
                    videoSeconds += record.getVideoDuration();
                }
            }
        }
        
        usage.put("textTokens", textTokens);
        usage.put("images", images);
        usage.put("audioMinutes", audioMinutes);
        usage.put("videoSeconds", videoSeconds);
        
        return usage;
    }

    /**
     * 构建Token统计
     */
    private TokenStats buildTokenStats(Long total, Long used, Long monthlyQuota, Long monthlyUsed, 
                                      Long monthlyActualUsage, Long planQuota, Long permanentQuota) {
        TokenStats stats = new TokenStats();
        stats.setTotalQuota(total != null ? total : 0L);
        stats.setTotalUsed(used != null ? used : 0L);
        stats.setTotalAvailable(stats.getTotalQuota() - stats.getTotalUsed());
        stats.setMonthlyQuota(monthlyQuota != null ? monthlyQuota : 0L);
        stats.setMonthlyUsed(monthlyUsed != null ? monthlyUsed : 0L);
        stats.setMonthlyActualUsage(monthlyActualUsage);
        stats.setMonthlyAvailable(stats.getMonthlyQuota() - stats.getMonthlyUsed());
        stats.setPlanMonthlyQuota(planQuota);
        stats.setPermanentQuota(permanentQuota);
        
        // 计算使用率
        if (stats.getTotalQuota() > 0) {
            stats.setTotalUsageRate((double) stats.getTotalUsed() / stats.getTotalQuota() * 100);
        }
        if (stats.getMonthlyQuota() > 0) {
            stats.setMonthlyUsageRate((double) stats.getMonthlyUsed() / stats.getMonthlyQuota() * 100);
        }
        
        return stats;
    }

    /**
     * 构建图片统计
     */
    private ImageStats buildImageStats(Integer total, Integer used, Integer monthly, Integer monthlyUsed,
                                      Integer monthlyActualUsage, Integer planQuota) {
        ImageStats stats = new ImageStats();
        stats.setTotalQuota(total != null ? total : 0);
        stats.setTotalUsed(used != null ? used : 0);
        stats.setTotalAvailable(stats.getTotalQuota() - stats.getTotalUsed());
        stats.setMonthlyQuota(monthly != null ? monthly : 0);
        stats.setMonthlyUsed(monthlyUsed != null ? monthlyUsed : 0);
        stats.setMonthlyActualUsage(monthlyActualUsage);
        stats.setMonthlyAvailable(stats.getMonthlyQuota() - stats.getMonthlyUsed());
        stats.setPlanMonthlyQuota(planQuota);
        
        // 计算使用率
        if (stats.getTotalQuota() > 0) {
            stats.setTotalUsageRate((double) stats.getTotalUsed() / stats.getTotalQuota() * 100);
        }
        if (stats.getMonthlyQuota() > 0) {
            stats.setMonthlyUsageRate((double) stats.getMonthlyUsed() / stats.getMonthlyQuota() * 100);
        }
        
        return stats;
    }

    /**
     * 构建音频统计
     */
    private AudioStats buildAudioStats(Integer total, Integer used, Integer monthly, Integer monthlyUsed,
                                      Integer monthlyActualUsage, Integer planQuota) {
        AudioStats stats = new AudioStats();
        stats.setTotalQuota(total != null ? total : 0);
        stats.setTotalUsed(used != null ? used : 0);
        stats.setTotalAvailable(stats.getTotalQuota() - stats.getTotalUsed());
        stats.setMonthlyQuota(monthly != null ? monthly : 0);
        stats.setMonthlyUsed(monthlyUsed != null ? monthlyUsed : 0);
        stats.setMonthlyActualUsage(monthlyActualUsage);
        stats.setMonthlyAvailable(stats.getMonthlyQuota() - stats.getMonthlyUsed());
        stats.setPlanMonthlyQuota(planQuota);
        
        // 计算使用率
        if (stats.getTotalQuota() > 0) {
            stats.setTotalUsageRate((double) stats.getTotalUsed() / stats.getTotalQuota() * 100);
        }
        if (stats.getMonthlyQuota() > 0) {
            stats.setMonthlyUsageRate((double) stats.getMonthlyUsed() / stats.getMonthlyQuota() * 100);
        }
        
        return stats;
    }

    /**
     * 构建视频统计
     */
    private VideoStats buildVideoStats(Integer total, Integer used, Integer monthly, Integer monthlyUsed,
                                      Integer monthlyActualUsage, Integer planQuota) {
        VideoStats stats = new VideoStats();
        stats.setTotalQuota(total != null ? total : 0);
        stats.setTotalUsed(used != null ? used : 0);
        stats.setTotalAvailable(stats.getTotalQuota() - stats.getTotalUsed());
        stats.setMonthlyQuota(monthly != null ? monthly : 0);
        stats.setMonthlyUsed(monthlyUsed != null ? monthlyUsed : 0);
        stats.setMonthlyActualUsage(monthlyActualUsage);
        stats.setMonthlyAvailable(stats.getMonthlyQuota() - stats.getMonthlyUsed());
        stats.setPlanMonthlyQuota(planQuota);
        
        // 计算使用率
        if (stats.getTotalQuota() > 0) {
            stats.setTotalUsageRate((double) stats.getTotalUsed() / stats.getTotalQuota() * 100);
        }
        if (stats.getMonthlyQuota() > 0) {
            stats.setMonthlyUsageRate((double) stats.getMonthlyUsed() / stats.getMonthlyQuota() * 100);
        }
        
        return stats;
    }

    /**
     * 从订阅计划中获取文本Token配额
     */
    private Long getPlanTextTokenQuota(SubscriptionPlan plan) {
        return plan.getTextTokenQuota();
    }

    /**
     * 用户使用统计结果
     */
    @lombok.Data
    public static class UserUsageStatistics {
        private Long userId;
        private String planName;
        private String planType;
        private String currentMonth;
        private LocalDate lastResetDate;
        private TokenStats textTokenStats;
        private ImageStats imageStats;
        private AudioStats audioStats;
        private VideoStats videoStats;
    }

    /**
     * Token统计
     */
    @lombok.Data
    public static class TokenStats {
        private Long totalQuota;
        private Long totalUsed;
        private Long totalAvailable;
        private Long monthlyQuota;
        private Long monthlyUsed;
        private Long monthlyActualUsage; // 从使用记录中统计的实际使用量
        private Long monthlyAvailable;
        private Long planMonthlyQuota; // 会员计划中的月度配额
        private Long permanentQuota; // 永久Token配额
        private Double totalUsageRate; // 总配额使用率（百分比）
        private Double monthlyUsageRate; // 月度配额使用率（百分比）
    }

    /**
     * 图片统计
     */
    @lombok.Data
    public static class ImageStats {
        private Integer totalQuota;
        private Integer totalUsed;
        private Integer totalAvailable;
        private Integer monthlyQuota;
        private Integer monthlyUsed;
        private Integer monthlyActualUsage; // 从使用记录中统计的实际使用量
        private Integer monthlyAvailable;
        private Integer planMonthlyQuota; // 会员计划中的月度配额
        private Double totalUsageRate; // 总配额使用率（百分比）
        private Double monthlyUsageRate; // 月度配额使用率（百分比）
    }

    /**
     * 音频统计
     */
    @lombok.Data
    public static class AudioStats {
        private Integer totalQuota;
        private Integer totalUsed;
        private Integer totalAvailable;
        private Integer monthlyQuota;
        private Integer monthlyUsed;
        private Integer monthlyActualUsage; // 从使用记录中统计的实际使用量（分钟）
        private Integer monthlyAvailable;
        private Integer planMonthlyQuota; // 会员计划中的月度配额
        private Double totalUsageRate; // 总配额使用率（百分比）
        private Double monthlyUsageRate; // 月度配额使用率（百分比）
    }

    /**
     * 视频统计
     */
    @lombok.Data
    public static class VideoStats {
        private Integer totalQuota;
        private Integer totalUsed;
        private Integer totalAvailable;
        private Integer monthlyQuota;
        private Integer monthlyUsed;
        private Integer monthlyActualUsage; // 从使用记录中统计的实际使用量（秒）
        private Integer monthlyAvailable;
        private Integer planMonthlyQuota; // 会员计划中的月度配额
        private Double totalUsageRate; // 总配额使用率（百分比）
        private Double monthlyUsageRate; // 月度配额使用率（百分比）
    }
}

