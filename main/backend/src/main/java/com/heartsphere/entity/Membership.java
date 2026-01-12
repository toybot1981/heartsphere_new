package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户会员实体
 */
@Data
@Entity
@Table(name = "memberships")
public class Membership {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "plan_id", nullable = false)
    private Long planId;

    @Column(name = "plan_type", nullable = false, length = 50)
    private String planType; // free, basic, standard, premium

    @Column(name = "billing_cycle", nullable = false, length = 20)
    private String billingCycle; // monthly, yearly, continuous_monthly, continuous_yearly

    @Column(name = "status", nullable = false, length = 20)
    private String status = "active"; // active, expired, cancelled, suspended

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    @Column(name = "next_renewal_date")
    private LocalDateTime nextRenewalDate;

    @Column(name = "renewal_price", precision = 10, scale = 2)
    private java.math.BigDecimal renewalPrice;

    @Column(name = "current_points", nullable = false)
    private Integer currentPoints = 0;

    @Column(name = "total_points_earned", nullable = false)
    private Integer totalPointsEarned = 0;

    @Column(name = "total_points_used", nullable = false)
    private Integer totalPointsUsed = 0;

    // 配额使用记录
    @Column(name = "text_token_used", nullable = false)
    private Long textTokenUsed = 0L; // 已使用文本Token

    @Column(name = "image_generation_used", nullable = false)
    private Integer imageGenerationUsed = 0; // 已使用图片生成次数

    @Column(name = "video_generation_used", nullable = false)
    private Integer videoGenerationUsed = 0; // 已使用视频生成时长（秒）

    @Column(name = "api_calls_used_today", nullable = false)
    private Integer apiCallsUsedToday = 0; // 今日API调用次数

    @Column(name = "api_calls_reset_date")
    private LocalDate apiCallsResetDate; // API调用重置日期

    // 配额重置日期
    @Column(name = "quota_reset_date")
    private LocalDate quotaResetDate; // 配额重置日期

    @Column(name = "last_quota_reset_date")
    private LocalDate lastQuotaResetDate; // 上次配额重置日期

    // 升级信息
    @Column(name = "upgrade_discount", precision = 5, scale = 2)
    private java.math.BigDecimal upgradeDiscount; // 升级折扣（百分比）

    @Column(name = "upgrade_from_plan_id")
    private Long upgradeFromPlanId; // 升级前计划ID

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", insertable = false, updatable = false)
    private SubscriptionPlan plan;
}

