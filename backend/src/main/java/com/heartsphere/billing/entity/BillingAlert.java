package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 资费提醒记录实体
 */
@Data
@Entity
@Table(name = "billing_alert")
public class BillingAlert {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "alert_type", nullable = false, length = 50)
    private String alertType; // low_balance, insufficient_balance

    @Column(name = "alert_level", nullable = false, length = 20)
    private String alertLevel = "warning"; // warning, critical

    @Column(name = "balance_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal balancePercentage;

    @Column(name = "available_balance", nullable = false, precision = 15, scale = 6)
    private BigDecimal availableBalance;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private Long resolvedBy;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AIProvider provider;
}

