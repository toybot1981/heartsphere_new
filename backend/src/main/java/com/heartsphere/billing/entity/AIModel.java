package com.heartsphere.billing.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * AI模型实体
 */
@Data
@Entity
@Table(name = "ai_models")
public class AIModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "model_code", nullable = false, length = 100)
    private String modelCode; // qwen-max, gpt-4

    @Column(name = "model_name", nullable = false, length = 200)
    private String modelName; // 通义千问-Max

    @Column(name = "model_type", nullable = false, length = 50)
    private String modelType; // text, image, audio, video

    @Column(nullable = false)
    private Boolean enabled = true;

    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    @JsonIgnore
    private AIProvider provider;
}

