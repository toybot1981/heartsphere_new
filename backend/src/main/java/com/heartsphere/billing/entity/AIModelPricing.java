package com.heartsphere.billing.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.heartsphere.admin.entity.AIModelConfig;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 模型资费配置实体
 * 注意：model_id 关联到 ai_model_config.id（管理配置表），而不是 ai_models.id（计费系统表）
 */
@Data
@Entity
@Table(name = "ai_model_pricing")
public class AIModelPricing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_id", nullable = false)
    private Long modelId; // 关联到 ai_model_config.id

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

    /**
     * 关联到 ai_model_config（管理配置表）
     * 用于定价配置，model_id 指向 ai_model_config.id
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", insertable = false, updatable = false, referencedColumnName = "id")
    @JsonIgnore
    private AIModelConfig modelConfig;
}

