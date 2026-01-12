package com.heartsphere.admin.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * AI路由策略配置实体
 * 用于管理系统统一接入模式下的路由策略
 * 
 * @author HeartSphere
 * @version 1.0
 */
@Entity
@Table(name = "ai_routing_strategy")
@Data
public class AIRoutingStrategy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "capability", nullable = false, length = 20)
    private String capability; // 能力类型：text, image, audio, video
    
    @Column(name = "strategy_type", nullable = false, length = 50)
    private String strategyType; // 策略类型：single, fallback, economy
    
    @Column(name = "config_json", columnDefinition = "TEXT")
    private String configJson; // 策略配置（JSON格式）
    
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


