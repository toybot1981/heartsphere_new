package com.heartsphere.billing.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.heartsphere.admin.entity.AIModelConfig;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * AI使用记录实体
 * 注意：model_id 现在关联到 ai_model_config.id（管理配置表）
 */
@Data
@Entity
@Table(name = "ai_usage_records")
public class AIUsageRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "model_id", nullable = false)
    private Long modelId; // 关联到 ai_model_config.id

    /**
     * 关联到 ai_model_config（管理配置表）
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", insertable = false, updatable = false, referencedColumnName = "id")
    @JsonIgnore
    private AIModelConfig modelConfig;

    @Column(name = "usage_type", nullable = false, length = 50)
    private String usageType; // text_generation, image_generation, audio_tts, audio_stt, video_generation

    @Column(name = "input_tokens")
    private Integer inputTokens = 0;

    @Column(name = "output_tokens")
    private Integer outputTokens = 0;

    @Column(name = "total_tokens")
    private Integer totalTokens = 0;

    @Column(name = "image_count")
    private Integer imageCount = 0;

    @Column(name = "audio_duration")
    private Integer audioDuration = 0;

    @Column(name = "video_duration")
    private Integer videoDuration = 0;

    @Column(name = "cost_amount", nullable = false, precision = 12, scale = 6)
    private BigDecimal costAmount;

    @Column(name = "token_consumed", nullable = false)
    private Long tokenConsumed;

    @Column(length = 20)
    private String status = "success"; // success, failed, timeout

    @Column(name = "request_id", length = 100)
    private String requestId;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;
}

