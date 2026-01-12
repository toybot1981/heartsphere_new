package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 提供商资源池实体
 */
@Data
@Entity
@Table(name = "provider_resource_pool")
public class ProviderResourcePool {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false, unique = true)
    private Long providerId;

    @Column(name = "total_balance", nullable = false, precision = 15, scale = 6)
    private BigDecimal totalBalance = BigDecimal.ZERO;

    @Column(name = "used_amount", nullable = false, precision = 15, scale = 6)
    private BigDecimal usedAmount = BigDecimal.ZERO;

    @Column(name = "available_balance", nullable = false, precision = 15, scale = 6)
    private BigDecimal availableBalance = BigDecimal.ZERO;

    @Column(name = "warning_threshold", nullable = false, precision = 5, scale = 2)
    private BigDecimal warningThreshold = new BigDecimal("10.0");

    @Column(name = "is_low_balance", nullable = false)
    private Boolean isLowBalance = false;

    @Column(name = "last_recharge_date")
    private LocalDateTime lastRechargeDate;

    @Column(name = "last_check_date")
    private LocalDateTime lastCheckDate;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AIProvider provider;
}

