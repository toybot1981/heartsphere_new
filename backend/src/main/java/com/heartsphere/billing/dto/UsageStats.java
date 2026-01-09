package com.heartsphere.billing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * 使用统计DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageStats {
    /**
     * 用户ID
     */
    private Long userId;
    
    /**
     * 会员ID
     */
    private Long membershipId;
    
    /**
     * 计划类型
     */
    private String planType;
    
    /**
     * 统计周期开始日期
     */
    private LocalDate periodStart;
    
    /**
     * 统计周期结束日期
     */
    private LocalDate periodEnd;
    
    /**
     * 文本Token使用统计
     */
    private QuotaUsageStats textTokenStats;
    
    /**
     * 图片使用统计
     */
    private QuotaUsageStats imageStats;
    
    /**
     * 视频使用统计
     */
    private QuotaUsageStats videoStats;
    
    /**
     * API调用使用统计
     */
    private QuotaUsageStats apiCallStats;
    
    /**
     * 每日使用统计列表
     */
    private List<DailyUsage> dailyUsageList;
    
    /**
     * 配额使用率DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotaUsageStats {
        /**
         * 配额总量
         */
        private Long quotaTotal;
        
        /**
         * 已使用量
         */
        private Long used;
        
        /**
         * 可用量
         */
        private Long available;
        
        /**
         * 使用率（百分比，0-100）
         */
        private Double usageRate;
    }
    
    /**
     * 每日使用统计
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyUsage {
        /**
         * 日期
         */
        private LocalDate date;
        
        /**
         * 文本Token使用量
         */
        private Long textTokenUsed;
        
        /**
         * 图片使用量
         */
        private Long imageUsed;
        
        /**
         * 视频使用量（秒）
         */
        private Long videoUsed;
        
        /**
         * API调用次数
         */
        private Long apiCallUsed;
    }
}
