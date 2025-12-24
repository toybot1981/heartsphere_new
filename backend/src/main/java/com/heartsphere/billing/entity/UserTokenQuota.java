package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户Token配额实体
 */
@Data
@Entity
@Table(name = "user_token_quota")
public class UserTokenQuota {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    // 文本Token配额
    @Column(name = "text_token_total")
    private Long textTokenTotal = 0L;

    @Column(name = "text_token_used")
    private Long textTokenUsed = 0L;

    @Column(name = "text_token_monthly_quota")
    private Long textTokenMonthlyQuota = 0L;

    @Column(name = "text_token_monthly_used")
    private Long textTokenMonthlyUsed = 0L;

    // 图片生成配额
    @Column(name = "image_quota_total")
    private Integer imageQuotaTotal = 0;

    @Column(name = "image_quota_used")
    private Integer imageQuotaUsed = 0;

    @Column(name = "image_quota_monthly")
    private Integer imageQuotaMonthly = 0;

    @Column(name = "image_quota_monthly_used")
    private Integer imageQuotaMonthlyUsed = 0;

    // 语音处理配额
    @Column(name = "audio_quota_total")
    private Integer audioQuotaTotal = 0;

    @Column(name = "audio_quota_used")
    private Integer audioQuotaUsed = 0;

    @Column(name = "audio_quota_monthly")
    private Integer audioQuotaMonthly = 0;

    @Column(name = "audio_quota_monthly_used")
    private Integer audioQuotaMonthlyUsed = 0;

    // 视频生成配额
    @Column(name = "video_quota_total")
    private Integer videoQuotaTotal = 0;

    @Column(name = "video_quota_used")
    private Integer videoQuotaUsed = 0;

    @Column(name = "video_quota_monthly")
    private Integer videoQuotaMonthly = 0;

    @Column(name = "video_quota_monthly_used")
    private Integer videoQuotaMonthlyUsed = 0;

    @Column(name = "last_reset_date")
    private LocalDate lastResetDate;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}

