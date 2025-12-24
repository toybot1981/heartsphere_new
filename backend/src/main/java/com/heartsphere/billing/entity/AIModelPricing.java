package com.heartsphere.billing.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 模型资费配置实体
 */
@Data
@Entity
@Table(name = "ai_model_pricing")
public class AIModelPricing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_id", nullable = false)
    private Long modelId;

    @Column(name = "pricing_type", nullable = false, length = 50)
    private String pricingType; // input_token, output_token, image, audio_minute, video_second

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 6)
    private BigDecimal unitPrice;

    @Column(nullable = false, length = 50)
    private String unit; // per_1k_tokens, per_image, per_minute, per_second

    @Column(name = "min_charge_unit", precision = 12, scale = 6)
    private BigDecimal minChargeUnit = BigDecimal.ZERO;

    @Column(name = "effective_date", nullable = false)
    private LocalDateTime effectiveDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", insertable = false, updatable = false)
    @JsonIgnore
    private AIModel model;
}

