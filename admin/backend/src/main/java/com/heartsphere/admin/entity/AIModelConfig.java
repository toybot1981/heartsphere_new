package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * AI模型配置实体
 * 用于管理系统统一接入模式下的AI模型配置
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "ai_model_config")
@Data
public class AIModelConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "provider", nullable = false, length = 50)
    private String provider; // 提供商：gemini, openai, qwen, doubao
    
    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName; // 模型名称
    
    @Column(name = "capability", nullable = false, length = 20)
    private String capability; // 能力类型：text, image, audio, video
    
    @Column(name = "api_key", columnDefinition = "TEXT")
    private String apiKey; // API密钥（加密存储）
    
    @Column(name = "base_url", length = 500)
    private String baseUrl; // API基础URL
    
    @Column(name = "model_params", columnDefinition = "TEXT")
    private String modelParams; // 模型参数（JSON格式）
    
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false; // 是否为默认模型
    
    @Column(name = "priority", nullable = false)
    private Integer priority = 0; // 优先级（用于容错模式排序）
    
    @Column(name = "cost_per_token", columnDefinition = "DECIMAL(10,8)")
    private Double costPerToken; // 每token成本（用于经济模式）
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true; // 是否启用
    
    @Column(name = "description", length = 500)
    private String description; // 描述
    
    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}


