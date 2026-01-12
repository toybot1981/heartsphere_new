package com.heartsphere.heartconnect.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 暖心留言实体
 */
@Entity
@Table(name = "warm_message")
@Data
public class WarmMessage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "share_config_id", nullable = false)
    private Long shareConfigId;
    
    @Column(name = "visitor_id", nullable = false)
    private Long visitorId;
    
    @Column(name = "visitor_name", length = 100)
    private String visitorName;
    
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

