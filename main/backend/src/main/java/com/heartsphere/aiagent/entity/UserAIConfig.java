package com.heartsphere.aiagent.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户AI配置实体
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "user_ai_config", 
       uniqueConstraints = @UniqueConstraint(columnNames = "user_id"))
@Data
public class UserAIConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;
    
    @Column(name = "text_provider", length = 50)
    private String textProvider;
    
    @Column(name = "text_model", length = 100)
    private String textModel;
    
    @Column(name = "image_provider", length = 50)
    private String imageProvider;
    
    @Column(name = "image_model", length = 100)
    private String imageModel;
    
    @Column(name = "audio_provider", length = 50)
    private String audioProvider;
    
    @Column(name = "audio_model", length = 100)
    private String audioModel;
    
    @Column(name = "video_provider", length = 50)
    private String videoProvider;
    
    @Column(name = "video_model", length = 100)
    private String videoModel;
    
    @Column(name = "default_temperature", columnDefinition = "DECIMAL(3,2)")
    private Double defaultTemperature;
    
    @Column(name = "default_max_tokens")
    private Integer defaultMaxTokens;
    
    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

