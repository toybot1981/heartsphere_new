package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 资源池充值记录实体
 */
@Data
@Entity
@Table(name = "resource_pool_recharge")
public class ResourcePoolRecharge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "recharge_amount", nullable = false, precision = 15, scale = 6)
    private BigDecimal rechargeAmount;

    @Column(name = "balance_before", nullable = false, precision = 15, scale = 6)
    private BigDecimal balanceBefore;

    @Column(name = "balance_after", nullable = false, precision = 15, scale = 6)
    private BigDecimal balanceAfter;

    @Column(name = "recharge_type", nullable = false, length = 50)
    private String rechargeType = "manual";

    @Column(name = "operator_id")
    private Long operatorId;

    @Column(length = 500)
    private String remark;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private AIProvider provider;
}

