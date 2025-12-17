package com.heartsphere.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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

