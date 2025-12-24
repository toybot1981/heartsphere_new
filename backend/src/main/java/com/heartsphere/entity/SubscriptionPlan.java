package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订阅计划实体
 */
@Data
@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String type; // free, basic, standard, premium

    @Column(name = "billing_cycle", nullable = false, length = 20)
    private String billingCycle; // monthly, yearly, continuous_monthly, continuous_yearly

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "original_price", precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @Column(name = "discount_percent")
    private Integer discountPercent;

    @Column(name = "points_per_month", nullable = false)
    private Integer pointsPerMonth = 0;

    @Column(name = "max_images_per_month")
    private Integer maxImagesPerMonth;

    @Column(name = "max_videos_per_month")
    private Integer maxVideosPerMonth;

    @Column(name = "max_text_generations_per_month")
    private Integer maxTextGenerationsPerMonth; // NULL表示无限制

    @Column(name = "max_audio_generations_per_month")
    private Integer maxAudioGenerationsPerMonth; // NULL表示无限制

    @Column(name = "allowed_ai_models", columnDefinition = "TEXT")
    private String allowedAiModels; // JSON格式，如：["qwen3-max", "gpt-4", "gemini-pro"]

    @Column(name = "max_image_resolution", length = 20)
    private String maxImageResolution; // 如：2k, 4k, 8k

    @Column(name = "max_video_duration")
    private Integer maxVideoDuration; // 秒，NULL表示无限制

    @Column(name = "allow_priority_queue", nullable = false)
    private Boolean allowPriorityQueue = false; // 是否允许优先队列（加速处理）

    @Column(name = "allow_watermark_removal", nullable = false)
    private Boolean allowWatermarkRemoval = false; // 是否允许去除水印

    @Column(name = "allow_batch_processing", nullable = false)
    private Boolean allowBatchProcessing = false; // 是否允许批量处理

    @Column(name = "allow_api_access", nullable = false)
    private Boolean allowApiAccess = false; // 是否允许API访问

    @Column(name = "max_api_calls_per_day")
    private Integer maxApiCallsPerDay; // NULL表示无限制

    @Column(name = "ai_benefits", columnDefinition = "TEXT")
    private String aiBenefits; // JSON格式，包含详细权限配置

    @Column(columnDefinition = "TEXT")
    private String features; // JSON格式

    // 配额字段（从计费系统扩展）
    @Column(name = "text_token_quota")
    private Long textTokenQuota; // 文本Token配额（每月）

    @Column(name = "image_generation_quota")
    private Integer imageGenerationQuota; // 图片生成配额（每月）

    @Column(name = "audio_processing_quota")
    private Integer audioProcessingQuota; // 语音处理配额（每月，分钟）

    @Column(name = "video_generation_quota")
    private Integer videoGenerationQuota; // 视频生成配额（每月，秒）

    @Column(name = "permanent_token_quota")
    private Long permanentTokenQuota; // 永久Token配额

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

