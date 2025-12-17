package com.heartsphere.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订阅计划DTO（管理后台）
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionPlanDTO {
    private Long id;
    private String name;
    private String type; // free, basic, standard, premium
    private String billingCycle; // monthly, yearly, continuous_monthly, continuous_yearly
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer discountPercent;
    private Integer pointsPerMonth;
    private Integer maxImagesPerMonth;
    private Integer maxVideosPerMonth;
    private Integer maxTextGenerationsPerMonth;
    private Integer maxAudioGenerationsPerMonth;
    private String allowedAiModels; // JSON格式
    private String maxImageResolution; // 2k, 4k, 8k
    private Integer maxVideoDuration; // 秒
    private Boolean allowPriorityQueue;
    private Boolean allowWatermarkRemoval;
    private Boolean allowBatchProcessing;
    private Boolean allowApiAccess;
    private Integer maxApiCallsPerDay;
    private String aiBenefits; // JSON格式
    private String features; // JSON格式
    private Boolean isActive;
    private Integer sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

