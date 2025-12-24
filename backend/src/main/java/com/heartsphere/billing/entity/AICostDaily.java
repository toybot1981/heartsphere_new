package com.heartsphere.billing.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 成本统计表（每日汇总）实体
 */
@Data
@Entity
@Table(name = "ai_cost_daily")
public class AICostDaily {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "stat_date", nullable = false)
    private LocalDate statDate;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "usage_type", nullable = false, length = 50)
    private String usageType;

    @Column(name = "total_usage", nullable = false)
    private Long totalUsage;

    @Column(name = "total_cost", nullable = false, precision = 12, scale = 6)
    private BigDecimal totalCost;

    @Column(name = "call_count", nullable = false)
    private Integer callCount;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
}

